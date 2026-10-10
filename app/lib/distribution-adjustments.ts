import { ensureDatabase } from "../../db/bootstrap";
import { formatDateDMY } from "./date-format";

const DISTRIBUTION_ITEM_CODES = ["bun", "egg", "banana"] as const;
export type DistributionItemCode = (typeof DISTRIBUTION_ITEM_CODES)[number];

const ITEM_FIELDS: Record<DistributionItemCode, { planned: string; received: string; shortage: string; excess: string; label: string }> = {
  bun: { planned: "planned_bread", received: "received_bread", shortage: "shortage_bread", excess: "excess_bread", label: "বনরুটি" },
  egg: { planned: "planned_egg", received: "received_egg", shortage: "shortage_egg", excess: "excess_egg", label: "সিদ্ধ ডিম" },
  banana: { planned: "planned_banana", received: "received_banana", shortage: "shortage_banana", excess: "excess_banana", label: "কলা" },
};

type DistributionReportRow = Record<string, unknown> & {
  id: number;
  date: string;
  school_emis_code: string;
  area_code: string;
  school_name?: string | null;
  status: string;
  reason: string;
};

type AdjustmentRow = {
  id: number;
  school_emis_code: string;
  plan_month: string;
  item_code: DistributionItemCode;
  shortage_report_id: number;
  excess_report_id: number;
  quantity: number;
  created_at: string;
  shortage_date?: string;
  excess_date?: string;
};

export type ResolutionItemRow = {
  id: number;
  report_id: number;
  action: string;
  item_code: DistributionItemCode;
  direction: "shortage" | "excess";
  quantity: number;
  created_by: string;
  note?: string | null;
  created_at: string;
};

export type ReportSubmissionRow = {
  id: number;
  report_id: number;
  submission_number: 1 | 2;
  received_bread: number;
  received_egg: number;
  received_banana: number;
  shortage_bread: number;
  shortage_egg: number;
  shortage_banana: number;
  excess_bread: number;
  excess_egg: number;
  excess_banana: number;
  problem_type: string;
  reason: string;
  comments?: string | null;
  submitted_by: string;
  submitted_at: string;
  authorization_action?: string | null;
  authorization_by?: string | null;
  authorization_at?: string | null;
};

function fallbackItemsForDate(date: string): DistributionItemCode[] {
  const day = new Date(`${date}T12:00:00+06:00`).getDay();
  if (day === 0 || day === 3 || day === 4) return ["bun", "egg"];
  if (day === 1) return ["bun"];
  if (day === 2) return ["banana"];
  return [];
}

export async function getScheduledDistributionItems(db: D1Database, date: string) {
  const row = await db.prepare(`SELECT d.items_json
    FROM meal_plan_periods p
    LEFT JOIN meal_plan_days d ON d.period_id = p.id AND d.plan_date = ?
    WHERE p.status = 'active' AND p.start_date <= ? AND p.end_date >= ?
    ORDER BY p.updated_at DESC, p.id DESC LIMIT 1`)
    .bind(date, date, date)
    .first<{ items_json: string | null }>();
  if (!row) return fallbackItemsForDate(date);
  try {
    const parsed = JSON.parse(row.items_json || "[]");
    return Array.isArray(parsed)
      ? parsed.map(String).filter((code): code is DistributionItemCode => DISTRIBUTION_ITEM_CODES.includes(code as DistributionItemCode))
      : [];
  } catch {
    return [];
  }
}

