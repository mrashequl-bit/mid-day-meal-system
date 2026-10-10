import { NextResponse } from "next/server";
import { ensureDatabase } from "../../../../db/bootstrap";
import { requirePermission, getAuthUser } from "../../../lib/auth";
import { getAreaManagerReportingWindow } from "../../../lib/distribution-reporting-window";
import { formatDateDMY } from "../../../lib/date-format";
import { internalApiError } from "../../../lib/api-errors";
import { buildDistributionIssueSummary } from "../../../lib/distribution-notification";
import { decorateReportsWithAdjustments, reconcileSchoolMonthAdjustments } from "../../../lib/distribution-adjustments";

const ADMIN_RESOLUTION_REASONS = new Set([
  "পরবর্তী বিতরণে সমন্বয়", "পুনরায় সরবরাহ", "ঘাটতি পূরণ",
  "নষ্ট পণ্য পরিবর্তন", "রিপোর্ট গ্রহণ করে সমাপ্ত", "রিপোর্ট ভুল / বাতিল", "অন্যান্য",
]);
const QUANTITY_RESOLUTION_DIRECTIONS = new Map<string, "shortage">([
  ["পুনরায় সরবরাহ", "shortage"],
  ["ঘাটতি পূরণ", "shortage"],
  ["নষ্ট পণ্য পরিবর্তন", "shortage"],
] as const);
const RESOLUTION_ITEM_CODES = ["bun", "egg", "banana"] as const;
const MANAGER_REOPEN_ACTIONS = new Set(["পুনরায় সরবরাহ", "নষ্ট পণ্য পরিবর্তন"]);

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await requirePermission("distribution", true);
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: reportId } = await params;
    const data = await request.json() as any;
    const db = await ensureDatabase();

    if (authUser.role === "super_admin" && !ADMIN_RESOLUTION_REASONS.has(String(data.resolutionReason || ""))) {
      return NextResponse.json({ error: "সমন্বয়ের সঠিক কারণ নির্বাচন করুন।" }, { status: 400 });
    }
    if (authUser.role === "super_admin" && ["অন্যান্য", "রিপোর্ট ভুল / বাতিল"].includes(String(data.resolutionReason)) && !String(data.comments || "").trim()) {
      return NextResponse.json({ error: "নির্বাচিত ব্যবস্থার বিস্তারিত মন্তব্য লিখুন।" }, { status: 400 });
    }
    // Fetch existing report
    const existing = await db.prepare(
      `SELECT r.*, s.name_bn as school_name 
       FROM distribution_reports r
       LEFT JOIN schools s ON r.school_emis_code = s.emis_code
       WHERE r.id = ?`
    ).bind(reportId).first<{
      area_code: string;
      date: string;
      school_emis_code: string;
      school_name: string | null;
      status: string;
      planned_bread: number;
      planned_egg: number;
      planned_banana: number;
      received_bread: number;
      received_egg: number;
      received_banana: number;
      confirmation_source: string;
      manager_submission_count: number;
      manager_reopen_allowed: number;
      manager_reopen_action: string | null;
      manager_reopen_authorized_by: string | null;
      manager_reopen_authorized_at: string | null;
    } & Record<string, unknown>>();

    if (!existing) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    const resolutionStatements: D1PreparedStatement[] = [];
    const submissionStatements: D1PreparedStatement[] = [];
    let managerReopenGranted = false;
    if (authUser.role === "super_admin") {
      if (!["new", "under_review", "partially_resolved"].includes(existing.status)) {
        return NextResponse.json({ error: "এই রিপোর্টটি ইতোমধ্যে সমাধান করা হয়েছে।" }, { status: 409 });
      }
      const action = String(data.resolutionReason || "");
      const direction = QUANTITY_RESOLUTION_DIRECTIONS.get(action);
      data.resolutionAction = action;
      const needsComment = ["অন্যান্য", "রিপোর্ট ভুল / বাতিল"].includes(action);
      data.comments = needsComment ? String(data.comments || "").trim() : null;
      data.resolutionNote = needsComment ? data.comments : null;

      if (direction) {
        const [decorated] = await decorateReportsWithAdjustments(db, [existing as any], existing.date.slice(0, 7));
        const selectedItemCode = String(data.resolutionItemCode || "");
        if (!RESOLUTION_ITEM_CODES.includes(selectedItemCode as typeof RESOLUTION_ITEM_CODES[number])) {
          return NextResponse.json({ error: "সমন্বয়ের জন্য একটি নির্দিষ্ট আইটেম নির্বাচন করুন।" }, { status: 400 });
        }
        let appliedQuantity = 0;
        let totalOutstanding = 0;
        for (const itemCode of RESOLUTION_ITEM_CODES) {
          totalOutstanding += Number(decorated[`outstanding_shortage_${itemCode}`] || 0);
        }
        const itemCode = selectedItemCode as typeof RESOLUTION_ITEM_CODES[number];
        const maximum = Number(decorated[`outstanding_${direction}_${itemCode}`] || 0);
        const quantity = Math.max(0, Math.floor(Number(data.resolutionItems?.[itemCode]) || 0));
        if (quantity > maximum) {
          const itemLabel = itemCode === "bun" ? "বনরুটি" : itemCode === "egg" ? "সিদ্ধ ডিম" : "কলা";
          return NextResponse.json({ error: `${itemLabel} সমন্বয়ের পরিমাণ বর্তমান বকেয়ার চেয়ে বেশি হতে পারবে না।` }, { status: 400 });
        }
        if (quantity > 0) {
          appliedQuantity = quantity;
          resolutionStatements.push(db.prepare(`INSERT INTO distribution_resolution_items
            (report_id, action, item_code, direction, quantity, created_by, note)
            VALUES (?, ?, ?, ?, ?, ?, ?)`)
            .bind(reportId, action, itemCode, direction, quantity, authUser.name || authUser.username, data.resolutionNote));
        }
        if (appliedQuantity === 0) {
          return NextResponse.json({ error: "সমন্বয় করা আইটেমের সংখ্যা লিখুন।" }, { status: 400 });
        }
        data.status = Math.max(0, totalOutstanding - appliedQuantity) === 0 ? "resolved" : "partially_resolved";
      } else if (action === "পরবর্তী বিতরণে সমন্বয়") {
        data.status = "under_review";
      } else if (action === "রিপোর্ট ভুল / বাতিল") {
        data.status = "cancelled";
      } else {
        data.status = "resolved";
      }
      data.resolvedBy = data.status === "resolved" || data.status === "cancelled" ? authUser.name || authUser.username : null;
      data.resolvedAt = data.status === "resolved" || data.status === "cancelled" ? new Date().toISOString() : null;
      managerReopenGranted = MANAGER_REOPEN_ACTIONS.has(action)
        && existing.confirmation_source === "manager"
        && Number(existing.manager_submission_count || 1) < 2
        && getAreaManagerReportingWindow(existing.date).canReport;
    }

    // Non-admin users are restricted by reporting window and assigned scope.
    if (authUser.role !== 'super_admin') {
      if (authUser.role === 'tiffin_manager' && existing.school_emis_code !== authUser.username) {
        return NextResponse.json({ error: "নিজের বিদ্যালয় ছাড়া অন্য বিদ্যালয়ের রিপোর্ট আপডেট করা যাবে না।" }, { status: 403 });
      }
      if (existing.area_code !== authUser.areaCode) {
        return NextResponse.json({ error: "নিজের নির্ধারিত বিদ্যালয় বা অঞ্চলের বাইরে রিপোর্ট আপডেট করা যাবে না।" }, { status: 403 });
      }

      if (authUser.role === "tiffin_manager") {
        if (existing.confirmation_source !== "manager") {
          return NextResponse.json({ error: "এই রিপোর্টটি টিফিন ম্যানেজারের জমা দেওয়া রিপোর্ট নয়।" }, { status: 409 });
        }
        if (Number(existing.manager_submission_count || 1) >= 2) {
          return NextResponse.json({ error: "এই দিনের অনুমোদিত দ্বিতীয় রিপোর্ট ইতোমধ্যে জমা হয়েছে। আর সম্পাদনা করা যাবে না।" }, { status: 409 });
        }
        if (Number(existing.manager_reopen_allowed || 0) !== 1 || !MANAGER_REOPEN_ACTIONS.has(String(existing.manager_reopen_action || ""))) {
          return NextResponse.json({ error: "এই দিনের রিপোর্ট ইতোমধ্যে জমা হয়েছে। সুপার অ্যাডমিন অনুমোদন ছাড়া এটি সম্পাদনা করা যাবে না।" }, { status: 409 });
        }
      }

      if (!getAreaManagerReportingWindow(existing.date).canReport) {
        const roleName = authUser.role === "tiffin_manager" ? "টিফিন ম্যানেজার" : "এরিয়া ম্যানেজার";
        return NextResponse.json({ error: `${roleName} শুধু বিতরণের দিন দুপুর ২টার আগে রিপোর্ট আপডেট করতে পারবেন।` }, { status: 403 });
      }
    }

    // Construct update query
    const updateFields: string[] = [];
    const bindValues: unknown[] = [];
    if (authUser.role !== "super_admin") {
      for (const field of ['receivedBread', 'receivedEgg', 'receivedBanana']) {
        if (data[field] !== undefined) data[field] = Math.max(0, Math.floor(Number(data[field]) || 0));
      }
    }
    
    const allowedFields = authUser.role === "super_admin" ? [
      'resolutionReason', 'resolutionAction', 'resolutionNote',
      'resolvedBy', 'resolvedAt',
    ] : ['receivedBread', 'receivedEgg', 'receivedBanana', 'problemType', 'reason', 'comments'];
    if (authUser.role === "super_admin") allowedFields.push("status");

    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        const dbField = field.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
        updateFields.push(`${dbField} = ?`);
        bindValues.push(data[field]);
      }
    }

    if (authUser.role === "super_admin" && managerReopenGranted) {
      updateFields.push(
        "manager_reopen_allowed = 1",
        "manager_reopen_action = ?",
        "manager_reopen_authorized_by = ?",
        "manager_reopen_authorized_at = CURRENT_TIMESTAMP",
        "manager_reopen_used_at = NULL",
      );
      bindValues.push(data.resolutionAction, authUser.name || authUser.username);
    }

    if (updateFields.length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    if (authUser.role !== "super_admin") {
      const receivedBread = data.receivedBread === undefined ? Number(existing.received_bread) : data.receivedBread;
      const receivedEgg = data.receivedEgg === undefined ? Number(existing.received_egg) : data.receivedEgg;
      const receivedBanana = data.receivedBanana === undefined ? Number(existing.received_banana) : data.receivedBanana;
      updateFields.push('shortage_bread = ?', 'shortage_egg = ?', 'shortage_banana = ?');
      bindValues.push(
        Math.max(0, Number(existing.planned_bread) - receivedBread),
        Math.max(0, Number(existing.planned_egg) - receivedEgg),
        Math.max(0, Number(existing.planned_banana) - receivedBanana),
      );
      const excessBread = Math.max(0, receivedBread - Number(existing.planned_bread));
      const excessEgg = Math.max(0, receivedEgg - Number(existing.planned_egg));
      const excessBanana = Math.max(0, receivedBanana - Number(existing.planned_banana));
      const hasDifference = [
        Math.max(0, Number(existing.planned_bread) - receivedBread),
        Math.max(0, Number(existing.planned_egg) - receivedEgg),
        Math.max(0, Number(existing.planned_banana) - receivedBanana),
        excessBread,
        excessEgg,
        excessBanana,
      ].some((value) => value > 0);
      updateFields.push('excess_bread = ?', 'excess_egg = ?', 'excess_banana = ?', 'status = ?', 'resolution_reason = NULL');
      bindValues.push(
        excessBread,
        excessEgg,
        excessBanana,
        hasDifference ? 'new' : 'resolved',
      );

      if (authUser.role === "tiffin_manager") {
        submissionStatements.push(
          db.prepare(`INSERT OR IGNORE INTO distribution_report_submissions (
              report_id, submission_number,
              received_bread, received_egg, received_banana,
              shortage_bread, shortage_egg, shortage_banana,
              excess_bread, excess_egg, excess_banana,
              problem_type, reason, comments, submitted_by, submitted_at
            )
            SELECT id, 1,
              received_bread, received_egg, received_banana,
              shortage_bread, shortage_egg, shortage_banana,
              excess_bread, excess_egg, excess_banana,
              problem_type, reason, comments, reported_by, created_at
            FROM distribution_reports WHERE id = ?`)
            .bind(reportId),
          db.prepare(`INSERT INTO distribution_report_submissions (
              report_id, submission_number,
              received_bread, received_egg, received_banana,
              shortage_bread, shortage_egg, shortage_banana,
              excess_bread, excess_egg, excess_banana,
              problem_type, reason, comments, submitted_by,
              authorization_action, authorization_by, authorization_at
            ) VALUES (?, 2, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
            .bind(
              reportId,
              receivedBread, receivedEgg, receivedBanana,
              Math.max(0, Number(existing.planned_bread) - receivedBread),
              Math.max(0, Number(existing.planned_egg) - receivedEgg),
              Math.max(0, Number(existing.planned_banana) - receivedBanana),
              excessBread, excessEgg, excessBanana,
              data.problemType, data.reason, data.comments || null,
              authUser.name || authUser.username,
              existing.manager_reopen_action,
              existing.manager_reopen_authorized_by,
              existing.manager_reopen_authorized_at,
            ),
        );
        updateFields.push(
          "manager_submission_count = 2",
          "manager_reopen_allowed = 0",
          "manager_reopen_used_at = CURRENT_TIMESTAMP",
        );
      }
    }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    
    // Add id for WHERE clause
    bindValues.push(reportId);

    const stmt = db.prepare(`
      UPDATE distribution_reports 
      SET ${updateFields.join(', ')}
      WHERE id = ?
    `);

    const updateStatement = stmt.bind(...bindValues);
    const batchedStatements = [...resolutionStatements, ...submissionStatements];
    const result = batchedStatements.length
      ? (await db.batch([...batchedStatements, updateStatement])).at(-1)!
      : await updateStatement.run();

    if (result.success) {
      const updatedHasIssue = authUser.role !== 'super_admin' && [
        Number(data.receivedBread ?? existing.received_bread) - Number(existing.planned_bread),
        Number(data.receivedEgg ?? existing.received_egg) - Number(existing.planned_egg),
        Number(data.receivedBanana ?? existing.received_banana) - Number(existing.planned_banana),
      ].some((difference) => difference !== 0);
      if (updatedHasIssue) {
        const issueSummary = buildDistributionIssueSummary({
          plannedBread: existing.planned_bread,
          plannedEgg: existing.planned_egg,
          plannedBanana: existing.planned_banana,
          receivedBread: data.receivedBread ?? existing.received_bread,
          receivedEgg: data.receivedEgg ?? existing.received_egg,
          receivedBanana: data.receivedBanana ?? existing.received_banana,
        });
        await db.prepare(`
          INSERT INTO notifications (type, title, message, link, area_code)
          VALUES (?, ?, ?, ?, ?)
        `).bind(
          'distribution_issue_updated',
          'বিতরণ সমস্যা রিপোর্ট আপডেট',
          `${formatDateDMY(existing.date)} তারিখে ${existing.school_name || existing.school_emis_code} বিদ্যালয়: ${issueSummary}। কারণ: ${String(data.reason || existing.reason || 'উল্লেখ নেই')}`,
          `/?area=${existing.area_code}&date=${existing.date}&status=new&school=${existing.school_emis_code}#distribution-exceptions`,
          null
        ).run();
      } else if (authUser.role === 'super_admin' && data.status === 'resolved') {
        await db.prepare(`UPDATE notifications SET is_read = 1 WHERE area_code IS NULL AND type LIKE 'distribution_issue%' AND link LIKE ?`).bind(`%date=${existing.date}%school=${existing.school_emis_code}%`).run();
        await db.prepare(`
          INSERT INTO notifications (type, title, message, link, area_code)
          VALUES (?, ?, ?, ?, ?)
        `).bind(
          'distribution_issue_resolved',
          'বিতরণ সমস্যা সমাধান',
          `${formatDateDMY(existing.date)} তারিখে ${existing.school_name || existing.school_emis_code} বিদ্যালয়ের বিতরণ সমন্বয় সম্পন্ন হয়েছে। কারণ: ${String(data.resolutionReason)}`,
          `/?date=${existing.date}&school=${existing.school_emis_code}#distribution-exceptions`,
          existing.area_code
        ).run();
      }

      // Write to audit_logs
      await db.prepare(`
        INSERT INTO audit_logs (actor, action, entity_type, entity_id, before_json, after_json)
        VALUES (?, ?, ?, ?, ?, ?)
      `).bind(
        authUser.name || 'System',
        authUser.role === "tiffin_manager" ? 'manager_resubmit' : 'update',
        'distribution_report',
        reportId,
        JSON.stringify(existing),
        JSON.stringify(data)
      ).run();
      await reconcileSchoolMonthAdjustments(existing.school_emis_code, existing.date, db);
    }

    return NextResponse.json({ success: true, managerReopenGranted });
  } catch (error) {
    return internalApiError("distribution-reports.update", error, "বিতরণ রিপোর্ট আপডেট করা যায়নি।");
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await getAuthUser();
    if (!authUser || authUser.role !== 'super_admin') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: reportId } = await params;
    const db = await ensureDatabase();
    
    const existing = await db.prepare(
      `SELECT * FROM distribution_reports WHERE id = ?`
    ).bind(reportId).first();

    if (!existing) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    // Soft delete
    const result = await db.prepare(`
      UPDATE distribution_reports SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP WHERE id = ?
    `).bind(reportId).run();

    if (result.success) {
      await db.prepare(`
        INSERT INTO audit_logs (actor, action, entity_type, entity_id, before_json, after_json)
        VALUES (?, ?, ?, ?, ?, ?)
      `).bind(
        authUser.name || 'System',
        'delete',
        'distribution_report',
        reportId,
        JSON.stringify(existing),
        JSON.stringify({ status: 'cancelled' })
      ).run();
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return internalApiError("distribution-reports.delete", error, "বিতরণ রিপোর্ট বাতিল করা যায়নি।");
  }
}
