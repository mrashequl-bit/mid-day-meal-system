import { ensureDatabase } from "../../db/bootstrap";
import { decorateReportsWithAdjustments } from "./distribution-adjustments";
import { getSecretSetting, getSettings } from "./admin-settings";

export type DeliveryEnv = {
  BROWSER?: BrowserRun;
  EMAIL?: SendEmail;
};

type SchoolRow = {
  emis_code: string;
  name_bn: string;
  area_name: string;
  serial_number: number | null;
  current_daily_demand: number;
};

type ReportRow = Record<string, unknown> & {
  id: number;
  date: string;
  school_emis_code: string;
  area_code: string;
  status: string;
  reason: string;
  resolution_reason: string | null;
};

const ITEM_META = {
  bun: { label: "রুটি", statusLabel: "বনরুটি", received: "received_bread", shortage: "shortage_bread", excess: "excess_bread" },
  egg: { label: "ডিম", statusLabel: "সিদ্ধ ডিম", received: "received_egg", shortage: "shortage_egg", excess: "excess_egg" },
  banana: { label: "কলা", statusLabel: "কলা", received: "received_banana", shortage: "shortage_banana", excess: "excess_banana" },
} as const;

type MealItemCode = keyof typeof ITEM_META;

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function parseList(value = "") {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String).map((item) => item.trim()).filter(Boolean) : [];
  } catch {
    return value.split(/[\n,;]/).map((item) => item.trim()).filter(Boolean);
  }
}

