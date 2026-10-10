import { NextResponse } from "next/server";
import { ensureDatabase } from "../../../db/bootstrap";
import { requirePermission } from "../../lib/auth";
import { getAreaManagerReportingWindow } from "../../lib/distribution-reporting-window";
import { formatDateDMY } from "../../lib/date-format";
import { internalApiError } from "../../lib/api-errors";
import { buildDistributionIssueSummary } from "../../lib/distribution-notification";
import {
  autoConfirmDistributionReports,
  decorateReportsWithAdjustments,
  getScheduledDistributionItems,
  reconcileSchoolMonthAdjustments,
} from "../../lib/distribution-adjustments";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const ISO_MONTH = /^\d{4}-\d{2}$/;
const ADMIN_RESOLUTION_REASONS = new Set([
  "পরবর্তী বিতরণে সমন্বয়",
  "পুনরায় সরবরাহ",
  "ঘাটতি পূরণ",
  "নষ্ট পণ্য পরিবর্তন",
  "রিপোর্ট গ্রহণ করে সমাপ্ত",
  "রিপোর্ট ভুল / বাতিল",
  "অন্যান্য",
]);

function count(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? Math.floor(parsed) : 0;
}

export async function GET(request: Request) {
  try {
    const authUser = await requirePermission("distribution");
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const month = searchParams.get("month");
    const from = searchParams.get("from");
    const requestedAreaCode = searchParams.get("areaCode");
    const areaCode =
      authUser.role === "super_admin"
        ? requestedAreaCode
        : authUser.areaCode;
    const status = searchParams.get("status");

    if (month && !ISO_MONTH.test(month)) {
      return NextResponse.json({ error: "সঠিক রিপোর্টের মাস দিন।" }, { status: 400 });
    }
    if (date && !ISO_DATE.test(date)) {
      return NextResponse.json({ error: "সঠিক রিপোর্টের তারিখ দিন।" }, { status: 400 });
    }
    if (from && !ISO_DATE.test(from)) {
      return NextResponse.json({ error: "সঠিক শুরুর তারিখ দিন।" }, { status: 400 });
    }

    const db = await ensureDatabase();

    // Scheduled cron is authoritative. This catch-up keeps past/current reports complete
    // after an interrupted deployment without making page access the only trigger.
    if (date && ISO_DATE.test(date) && getAreaManagerReportingWindow(date).shouldAutoReceive) {
      await autoConfirmDistributionReports(date, db);
    }
    if (month && authUser.role === "tiffin_manager") {
      const [year, monthNumber] = month.split("-").map(Number);
      const daysInMonth = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();
      for (let day = 1; day <= daysInMonth; day += 1) {
        const reportDate = `${month}-${String(day).padStart(2, "0")}`;
        if (!getAreaManagerReportingWindow(reportDate).shouldAutoReceive) continue;
        await autoConfirmDistributionReports(reportDate, db, authUser.username);
      }
    }
    
    let query = `
      SELECT r.*, s.name_bn as school_name, a.name_bn as area_name 
      FROM distribution_reports r
      JOIN schools s ON r.school_emis_code = s.emis_code
      JOIN areas a ON r.area_code = a.code
      WHERE 1=1
    `;
    const params: any[] = [];

    if (date) {
      query += ` AND r.date = ?`;
      params.push(date);
    }
    if (month) {
      query += ` AND r.date LIKE ?`;
      params.push(`${month}-%`);
    }
    if (from) {
      query += ` AND r.date >= ?`;
      params.push(from);
    }
    
    if (authUser.role !== 'super_admin' && authUser.role !== 'tiffin_manager' && !areaCode) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (areaCode) {
      query += ` AND r.area_code = ?`;
      params.push(areaCode);
    }
    if (authUser.role === "tiffin_manager") {
      query += ` AND r.school_emis_code = ?`;
      params.push(authUser.username);
    }
    
    if (status) {
      query += ` AND r.status = ?`;
      params.push(status);
    }
    
    query += ` ORDER BY r.created_at DESC`;

    const stmt = db.prepare(query);
    const results = params.length > 0 ? await stmt.bind(...params).all() : await stmt.all();
    const reportMonth = month || date?.slice(0, 7) || "";
    const reports = await decorateReportsWithAdjustments(db, results.results as any[], reportMonth);

    return NextResponse.json({ reports });
  } catch (error) {
    return internalApiError("distribution-reports.list", error, "বিতরণ রিপোর্ট পাওয়া যায়নি।");
  }
}

