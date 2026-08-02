import { NextResponse } from "next/server";
import { ensureDatabase } from "../../../db/bootstrap";
import { getAuthUser } from "../../lib/auth";

export async function GET() {
  if (!(await getAuthUser())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const db = await ensureDatabase();
    const query = `SELECT * FROM areas ORDER BY name_bn ASC`;
    const stmt = db.prepare(query);
    const results = await stmt.all();

    return NextResponse.json({ areas: results.results || results });
  } catch (error) {
    console.error('Failed to fetch areas:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch areas",
      },
      { status: 500 },
    );
  }
}
