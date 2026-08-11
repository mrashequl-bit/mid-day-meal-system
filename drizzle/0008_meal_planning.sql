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

INSERT INTO meal_plan_periods (name, start_date, end_date, status, created_by)
SELECT 'আগস্ট ২০২৬', '2026-08-01', '2026-08-31', 'active', 'sunny'
WHERE NOT EXISTS (
  SELECT 1 FROM meal_plan_periods
  WHERE start_date = '2026-08-01' AND end_date = '2026-08-31'
);

WITH august_plan(plan_date, items_json) AS (
  VALUES
    ('2026-08-02', '["bun","egg"]'),
    ('2026-08-03', '["bun"]'),
    ('2026-08-04', '["banana"]'),
    ('2026-08-06', '["bun","egg"]'),
    ('2026-08-09', '["bun","egg"]'),
    ('2026-08-10', '["bun"]'),
    ('2026-08-11', '["banana"]'),
    ('2026-08-13', '["bun","egg"]'),
    ('2026-08-16', '["bun","egg"]'),
    ('2026-08-17', '["bun"]'),
    ('2026-08-18', '["banana"]'),
    ('2026-08-19', '["bun","egg"]'),
    ('2026-08-20', '["bun","egg"]'),
    ('2026-08-23', '["bun","egg"]'),
    ('2026-08-24', '["bun"]'),
    ('2026-08-25', '["banana"]'),
    ('2026-08-27', '["bun","egg"]'),
    ('2026-08-30', '["bun","egg"]'),
    ('2026-08-31', '["bun"]')
)
INSERT OR IGNORE INTO meal_plan_days (period_id, plan_date, items_json, updated_by)
SELECT id, plan_date, items_json, 'sunny'
FROM meal_plan_periods
JOIN august_plan
WHERE meal_plan_periods.start_date = '2026-08-01'
  AND meal_plan_periods.end_date = '2026-08-31';
