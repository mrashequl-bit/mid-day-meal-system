import { NextResponse } from "next/server";
import { ensureDatabase } from "../../../db/bootstrap";
import { getAuthUser, requirePermission } from "../../lib/auth";
import { internalApiError } from "../../lib/api-errors";

export async function GET() {
  try {
    const signedInUser = await getAuthUser();
    if (!signedInUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const authUser = signedInUser.role === "tiffin_manager"
      ? signedInUser
      : await requirePermission("areas");
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await ensureDatabase();
    
    let query = `SELECT s.*, a.name_bn AS area_name
      FROM schools s JOIN areas a ON a.code = s.area_code
      WHERE s.is_active = 1 ORDER BY COALESCE(s.serial_number, 999999), s.name_bn ASC LIMIT 1000`;
    let params: string[] = [];
    
    if (authUser.role === 'tiffin_manager') {
       query = `SELECT s.*, a.name_bn AS area_name
         FROM schools s JOIN areas a ON a.code = s.area_code
         WHERE s.emis_code = ? AND s.is_active = 1 LIMIT 1`;
       params = [authUser.username];
    } else if (authUser.role !== 'super_admin') {
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
  } catch (error) {
    return internalApiError("schools.list", error, "বিদ্যালয়ের তালিকা পাওয়া যায়নি।");
  }
}
