CREATE TABLE IF NOT EXISTS meal_plan_periods (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft', 'active')),
  created_by TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHECK(start_date <= end_date)
);

CREATE TABLE IF NOT EXISTS meal_plan_days (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  period_id INTEGER NOT NULL REFERENCES meal_plan_periods(id) ON DELETE CASCADE,
  plan_date TEXT NOT NULL,
  items_json TEXT NOT NULL DEFAULT '[]',
  updated_by TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(period_id, plan_date)
);

CREATE INDEX IF NOT EXISTS meal_plan_period_status_idx ON meal_plan_periods(status, start_date, end_date);
CREATE INDEX IF NOT EXISTS meal_plan_day_date_idx ON meal_plan_days(plan_date, period_id);
