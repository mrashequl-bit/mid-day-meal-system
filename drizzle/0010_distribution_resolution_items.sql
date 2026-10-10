CREATE TABLE IF NOT EXISTS distribution_resolution_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  report_id INTEGER NOT NULL REFERENCES distribution_reports(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  item_code TEXT NOT NULL CHECK(item_code IN ('bun', 'egg', 'banana')),
  direction TEXT NOT NULL CHECK(direction IN ('shortage', 'excess')),
  quantity INTEGER NOT NULL CHECK(quantity > 0),
  created_by TEXT NOT NULL,
  note TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS dist_resolution_report_idx
  ON distribution_resolution_items(report_id);
