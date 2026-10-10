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
    let code = editing ? String(data.code || "").trim().toUpperCase() : "";
    const name = String(data.name_bn || "").trim();
    if (!name) throw new Error("অঞ্চলের নাম দিন।");
    if (editing && !/^[A-Z0-9_-]{2,20}$/.test(code)) throw new Error("অঞ্চল পাওয়া যায়নি।");
    const db = await ensureDatabase();
    if (!editing) {
      for (let attempt = 0; attempt < 5 && !code; attempt += 1) {
        const candidate = `AR-${crypto.randomUUID().replaceAll("-", "").slice(0, 10).toUpperCase()}`;
        const duplicate = await db.prepare("SELECT 1 FROM areas WHERE code=?").bind(candidate).first();
        if (!duplicate) code = candidate;
      }
      if (!code) throw new Error("অঞ্চলের পরিচিতি তৈরি করা যায়নি। আবার চেষ্টা করুন।");
    }
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
export async function PATCH(request: Request) {
  const user = await requireSuperAdmin();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const data = await request.json() as Record<string, unknown>;
    const sourceCode = String(data.source_code || "").trim().toUpperCase();
    const targetCode = String(data.target_code || "").trim().toUpperCase();
    if (!sourceCode || !targetCode || sourceCode === targetCode) throw new Error("ভিন্ন একটি লক্ষ্য অঞ্চল নির্বাচন করুন।");
    const db = await ensureDatabase();
    const [source, target, schoolCount, userCount] = await Promise.all([
      db.prepare("SELECT * FROM areas WHERE code=? AND is_active=1").bind(sourceCode).first(),
      db.prepare("SELECT * FROM areas WHERE code=? AND is_active=1").bind(targetCode).first(),
      db.prepare("SELECT COUNT(*) AS count FROM schools WHERE area_code=?").bind(sourceCode).first<{ count: number }>(),
      db.prepare("SELECT COUNT(*) AS count FROM users WHERE area_code=?").bind(sourceCode).first<{ count: number }>(),
    ]);
    if (!source) return NextResponse.json({ error: "উৎস অঞ্চল পাওয়া যায়নি।" }, { status: 404 });
    if (!target) return NextResponse.json({ error: "লক্ষ্য অঞ্চল পাওয়া যায়নি।" }, { status: 404 });
    const movedSchools = Number(schoolCount?.count || 0);
    const movedUsers = Number(userCount?.count || 0);
    await db.batch([
      db.prepare("UPDATE schools SET area_code=?, updated_at=CURRENT_TIMESTAMP WHERE area_code=?").bind(targetCode, sourceCode),
      db.prepare("UPDATE users SET area_code=?, updated_at=CURRENT_TIMESTAMP WHERE area_code=?").bind(targetCode, sourceCode),
    ]);
    await writeAudit(user.username, "area.assignments_transferred", "area", sourceCode, { source, movedSchools, movedUsers }, { targetCode });
    return NextResponse.json({ success: true, movedSchools, movedUsers });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "স্থানান্তর করা যায়নি।" }, { status: 400 });
  }
}
export async function DELETE(request: Request) {
  const user = await requireSuperAdmin();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const code = new URL(request.url).searchParams.get("code") || "";
  const db = await ensureDatabase();
  const before = await db.prepare("SELECT * FROM areas WHERE code=?").bind(code).first();
  if (!before) return NextResponse.json({ error: "অঞ্চল পাওয়া যায়নি।" }, { status: 404 });
  const school = await db.prepare("SELECT emis_code FROM schools WHERE area_code=? LIMIT 1").bind(code).first();
  const assignedUser = await db.prepare("SELECT id FROM users WHERE area_code=? LIMIT 1").bind(code).first();
  if (school || assignedUser) return NextResponse.json({ error: "বিদ্যালয় বা ইউজার এসাইন থাকা অবস্থায় অঞ্চলটি ডিলেট করা যাবে না। আগে অন্য অঞ্চলে স্থানান্তর করুন।" }, { status: 409 });
  const historicalReference = await db.prepare(`SELECT 1 FROM (
    SELECT area_code FROM area_expenses WHERE area_code=?
    UNION ALL SELECT area_code FROM area_payments WHERE area_code=?
    UNION ALL SELECT area_code FROM stock_transactions WHERE area_code=?
    UNION ALL SELECT area_code FROM distribution_reports WHERE area_code=?
    UNION ALL SELECT area_code FROM notifications WHERE area_code=?
  ) LIMIT 1`).bind(code, code, code, code, code).first();
  if (historicalReference) return NextResponse.json({ error: "এই অঞ্চলের পূর্ববর্তী লেনদেন বা রিপোর্ট আছে, তাই ডিলেট করা যাবে না।" }, { status: 409 });
  await db.prepare("DELETE FROM areas WHERE code=?").bind(code).run();
  await writeAudit(user.username, "area.deleted", "area", code, before, null);
  return NextResponse.json({ success: true });
}
