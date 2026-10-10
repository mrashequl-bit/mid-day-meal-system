"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import {
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  CheckCircle2,
  Check,
  Clock3,
  Download,
  FileText,
  Home,
  Info,
  MapPin,
  Minus,
  Plus,
  Printer,
  RotateCcw,
  School,
  Truck,
  Users,
  X,
} from "lucide-react";
import { DISTRIBUTION_REPORT_CUTOFF_HOUR, getDhakaClock, getAreaManagerReportingWindow } from "../lib/distribution-reporting-window";
import { printDesktopLayout } from "../lib/desktop-print";
import "./tiffin-manager-portal.css";

type SchoolRow = {
  emis_code: string;
  name_bn: string;
  area_code: string;
  area_name?: string;
  union_name?: string | null;
  cluster_name?: string | null;
  current_daily_demand: number;
};

type DistributionReport = {
  id: number;
  date: string;
  school_emis_code: string;
  status: string;
  problem_type: string;
  reason?: string | null;
  comments?: string | null;
  planned_bread?: number;
  planned_egg?: number;
  planned_banana?: number;
  received_bread: number;
  received_egg: number;
  received_banana: number;
  shortage_bread: number;
  shortage_egg: number;
  shortage_banana: number;
  excess_bread: number;
  excess_egg: number;
  excess_banana: number;
  confirmation_source?: "manager" | "system" | "admin";
  resolution_reason?: string | null;
  resolution_action?: string | null;
  resolution_note?: string | null;
  outstanding_shortage_bun?: number;
  outstanding_shortage_egg?: number;
  outstanding_shortage_banana?: number;
  outstanding_excess_bun?: number;
  outstanding_excess_egg?: number;
  outstanding_excess_banana?: number;
  effective_received_bun?: number;
  effective_received_egg?: number;
  effective_received_banana?: number;
  settled_shortage_bun?: number;
  settled_shortage_egg?: number;
  settled_shortage_banana?: number;
  settled_excess_bun?: number;
  settled_excess_egg?: number;
  settled_excess_banana?: number;
  reported_by?: string | null;
  resolved_by?: string | null;
  resolved_at?: string | null;
  adjustments?: Array<{
    id: number;
    item_code: ItemCode;
    quantity: number;
    shortage_date: string;
    excess_date: string;
    created_at?: string;
  }>;
  resolution_items?: Array<{
    id: number;
    action: string;
    item_code: ItemCode;
    direction: "shortage" | "excess";
    quantity: number;
    created_by: string;
    note?: string | null;
    created_at: string;
  }>;
  submissions?: Array<{
    id: number;
    submission_number: 1 | 2;
    received_bread: number;
    received_egg: number;
    received_banana: number;
    shortage_bread: number;
    shortage_egg: number;
    shortage_banana: number;
    excess_bread: number;
    excess_egg: number;
    excess_banana: number;
    problem_type: string;
    reason: string;
    comments?: string | null;
    submitted_by: string;
    submitted_at: string;
    authorization_action?: string | null;
    authorization_by?: string | null;
    authorization_at?: string | null;
  }>;
  manager_submission_count?: number;
  manager_reopen_allowed?: number;
  manager_reopen_action?: string | null;
  manager_reopen_authorized_by?: string | null;
  manager_reopen_authorized_at?: string | null;
  manager_reopen_used_at?: string | null;
  created_at?: string;
  updated_at?: string;
};

type ItemCode = "bun" | "egg" | "banana";

type ReceiptSuccess = {
  savedAt: Date;
  items: Array<{ code: ItemCode; received: number; expected: number }>;
};

type MonthlyPlanPayload = {
  month: string;
  source: "configured" | "fallback";
  periodName?: string;
  startDate?: string;
  endDate?: string;
  days?: Array<{ date: string; items: string[] }>;
};

type PublicSettings = {
  address?: string;
};

const MONTHLY_PLAN_CACHE_TTL_MS = 5 * 60 * 1000;
const monthlyPlanCache = new Map<string, { plan: MonthlyPlanPayload; cachedAt: number }>();
const monthlyPlanRequests = new Map<string, Promise<MonthlyPlanPayload>>();

function getCachedMonthlyPlan(month: string) {
  return monthlyPlanCache.get(month)?.plan || null;
}

function loadMonthlyPlan(month: string) {
  const cached = monthlyPlanCache.get(month);
  if (cached && Date.now() - cached.cachedAt <= MONTHLY_PLAN_CACHE_TTL_MS) return Promise.resolve(cached.plan);
  const pending = monthlyPlanRequests.get(month);
  if (pending) return pending;

  const request = fetch(`/api/meal-plan?month=${month}`, { cache: "no-store" })
    .then(async (response) => {
      const result = await response.json() as MonthlyPlanPayload & { error?: string };
      if (!response.ok) throw new Error(result.error || "মাসিক পরিকল্পনা লোড করা যায়নি।");
      monthlyPlanCache.set(month, { plan: result, cachedAt: Date.now() });
      return result;
    })
    .finally(() => monthlyPlanRequests.delete(month));
  monthlyPlanRequests.set(month, request);
  return request;
}

const ITEM_META = {
  bun: { name: "বনরুটি", unit: "পিস", iconSrc: "/icons8/bread-color.png", tone: "bread" },
  egg: { name: "সিদ্ধ ডিম", unit: "পিস", iconSrc: "/icons8/egg.png", tone: "egg" },
  banana: { name: "কলা", unit: "টি", iconSrc: "/icons8/banana.png", tone: "banana" },
} satisfies Record<ItemCode, { name: string; unit: string; iconSrc: string; tone: string }>;

const MONTH_NAMES = ["জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"];
const WEEK_DAYS = ["রবি", "সোম", "মঙ্গল", "বুধ", "বৃহঃ", "শুক্র", "শনি"];
const SHORTAGE_REASONS = ["সরবরাহ কম", "নষ্ট হয়েছে", "পরিবহন সমস্যা", "অন্যান্য"] as const;
const EXCESS_REASONS = ["ঘাটতি সমন্বয়", "অতিরিক্ত সরবরাহ", "উপহার", "অন্যান্য"] as const;

function savedReason(report: DistributionReport | null, kind: "shortage" | "excess") {
  const value = String(report?.reason || report?.comments || "").trim();
  const options = kind === "shortage" ? SHORTAGE_REASONS : EXCESS_REASONS;
  const label = kind === "shortage" ? "ঘাটতির কারণ:" : "অতিরিক্তের কারণ:";
  const labeledValue = value.split(" · ").find((part) => part.startsWith(label))?.slice(label.length).trim();
  if (labeledValue) return options.find((option) => option === labeledValue) || "";
  if (value.includes("ঘাটতির কারণ:") || value.includes("অতিরিক্তের কারণ:")) return "";
  const matchesLegacyType = kind === "shortage" ? report?.problem_type === "less_item" : report?.problem_type === "more_item";
  return matchesLegacyType ? options.find((option) => value.includes(option)) || "" : "";
}

function fallbackItems(date: string): ItemCode[] {
  const day = new Date(`${date}T12:00:00+06:00`).getDay();
  if (day === 0 || day === 3 || day === 4) return ["bun", "egg"];
  if (day === 1) return ["bun"];
  if (day === 2) return ["banana"];
  return [];
}

function bengaliNumber(value: number | string) {
  return new Intl.NumberFormat("bn-BD").format(Number(value) || 0);
}

function bengaliDigits(value: number | string) {
  return String(value).replace(/\d/g, (digit) => "০১২৩৪৫৬৭৮৯"[Number(digit)]);
}

function formatReportDate(date: string) {
  const [year, month, day] = date.split("-");
  return bengaliDigits(`${day}/${month}/${year}`);
}

function formatDistributionDate(date: string) {
  const parsed = new Date(`${date}T12:00:00+06:00`);
  const dateText = new Intl.DateTimeFormat("bn-BD", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Dhaka",
  }).format(parsed);
  const weekday = new Intl.DateTimeFormat("bn-BD", { weekday: "long", timeZone: "Asia/Dhaka" }).format(parsed);
  return { dateText, weekday };
}

function formatReportTimestamp(raw?: string | null) {
  if (!raw) return "";
  const parsed = new Date(raw.includes("T") ? raw : `${raw.replace(" ", "T")}Z`);
  if (Number.isNaN(parsed.getTime())) return "";
  return new Intl.DateTimeFormat("bn-BD", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Dhaka",
  }).format(parsed);
}

function shiftDate(date: string, offset: number) {
  const parsed = new Date(`${date}T12:00:00+06:00`);
  parsed.setUTCDate(parsed.getUTCDate() + offset);
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Asia/Dhaka",
  }).format(parsed);
}

function itemReportValue(report: DistributionReport | null, code: ItemCode, field: "received" | "shortage" | "excess") {
  if (!report) return 0;
  const suffix = code === "bun" ? "bread" : code;
  return Number(report[`${field}_${suffix}` as keyof DistributionReport] || 0);
}

function effectiveReceivedValue(report: DistributionReport | null, code: ItemCode) {
  if (!report) return 0;
  const suffix = code === "bun" ? "bread" : code;
  const received = itemReportValue(report, code, "received");
  const shortage = itemReportValue(report, code, "shortage");
  const excess = itemReportValue(report, code, "excess");
  const storedPlanned = report[`planned_${suffix}` as keyof DistributionReport];
  const planned = Math.max(0, Number(storedPlanned ?? (received + shortage - excess)) || 0);
  const effective = report[`effective_received_${code}` as keyof DistributionReport];
  const printableReceived = effective === undefined || effective === null
    ? received
    : Math.max(0, Number(effective) || 0);
  return Math.min(planned, printableReceived);
}

function reportItemCodes(report: DistributionReport) {
  return (Object.keys(ITEM_META) as ItemCode[]).filter((code) => {
    const suffix = code === "bun" ? "bread" : code;
    return [
      report[`planned_${suffix}` as keyof DistributionReport],
      report[`received_${suffix}` as keyof DistributionReport],
      report[`shortage_${suffix}` as keyof DistributionReport],
      report[`excess_${suffix}` as keyof DistributionReport],
      report[`effective_received_${code}` as keyof DistributionReport],
    ].some((value) => Number(value) > 0);
  });
}

