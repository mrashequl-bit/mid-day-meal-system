import { NextResponse } from "next/server";
import { ensureDatabase } from "../../../../db/bootstrap";
import { getAuthUser } from "../../../lib/auth";
import { getAreaManagerReportingWindow } from "../../../lib/distribution-reporting-window";
import { formatDateDMY } from "../../../lib/date-format";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: reportId } = await params;
    const data = await request.json() as any;
    const db = await ensureDatabase();
    
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
    } & Record<string, unknown>>();

    if (!existing) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    // Area Manager check
    if (authUser.role !== 'super_admin') {
      if (existing.area_code !== authUser.areaCode) {
        return NextResponse.json({ error: "Cannot update report for another area" }, { status: 403 });
      }

      if (!getAreaManagerReportingWindow(existing.date).canReport) {
        return NextResponse.json({ error: "এরিয়া ম্যানেজার শুধু বিতরণের দিন দুপুর ২টার আগে রিপোর্ট আপডেট করতে পারবেন।" }, { status: 403 });
      }
    }

    // Construct update query
    const updateFields: string[] = [];
    const bindValues: unknown[] = [];
    
    const allowedFields = [
      'receivedBread', 'receivedEgg', 'receivedBanana',
      'shortageBread', 'shortageEgg', 'shortageBanana',
      'excessBread', 'excessEgg', 'excessBanana',
      'problemType', 'reason', 'comments',
    ];
    if (authUser.role === "super_admin") allowedFields.push("status");

    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        const dbField = field.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
        updateFields.push(`${dbField} = ?`);
        bindValues.push(data[field]);
      }
    }

    if (updateFields.length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    
    // Add id for WHERE clause
    bindValues.push(reportId);

    const stmt = db.prepare(`
      UPDATE distribution_reports 
      SET ${updateFields.join(', ')}
      WHERE id = ?
    `);

    const result = await stmt.bind(...bindValues).run();

    if (result.success) {
      if (authUser.role !== 'super_admin') {
        await db.prepare(`
          INSERT INTO notifications (type, title, message, link, area_code)
          VALUES (?, ?, ?, ?, ?)
        `).bind(
          'distribution_issue_updated',
          'বিতরণ সমস্যা রিপোর্ট আপডেট',
          `${formatDateDMY(existing.date)} তারিখের একটি রিপোর্ট আপডেট করা হয়েছে।`,
          `/?area=${existing.area_code}&date=${existing.date}&status=new&school=${existing.school_emis_code}#distribution-exceptions`,
          null
        ).run();
      } else if (authUser.role === 'super_admin' && data.status === 'resolved') {
        await db.prepare(`
          INSERT INTO notifications (type, title, message, link, area_code)
          VALUES (?, ?, ?, ?, ?)
        `).bind(
          'distribution_issue_resolved',
          'বিতরণ সমস্যা সমাধান',
          `${formatDateDMY(existing.date)} তারিখে ${existing.school_name || existing.school_emis_code} স্কুলের বিতরণ সমস্যার সমাধান করা হয়েছে।`,
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
        'update',
        'distribution_report',
        reportId,
        JSON.stringify(existing),
        JSON.stringify(data)
      ).run();
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
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
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