export async function autoConfirmDistributionReports(
  date: string,
  providedDb?: D1Database,
  schoolEmisCode?: string,
) {
  const db = providedDb || await ensureDatabase();
  const items = await getScheduledDistributionItems(db, date);
  if (items.length === 0) return { date, created: 0, skipped: 0, items };

  const schoolQuery = `SELECT s.emis_code, s.area_code, s.current_daily_demand,
      CASE WHEN r.id IS NULL THEN 0 ELSE 1 END AS has_report
    FROM schools s
    LEFT JOIN distribution_reports r
      ON r.date = ? AND r.school_emis_code = s.emis_code
    WHERE s.is_active = 1${schoolEmisCode ? " AND s.emis_code = ?" : ""}
    ORDER BY s.emis_code`;
  const schoolStatement = db.prepare(schoolQuery);
  const schoolResult = (schoolEmisCode
    ? await schoolStatement.bind(date, schoolEmisCode).all()
    : await schoolStatement.bind(date).all()) as D1Result<{
      emis_code: string;
      area_code: string;
      current_daily_demand: number;
      has_report: number;
    }>;
  const missingSchools = schoolResult.results.filter((school) => Number(school.has_report) === 0);
  const statements = missingSchools.map((school) => {
    const planned = Math.max(0, Math.floor(Number(school.current_daily_demand) || 0));
    const bread = items.includes("bun") ? planned : 0;
    const egg = items.includes("egg") ? planned : 0;
    const banana = items.includes("banana") ? planned : 0;
    return db.prepare(`INSERT OR IGNORE INTO distribution_reports (
      date, school_emis_code, area_code,
      planned_bread, planned_egg, planned_banana,
      received_bread, received_egg, received_banana,
      shortage_bread, shortage_egg, shortage_banana,
      excess_bread, excess_egg, excess_banana,
      status, problem_type, reason, comments, reported_by,
      confirmation_source, auto_confirmed_at, resolved_by, resolved_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 0, 0, 0, 0,
      'resolved', 'none', 'দুপুর ২টার মধ্যে কোনো সমস্যা রিপোর্ট করা হয়নি',
      'অটো-রিসিভড (২ টার পর)', 'System', 'system', CURRENT_TIMESTAMP, 'System', CURRENT_TIMESTAMP)`)
      .bind(date, school.emis_code, school.area_code, bread, egg, banana, bread, egg, banana);
  });

  const results = statements.length ? await db.batch(statements) : [];
  const created = results.reduce((total, result) => total + Number(result.meta?.changes || 0), 0);
  if (created > 0) {
    await db.prepare(`INSERT INTO audit_logs (actor, action, entity_type, entity_id, after_json)
      VALUES ('System', 'auto_confirm', 'distribution_day', ?, ?)`)
      .bind(date, JSON.stringify({ date, items, created, schools: schoolResult.results.length }))
      .run();
  }
  return { date, created, skipped: schoolResult.results.length - created, items };
}

function adjustmentKey(reportId: number, itemCode: DistributionItemCode) {
  return `${reportId}:${itemCode}`;
}