function printReportStatus(report: DistributionReport | null, items: ItemCode[]) {
  if (!report) return "";
  const balances = items.flatMap((code) => {
    const shortage = Number(report[`outstanding_shortage_${code}` as keyof DistributionReport] || 0);
    const excess = Number(report[`outstanding_excess_${code}` as keyof DistributionReport] || 0);
    const label = code === "bun" ? "রুটি" : code === "egg" ? "ডিম" : "কলা";
    if (shortage > 0) return [`${label} ঘাটতি ${bengaliDigits(shortage)}`];
    if (excess > 0) return [`${label} অতিরিক্ত ${bengaliDigits(excess)} (প্রিন্টে বাদ)`];
    return [];
  });
  if (balances.length) return balances.join(", ");
  const hadDifference = items.some((code) => itemReportValue(report, code, "shortage") > 0 || itemReportValue(report, code, "excess") > 0);
  return hadDifference ? "সমন্বিত" : "";
}

function DayReportAuditTrail({ report }: { report: DistributionReport }) {
  const adjustments = report.adjustments || [];
  const resolutionItems = report.resolution_items || [];
  const submissions = report.submissions || [];
  const sourceLabel = report.confirmation_source === "system"
    ? "স্বয়ংক্রিয় নিশ্চিতকরণ"
    : report.confirmation_source === "admin"
      ? "প্রশাসনিক এন্ট্রি"
      : "টিফিন ম্যানেজারের রিপোর্ট";
  const hasAdministrativeDecision = Boolean(report.resolution_action || report.resolution_reason || report.resolved_by || report.resolved_at);

  return <section className="tiffin-day-audit-trail" aria-label="সমন্বয়ের পূর্ণ রেকর্ড">
    <header><strong>সমন্বয়ের পূর্ণ রেকর্ড</strong><small>মূল রিপোর্ট এবং পরবর্তী সব সমন্বয় আলাদাভাবে সংরক্ষিত</small></header>
    <dl className="tiffin-day-audit-summary">
      <div><dt>রিপোর্টের উৎস</dt><dd>{sourceLabel}</dd></div>
      <div><dt>রিপোর্ট করেছেন</dt><dd>{report.reported_by || (report.confirmation_source === "system" ? "System" : "তথ্য নেই")}</dd></div>
      <div><dt>ঘাটতি/অতিরিক্তের কারণ</dt><dd>{report.reason || "কোনো কারণ নেই"}</dd></div>
      {report.comments && <div><dt>মূল রিপোর্টের মন্তব্য</dt><dd>{report.comments}</dd></div>}
    </dl>

    {submissions.length > 0 && <div className="tiffin-day-audit-group is-submissions">
      <strong>টিফিন ম্যানেজারের জমা দেওয়া রিপোর্ট</strong>
      {submissions.map((submission) => {
        const itemSummary = (Object.keys(ITEM_META) as ItemCode[]).flatMap((code) => {
          const suffix = code === "bun" ? "bread" : code;
          const receivedValue = Number(submission[`received_${suffix}` as keyof typeof submission] || 0);
          const shortageValue = Number(submission[`shortage_${suffix}` as keyof typeof submission] || 0);
          const excessValue = Number(submission[`excess_${suffix}` as keyof typeof submission] || 0);
          if (receivedValue === 0 && shortageValue === 0 && excessValue === 0) return [];
          return [`${ITEM_META[code].name} ${bengaliNumber(receivedValue)} ${ITEM_META[code].unit}`];
        }).join(" · ");
        return <article key={`submission-${submission.id}`}>
          <span>{submission.submission_number === 1 ? "প্রথম রিপোর্ট" : "অনুমোদিত দ্বিতীয় রিপোর্ট"}</span>
          <p>{itemSummary || "কোনো প্রাপ্ত আইটেম নেই"}</p>
          <p>কারণ: {submission.reason || "কোনো কারণ নেই"}</p>
          <small>{submission.submitted_by || "টিফিন ম্যানেজার"}{formatReportTimestamp(submission.submitted_at) ? ` · ${formatReportTimestamp(submission.submitted_at)}` : ""}</small>
          {submission.submission_number === 2 && submission.authorization_action && <em>{submission.authorization_action} ব্যবস্থার পর {submission.authorization_by || "সুপার অ্যাডমিন"} দ্বিতীয়বার সম্পাদনার অনুমতি দিয়েছেন{formatReportTimestamp(submission.authorization_at) ? ` · ${formatReportTimestamp(submission.authorization_at)}` : ""}</em>}
        </article>;
      })}
    </div>}

    {adjustments.length > 0 && <div className="tiffin-day-audit-group">
      <strong>স্বয়ংক্রিয় মাসিক সমন্বয়</strong>
      {adjustments.map((adjustment) => {
        const fillsThisDate = adjustment.shortage_date === report.date;
        return <article key={`adjustment-${adjustment.id}`}>
          <span>{bengaliNumber(adjustment.quantity)} {ITEM_META[adjustment.item_code].unit} {ITEM_META[adjustment.item_code].name}</span>
          <p>{fillsThisDate
            ? `${formatReportDate(adjustment.excess_date)} তারিখের অতিরিক্ত থেকে এই দিনের ঘাটতি পূরণ হয়েছে।`
            : `${formatReportDate(adjustment.shortage_date)} তারিখের ঘাটতি পূরণে এই দিনের অতিরিক্ত ব্যবহার হয়েছে।`}</p>
          {adjustment.created_at && <small>রেকর্ড: {formatReportTimestamp(adjustment.created_at)}</small>}
        </article>;
      })}
    </div>}

    {resolutionItems.length > 0 && <div className="tiffin-day-audit-group">
      <strong>প্রশাসনিক পরিমাণ সমন্বয়</strong>
      {resolutionItems.map((resolution) => <article key={`resolution-${resolution.id}`}>
        <span>{resolution.action} · {ITEM_META[resolution.item_code].name} {bengaliNumber(resolution.quantity)} {ITEM_META[resolution.item_code].unit}</span>
        <p>{resolution.direction === "shortage" ? "ঘাটতি পূরণ হিসাবে যোগ হয়েছে।" : "অতিরিক্ত অংশ সমন্বয় করা হয়েছে।"}</p>
        <small>{resolution.created_by || "প্রশাসক"}{formatReportTimestamp(resolution.created_at) ? ` · ${formatReportTimestamp(resolution.created_at)}` : ""}</small>
        {resolution.note && <em>{resolution.note}</em>}
      </article>)}
    </div>}

    {hasAdministrativeDecision && <div className="tiffin-day-audit-decision">
      <strong>সর্বশেষ প্রশাসনিক সিদ্ধান্ত</strong>
      {report.resolution_action && <p><span>ব্যবস্থা</span>{report.resolution_action}</p>}
      {report.resolution_reason && report.resolution_reason !== report.resolution_action && <p><span>স্ট্যাটাস</span>{report.resolution_reason}</p>}
      {report.resolution_note && <p><span>বিস্তারিত</span>{report.resolution_note}</p>}
      {(report.resolved_by || report.resolved_at) && <small>{report.resolved_by || "System"}{formatReportTimestamp(report.resolved_at) ? ` · ${formatReportTimestamp(report.resolved_at)}` : ""}</small>}
    </div>}
  </section>;
}

