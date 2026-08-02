"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { ClipboardCheck, Download, ReceiptText, TrendingDown, Truck } from "lucide-react";
import {
  DISTRIBUTION_REPORT_CUTOFF_HOUR,
  getAreaManagerReportingWindow,
  getDhakaClock,
} from "../lib/distribution-reporting-window";
import "./report-dashboard-widgets.css";

type Props = {
  accountRole?: string;
  userAreaCode?: string;
};

const reportWidgets = [
  { key: "shortage", title: "শর্টেজ ও ক্ষতিপূরণ", description: "কম সরবরাহ এবং নগদ ক্ষতিপূরণের হিসাব", icon: TrendingDown },
  { key: "expense", title: "অঞ্চলভিত্তিক খরচ", description: "যানবাহন ও অন্যান্য দৈনিক ব্যয়ের রিপোর্ট", icon: Truck },
  { key: "export", title: "PDF ও Excel রিপোর্ট", description: "রিপোর্ট প্রিন্ট অথবা Excel/CSV-তে ডাউনলোড", icon: Download },
];

const twoDigitBengali = new Intl.NumberFormat("bn-BD", {
  minimumIntegerDigits: 2,
  useGrouping: false,
});

function formatCountdown(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${twoDigitBengali.format(hours)}:${twoDigitBengali.format(minutes)}:${twoDigitBengali.format(seconds)}`;
}

export function ReportDashboardWidgets({ accountRole = "", userAreaCode = "" }: Props) {
  const [target, setTarget] = useState<Element | null>(null);
  const [now, setNow] = useState(() => new Date());
  const isAreaManager = accountRole === "area_manager";
  const dhakaClock = getDhakaClock(now);
  const reportingWindow = getAreaManagerReportingWindow(dhakaClock.date, now);
  const remainingSeconds = Math.max(
    0,
    DISTRIBUTION_REPORT_CUTOFF_HOUR * 3600 -
      (dhakaClock.hour * 3600 + dhakaClock.minute * 60 + dhakaClock.second),
  );
  const countdown = useMemo(() => formatCountdown(remainingSeconds), [remainingSeconds]);

  useEffect(() => {
    const locate = () => setTarget(document.querySelector(".action-panel .action-list"));
    locate();
    const observer = new MutationObserver(locate);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isAreaManager) return;
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, [isAreaManager]);

  useEffect(() => {
    if (!target) return;
    const panel = target.closest(".action-panel");
    const eyebrow = panel?.querySelector<HTMLElement>(".eyebrow");
    const heading = panel?.querySelector<HTMLElement>("h2");
    const previousEyebrow = eyebrow?.textContent || "";
    const previousHeading = heading?.textContent || "";
    target.classList.add("report-widget-host");
    panel?.classList.toggle("report-dashboard-panel", !isAreaManager);
    panel?.classList.toggle("area-manager-shortcut-panel", isAreaManager);
    if (!isAreaManager && heading) heading.textContent = "রিপোর্ট";
    return () => {
      target.classList.remove("report-widget-host");
      panel?.classList.remove("report-dashboard-panel", "area-manager-shortcut-panel");
      if (eyebrow) eyebrow.textContent = previousEyebrow;
      if (heading) heading.textContent = previousHeading;
    };
  }, [isAreaManager, target]);

  function openReports() {
    const reportButton = Array.from(document.querySelectorAll<HTMLButtonElement>(".sidebar nav button")).find(
      (button) => button.getAttribute("title") === "রিপোর্ট" || button.textContent?.includes("রিপোর্ট"),
    );
    reportButton?.click();
    window.setTimeout(() => document.querySelector(".report-preview")?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
  }

  function openExpenseWorkspace() {
    window.dispatchEvent(new CustomEvent("open-area-expense-workspace"));
  }

  function openDailyExpenseEntry() {
    window.dispatchEvent(new CustomEvent("area-account-open", { detail: { focus: "expense" } }));
  }

  function openTodayDistributionReport() {
    const distributionButton = Array.from(document.querySelectorAll<HTMLButtonElement>(".sidebar nav button")).find(
      (button) => button.getAttribute("title") === "বিতরণ" || button.textContent?.includes("বিতরণ"),
    );
    distributionButton?.click();
    let attempts = 0;
    const openWhenReady = () => {
      const section = document.querySelector("#distribution-exceptions");
      if (!section && attempts++ < 20) {
        window.setTimeout(openWhenReady, 50);
        return;
      }
      window.dispatchEvent(new CustomEvent("open-distribution-report", {
        detail: { date: dhakaClock.date, areaCode: userAreaCode },
      }));
      section?.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    openWhenReady();
  }

  if (!target) return null;

  if (isAreaManager) {
    const timerText = reportingWindow.isAfterCutoff
      ? "আজকের রিপোর্টের সময় শেষ"
      : `দুপুর ২টার আগে রিপোর্ট করুন · আর বাকি ${countdown}`;
    return createPortal(
      <div className="report-widget-grid area-manager-action-grid" aria-label="এরিয়া ম্যানেজার দ্রুত কাজ">
        <button type="button" onClick={openTodayDistributionReport} disabled={!reportingWindow.canReport}>
          <span aria-hidden="true"><ClipboardCheck /></span>
          <span>
            <strong>আজকের বিতরণের রিপোর্ট করুন</strong>
            <small>{timerText}</small>
          </span>
          <b aria-hidden="true">›</b>
        </button>
        <button type="button" onClick={openDailyExpenseEntry}>
          <span aria-hidden="true"><ReceiptText /></span>
          <span>
            <strong>প্রতিদিনের খরচ এন্ট্রি</strong>
            <small>আজকের খরচ ও পেমেন্ট রিকোয়েস্ট জমা দিন</small>
          </span>
          <b aria-hidden="true">›</b>
        </button>
      </div>,
      target,
    );
  }

  return createPortal(
    <div className="report-widget-grid" aria-label="রিপোর্ট শর্টকাট">
      {reportWidgets.map(({ key, title, description, icon: Icon }) => (
        <button type="button" key={title} onClick={key === "expense" ? openExpenseWorkspace : openReports}>
          <span aria-hidden="true"><Icon /></span>
          <span><strong>{title}</strong><small>{description}</small></span>
          <b aria-hidden="true">›</b>
        </button>
      ))}
    </div>,
    target,
  );
}