export async function reconcileSchoolMonthAdjustments(
  schoolEmisCode: string,
  date: string,
  providedDb?: D1Database,
) {
  const db = providedDb || await ensureDatabase();
  const month = date.slice(0, 7);
  const reportResult = await db.prepare(`SELECT r.*, s.name_bn AS school_name
    FROM distribution_reports r
    JOIN schools s ON s.emis_code = r.school_emis_code
    WHERE r.school_emis_code = ? AND substr(r.date, 1, 7) = ? AND r.status <> 'cancelled'
    ORDER BY r.date, r.id`)
    .bind(schoolEmisCode, month)
    .all<DistributionReportRow>();
  const adjustmentResult = await db.prepare(`SELECT * FROM distribution_adjustments
    WHERE school_emis_code = ? AND plan_month = ? ORDER BY id`)
    .bind(schoolEmisCode, month)
    .all<AdjustmentRow>();
  const resolutionResult = await db.prepare(`SELECT ri.* FROM distribution_resolution_items ri
    JOIN distribution_reports r ON r.id = ri.report_id
    WHERE r.school_emis_code = ? AND substr(r.date, 1, 7) = ? ORDER BY ri.id`)
    .bind(schoolEmisCode, month)
    .all<ResolutionItemRow>();

  const matchedShortage = new Map<string, number>();
  const matchedExcess = new Map<string, number>();
  for (const adjustment of adjustmentResult.results) {
    const shortageKey = adjustmentKey(adjustment.shortage_report_id, adjustment.item_code);
    const excessKey = adjustmentKey(adjustment.excess_report_id, adjustment.item_code);
    matchedShortage.set(shortageKey, (matchedShortage.get(shortageKey) || 0) + Number(adjustment.quantity));
    matchedExcess.set(excessKey, (matchedExcess.get(excessKey) || 0) + Number(adjustment.quantity));
  }
  for (const resolution of resolutionResult.results) {
    const key = adjustmentKey(resolution.report_id, resolution.item_code);
    const target = resolution.direction === "shortage" ? matchedShortage : matchedExcess;
    target.set(key, (target.get(key) || 0) + Number(resolution.quantity));
  }

  const shortageQueues = new Map<DistributionItemCode, Array<{ report: DistributionReportRow; remaining: number }>>(
    DISTRIBUTION_ITEM_CODES.map((code) => [code, []]),
  );
  const inserted: Array<{ shortage: DistributionReportRow; excess: DistributionReportRow; itemCode: DistributionItemCode; quantity: number }> = [];

  for (const report of reportResult.results) {
    if (!["new", "under_review", "partially_resolved"].includes(report.status)) continue;
    for (const itemCode of DISTRIBUTION_ITEM_CODES) {
      const fields = ITEM_FIELDS[itemCode];
      const shortageRemaining = Math.max(
        0,
        Number(report[fields.shortage] || 0) - (matchedShortage.get(adjustmentKey(report.id, itemCode)) || 0),
      );
      if (shortageRemaining > 0) shortageQueues.get(itemCode)?.push({ report, remaining: shortageRemaining });

      let excessRemaining = Math.max(
        0,
        Number(report[fields.excess] || 0) - (matchedExcess.get(adjustmentKey(report.id, itemCode)) || 0),
      );
      if (excessRemaining === 0) continue;

      const queue = shortageQueues.get(itemCode) || [];
      for (const shortage of queue) {
        if (excessRemaining === 0) break;
        if (shortage.remaining === 0 || shortage.report.date >= report.date) continue;
        const quantity = Math.min(shortage.remaining, excessRemaining);
        const result = await db.prepare(`INSERT OR IGNORE INTO distribution_adjustments
          (school_emis_code, plan_month, item_code, shortage_report_id, excess_report_id, quantity, created_by)
          VALUES (?, ?, ?, ?, ?, ?, 'System')`)
          .bind(schoolEmisCode, month, itemCode, shortage.report.id, report.id, quantity)
          .run();
        if (Number(result.meta?.changes || 0) === 0) continue;
        shortage.remaining -= quantity;
        excessRemaining -= quantity;
        const shortageKey = adjustmentKey(shortage.report.id, itemCode);
        const excessKey = adjustmentKey(report.id, itemCode);
        matchedShortage.set(shortageKey, (matchedShortage.get(shortageKey) || 0) + quantity);
        matchedExcess.set(excessKey, (matchedExcess.get(excessKey) || 0) + quantity);
        inserted.push({ shortage: shortage.report, excess: report, itemCode, quantity });
      }
    }
  }

  const newlyResolved: DistributionReportRow[] = [];
  for (const report of reportResult.results) {
    if (!["new", "under_review", "partially_resolved"].includes(report.status)) continue;
    let originalDifference = 0;
    let outstandingShortage = 0;
    let matched = 0;
    for (const itemCode of DISTRIBUTION_ITEM_CODES) {
      const fields = ITEM_FIELDS[itemCode];
      const shortage = Number(report[fields.shortage] || 0);
      const excess = Number(report[fields.excess] || 0);
      const shortageMatched = matchedShortage.get(adjustmentKey(report.id, itemCode)) || 0;
      const excessMatched = matchedExcess.get(adjustmentKey(report.id, itemCode)) || 0;
      originalDifference += shortage + excess;
      matched += shortageMatched + excessMatched;
      outstandingShortage += Math.max(0, shortage - shortageMatched);
    }
    if (originalDifference > 0 && outstandingShortage === 0) {
      const automaticResolution = matched > 0
        ? "মাসিক ঘাটতি সমন্বয়; অবশিষ্ট অতিরিক্ত প্রিন্টে বাদ"
        : "বরাদ্দবহির্ভূত অতিরিক্ত প্রিন্টে বাদ";
      await db.prepare(`UPDATE distribution_reports SET status = 'resolved',
        resolution_reason = ?,
        resolution_action = 'স্বয়ংক্রিয় মাসিক সমন্বয়', resolved_by = 'System',
        resolved_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?`)
        .bind(automaticResolution, report.id).run();
      newlyResolved.push(report);
    } else if (matched > 0 && outstandingShortage > 0) {
      await db.prepare(`UPDATE distribution_reports SET status = 'partially_resolved',
        resolution_action = 'পরবর্তী বিতরণে আংশিক সমন্বয়', updated_at = CURRENT_TIMESTAMP WHERE id = ?`)
        .bind(report.id).run();
    }
  }

  for (const report of newlyResolved) {
    await db.prepare(`UPDATE notifications SET is_read = 1
      WHERE area_code IS NULL AND type LIKE 'distribution_issue%' AND link LIKE ?`)
      .bind(`%date=${report.date}%school=${report.school_emis_code}%`).run();
    await db.prepare(`INSERT INTO notifications (type, title, message, link, area_code)
      VALUES ('distribution_issue_auto_resolved', 'মাসিক সমন্বয় সম্পন্ন', ?, ?, ?)`)
      .bind(
        `${formatDateDMY(report.date)} তারিখে ${report.school_name || report.school_emis_code} বিদ্যালয়ের মাসিক আইটেম সমন্বয় সম্পন্ন হয়েছে। অবশিষ্ট অতিরিক্ত প্রিন্ট হিসাবে অন্তর্ভুক্ত হয়নি।`,
        `/?date=${report.date}&school=${report.school_emis_code}#distribution-exceptions`,
        report.area_code,
      ).run();
  }

  if (inserted.length) {
    await db.prepare(`INSERT INTO audit_logs (actor, action, entity_type, entity_id, after_json)
      VALUES ('System', 'reconcile', 'distribution_month', ?, ?)`)
      .bind(`${schoolEmisCode}:${month}`, JSON.stringify(inserted.map((entry) => ({
        shortageReportId: entry.shortage.id,
        excessReportId: entry.excess.id,
        itemCode: entry.itemCode,
        quantity: entry.quantity,
      })))).run();
  }
  return { month, inserted: inserted.length, resolved: newlyResolved.length };
}

