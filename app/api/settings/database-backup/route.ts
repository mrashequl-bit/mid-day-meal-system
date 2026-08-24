import { NextResponse } from "next/server";
import { ensureDatabase } from "../../../../db/bootstrap";
import { requireSuperAdmin } from "../../../lib/auth";
import { createSystemBackup, restoreSystemBackup } from "../../../lib/system-backup";
import { writeAudit } from "../../../lib/admin-settings";

const MAX_BACKUP_BYTES = 15 * 1024 * 1024;

function backupFileName() {
  return `midday-meal-backup-${new Date().toISOString().replaceAll(":", "-").replace(".", "-")}.json`;
}

export async function GET() {
  const user = await requireSuperAdmin();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const db = await ensureDatabase();
    const backup = await createSystemBackup(db);
    const body = JSON.stringify(backup);
    await db.prepare(
      "INSERT INTO backup_runs (frequency, status, details, completed_at) VALUES ('manual', 'completed', ?, CURRENT_TIMESTAMP)",
    ).bind(JSON.stringify({ destination: "browser-download", fileName: backupFileName(), bytes: body.length })).run();
    await writeAudit(user.username, "backup.downloaded", "database", "DB", null, { tableCounts: backup.tableCounts });
    return new Response(body, {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="${backupFileName()}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Backup তৈরি করা যায়নি।" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const user = await requireSuperAdmin();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const text = await request.text();
    if (new TextEncoder().encode(text).byteLength > MAX_BACKUP_BYTES) {
      return NextResponse.json({ error: "Backup file সর্বোচ্চ ১৫ MB হতে পারবে।" }, { status: 413 });
    }
    const backup = JSON.parse(text) as unknown;
    const db = await ensureDatabase();
    const restored = await restoreSystemBackup(db, backup);
    await db.prepare(
      "INSERT INTO backup_runs (frequency, status, details, completed_at) VALUES ('restore', 'completed', ?, CURRENT_TIMESTAMP)",
    ).bind(JSON.stringify({ sourceCreatedAt: restored.createdAt, tableCounts: restored.tableCounts })).run();
    await writeAudit(user.username, "backup.restored", "database", "DB", null, { sourceCreatedAt: restored.createdAt });
    return NextResponse.json({ success: true, sourceCreatedAt: restored.createdAt });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Backup restore করা যায়নি।" },
      { status: 400 },
    );
  }
}
