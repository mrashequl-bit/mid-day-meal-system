const BACKUP_FORMAT = "midday-meal-d1-backup";
const BACKUP_VERSION = 1;

export const BACKUP_TABLES = [
  "areas",
  "stock_balances",
  "suppliers",
  "schools",
  "users",
  "meal_plan_periods",
  "system_settings",
  "role_permissions",
  "backup_runs",
  "audit_logs",
  "notifications",
  "area_expenses",
  "area_payments",
  "supplier_ledgers",
  "stock_transactions",
  "school_demand_history",
  "distribution_reports",
  "meal_plan_days",
] as const;

type BackupTable = typeof BACKUP_TABLES[number];
type BackupRow = Record<string, unknown>;

export type SystemBackup = {
  format: typeof BACKUP_FORMAT;
  version: typeof BACKUP_VERSION;
  createdAt: string;
  source: "Cloudflare D1";
  excludedTables: ["sessions", "login_attempts"];
  tables: Record<BackupTable, BackupRow[]>;
  tableCounts: Record<BackupTable, number>;
};

function quoteIdentifier(identifier: string) {
  return `"${identifier.replaceAll('"', '""')}"`;
}

export async function createSystemBackup(db: D1Database): Promise<SystemBackup> {
  const entries = await Promise.all(
    BACKUP_TABLES.map(async (table) => {
      const result = await db.prepare(`SELECT * FROM ${quoteIdentifier(table)}`).all<BackupRow>();
      return [table, result.results] as const;
    }),
  );
  const tables = Object.fromEntries(entries) as Record<BackupTable, BackupRow[]>;
  const tableCounts = Object.fromEntries(
    entries.map(([table, rows]) => [table, rows.length]),
  ) as Record<BackupTable, number>;

  return {
    format: BACKUP_FORMAT,
    version: BACKUP_VERSION,
    createdAt: new Date().toISOString(),
    source: "Cloudflare D1",
    excludedTables: ["sessions", "login_attempts"],
    tables,
    tableCounts,
  };
}

function assertBackup(value: unknown): asserts value is SystemBackup {
  if (!value || typeof value !== "object") throw new Error("সঠিক backup file নির্বাচন করুন।");
  const backup = value as Partial<SystemBackup>;
  if (backup.format !== BACKUP_FORMAT || backup.version !== BACKUP_VERSION || !backup.tables) {
    throw new Error("এই file-টি Mid Day Meal system backup নয়।");
  }
  let totalRows = 0;
  for (const table of BACKUP_TABLES) {
    const rows = backup.tables[table];
    if (!Array.isArray(rows) || rows.some((row) => !row || typeof row !== "object" || Array.isArray(row))) {
      throw new Error(`Backup-এর ${table} table সঠিক নয়।`);
    }
    totalRows += rows.length;
  }
  if (totalRows > 100_000) throw new Error("Backup file-এ অতিরিক্ত data রয়েছে।");
}

export async function restoreSystemBackup(db: D1Database, value: unknown) {
  assertBackup(value);
  const statements: D1PreparedStatement[] = [];

  for (const table of [...BACKUP_TABLES].reverse()) {
    statements.push(db.prepare(`DELETE FROM ${quoteIdentifier(table)}`));
  }
  for (const table of BACKUP_TABLES) {
    const rows = value.tables[table];
    if (!rows.length) continue;
    const columns = Object.keys(rows[0]);
    if (
      !columns.length ||
      columns.length > 100 ||
      columns.some((column) => !/^[a-z_][a-z0-9_]*$/i.test(column)) ||
      rows.some((row) => {
        const rowColumns = Object.keys(row);
        return rowColumns.length !== columns.length || columns.some((column) => !Object.hasOwn(row, column));
      })
    ) {
      throw new Error(`Backup-এর ${table} table columns সঠিক নয়।`);
    }
    const serializedRows = JSON.stringify(rows);
    if (new TextEncoder().encode(serializedRows).byteLength > 1_800_000) {
      throw new Error(`${table} table restore limit অতিক্রম করেছে।`);
    }
    const columnList = columns.map(quoteIdentifier).join(", ");
    const values = columns.map((column) => `json_extract(value, '$.${column}')`).join(", ");
    statements.push(
      db.prepare(
        `INSERT INTO ${quoteIdentifier(table)} (${columnList}) SELECT ${values} FROM json_each(?)`,
      ).bind(serializedRows),
    );
  }

  await db.batch(statements);
  return { createdAt: value.createdAt, tableCounts: value.tableCounts };
}
