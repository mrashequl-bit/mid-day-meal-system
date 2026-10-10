ALTER TABLE distribution_reports ADD COLUMN confirmation_source TEXT NOT NULL DEFAULT 'manager';
ALTER TABLE distribution_reports ADD COLUMN auto_confirmed_at TEXT;
ALTER TABLE distribution_reports ADD COLUMN resolution_action TEXT;
ALTER TABLE distribution_reports ADD COLUMN resolution_note TEXT;
ALTER TABLE distribution_reports ADD COLUMN resolved_by TEXT;
ALTER TABLE distribution_reports ADD COLUMN resolved_at TEXT;

UPDATE distribution_reports
SET confirmation_source = 'system', auto_confirmed_at = COALESCE(auto_confirmed_at, created_at)
WHERE reported_by = 'System' OR comments = 'অটো-রিসিভড (২ টার পর)';

CREATE TABLE IF NOT EXISTS distribution_adjustments (
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
);

CREATE INDEX IF NOT EXISTS dist_adj_school_month_idx
ON distribution_adjustments(school_emis_code, plan_month);
