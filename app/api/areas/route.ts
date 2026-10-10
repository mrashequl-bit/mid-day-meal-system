import { NextResponse } from "next/server";
import { ensureDatabase } from "../../../db/bootstrap";
import { requirePermission } from "../../lib/auth";
import { internalApiError } from "../../lib/api-errors";

export async function GET() {
  if (!(await requirePermission("areas"))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    const db = await ensureDatabase();
    const query = `SELECT * FROM areas ORDER BY name_bn ASC`;
    const stmt = db.prepare(query);
    const results = await stmt.all();

    return NextResponse.json({ areas: results.results || results });
  } catch (error) {
    return internalApiError("areas.list", error, "অঞ্চলের তালিকা পাওয়া যায়নি।");
  }
}
