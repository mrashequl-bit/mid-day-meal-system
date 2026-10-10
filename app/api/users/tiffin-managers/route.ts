import { NextResponse } from "next/server";
import { ensureDatabase } from "../../../../db/bootstrap";
import { requireSuperAdmin } from "../../../lib/auth";
import { writeAudit } from "../../../lib/admin-settings";
import { hashPassword } from "../../../lib/password";
import { internalApiError } from "../../../lib/api-errors";

const CREATE_BATCH_SIZE = 8;

type SchoolAccountRow = {
  emis_code: string;
  name_bn: string;
  area_code: string;
  user_id: number | null;
  user_role: string | null;
};

async function getSchoolAccounts() {
  const db = await ensureDatabase();
  const result = await db.prepare(
    `SELECT s.emis_code, s.name_bn, s.area_code,
       u.id AS user_id, u.role AS user_role
     FROM schools s
     LEFT JOIN users u ON u.username = s.emis_code
     WHERE s.is_active = 1
     ORDER BY s.serial_number, s.name_bn`,
  ).all<SchoolAccountRow>();
  return result.results;
}

function summarize(rows: SchoolAccountRow[]) {
  const ready = rows.filter((row) => row.user_role === "tiffin_manager");
  const missing = rows.filter((row) => row.user_id == null);
  const conflicts = rows.filter(
    (row) => row.user_id != null && row.user_role !== "tiffin_manager",
  );
  return {
    activeSchools: rows.length,
    readyAccounts: ready.length,
    missingAccounts: missing.length,
    conflictAccounts: conflicts.length,
    conflicts: conflicts.map((row) => ({
      emisCode: row.emis_code,
      schoolName: row.name_bn,
      existingRole: row.user_role,
    })),
  };
}

export async function GET() {
  if (!(await requireSuperAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    return NextResponse.json(summarize(await getSchoolAccounts()));
  } catch (error) {
    return internalApiError("tiffin-managers.status", error, "অ্যাকাউন্টের অবস্থা পাওয়া যায়নি।");
  }
}

export async function POST() {
  const actor = await requireSuperAdmin();
  if (!actor) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    const db = await ensureDatabase();
    const before = await getSchoolAccounts();
    const schoolsToCreate = before
      .filter((row) => row.user_id == null)
      .slice(0, CREATE_BATCH_SIZE);

    if (schoolsToCreate.length) {
      const prepared = await Promise.all(schoolsToCreate.map(async (school) => ({
        school,
        passwordHash: await hashPassword(school.emis_code),
      })));
      await db.batch(prepared.map(({ school, passwordHash }) => db.prepare(
        `INSERT OR IGNORE INTO users
         (username, password, name, role, area_code, is_active, designation)
         VALUES (?, ?, ?, 'tiffin_manager', ?, 1, 'টিফিন ম্যানেজার')`,
      ).bind(
        school.emis_code,
        passwordHash,
        `${school.name_bn} - টিফিন ম্যানেজার`,
        school.area_code,
      )));
      await writeAudit(
        actor.username,
        "user.tiffin_managers_created",
        "users",
        "school-emis",
        null,
        { created: schoolsToCreate.length, emisCodes: schoolsToCreate.map((school) => school.emis_code) },
      );
    }

    const summary = summarize(await getSchoolAccounts());
    return NextResponse.json({
      success: true,
      created: schoolsToCreate.length,
      ...summary,
    });
  } catch (error) {
    return internalApiError("tiffin-managers.create", error, "টিফিন ম্যানেজার অ্যাকাউন্ট তৈরি করা যায়নি।");
  }
}
