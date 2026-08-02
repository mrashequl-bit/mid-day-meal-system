import { NextResponse } from "next/server";
import { ensureDatabase } from "../../../db/bootstrap";
import { getAuthUser } from "../../lib/auth";

export async function GET() {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await ensureDatabase();
    
    let query = `SELECT * FROM schools ORDER BY name_bn ASC LIMIT 1000`;
    let params: string[] = [];
    
    if (authUser.role !== 'super_admin') {
       if (!authUser.areaCode) {
         return NextResponse.json({ error: "Forbidden" }, { status: 403 });
       }
       query = `SELECT * FROM schools WHERE area_code = ? ORDER BY name_bn ASC LIMIT 1000`;
       params = [authUser.areaCode];
    }

    const stmt = db.prepare(query);
    const results = params.length > 0 ? await stmt.bind(...params).all() : await stmt.all();

    return NextResponse.json({ schools: results.results });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
