import { NextResponse } from "next/server";
import { ensureDatabase } from "../../../db/bootstrap";
import { requireSuperAdmin } from "../../lib/auth";
import { hashPassword } from "../../lib/password";
import { isAssignableUserRole } from "../../lib/user-roles";
import { validatePasswordPolicy, writeAudit } from "../../lib/admin-settings";

export async function GET() {
  if (!(await requireSuperAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    const db = await ensureDatabase();
    const result = await db.prepare(
      `SELECT u.id, u.username, u.name, u.role, u.area_code, u.school_emis_code, u.is_active,
       u.email, u.phone, u.bio, u.address, u.photo_base64, u.designation,
       a.name_bn AS area_name, s.name_bn AS school_name
       FROM users u LEFT JOIN areas a ON a.code = u.area_code
       LEFT JOIN schools s ON s.emis_code = u.school_emis_code
       ORDER BY CASE WHEN u.role = 'super_admin' THEN 0 ELSE 1 END, u.name`
    ).all();
    return NextResponse.json(result.results);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Users unavailable" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const actor = await requireSuperAdmin();
  if (!actor) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    const data = await request.json() as Record<string, unknown>;
    const username = String(data.username ?? "").trim();
    const password = String(data.password ?? "");
    const name = String(data.name ?? "").trim();
    const role = data.role as string;
    if (!username || !password || !name) {
      return NextResponse.json({ error: "নাম, ইউজারনেম এবং পাসওয়ার্ড আবশ্যক।" }, { status: 400 });
    }
    const passwordError = await validatePasswordPolicy(password);
    if (passwordError) return NextResponse.json({ error: passwordError }, { status: 400 });
    if (!isAssignableUserRole(role)) {
      return NextResponse.json({ error: "সঠিক ইউজার রোল নির্বাচন করুন।" }, { status: 400 });
    }
    const isSchoolRole = role === "school_headmaster" || role === "tiffin_manager";
    if (isSchoolRole && !String(data.school_emis_code ?? "").trim()) {
      return NextResponse.json({ error: "এই রোলের জন্য একটি বিদ্যালয় নির্বাচন করা আবশ্যক।" }, { status: 400 });
    }
    if (role === "area_manager" && !String(data.area_code ?? "").trim()) {
      return NextResponse.json({ error: "এরিয়া ম্যানেজারের জন্য অঞ্চল নির্বাচন করুন।" }, { status: 400 });
    }
    const db = await ensureDatabase();
    const duplicate = await db.prepare("SELECT id FROM users WHERE username = ?").bind(username).first();
    if (duplicate) {
      return NextResponse.json({ error: "এই ইউজারনেমটি ইতোমধ্যে ব্যবহৃত হচ্ছে।" }, { status: 409 });
    }
    const inserted = await db.prepare(
      `INSERT INTO users
       (username, password, name, role, area_code, school_emis_code, is_active, email, phone,
        bio, address, designation)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      username,
      await hashPassword(password),
      name,
      role,
      role === "area_manager" ? String(data.area_code ?? "") : null,
      isSchoolRole ? String(data.school_emis_code ?? "") : null,
      data.is_active === 0 ? 0 : 1,
      String(data.email ?? "").trim(),
      String(data.phone ?? "").trim(),
      String(data.bio ?? "").trim(),
      String(data.address ?? "").trim(),
      String(data.designation ?? "").trim(),
    ).run();
    await writeAudit(actor.username, "user.created", "user", String(inserted.meta.last_row_id || username), null, { username, name, role, area_code: data.area_code, school_emis_code: data.school_emis_code });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "User save failed" },
      { status: 500 },
    );
  }
}
