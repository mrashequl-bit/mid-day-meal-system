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
    const code = String(data.emis_code || "").trim();
    const name = String(data.name_bn || "").trim();
    const area = String(data.area_code || "").trim();
    const demand = Math.max(1, Number(data.current_daily_demand || 1));
    const requestedSerial = Number(data.serial_number);
    if (!code || !name || !area) throw new Error("EMIS, বিদ্যালয়ের নাম ও অঞ্চল আবশ্যক।");
    if (!/^\d{11}$/.test(code)) throw new Error("EMIS কোড ইংরেজি সংখ্যায় ১১ ডিজিটের হতে হবে।");
    const db = await ensureDatabase();
    const activeArea = await db.prepare("SELECT code FROM areas WHERE code=? AND is_active=1 LIMIT 1").bind(area).first();
    if (!activeArea) throw new Error("সক্রিয় অঞ্চল নির্বাচন করুন।");
    const before = await db.prepare("SELECT * FROM schools WHERE emis_code=?").bind(code).first();
    if (editing && !before) throw new Error("বিদ্যালয় পাওয়া যায়নি।");
    if (!editing && before) throw new Error("এই EMIS কোড আগে থেকেই আছে।");
    const serial = Number.isInteger(requestedSerial) && requestedSerial > 0
      ? requestedSerial
      : editing ? Number((before as { serial_number?: number } | null)?.serial_number || 0)
      : Number((await db.prepare("SELECT COALESCE(MAX(serial_number),0)+1 AS next FROM schools").first<{next:number}>())?.next || 1);
    if (!serial) throw new Error("সঠিক ক্রমিক নম্বর দিন।");
    const duplicateSerial = await db.prepare("SELECT emis_code FROM schools WHERE serial_number=? AND emis_code<>? LIMIT 1").bind(serial, code).first();
    if (duplicateSerial) throw new Error(`ক্রমিক ${serial} অন্য বিদ্যালয়ের জন্য ব্যবহৃত হচ্ছে।`);
    const unionName = String(data.union_name || "").trim();
    const clusterName = String(data.cluster_name || "").trim();
    if (editing) await db.prepare(`UPDATE schools SET name_bn=?, area_code=?, head_teacher=?, legacy_mobile=?, union_name=?, cluster_name=?, serial_number=?, current_daily_demand=?, is_active=?, updated_at=CURRENT_TIMESTAMP WHERE emis_code=?`)
      .bind(name, area, String(data.head_teacher || ""), String(data.legacy_mobile || ""), unionName, clusterName, serial, demand, data.is_active === 0 ? 0 : 1, code).run();
    else await db.prepare(`INSERT INTO schools (emis_code,name_bn,area_code,head_teacher,legacy_mobile,union_name,cluster_name,serial_number,current_daily_demand) VALUES (?,?,?,?,?,?,?,?,?)`)
      .bind(code, name, area, String(data.head_teacher || ""), String(data.legacy_mobile || ""), unionName, clusterName, serial, demand).run();
    const after = await db.prepare("SELECT * FROM schools WHERE emis_code=?").bind(code).first();
    await writeAudit(user.username, editing ? "school.updated" : "school.created", "school", code, before, after);
    return NextResponse.json({ success: true });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "বিদ্যালয় সংরক্ষণ করা যায়নি।" }, { status: 400 }); }
}

export async function DELETE(request: Request) {
  const user = await requireSuperAdmin();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const params = new URL(request.url).searchParams;
  const code = params.get("emisCode") || "";
  const permanent = params.get("permanent") === "1";
  const db = await ensureDatabase();
  const before = await db.prepare("SELECT * FROM schools WHERE emis_code=?").bind(code).first();
  if (!before) return NextResponse.json({ error: "বিদ্যালয় পাওয়া যায়নি।" }, { status: 404 });

  if (!permanent) {
    await db.prepare("UPDATE schools SET is_active=0, updated_at=CURRENT_TIMESTAMP WHERE emis_code=?").bind(code).run();
    await writeAudit(user.username, "school.deactivated", "school", code, before, { is_active: 0 });
    return NextResponse.json({ success: true, permanent: false });
  }

  if (Number((before as { is_active?: number }).is_active) !== 0) {
    return NextResponse.json({ error: "স্থায়ীভাবে মুছতে বিদ্যালয়টি আগে নিষ্ক্রিয় করুন।" }, { status: 409 });
  }

  const references = await db.prepare(`
    SELECT
      (SELECT COUNT(*) FROM school_demand_history WHERE school_emis_code=?) AS demand_count,
      (SELECT COUNT(*) FROM distribution_reports WHERE school_emis_code=?) AS report_count
  `).bind(code, code).first<{ demand_count: number; report_count: number }>();
  const demandCount = Number(references?.demand_count || 0);
  const reportCount = Number(references?.report_count || 0);
  if (demandCount || reportCount) {
    return NextResponse.json({
      error: `এই বিদ্যালয়ের ${demandCount}টি চাহিদা পরিবর্তন এবং ${reportCount}টি বিতরণ রিপোর্ট আছে। ইতিহাস সংরক্ষণের জন্য স্থায়ীভাবে মুছা যাবে না।`,
    }, { status: 409 });
  }

  const tiffinUser = await db.prepare("SELECT id FROM users WHERE username=? AND role='tiffin_manager' LIMIT 1").bind(code).first<{ id: number }>();
  const statements = [];
  if (tiffinUser?.id) {
    statements.push(db.prepare("DELETE FROM sessions WHERE user_id=?").bind(tiffinUser.id));
    statements.push(db.prepare("DELETE FROM users WHERE id=?").bind(tiffinUser.id));
  }
  statements.push(db.prepare("DELETE FROM schools WHERE emis_code=?").bind(code));
  await db.batch(statements);
  await writeAudit(user.username, "school.deleted", "school", code, before, { deleted: true, tiffin_user_deleted: Boolean(tiffinUser?.id) });
  return NextResponse.json({ success: true, permanent: true });
}
