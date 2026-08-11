import { NextResponse } from "next/server";
import { ensureDatabase } from "../../../../db/bootstrap";
import { requireSuperAdmin } from "../../../lib/auth";
import { writeAudit } from "../../../lib/admin-settings";

const isoDate = /^\d{4}-\d{2}-\d{2}$/;
type Period = { id:number; name:string; start_date:string; end_date:string; status:"draft"|"active"; created_by:string; created_at:string; updated_at:string };

function validDate(value: unknown) {
  const date = String(value || "");
  if (!isoDate.test(date)) return "";
  const parsed = new Date(`${date}T00:00:00Z`);
  return Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date ? "" : date;
}

async function foodCodes(db: Awaited<ReturnType<typeof ensureDatabase>>) {
  const rows = await db.prepare("SELECT item_code AS code, item_name_bn AS name, unit FROM stock_balances ORDER BY CASE item_code WHEN 'bun' THEN 1 WHEN 'egg' THEN 2 WHEN 'banana' THEN 3 ELSE 4 END, item_name_bn").all<{code:string;name:string;unit:string}>();
  return rows.results;
}

export async function GET(request: Request) {
  const user = await requireSuperAdmin();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const db = await ensureDatabase();
  const periodId = Number(new URL(request.url).searchParams.get("periodId") || 0);
  const [periods, foods] = await Promise.all([
    db.prepare("SELECT * FROM meal_plan_periods ORDER BY start_date DESC, id DESC").all<Period>(),
    foodCodes(db),
  ]);
  const days = periodId > 0
    ? await db.prepare("SELECT id, period_id, plan_date, items_json, updated_by, updated_at FROM meal_plan_days WHERE period_id=? ORDER BY plan_date").bind(periodId).all()
    : { results: [] };
  return NextResponse.json({ periods: periods.results, foods, days: days.results });
}

export async function POST(request: Request) {
  const user = await requireSuperAdmin();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const data = await request.json() as Record<string, unknown>;
    const startDate = validDate(data.startDate);
    const endDate = validDate(data.endDate);
    const name = String(data.name || "").trim();
    if (!startDate || !endDate || startDate > endDate) throw new Error("সঠিক শুরু ও শেষ তারিখ দিন।");
    if (name.length > 100) throw new Error("পরিকল্পনার নাম ১০০ অক্ষরের মধ্যে দিন।");
    const db = await ensureDatabase();
    const result = await db.prepare("INSERT INTO meal_plan_periods (name,start_date,end_date,status,created_by) VALUES (?,?,?,'draft',?)")
      .bind(name || `${startDate} - ${endDate}`, startDate, endDate, user.username).run();
    const id = Number(result.meta.last_row_id);
    const after = await db.prepare("SELECT * FROM meal_plan_periods WHERE id=?").bind(id).first();
    await writeAudit(user.username, "meal_plan.created", "meal_plan_period", String(id), null, after);
    return NextResponse.json({ success: true, id }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "পরিকল্পনা তৈরি করা যায়নি।" }, { status: 400 });
  }
}

export async function PUT(request: Request) {
  const user = await requireSuperAdmin();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const data = await request.json() as Record<string, unknown>;
    const action = String(data.action || "");
    const periodId = Number(data.periodId || 0);
    if (!Number.isInteger(periodId) || periodId < 1) throw new Error("পরিকল্পনা নির্বাচন করুন।");
    const db = await ensureDatabase();
    const period = await db.prepare("SELECT * FROM meal_plan_periods WHERE id=?").bind(periodId).first<Period>();
    if (!period) return NextResponse.json({ error: "পরিকল্পনা পাওয়া যায়নি।" }, { status: 404 });

    if (action === "save-day") {
      const planDate = validDate(data.date);
      if (!planDate || planDate < period.start_date || planDate > period.end_date) throw new Error("তারিখটি নির্বাচিত পরিকল্পনার মধ্যে নেই।");
      if (period.status === "active") throw new Error("Active পরিকল্পনা পরিবর্তনের আগে Draft করুন।");
      const requested = Array.isArray(data.itemCodes) ? [...new Set(data.itemCodes.map(String))] : [];
      const foods = await foodCodes(db);
      const allowed = new Set(foods.map((item) => item.code));
      if (requested.some((code) => !allowed.has(code))) throw new Error("অবৈধ খাবার নির্বাচন করা হয়েছে।");
      const before = await db.prepare("SELECT * FROM meal_plan_days WHERE period_id=? AND plan_date=?").bind(periodId, planDate).first();
      if (requested.length === 0) {
        await db.prepare("DELETE FROM meal_plan_days WHERE period_id=? AND plan_date=?").bind(periodId, planDate).run();
        await writeAudit(user.username, "meal_plan.day_removed", "meal_plan_day", `${periodId}:${planDate}`, before, null);
      } else {
        await db.prepare(`INSERT INTO meal_plan_days (period_id,plan_date,items_json,updated_by) VALUES (?,?,?,?)
          ON CONFLICT(period_id,plan_date) DO UPDATE SET items_json=excluded.items_json,updated_by=excluded.updated_by,updated_at=CURRENT_TIMESTAMP`)
          .bind(periodId, planDate, JSON.stringify(requested), user.username).run();
        const after = await db.prepare("SELECT * FROM meal_plan_days WHERE period_id=? AND plan_date=?").bind(periodId, planDate).first();
        await writeAudit(user.username, "meal_plan.day_saved", "meal_plan_day", `${periodId}:${planDate}`, before, after);
      }
      return NextResponse.json({ success: true });
    }

    if (action === "activate") {
      const planned = await db.prepare("SELECT COUNT(*) AS total FROM meal_plan_days WHERE period_id=?").bind(periodId).first<{total:number}>();
      if (!planned?.total) throw new Error("কমপক্ষে এক দিনের খাবার নির্ধারণ করুন।");
      await db.batch([
        db.prepare("UPDATE meal_plan_periods SET status='draft',updated_at=CURRENT_TIMESTAMP WHERE status='active' AND id<>?").bind(periodId),
        db.prepare("UPDATE meal_plan_periods SET status='active',updated_at=CURRENT_TIMESTAMP WHERE id=?").bind(periodId),
      ]);
      await writeAudit(user.username, "meal_plan.activated", "meal_plan_period", String(periodId), period, { ...period, status: "active" });
      return NextResponse.json({ success: true });
    }

    if (action === "draft") {
      await db.prepare("UPDATE meal_plan_periods SET status='draft',updated_at=CURRENT_TIMESTAMP WHERE id=?").bind(periodId).run();
      await writeAudit(user.username, "meal_plan.draft", "meal_plan_period", String(periodId), period, { ...period, status: "draft" });
      return NextResponse.json({ success: true });
    }
    throw new Error("অজানা নির্দেশনা।");
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "পরিকল্পনা সংরক্ষণ করা যায়নি।" }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  const user = await requireSuperAdmin();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const periodId = Number(new URL(request.url).searchParams.get("periodId") || 0);
  const db = await ensureDatabase();
  const before = await db.prepare("SELECT * FROM meal_plan_periods WHERE id=?").bind(periodId).first<Period>();
  if (!before) return NextResponse.json({ error: "পরিকল্পনা পাওয়া যায়নি।" }, { status: 404 });
  if (before.status === "active") return NextResponse.json({ error: "Active পরিকল্পনা আগে Draft করুন।" }, { status: 409 });
  await db.prepare("DELETE FROM meal_plan_periods WHERE id=?").bind(periodId).run();
  await writeAudit(user.username, "meal_plan.deleted", "meal_plan_period", String(periodId), before, null);
  return NextResponse.json({ success: true });
}
