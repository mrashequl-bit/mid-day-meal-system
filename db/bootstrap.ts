import { env } from "cloudflare:workers";
import { areas, schools } from "../app/data/schools";
import { hashPassword } from "../app/lib/password";

let ready = false;
const RUNTIME_BOOTSTRAP_VERSION = "0012";

async function hasCurrentRuntimeBootstrap(db: D1Database) {
  const settingsTable = await db.prepare(
    "SELECT 1 AS present FROM sqlite_master WHERE type = 'table' AND name = 'system_settings' LIMIT 1",
  ).first<{ present: number }>();
  if (!settingsTable) return false;

  const marker = await db.prepare(
    "SELECT setting_value FROM system_settings WHERE setting_key = 'runtime_bootstrap_version'",
  ).first<{ setting_value: string }>();
  return marker?.setting_value === RUNTIME_BOOTSTRAP_VERSION;
}

export async function ensureDatabase() {
  if (ready) return env.DB;
  if (!env.DB) {
    throw new Error("Database binding is unavailable.");
  }

  const db = env.DB;
  if (await hasCurrentRuntimeBootstrap(db)) {
    ready = true;
    return db;
  }

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
          area_codes_json TEXT,
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
          union_name TEXT,
          cluster_name TEXT,
          serial_number INTEGER,
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
        `CREATE TABLE IF NOT EXISTS meal_plan_periods (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          start_date TEXT NOT NULL,
          end_date TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft', 'active')),
          created_by TEXT NOT NULL,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CHECK(start_date <= end_date)
        )`,
      ),
    db
      .prepare(
        `CREATE TABLE IF NOT EXISTS meal_plan_days (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          period_id INTEGER NOT NULL REFERENCES meal_plan_periods(id) ON DELETE CASCADE,
          plan_date TEXT NOT NULL,
          items_json TEXT NOT NULL DEFAULT '[]',
          updated_by TEXT NOT NULL,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(period_id, plan_date)
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
          resolution_reason TEXT,
          confirmation_source TEXT NOT NULL DEFAULT 'manager',
          auto_confirmed_at TEXT,
          resolution_action TEXT,
          resolution_note TEXT,
          resolved_by TEXT,
          resolved_at TEXT,
          manager_submission_count INTEGER NOT NULL DEFAULT 1,
          manager_reopen_allowed INTEGER NOT NULL DEFAULT 0,
          manager_reopen_action TEXT,
          manager_reopen_authorized_by TEXT,
          manager_reopen_authorized_at TEXT,
          manager_reopen_used_at TEXT,
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
        `CREATE TABLE IF NOT EXISTS distribution_report_submissions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          report_id INTEGER NOT NULL REFERENCES distribution_reports(id) ON DELETE CASCADE,
          submission_number INTEGER NOT NULL CHECK(submission_number IN (1, 2)),
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
          submitted_by TEXT NOT NULL,
          submitted_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          authorization_action TEXT,
          authorization_by TEXT,
          authorization_at TEXT,
          UNIQUE(report_id, submission_number)
        )`,
      ),
    db
      .prepare(
        `CREATE TABLE IF NOT EXISTS distribution_adjustments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          school_emis_code TEXT NOT NULL REFERENCES schools(emis_code),
          plan_month TEXT NOT NULL,
          item_code TEXT NOT NULL CHECK(item_code IN ('bun', 'egg', 'banana')),
          shortage_report_id INTEGER NOT NULL REFERENCES distribution_reports(id) ON DELETE CASCADE,
          excess_report_id INTEGER NOT NULL REFERENCES distribution_reports(id) ON DELETE CASCADE,
          quantity INTEGER NOT NULL CHECK(quantity > 0),
          created_by TEXT NOT NULL DEFAULT 'System',
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(shortage_report_id, excess_report_id, item_code)
        )`,
      ),
    db
      .prepare(
        `CREATE TABLE IF NOT EXISTS distribution_resolution_items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          report_id INTEGER NOT NULL REFERENCES distribution_reports(id) ON DELETE CASCADE,
          action TEXT NOT NULL,
          item_code TEXT NOT NULL CHECK(item_code IN ('bun', 'egg', 'banana')),
          direction TEXT NOT NULL CHECK(direction IN ('shortage', 'excess')),
          quantity INTEGER NOT NULL CHECK(quantity > 0),
          created_by TEXT NOT NULL,
          note TEXT,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
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
    db
      .prepare(
        `CREATE TABLE IF NOT EXISTS login_attempts (
          attempt_key TEXT PRIMARY KEY,
          attempts INTEGER NOT NULL DEFAULT 0,
          first_attempt_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          last_attempt_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          blocked_until TEXT
        )`,
      ),
    db.prepare(
      `CREATE TABLE IF NOT EXISTS system_settings (
        setting_key TEXT PRIMARY KEY,
        setting_value TEXT NOT NULL,
        is_secret INTEGER NOT NULL DEFAULT 0,
        updated_by TEXT,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,
    ),
    db.prepare(
      `CREATE TABLE IF NOT EXISTS role_permissions (
        role TEXT NOT NULL,
        module TEXT NOT NULL,
        can_view INTEGER NOT NULL DEFAULT 0,
        can_manage INTEGER NOT NULL DEFAULT 0,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (role, module)
      )`,
    ),
    db.prepare(
      `CREATE TABLE IF NOT EXISTS backup_runs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        frequency TEXT NOT NULL,
        status TEXT NOT NULL,
        details TEXT,
        started_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        completed_at TEXT
      )`,
    ),
    db.prepare(
      `CREATE TABLE IF NOT EXISTS report_delivery_runs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        report_date TEXT NOT NULL,
        channel TEXT NOT NULL,
        recipient TEXT NOT NULL,
        status TEXT NOT NULL,
        provider_message_id TEXT,
        error_message TEXT,
        is_test INTEGER NOT NULL DEFAULT 0,
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
      "CREATE INDEX IF NOT EXISTS meal_plan_period_status_idx ON meal_plan_periods(status, start_date, end_date)",
    ),
    db.prepare(
      "CREATE INDEX IF NOT EXISTS meal_plan_day_date_idx ON meal_plan_days(plan_date, period_id)",
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
      "CREATE INDEX IF NOT EXISTS dist_adj_school_month_idx ON distribution_adjustments(school_emis_code, plan_month)",
    ),
    db.prepare(
      "CREATE INDEX IF NOT EXISTS dist_resolution_report_idx ON distribution_resolution_items(report_id)",
    ),
    db.prepare(
      "CREATE INDEX IF NOT EXISTS dist_report_submission_report_idx ON distribution_report_submissions(report_id)",
    ),
    db.prepare(
      "CREATE INDEX IF NOT EXISTS notifications_is_read_idx ON notifications(is_read)",
    ),
    db.prepare(
      "CREATE INDEX IF NOT EXISTS report_delivery_lookup_idx ON report_delivery_runs(report_date, channel, recipient, status)",
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
    ["area_codes_json", "TEXT"],
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
             updated_at = CURRENT_TIMESTAMP
           WHERE areas.name_bn IS NOT excluded.name_bn
              OR areas.manager_name IS NOT COALESCE(excluded.manager_name, areas.manager_name)
              OR areas.manager_mobile IS NOT COALESCE(excluded.manager_mobile, areas.manager_mobile)`,
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

  const schoolColumns = await db.prepare("PRAGMA table_info(schools)").all<{ name: string }>();
  const existingSchoolColumns = new Set(schoolColumns.results.map((column) => column.name));
  const missingSchoolColumns = [
    ["serial_number", "INTEGER"],
    ["union_name", "TEXT"],
    ["cluster_name", "TEXT"],
  ] as const;
  for (const [column, definition] of missingSchoolColumns) {
    if (!existingSchoolColumns.has(column)) {
      await db.prepare(`ALTER TABLE schools ADD COLUMN ${column} ${definition}`).run();
    }
  }

  await db.batch(
    schools.map((school) =>
      db
        .prepare(
          `INSERT OR IGNORE INTO schools
          (emis_code, name_bn, area_code, head_teacher, legacy_mobile, serial_number, current_daily_demand)
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
        )
        .bind(
          school.emisCode,
          school.name,
          school.areaCode,
          school.headTeacher,
          school.legacyMobile,
          school.serial,
          school.dailyDemand,
        ),
    ),
  );
  await db.batch(schools.map((school) =>
    db.prepare("UPDATE schools SET serial_number=? WHERE emis_code=? AND serial_number IS NULL")
      .bind(school.serial, school.emisCode)
  ));
  await db.prepare("CREATE UNIQUE INDEX IF NOT EXISTS schools_serial_number_unique ON schools(serial_number) WHERE serial_number IS NOT NULL").run();

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

  // Area Manager accounts are created by Super Admin from Settings so every
  // account receives an explicit password that follows the configured policy.

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
    ["two_factor_secret", "TEXT DEFAULT ''"],
    ["two_factor_enabled", "INTEGER NOT NULL DEFAULT 0"],
  ];
  for (const [col, def] of profileColumns) {
    if (!existingUserCols.has(col)) {
      await db.prepare(`ALTER TABLE users ADD COLUMN ${col} ${def}`).run();
    }
  }

  // Retire legacy account/auditor roles without deleting their user profiles.
  await db.prepare("UPDATE users SET role = 'tiffin_manager', area_code = NULL WHERE role IN ('accounts', 'viewer', 'auditor')").run();

  const defaultSettings: Record<string, string> = {
    institution_name: "মিড-ডে মিল অপারেশন",
    project_name: "মিড-ডে মিল ব্যবস্থাপনা",
    address: "দুর্গাপুর উপজেলা, নেত্রকোণা",
    support_email: "",
    support_phone: "",
    logo_data_url: "",
    language: "bn",
    timezone: "Asia/Dhaka",
    date_format: "DD/MM/YYYY",
    password_min_length: "8",
    password_require_uppercase: "0",
    password_require_lowercase: "1",
    password_require_number: "1",
    backup_enabled: "0",
    backup_frequency: "daily",
    backup_day: "0",
    backup_time: "02:00",
    sms_enabled: "0",
    sms_provider: "",
    email_enabled: "0",
    email_provider: "cloudflare",
    daily_report_enabled: "1",
    daily_report_time: "16:00",
    daily_report_emails: '["mr.ashequl@gmail.com"]',
    daily_report_sender: "reports@middaymeal.xyz",
    telegram_enabled: "0",
    telegram_destinations: "[]",
    meal_price_bun: "13.5",
    meal_price_egg: "10",
    meal_price_banana: "6",
  };
  await db.batch(Object.entries(defaultSettings).map(([key, value]) =>
    db.prepare("INSERT OR IGNORE INTO system_settings (setting_key, setting_value) VALUES (?, ?)").bind(key, value)
  ));

  const permissionDefaults: Record<string, string[]> = {
    area_manager: ["dashboard", "areas", "distribution", "expenses"],
    project_manager: ["dashboard", "areas", "distribution", "reports"],
    store_manager: ["dashboard", "stock", "suppliers"],
    tiffin_manager: ["dashboard", "distribution"],
    school_headmaster: ["dashboard", "distribution"],
    supplier: ["dashboard", "suppliers"],
  };
  const modules = ["dashboard", "areas", "distribution", "expenses", "stock", "suppliers", "reports", "users"];
  await db.batch(Object.entries(permissionDefaults).flatMap(([role, enabled]) => modules.map((module) =>
    db.prepare(`INSERT OR IGNORE INTO role_permissions (role, module, can_view, can_manage) VALUES (?, ?, ?, ?)`)
      .bind(role, module, enabled.includes(module) ? 1 : 0, enabled.includes(module) ? 1 : 0)
  )));

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

  const distributionReportCols = await db
    .prepare("PRAGMA table_info(distribution_reports)")
    .all<{ name: string }>();
  if (!distributionReportCols.results.some((column) => column.name === "resolution_reason")) {
    await db.prepare("ALTER TABLE distribution_reports ADD COLUMN resolution_reason TEXT").run();
  }
  const distributionReportColumnNames = new Set(distributionReportCols.results.map((column) => column.name));
  const distributionReportColumnMigrations = [
    ["confirmation_source", "ALTER TABLE distribution_reports ADD COLUMN confirmation_source TEXT NOT NULL DEFAULT 'manager'"],
    ["auto_confirmed_at", "ALTER TABLE distribution_reports ADD COLUMN auto_confirmed_at TEXT"],
    ["resolution_action", "ALTER TABLE distribution_reports ADD COLUMN resolution_action TEXT"],
    ["resolution_note", "ALTER TABLE distribution_reports ADD COLUMN resolution_note TEXT"],
    ["resolved_by", "ALTER TABLE distribution_reports ADD COLUMN resolved_by TEXT"],
    ["resolved_at", "ALTER TABLE distribution_reports ADD COLUMN resolved_at TEXT"],
    ["manager_submission_count", "ALTER TABLE distribution_reports ADD COLUMN manager_submission_count INTEGER NOT NULL DEFAULT 1"],
    ["manager_reopen_allowed", "ALTER TABLE distribution_reports ADD COLUMN manager_reopen_allowed INTEGER NOT NULL DEFAULT 0"],
    ["manager_reopen_action", "ALTER TABLE distribution_reports ADD COLUMN manager_reopen_action TEXT"],
    ["manager_reopen_authorized_by", "ALTER TABLE distribution_reports ADD COLUMN manager_reopen_authorized_by TEXT"],
    ["manager_reopen_authorized_at", "ALTER TABLE distribution_reports ADD COLUMN manager_reopen_authorized_at TEXT"],
    ["manager_reopen_used_at", "ALTER TABLE distribution_reports ADD COLUMN manager_reopen_used_at TEXT"],
  ] as const;
  for (const [columnName, statement] of distributionReportColumnMigrations) {
    if (!distributionReportColumnNames.has(columnName)) await db.prepare(statement).run();
  }
  await db.prepare(`UPDATE distribution_reports
    SET confirmation_source = 'system', auto_confirmed_at = COALESCE(auto_confirmed_at, created_at)
    WHERE (reported_by = 'System' OR comments = 'অটো-রিসিভড (২ টার পর)')
      AND (COALESCE(confirmation_source, '') <> 'system' OR auto_confirmed_at IS NULL)`).run();
  await db.prepare(`INSERT OR IGNORE INTO distribution_report_submissions (
      report_id, submission_number,
      received_bread, received_egg, received_banana,
      shortage_bread, shortage_egg, shortage_banana,
      excess_bread, excess_egg, excess_banana,
      problem_type, reason, comments, submitted_by, submitted_at
    )
    SELECT id, 1,
      received_bread, received_egg, received_banana,
      shortage_bread, shortage_egg, shortage_banana,
      excess_bread, excess_egg, excess_banana,
      problem_type, reason, comments, reported_by, created_at
    FROM distribution_reports
    WHERE confirmation_source = 'manager'`).run();

  await db.prepare(`INSERT INTO system_settings
      (setting_key, setting_value, updated_by, updated_at)
    VALUES ('runtime_bootstrap_version', ?, 'System', CURRENT_TIMESTAMP)
    ON CONFLICT(setting_key) DO UPDATE SET
      setting_value = excluded.setting_value,
      updated_by = excluded.updated_by,
      updated_at = CURRENT_TIMESTAMP
    WHERE system_settings.setting_value <> excluded.setting_value`)
    .bind(RUNTIME_BOOTSTRAP_VERSION)
    .run();

  ready = true;
  return db;
}
