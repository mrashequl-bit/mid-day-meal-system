import { NextResponse } from "next/server";
import { ensureDatabase } from "../../../db/bootstrap";
import { getAuthUser } from "../../lib/auth";
import { hashPassword } from "../../lib/password";
import { validatePasswordPolicy } from "../../lib/admin-settings";

export async function GET() {
  try {
    const authUser = await getAuthUser();
    if (!authUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const db = await ensureDatabase();
    const user = await db
      .prepare("SELECT id, username, name, role, area_code, email, phone, bio, address, photo_base64, designation FROM users WHERE id = ?")
      .bind(authUser.id)
      .first();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Profile unavailable" },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const data = (await request.json()) as Record<string, unknown>;
    const db = await ensureDatabase();
    if (data.new_password) {
      const passwordError = await validatePasswordPolicy(
        String(data.new_password),
        authUser.username,
      );
      if (passwordError) {
        return NextResponse.json({ error: passwordError }, { status: 400 });
      }
    }
    const nextPassword = data.new_password
      ? await hashPassword(String(data.new_password))
      : null;

    await db.prepare(
      `UPDATE users SET 
        name = ?, email = ?, phone = ?, bio = ?, address = ?, designation = ?,
        photo_base64 = ?, password = COALESCE(?, password),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`
    ).bind(
      String(data.name ?? authUser.name).trim(),
      String(data.email ?? ""),
      String(data.phone ?? ""),
      String(data.bio ?? ""),
      String(data.address ?? ""),
      String(data.designation ?? ""),
      String(data.photo_base64 ?? ""),
      nextPassword,
      authUser.id
    ).run();

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Profile update failed" },
      { status: 500 },
    );
  }
}
