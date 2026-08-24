"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  Bell,
  Building2,
  CalendarDays,
  Cloud,
  Download,
  History,
  RotateCcw,
  Save,
  School,
  ScrollText,
  Search,
  Settings2,
  ShieldCheck,
  Trash2,
  Upload,
  Users,
  X,
  Pencil,
} from "lucide-react";
import { USER_ROLE_LABELS } from "../lib/user-roles";
import { MealPlanningSettings } from "./MealPlanningSettings";
import { UserManagementWidget } from "./UserManagementWidget";
import "./settings-module.css";

type Area = {
  code: string;
  name_bn: string;
  manager_name: string;
  manager_mobile: string;
  is_active: number;
};
type School = {
  emis_code: string;
  name_bn: string;
  area_code: string;
  area_name: string;
  head_teacher: string;
  legacy_mobile: string;
  serial_number: number;
  current_daily_demand: number;
  is_active: number;
};
type Permission = {
  role: string;
  module: string;
  can_view: number;
  can_manage: number;
};
type Payload = {
  settings: Record<string, string>;
  areas: Area[];
  schools: School[];
  permissions: Permission[];
  audits: Array<Record<string, string>>;
  backups: Array<Record<string, string>>;
  secretStatus: Record<string, boolean>;
};
type TimeTravelPreview = { timestamp: string; bookmark: string };
const tabs = [
  ["general", "সাধারণ"],
  ["schools", "বিদ্যালয় ও অঞ্চল"],
  ["users", "ইউজার ও অনুমতি"],
  ["notifications", "নোটিফিকেশন"],
  ["security", "নিরাপত্তা ও ব্যাকআপ"],
  ["audit", "অডিট লগ"],
] as const;
const settingsTabs = [
  ...tabs.slice(0, 2),
  ["meal-planning", "মাসিক পরিকল্পনা"] as const,
  ...tabs.slice(2),
];
const settingsTabIcons = {
  general: Building2,
  schools: School,
  "meal-planning": CalendarDays,
  users: Users,
  notifications: Bell,
  security: ShieldCheck,
  audit: ScrollText,
} as const;
const moduleLabels: Record<string, string> = {
  dashboard: "ড্যাশবোর্ড",
  areas: "অঞ্চল",
  distribution: "বিতরণ",
  expenses: "খরচ",
  stock: "স্টক",
  suppliers: "সরবরাহকারী",
  reports: "রিপোর্ট",
  users: "ইউজার",
};

