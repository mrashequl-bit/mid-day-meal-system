import { env } from "cloudflare:workers";
import { areas, schools } from "../app/data/schools";
import { hashPassword } from "../app/lib/password";

let ready = false;

export async function ensureDatabase() {
  if (ready) return env.DB;
  if (!env.DB) {
    throw new Error("Database binding is unavailable.");
  }

  const db = env.DB;
  await db.batch([
    db
      .prepare(
        `CREATE TABLE IF NOT EXISTS area_expenses (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          area_code TEXT NOT NULL REFERENCES areas(code),
          expense_date TEXT NOT NULL,
          vehicle_type TEXT NOT NULL,
          amount_poisha INTEGER NOT NULL,
          note TEXT,
          is_read INTEGER NOT NULL DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
      ),
    db
      .prepare(
        `CREATE TABLE IF NOT EXISTS supplier_ledgers (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          supplier_id INTEGER NOT NULL REFERENCES suppliers(id),
          date TEXT NOT NULL,
          transaction_type TEXT NOT NULL,
          amount_poisha INTEGER NOT NULL,
          balance_poisha INTEGER NOT NULL,
          note TEXT,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )`,
      ),
    db
      .prepare(
        `CREATE TABLE IF NOT EXISTS areas (
          code TEXT PRIMARY KEY,
          name_bn TEXT NOT NULL UNIQUE,
          is_active INTEGER NOT NULL DEFAULT 1,
          manager_name TEXT,
          manager_mobile TEXT,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )`,
      ),
    db
      .prepare(
        `CREATE TABLE IF NOT EXISTS stock_balances (
          item_code TEXT PRIMARY KEY,
          item_name_bn TEXT NOT NULL,
          unit TEXT NOT NULL DEFAULT 'piece',
          current_quantity INTEGER NOT NULL DEFAULT 0 CHECK(current_quantity >= 0),
          minimum_level INTEGER NOT NULL DEFAULT 0 CHECK(minimum_level >= 0),
          updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )`,
      ),
    db
      .prepare(
        `CREATE TABLE IF NOT EXISTS suppliers (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          item_code TEXT NOT NULL REFERENCES stock_balances(item_code),
          name TEXT NOT NULL,
          owner_name TEXT,
          mobile TEXT,
          address TEXT,
          default_unit_price_poisha INTEGER NOT NULL DEFAULT 0 CHECK(default_unit_price_poisha >= 0),
          is_active INTEGER NOT NULL DEFAULT 1,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(item_code, name)
        )`,
      ),
    db
      .prepare(
        `CREATE TABLE IF NOT EXISTS stock_transactions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          item_code TEXT NOT NULL REFERENCES stock_balances(item_code),
          transaction_type TEXT NOT NULL,
          quantity INTEGER NOT NULL CHECK(quantity > 0),
          previous_balance INTEGER NOT NULL,
          new_balance INTEGER NOT NULL CHECK(new_balance >= 0),
          transaction_date TEXT NOT NULL,
          note TEXT,
          supplier_id INTEGER REFERENCES suppliers(id),
          area_code TEXT REFERENCES areas(code),
          unit_price_poisha INTEGER NOT NULL DEFAULT 0 CHECK(unit_price_poisha >= 0),
          total_amount_poisha INTEGER NOT NULL DEFAULT 0 CHECK(total_amount_poisha >= 0),
          paid_amount_poisha INTEGER NOT NULL DEFAULT 0 CHECK(paid_amount_poisha >= 0),
          due_amount_poisha INTEGER NOT NULL DEFAULT 0 CHECK(due_amount_poisha >= 0),
          actor TEXT NOT NULL,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )`,
      ),
    db
      .prepare(
        `CREATE TABLE IF NOT EXISTS schools (
          emis_code TEXT PRIMARY KEY,
          name_bn TEXT NOT NULL,
          area_code TEXT NOT NULL REFERENCES areas(code),
          head_teacher TEXT,
          legacy_mobile TEXT,
          current_daily_demand INTEGER NOT NULL CHECK(current_daily_demand > 0),
          is_active INTEGER NOT NULL DEFAULT 1,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )`,
      ),
    db
      .prepare(
        `CREATE TABLE IF NOT EXISTS school_demand_history (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          school_emis_code TEXT NOT NULL REFERENCES schools(emis_code),
          previous_demand INTEGER NOT NULL,
          new_demand INTEGER NOT NULL CHECK(new_demand > 0),
          effective_from TEXT NOT NULL,
          reason TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'approved',
          changed_by TEXT NOT NULL,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )`,
      ),
    db
      .prepare(
        `CREATE TABLE IF NOT EXISTS audit_logs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          actor TEXT NOT NULL,
          action TEXT NOT NULL,
          entity_type TEXT NOT NULL,
          entity_id TEXT NOT NULL,
          before_json TEXT,
          after_json TEXT,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )`,
      ),
    db
      .prepare(
        `CREATE TABLE IF NOT EXISTS area_expenses (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          area_code TEXT NOT NULL REFERENCES areas(code),
          expense_date TEXT NOT NULL,
          vehicle_type TEXT NOT NULL,
          amount_poisha INTEGER NOT NULL CHECK(amount_poisha > 0),
          note TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
      ),
    db
      .prepare(
        `CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT NOT NULL UNIQUE,
          password TEXT NOT NULL,
          name TEXT NOT NULL,
          role TEXT NOT NULL,
          area_code TEXT REFERENCES areas(code),
          is_active INTEGER NOT NULL DEFAULT 1,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )`,
      ),
    db
      .prepare(
        `CREATE TABLE IF NOT EXISTS distribution_reports (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          date TEXT NOT NULL,
          school_emis_code TEXT NOT NULL REFERENCES schools(emis_code),
          area_code TEXT NOT NULL REFERENCES areas(code),
          planned_bread INTEGER NOT NULL DEFAULT 0,
          planned_egg INTEGER NOT NULL DEFAULT 0,
          planned_banana INTEGER NOT NULL DEFAULT 0,
          received_bread INTEGER NOT NULL DEFAULT 0,
          received_egg INTEGER NOT NULL DEFAULT 0,
          received_banana INTEGER NOT NULL DEFAULT 0,
          shortage_bread INTEGER NOT NULL DEFAULT 0,
          shortage_egg INTEGER NOT NULL DEFAULT 0,
          shortage_banana INTEGER NOT NULL DEFAULT 0,
          excess_bread INTEGER NOT NULL DEFAULT 0,
          excess_egg INTEGER NOT NULL DEFAULT 0,
          excess_banana INTEGER NOT NULL DEFAULT 0,
          problem_type TEXT NOT NULL,
          reason TEXT NOT NULL,
          comments TEXT,
          proof_url TEXT,
          status TEXT NOT NULL DEFAULT 'new',
          reported_by TEXT NOT NULL,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(date, school_emis_code)
        )`,
      ),
    db
      .prepare(
        `CREATE TABLE IF NOT EXISTS notifications (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          type TEXT NOT NULL,
          title TEXT NOT NULL,
          message TEXT NOT NULL,
          link TEXT,
          is_read INTEGER NOT NULL DEFAULT 0,
          area_code TEXT,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )`,
      ),
    db
      .prepare(
        `CREATE TABLE IF NOT EXISTS sessions (
          token_hash TEXT PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          expires_at TEXT NOT NULL,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )`,
      ),
    db.prepare(
      "CREATE INDEX IF NOT EXISTS schools_area_code_idx ON schools(area_code)",
    ),
    db.prepare(
      "CREATE INDEX IF NOT EXISTS demand_history_school_date_idx ON school_demand_history(school_emis_code, effective_from)",
    ),
    db.prepare(
      "CREATE INDEX IF NOT EXISTS audit_entity_idx ON audit_logs(entity_type, entity_id)",
    ),
    db.prepare(
      "CREATE INDEX IF NOT EXISTS stock_transactions_item_date_idx ON stock_transactions(item_code, transaction_date)",
    ),
    db.prepare(
      "CREATE INDEX IF NOT EXISTS suppliers_item_code_idx ON suppliers(item_code)",
    ),
    db.prepare(
      "CREATE INDEX IF NOT EXISTS sessions_user_id_idx ON sessions(user_id)",
    ),
    db.prepare(
      "CREATE INDEX IF NOT EXISTS sessions_expires_at_idx ON sessions(expires_at)",
    ),
    db.prepare(
      "CREATE INDEX IF NOT EXISTS dist_rep_area_idx ON distribution_reports(area_code)",
    ),
    db.prepare(
      "CREATE INDEX IF NOT EXISTS dist_rep_date_idx ON distribution_reports(date)",
    ),
    db.prepare(
      "CREATE INDEX IF NOT EXISTS notifications_is_read_idx ON notifications(is_read)",
    ),
  ]);

  const supplierColumns = await db
    .prepare("PRAGMA table_info(suppliers)")
    .all<{ name: string }>();
  if (
    !supplierColumns.results.some(
      (column: { name: string }) =>
        column.name === "default_unit_price_poisha",
    )
  ) {
    await db
      .prepare(
        "ALTER TABLE suppliers ADD COLUMN default_unit_price_poisha INTEGER NOT NULL DEFAULT 0 CHECK(default_unit_price_poisha >= 0)",
      )
      .run();
  }

  const stockColumns = await db
    .prepare("PRAGMA table_info(stock_transactions)")
    .all<{ name: string }>();
  const existingStockColumns = new Set(
    stockColumns.results.map((column: { name: string }) => column.name),
  );
  const missingStockColumns = [
    ["supplier_id", "INTEGER REFERENCES suppliers(id)"],
    ["area_code", "TEXT REFERENCES areas(code)"],
    ["unit_price_poisha", "INTEGER NOT NULL DEFAULT 0 CHECK(unit_price_poisha >= 0)"],
    ["total_amount_poisha", "INTEGER NOT NULL DEFAULT 0 CHECK(total_amount_poisha >= 0)"],
    ["paid_amount_poisha", "INTEGER NOT NULL DEFAULT 0 CHECK(paid_amount_poisha >= 0)"],
    ["due_amount_poisha", "INTEGER NOT NULL DEFAULT 0 CHECK(due_amount_poisha >= 0)"],
    ["updated_at", "TEXT"],
  ] as const;
  for (const [column, definition] of missingStockColumns) {
    if (!existingStockColumns.has(column)) {
      await db
        .prepare(`ALTER TABLE stock_transactions ADD COLUMN ${column} ${definition}`)
        .run();
    }
  }
  await db
    .prepare(
      "CREATE INDEX IF NOT EXISTS stock_transactions_supplier_idx ON stock_transactions(supplier_id)",
    )
    .run();

  await db.batch(
    areas.map((area) =>
      db
        .prepare(
          `INSERT INTO areas
           (code, name_bn, manager_name, manager_mobile)
           VALUES (?, ?, ?, ?)
           ON CONFLICT(code) DO UPDATE SET
             name_bn = excluded.name_bn,
             manager_name = COALESCE(excluded.manager_name, areas.manager_name),
             manager_mobile = COALESCE(excluded.manager_mobile, areas.manager_mobile),
             updated_at = CURRENT_TIMESTAMP`,
        )
        .bind(
          area.code,
          area.name,
          area.managerName,
          area.managerMobile,
        ),
    ),
  );

  await db.batch([
    db
      .prepare(
        "INSERT OR IGNORE INTO stock_balances (item_code, item_name_bn, unit) VALUES ('bun', 'বন রুটি', 'পিস')",
      ),
    db
      .prepare(
        "INSERT OR IGNORE INTO stock_balances (item_code, item_name_bn, unit) VALUES ('egg', 'সিদ্ধ ডিম', 'পিস')",
      ),
    db
      .prepare(
        "INSERT OR IGNORE INTO stock_balances (item_code, item_name_bn, unit) VALUES ('banana', 'কলা', 'টি')",
      ),
  ]);

  await db.batch(
    schools.map((school) =>
      db
        .prepare(
          `INSERT OR IGNORE INTO schools
          (emis_code, name_bn, area_code, head_teacher, legacy_mobile, current_daily_demand)
          VALUES (?, ?, ?, ?, ?, ?)`,
        )
        .bind(
          school.emisCode,
          school.name,
          school.areaCode,
          school.headTeacher,
          school.legacyMobile,
          school.dailyDemand,
        ),
    ),
  );

  const initialAdminPassword = env.INITIAL_ADMIN_PASSWORD?.trim();
  const existingAdmin = await db
    .prepare("SELECT id FROM users WHERE username = 'sunny'")
    .first<{ id: number }>();
  if (!existingAdmin && initialAdminPassword) {
    const adminPassword = await hashPassword(initialAdminPassword);
    await db.prepare(
      "INSERT OR IGNORE INTO users (username, password, name, role) VALUES ('sunny', ?, 'Sunny (Super Admin)', 'super_admin')"
    ).bind(adminPassword).run();
  }

  const areaManagerUsers = await Promise.all(
    areas
      .filter((area) => area.managerMobile)
      .map(async (area) => ({
        ...area,
        managerMobile: String(area.managerMobile),
        password: await hashPassword(String(area.managerMobile)),
      })),
  );
  await db.batch(
    areaManagerUsers.map((area) =>
      db
        .prepare(
          `INSERT OR IGNORE INTO users
           (username, password, name, role, area_code)
           VALUES (?, ?, ?, 'area_manager', ?)`,
        )
        .bind(area.managerMobile, area.password, area.managerName, area.code),
    ),
  );

  // Add profile columns if missing
  const userColumns = await db
    .prepare("PRAGMA table_info(users)")
    .all<{ name: string }>();
  const existingUserCols = new Set(
    userColumns.results.map((column) => column.name),
  );
  const profileColumns = [
    ["email", "TEXT DEFAULT ''"],
    ["phone", "TEXT DEFAULT ''"],
    ["bio", "TEXT DEFAULT ''"],
    ["address", "TEXT DEFAULT ''"],
    ["photo_base64", "TEXT DEFAULT ''"],
    ["designation", "TEXT DEFAULT ''"],
  ];
  for (const [col, def] of profileColumns) {
    if (!existingUserCols.has(col)) {
      await db.prepare(`ALTER TABLE users ADD COLUMN ${col} ${def}`).run();
    }
  }

  // Retire legacy account/auditor roles without deleting their user profiles.
  await db.prepare("UPDATE users SET role = 'tiffin_manager', area_code = NULL WHERE role IN ('accounts', 'viewer', 'auditor')").run();

  // Add area_payments table
  await db.prepare(
    `CREATE TABLE IF NOT EXISTS area_payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      area_code TEXT NOT NULL REFERENCES areas(code),
      payment_date TEXT NOT NULL,
      amount_poisha INTEGER NOT NULL CHECK(amount_poisha > 0),
      note TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`
  ).run();

  
  // Keep older preview databases compatible with the current expenses schema.
  const areaExpensesCols = await db
    .prepare("PRAGMA table_info(area_expenses)")
    .all<{ name: string }>();
  const existingExpenseCols = new Set(
    areaExpensesCols.results.map((column) => column.name),
  );
  const expenseColumns = [
    ["expense_date", "TEXT"],
    ["vehicle_type", "TEXT"],
    ["note", "TEXT"],
    ["is_read", "INTEGER NOT NULL DEFAULT 0"],
  ] as const;
  for (const [column, definition] of expenseColumns) {
    if (!existingExpenseCols.has(column)) {
      await db.prepare(`ALTER TABLE area_expenses ADD COLUMN ${column} ${definition}`).run();
    }
  }

  const areaPaymentsCols = await db
    .prepare("PRAGMA table_info(area_payments)")
    .all<{ name: string }>();
  if (!areaPaymentsCols.results.some((column) => column.name === "is_read")) {
    await db.prepare("ALTER TABLE area_payments ADD COLUMN is_read INTEGER NOT NULL DEFAULT 0").run();
  }

  const notificationsCols = await db
    .prepare("PRAGMA table_info(notifications)")
    .all<{ name: string }>();
  if (
    !notificationsCols.results.some((column) => column.name === "area_code")
  ) {
    await db.prepare("ALTER TABLE notifications ADD COLUMN area_code TEXT").run();
  }

  ready = true;
  return db;
}
