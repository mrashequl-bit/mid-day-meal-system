import { NextResponse } from "next/server";
import { ensureDatabase } from "../../../db/bootstrap";
import { requirePermission } from "../../lib/auth";

export async function GET() {
  try {
    const authUser = await requirePermission("areas");
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await ensureDatabase();
    
    let query = `SELECT s.*, a.name_bn AS area_name
      FROM schools s JOIN areas a ON a.code = s.area_code
      WHERE s.is_active = 1 ORDER BY COALESCE(s.serial_number, 999999), s.name_bn ASC LIMIT 1000`;
    let params: string[] = [];
    
    if (authUser.role !== 'super_admin') {
       if (!authUser.areaCode) {
         return NextResponse.json({ error: "Forbidden" }, { status: 403 });
       }
       query = `SELECT s.*, a.name_bn AS area_name
         FROM schools s JOIN areas a ON a.code = s.area_code
         WHERE s.area_code = ? AND s.is_active = 1 ORDER BY COALESCE(s.serial_number, 999999), s.name_bn ASC LIMIT 1000`;
       params = [authUser.areaCode];
    }

    const stmt = db.prepare(query);
    const results = params.length > 0 ? await stmt.bind(...params).all() : await stmt.all();

    return NextResponse.json({ schools: results.results });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