export async function decorateReportsWithAdjustments<T extends DistributionReportRow>(
  db: D1Database,
  reports: T[],
  month: string,
) : Promise<Array<T & Record<string, unknown> & { adjustments: AdjustmentRow[]; resolution_items: ResolutionItemRow[]; submissions: ReportSubmissionRow[] }>> {
  if (!reports.length || !/^\d{4}-\d{2}$/.test(month)) {
    return reports.map((report) => ({ ...report, adjustments: [], resolution_items: [], submissions: [] } as T & Record<string, unknown> & { adjustments: AdjustmentRow[]; resolution_items: ResolutionItemRow[]; submissions: ReportSubmissionRow[] }));
  }
  const result = await db.prepare(`SELECT a.*, shortage.date AS shortage_date, excess.date AS excess_date
    FROM distribution_adjustments a
    JOIN distribution_reports shortage ON shortage.id = a.shortage_report_id
    JOIN distribution_reports excess ON excess.id = a.excess_report_id
    WHERE a.plan_month = ? ORDER BY a.created_at, a.id`)
    .bind(month).all<AdjustmentRow>();
  const resolutionResult = await db.prepare(`SELECT ri.* FROM distribution_resolution_items ri
    JOIN distribution_reports r ON r.id = ri.report_id
    WHERE substr(r.date, 1, 7) = ? ORDER BY ri.created_at, ri.id`)
    .bind(month).all<ResolutionItemRow>();
  const submissionResult = await db.prepare(`SELECT rs.* FROM distribution_report_submissions rs
    JOIN distribution_reports r ON r.id = rs.report_id
    WHERE substr(r.date, 1, 7) = ? ORDER BY rs.report_id, rs.submission_number`)
    .bind(month).all<ReportSubmissionRow>();
  const byReport = new Map<number, AdjustmentRow[]>();
  const resolutionsByReport = new Map<number, ResolutionItemRow[]>();
  const submissionsByReport = new Map<number, ReportSubmissionRow[]>();
  for (const adjustment of result.results) {
    for (const id of [adjustment.shortage_report_id, adjustment.excess_report_id]) {
      const values = byReport.get(id) || [];
      values.push(adjustment);
      byReport.set(id, values);
    }
  }
  for (const resolution of resolutionResult.results) {
    const values = resolutionsByReport.get(resolution.report_id) || [];
    values.push(resolution);
    resolutionsByReport.set(resolution.report_id, values);
  }
  for (const submission of submissionResult.results) {
    const values = submissionsByReport.get(submission.report_id) || [];
    values.push(submission);
    submissionsByReport.set(submission.report_id, values);
  }
  return reports.map((report) => {
    const adjustments = byReport.get(report.id) || [];
    const resolutionItems = resolutionsByReport.get(report.id) || [];
    const submissions = submissionsByReport.get(report.id) || [];
    const totals: Record<string, number> = {};
    for (const itemCode of DISTRIBUTION_ITEM_CODES) {
      const fields = ITEM_FIELDS[itemCode];
      const settledShortage = adjustments
        .filter((item) => item.item_code === itemCode && item.shortage_report_id === report.id)
        .reduce((total, item) => total + Number(item.quantity), 0);
      const settledExcess = adjustments
        .filter((item) => item.item_code === itemCode && item.excess_report_id === report.id)
        .reduce((total, item) => total + Number(item.quantity), 0);
      const manuallySettledShortage = resolutionItems
        .filter((item) => item.item_code === itemCode && item.direction === "shortage")
        .reduce((total, item) => total + Number(item.quantity), 0);
      const manuallySettledExcess = resolutionItems
        .filter((item) => item.item_code === itemCode && item.direction === "excess")
        .reduce((total, item) => total + Number(item.quantity), 0);
      const totalSettledShortage = settledShortage + manuallySettledShortage;
      const totalSettledExcess = settledExcess + manuallySettledExcess;
      totals[`settled_shortage_${itemCode}`] = totalSettledShortage;
      totals[`settled_excess_${itemCode}`] = totalSettledExcess;
      totals[`outstanding_shortage_${itemCode}`] = Math.max(0, Number(report[fields.shortage] || 0) - totalSettledShortage);
      totals[`outstanding_excess_${itemCode}`] = Math.max(0, Number(report[fields.excess] || 0) - totalSettledExcess);
      // The official monthly form can never show more than the approved allocation.
      // Shortage settlements increase the affected day's printable receipt up to that
      // allocation; surplus remains in the audit trail but is excluded from the form.
      const received = Math.max(0, Number(report[fields.received] || 0));
      const inferredPlanned = Math.max(0, received + Number(report[fields.shortage] || 0) - Number(report[fields.excess] || 0));
      const planned = Math.max(0, Number(report[fields.planned] || inferredPlanned));
      totals[`effective_received_${itemCode}`] = Math.max(
        0,
        Math.min(planned, received + totalSettledShortage),
      );
    }
    return { ...report, ...totals, adjustments, resolution_items: resolutionItems, submissions } as T & Record<string, unknown> & { adjustments: AdjustmentRow[]; resolution_items: ResolutionItemRow[]; submissions: ReportSubmissionRow[] };
  });
}