function dhakaDate(value: Date | number = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Dhaka",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(value);
  const get = (type: string) => parts.find((part) => part.type === type)?.value || "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

function formatDateBn(date: string) {
  return new Intl.DateTimeFormat("bn-BD", {
    timeZone: "Asia/Dhaka",
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  }).format(new Date(`${date}T12:00:00+06:00`));
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("bn-BD", { maximumFractionDigits: 0 }).format(value);
}

async function getMealItems(db: D1Database, date: string): Promise<MealItemCode[]> {
  const configured = await db.prepare(`SELECT d.items_json
    FROM meal_plan_periods p
    LEFT JOIN meal_plan_days d ON d.period_id = p.id AND d.plan_date = ?
    WHERE p.status = 'active' AND p.start_date <= ? AND p.end_date >= ?
    ORDER BY p.updated_at DESC, p.id DESC LIMIT 1`)
    .bind(date, date, date)
    .first<{ items_json: string | null }>();
  if (configured) {
    try {
      const parsed = JSON.parse(configured.items_json || "[]");
      return Array.isArray(parsed)
        ? parsed.map(String).filter((item): item is MealItemCode => item in ITEM_META)
        : [];
    } catch {
      return [];
    }
  }
  const day = new Date(`${date}T12:00:00+06:00`).getUTCDay();
  if ([0, 3, 4].includes(day)) return ["bun", "egg"];
  if (day === 1) return ["bun"];
  if (day === 2) return ["banana"];
  return [];
}

async function buildDailyDistributionReportHtml(date: string, items: MealItemCode[]) {
  const db = await ensureDatabase();
  const settings = await getSettings();
  const [schoolsResult, reportsResult] = await Promise.all([
    db.prepare(`SELECT s.emis_code, s.name_bn, a.name_bn AS area_name,
      s.serial_number, s.current_daily_demand
      FROM schools s JOIN areas a ON a.code = s.area_code
      WHERE s.is_active = 1
      ORDER BY COALESCE(s.serial_number, 999999), s.name_bn`).all<SchoolRow>(),
    db.prepare("SELECT * FROM distribution_reports WHERE date = ?").bind(date).all<ReportRow>(),
  ]);
  const decoratedReports = await decorateReportsWithAdjustments(db, reportsResult.results, date.slice(0, 7));
  const reports = new Map(decoratedReports.map((report) => [report.school_emis_code, report]));
  const totals = Object.fromEntries(items.map((code) => [code, { planned: 0, received: 0, shortage: 0, excess: 0 }])) as Record<string, { planned: number; received: number; shortage: number; excess: number }>;

  const rows = schoolsResult.results.map((school, index) => {
    const report = reports.get(school.emis_code);
    const planned = Number(school.current_daily_demand || 0);
    const plannedItems: string[] = [];
    const receivedItems: string[] = [];
    const differenceItems: string[] = [];
    const statusDifferenceItems: string[] = [];
    for (const code of items) {
      const meta = ITEM_META[code];
      const received = report ? Number(report[`effective_received_${code}`] ?? report[meta.received] ?? 0) : planned;
      const shortage = report ? Number(report[`outstanding_shortage_${code}`] ?? report[meta.shortage] ?? 0) : 0;
      const excess = report ? Number(report[`outstanding_excess_${code}`] ?? report[meta.excess] ?? 0) : 0;
      totals[code].planned += planned;
      totals[code].received += received;
      totals[code].shortage += Math.max(0, shortage - excess);
      totals[code].excess += Math.max(0, excess - shortage);
      plannedItems.push(`${formatNumber(planned)} ${meta.label}`);
      receivedItems.push(`${formatNumber(received)} ${meta.label}`);
      if (shortage > excess) {
        const difference = formatNumber(shortage - excess);
        differenceItems.push(`${difference} ${meta.label} ঘাটতি`);
        statusDifferenceItems.push(`${difference} টি ${meta.statusLabel} কম`);
      }
      if (excess > shortage) {
        const difference = formatNumber(excess - shortage);
        differenceItems.push(`${difference} ${meta.label} অতিরিক্ত`);
        statusDifferenceItems.push(`${difference} টি ${meta.statusLabel} বেশি`);
      }
    }
    const status = !items.length
      ? "বিতরণ নেই"
      : !report
        ? "রিপোর্টের অপেক্ষায়"
        : statusDifferenceItems.length
          ? `${statusDifferenceItems.join(" এবং ")} দেওয়া হয়েছে`
          : "সম্পূর্ণ প্রাপ্ত";
    const rowClass = differenceItems.length ? "has-difference" : report ? "is-reported" : "is-pending";
    return `<tr class="${rowClass}">
      <td>${formatNumber(Number(school.serial_number || index + 1))}</td>
      <td><strong>${escapeHtml(school.name_bn)}</strong><small>${escapeHtml(school.area_name)} · EMIS ${escapeHtml(school.emis_code)}</small></td>
      <td>${escapeHtml(plannedItems.join(" এবং ") || "—")}</td>
      <td>${escapeHtml(receivedItems.join(" এবং ") || "—")}</td>
      <td>${escapeHtml(differenceItems.join(", ") || "—")}</td>
      <td><span class="status-pill">${escapeHtml(status)}</span></td>
    </tr>`;
  }).join("");

  const summary = items.map((code) => {
    const meta = ITEM_META[code];
    const value = totals[code];
    const diff = value.shortage ? ` · ঘাটতি ${formatNumber(value.shortage)}` : value.excess ? ` · অতিরিক্ত ${formatNumber(value.excess)}` : " · পার্থক্য ০";
    return `<article><strong>${meta.label}</strong><span>বরাদ্দ ${formatNumber(value.planned)} · প্রাপ্ত ${formatNumber(value.received)}${diff}</span></article>`;
  }).join("");

  return `<!doctype html><html lang="bn"><head><meta charset="utf-8"><style>
    @font-face{font-family:"Anek Bangla Report";src:url("https://cdn.jsdelivr.net/npm/@fontsource/anek-bangla@5.3.0/files/anek-bangla-bengali-400-normal.woff2") format("woff2");font-style:normal;font-weight:400;font-display:block}
    @font-face{font-family:"Anek Bangla Report";src:url("https://cdn.jsdelivr.net/npm/@fontsource/anek-bangla@5.3.0/files/anek-bangla-bengali-600-normal.woff2") format("woff2");font-style:normal;font-weight:600;font-display:block}
    @font-face{font-family:"Anek Bangla Report";src:url("https://cdn.jsdelivr.net/npm/@fontsource/anek-bangla@5.3.0/files/anek-bangla-bengali-700-normal.woff2") format("woff2");font-style:normal;font-weight:700;font-display:block}
    @page{size:A4 portrait;margin:6mm}
    *{box-sizing:border-box}
    html,body{width:100%;max-width:100%}
    html{-webkit-print-color-adjust:exact;print-color-adjust:exact}
    body{margin:0;color:#113c34;background:#fff;font-family:"Anek Bangla Report","Noto Sans Bengali",sans-serif;font-size:6.8pt;font-weight:400;line-height:1.12;text-rendering:geometricPrecision;-webkit-font-smoothing:antialiased}
    header{display:flex;align-items:center;justify-content:space-between;gap:5mm;border:1px solid #b8d8cf;border-left:2mm solid #08745e;border-radius:2mm;padding:2mm 2.4mm;margin-bottom:2.2mm;background:#f4faf8}
    header .eyebrow{display:block;margin-bottom:.3mm;color:#08745e;font-size:5.8pt;font-weight:700;letter-spacing:.12mm}
    h1{font-size:11.8pt;line-height:1;margin:0;font-weight:700;color:#0b443a}
    header .report-meta{max-width:75mm;text-align:right}
    header .report-meta strong,header .report-meta span{display:block}
    header .report-meta strong{font-size:7.2pt;font-weight:700;color:#173f38}
    header .report-meta span{margin-top:.3mm;color:#526d66;font-size:5.8pt}
    .summary{display:grid;grid-template-columns:repeat(${Math.max(1, items.length)},minmax(0,1fr));gap:1.5mm;margin:0 0 2.2mm}
    .summary article{display:flex;align-items:center;justify-content:space-between;gap:2mm;min-width:0;min-height:10mm;border:1px solid #c5ddd7;border-radius:1.6mm;padding:1.3mm 1.6mm;background:#f1faf7}
    .summary strong,.summary span{display:block;min-width:0}
    .summary strong{flex:none;font-size:8pt;font-weight:700;color:#075f4e}
    .summary span{text-align:right;color:#315d53;font-size:6pt;font-weight:600;overflow-wrap:anywhere}
    table{width:100%;max-width:100%;border-collapse:collapse;table-layout:fixed;border:1px solid #9fc7bc}
    thead{display:table-header-group}
    tbody tr{break-inside:avoid;page-break-inside:avoid}
    th,td{border:1px solid #bfd6d0;padding:.8mm .9mm;vertical-align:middle;line-height:1.1;overflow-wrap:anywhere;word-break:normal}
    th{background:#dceee9;color:#164a40;text-align:left;font-size:6.25pt;font-weight:700}
    tbody tr:nth-child(even){background:#f8fbfa}
    tbody tr.has-difference{background:#fff8f3}
    th:first-child,td:first-child{width:8mm;text-align:center}
    th:nth-child(2){width:48mm}
    th:nth-child(3),th:nth-child(4){width:30mm}
    th:nth-child(5){width:34mm}
    th:nth-child(6){width:48mm}
    td strong{font-weight:700;color:#123f37}
    td small{display:block;color:#607a74;font-size:5.2pt;line-height:1.04;margin-top:.25mm}
    .status-pill{display:inline-block;max-width:100%;border-radius:99px;padding:.4mm 1mm;background:#e7f4f0;color:#176453;font-size:5.8pt;font-weight:600;white-space:normal}
    .has-difference .status-pill{background:#fff0e4;color:#994e19}
    .is-pending .status-pill{background:#f0f3f2;color:#5e706c}
    footer{margin-top:2mm;padding-top:1.2mm;border-top:1px solid #c9dcd7;display:flex;justify-content:space-between;gap:4mm;color:#617a74;font-size:5.2pt}
  </style></head><body><header><div><span class="eyebrow">দৈনিক বিতরণ প্রতিবেদন</span><h1>স্কুলভিত্তিক বিতরণ রিপোর্ট</h1></div><div class="report-meta"><strong>${escapeHtml(formatDateBn(date))}</strong><span>${escapeHtml(settings.institution_name || "মিড-ডে মিল অপারেশন")}</span></div></header>
  ${items.length ? `<section class="summary">${summary}</section>` : `<section class="summary"><article><strong>এই তারিখে কোনো বিতরণ নির্ধারিত নেই</strong><span>মাসিক খাবার পরিকল্পনা অনুযায়ী ছুটির দিন।</span></article></section>`}
  <table><thead><tr><th>ক্রমিক</th><th>বিদ্যালয়</th><th>বরাদ্দ</th><th>প্রাপ্ত</th><th>ঘাটতি/অতিরিক্ত</th><th>স্ট্যাটাস</th></tr></thead><tbody>${rows}</tbody></table>
  <footer><span>স্বয়ংক্রিয়ভাবে প্রস্তুত: মিড-ডে মিল ব্যবস্থাপনা</span><span>${escapeHtml(settings.address || "")}</span></footer></body></html>`;
}

async function createPdf(env: DeliveryEnv, date: string, items: MealItemCode[]) {
  if (!env.BROWSER) throw new Error("Cloudflare Browser binding configured নয়।");
  const response = await env.BROWSER.quickAction("pdf", {
    html: await buildDailyDistributionReportHtml(date, items),
    pdfOptions: {
      preferCSSPageSize: true,
      printBackground: true,
    },
  });
  if (!response.ok) {
    const detail = (await response.text()).replace(/\s+/g, " ").trim().slice(0, 240);
    throw new Error(`PDF তৈরি ব্যর্থ (${response.status})${detail ? `: ${detail}` : ""}`);
  }
  return response.arrayBuffer();
}

async function alreadySent(db: D1Database, date: string, channel: string, recipient: string) {
  return !!(await db.prepare(`SELECT id FROM report_delivery_runs
    WHERE report_date = ? AND channel = ? AND recipient = ? AND status = 'sent' AND is_test = 0
    LIMIT 1`).bind(date, channel, recipient).first());
}

async function logDelivery(db: D1Database, date: string, channel: string, recipient: string, status: string, isTest: boolean, providerId = "", error = "") {
  await db.prepare(`INSERT INTO report_delivery_runs
    (report_date, channel, recipient, status, provider_message_id, error_message, is_test)
    VALUES (?, ?, ?, ?, ?, ?, ?)`)
    .bind(date, channel, recipient, status, providerId, error.slice(0, 500), isTest ? 1 : 0).run();
}

export async function deliverDailyDistributionReport(env: DeliveryEnv, options: { date?: string; force?: boolean; test?: boolean } = {}) {
  const db = await ensureDatabase();
  const settings = await getSettings();
  const date = options.date || dhakaDate();
  const isTest = !!options.test;
  if (!isTest && settings.daily_report_enabled !== "1") return { date, sent: 0, failed: 0, skipped: 0 };

  const emails = parseList(settings.daily_report_emails).filter((email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
  const telegramDestinations = settings.telegram_enabled === "1" ? parseList(settings.telegram_destinations) : [];
  const channelsRequested = emails.length + telegramDestinations.length;
  if (!channelsRequested) return { date, sent: 0, failed: 0, skipped: 0 };

  const mealItems = await getMealItems(db, date);
  if (!isTest && mealItems.length === 0) {
    return { date, sent: 0, failed: 0, skipped: channelsRequested, schoolClosed: true };
  }

  const pdf = await createPdf(env, date, mealItems);
  const filename = `school-distribution-${date}.pdf`;
  let sent = 0;
  let failed = 0;
  let skipped = 0;

  for (const recipient of emails) {
    if (!options.force && await alreadySent(db, date, "email", recipient)) { skipped++; continue; }
    try {
      if (!env.EMAIL) throw new Error("Cloudflare Email binding configured নয়।");
      const result = await env.EMAIL.send({
        to: recipient,
        from: { email: settings.daily_report_sender || "reports@middaymeal.xyz", name: "মিড-ডে মিল ব্যবস্থাপনা" },
        subject: `স্কুলভিত্তিক বিতরণ রিপোর্ট — ${formatDateBn(date)}`,
        text: `সংযুক্ত PDF-এ ${formatDateBn(date)}-এর স্কুলভিত্তিক বিতরণ রিপোর্ট দেওয়া হলো।`,
        html: `<p>সংযুক্ত PDF-এ <strong>${escapeHtml(formatDateBn(date))}</strong>-এর স্কুলভিত্তিক বিতরণ রিপোর্ট দেওয়া হলো।</p>`,
        attachments: [{ content: pdf, filename, type: "application/pdf", disposition: "attachment" }],
      });
      await logDelivery(db, date, "email", recipient, "sent", isTest, result.messageId || "");
      sent++;
    } catch (error) {
      await logDelivery(db, date, "email", recipient, "failed", isTest, "", error instanceof Error ? error.message : "Email পাঠানো যায়নি");
      failed++;
    }
  }

  if (telegramDestinations.length) {
    const token = await getSecretSetting("telegram_bot_token");
    for (const recipient of telegramDestinations) {
      if (!options.force && await alreadySent(db, date, "telegram", recipient)) { skipped++; continue; }
      try {
        if (!token) throw new Error("Telegram bot token configured নয়।");
        const form = new FormData();
        form.set("chat_id", recipient);
        form.set("caption", `স্কুলভিত্তিক বিতরণ রিপোর্ট — ${formatDateBn(date)}`);
        form.set("document", new File([pdf], filename, { type: "application/pdf" }));
        const response = await fetch(`https://api.telegram.org/bot${token}/sendDocument`, { method: "POST", body: form });
        const result = await response.json() as { ok?: boolean; result?: { message_id?: number }; description?: string };
        if (!response.ok || !result.ok) throw new Error(result.description || "Telegram পাঠানো যায়নি");
        await logDelivery(db, date, "telegram", recipient, "sent", isTest, String(result.result?.message_id || ""));
        sent++;
      } catch (error) {
        await logDelivery(db, date, "telegram", recipient, "failed", isTest, "", error instanceof Error ? error.message : "Telegram পাঠানো যায়নি");
        failed++;
      }
    }
  }

  if (failed) {
    await db.prepare(`INSERT INTO notifications (type, title, message, link, area_code)
      VALUES ('report_delivery_failed', 'দৈনিক রিপোর্ট পাঠানো অসম্পূর্ণ', ?, '/?section=distribution', NULL)`)
      .bind(`${formatDateBn(date)}-এর রিপোর্ট ${formatNumber(failed)}টি গন্তব্যে পাঠানো যায়নি।`).run();
  }
  return { date, sent, failed, skipped };
}

export function getDhakaReportDate(value: number | Date) {
  return dhakaDate(value);
}