export async function POST(request: Request) {
  try {
    const authUser = await requirePermission("distribution", true);
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json() as any;
    const db = await ensureDatabase();
    if (!ISO_DATE.test(String(data.date || ""))) {
      return NextResponse.json({ error: "সঠিক রিপোর্টের তারিখ দিন।" }, { status: 400 });
    }
    const school = await db
      .prepare("SELECT area_code, current_daily_demand FROM schools WHERE emis_code = ? AND is_active = 1")
      .bind(data.schoolEmisCode)
      .first<{ area_code: string; current_daily_demand: number }>();
    if (!school) {
      return NextResponse.json({ error: "School not found" }, { status: 404 });
    }
    if (authUser.role === "tiffin_manager" && data.schoolEmisCode !== authUser.username) {
      return NextResponse.json({ error: "নিজের বিদ্যালয় ছাড়া অন্য বিদ্যালয়ের রিপোর্ট করা যাবে না।" }, { status: 403 });
    }
    if (authUser.role !== "super_admin" && school.area_code !== authUser.areaCode) {
      return NextResponse.json({ error: "নিজের নির্ধারিত বিদ্যালয় বা অঞ্চলের বাইরে রিপোর্ট করা যাবে না।" }, { status: 403 });
    }
    if (school.area_code !== data.areaCode) {
      return NextResponse.json(
        { error: "School does not belong to the selected area" },
        { status: 403 },
      );
    }

    if (authUser.role !== "super_admin") {
      const reportingWindow = getAreaManagerReportingWindow(data.date);
      if (!reportingWindow.canReport) {
        const roleName = authUser.role === "tiffin_manager" ? "টিফিন ম্যানেজার" : "এরিয়া ম্যানেজার";
        return NextResponse.json({ error: `${roleName} শুধু বিতরণের দিন দুপুর ২টার আগে রিপোর্ট করতে পারবেন।` }, { status: 403 });
      }
      const scheduledItems = await getScheduledDistributionItems(db, data.date);
      if (scheduledItems.length === 0) {
        return NextResponse.json({ error: "এই তারিখে কোনো আইটেম বিতরণ নির্ধারিত নেই।" }, { status: 403 });
      }
      const planned = count(school.current_daily_demand);
      const received = {
        bun: scheduledItems.includes("bun") ? count(data.receivedBread) : 0,
        egg: scheduledItems.includes("egg") ? count(data.receivedEgg) : 0,
        banana: scheduledItems.includes("banana") ? count(data.receivedBanana) : 0,
      };
      data.areaCode = school.area_code;
      data.plannedBread = scheduledItems.includes("bun") ? planned : 0;
      data.plannedEgg = scheduledItems.includes("egg") ? planned : 0;
      data.plannedBanana = scheduledItems.includes("banana") ? planned : 0;
      data.receivedBread = received.bun;
      data.receivedEgg = received.egg;
      data.receivedBanana = received.banana;
      data.shortageBread = Math.max(0, data.plannedBread - received.bun);
      data.shortageEgg = Math.max(0, data.plannedEgg - received.egg);
      data.shortageBanana = Math.max(0, data.plannedBanana - received.banana);
      data.excessBread = Math.max(0, received.bun - data.plannedBread);
      data.excessEgg = Math.max(0, received.egg - data.plannedEgg);
      data.excessBanana = Math.max(0, received.banana - data.plannedBanana);
    }

    if (authUser.role === "super_admin" && ["resolved", "under_review"].includes(String(data.status)) && !ADMIN_RESOLUTION_REASONS.has(String(data.resolutionReason || ""))) {
      return NextResponse.json({ error: "সমন্বয়ের সঠিক কারণ নির্বাচন করুন।" }, { status: 400 });
    }
    if (authUser.role === "super_admin" && ["অন্যান্য", "রিপোর্ট ভুল / বাতিল"].includes(String(data.resolutionReason)) && !String(data.comments || "").trim()) {
      return NextResponse.json({ error: "নির্বাচিত ব্যবস্থার বিস্তারিত মন্তব্য লিখুন।" }, { status: 400 });
    }
    if (authUser.role === "super_admin" && !["অন্যান্য", "রিপোর্ট ভুল / বাতিল"].includes(String(data.resolutionReason))) {
      data.comments = null;
    }
    const nextStatus = authUser.role === "super_admin"
      ? String(data.status || "new")
      : data.problemType === "none" ? "resolved" : "new";

    // Upsert logic (if a report for this school+date exists, it updates it, otherwise inserts)
    // First, check if exists
    const existing = await db.prepare(
      `SELECT id, area_code, manager_submission_count, manager_reopen_allowed
       FROM distribution_reports WHERE date = ? AND school_emis_code = ?`
    ).bind(data.date, data.schoolEmisCode).first<{
      id: number;
      area_code: string;
      manager_submission_count: number;
      manager_reopen_allowed: number;
    }>();

    if (existing) {
      if (authUser.role === "tiffin_manager") {
        return NextResponse.json({
          error: existing.manager_reopen_allowed === 1 && Number(existing.manager_submission_count) < 2
            ? "অনুমোদিত দ্বিতীয় রিপোর্টটি বিদ্যমান রিপোর্টের মাধ্যমে জমা দিন।"
            : "এই দিনের রিপোর্ট ইতোমধ্যে জমা হয়েছে। সুপার অ্যাডমিন অনুমোদন ছাড়া এটি সম্পাদনা করা যাবে না।",
        }, { status: 409 });
      }
      if (existing.area_code !== data.areaCode) {
        return NextResponse.json(
          { error: "Report area does not match the selected area" },
          { status: 409 },
        );
      }
      const stmt = db.prepare(`
        UPDATE distribution_reports SET
          planned_bread = ?, planned_egg = ?, planned_banana = ?,
          received_bread = ?, received_egg = ?, received_banana = ?,
          shortage_bread = ?, shortage_egg = ?, shortage_banana = ?,
          excess_bread = ?, excess_egg = ?, excess_banana = ?,
          problem_type = ?, reason = ?, resolution_reason = ?, resolution_action = ?,
          resolution_note = ?, resolved_by = ?, resolved_at = ?,
          comments = ?, status = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `);
      const result = await stmt.bind(
        data.plannedBread || 0, data.plannedEgg || 0, data.plannedBanana || 0,
        data.receivedBread || 0, data.receivedEgg || 0, data.receivedBanana || 0,
        data.shortageBread || 0, data.shortageEgg || 0, data.shortageBanana || 0,
        data.excessBread || 0, data.excessEgg || 0, data.excessBanana || 0,
        data.problemType, data.reason, authUser.role === "super_admin" ? data.resolutionReason || null : null,
        authUser.role === "super_admin" ? data.resolutionReason || null : null,
        authUser.role === "super_admin" ? data.comments || null : null,
        authUser.role === "super_admin" && nextStatus === "resolved" ? authUser.name || authUser.username : null,
        authUser.role === "super_admin" && nextStatus === "resolved" ? new Date().toISOString() : null,
        data.comments || null,
        nextStatus, existing.id
      ).run();

      if (result.success) {
        await reconcileSchoolMonthAdjustments(data.schoolEmisCode, data.date, db);
        return NextResponse.json({ success: true, id: existing.id });
      } else {
        return NextResponse.json({ error: "Failed to update existing report" }, { status: 500 });
      }
    }

    // Insert new
    const stmt = db.prepare(`
      INSERT INTO distribution_reports (
        date, school_emis_code, area_code, 
        planned_bread, planned_egg, planned_banana,
        received_bread, received_egg, received_banana,
        shortage_bread, shortage_egg, shortage_banana,
        excess_bread, excess_egg, excess_banana,
        problem_type, reason, resolution_reason, resolution_action, resolution_note,
        resolved_by, resolved_at, confirmation_source, comments, status, reported_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertStatement = stmt.bind(
      data.date, data.schoolEmisCode, data.areaCode,
      data.plannedBread || 0, data.plannedEgg || 0, data.plannedBanana || 0,
      data.receivedBread || 0, data.receivedEgg || 0, data.receivedBanana || 0,
      data.shortageBread || 0, data.shortageEgg || 0, data.shortageBanana || 0,
      data.excessBread || 0, data.excessEgg || 0, data.excessBanana || 0,
      data.problemType, data.reason, authUser.role === "super_admin" ? data.resolutionReason || null : null,
      authUser.role === "super_admin" ? data.resolutionReason || null : null,
      authUser.role === "super_admin" ? data.comments || null : null,
      authUser.role === "super_admin" ? authUser.name || authUser.username : null,
      authUser.role === "super_admin" && nextStatus === "resolved" ? new Date().toISOString() : null,
      authUser.role === "super_admin" ? "admin" : "manager",
      data.comments || null,
      nextStatus, authUser.name || 'Unknown Manager'
    );
    const submissionStatement = db.prepare(`INSERT INTO distribution_report_submissions (
        report_id, submission_number,
        received_bread, received_egg, received_banana,
        shortage_bread, shortage_egg, shortage_banana,
        excess_bread, excess_egg, excess_banana,
        problem_type, reason, comments, submitted_by
      )
      SELECT id, 1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
      FROM distribution_reports WHERE date = ? AND school_emis_code = ?`)
      .bind(
        data.receivedBread || 0, data.receivedEgg || 0, data.receivedBanana || 0,
        data.shortageBread || 0, data.shortageEgg || 0, data.shortageBanana || 0,
        data.excessBread || 0, data.excessEgg || 0, data.excessBanana || 0,
        data.problemType, data.reason, data.comments || null,
        authUser.name || "Unknown Manager", data.date, data.schoolEmisCode,
      );
    const [result] = await db.batch([insertStatement, submissionStatement]);

    if (result.success) {
      if (authUser.role !== 'super_admin' && nextStatus === 'new') {
        // Create Notification for Super Admin
        const schoolRow = await db.prepare(`SELECT name_bn FROM schools WHERE emis_code = ?`).bind(data.schoolEmisCode).first() as { name_bn?: string } | null;
        const issueSummary = buildDistributionIssueSummary({
          plannedBread: data.plannedBread,
          plannedEgg: data.plannedEgg,
          plannedBanana: data.plannedBanana,
          receivedBread: data.receivedBread,
          receivedEgg: data.receivedEgg,
          receivedBanana: data.receivedBanana,
        });
        await db.prepare(`
          INSERT INTO notifications (type, title, message, link, area_code)
          VALUES (?, ?, ?, ?, ?)
        `).bind(
          'distribution_issue',
          'বিতরণ সমস্যা',
          `${formatDateDMY(data.date)} তারিখে ${schoolRow?.name_bn || data.schoolEmisCode} বিদ্যালয়: ${issueSummary}। কারণ: ${String(data.reason || 'উল্লেখ নেই')}`,
          `/?area=${data.areaCode}&date=${data.date}&status=new&school=${data.schoolEmisCode}#distribution-exceptions`,
          null
        ).run();
      } else if (authUser.role === 'super_admin' && nextStatus === 'resolved') {
        // Create Notification for Area Manager
        const schoolRow = await db.prepare(`SELECT name_bn FROM schools WHERE emis_code = ?`).bind(data.schoolEmisCode).first();
        const schoolName = schoolRow ? (schoolRow.name_bn || data.schoolEmisCode) : data.schoolEmisCode;
        
        await db.prepare(`UPDATE notifications SET is_read = 1 WHERE area_code IS NULL AND type LIKE 'distribution_issue%' AND link LIKE ?`).bind(`%date=${data.date}%school=${data.schoolEmisCode}%`).run();
        await db.prepare(`
          INSERT INTO notifications (type, title, message, link, area_code)
          VALUES (?, ?, ?, ?, ?)
        `).bind(
          'distribution_issue_resolved',
          'বিতরণ সমস্যা সমাধান',
          `${formatDateDMY(data.date)} তারিখে ${schoolName} বিদ্যালয়ের বিতরণ সমন্বয় সম্পন্ন হয়েছে। কারণ: ${String(data.resolutionReason)}`,
          `/?date=${data.date}&school=${data.schoolEmisCode}#distribution-exceptions`,
          data.areaCode
        ).run();
      }
      
      // Also write to audit_logs
      await db.prepare(`
        INSERT INTO audit_logs (actor, action, entity_type, entity_id, after_json)
        VALUES (?, ?, ?, ?, ?)
      `).bind(
        authUser.name || 'System',
        'create',
        'distribution_report',
        String(result.meta.last_row_id),
        JSON.stringify(data)
      ).run();
      await reconcileSchoolMonthAdjustments(data.schoolEmisCode, data.date, db);
    }

    return NextResponse.json({ success: true, id: result.meta.last_row_id });
  } catch (error) {
    return internalApiError("distribution-reports.create", error, "বিতরণ রিপোর্ট সংরক্ষণ করা যায়নি।");
  }
}
