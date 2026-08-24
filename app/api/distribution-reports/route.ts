import { NextResponse } from "next/server";
import { ensureDatabase } from "../../../db/bootstrap";
import { getAuthUser } from "../../lib/auth";
import { getAreaManagerReportingWindow } from "../../lib/distribution-reporting-window";
import { formatDateDMY } from "../../lib/date-format";

export async function GET(request: Request) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const requestedAreaCode = searchParams.get("areaCode");
    const areaCode =
      authUser.role === "super_admin"
        ? requestedAreaCode
        : authUser.areaCode;
    const status = searchParams.get("status");

    const db = await ensureDatabase();

    if (date && getAreaManagerReportingWindow(date).shouldAutoReceive) {
      const d = new Date(date);
      const dayOfWeek = !isNaN(d.getTime()) ? d.getDay() : -1;
      let showBread = false, showEgg = false, showBanana = false;
      if (dayOfWeek === 0 || dayOfWeek === 3 || dayOfWeek === 4) { showBread = showEgg = true; }
      else if (dayOfWeek === 1) { showBread = true; }
      else if (dayOfWeek === 2) { showBanana = true; }

      if (showBread || showEgg || showBanana) {
        let schoolQuery = `SELECT emis_code, area_code, current_daily_demand FROM schools`;
        const schoolParams: string[] = [];
        if (authUser.role !== 'super_admin' && !areaCode) {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
        if (areaCode) {
          schoolQuery += ` WHERE area_code = ?`;
          schoolParams.push(areaCode);
        }

        const schools = schoolParams.length > 0 ? await db.prepare(schoolQuery).bind(...schoolParams).all() : await db.prepare(schoolQuery).all();

        for (const school of schools.results) {
            const planned = school.current_daily_demand || 0;
            const plannedBread = showBread ? planned : 0;
            const plannedEgg = showEgg ? planned : 0;
            const plannedBanana = showBanana ? planned : 0;
            
            await db.prepare(`
              INSERT OR IGNORE INTO distribution_reports (
                date, school_emis_code, area_code, 
                planned_bread, planned_egg, planned_banana,
                received_bread, received_egg, received_banana,
                shortage_bread, shortage_egg, shortage_banana,
                excess_bread, excess_egg, excess_banana,
                status, problem_type, reason, comments, reported_by
              ) VALUES (
                ?, ?, ?,
                ?, ?, ?,
                ?, ?, ?,
                0, 0, 0,
                0, 0, 0,
                'resolved', 'none',
                'দুপুর ২টার মধ্যে কোনো সমস্যা রিপোর্ট করা হয়নি',
                'অটো-রিসিভড (২ টার পর)', 'System'
              )
            `).bind(
              date, school.emis_code, school.area_code,
              plannedBread, plannedEgg, plannedBanana,
              plannedBread, plannedEgg, plannedBanana
            ).run();
        }
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
    
    if (authUser.role !== 'super_admin' && !areaCode) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (areaCode) {
      query += ` AND r.area_code = ?`;
      params.push(areaCode);
    }
    
    if (status) {
      query += ` AND r.status = ?`;
      params.push(status);
    }
    
    query += ` ORDER BY r.created_at DESC`;

    const stmt = db.prepare(query);
    const results = params.length > 0 ? await stmt.bind(...params).all() : await stmt.all();

    return NextResponse.json({ reports: results.results });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json() as any;
    const db = await ensureDatabase();
    
    // Verify area manager permission
    if (authUser.role !== 'super_admin') {
      if (data.areaCode !== authUser.areaCode) {
        return NextResponse.json({ error: "Cannot create report for another area" }, { status: 403 });
      }
      
      const reportingWindow = getAreaManagerReportingWindow(data.date);
      if (!reportingWindow.canReport) {
        return NextResponse.json({ error: "এরিয়া ম্যানেজার শুধু বিতরণের দিন দুপুর ২টার আগে রিপোর্ট করতে পারবেন।" }, { status: 403 });
      }
    }

    const nextStatus =
      authUser.role === "super_admin" ? String(data.status || "new") : "new";

    const school = await db
      .prepare("SELECT area_code FROM schools WHERE emis_code = ?")
      .bind(data.schoolEmisCode)
      .first<{ area_code: string }>();
    if (!school) {
      return NextResponse.json({ error: "School not found" }, { status: 404 });
    }
    if (school.area_code !== data.areaCode) {
      return NextResponse.json(
        { error: "School does not belong to the selected area" },
        { status: 403 },
      );
    }

    // Upsert logic (if a report for this school+date exists, it updates it, otherwise inserts)
    // First, check if exists
    const existing = await db.prepare(
      `SELECT id, area_code FROM distribution_reports WHERE date = ? AND school_emis_code = ?`
    ).bind(data.date, data.schoolEmisCode).first<{ id: number; area_code: string }>();

    if (existing) {
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
          problem_type = ?, reason = ?, comments = ?, status = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `);
      const result = await stmt.bind(
        data.plannedBread || 0, data.plannedEgg || 0, data.plannedBanana || 0,
        data.receivedBread || 0, data.receivedEgg || 0, data.receivedBanana || 0,
        data.shortageBread || 0, data.shortageEgg || 0, data.shortageBanana || 0,
        data.excessBread || 0, data.excessEgg || 0, data.excessBanana || 0,
        data.problemType, data.reason, data.comments || null,
        nextStatus, existing.id
      ).run();

      if (result.success) {
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
        problem_type, reason, comments, status, reported_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = await stmt.bind(
      data.date, data.schoolEmisCode, data.areaCode,
      data.plannedBread || 0, data.plannedEgg || 0, data.plannedBanana || 0,
      data.receivedBread || 0, data.receivedEgg || 0, data.receivedBanana || 0,
      data.shortageBread || 0, data.shortageEgg || 0, data.shortageBanana || 0,
      data.excessBread || 0, data.excessEgg || 0, data.excessBanana || 0,
      data.problemType, data.reason, data.comments || null,
      nextStatus, authUser.name || 'Unknown Manager'
    ).run();

    if (result.success) {
      if (authUser.role !== 'super_admin') {
        // Create Notification for Super Admin
        await db.prepare(`
          INSERT INTO notifications (type, title, message, link, area_code)
          VALUES (?, ?, ?, ?, ?)
        `).bind(
          'distribution_issue',
          'বিতরণ সমস্যা',
          `${formatDateDMY(data.date)} তারিখে ${authUser.name || 'এরিয়া ম্যানেজার'} নতুন বিতরণ সমস্যা রিপোর্ট করেছেন।`,
          `/?area=${data.areaCode}&date=${data.date}&status=new&school=${data.schoolEmisCode}#distribution-exceptions`,
          null
        ).run();
      } else if (authUser.role === 'super_admin' && nextStatus === 'resolved') {
        // Create Notification for Area Manager
        const schoolRow = await db.prepare(`SELECT name_bn FROM schools WHERE emis_code = ?`).bind(data.schoolEmisCode).first();
        const schoolName = schoolRow ? (schoolRow.name_bn || data.schoolEmisCode) : data.schoolEmisCode;
        
        await db.prepare(`
          INSERT INTO notifications (type, title, message, link, area_code)
          VALUES (?, ?, ?, ?, ?)
        `).bind(
          'distribution_issue_resolved',
          'বিতরণ সমস্যা সমাধান',
          `${formatDateDMY(data.date)} তারিখে ${schoolName} স্কুলের বিতরণ সমস্যার সমাধান করা হয়েছে।`,
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
    }

    return NextResponse.json({ success: true, id: result.meta.last_row_id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
