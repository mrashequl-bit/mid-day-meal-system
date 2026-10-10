import { ensureDatabase } from "../../db/bootstrap";
import { unseal } from "./secret-box";

export const SETTINGS_KEYS = [
  "institution_name", "project_name", "address", "support_email", "support_phone",
  "logo_data_url", "language", "timezone", "date_format", "password_min_length",
  "password_require_uppercase", "password_require_lowercase", "password_require_number",
  "backup_enabled", "backup_frequency", "backup_day", "backup_time", "sms_enabled",
  "sms_provider", "email_enabled", "email_provider",
  "daily_report_enabled", "daily_report_time", "daily_report_emails",
  "daily_report_sender", "telegram_enabled", "telegram_destinations",
] as const;

export const PERMISSION_MODULES = ["dashboard", "areas", "distribution", "expenses", "stock", "suppliers", "reports", "users"] as const;

export async function getSettings() {
  const db = await ensureDatabase();
  const rows = await db.prepare("SELECT setting_key, setting_value FROM system_settings WHERE is_secret = 0").all<{ setting_key: string; setting_value: string }>();
  return Object.fromEntries(rows.results.map((row) => [row.setting_key, row.setting_value]));
}

export async function getSecretSetting(key: string) {
  const db = await ensureDatabase();
  const row = await db.prepare(
    "SELECT setting_value FROM system_settings WHERE setting_key = ? AND is_secret = 1",
  ).bind(key).first<{ setting_value: string }>();
  if (!row?.setting_value) return "";
  return unseal(row.setting_value);
}

export async function validatePasswordPolicy(password: string, username = "") {
  const settings = await getSettings();
  const min = Math.max(6, Math.min(64, Number(settings.password_min_length || 8)));
  if (password.length < min) return `পাসওয়ার্ড কমপক্ষে ${min} অক্ষরের হতে হবে।`;
  if (username && password.toLocaleLowerCase() === username.trim().toLocaleLowerCase()) {
    return "পাসওয়ার্ড ইউজারনেমের মতো রাখা যাবে না।";
  }
  if (settings.password_require_uppercase === "1" && !/[A-Z]/.test(password)) return "পাসওয়ার্ডে একটি বড় হাতের ইংরেজি অক্ষর থাকতে হবে।";
  if (settings.password_require_lowercase === "1" && !/[a-z]/.test(password)) return "পাসওয়ার্ডে একটি ছোট হাতের ইংরেজি অক্ষর থাকতে হবে।";
  if (settings.password_require_number === "1" && !/\d/.test(password)) return "পাসওয়ার্ডে একটি সংখ্যা থাকতে হবে।";
  return null;
}

export async function writeAudit(actor: string, action: string, entityType: string, entityId: string, before: unknown = null, after: unknown = null) {
  const db = await ensureDatabase();
  const clean = (value: unknown) => value == null ? null : JSON.stringify(value, (key, current) => /password|secret|token/i.test(key) ? "[REDACTED]" : current);
  await db.prepare(`INSERT INTO audit_logs (actor, action, entity_type, entity_id, before_json, after_json) VALUES (?, ?, ?, ?, ?, ?)`)
    .bind(actor, action, entityType, entityId, clean(before), clean(after)).run();
}
