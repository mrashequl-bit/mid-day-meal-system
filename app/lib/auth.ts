import { cookies } from "next/headers";
import { ensureDatabase } from "../../db/bootstrap";

export const AUTH_COOKIE = "auth_token";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export type AuthUser = {
  id: number;
  username: string;
  name: string;
  role: string;
  areaCode: string | null;
  mobile: string;
};

function toBase64Url(bytes: Uint8Array) {
  return Buffer.from(bytes).toString("base64url");
}

async function hashToken(token: string) {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(token),
  );
  return toBase64Url(new Uint8Array(digest));
}

export async function createSession(userId: number) {
  const tokenBytes = new Uint8Array(32);
  crypto.getRandomValues(tokenBytes);
  const token = toBase64Url(tokenBytes);
  const tokenHash = await hashToken(token);
  const db = await ensureDatabase();

  await db
    .prepare(
      `INSERT INTO sessions (token_hash, user_id, expires_at)
       VALUES (?, ?, datetime('now', '+7 days'))`,
    )
    .bind(tokenHash, userId)
    .run();

  return { token, maxAge: SESSION_MAX_AGE_SECONDS };
}

export async function getAuthUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value;
  if (!token) return null;

  const db = await ensureDatabase();
  const user = await db
    .prepare(
      `SELECT u.id, u.username, u.name, u.role,
       u.area_code AS areaCode, COALESCE(u.phone, '') AS mobile
       FROM sessions s
       JOIN users u ON u.id = s.user_id
       WHERE s.token_hash = ?
         AND s.expires_at > CURRENT_TIMESTAMP
         AND u.is_active = 1`,
    )
    .bind(await hashToken(token))
    .first<AuthUser>();

  return user ?? null;
}

export async function requireSuperAdmin() {
  const user = await getAuthUser();
  return user?.role === "super_admin" ? user : null;
}

export async function destroyCurrentSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value;
  if (token) {
    const db = await ensureDatabase();
    await db
      .prepare("DELETE FROM sessions WHERE token_hash = ?")
      .bind(await hashToken(token))
      .run();
  }
  cookieStore.delete(AUTH_COOKIE);
}

