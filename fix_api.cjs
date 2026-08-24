const fs = require("fs");

const file1 = "app/api/users/[id]/route.ts";
let content1 = fs.readFileSync(file1, "utf8");
content1 = content1.replace("Forbidden", "Forbidden").replace("", ""); // just ensuring we write utf8
fs.writeFileSync(file1, `import { NextResponse } from "next/server";
import { ensureDatabase } from "../../../../db/bootstrap";
import { requireSuperAdmin } from "../../../lib/auth";
import { hashPassword } from "../../../lib/password";
import { isAssignableUserRole } from "../../../lib/user-roles";
import { validatePasswordPolicy, writeAudit } from "../../../lib/admin-settings";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const actor = await requireSuperAdmin();
  if (!actor) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    const { id } = await params;
    const data = await request.json() as Record<string, unknown>;
    const nextPassword = String(data.password ?? "");
    const nextUsername = String(data.username ?? "").trim();
    if (nextPassword) {
      const passwordError = await validatePasswordPolicy(nextPassword, nextUsername);
      if (passwordError) return NextResponse.json({ error: passwordError }, { status: 400 });
    }
    const db = await ensureDatabase();
    const existing = await db.prepare("SELECT id, role FROM users WHERE id = ?").bind(id).first<{ id: number; role: string }>();
    if (!existing) return NextResponse.json({ error: "????? ????? ??????" }, { status: 404 });
    const nextRole = existing.role === "super_admin" ? "super_admin" : (data.role as string);
    if (nextRole !== "super_admin" && !isAssignableUserRole(nextRole)) {
      return NextResponse.json({ error: "???? ????? ??? ???????? ?????" }, { status: 400 });
    }
    if (nextRole === "area_manager" && !String(data.area_code ?? "").trim()) {
      return NextResponse.json({ error: "????? ??????????? ???? ????? ???????? ?????" }, { status: 400 });
    }
    const isSchoolRole = nextRole === "school_headmaster" || nextRole === "tiffin_manager";
    if (isSchoolRole && !String(data.school_emis_code ?? "").trim()) {
      return NextResponse.json({ error: "?? ????? ???? ????? ???????? ??? ???????" }, { status: 400 });
    }
    await db.prepare(
      \`UPDATE users SET username = ?,
       password = COALESCE(NULLIF(?, ''), password), name = ?, role = ?,
       area_code = ?, school_emis_code = ?, is_active = ?, email = ?, phone = ?, bio = ?,
       address = ?, designation = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?\`
    ).bind(
      nextUsername,
      nextPassword ? await hashPassword(nextPassword) : "",
      String(data.name ?? "").trim(),
      nextRole,
      nextRole === "area_manager" ? String(data.area_code ?? "") : null,
      isSchoolRole ? String(data.school_emis_code ?? "") : null,
      data.is_active === 0 ? 0 : 1,
      String(data.email ?? "").trim(),
      String(data.phone ?? "").trim(),
      String(data.bio ?? "").trim(),
      String(data.address ?? "").trim(),
      String(data.designation ?? "").trim(),
      id,
    ).run();
    await writeAudit(actor.username, "user.updated", "user", id, existing, { username: data.username, name: data.name, role: nextRole, area_code: data.area_code, school_emis_code: data.school_emis_code, is_active: data.is_active });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "User update failed" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const actor = await requireSuperAdmin();
  if (!actor) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    const { id } = await params;
    const db = await ensureDatabase();
    const existing = await db.prepare("SELECT role FROM users WHERE id = ?").bind(id).first<{ role: string }>();
    if (!existing) return NextResponse.json({ error: "????? ????? ??????" }, { status: 404 });
    if (existing.role === "super_admin") {
      return NextResponse.json({ error: "????? ???????? ?????????? ????? ??? ???? ???" }, { status: 400 });
    }
    await db.prepare("DELETE FROM users WHERE id = ?").bind(id).run();
    await writeAudit(actor.username, "user.deleted", "user", id, existing, null);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "User delete failed" },
      { status: 500 },
    );
  }
}
`, "utf8");

const file2 = "app/api/users/route.ts";
fs.writeFileSync(file2, `import { NextResponse } from "next/server";
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
      \`SELECT u.id, u.username, u.name, u.role, u.area_code, u.school_emis_code, u.is_active,
       u.email, u.phone, u.bio, u.address, u.photo_base64, u.designation,
       a.name_bn AS area_name, s.name_bn AS school_name
       FROM users u 
       LEFT JOIN areas a ON a.code = u.area_code
       LEFT JOIN schools s ON s.emis_code = u.school_emis_code
       ORDER BY CASE WHEN u.role = 'super_admin' THEN 0 ELSE 1 END, u.name\`
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
      return NextResponse.json({ error: "????????, ????????? ??? ??? ???????" }, { status: 400 });
    }
    const passwordError = await validatePasswordPolicy(password, username);
    if (passwordError) return NextResponse.json({ error: passwordError }, { status: 400 });
    if (!isAssignableUserRole(role)) {
      return NextResponse.json({ error: "???? ????? ??? ???????? ?????" }, { status: 400 });
    }
    if (role === "area_manager" && !String(data.area_code ?? "").trim()) {
      return NextResponse.json({ error: "????? ??????????? ???? ????? ???????? ?????" }, { status: 400 });
    }
    const isSchoolRole = role === "school_headmaster" || role === "tiffin_manager";
    if (isSchoolRole && !String(data.school_emis_code ?? "").trim()) {
      return NextResponse.json({ error: "?? ????? ???? ????? ???????? ??? ???????" }, { status: 400 });
    }
    const db = await ensureDatabase();
    const duplicate = await db.prepare("SELECT id FROM users WHERE username = ?").bind(username).first();
    if (duplicate) {
      return NextResponse.json({ error: "?? ?????????? ???????? ??????? ??????" }, { status: 409 });
    }
    const inserted = await db.prepare(
      \`INSERT INTO users
       (username, password, name, role, area_code, school_emis_code, is_active, email, phone,
        bio, address, designation)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)\`
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
`, "utf8");

console.log("Done");
