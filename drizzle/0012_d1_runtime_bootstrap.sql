-- Mark the current schema/data bootstrap as complete so Worker cold starts only
-- perform a read-only version check instead of replaying migrations and seeds.

UPDATE distribution_reports
SET confirmation_source = 'system',
    auto_confirmed_at = COALESCE(auto_confirmed_at, created_at)
WHERE (reported_by = 'System' OR comments = 'অটো-রিসিভড (২ টার পর)')
  AND (COALESCE(confirmation_source, '') <> 'system' OR auto_confirmed_at IS NULL);

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

INSERT INTO system_settings
  (setting_key, setting_value, updated_by, updated_at)
VALUES ('runtime_bootstrap_version', '0012', 'System', CURRENT_TIMESTAMP)
ON CONFLICT(setting_key) DO UPDATE SET
  setting_value = excluded.setting_value,
  updated_by = excluded.updated_by,
  updated_at = CURRENT_TIMESTAMP
WHERE system_settings.setting_value <> excluded.setting_value;
