import { NextResponse } from "next/server";
import { ensureDatabase } from "../../../../db/bootstrap";
import { requireSuperAdmin } from "../../../lib/auth";
import { writeAudit } from "../../../lib/admin-settings";

export async function POST(request: Request) { return save(request, false); }
export async function PUT(request: Request) { return save(request, true); }
async function save(request: Request, editing: boolean) {
  const user = await requireSuperAdmin();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const data = await request.json() as Record<string, unknown>;
    const code = String(data.code || "").trim().toUpperCase();
    const name = String(data.name_bn || "").trim();
    if (!/^[A-Z0-9_-]{2,20}$/.test(code) || !name) throw new Error("সঠিক অঞ্চল কোড ও নাম দিন।");
    const db = await ensureDatabase();
    const before = await db.prepare("SELECT * FROM areas WHERE code=?").bind(code).first();
    if (editing && !before) throw new Error("অঞ্চল পাওয়া যায়নি।");
    if (!editing && before) throw new Error("অঞ্চল কোড আগে থেকেই আছে।");
    if (editing) await db.prepare("UPDATE areas SET name_bn=?, manager_name=?, manager_mobile=?, is_active=?, updated_at=CURRENT_TIMESTAMP WHERE code=?")
      .bind(name, String(data.manager_name || ""), String(data.manager_mobile || ""), data.is_active === 0 ? 0 : 1, code).run();
    else await db.prepare("INSERT INTO areas (code,name_bn,manager_name,manager_mobile) VALUES (?,?,?,?)")
      .bind(code, name, String(data.manager_name || ""), String(data.manager_mobile || "")).run();
    const after = await db.prepare("SELECT * FROM areas WHERE code=?").bind(code).first();
    await writeAudit(user.username, editing ? "area.updated" : "area.created", "area", code, before, after);
    return NextResponse.json({ success: true });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "অঞ্চল সংরক্ষণ করা যায়নি।" }, { status: 400 }); }
}
export async function DELETE(request: Request) {
  const user = await requireSuperAdmin();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const code = new URL(request.url).searchParams.get("code") || "";
  const db = await ensureDatabase();
  const school = await db.prepare("SELECT emis_code FROM schools WHERE area_code=? AND is_active=1 LIMIT 1").bind(code).first();
  const assignedUser = await db.prepare("SELECT id FROM users WHERE area_code=? AND is_active=1 LIMIT 1").bind(code).first();
  if (school || assignedUser) return NextResponse.json({ error: "সক্রিয় বিদ্যালয় বা ইউজার থাকা অবস্থায় অঞ্চলটি মুছতে পারবেন না। আগে স্থানান্তর করুন।" }, { status: 409 });
  const before = await db.prepare("SELECT * FROM areas WHERE code=?").bind(code).first();
  if (!before) return NextResponse.json({ error: "অঞ্চল পাওয়া যায়নি।" }, { status: 404 });
  await db.prepare("UPDATE areas SET is_active=0, updated_at=CURRENT_TIMESTAMP WHERE code=?").bind(code).run();
  await writeAudit(user.username, "area.deactivated", "area", code, before, { is_active: 0 });
  return NextResponse.json({ success: true });
}
