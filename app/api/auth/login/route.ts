import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ensureDatabase } from "../../../../db/bootstrap";
import { AUTH_COOKIE, createSession } from "../../../lib/auth";
import { verifyPassword } from "../../../lib/password";
import { verifyTotp } from "../../../lib/totp";
import { unseal } from "../../../lib/secret-box";
import { writeAudit } from "../../../lib/admin-settings";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as Record<string, unknown>;
    const username = String(payload.username ?? "").trim();
    const password = String(payload.password ?? "");
    const otp = String(payload.otp ?? "").trim();

    if (!username || !password) {
      return NextResponse.json(
        { error: "ইউজারনেম এবং পাসওয়ার্ড প্রদান করুন" },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const db = await ensureDatabase();
    
    const user = await db
      .prepare("SELECT id, username, password, role, name, area_code, two_factor_secret, two_factor_enabled FROM users WHERE username = ? AND is_active = 1")
      .bind(username)
      .first<{ id: number; username:string; password: string; role: string; name: string; area_code?: string; two_factor_secret?:string; two_factor_enabled?:number }>();

    if (user) {
      const passwordCheck = await verifyPassword(String(password), user.password);
      if (!passwordCheck.ok) {
        await writeAudit(username, "auth.login_failed", "user", username, null, { reason: "invalid_credentials" });
        return NextResponse.json(
          { error: "ভুল ইউজারনেম অথবা পাসওয়ার্ড" },
          { status: 401 }
        );
      }
      if (passwordCheck.needsRehash && passwordCheck.passwordHash) {
        await db
          .prepare("UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
          .bind(passwordCheck.passwordHash, user.id)
          .run();
      }
      if (user.two_factor_enabled) {
        if (!otp) return NextResponse.json({ error: "Authenticator code দিন।", twoFactorRequired: true }, { status: 401 });
        const valid = user.two_factor_secret && await verifyTotp(await unseal(user.two_factor_secret), otp);
        if (!valid) return NextResponse.json({ error: "ভুল authenticator code।", twoFactorRequired: true }, { status: 401 });
      }
      const session = await createSession(user.id);
      
      cookieStore.set(AUTH_COOKIE, session.token, {
        httpOnly: true,
        secure: new URL(request.url).protocol === "https:",
        sameSite: "lax",
        path: "/",
        maxAge: session.maxAge,
      });
      await writeAudit(user.username, "auth.login", "session", String(user.id), null, { role: user.role });

      return NextResponse.json({ success: true, role: user.role, areaCode: user.area_code });
    }

    await writeAudit(username || "anonymous", "auth.login_failed", "user", username || "unknown", null, { reason: "invalid_credentials" });
    return NextResponse.json(
      { error: "ভুল ইউজারনেম অথবা পাসওয়ার্ড" },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? `সার্ভার এরর: ${error.message}`
            : "সার্ভার এরর",
      },
      { status: 500 }
    );
  }
}
