import { NextResponse } from "next/server";
import { ensureDatabase } from "../../../db/bootstrap";
import { requireSuperAdmin } from "../../lib/auth";
import { PERMISSION_MODULES, SETTINGS_KEYS, getSettings, writeAudit } from "../../lib/admin-settings";
import { seal } from "../../lib/secret-box";

export async function GET() {
  const user = await requireSuperAdmin();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const db = await ensureDatabase();
  const [settings, permissions, schools, areas, audits, backups, secretRows, deliveryRuns] = await Promise.all([
    getSettings(),
    db.prepare("SELECT role, module, can_view, can_manage FROM role_permissions ORDER BY role, module").all(),
    db.prepare(`SELECT s.emis_code, s.name_bn, s.area_code, s.head_teacher, s.legacy_mobile, s.union_name, s.cluster_name, s.serial_number, s.current_daily_demand, s.is_active, a.name_bn area_name FROM schools s JOIN areas a ON a.code=s.area_code ORDER BY s.is_active DESC, COALESCE(s.serial_number, 999999), s.name_bn`).all(),
    db.prepare(`SELECT a.code, a.name_bn, a.manager_name, a.manager_mobile, a.is_active,
      (SELECT COUNT(*) FROM schools s WHERE s.area_code=a.code) AS school_count,
      (SELECT COUNT(*) FROM users u WHERE u.area_code=a.code) AS user_count
      FROM areas a ORDER BY a.is_active DESC, a.name_bn`).all(),
    db.prepare("SELECT id, actor, action, entity_type, entity_id, created_at FROM audit_logs ORDER BY id DESC LIMIT 100").all(),
    db.prepare("SELECT id, frequency, status, details, started_at, completed_at FROM backup_runs ORDER BY id DESC LIMIT 20").all(),
    db.prepare("SELECT setting_key FROM system_settings WHERE is_secret=1 AND setting_value<>''").all<{setting_key:string}>(),
    db.prepare(`SELECT id, report_date, channel, recipient, status, error_message, is_test, created_at
      FROM report_delivery_runs ORDER BY id DESC LIMIT 10`).all(),
  ]);
  return NextResponse.json({ settings, permissions: permissions.results, schools: schools.results, areas: areas.results, audits: audits.results, backups: backups.results, deliveryRuns: deliveryRuns.results, secretStatus: Object.fromEntries(secretRows.results.map(x=>[x.setting_key,true])) });
}

export async function PUT(request: Request) {
  const user = await requireSuperAdmin();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const body = await request.json() as { settings?: Record<string, unknown>; permissions?: Array<Record<string, unknown>>; secrets?: Record<string, unknown> };
    const db = await ensureDatabase();
    const before = await getSettings();
    if (body.settings) {
      for (const [key, raw] of Object.entries(body.settings)) {
        if (!SETTINGS_KEYS.includes(key as typeof SETTINGS_KEYS[number])) continue;
        const value = String(raw ?? "").trim();
        if (key === "language" && !["bn", "en"].includes(value)) throw new Error("সঠিক ভাষা নির্বাচন করুন।");
        if (key === "date_format" && !["DD/MM/YYYY", "DD-MM-YYYY"].includes(value)) throw new Error("সঠিক তারিখ ফরমেট নির্বাচন করুন।");
        if (key === "logo_data_url" && value.length > 700000) throw new Error("লোগোর আকার ৫০০ কিলোবাইটের মধ্যে রাখুন।");
        if (key === "daily_report_time" && value !== "16:00") throw new Error("দৈনিক রিপোর্টের নির্ধারিত সময় বিকেল ৪:০০।");
        if (key === "daily_report_sender" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) throw new Error("সঠিক রিপোর্ট sender email দিন।");
        if (key === "daily_report_emails") {
          let emails: unknown;
          try { emails = JSON.parse(value); } catch { throw new Error("রিপোর্ট গ্রহণকারীর email তালিকা সঠিক নয়।"); }
          if (!Array.isArray(emails) || emails.length > 25 || emails.some((email) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email)))) {
            throw new Error("সর্বোচ্চ ২৫টি সঠিক email address যোগ করুন।");
          }
        }
        if (key === "telegram_destinations") {
          let destinations: unknown;
          try { destinations = JSON.parse(value); } catch { throw new Error("Telegram গন্তব্যের তালিকা সঠিক নয়।"); }
          if (!Array.isArray(destinations) || destinations.length > 25 || destinations.some((destination) => !/^(?:-?\d+|@[A-Za-z0-9_]{5,})$/.test(String(destination)))) {
            throw new Error("Telegram Chat ID অথবা @channel username সঠিকভাবে দিন।");
          }
        }
        await db.prepare(`INSERT INTO system_settings (setting_key, setting_value, updated_by, updated_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)
          ON CONFLICT(setting_key) DO UPDATE SET setting_value=excluded.setting_value, updated_by=excluded.updated_by, updated_at=CURRENT_TIMESTAMP`)
          .bind(key, value, user.username).run();
      }
    }
    if (body.secrets) {
      for (const key of ["sms_api_secret", "email_api_secret", "telegram_bot_token"] as const) {
        const plain = String(body.secrets[key] || "").trim();
        if (!plain) continue;
        await db.prepare(`INSERT INTO system_settings (setting_key, setting_value, is_secret, updated_by, updated_at) VALUES (?, ?, 1, ?, CURRENT_TIMESTAMP)
          ON CONFLICT(setting_key) DO UPDATE SET setting_value=excluded.setting_value, is_secret=1, updated_by=excluded.updated_by, updated_at=CURRENT_TIMESTAMP`)
          .bind(key, await seal(plain), user.username).run();
      }
    }
    if (Array.isArray(body.permissions)) {
      for (const row of body.permissions) {
        const role = String(row.role || "");
        const moduleName = String(row.module || "");
        if (role === "super_admin" || !PERMISSION_MODULES.includes(moduleName as typeof PERMISSION_MODULES[number])) continue;
        const view = row.can_view ? 1 : 0;
        const manage = view && row.can_manage ? 1 : 0;
        await db.prepare(`INSERT INTO role_permissions (role, module, can_view, can_manage, updated_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
          ON CONFLICT(role,module) DO UPDATE SET can_view=excluded.can_view, can_manage=excluded.can_manage, updated_at=CURRENT_TIMESTAMP`)
          .bind(role, moduleName, view, manage).run();
      }
    }
    const after = await getSettings();
    await writeAudit(user.username, "settings.updated", "system_settings", "global", before, after);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "সেটিংস সংরক্ষণ করা যায়নি।" }, { status: 400 });
  }
}
