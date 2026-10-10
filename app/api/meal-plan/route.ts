import { NextResponse } from "next/server";
import { ensureDatabase } from "../../../db/bootstrap";
import { getAuthUser } from "../../lib/auth";
import { getMealUnitPrices } from "../../lib/meal-prices";

const isoDate = /^\d{4}-\d{2}-\d{2}$/;
const isoMonth = /^\d{4}-\d{2}$/;

export async function GET(request: Request) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const searchParams = new URL(request.url).searchParams;
  const month = searchParams.get("month") || "";
  const db = await ensureDatabase();
  if (month) {
    if (!isoMonth.test(month)) return NextResponse.json({ error: "সঠিক মাস দিন।" }, { status: 400 });
    const startDate = `${month}-01`;
    const nextMonthDate = new Date(`${startDate}T00:00:00Z`);
    nextMonthDate.setUTCMonth(nextMonthDate.getUTCMonth() + 1);
    const endDate = new Date(nextMonthDate.getTime() - 86400000).toISOString().slice(0, 10);
    const period = await db.prepare(`SELECT id,name,start_date,end_date FROM meal_plan_periods
      WHERE status='active' AND start_date<=? AND end_date>=?
      ORDER BY updated_at DESC,id DESC LIMIT 1`).bind(endDate, startDate).first<{id:number;name:string;start_date:string;end_date:string}>();
    const unitPrices = await getMealUnitPrices(db);
    if (!period) return NextResponse.json({ month, source: "fallback", days: [], unitPrices });
    const rows = await db.prepare(`SELECT plan_date,items_json FROM meal_plan_days
      WHERE period_id=? AND plan_date>=? AND plan_date<=? ORDER BY plan_date`).bind(period.id, startDate, endDate).all<{plan_date:string;items_json:string}>();
    const days = rows.results.map((row) => {
      try { const parsed = JSON.parse(row.items_json || "[]"); return { date:row.plan_date, items:Array.isArray(parsed) ? parsed.map(String) : [] }; }
      catch { return { date:row.plan_date, items:[] }; }
    });
    return NextResponse.json({ month, source:"configured", periodId:period.id, periodName:period.name, startDate:period.start_date, endDate:period.end_date, days, unitPrices });
  }
  const date = searchParams.get("date") || "";
  if (!isoDate.test(date)) return NextResponse.json({ error: "সঠিক তারিখ দিন।" }, { status: 400 });
  const row = await db.prepare(`SELECT p.id AS period_id,p.name,p.status,d.items_json
    FROM meal_plan_periods p
    LEFT JOIN meal_plan_days d ON d.period_id=p.id AND d.plan_date=?
    WHERE p.status='active' AND p.start_date<=? AND p.end_date>=?
    ORDER BY p.updated_at DESC,p.id DESC LIMIT 1`).bind(date, date, date).first<{period_id:number;name:string;status:string;items_json:string|null}>();
  if (!row) return NextResponse.json({ date, source: "fallback", items: [] });
  let codes: string[] = [];
  try { const parsed = JSON.parse(row.items_json || "[]"); codes = Array.isArray(parsed) ? parsed.map(String) : []; } catch { codes = []; }
  if (!codes.length) return NextResponse.json({ date, source: "configured", periodId: row.period_id, periodName: row.name, items: [] });
  const placeholders = codes.map(() => "?").join(",");
  const foods = await db.prepare(`SELECT item_code AS code,item_name_bn AS name,unit FROM stock_balances WHERE item_code IN (${placeholders})`).bind(...codes).all<{code:string;name:string;unit:string}>();
  const byCode = new Map(foods.results.map((food) => [food.code, food]));
  return NextResponse.json({ date, source: "configured", periodId: row.period_id, periodName: row.name, items: codes.map((code) => byCode.get(code)).filter(Boolean) });
}