export function TiffinManagerPortal({ userName, schoolEmis }: { userName: string; schoolEmis: string }) {
  const today = getDhakaClock().date;
  const [view, setView] = useState<"home" | "monthly" | "distribution">("home");
  const [monthlyFocusDate, setMonthlyFocusDate] = useState<string | null>(null);
  const [school, setSchool] = useState<SchoolRow | null>(null);
  const [scheduledItems, setScheduledItems] = useState<ItemCode[]>([]);
  const [tomorrowItems, setTomorrowItems] = useState<ItemCode[]>([]);
  const [report, setReport] = useState<DistributionReport | null>(null);
  const [recentReports, setRecentReports] = useState<DistributionReport[]>([]);
  const [received, setReceived] = useState<Record<ItemCode, number>>({ bun: 0, egg: 0, banana: 0 });
  const [shortageReason, setShortageReason] = useState("");
  const [excessReason, setExcessReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [now, setNow] = useState(new Date());
  const [success, setSuccess] = useState<ReceiptSuccess | null>(null);
  const [confirmingReceipt, setConfirmingReceipt] = useState(false);
  const submittingRef = useRef(false);

  const loadPortal = useCallback(async () => {
    setLoading(true);
    setMessage("");
    try {
      const tomorrow = shiftDate(today, 1);
      const historyFrom = shiftDate(today, -6);
      const [schoolResponse, planResponse, reportResponse, historyResponse, tomorrowPlanResponse] = await Promise.all([
        fetch("/api/schools", { cache: "no-store" }),
        fetch(`/api/meal-plan?date=${today}`, { cache: "no-store" }),
        fetch(`/api/distribution-reports?date=${today}`, { cache: "no-store" }),
        fetch("/api/distribution-reports" + `?from=${historyFrom}`, { cache: "no-store" }),
        fetch(`/api/meal-plan?date=${tomorrow}`, { cache: "no-store" }),
      ]);
      if (!schoolResponse.ok || !planResponse.ok || !reportResponse.ok || !historyResponse.ok || !tomorrowPlanResponse.ok) {
        throw new Error("বিদ্যালয়ের আজকের বিতরণ তথ্য লোড করা যায়নি।");
      }
      const schoolPayload = await schoolResponse.json() as { schools?: SchoolRow[] };
      const planPayload = await planResponse.json() as { source?: string; items?: Array<{ code: string }> };
      const reportPayload = await reportResponse.json() as { reports?: DistributionReport[] };
      const historyPayload = await historyResponse.json() as { reports?: DistributionReport[] };
      const tomorrowPlanPayload = await tomorrowPlanResponse.json() as { items?: Array<{ code: string }> };
      const ownSchool = (schoolPayload.schools || []).find((row) => row.emis_code === schoolEmis) || null;
      const codes = planPayload.source === "configured"
        ? (planPayload.items || []).map((item) => item.code).filter((code): code is ItemCode => code in ITEM_META)
        : fallbackItems(today);
      const ownReport = (reportPayload.reports || []).find((row) => row.school_emis_code === schoolEmis) || null;
      setSchool(ownSchool);
      setScheduledItems(codes);
      setTomorrowItems((tomorrowPlanPayload.items || []).map((item) => item.code).filter((code): code is ItemCode => code in ITEM_META));
      setReport(ownReport);
      setRecentReports((historyPayload.reports || []).filter((row) => row.school_emis_code === schoolEmis));
      const demand = Number(ownSchool?.current_daily_demand || 0);
      setReceived({
        bun: ownReport ? Number(ownReport.received_bread || 0) : (codes.includes("bun") ? demand : 0),
        egg: ownReport ? Number(ownReport.received_egg || 0) : (codes.includes("egg") ? demand : 0),
        banana: ownReport ? Number(ownReport.received_banana || 0) : (codes.includes("banana") ? demand : 0),
      });
      setShortageReason(savedReason(ownReport, "shortage"));
      setExcessReason(savedReason(ownReport, "excess"));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "তথ্য লোড করা যায়নি।");
    } finally {
      setLoading(false);
    }
  }, [schoolEmis, today]);

  useEffect(() => { void loadPortal(); }, [loadPortal]);
  useEffect(() => {
    void loadMonthlyPlan(today.slice(0, 7)).catch(() => undefined);
  }, [today]);
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const reportingWindow = getAreaManagerReportingWindow(today, now);
  const hasAuthorizedSecondSubmission = Boolean(
    report
      && Number(report.manager_reopen_allowed || 0) === 1
      && Number(report.manager_submission_count || 1) < 2
      && ["পুনরায় সরবরাহ", "নষ্ট পণ্য পরিবর্তন"].includes(String(report.manager_reopen_action || "")),
  );
  const reportLocked = Boolean(report && !hasAuthorizedSecondSubmission);
  const canReport = Boolean(
    school
      && scheduledItems.length
      && reportingWindow.canReport
      && (!report || hasAuthorizedSecondSubmission),
  );
  const showEditableReceipt = Boolean(!report || (hasAuthorizedSecondSubmission && reportingWindow.canReport));
  const demand = Number(school?.current_daily_demand || 0);
  const differences = useMemo(() => scheduledItems.map((code) => ({
    code,
    difference: received[code] - demand,
  })), [demand, received, scheduledItems]);
  const hasShortage = differences.some((item) => item.difference < 0);
  const hasExcess = differences.some((item) => item.difference > 0);
  const allExact = scheduledItems.length > 0 && !hasShortage && !hasExcess;
  const reasonsComplete = (!hasShortage || Boolean(shortageReason)) && (!hasExcess || Boolean(excessReason));
  const distributionDate = useMemo(() => formatDistributionDate(today), [today]);

  const reportReceived = useCallback((code: ItemCode) => {
    if (!report) return demand;
    return Number(report[`received_${code === "bun" ? "bread" : code}` as keyof DistributionReport] || 0);
  }, [demand, report]);
  const persistedReceiptSuccess = useMemo<ReceiptSuccess | null>(() => {
    if (success) return success;
    if (!report) return null;
    const rawTimestamp = report.submissions?.at(-1)?.submitted_at || report.created_at || report.updated_at;
    const parsedTimestamp = rawTimestamp
      ? new Date(rawTimestamp.includes("T") ? rawTimestamp : `${rawTimestamp.replace(" ", "T")}Z`)
      : new Date(`${report.date}T12:00:00+06:00`);
    return {
      savedAt: Number.isNaN(parsedTimestamp.getTime()) ? new Date(`${report.date}T12:00:00+06:00`) : parsedTimestamp,
      items: scheduledItems.map((code) => ({ code, received: reportReceived(code), expected: demand })),
    };
  }, [demand, report, reportReceived, scheduledItems, success]);

  function setItemReceived(code: ItemCode, value: number) {
    const safeValue = Math.max(0, Math.floor(Number.isFinite(value) ? value : 0));
    setReceived((current) => ({ ...current, [code]: safeValue }));
    setSuccess(null);
  }

  function markAllReceived() {
    setReceived((current) => scheduledItems.reduce((next, code) => ({ ...next, [code]: demand }), current));
    setSuccess(null);
  }

  function resetReceipt() {
    const savedShortageReason = savedReason(report, "shortage");
    const savedExcessReason = savedReason(report, "excess");
    const changed = scheduledItems.some((code) => received[code] !== reportReceived(code))
      || shortageReason !== savedShortageReason
      || excessReason !== savedExcessReason;
    if (changed && !window.confirm("প্রাপ্ত পরিমাণ ও নির্বাচিত কারণ আগের অবস্থায় ফিরিয়ে নিতে চান?")) return;
    setReceived((current) => scheduledItems.reduce((next, code) => ({ ...next, [code]: reportReceived(code) }), current));
    setShortageReason(savedShortageReason);
    setExcessReason(savedExcessReason);
    setMessage("");
    setSuccess(null);
  }

  const receiptConfirmationText = useMemo(() => {
    const parts = scheduledItems.map((code) => {
      const meta = ITEM_META[code];
      return `${bengaliNumber(received[code])} ${meta.unit} ${meta.name}`;
    });
    const list = parts.length <= 1 ? parts[0] || "কোনো আইটেম নয়" : `${parts.slice(0, -1).join(", ")} এবং ${parts.at(-1)}`;
    return `আমি ${list} বুঝে পেয়েছি।`;
  }, [received, scheduledItems]);

  useEffect(() => {
    if (!confirmingReceipt) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !saving) setConfirmingReceipt(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [confirmingReceipt, saving]);

  function requestSubmitConfirmation(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!school || !canReport || saving) return;
    if (!reasonsComplete) {
      setMessage(hasShortage && !shortageReason ? "ঘাটতির কারণ নির্বাচন করুন।" : "অতিরিক্ত প্রাপ্তির কারণ নির্বাচন করুন।");
      return;
    }
    setConfirmingReceipt(true);
  }

  async function submitReport() {
    if (!school || !canReport || submittingRef.current) return;
    submittingRef.current = true;
    setSaving(true);
    setMessage("");
    const problemType = hasShortage ? "less_item" : hasExcess ? "more_item" : "none";
    const differenceSummary = differences
      .filter((item) => item.difference !== 0)
      .map((item) => {
        const meta = ITEM_META[item.code];
        return `${meta.name}: ${bengaliNumber(Math.abs(item.difference))} ${meta.unit} ${item.difference < 0 ? "ঘাটতি" : "অতিরিক্ত"}`;
      })
      .join(" · ");
    const reason = problemType === "none"
      ? "বরাদ্দ অনুযায়ী সব আইটেম পাওয়া গেছে"
      : [hasShortage ? `ঘাটতির কারণ: ${shortageReason}` : "", hasExcess ? `অতিরিক্তের কারণ: ${excessReason}` : ""].filter(Boolean).join(" · ");
    const payload = {
      date: today,
      schoolEmisCode: school.emis_code,
      areaCode: school.area_code,
      receivedBread: received.bun,
      receivedEgg: received.egg,
      receivedBanana: received.banana,
      problemType,
      reason,
      comments: "",
    };
    try {
      const response = await fetch(report ? `/api/distribution-reports/${report.id}` : "/api/distribution-reports", {
        method: report ? "PATCH" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error || "রিপোর্ট সংরক্ষণ করা যায়নি।");
      await loadPortal();
      setSuccess({
        savedAt: new Date(),
        items: scheduledItems.map((code) => ({ code, received: received[code], expected: demand })),
      });
      setMessage(problemType === "none" ? "প্রাপ্তি সফলভাবে নিশ্চিত করা হয়েছে।" : `${differenceSummary}। রিপোর্ট সফলভাবে পাঠানো হয়েছে।`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "রিপোর্ট সংরক্ষণ করা যায়নি।");
    } finally {
      submittingRef.current = false;
      setSaving(false);
    }
  }

  return (
    <div className="tiffin-portal">
      <header className="tiffin-topbar no-print">
        <div className="tiffin-brand">
          <img className="tiffin-brand-logo" src="/bd-logo.svg" alt="বাংলাদেশ সরকারের লোগো" width={48} height={48} style={{ display: "block", flex: "0 0 auto", objectFit: "contain" }} />
          <div><strong>মিড-ডে মিল ব্যবস্থাপনা</strong><small>সরবরাহ ব্যবস্থাপনা</small></div>
        </div>
        <nav aria-label="টিফিন ম্যানেজার মেনু">
          <button type="button" className={view === "home" ? "is-active" : ""} onClick={() => setView("home")}><Home aria-hidden="true" /> হোম</button>
          <button type="button" className={view === "monthly" ? "is-active" : ""} onClick={() => { setMonthlyFocusDate(null); setView("monthly"); }}><CalendarDays aria-hidden="true" /> মাসিক পরিকল্পনা</button>
          <button type="button" className={view === "distribution" ? "is-active" : ""} onClick={() => setView("distribution")}><Truck aria-hidden="true" /> বিতরণ</button>
        </nav>
        <div className="account-launcher-host" aria-label={`${userName} প্রোফাইল`} />
      </header>

      <main className="tiffin-main">
        {message && (!success || !message.includes("সফল")) && <div className={`tiffin-message ${message.includes("সফল") ? "is-success" : ""}`} role="status">{message}</div>}

        {view === "home" ? (
          <TiffinHomeDashboard
            userName={userName}
            school={school}
            scheduledItems={scheduledItems}
            tomorrowItems={tomorrowItems}
            demand={demand}
            report={report}
            recentReports={recentReports}
            today={today}
            now={now}
            loading={loading}
            reportingWindow={reportingWindow}
            onRetry={() => void loadPortal()}
            onOpenDistribution={() => setView("distribution")}
            onOpenMonthly={() => { setMonthlyFocusDate(null); setView("monthly"); }}
            onOpenTodayReport={() => { setMonthlyFocusDate(today); setView("monthly"); }}
          />
        ) : view === "monthly" ? (
          <MonthlyMealPlan initialMonth={today.slice(0, 7)} demand={demand} school={school} requestedDate={monthlyFocusDate} />
        ) : (
          <>
            <header className={`tiffin-distribution-title ${report ? "is-submitted" : ""}`}>
              <div><span className="tiffin-eyebrow">আজকের বিতরণ</span><h1>বরাদ্দ ও প্রাপ্তি রিপোর্ট</h1><p><CalendarDays aria-hidden="true" />{distributionDate.dateText} · {distributionDate.weekday}</p></div>
              <div className={`tiffin-distribution-state ${report ? hasShortage || hasExcess ? "has-issue" : "is-complete" : "is-pending"}`}><span>{report ? hasShortage || hasExcess ? <AlertTriangle aria-hidden="true" /> : <CheckCircle2 aria-hidden="true" /> : <Clock3 aria-hidden="true" />}</span><div><small>রিপোর্ট অবস্থা</small><strong>{report ? hasShortage || hasExcess ? "পার্থক্যসহ জমা হয়েছে" : "সম্পূর্ণ প্রাপ্ত" : scheduledItems.length ? "রিপোর্ট অপেক্ষমাণ" : "আজ বিতরণ নেই"}</strong></div></div>
            </header>
            {showEditableReceipt && scheduledItems.length > 0 && <section className="tiffin-receipt-overview" aria-label="আজকের প্রত্যাশিত সরবরাহ">
              <div className="tiffin-expected-supply">
                <h2>আজকের প্রত্যাশিত সরবরাহ</h2>
                <div>{scheduledItems.map((code) => { const meta = ITEM_META[code]; return <article key={code} className={`is-${meta.tone}`}><span><img src={meta.iconSrc} alt="" width={30} height={30} /></span><div><strong>{meta.name}</strong><b>{bengaliNumber(demand)} <small>{meta.unit}</small></b></div></article>; })}</div>
              </div>
              <aside className={`tiffin-all-received ${allExact ? "is-complete" : ""}`}>
                <span><Check aria-hidden="true" /></span>
                <div><strong>{allExact ? "সব আইটেম সম্পূর্ণ পেয়েছি" : "এক ক্লিকে সব পরিমাণ পূরণ করুন"}</strong><p>প্রতিটি আইটেম প্রত্যাশিত পরিমাণে সেট হবে।</p></div>
                <button type="button" onClick={markAllReceived} disabled={!canReport || saving}><Check aria-hidden="true" />সব আইটেম সম্পূর্ণ পেয়েছি</button>
              </aside>
            </section>}
            {showEditableReceipt ? <section className="tiffin-report-panel tiffin-receipt-panel" id="tiffin-receipt-form">
              <div className="tiffin-receipt-heading">
                <div><h2>প্রাপ্ত আইটেমের তথ্য</h2><p>বাস্তবে প্রাপ্ত পরিমাণ দিন এবং নিশ্চিত করুন</p></div>
                {report && <div className={`tiffin-report-edit-state ${hasAuthorizedSecondSubmission && reportingWindow.canReport ? "is-reopened" : "is-locked"}`} role="status">
                  {hasAuthorizedSecondSubmission && reportingWindow.canReport ? <Info aria-hidden="true" /> : <AlertTriangle aria-hidden="true" />}
                  <div><strong>{hasAuthorizedSecondSubmission && reportingWindow.canReport ? "একবারের জন্য রিপোর্ট সম্পাদনার অনুমতি দেওয়া হয়েছে" : "আপনার রিপোর্ট জমা দেওয়া হয়েছে"}</strong><p>{hasAuthorizedSecondSubmission && reportingWindow.canReport ? `সুপার অ্যাডমিন “${report.manager_reopen_action}” ব্যবস্থা নিয়েছেন। দুপুর ২টার আগে দ্বিতীয় ও শেষ রিপোর্টটি জমা দিন।` : Number(report.manager_submission_count || 1) >= 2 ? "অনুমোদিত দ্বিতীয় রিপোর্টটিও জমা হয়েছে। আজকে আর রিপোর্ট করতে পারবেন না।" : "আজকে আর রিপোর্ট করতে পারবেন না।"}</p></div>
                </div>}
              </div>
              {!scheduledItems.length ? (
                <div className="tiffin-empty"><CalendarDays aria-hidden="true" /><strong>আজ কোনো আইটেম বিতরণ নির্ধারিত নেই</strong></div>
              ) : (
                <form onSubmit={requestSubmitConfirmation}>
                  <div className="tiffin-receipt-table" role="table" aria-label="প্রাপ্ত আইটেমের পরিমাণ">
                    <div className="tiffin-receipt-table-head" role="row"><span>আইটেম</span><span>প্রত্যাশিত</span><span>প্রাপ্ত পরিমাণ</span><span>পার্থক্য</span><span>অবস্থা</span></div>
                    {scheduledItems.map((code) => {
                      const meta = ITEM_META[code];
                      const diff = received[code] - demand;
                      const state = diff < 0 ? "short" : diff > 0 ? "excess" : "exact";
                      return <article className={`tiffin-receipt-row is-${state}`} role="row" key={code}>
                        <div className="tiffin-receipt-item" role="cell"><span><img src={meta.iconSrc} alt="" width={26} height={26} /></span><strong>{meta.name}</strong></div>
                        <div className="tiffin-expected-value" role="cell"><b>{bengaliNumber(demand)}</b><small>{meta.unit}</small></div>
                        <div className="tiffin-quantity-stepper" role="cell">
                          <button type="button" aria-label={`${meta.name} একটি কমান`} disabled={!canReport || saving || received[code] === 0} onClick={() => setItemReceived(code, received[code] - 1)}><Minus aria-hidden="true" /></button>
                          <label><span className="sr-only">{meta.name} প্রাপ্ত পরিমাণ</span><input type="number" min="0" inputMode="numeric" value={received[code]} disabled={!canReport || saving} onChange={(event) => setItemReceived(code, Number(event.target.value) || 0)} /><small>{meta.unit}</small></label>
                          <button type="button" aria-label={`${meta.name} একটি বাড়ান`} disabled={!canReport || saving} onClick={() => setItemReceived(code, received[code] + 1)}><Plus aria-hidden="true" /></button>
                        </div>
                        <div className="tiffin-difference" role="cell"><b>{diff > 0 ? "+" : diff < 0 ? "−" : ""}{bengaliNumber(Math.abs(diff))}</b><small>{meta.unit}</small></div>
                        <div role="cell"><span className={`tiffin-receipt-status is-${state}`}>{state === "exact" && <CheckCircle2 aria-hidden="true" />}{state === "exact" ? "সম্পূর্ণ" : state === "short" ? "ঘাটতি" : "অতিরিক্ত"}</span></div>
                        <div className="tiffin-quick-values"><span>দ্রুত নির্বাচন</span><button type="button" onClick={() => setItemReceived(code, demand)} disabled={!canReport || saving}>সব আইটেম পেয়েছি</button><button type="button" onClick={() => setItemReceived(code, 0)} disabled={!canReport || saving}>কোন আইটেম পাই নি</button></div>
                      </article>;
                    })}
                  </div>
                  <div className={`tiffin-receipt-note-area ${hasShortage || hasExcess ? "has-discrepancy" : ""}`}>
                    <div className="tiffin-receipt-info"><Info aria-hidden="true" /><div><strong>{allExact ? "প্রাপ্ত পরিমাণ সঠিক আছে।" : "প্রাপ্ত পরিমাণে পার্থক্য আছে—কারণ নির্বাচন করুন।"}</strong>{!allExact && <p>প্রাপ্তি নিশ্চিত করার আগে প্রযোজ্য কারণ নির্বাচন করা বাধ্যতামূলক।</p>}</div></div>
                    {hasShortage && <fieldset className="tiffin-reason-picker"><legend>ঘাটতির কারণ <span>আবশ্যক</span></legend><div>{SHORTAGE_REASONS.map((reason) => <button className={shortageReason === reason ? "is-selected" : ""} type="button" aria-pressed={shortageReason === reason} key={reason} onClick={() => { setShortageReason(reason); setMessage(""); setSuccess(null); }} disabled={!canReport || saving}>{shortageReason === reason && <Check aria-hidden="true" />}{reason}</button>)}</div></fieldset>}
                    {hasExcess && <fieldset className="tiffin-reason-picker is-excess"><legend>অতিরিক্ত প্রাপ্তির কারণ <span>আবশ্যক</span></legend><div>{EXCESS_REASONS.map((reason) => <button className={excessReason === reason ? "is-selected" : ""} type="button" aria-pressed={excessReason === reason} key={reason} onClick={() => { setExcessReason(reason); setMessage(""); setSuccess(null); }} disabled={!canReport || saving}>{excessReason === reason && <Check aria-hidden="true" />}{reason}</button>)}</div></fieldset>}
                  </div>
                  {!canReport && !reportLocked && <div className="tiffin-cutoff"><AlertTriangle aria-hidden="true" />{scheduledItems.length ? "বিতরণের দিন ঢাকা সময় দুপুর ২টার আগে রিপোর্ট করা যাবে।" : "আজ কোনো বিতরণ নির্ধারিত নেই।"}</div>}
                  <div className="tiffin-receipt-actions"><button className="is-reset" type="button" onClick={resetReceipt} disabled={!canReport || saving}><RotateCcw aria-hidden="true" />রিসেট করুন</button><button className="is-confirm" type="submit" disabled={!canReport || saving || !reasonsComplete} title={!reasonsComplete ? "প্রথমে কারণ নির্বাচন করুন" : undefined}>{saving ? "সংরক্ষণ হচ্ছে…" : report ? "দ্বিতীয় রিপোর্ট নিশ্চিত করুন" : hasShortage || hasExcess ? "রিপোর্ট নিশ্চিত করুন" : "গ্রহণ নিশ্চিত করুন"}<Check aria-hidden="true" /></button></div>
                </form>
              )}
            </section> : report && persistedReceiptSuccess ? <section className="tiffin-submitted-receipt" id="tiffin-receipt-form" aria-labelledby="submitted-receipt-title">
              <header><div><span><CheckCircle2 aria-hidden="true" /></span><div><small>আজকের জমাকৃত রিপোর্ট</small><h2 id="submitted-receipt-title">প্রাপ্তি সফলভাবে সংরক্ষিত হয়েছে</h2><p>{distributionDate.dateText} · {new Intl.DateTimeFormat("bn-BD", { hour: "numeric", minute: "2-digit", timeZone: "Asia/Dhaka" }).format(persistedReceiptSuccess.savedAt)}</p></div></div><em>{Number(report.manager_submission_count || 1) >= 2 ? "দ্বিতীয় রিপোর্ট সম্পন্ন" : "রিপোর্ট সম্পন্ন"}</em></header>
              <div className="tiffin-submitted-items">{persistedReceiptSuccess.items.map((item) => {
                const meta = ITEM_META[item.code];
                const difference = item.received - item.expected;
                const state = difference < 0 ? "short" : difference > 0 ? "excess" : "exact";
                return <article className={`is-${state}`} key={item.code}><span className={`tiffin-submitted-item-icon is-${meta.tone}`}><img src={meta.iconSrc} alt="" width={28} height={28} /></span><div className="tiffin-submitted-item-name"><strong>{meta.name}</strong><small>{state === "exact" ? "সম্পূর্ণ প্রাপ্ত" : state === "short" ? `${bengaliNumber(Math.abs(difference))} ${meta.unit} কম পাওয়া গেছে` : `${bengaliNumber(difference)} ${meta.unit} বেশি পাওয়া গেছে`}</small></div><dl><div><dt>বরাদ্দ</dt><dd>{bengaliNumber(item.expected)} <small>{meta.unit}</small></dd></div><div><dt>প্রাপ্ত</dt><dd>{bengaliNumber(item.received)} <small>{meta.unit}</small></dd></div><div><dt>পার্থক্য</dt><dd>{difference > 0 ? "+" : difference < 0 ? "−" : ""}{bengaliNumber(Math.abs(difference))} <small>{meta.unit}</small></dd></div></dl><span className={`tiffin-receipt-status is-${state}`}>{state === "exact" && <CheckCircle2 aria-hidden="true" />}{state === "exact" ? "সম্পূর্ণ" : state === "short" ? "ঘাটতি" : "অতিরিক্ত"}</span></article>;
              })}</div>
              {(hasShortage || hasExcess) && <div className="tiffin-submitted-reasons"><Info aria-hidden="true" /><div><strong>রিপোর্টে উল্লেখিত কারণ</strong>{hasShortage && <p><span>ঘাটতি</span>{shortageReason || "কারণ উল্লেখ নেই"}</p>}{hasExcess && <p><span>অতিরিক্ত</span>{excessReason || "কারণ উল্লেখ নেই"}</p>}</div></div>}
              <footer><p><AlertTriangle aria-hidden="true" />আজকে আর রিপোর্ট সম্পাদনা করা যাবে না। প্রয়োজন হলে সুপার অ্যাডমিনের অনুমোদন লাগবে।</p><button type="button" onClick={() => { setMonthlyFocusDate(today); setView("monthly"); }}>পূর্ণ রিপোর্ট দেখুন <ArrowRight aria-hidden="true" /></button></footer>
            </section> : null}
          </>
        )}
      </main>

      {confirmingReceipt && <div className="tiffin-receipt-confirm-layer no-print" role="presentation" onClick={() => { if (!saving) setConfirmingReceipt(false); }}>
        <section className="tiffin-receipt-confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="tiffin-receipt-confirm-title" onClick={(event) => event.stopPropagation()}>
          <header><span><ClipboardCheck aria-hidden="true" /></span><div><small>চূড়ান্ত যাচাই</small><h2 id="tiffin-receipt-confirm-title">প্রাপ্তি নিশ্চিত করবেন?</h2></div><button type="button" aria-label="নিশ্চিতকরণ বন্ধ করুন" disabled={saving} onClick={() => setConfirmingReceipt(false)}><X aria-hidden="true" /></button></header>
          <p className="tiffin-receipt-confirm-statement">{receiptConfirmationText}</p>
          <div className="tiffin-receipt-confirm-items">{scheduledItems.map((code) => { const meta = ITEM_META[code]; const difference = received[code] - demand; return <article key={code}><span className={`is-${meta.tone}`}><img src={meta.iconSrc} alt="" width={24} height={24} /></span><div><strong>{meta.name}</strong><small>প্রত্যাশিত {bengaliNumber(demand)} {meta.unit}</small></div><b>{bengaliNumber(received[code])} <small>{meta.unit}</small></b><em className={difference === 0 ? "is-exact" : "is-different"}>{difference === 0 ? "মিলেছে" : difference < 0 ? `${bengaliNumber(Math.abs(difference))} কম` : `${bengaliNumber(difference)} বেশি`}</em></article>; })}</div>
          {(hasShortage || hasExcess) && <div className="tiffin-receipt-confirm-warning"><AlertTriangle aria-hidden="true" /><span>প্রাপ্ত পরিমাণে পার্থক্য আছে। নিশ্চিত করলে এই তথ্য রিপোর্ট হিসেবে সংরক্ষিত হবে।</span></div>}
          <footer><button type="button" className="is-back" disabled={saving} onClick={() => setConfirmingReceipt(false)}>ফিরে গিয়ে দেখুন</button><button type="button" className="is-confirm" autoFocus disabled={saving} onClick={() => { setConfirmingReceipt(false); void submitReport(); }}><Check aria-hidden="true" />{saving ? "সংরক্ষণ হচ্ছে…" : "হ্যাঁ, নিশ্চিত করুন"}</button></footer>
        </section>
      </div>}

      {view !== "home" && <footer className="tiffin-school-footer">
        <span className="tiffin-school-footer-icon"><School aria-hidden="true" /></span>
        <div>
          <strong>{school?.name_bn || (loading ? "বিদ্যালয়ের তথ্য লোড হচ্ছে…" : "বিদ্যালয় পাওয়া যায়নি")}</strong>
          <small><MapPin aria-hidden="true" /><span>{school?.area_name || "এলাকার তথ্য নেই"}</span>{school && <><i aria-hidden="true" /><span>EMIS <b>{school.emis_code}</b></span></>}</small>
        </div>
      </footer>}

      <nav className="tiffin-bottom-nav no-print" aria-label="মোবাইল মেনু">
        <button type="button" className={view === "home" ? "is-active" : ""} onClick={() => setView("home")}><Home aria-hidden="true" /><span>হোম</span></button>
        <button type="button" className={view === "monthly" ? "is-active" : ""} onClick={() => { setMonthlyFocusDate(null); setView("monthly"); }}><CalendarDays aria-hidden="true" /><span>মাসিক পরিকল্পনা</span></button>
        <button type="button" className={view === "distribution" ? "is-active" : ""} onClick={() => setView("distribution")}><Truck aria-hidden="true" /><span>বিতরণ</span></button>
        <div className="account-launcher-host tiffin-mobile-profile-host" aria-label={`${userName} প্রোফাইল`} />
      </nav>
    </div>
  );
}

function TiffinHomeDashboard({
  userName,
  school,
  scheduledItems,
  tomorrowItems,
  demand,
  report,
  recentReports,
  today,
  now,
  loading,
  reportingWindow,
  onRetry,
  onOpenDistribution,
  onOpenMonthly,
  onOpenTodayReport,
}: {
  userName: string;
  school: SchoolRow | null;
  scheduledItems: ItemCode[];
  tomorrowItems: ItemCode[];
  demand: number;
  report: DistributionReport | null;
  recentReports: DistributionReport[];
  today: string;
  now: Date;
  loading: boolean;
  reportingWindow: ReturnType<typeof getAreaManagerReportingWindow>;
  onRetry: () => void;
  onOpenDistribution: () => void;
  onOpenMonthly: () => void;
  onOpenTodayReport: () => void;
}) {
  if (loading) {
    return <div className="tiffin-home-skeleton" aria-busy="true" aria-label="হোম ড্যাশবোর্ড লোড হচ্ছে"><span /><span /><span /><span /></div>;
  }
  if (!school) {
    return <section className="tiffin-home-empty" role="alert"><School aria-hidden="true" /><div><h2>বিদ্যালয়ের তথ্য পাওয়া যায়নি</h2><p>এই টিফিন ম্যানেজার অ্যাকাউন্টের সঙ্গে একটি সক্রিয় বিদ্যালয় যুক্ত আছে কি না পরীক্ষা করুন।</p><button type="button" onClick={onRetry}>আবার চেষ্টা করুন</button></div></section>;
  }

  const dhaka = getDhakaClock(now);
  const greeting = dhaka.hour < 12 ? "শুভ সকাল" : dhaka.hour < 17 ? "শুভ অপরাহ্ণ" : "শুভ সন্ধ্যা";
  const dateInfo = formatDistributionDate(today);
  const tomorrow = shiftDate(today, 1);
  const tomorrowInfo = formatDistributionDate(tomorrow);
  const deadline = new Date(`${today}T${String(DISTRIBUTION_REPORT_CUTOFF_HOUR).padStart(2, "0")}:00:00+06:00`);
  const remainingSeconds = Math.max(0, Math.floor((deadline.getTime() - now.getTime()) / 1000));
  const hours = Math.floor(remainingSeconds / 3600);
  const minutes = Math.floor((remainingSeconds % 3600) / 60);
  const seconds = remainingSeconds % 60;
  const twoDigits = (value: number) => new Intl.NumberFormat("bn-BD", { minimumIntegerDigits: 2, useGrouping: false }).format(value);
  const deadlineText = new Intl.DateTimeFormat("bn-BD", { hour: "numeric", minute: "2-digit", timeZone: "Asia/Dhaka" }).format(deadline);
  const nearDeadline = reportingWindow.canReport && remainingSeconds <= 30 * 60;
  const reportingTitle = !scheduledItems.length
    ? "আজ কোনো রিপোর্ট নির্ধারিত নেই"
    : reportingWindow.canReport
      ? nearDeadline ? "রিপোর্ট জমা দেওয়ার সময় প্রায় শেষ" : "রিপোর্টিং সময় চালু আছে"
      : "রিপোর্টিং সময় শেষ হয়েছে";
  const reportItem = (code: ItemCode) => {
    const receivedValue = itemReportValue(report, code, "received");
    const shortageValue = itemReportValue(report, code, "shortage");
    const excessValue = itemReportValue(report, code, "excess");
    const status = !report ? "প্রাপ্তি বাকি" : shortageValue > 0 ? `${bengaliNumber(shortageValue)} ${ITEM_META[code].unit} ঘাটতি` : excessValue > 0 ? `${bengaliNumber(excessValue)} ${ITEM_META[code].unit} বেশি প্রাপ্ত` : "সম্পন্ন";
    return { receivedValue, status, shortageValue, excessValue };
  };
  const hasIssue = scheduledItems.some((code) => {
    const item = reportItem(code);
    return item.shortageValue > 0 || item.excessValue > 0;
  });
  const issueText = scheduledItems.map((code) => ({ code, ...reportItem(code) })).filter((item) => item.shortageValue || item.excessValue).map((item) => `${ITEM_META[item.code].name}: ${item.status}`).join(" · ");
  const needsAttention = hasIssue || (!report && scheduledItems.length > 0);
  const primaryActionLabel = hasIssue ? "সমস্যার রিপোর্ট দেখুন" : report ? "আজকের রিপোর্ট দেখুন" : "প্রাপ্তি ও বিতরণ রিপোর্ট দিন";
  const primaryAction = report ? onOpenTodayReport : onOpenDistribution;
  const sevenDayStart = shiftDate(today, -6);
  const lastSevenReports = recentReports.filter((item) => item.date >= sevenDayStart && item.date <= today);
  const completedDays = new Set(lastSevenReports.map((item) => item.date)).size;
  const servedStudents = lastSevenReports.reduce((sum, item) => sum + Math.max(Number(item.received_bread || 0), Number(item.received_egg || 0), Number(item.received_banana || 0)), 0);
  const shortageDays = new Set(lastSevenReports.filter((item) => Number(item.shortage_bread || 0) + Number(item.shortage_egg || 0) + Number(item.shortage_banana || 0) > 0).map((item) => item.date)).size;
  const totalVariance = scheduledItems.reduce((sum, code) => {
    const item = reportItem(code);
    return sum + item.shortageValue + item.excessValue;
  }, 0);
  const activities = [...recentReports].sort((a, b) => String(b.updated_at || b.created_at || b.date).localeCompare(String(a.updated_at || a.created_at || a.date))).slice(0, 3);
  const formatActivityTime = (item: DistributionReport) => {
    const raw = item.updated_at || item.created_at;
    if (!raw) return formatDistributionDate(item.date).dateText;
    const parsed = new Date(raw.includes("T") ? raw : `${raw.replace(" ", "T")}Z`);
    return new Intl.DateTimeFormat("bn-BD", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit", timeZone: "Asia/Dhaka" }).format(parsed);
  };

  return <div className="tiffin-home-dashboard tiffin-daily-dashboard">
    <section className={`tiffin-daily-header ${nearDeadline && !report ? "is-warning" : ""} ${report && !hasIssue ? "is-complete" : ""}`}>
      <div className="tiffin-daily-heading"><span>{greeting}, টিফিন ম্যানেজার</span><h1>{school.name_bn}</h1><p><CalendarDays aria-hidden="true" />{dateInfo.dateText} · {dateInfo.weekday}</p></div>
      <div className="tiffin-daily-status"><span>{report ? <CheckCircle2 aria-hidden="true" /> : <Clock3 aria-hidden="true" />}</span><div><small>আজকের রিপোর্ট</small><strong>{report ? hasIssue ? "পার্থক্যসহ জমা হয়েছে" : "সম্পন্ন হয়েছে" : reportingTitle}</strong><p>{report ? hasIssue ? issueText : "সব নির্ধারিত আইটেমের তথ্য সংরক্ষিত" : reportingWindow.canReport ? `শেষ সময় ${deadlineText}` : "আজ আর রিপোর্ট করা যাবে না"}</p></div></div>
      <button className="tiffin-daily-primary-action" type="button" onClick={primaryAction}><FileText aria-hidden="true" /><span>{primaryActionLabel}</span><ArrowRight aria-hidden="true" /></button>
    </section>

    {needsAttention && <section className={`tiffin-daily-alert ${hasIssue ? "has-issue" : ""}`} role="status"><AlertTriangle aria-hidden="true" /><div><strong>{hasIssue ? "প্রাপ্ত পরিমাণে পার্থক্য পাওয়া গেছে" : "আজকের রিপোর্ট এখনো জমা হয়নি"}</strong><p>{hasIssue ? issueText : reportingWindow.canReport ? `সময় বাকি ${twoDigits(hours)}:${twoDigits(minutes)}:${twoDigits(seconds)} — প্রাপ্ত পরিমাণ যাচাই করে রিপোর্ট দিন।` : "রিপোর্টিং সময় শেষ হয়েছে।"}</p></div></section>}

    <div className="tiffin-daily-main-grid">
      <section className="tiffin-daily-meals" aria-labelledby="today-meals-heading">
        <header><div><span>আজকের খাবার</span><h2 id="today-meals-heading">বরাদ্দ ও প্রাপ্তির হিসাব</h2></div><em>{bengaliNumber(scheduledItems.length)} আইটেম</em></header>
        {!scheduledItems.length ? <div className="tiffin-home-no-allocation"><CalendarDays aria-hidden="true" /><div><strong>আজ খাবার বিতরণ নেই</strong><p>মাসিক পরিকল্পনায় আজ কোনো আইটেম নির্ধারিত নেই।</p></div></div> : <div className="tiffin-daily-meal-list">{scheduledItems.map((code) => {
          const meta = ITEM_META[code];
          const item = reportItem(code);
          return <article className={`tiffin-daily-meal-row is-${meta.tone}`} key={code}>
            <span className="tiffin-daily-meal-icon"><img src={meta.iconSrc} alt="" width={31} height={31} /></span>
            <div className="tiffin-daily-meal-name"><strong>{meta.name}</strong><small className={item.shortageValue ? "is-shortage" : item.excessValue ? "is-excess" : report ? "is-done" : "is-pending"}>{item.status}</small></div>
            <dl><div><dt>বরাদ্দ</dt><dd>{bengaliNumber(demand)} <small>{meta.unit}</small></dd></div><div><dt>প্রাপ্ত</dt><dd>{report ? bengaliNumber(item.receivedValue) : "—"} <small>{report ? meta.unit : ""}</small></dd></div><div><dt>পার্থক্য</dt><dd className={item.shortageValue ? "is-shortage" : item.excessValue ? "is-excess" : ""}>{!report ? "—" : item.shortageValue ? `−${bengaliNumber(item.shortageValue)}` : item.excessValue ? `+${bengaliNumber(item.excessValue)}` : "০"} <small>{report ? meta.unit : ""}</small></dd></div></dl>
          </article>;
        })}</div>}
      </section>

      <aside className="tiffin-next-plan">
        <header><span><CalendarDays aria-hidden="true" /></span><div><small>পরবর্তী দিনের পরিকল্পনা</small><h2>{tomorrowInfo.dateText}</h2><p>{tomorrowInfo.weekday}</p></div></header>
        {tomorrowItems.length ? <div className="tiffin-next-plan-items">{tomorrowItems.map((code) => { const meta = ITEM_META[code]; return <div key={code}><img src={meta.iconSrc} alt="" width={25} height={25} /><span>{meta.name}</span><strong>{bengaliNumber(demand)} {meta.unit}</strong></div>; })}</div> : <p className="tiffin-next-plan-empty">আগামী দিনের জন্য কোনো খাবার নির্ধারিত নেই।</p>}
        <button type="button" onClick={onOpenMonthly}>মাসিক পরিকল্পনা দেখুন <ArrowRight aria-hidden="true" /></button>
      </aside>
    </div>

    <section className="tiffin-daily-metrics" aria-label="এক নজরে">
      <article><span><Users aria-hidden="true" /></span><div><small>আজকের শিক্ষার্থী</small><strong>{bengaliNumber(demand)} জন</strong></div></article>
      <article><span><CheckCircle2 aria-hidden="true" /></span><div><small>রিপোর্ট অবস্থা</small><strong>{report ? "জমা হয়েছে" : scheduledItems.length ? "অপেক্ষমাণ" : "প্রযোজ্য নয়"}</strong></div></article>
      <article className={totalVariance ? "has-issue" : ""}><span><AlertTriangle aria-hidden="true" /></span><div><small>আজকের পার্থক্য</small><strong>{report ? `${bengaliNumber(totalVariance)} আইটেম` : "—"}</strong></div></article>
      <article><span><CalendarDays aria-hidden="true" /></span><div><small>গত ৭ দিনের রিপোর্ট</small><strong>{bengaliNumber(completedDays)} দিন</strong></div></article>
    </section>

    <div className="tiffin-daily-lower-grid">
      <section className="tiffin-recent-reports"><header><div><span>সাম্প্রতিক কার্যক্রম</span><h2>সর্বশেষ রিপোর্টসমূহ</h2></div><small>গত ৭ দিন</small></header>{activities.length ? <ol>{activities.map((item) => <li key={item.id}><span className={item.problem_type === "none" ? "is-complete" : "has-issue"}>{item.problem_type === "none" ? <Check aria-hidden="true" /> : <AlertTriangle aria-hidden="true" />}</span><div><strong>{item.problem_type === "none" ? "প্রাপ্তি ও বিতরণ সম্পন্ন" : "ঘাটতি/অতিরিক্ত রিপোর্ট"}</strong><small>{formatActivityTime(item)}</small></div><em>{formatDistributionDate(item.date).dateText}</em></li>)}</ol> : <p className="tiffin-home-empty-copy">এখনো কোনো কার্যক্রম সংরক্ষিত হয়নি।</p>}</section>
      <section className="tiffin-weekly-summary"><header><span>৭ দিনের চিত্র</span><h2>সাপ্তাহিক সারসংক্ষেপ</h2></header><dl><div><dt>রিপোর্ট সম্পন্ন</dt><dd>{bengaliNumber(completedDays)} দিন</dd></div><div><dt>শিক্ষার্থী পরিবেশন</dt><dd>{bengaliNumber(servedStudents)} জন</dd></div><div className={shortageDays ? "has-issue" : ""}><dt>ঘাটতি পাওয়া গেছে</dt><dd>{bengaliNumber(shortageDays)} দিন</dd></div></dl></section>
    </div>

    <section className="tiffin-home-school-card"><span><School aria-hidden="true" /></span><div><strong>{school.name_bn}</strong><small><MapPin aria-hidden="true" />{school.area_name || "এলাকার তথ্য নেই"}<i />EMIS: <b>{school.emis_code}</b></small></div><span className="sr-only">লগইন: {userName}</span></section>
  </div>;
}

function MonthlyMealPlan({ initialMonth, demand, school, requestedDate }: { initialMonth: string; demand: number; school: SchoolRow | null; requestedDate?: string | null }) {
  const startingMonth = requestedDate?.slice(0, 7) || initialMonth;
  const cachedStartingPlan = getCachedMonthlyPlan(startingMonth);
  const [month, setMonth] = useState(startingMonth);
  const [plan, setPlan] = useState<MonthlyPlanPayload | null>(cachedStartingPlan);
  const [monthReports, setMonthReports] = useState<DistributionReport[]>([]);
  const [settings, setSettings] = useState<PublicSettings>({});
  const [loading, setLoading] = useState(!cachedStartingPlan);
  const [error, setError] = useState("");
  const [pdfBusy, setPdfBusy] = useState(false);
  const [pdfMessage, setPdfMessage] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedReport, setSelectedReport] = useState<DistributionReport | null>(null);
  const [dayReportLoading, setDayReportLoading] = useState(false);
  const [dayReportError, setDayReportError] = useState("");
  const reportRef = useRef<HTMLElement>(null);

  const openDayReport = useCallback(async (date: string) => {
    setSelectedDate(date);
    setDayReportLoading(true);
    setDayReportError("");
    try {
      const response = await fetch(`/api/distribution-reports?date=${date}`, { cache: "no-store" });
      const result = await response.json() as { reports?: DistributionReport[]; error?: string };
      if (!response.ok) throw new Error(result.error || "দৈনিক রিপোর্ট লোড করা যায়নি।");
      setSelectedReport((result.reports || []).find((entry) => entry.school_emis_code === school?.emis_code) || null);
    } catch (loadError) {
      setSelectedReport(null);
      setDayReportError(loadError instanceof Error ? loadError.message : "দৈনিক রিপোর্ট লোড করা যায়নি।");
    } finally {
      setDayReportLoading(false);
    }
  }, [school?.emis_code]);

  useEffect(() => {
    if (!requestedDate) return;
    setMonth(requestedDate.slice(0, 7));
    void openDayReport(requestedDate);
  }, [openDayReport, requestedDate]);

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/settings/public", { cache: "no-store" })
      .then(async (response) => response.ok ? await response.json() as PublicSettings : {})
      .then((result) => { if (!cancelled) setSettings(result); })
      .catch(() => undefined);
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function loadMonth() {
      const cached = getCachedMonthlyPlan(month);
      setPlan(cached);
      setMonthReports([]);
      setLoading(!cached);
      setError("");
      try {
        const result = await loadMonthlyPlan(month);
        if (!cancelled) {
          setPlan(result);
        }
      } catch (loadError) {
        if (!cancelled) {
          setPlan(null);
          setError(loadError instanceof Error ? loadError.message : "মাসিক পরিকল্পনা লোড করা যায়নি।");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void loadMonth();
    return () => { cancelled = true; };
  }, [month]);

  const refreshPrintableReports = useCallback(async () => {
    const response = await fetch(`/api/distribution-reports?month=${month}`, { cache: "no-store" });
    const result = await response.json() as { reports?: DistributionReport[]; error?: string };
    if (!response.ok) throw new Error(result.error || "মাসিক প্রাপ্তি রিপোর্ট হালনাগাদ করা যায়নি।");
    const latestReports = (result.reports || []).filter((entry) => entry.school_emis_code === school?.emis_code && entry.date.startsWith(`${month}-`));
    flushSync(() => setMonthReports(latestReports));
    await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
  }, [month, school?.emis_code]);

  const [year, monthNumber] = month.split("-").map(Number);
  const plannedDays = useMemo(() => {
    const result = new Map<string, ItemCode[]>();
    for (const day of plan?.days || []) {
      result.set(day.date, day.items.filter((item): item is ItemCode => item in ITEM_META));
    }
    return result;
  }, [plan]);
  const calendarDays = useMemo(() => {
    const firstDay = new Date(Date.UTC(year, monthNumber - 1, 1)).getUTCDay();
    const totalDays = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();
    return Array.from({ length: Math.ceil((firstDay + totalDays) / 7) * 7 }, (_, index) => {
      const day = index - firstDay + 1;
      return day > 0 && day <= totalDays ? `${month}-${String(day).padStart(2, "0")}` : null;
    });
  }, [month, monthNumber, year]);
  const itemCounts = useMemo(() => {
    const counts: Record<ItemCode, number> = { bun: 0, egg: 0, banana: 0 };
    plannedDays.forEach((items) => items.forEach((item) => { counts[item] += 1; }));
    return counts;
  }, [plannedDays]);
  const monthReportsByDate = useMemo(() => new Map(monthReports.map((entry) => [entry.date, entry])), [monthReports]);
  const printableDays = useMemo(() => {
    const merged = new Map<string, ItemCode[]>();
    plannedDays.forEach((items, date) => merged.set(date, [...items]));
    monthReports.forEach((report) => {
      const items = new Set<ItemCode>(merged.get(report.date) || []);
      reportItemCodes(report).forEach((code) => items.add(code));
      if (items.size > 0) merged.set(report.date, Array.from(items));
    });
    return Array.from(merged.entries())
      .filter(([, items]) => items.length > 0)
      .sort(([left], [right]) => left.localeCompare(right));
  }, [monthReports, plannedDays]);
  const reportRows = useMemo(() => {
    return Array.from({ length: Math.max(30, printableDays.length) }, (_, index) => {
      const entry = printableDays[index];
      return entry ? { date: entry[0], items: entry[1], report: monthReportsByDate.get(entry[0]) || null } : null;
    });
  }, [monthReportsByDate, printableDays]);
  const monthlyReceivedTotals = useMemo(() => {
    const totals: Record<ItemCode, number> = { bun: 0, egg: 0, banana: 0 };
    printableDays.forEach(([date, items]) => {
      const dayReport = monthReportsByDate.get(date);
      if (!dayReport) return;
      items.forEach((code) => { totals[code] += effectiveReceivedValue(dayReport, code); });
    });
    return totals;
  }, [monthReportsByDate, printableDays]);
  const location = useMemo(() => {
    const parts = String(settings.address || "")
      .split(/[,.·]/)
      .map((part) => part.trim())
      .filter(Boolean);
    const upazilaPart = parts.find((part) => part.includes("উপজেলা")) || parts[0] || "";
    const districtPart = parts.find((part) => part.includes("জেলা") && !part.includes("উপজেলা")) || parts.at(-1) || "";
    return {
      upazila: upazilaPart.replace(/\s*উপজেলা\s*/g, "").trim(),
      district: districtPart.replace(/\s*জেলা\s*/g, "").trim(),
    };
  }, [settings.address]);
  const selectedPlanItems = useMemo(() => selectedDate ? plannedDays.get(selectedDate) || [] : [], [plannedDays, selectedDate]);
  const selectedItemCodes = useMemo(() => {
    if (!selectedDate) return [] as ItemCode[];
    return (Object.keys(ITEM_META) as ItemCode[]).filter((code) => {
      const suffix = code === "bun" ? "bread" : code;
      const planned = Number(selectedReport?.[`planned_${suffix}` as keyof DistributionReport] || 0);
      return selectedPlanItems.includes(code) || planned > 0 || itemReportValue(selectedReport, code, "received") > 0;
    });
  }, [selectedDate, selectedPlanItems, selectedReport]);
  const selectedDateInfo = selectedDate ? formatDistributionDate(selectedDate) : null;
  const selectedReportTime = useMemo(() => {
    const raw = selectedReport?.submissions?.at(-1)?.submitted_at || selectedReport?.created_at || selectedReport?.updated_at;
    return formatReportTimestamp(raw);
  }, [selectedReport]);

  function moveMonth(offset: number) {
    const next = new Date(Date.UTC(year, monthNumber - 1 + offset, 1));
    setMonth(`${next.getUTCFullYear()}-${String(next.getUTCMonth() + 1).padStart(2, "0")}`);
  }

  async function printMonthlyReport() {
    setPdfMessage("");
    try {
      await refreshPrintableReports();
      printDesktopLayout("printing-monthly-food-report");
    } catch (refreshError) {
      setPdfMessage(refreshError instanceof Error ? refreshError.message : "মাসিক প্রাপ্তি রিপোর্ট হালনাগাদ করা যায়নি।");
    }
  }

  async function downloadMonthlyReport() {
    if (!reportRef.current || pdfBusy) return;
    setPdfBusy(true);
    setPdfMessage("");
    const report = reportRef.current;
    try {
      await refreshPrintableReports();
      report.classList.add("is-pdf-capture");
      await document.fonts?.ready;
      await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
      const [{ toJpeg }, { jsPDF }] = await Promise.all([
        import("html-to-image"),
        import("jspdf"),
      ]);
      const reportImage = await toJpeg(report, {
        backgroundColor: "#ffffff",
        cacheBust: true,
        height: report.clientHeight,
        pixelRatio: 2,
        quality: 0.98,
        style: {
          display: "block",
          left: "0",
          position: "static",
          top: "0",
          transform: "none",
          zIndex: "auto",
        },
        width: report.clientWidth,
      });
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });
      pdf.addImage(reportImage, "JPEG", 0, 0, 210, 297, undefined, "FAST");
      pdf.save(`মাসিক-খাদ্য-প্রতিবেদন-${school?.emis_code || "বিদ্যালয়"}-${month}.pdf`);
      setPdfMessage("PDF ডাউনলোড সম্পন্ন হয়েছে।");
    } catch {
      setPdfMessage("PDF তৈরি করা যায়নি। আবার চেষ্টা করুন।");
    } finally {
      report.classList.remove("is-pdf-capture");
      setPdfBusy(false);
    }
  }

  return <section className="tiffin-monthly-page" aria-labelledby="tiffin-monthly-heading">
    <header className="tiffin-monthly-heading no-print">
      <div><span className="tiffin-eyebrow">খাবার সূচি</span><h2 id="tiffin-monthly-heading">মাসিক খাবার পরিকল্পনা</h2><p>{plan?.periodName || "বিদ্যালয়ের নির্ধারিত খাবারের ক্যালেন্ডার"}</p></div>
      <div className="tiffin-monthly-controls">
        <div className="tiffin-month-picker" aria-label="মাস পরিবর্তন করুন">
          <button type="button" onClick={() => moveMonth(-1)} aria-label="আগের মাস"><ChevronLeft aria-hidden="true" /></button>
          <strong>{MONTH_NAMES[monthNumber - 1]} {year.toLocaleString("bn-BD", { useGrouping: false })}</strong>
          <button type="button" onClick={() => moveMonth(1)} aria-label="পরের মাস"><ChevronRight aria-hidden="true" /></button>
        </div>
        <div className="tiffin-month-report-actions">
          <button type="button" onClick={() => void printMonthlyReport()} disabled={loading}><Printer aria-hidden="true" />প্রিন্ট করুন</button>
        </div>
      </div>
    </header>

    {error && <div className="tiffin-message no-print" role="alert">{error}</div>}
    {pdfMessage && <div className={`tiffin-message no-print ${pdfMessage.includes("সম্পন্ন") ? "is-success" : ""}`} role="status">{pdfMessage}</div>}
    <div className="tiffin-month-summary no-print" aria-label="মাসিক খাবারের সারাংশ">
      {(Object.keys(ITEM_META) as ItemCode[]).map((code) => {
        const meta = ITEM_META[code];
        return <article className={`is-${meta.tone}`} key={code}><span><img src={meta.iconSrc} alt="" width={24} height={24} /></span><div><strong>{meta.name}</strong><small>{bengaliNumber(itemCounts[code])} দিন · মোট {bengaliNumber(itemCounts[code] * demand)} {meta.unit}</small></div></article>;
      })}
    </div>

    <div className={`tiffin-month-workspace no-print ${selectedDate ? "has-day-report" : ""}`}>
      <div className={`tiffin-month-calendar ${loading ? "is-loading" : ""}`} aria-busy={loading}>
        <div className="tiffin-month-weekdays">{WEEK_DAYS.map((day) => <span key={day}>{day}</span>)}</div>
        <div className="tiffin-month-grid">
          {calendarDays.map((date, index) => {
            if (!date) return <span className="tiffin-month-blank" key={`blank-${index}`} />;
            const items = plannedDays.get(date) || [];
            const inPeriod = plan?.source === "configured" && (!plan.startDate || date >= plan.startDate) && (!plan.endDate || date <= plan.endDate);
            const isToday = date === getDhakaClock().date;
            return <button type="button" aria-label={`${formatDistributionDate(date).dateText}-এর রিপোর্ট দেখুন`} onClick={() => void openDayReport(date)} className={`${items.length ? "is-planned" : "is-closed"} ${isToday ? "is-today" : ""} ${selectedDate === date ? "is-report-selected" : ""}`} key={date}>
              <header><strong>{bengaliNumber(Number(date.slice(-2)))}</strong>{isToday && <span>আজ</span>}</header>
              <div>{items.map((code) => { const meta = ITEM_META[code]; return <span className={`is-${meta.tone}`} key={code}><img src={meta.iconSrc} alt="" width={14} height={14} />{meta.name}</span>; })}</div>
              {!items.length && <small>{inPeriod ? "বিদ্যালয় বন্ধ" : "পরিকল্পনা নেই"}</small>}
            </button>;
          })}
        </div>
        {loading && <div className="tiffin-month-loading">পরিকল্পনা লোড হচ্ছে…</div>}
      </div>
      {selectedDate && <>
        <button type="button" className="tiffin-day-report-backdrop" aria-label="দৈনিক রিপোর্ট বন্ধ করুন" onClick={() => setSelectedDate("")} />
        <aside className="tiffin-day-report-panel" role="dialog" aria-labelledby="tiffin-day-report-title">
          <header><div><span>দৈনিক প্রাপ্তি রিপোর্ট</span><h3 id="tiffin-day-report-title">{selectedDateInfo?.dateText}</h3><small>{selectedDateInfo?.weekday}</small></div><button type="button" onClick={() => setSelectedDate("")} aria-label="রিপোর্ট বন্ধ করুন"><X aria-hidden="true" /></button></header>
          {dayReportLoading ? <div className="tiffin-day-report-state" aria-live="polite">রিপোর্ট লোড হচ্ছে…</div> : dayReportError ? <div className="tiffin-day-report-state is-error" role="alert">{dayReportError}</div> : !selectedReport ? <div className="tiffin-day-report-state"><FileText aria-hidden="true" /><strong>এই দিনের রিপোর্ট পাওয়া যায়নি</strong><p>{selectedPlanItems.length ? "নির্ধারিত খাবারের প্রাপ্তি রিপোর্ট এখনো জমা হয়নি।" : "এই দিনে খাবার বিতরণের পরিকল্পনা ছিল না।"}</p></div> : <>
            <div className="tiffin-day-report-items">{selectedItemCodes.map((code) => {
              const meta = ITEM_META[code];
              const suffix = code === "bun" ? "bread" : code;
              const expected = Number(selectedReport[`planned_${suffix}` as keyof DistributionReport] || (selectedPlanItems.includes(code) ? demand : 0));
              const receivedValue = itemReportValue(selectedReport, code, "received");
              const rawDifference = receivedValue - expected;
              const outstandingShortage = Number(selectedReport[`outstanding_shortage_${code}` as keyof DistributionReport] ?? Math.max(0, -rawDifference));
              const outstandingExcess = Number(selectedReport[`outstanding_excess_${code}` as keyof DistributionReport] ?? Math.max(0, rawDifference));
              const difference = outstandingExcess - outstandingShortage;
              const settledShortage = Number(selectedReport[`settled_shortage_${code}` as keyof DistributionReport] || 0);
              const settledExcess = Number(selectedReport[`settled_excess_${code}` as keyof DistributionReport] || 0);
              const printableReceived = effectiveReceivedValue(selectedReport, code);
              return <article className={difference < 0 ? "is-short" : difference > 0 ? "is-excess" : "is-exact"} key={code}><div><span><img src={meta.iconSrc} alt="" width={22} height={22} /></span><strong>{meta.name}</strong><em>{difference === 0 ? (rawDifference === 0 ? "সম্পূর্ণ" : "সমন্বিত") : difference < 0 ? `ঘাটতি ${bengaliNumber(Math.abs(difference))}` : `অতিরিক্ত ${bengaliNumber(difference)}`}</em></div><dl><div><dt>মূল বরাদ্দ</dt><dd>{bengaliNumber(expected)} {meta.unit}</dd></div><div><dt>মূল প্রাপ্তি</dt><dd>{bengaliNumber(receivedValue)} {meta.unit}</dd></div><div><dt>প্রিন্টে গণ্য</dt><dd>{bengaliNumber(printableReceived)} {meta.unit}</dd></div><div><dt>বর্তমান বকেয়া</dt><dd>{difference > 0 ? "+" : ""}{bengaliNumber(difference)} {meta.unit}</dd></div></dl>{(settledShortage > 0 || settledExcess > 0) && <p className="tiffin-day-item-adjustment">{settledShortage > 0 && <span>ঘাটতি পূরণ +{bengaliNumber(settledShortage)}</span>}{settledExcess > 0 && <span>আগের ঘাটতিতে ব্যবহার {bengaliNumber(settledExcess)}</span>}</p>}</article>;
            })}</div>
            <DayReportAuditTrail report={selectedReport} />
            <footer><CheckCircle2 aria-hidden="true" /><div><strong>{selectedReport.confirmation_source === "system" ? "স্বয়ংক্রিয়ভাবে সম্পূর্ণ প্রাপ্ত" : selectedReport.status === "partially_resolved" ? "আংশিক সমন্বিত" : selectedReport.status === "under_review" ? "সমন্বয়ের অপেক্ষায়" : selectedReport.status === "resolved" && selectedReport.problem_type !== "none" ? "সমন্বয় সম্পন্ন" : selectedReport.problem_type === "none" ? "রিপোর্ট সম্পন্ন" : "পার্থক্যসহ রিপোর্ট জমা হয়েছে"}</strong>{selectedReportTime && <small>জমা: {selectedReportTime}</small>}</div></footer>
          </>}
        </aside>
      </>}
    </div>
    <footer className="tiffin-month-legend no-print">
      <div><span><i className="is-planned" />খাবার বিতরণ</span><span><i className="is-closed" />বিদ্যালয় বন্ধ/পরিকল্পনা নেই</span></div>
      <button type="button" className="tiffin-month-topsheet-download" onClick={() => void downloadMonthlyReport()} disabled={loading || pdfBusy}><Download aria-hidden="true" />{pdfBusy ? "টপশিট তৈরি হচ্ছে…" : "টপশিট ডাউনলোড করুন"}</button>
    </footer>

    <section ref={reportRef} className="tiffin-monthly-print-report" aria-hidden="true">
      <div className="tiffin-report-form-code">নমুনা ফরম-৪</div>
      <header className="tiffin-report-title">
        <h1>সরকারি প্রাথমিক বিদ্যালয় ফিডিং কর্মসূচি</h1>
        <h2>বিদ্যালয়ে গৃহীত খাদ্যের মাসিক প্রতিবেদন</h2>
        <p>মাসঃ {MONTH_NAMES[monthNumber - 1]} সনঃ {bengaliDigits(year)}</p>
      </header>
      <table className="tiffin-report-school-meta">
        <tbody>
          <tr><td>বিদ্যালয়ের নাম: <strong>{school?.name_bn || ""}</strong></td><td>EMIS কোড: <strong>{school?.emis_code || ""}</strong></td></tr>
          <tr><td>জেলা: <strong>{location.district}</strong></td><td>উপজেলা: <strong>{location.upazila}</strong></td></tr>
          <tr><td>ইউনিয়ন: <strong>{school?.union_name || ""}</strong></td><td>ক্লাস্টার: <strong>{school?.cluster_name || ""}</strong></td></tr>
        </tbody>
      </table>
      <table className="tiffin-report-food-table">
        <colgroup><col className="is-serial" /><col className="is-date" /><col className="is-challan" /><col className="is-date" /><col className="is-food" /><col className="is-food" /><col className="is-food" /><col className="is-food-wide" /><col className="is-food" /><col className="is-sign" /><col className="is-comment" /></colgroup>
        <thead>
          <tr><th rowSpan={2}>ক্রমিক<br />নম্বর</th><th rowSpan={2}>খাদ্য<br />গ্রহণের<br />তারিখ</th><th rowSpan={2}>চালান<br />নম্বর</th><th rowSpan={2}>চালানের<br />তারিখ</th><th colSpan={5}>গৃহীত খাদ্যসামগ্রী (পিস/প্যাকেট)</th><th rowSpan={2}>গ্রহণকারীর<br />স্বাক্ষর</th><th rowSpan={2}>মন্তব্য</th></tr>
          <tr><th>বনরুটি</th><th>সিদ্ধ ডিম</th><th>কলা</th><th>ফর্টিফাইড<br />বিস্কুট</th><th>ইউএইচটি<br />দুধ</th></tr>
          <tr className="tiffin-report-column-numbers">{Array.from({ length: 11 }, (_, index) => <th key={index}>{bengaliDigits(index + 1)}</th>)}</tr>
        </thead>
        <tbody>
          {reportRows.map((row, index) => <tr key={index}>
            <td>{bengaliDigits(index + 1)}</td>
            <td>{row ? formatReportDate(row.date) : ""}</td>
            <td></td>
            <td>{row ? formatReportDate(row.date) : ""}</td>
            <td>{row ? row.items.includes("bun") ? row.report ? effectiveReceivedValue(row.report, "bun") : "" : "--" : ""}</td>
            <td>{row ? row.items.includes("egg") ? row.report ? effectiveReceivedValue(row.report, "egg") : "" : "--" : ""}</td>
            <td>{row ? row.items.includes("banana") ? row.report ? effectiveReceivedValue(row.report, "banana") : "" : "--" : ""}</td>
            <td></td><td></td><td></td><td><span className="tiffin-report-status">{row ? printReportStatus(row.report, row.items) : ""}</span></td>
          </tr>)}
        </tbody>
        <tfoot><tr><th colSpan={3}>মোট</th><th></th><th>{monthlyReceivedTotals.bun}</th><th>{monthlyReceivedTotals.egg}</th><th>{monthlyReceivedTotals.banana}</th><th></th><th></th><th></th><th></th></tr></tfoot>
      </table>
      <div className="tiffin-report-signatures">
        <div><span>টিফিন ম্যানেজারের স্বাক্ষর ও সিল:</span><span>তারিখ:</span></div>
        <div><span>প্রধান শিক্ষকের স্বাক্ষর ও সিল:</span><span>তারিখ:</span></div>
        <div><span>সংশ্লিষ্ট উপজেলা সহকারী প্রাথমিক শিক্ষা অফিসারের স্বাক্ষর ও সিল:</span><span>তারিখ:</span></div>
        <div><span>উপজেলা প্রাথমিক শিক্ষা অফিসারের স্বাক্ষর ও সিল:</span><span>তারিখ:</span></div>
      </div>
    </section>
  </section>;
}
