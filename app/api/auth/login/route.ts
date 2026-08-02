import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ensureDatabase } from "../../../../db/bootstrap";
import { AUTH_COOKIE, createSession } from "../../../lib/auth";
import { verifyPassword } from "../../../lib/password";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as Record<string, unknown>;
    const username = String(payload.username ?? "").trim();
    const password = String(payload.password ?? "");

    if (!username || !password) {
      return NextResponse.json(
        { error: "ইউজারনেম এবং পাসওয়ার্ড প্রদান করুন" },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const db = await ensureDatabase();
    
    const user = await db
      .prepare("SELECT id, password, role, name, area_code FROM users WHERE username = ? AND is_active = 1")
      .bind(username)
      .first<{ id: number; password: string; role: string; name: string; area_code?: string }>();

    if (user) {
      const passwordCheck = await verifyPassword(String(password), user.password);
      if (!passwordCheck.ok) {
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
      const session = await createSession(user.id);
      
      cookieStore.set(AUTH_COOKIE, session.token, {
        httpOnly: true,
        secure: new URL(request.url).protocol === "https:",
        sameSite: "lax",
        path: "/",
        maxAge: session.maxAge,
      });

      return NextResponse.json({ success: true, role: user.role, areaCode: user.area_code });
    }

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
