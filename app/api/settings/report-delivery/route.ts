import { NextResponse } from "next/server";
import { env } from "cloudflare:workers";
import { ensureDatabase } from "../../../../db/bootstrap";
import { requireSuperAdmin } from "../../../lib/auth";
import { deliverDailyDistributionReport, getDhakaReportDate, type DeliveryEnv } from "../../../lib/daily-distribution-delivery";

export async function GET() {
  const user = await requireSuperAdmin();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const db = await ensureDatabase();
  const runs = await db.prepare(`SELECT id, report_date, channel, recipient, status,
    error_message, is_test, created_at FROM report_delivery_runs
    ORDER BY id DESC LIMIT 20`).all();
  return NextResponse.json({ runs: runs.results });
}

export async function POST() {
  const user = await requireSuperAdmin();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const result = await deliverDailyDistributionReport(env as DeliveryEnv, {
      date: getDhakaReportDate(new Date()),
      force: true,
      test: true,
    });
    return NextResponse.json({ success: result.failed === 0 && result.sent > 0, ...result }, { status: result.failed ? 207 : 200 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "টেস্ট রিপোর্ট পাঠানো যায়নি।" }, { status: 500 });
  }
}
