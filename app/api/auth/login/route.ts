import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ensureDatabase } from "../../../../db/bootstrap";
import { AUTH_COOKIE, createSession } from "../../../lib/auth";
import { verifyPassword } from "../../../lib/password";
import { verifyTotp } from "../../../lib/totp";
import { unseal } from "../../../lib/secret-box";
import { writeAudit } from "../../../lib/admin-settings";
import { normalizeLoginCredentials } from "../../../lib/login-normalization";

const MAX_LOGIN_FAILURES = 5;
const LOGIN_WINDOW_MINUTES = 15;

async function loginAttemptKey(request: Request, username: string) {
  const clientAddress =
    request.headers.get("CF-Connecting-IP")?.trim() || "unknown";
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(`${username.toLocaleLowerCase()}|${clientAddress}`),
  );
  return Buffer.from(new Uint8Array(digest)).toString("base64url");
}

async function isLoginBlocked(db: D1Database, attemptKey: string) {
  await db
    .prepare(
      `DELETE FROM login_attempts
       WHERE attempt_key = ?
         AND last_attempt_at <= datetime('now', '-' || ? || ' minutes')`,
    )
    .bind(attemptKey, LOGIN_WINDOW_MINUTES)
    .run();
  const attempt = await db
    .prepare(
      `SELECT blocked_until > CURRENT_TIMESTAMP AS is_blocked
       FROM login_attempts WHERE attempt_key = ?`,
    )
    .bind(attemptKey)
    .first<{ is_blocked: number }>();
  return Boolean(attempt?.is_blocked);
}

async function recordLoginFailure(db: D1Database, attemptKey: string) {
  await db
    .prepare(
      `INSERT INTO login_attempts
       (attempt_key, attempts, first_attempt_at, last_attempt_at, blocked_until)
       VALUES (?, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL)
       ON CONFLICT(attempt_key) DO UPDATE SET
         attempts = login_attempts.attempts + 1,
         last_attempt_at = CURRENT_TIMESTAMP,
         blocked_until = CASE
           WHEN login_attempts.attempts + 1 >= ?
             THEN datetime('now', '+' || ? || ' minutes')
           ELSE login_attempts.blocked_until
         END`,
    )
    .bind(attemptKey, MAX_LOGIN_FAILURES, LOGIN_WINDOW_MINUTES)
    .run();
}

export async function POST(request: Request) {
  let loginStage = "parse_request";
  try {
    const payload = (await request.json()) as Record<string, unknown>;
    const { username, password } = normalizeLoginCredentials(
      payload.username,
      payload.password,
    );
    const otp = String(payload.otp ?? "").trim();

    if (!username || !password) {
      return NextResponse.json(
        { error: "ইউজারনেম এবং পাসওয়ার্ড প্রদান করুন" },
        { status: 400 }
      );
    }

    loginStage = "ensure_database";
    const db = await ensureDatabase();
    const attemptKey = await loginAttemptKey(request, username);
    loginStage = "check_login_limit";
    if (await isLoginBlocked(db, attemptKey)) {
      return NextResponse.json(
        { error: "অনেকবার ভুল লগইন চেষ্টা হয়েছে। ১৫ মিনিট পরে আবার চেষ্টা করুন।" },
        { status: 429, headers: { "Retry-After": "900" } },
      );
    }
    const cookieStore = await cookies();
    
    loginStage = "load_user";
    const user = await db
      .prepare("SELECT id, username, password, role, name, area_code, two_factor_secret, two_factor_enabled FROM users WHERE username = ? AND is_active = 1")
      .bind(username)
      .first<{ id: number; username:string; password: string; role: string; name: string; area_code?: string; two_factor_secret?:string; two_factor_enabled?:number }>();

    if (user) {
      loginStage = "verify_password";
      const passwordCheck = await verifyPassword(String(password), user.password);
      if (!passwordCheck.ok) {
        await recordLoginFailure(db, attemptKey);
        await writeAudit(username, "auth.login_failed", "user", username, null, { reason: "invalid_credentials" });
        return NextResponse.json(
          { error: "ভুল ইউজারনেম অথবা পাসওয়ার্ড" },
          { status: 401 }
        );
      }
      if (
        user.role === "area_manager" &&
        password.toLocaleLowerCase() === user.username.toLocaleLowerCase()
      ) {
        await recordLoginFailure(db, attemptKey);
        await writeAudit(username, "auth.login_failed", "user", username, null, { reason: "password_reset_required" });
        return NextResponse.json(
          { error: "নিরাপত্তার জন্য পাসওয়ার্ড পরিবর্তন আবশ্যক। সিস্টেম অ্যাডমিনের সঙ্গে যোগাযোগ করুন।" },
          { status: 403 },
        );
      }
      if (passwordCheck.needsRehash && passwordCheck.passwordHash) {
        loginStage = "rehash_password";
        await db
          .prepare("UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
          .bind(passwordCheck.passwordHash, user.id)
          .run();
      }
      if (user.two_factor_enabled) {
        loginStage = "verify_two_factor";
        if (!otp) return NextResponse.json({ error: "Authenticator code দিন।", twoFactorRequired: true }, { status: 401 });
        const valid = user.two_factor_secret && await verifyTotp(await unseal(user.two_factor_secret), otp);
        if (!valid) return NextResponse.json({ error: "ভুল authenticator code।", twoFactorRequired: true }, { status: 401 });
      }
      loginStage = "create_session";
      const session = await createSession(user.id);
      await db.prepare("DELETE FROM login_attempts WHERE attempt_key = ?").bind(attemptKey).run();
      
      loginStage = "set_cookie";
      cookieStore.set(AUTH_COOKIE, session.token, {
        httpOnly: true,
        secure: new URL(request.url).protocol === "https:",
        sameSite: "lax",
        path: "/",
        maxAge: session.maxAge,
      });
      loginStage = "write_audit";
      await writeAudit(user.username, "auth.login", "session", String(user.id), null, { role: user.role });

      return NextResponse.json({ success: true, role: user.role, areaCode: user.area_code });
    }

    await recordLoginFailure(db, attemptKey);
    await writeAudit(username || "anonymous", "auth.login_failed", "user", username || "unknown", null, { reason: "invalid_credentials" });
    return NextResponse.json(
      { error: "ভুল ইউজারনেম অথবা পাসওয়ার্ড" },
      { status: 401 }
    );
  } catch (error) {
    console.error("Login request failed unexpectedly", {
      stage: loginStage,
      message: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: "সার্ভার এরর" },
      { status: 500 }
    );
  }
}
