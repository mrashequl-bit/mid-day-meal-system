import { NextResponse } from "next/server";
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
    if (nextPassword) {
      const passwordError = await validatePasswordPolicy(nextPassword);
      if (passwordError) return NextResponse.json({ error: passwordError }, { status: 400 });
    }
    const db = await ensureDatabase();
    const existing = await db.prepare("SELECT id, role FROM users WHERE id = ?").bind(id).first<{ id: number; role: string }>();
    if (!existing) return NextResponse.json({ error: "ইউজার পাওয়া যায়নি।" }, { status: 404 });
    const nextRole = existing.role === "super_admin" ? "super_admin" : data.role;
    if (nextRole !== "super_admin" && !isAssignableUserRole(nextRole)) {
      return NextResponse.json({ error: "সঠিক ইউজার রোল নির্বাচন করুন।" }, { status: 400 });
    }
    if (nextRole === "area_manager" && !String(data.area_code ?? "").trim()) {
      return NextResponse.json({ error: "এরিয়া ম্যানেজারের জন্য অঞ্চল নির্বাচন করুন।" }, { status: 400 });
    }
    await db.prepare(
      `UPDATE users SET username = ?,
       password = COALESCE(NULLIF(?, ''), password), name = ?, role = ?,
       area_code = ?, is_active = ?, email = ?, phone = ?, bio = ?,
       address = ?, designation = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`
    ).bind(
      String(data.username ?? "").trim(),
      nextPassword ? await hashPassword(nextPassword) : "",
      String(data.name ?? "").trim(),
      nextRole,
      nextRole === "area_manager" ? String(data.area_code ?? "") : null,
      data.is_active === 0 ? 0 : 1,
      String(data.email ?? "").trim(),
      String(data.phone ?? "").trim(),
      String(data.bio ?? "").trim(),
      String(data.address ?? "").trim(),
      String(data.designation ?? "").trim(),
      id,
    ).run();
    await writeAudit(actor.username, "user.updated", "user", id, existing, { username: data.username, name: data.name, role: nextRole, area_code: data.area_code, is_active: data.is_active });
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
    if (!existing) return NextResponse.json({ error: "ইউজার পাওয়া যায়নি।" }, { status: 404 });
    if (existing.role === "super_admin") {
      return NextResponse.json({ error: "সুপার অ্যাডমিন অ্যাকাউন্ট ডিলেট করা যাবে না।" }, { status: 400 });
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
