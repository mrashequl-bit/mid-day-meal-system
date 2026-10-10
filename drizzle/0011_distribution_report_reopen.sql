ALTER TABLE distribution_reports ADD COLUMN manager_submission_count INTEGER NOT NULL DEFAULT 1;
ALTER TABLE distribution_reports ADD COLUMN manager_reopen_allowed INTEGER NOT NULL DEFAULT 0;
ALTER TABLE distribution_reports ADD COLUMN manager_reopen_action TEXT;
ALTER TABLE distribution_reports ADD COLUMN manager_reopen_authorized_by TEXT;
ALTER TABLE distribution_reports ADD COLUMN manager_reopen_authorized_at TEXT;
ALTER TABLE distribution_reports ADD COLUMN manager_reopen_used_at TEXT;

CREATE TABLE distribution_report_submissions (
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
);

CREATE INDEX dist_report_submission_report_idx ON distribution_report_submissions(report_id);

INSERT OR IGNORE INTO distribution_report_submissions (
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
WHERE confirmation_source = 'manager';