export function SettingsModule() {
  const [open, setOpen] = useState(false),
    [tab, setTab] = useState("general");
  const [data, setData] = useState<Payload | null>(null),
    [draft, setDraft] = useState<Record<string, string>>({}),
    [permissions, setPermissions] = useState<Permission[]>([]);
  const [busy, setBusy] = useState(false),
    [dirty, setDirty] = useState(false),
    [message, setMessage] = useState("");
  const [areaForm, setAreaForm] = useState<Partial<Area>>({}),
    [schoolForm, setSchoolForm] = useState<Partial<School>>({});
  const [twoFactor, setTwoFactor] = useState(false);
  const [secretDraft, setSecretDraft] = useState({
    sms_api_secret: "",
    email_api_secret: "",
  });
  const [backupBusy, setBackupBusy] = useState<"" | "download" | "restore">("");
  const [restoreFile, setRestoreFile] = useState<File | null>(null);
  const [timeTravelConfigured, setTimeTravelConfigured] = useState<
      boolean | null
    >(null),
    [timeTravelDate, setTimeTravelDate] = useState(""),
    [timeTravelPreview, setTimeTravelPreview] =
      useState<TimeTravelPreview | null>(null),
    [timeTravelConfirmation, setTimeTravelConfirmation] = useState(""),
    [timeTravelBusy, setTimeTravelBusy] = useState<"" | "preview" | "restore">(
      "",
    );
  const [timeTravelResult, setTimeTravelResult] = useState<{
    previousBookmark?: string;
  } | null>(null);
  const [timeTravelMaxDate] = useState(() =>
    new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString().slice(0, 16),
  );
  const load = useCallback(async () => {
    setBusy(true);
    setMessage("");
    try {
      const r = await fetch("/api/settings", { cache: "no-store" });
      if (!r.ok) throw new Error("সেটিংস লোড করা যায়নি।");
      const p = (await r.json()) as Payload;
      setData(p);
      setDraft(p.settings);
      setPermissions(p.permissions);
      setDirty(false);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "সমস্যা হয়েছে।");
    } finally {
      setBusy(false);
    }
  }, []);
  useEffect(() => {
    const openSettings = () => setOpen(true);
    window.addEventListener("open-system-settings", openSettings);
    return () =>
      window.removeEventListener("open-system-settings", openSettings);
  }, []);
  useEffect(() => {
    if (open) {
      load();
      fetch("/api/settings/2fa")
        .then(async (r) =>
          r.ok ? ((await r.json()) as { enabled?: boolean }) : null,
        )
        .then((x) => x && setTwoFactor(!!x.enabled))
        .catch(() => undefined);
    }
  }, [open, load]);
  useEffect(() => {
    if (open)
      fetch("/api/settings/time-travel", { cache: "no-store" })
        .then(async (r) =>
          r.ok ? ((await r.json()) as { configured?: boolean }) : null,
        )
        .then((x) => setTimeTravelConfigured(!!x?.configured))
        .catch(() => setTimeTravelConfigured(false));
  }, [open]);
  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    addEventListener("beforeunload", warn);
    return () => removeEventListener("beforeunload", warn);
  }, [dirty]);
  const close = () => {
    if (dirty && !confirm("সংরক্ষণ না করা পরিবর্তন আছে। তবুও বন্ধ করবেন?"))
      return;
    setOpen(false);
    setDirty(false);
  };
  const update = (key: string, value: string) => {
    setDraft((v) => ({ ...v, [key]: value }));
    setDirty(true);
  };
  async function save() {
    setBusy(true);
    setMessage("");
    try {
      const r = await fetch("/api/settings", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          settings: draft,
          permissions,
          secrets: secretDraft,
        }),
      });
      const j = (await r.json()) as { error?: string };
      if (!r.ok) throw new Error(j.error);
      setMessage("সেটিংস সফলভাবে সংরক্ষিত হয়েছে।");
      setSecretDraft({ sms_api_secret: "", email_api_secret: "" });
      setDirty(false);
      await load();
      window.dispatchEvent(new Event("system-settings-updated"));
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "সংরক্ষণ করা যায়নি।");
    } finally {
      setBusy(false);
    }
  }
  async function saveEntity(kind: "areas" | "schools", editing: boolean) {
    const body = kind === "areas" ? areaForm : schoolForm;
    setBusy(true);
    try {
      const r = await fetch(`/api/settings/${kind}`, {
        method: editing ? "PUT" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const j = (await r.json()) as { error?: string };
      if (!r.ok) throw new Error(j.error);
      setAreaForm({});
      setSchoolForm({});
      setMessage("তথ্য সংরক্ষিত হয়েছে।");
      await load();
      window.dispatchEvent(new Event("school-data-updated"));
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "সংরক্ষণ করা যায়নি।");
    } finally {
      setBusy(false);
    }
  }
  async function remove(kind: "areas" | "schools", id: string) {
    if (!confirm("নিশ্চিতভাবে নিষ্ক্রিয় করবেন? ইতিহাস মুছে যাবে না।")) return;
    const key = kind === "areas" ? "code" : "emisCode";
    const r = await fetch(
      `/api/settings/${kind}?${key}=${encodeURIComponent(id)}`,
      { method: "DELETE" },
    );
    const j = (await r.json()) as { error?: string };
    setMessage(r.ok ? "নিষ্ক্রিয় করা হয়েছে।" : j.error || "কাজটি করা যায়নি।");
    if (r.ok) await load();
  }
  const permissionRoles = useMemo(
    () => Array.from(new Set(permissions.map((p) => p.role))),
    [permissions],
  );
  const togglePermission = (
    role: string,
    module: string,
    key: "can_view" | "can_manage",
  ) => {
    setPermissions((rows) =>
      rows.map((row) =>
        row.role === role && row.module === module
          ? {
              ...row,
              [key]: row[key] ? 0 : 1,
              ...(key === "can_view" && row.can_view ? { can_manage: 0 } : {}),
            }
          : row,
      ),
    );
    setDirty(true);
  };
  async function configure2fa() {
    try {
      if (twoFactor) {
        const code = prompt("Authenticator app-এর বর্তমান ৬ সংখ্যার code দিন");
        if (!code) return;
        const r = await fetch("/api/settings/2fa", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ action: "disable", code }),
        });
        const j = (await r.json()) as { error?: string };
        if (!r.ok) throw new Error(j.error);
        setTwoFactor(false);
        setMessage("2FA বন্ধ করা হয়েছে।");
        return;
      }
      const begin = await fetch("/api/settings/2fa", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "begin" }),
      });
      const setup = (await begin.json()) as {
        secret?: string;
        uri?: string;
        error?: string;
      };
      if (!begin.ok || !setup.secret) throw new Error(setup.error);
      const code = prompt(
        `Authenticator app-এ এই secret যোগ করুন:\n${setup.secret}\n\nতারপর ৬ সংখ্যার code দিন`,
      );
      if (!code) return;
      const enabled = await fetch("/api/settings/2fa", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "enable", secret: setup.secret, code }),
      });
      const result = (await enabled.json()) as { error?: string };
      if (!enabled.ok) throw new Error(result.error);
      setTwoFactor(true);
      setMessage("2FA সফলভাবে চালু হয়েছে।");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "2FA পরিবর্তন করা যায়নি।");
    }
  }
  async function saveBackupResponse(response: Response) {
    const type = response.headers.get("content-type") || "";
    if (!response.ok) {
      const result = type.includes("json")
        ? ((await response.json()) as { error?: string })
        : null;
      throw new Error(result?.error || "Backup তৈরি করা যায়নি।");
    }
    const blob = await response.blob();
    const disposition = response.headers.get("content-disposition") || "";
    const fileName =
      disposition.match(/filename="([^"]+)"/)?.[1] ||
      `midday-meal-backup-${Date.now()}.json`;
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  async function downloadBackup() {
    setBackupBusy("download");
    setMessage("");
    try {
      await saveBackupResponse(
        await fetch("/api/settings/database-backup", { cache: "no-store" }),
      );
      await load();
      setMessage(
        "Backup file আপনার browser-এর Downloads folder-এ সংরক্ষিত হয়েছে।",
      );
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Backup তৈরি করা যায়নি।");
    } finally {
      setBackupBusy("");
    }
  }
  async function restoreBackup() {
    if (!restoreFile) return;
    if (
      !confirm(
        "Restore করলে বর্তমান database-এর তথ্য নির্বাচিত backup দিয়ে প্রতিস্থাপিত হবে। Restore-এর আগে বর্তমান অবস্থার একটি safety backup download করা হবে। চালিয়ে যাবেন?",
      )
    )
      return;
    setBackupBusy("restore");
    setMessage("");
    try {
      await saveBackupResponse(
        await fetch("/api/settings/database-backup", { cache: "no-store" }),
      );
      const response = await fetch("/api/settings/database-backup", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: await restoreFile.text(),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok)
        throw new Error(result.error || "Backup restore করা যায়নি।");
      setRestoreFile(null);
      await load();
      setMessage(
        "Backup সফলভাবে restore হয়েছে। নিরাপত্তার জন্য login session backup file-এ অন্তর্ভুক্ত করা হয়নি।",
      );
      window.dispatchEvent(new Event("system-settings-updated"));
      window.dispatchEvent(new Event("school-data-updated"));
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Backup restore করা যায়নি।");
    } finally {
      setBackupBusy("");
    }
  }
  function selectedDhakaTimestamp() {
    if (!timeTravelDate) throw new Error("Restore date ও time নির্বাচন করুন।");
    const timestamp = new Date(`${timeTravelDate}:00+06:00`);
    if (Number.isNaN(timestamp.getTime()))
      throw new Error("সঠিক restore date ও time নির্বাচন করুন।");
    return timestamp.toISOString();
  }
  async function previewTimeTravel() {
    setTimeTravelBusy("preview");
    setMessage("");
    setTimeTravelPreview(null);
    setTimeTravelResult(null);
    try {
      const timestamp = selectedDhakaTimestamp();
      const response = await fetch(
        `/api/settings/time-travel?timestamp=${encodeURIComponent(timestamp)}`,
        { cache: "no-store" },
      );
      const result = (await response.json()) as {
        error?: string;
        timestamp?: string;
        bookmark?: string;
      };
      if (!response.ok || !result.timestamp || !result.bookmark)
        throw new Error(result.error || "Restore point যাচাই করা যায়নি।");
      setTimeTravelPreview({
        timestamp: result.timestamp,
        bookmark: result.bookmark,
      });
      setTimeTravelConfirmation("");
    } catch (e) {
      setMessage(
        e instanceof Error ? e.message : "Restore point যাচাই করা যায়নি।",
      );
    } finally {
      setTimeTravelBusy("");
    }
  }
  async function restoreTimeTravel() {
    if (!timeTravelPreview || timeTravelConfirmation !== "RESTORE") return;
    if (
      !confirm(
        "Cloudflare Time Travel restore করলে live database নির্বাচিত সময়ের অবস্থায় overwrite হবে এবং চলমান কাজ ব্যাহত হতে পারে। নিশ্চিতভাবে restore করবেন?",
      )
    )
      return;
    setTimeTravelBusy("restore");
    setMessage("");
    try {
      await saveBackupResponse(
        await fetch("/api/settings/database-backup", { cache: "no-store" }),
      );
      const response = await fetch("/api/settings/time-travel", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...timeTravelPreview,
          confirmation: timeTravelConfirmation,
        }),
      });
      const result = (await response.json()) as {
        error?: string;
        previousBookmark?: string;
      };
      if (!response.ok)
        throw new Error(result.error || "Time Travel restore সম্পন্ন হয়নি।");
      setTimeTravelResult({ previousBookmark: result.previousBookmark });
      setTimeTravelConfirmation("");
      setMessage(
        "Cloudflare Time Travel restore সম্পন্ন হয়েছে। নিচের previous bookmark দিয়ে প্রয়োজনে undo করা যাবে।",
      );
      window.dispatchEvent(new Event("system-settings-updated"));
      window.dispatchEvent(new Event("school-data-updated"));
    } catch (e) {
      setMessage(
        e instanceof Error ? e.message : "Time Travel restore সম্পন্ন হয়নি।",
      );
    } finally {
      setTimeTravelBusy("");
    }
  }
  if (!open) return null;
  return createPortal(
    <div
      className="settings-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="সুপার অ্যাডমিন সেটিংস"
    >
      <section className="settings-modal">
        <header>
          <div className="settings-title">
            <span className="settings-title-icon">
              <Settings2 />
            </span>
            <div>
              <p>SUPER ADMIN CONTROL</p>
              <h2>সিস্টেম সেটিংস</h2>
            </div>
          </div>
          <span className="settings-current-tab">
            {settingsTabs.find(([id]) => id === tab)?.[1]}
          </span>
          <button onClick={close} aria-label="বন্ধ করুন">
            <X />
          </button>
        </header>
        <nav aria-label="সেটিংস বিভাগ">
          {settingsTabs.map(([id, label]) => {
            const Icon = settingsTabIcons[id];
            return (
              <button
                key={id}
                className={tab === id ? "active" : ""}
                onClick={() => setTab(id)}
                aria-current={tab === id ? "page" : undefined}
              >
                <Icon />
                <span>{label}</span>
              </button>
            );
          })}
        </nav>
        <main className={`settings-content settings-content-${tab}`}>
          {busy && !data ? (
            <div className="settings-state">লোড হচ্ছে…</div>
          ) : null}
          {message ? <div className="settings-message">{message}</div> : null}
          {data && tab === "general" && (
            <div className="settings-grid two">
              <Field
                label="প্রতিষ্ঠানের নাম"
                value={draft.institution_name}
                onChange={(v) => update("institution_name", v)}
              />
              <Field
                label="প্রকল্পের নাম"
                value={draft.project_name}
                onChange={(v) => update("project_name", v)}
              />
              <Field
                label="ঠিকানা"
                value={draft.address}
                onChange={(v) => update("address", v)}
              />
              <Field
                label="সাপোর্ট ইমেইল"
                type="email"
                value={draft.support_email}
                onChange={(v) => update("support_email", v)}
              />
              <Field
                label="ফোন"
                value={draft.support_phone}
                onChange={(v) => update("support_phone", v)}
              />
              <label>
                লোগো
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f && f.size <= 500000) {
                      const r = new FileReader();
                      r.onload = () =>
                        update("logo_data_url", String(r.result));
                      r.readAsDataURL(f);
                    } else if (f)
                      setMessage("লোগো সর্বোচ্চ ৫০০ কিলোবাইট হতে পারবে।");
                  }}
                />
              </label>
              <label>
                ভাষা
                <select
                  value={draft.language || "bn"}
                  onChange={(e) => update("language", e.target.value)}
                >
                  <option value="bn">বাংলা</option>
                  <option value="en">English</option>
                </select>
              </label>
              <label>
                টাইমজোন
                <select
                  value={draft.timezone || "Asia/Dhaka"}
                  onChange={(e) => update("timezone", e.target.value)}
                >
                  <option>Asia/Dhaka</option>
                  <option>UTC</option>
                </select>
              </label>
              <label>
                তারিখ ফরমেট
                <select
                  value={draft.date_format || "DD/MM/YYYY"}
                  onChange={(e) => update("date_format", e.target.value)}
                >
                  <option>DD/MM/YYYY</option>
                  <option>DD-MM-YYYY</option>
                </select>
              </label>
            </div>
          )}
          {data && tab === "schools" && (
            <div className="entity-columns">
              <EntityArea
                data={data.areas}
                form={areaForm}
                setForm={setAreaForm}
                save={saveEntity}
                remove={remove}
              />
              <EntitySchool
                data={data.schools}
                areas={data.areas}
                form={schoolForm}
                setForm={setSchoolForm}
                save={saveEntity}
                remove={remove}
              />
            </div>
          )}
          {data && tab === "meal-planning" && <MealPlanningSettings />}
          {data && tab === "users" && (
            <>
              <div className="section-toolbar">
                <div>
                  <h3>ইউজার ও অনুমতি</h3>
                  <p>Super Admin-এর পূর্ণ নিয়ন্ত্রণ পরিবর্তন করা যাবে না।</p>
                </div>
              </div>
              <UserManagementWidget />
              <div className="permission-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>রোল</th>
                      {Object.values(moduleLabels).map((x) => (
                        <th key={x}>
                          {x}
                          <small>দেখা / পরিচালনা</small>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>সুপার অ্যাডমিন 🔒</td>
                      {Object.keys(moduleLabels).map((x) => (
                        <td key={x}>✓ / ✓</td>
                      ))}
                    </tr>
                    {permissionRoles.map((role) => (
                      <tr key={role}>
                        <td>
                          {USER_ROLE_LABELS[
                            role as keyof typeof USER_ROLE_LABELS
                          ] || role}
                        </td>
                        {Object.keys(moduleLabels).map((module) => {
                          const p = permissions.find(
                            (x) => x.role === role && x.module === module,
                          );
                          return (
                            <td key={module}>
                              <input
                                aria-label="দেখা"
                                type="checkbox"
                                checked={!!p?.can_view}
                                onChange={() =>
                                  togglePermission(role, module, "can_view")
                                }
                              />
                              <input
                                aria-label="পরিচালনা"
                                type="checkbox"
                                checked={!!p?.can_manage}
                                disabled={!p?.can_view}
                                onChange={() =>
                                  togglePermission(role, module, "can_manage")
                                }
                              />
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
          {data && tab === "notifications" && (
            <div className="settings-grid two">
              <Toggle
                label="SMS নোটিফিকেশন"
                value={draft.sms_enabled}
                onChange={(v) => update("sms_enabled", v)}
              />
              <Field
                label="SMS Gateway/Provider"
                value={draft.sms_provider}
                onChange={(v) => update("sms_provider", v)}
              />
              <Field
                label={`SMS API secret ${data.secretStatus.sms_api_secret ? "(configured)" : ""}`}
                type="password"
                value={secretDraft.sms_api_secret}
                onChange={(v) => {
                  setSecretDraft((x) => ({ ...x, sms_api_secret: v }));
                  setDirty(true);
                }}
              />
              <Toggle
                label="ইমেইল নোটিফিকেশন"
                value={draft.email_enabled}
                onChange={(v) => update("email_enabled", v)}
              />
              <Field
                label="Email Provider"
                value={draft.email_provider}
                onChange={(v) => update("email_provider", v)}
              />
              <Field
                label={`Email API secret ${data.secretStatus.email_api_secret ? "(configured)" : ""}`}
                type="password"
                value={secretDraft.email_api_secret}
                onChange={(v) => {
                  setSecretDraft((x) => ({ ...x, email_api_secret: v }));
                  setDirty(true);
                }}
              />
              <div className="security-note">
                <ShieldCheck />
                <span>
                  Secret encrypted অবস্থায় সংরক্ষিত হয়; API response ও audit
                  log-এ কখনও ফেরত আসে না।
                </span>
              </div>
            </div>
          )}
          {data && tab === "security" && (
            <div className="settings-grid two">
              <Field
                label="পাসওয়ার্ডের সর্বনিম্ন দৈর্ঘ্য"
                type="number"
                value={draft.password_min_length}
                onChange={(v) => update("password_min_length", v)}
              />
              <Toggle
                label="বড় হাতের অক্ষর আবশ্যক"
                value={draft.password_require_uppercase}
                onChange={(v) => update("password_require_uppercase", v)}
              />
              <Toggle
                label="ছোট হাতের অক্ষর আবশ্যক"
                value={draft.password_require_lowercase}
                onChange={(v) => update("password_require_lowercase", v)}
              />
              <Toggle
                label="সংখ্যা আবশ্যক"
                value={draft.password_require_number}
                onChange={(v) => update("password_require_number", v)}
              />
              <div className="security-note">
                <ShieldCheck />
                <span>
                  Two-factor authentication:{" "}
                  <strong>{twoFactor ? "চালু" : "বন্ধ"}</strong>
                </span>
                <button className="primary" onClick={configure2fa}>
                  {twoFactor ? "2FA বন্ধ করুন" : "2FA চালু করুন"}
                </button>
              </div>
              <section className="backup-workspace">
                <div className="backup-heading">
                  <div>
                    <span>DATABASE PROTECTION</span>
                    <h3>সিস্টেম ব্যাকআপ ও রিস্টোর</h3>
                  </div>
                  <Cloud />
                </div>
                <div className="backup-status-card">
                  <span className="backup-status-icon">
                    <Cloud />
                  </span>
                  <div>
                    <strong>স্বয়ংক্রিয় ব্যাকআপ সক্রিয়</strong>
                    <p>
                      Cloudflare D1 Time Travel-এ system database স্বয়ংক্রিয়ভাবে
                      সংরক্ষিত হয়। আলাদা Scheduled backup toggle প্রয়োজন নেই।
                    </p>
                  </div>
                  <span className="backup-status-pill">Cloudflare D1</span>
                </div>
                <section
                  className={`time-travel-panel ${timeTravelConfigured === false ? "unconfigured" : ""}`}
                >
                  <div className="time-travel-title">
                    <span className="backup-action-icon restore">
                      <RotateCcw />
                    </span>
                    <div>
                      <h3>Cloudflare Time Travel থেকে রিস্টোর</h3>
                      <p>
                        ঢাকা সময় অনুযায়ী restore point যাচাই করে live database
                        আগের অবস্থায় ফিরিয়ে নিন।
                      </p>
                    </div>
                    <span
                      className={`time-travel-connection ${timeTravelConfigured ? "ready" : ""}`}
                    >
                      {timeTravelConfigured === null
                        ? "যাচাই হচ্ছে…"
                        : timeTravelConfigured
                          ? "API সংযুক্ত"
                          : "API configuration প্রয়োজন"}
                    </span>
                  </div>
                  {timeTravelConfigured === false && (
                    <div className="time-travel-warning">
                      Cloudflare D1 Write API token Worker secret হিসেবে
                      configured হলে এই option সক্রিয় হবে। Token browser বা
                      settings response-এ দেখানো হবে না।
                    </div>
                  )}
                  <div className="time-travel-controls">
                    <label>
                      রিস্টোরের তারিখ ও সময় (ঢাকা)
                      <input
                        type="datetime-local"
                        value={timeTravelDate}
                        max={timeTravelMaxDate}
                        onChange={(e) => {
                          setTimeTravelDate(e.target.value);
                          setTimeTravelPreview(null);
                          setTimeTravelResult(null);
                          setTimeTravelConfirmation("");
                        }}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={previewTimeTravel}
                      disabled={
                        !timeTravelConfigured ||
                        !timeTravelDate ||
                        !!timeTravelBusy
                      }
                    >
                      <Search />
                      {timeTravelBusy === "preview"
                        ? "যাচাই হচ্ছে…"
                        : "রিস্টোর পয়েন্ট যাচাই"}
                    </button>
                  </div>
                  {timeTravelPreview && (
                    <div className="time-travel-preview">
                      <div>
                        <strong>রিস্টোর পয়েন্ট পাওয়া গেছে</strong>
                        <span>
                          {new Date(timeTravelPreview.timestamp).toLocaleString(
                            "bn-BD",
                            { timeZone: "Asia/Dhaka" },
                          )}
                        </span>
                        <code>{timeTravelPreview.bookmark}</code>
                      </div>
                      <label>
                        নিশ্চিত করতে RESTORE লিখুন
                        <input
                          value={timeTravelConfirmation}
                          onChange={(e) =>
                            setTimeTravelConfirmation(e.target.value)
                          }
                          autoComplete="off"
                        />
                      </label>
                      <button
                        className="time-travel-restore"
                        type="button"
                        onClick={restoreTimeTravel}
                        disabled={
                          timeTravelConfirmation !== "RESTORE" ||
                          !!timeTravelBusy
                        }
                      >
                        <RotateCcw />
                        {timeTravelBusy === "restore"
                          ? "রিস্টোর হচ্ছে…"
                          : "Cloudflare থেকে রিস্টোর করুন"}
                      </button>
                    </div>
                  )}
                  {timeTravelResult?.previousBookmark && (
                    <div className="time-travel-result">
                      <strong>Undo bookmark</strong>
                      <code>{timeTravelResult.previousBookmark}</code>
                      <p>
                        প্রয়োজনে Cloudflare Wrangler দিয়ে এই bookmark-এ restore
                        করে পরিবর্তন undo করা যাবে।
                      </p>
                    </div>
                  )}
                </section>
                <div className="backup-action-grid">
                  <article>
                    <span className="backup-action-icon">
                      <Download />
                    </span>
                    <div>
                      <h3>ম্যানুয়াল ব্যাকআপ</h3>
                      <p>
                        সম্পূর্ণ system data JSON file হিসেবে এই device-এর
                        Downloads folder-এ সংরক্ষণ করুন।
                      </p>
                    </div>
                    <button
                      className="primary"
                      type="button"
                      onClick={downloadBackup}
                      disabled={!!backupBusy}
                    >
                      <Download />
                      {backupBusy === "download"
                        ? "তৈরি হচ্ছে…"
                        : "এখনই ব্যাকআপ নিন"}
                    </button>
                  </article>
                  <article>
                    <span className="backup-action-icon restore">
                      <Upload />
                    </span>
                    <div>
                      <h3>ব্যাকআপ রিস্টোর</h3>
                      <p>
                        এই system থেকে download করা JSON backup file নির্বাচন
                        করুন। Restore-এর আগে safety backup নেওয়া হবে।
                      </p>
                    </div>
                    <label className="backup-file-button">
                      <Upload />
                      ফাইল নির্বাচন
                      <input
                        type="file"
                        accept="application/json,.json"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          if (file && file.size > 15 * 1024 * 1024) {
                            setMessage("Backup file সর্বোচ্চ ১৫ MB হতে পারবে।");
                            e.target.value = "";
                            setRestoreFile(null);
                            return;
                          }
                          setRestoreFile(file);
                        }}
                      />
                    </label>
                    {restoreFile && (
                      <div className="backup-selected-file">
                        <strong>{restoreFile.name}</strong>
                        <span>
                          {Math.max(1, Math.round(restoreFile.size / 1024))} KB
                        </span>
                      </div>
                    )}
                    <button
                      className="backup-restore-button"
                      type="button"
                      onClick={restoreBackup}
                      disabled={!restoreFile || !!backupBusy}
                    >
                      <Upload />
                      {backupBusy === "restore"
                        ? "রিস্টোর হচ্ছে…"
                        : "নির্বাচিত ব্যাকআপ রিস্টোর"}
                    </button>
                  </article>
                </div>
                <div className="backup-history">
                  <div className="backup-history-title">
                    <History />
                    <strong>সাম্প্রতিক কার্যক্রম</strong>
                  </div>
                  {data.backups.length === 0 ? (
                    <div className="empty">
                      এখনও কোনো manual backup বা restore record নেই।
                    </div>
                  ) : (
                    data.backups.slice(0, 5).map((item) => (
                      <article key={String(item.id)}>
                        <span
                          className={`backup-run-status ${String(item.status)}`}
                        ></span>
                        <div>
                          <strong>
                            {item.frequency === "time-travel"
                              ? "Cloudflare Time Travel"
                              : item.frequency === "restore"
                                ? "Backup restore"
                                : item.frequency === "manual"
                                  ? "Manual backup"
                                  : String(item.frequency)}
                          </strong>
                          <small>
                            {String(item.completed_at || item.started_at || "")}
                          </small>
                        </div>
                        <span>
                          {item.status === "completed"
                            ? "সম্পন্ন"
                            : String(item.status)}
                        </span>
                      </article>
                    ))
                  )}
                </div>
              </section>
            </div>
          )}
          {data && tab === "audit" && (
            <div className="audit-list">
              {data.audits.length === 0 ? (
                <div className="empty">কোনো অডিট লগ নেই।</div>
              ) : (
                data.audits.map((a) => (
                  <article key={a.id}>
                    <strong>{a.action}</strong>
                    <span>
                      {a.actor} · {a.entity_type} #{a.entity_id}
                    </span>
                    <time>{a.created_at}</time>
                  </article>
                ))
              )}
            </div>
          )}
        </main>
        <footer>
          <button onClick={close}>বন্ধ করুন</button>
          <button className="primary" disabled={busy || !dirty} onClick={save}>
            <Save size={16} />
            {busy ? "সংরক্ষণ হচ্ছে…" : "পরিবর্তন সংরক্ষণ"}
          </button>
        </footer>
      </section>
    </div>,
    document.body,
  );
}

function Field({
  label,
  value = "",
  onChange,
  type = "text",
}: {
  label: string;
  value?: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <label>
      {label}
      <input
        type={type}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}
function Toggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value?: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="toggle">
      <input
        type="checkbox"
        checked={value === "1"}
        onChange={(e) => onChange(e.target.checked ? "1" : "0")}
      />
      <span>{label}</span>
    </label>
  );
}
function EntityArea({
  data,
  form,
  setForm,
  save,
  remove,
}: {
  data: Area[];
  form: Partial<Area>;
  setForm: (x: Partial<Area>) => void;
  save: (k: "areas", e: boolean) => void;
  remove: (k: "areas", id: string) => void;
}) {
  const editing = !!data.find((x) => x.code === form.code);
  return (
    <section className="entity-panel">
      <h3>অঞ্চল</h3>
      <div className="inline-form">
        <input
          placeholder="কোড"
          disabled={editing}
          value={form.code || ""}
          onChange={(e) => setForm({ ...form, code: e.target.value })}
        />
        <input
          placeholder="অঞ্চলের নাম"
          value={form.name_bn || ""}
          onChange={(e) => setForm({ ...form, name_bn: e.target.value })}
        />
        <button className="primary" onClick={() => save("areas", editing)}>
          {editing ? "আপডেট" : "যোগ করুন"}
        </button>
      </div>
      <div className="entity-list">
        {data.map((x) => (
          <article key={x.code} className={!x.is_active ? "inactive" : ""}>
            <div>
              <strong>{x.name_bn}</strong>
              <small>{x.code}</small>
            </div>
            <div>
              <button onClick={() => setForm(x)}>
                <Pencil />
              </button>
              <button onClick={() => remove("areas", x.code)}>
                <Trash2 />
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
function EntitySchool({
  data,
  areas,
  form,
  setForm,
  save,
  remove,
}: {
  data: School[];
  areas: Area[];
  form: Partial<School>;
  setForm: (x: Partial<School>) => void;
  save: (k: "schools", e: boolean) => void;
  remove: (k: "schools", id: string) => void;
}) {
  const editing = !!data.find((x) => x.emis_code === form.emis_code);
  return (
    <section className="entity-panel wide">
      <h3>বিদ্যালয় ও অঞ্চল স্থানান্তর</h3>
      <div className="inline-form school">
        <input
          type="number"
          min="1"
          placeholder="ক্রমিক"
          aria-label="বিদ্যালয়ের ক্রমিক"
          value={form.serial_number || ""}
          onChange={(e) =>
            setForm({ ...form, serial_number: Number(e.target.value) })
          }
        />
        <input
          placeholder="EMIS"
          disabled={editing}
          value={form.emis_code || ""}
          onChange={(e) => setForm({ ...form, emis_code: e.target.value })}
        />
        <input
          placeholder="বিদ্যালয়ের নাম"
          value={form.name_bn || ""}
          onChange={(e) => setForm({ ...form, name_bn: e.target.value })}
        />
        <select
          value={form.area_code || ""}
          onChange={(e) => setForm({ ...form, area_code: e.target.value })}
        >
          <option value="">অঞ্চল</option>
          {areas
            .filter((x) => x.is_active)
            .map((x) => (
              <option key={x.code} value={x.code}>
                {x.name_bn}
              </option>
            ))}
        </select>
        <input
          type="number"
          placeholder="দৈনিক চাহিদা"
          value={form.current_daily_demand || ""}
          onChange={(e) =>
            setForm({ ...form, current_daily_demand: Number(e.target.value) })
          }
        />
        <button className="primary" onClick={() => save("schools", editing)}>
          {editing ? "আপডেট" : "যোগ করুন"}
        </button>
      </div>
      <div className="entity-list">
        {data.map((x) => (
          <article key={x.emis_code} className={!x.is_active ? "inactive" : ""}>
            <div>
              <strong>
                {x.serial_number}. {x.name_bn}
              </strong>
              <small>
                {x.emis_code} · {x.area_name}
              </small>
            </div>
            <div>
              <button
                aria-label={`${x.name_bn} সম্পাদনা`}
                onClick={() => setForm(x)}
              >
                <Pencil />
              </button>
              <button onClick={() => remove("schools", x.emis_code)}>
                <Trash2 />
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
