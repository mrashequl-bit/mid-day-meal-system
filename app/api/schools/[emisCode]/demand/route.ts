import { NextResponse } from "next/server";
import { ensureDatabase } from "../../../../../db/bootstrap";
import { requireSuperAdmin } from "../../../../lib/auth";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ emisCode: string }> },
) {
  const authUser = await requireSuperAdmin();
  if (!authUser) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { emisCode } = await context.params;
  const payload = (await request.json()) as {
    dailyDemand?: unknown;
    reason?: unknown;
  };
  const dailyDemand = Number(payload.dailyDemand);
  const reason =
    typeof payload.reason === "string" && payload.reason.trim()
      ? payload.reason.trim()
      : "চাহিদা সংশোধন";

  if (!Number.isInteger(dailyDemand) || dailyDemand <= 0) {
    return NextResponse.json(
      { error: "Daily demand must be a positive integer." },
      { status: 422 },
    );
  }

  const actor = authUser.username || authUser.name;
  const db = await ensureDatabase();
  const current = await db
    .prepare(
      "SELECT current_daily_demand AS currentDailyDemand FROM schools WHERE emis_code = ?",
    )
    .bind(emisCode)
    .first<{ currentDailyDemand: number }>();

  if (!current) {
    return NextResponse.json({ error: "School not found." }, { status: 404 });
  }

  if (current.currentDailyDemand === dailyDemand) {
    return NextResponse.json({ ok: true, unchanged: true });
  }

  const today = new Date().toISOString().slice(0, 10);
  const beforeJson = JSON.stringify({
    dailyDemand: current.currentDailyDemand,
  });
  const afterJson = JSON.stringify({ dailyDemand });

  await db.batch([
    db
      .prepare(
        `UPDATE schools
         SET current_daily_demand = ?, updated_at = CURRENT_TIMESTAMP
         WHERE emis_code = ?`,
      )
      .bind(dailyDemand, emisCode),
    db
      .prepare(
        `INSERT INTO school_demand_history
         (school_emis_code, previous_demand, new_demand, effective_from, reason, status, changed_by)
         VALUES (?, ?, ?, ?, ?, 'approved', ?)`,
      )
      .bind(
        emisCode,
        current.currentDailyDemand,
        dailyDemand,
        today,
        reason,
        actor,
      ),
    db
      .prepare(
        `INSERT INTO audit_logs
         (actor, action, entity_type, entity_id, before_json, after_json)
         VALUES (?, 'UPDATE_DAILY_DEMAND', 'school', ?, ?, ?)`,
      )
      .bind(actor, emisCode, beforeJson, afterJson),
  ]);

  return NextResponse.json({
    ok: true,
    emisCode,
    previousDemand: current.currentDailyDemand,
    dailyDemand,
  });
}
