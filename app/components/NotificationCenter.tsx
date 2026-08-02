"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Banknote, Bell, CheckCircle2, ChevronRight, ClipboardCheck, ReceiptText } from "lucide-react";
import { formatDateTimeDMY } from "../lib/date-format";
import "./notification-center.css";

type Notification = {
  id: number;
  type: string;
  area_code?: string | null;
  link?: string | null;
  date?: string | null;
  title: string;
  message: string;
  time?: string | null;
};

const bengaliNumber = new Intl.NumberFormat("bn-BD", { useGrouping: false });
function formatNotificationTime(value?: string | null) {
  if (!value) return "";
  const normalized = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(value)
    ? `${value.replace(" ", "T")}Z`
    : value;
  const parsed = new Date(normalized);
  return Number.isNaN(parsed.getTime()) ? value : formatDateTimeDMY(parsed);
}

function isDistributionNotification(type: string) {
  return type.startsWith("distribution_issue");
}

function notificationActionLabel(notification: Notification) {
  if (notification.type === "expense") return "খরচ দেখুন";
  if (notification.type === "payment") return "হিসাব দেখুন";
  if (isDistributionNotification(notification.type)) return "রিপোর্ট দেখুন";
  return notification.link ? "বিস্তারিত দেখুন" : "পড়া হয়েছে";
}

function NotificationIcon({ type }: { type: string }) {
  if (type === "expense") return <ReceiptText />;
  if (type === "payment") return <Banknote />;
  if (type === "distribution_issue_resolved") return <CheckCircle2 />;
  return <ClipboardCheck />;
}

export function NotificationCenter() {
  const [target, setTarget] = useState<HTMLButtonElement | null>(null);
  const [mobileTarget, setMobileTarget] = useState<Element | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadNotifications = useCallback(async () => {
    try {
      const response = await fetch("/api/notifications", { cache: "no-store" });
      if (!response.ok) throw new Error("notifications unavailable");
      const data = (await response.json()) as { notifications?: Notification[] };
      setNotifications(data.notifications || []);
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const locate = () => {
      setTarget(document.querySelector<HTMLButtonElement>(".alert-button"));
      setMobileTarget(document.querySelector(".sidebar"));
    };
    locate();
    const observer = new MutationObserver(locate);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    loadNotifications();
    const timer = window.setInterval(loadNotifications, 30_000);
    return () => window.clearInterval(timer);
  }, [loadNotifications]);

  useEffect(() => {
    if (!target) return;
    const count = bengaliNumber.format(notifications.length);
    target.dataset.count = count;
    target.textContent = count;
    target.setAttribute("aria-label", notifications.length ? `${count}টি নতুন নোটিফিকেশন` : "নতুন নোটিফিকেশন নেই");
    target.setAttribute("aria-expanded", String(open));
    target.setAttribute("aria-haspopup", "dialog");
    const toggle = () => setOpen((current) => !current);
    target.addEventListener("click", toggle);
    return () => target.removeEventListener("click", toggle);
  }, [notifications.length, open, target]);

  function notificationTargetUrl(notification: Notification) {
    return notification.link || "";
  }

  function hasNotificationAction(notification: Notification) {
    return Boolean(
      notification.type === "expense" ||
      notification.type === "payment" ||
      isDistributionNotification(notification.type) ||
      notificationTargetUrl(notification),
    );
  }

  async function markRead(notification: Notification) {
    try {
      const response = await fetch("/api/notifications", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id: notification.id, type: notification.type }),
      });
      if (response.ok) {
        setNotifications((current) => current.filter((item) => item.id !== notification.id));
      }
      return response.ok;
    } catch {
      return false;
    }
  }

  function openDistributionReport(notification: Notification) {
    const targetUrl = new URL(notificationTargetUrl(notification) || "/", window.location.origin);
    const detail = {
      areaCode: targetUrl.searchParams.get("area") || "",
      date: targetUrl.searchParams.get("date") || "",
      status: targetUrl.searchParams.get("status") || "",
      schoolEmis: targetUrl.searchParams.get("school") || "",
    };
    const distributionButton = Array.from(document.querySelectorAll<HTMLButtonElement>(".sidebar nav button")).find(
      (button) => button.getAttribute("title") === "বিতরণ" || button.textContent?.includes("বিতরণ"),
    );
    distributionButton?.click();

    let attempts = 0;
    const dispatchWhenReady = () => {
      const section = document.getElementById("distribution-exceptions");
      if (section) {
        window.dispatchEvent(new CustomEvent("open-distribution-report", { detail }));
        window.requestAnimationFrame(() => section.scrollIntoView({ behavior: "smooth", block: "start" }));
        return;
      }
      attempts += 1;
      if (attempts < 30) window.setTimeout(dispatchWhenReady, 50);
    };
    window.setTimeout(dispatchWhenReady, 0);
  }

  async function openNotification(notification: Notification) {
    setOpen(false);
    if (notification.type === "expense" && notification.area_code) {
      window.dispatchEvent(new CustomEvent("open-area-expense-workspace", {
        detail: { areaCode: notification.area_code, expenseId: notification.id, expenseDate: notification.date || "" },
      }));
      void markRead(notification);
      return;
    }
    if (notification.type === "payment") {
      window.dispatchEvent(new CustomEvent("area-account-open"));
      void markRead(notification);
      return;
    }
    if (isDistributionNotification(notification.type)) {
      openDistributionReport(notification);
      void markRead(notification);
      return;
    }

    const targetUrl = notificationTargetUrl(notification);
    await markRead(notification);
    if (targetUrl) window.location.href = targetUrl;
  }

  const count = bengaliNumber.format(notifications.length);
  const notificationLabel = notifications.length ? `${count}টি নতুন নোটিফিকেশন` : "নতুন নোটিফিকেশন নেই";

  return <>
    {mobileTarget && createPortal(
      <button className="mobile-notification-launcher" type="button" aria-label={notificationLabel} aria-expanded={open} aria-haspopup="dialog" onClick={() => setOpen((current) => !current)}>
        <span aria-hidden="true"><Bell /></span><span className="mobile-notification-label">নোটিফিকেশন</span>{notifications.length > 0 && <b>{count}</b>}
      </button>, mobileTarget,
    )}
    {target && open && createPortal(
      <div className="notification-layer" role="presentation" onClick={() => setOpen(false)}>
        <section className="notification-panel" role="dialog" aria-modal="true" aria-label="নোটিফিকেশন" onClick={(event) => event.stopPropagation()}>
          <header><div><small>সাম্প্রতিক আপডেট</small><h2>নোটিফিকেশন</h2><p>{count}টি অপঠিত আপডেট</p></div><button type="button" aria-label="নোটিফিকেশন বন্ধ করুন" onClick={() => setOpen(false)}>×</button></header>
          <div className="notification-list">
            {loading ? <p className="notification-empty">লোড হচ্ছে…</p> : notifications.length ? notifications.map((notification) => (
              <article key={`${notification.type}-${notification.id}`}>
                <button className={`notification-card notification-${notification.type}`} type="button" onClick={() => openNotification(notification)}>
                  <span className="notification-type-icon" aria-hidden="true"><NotificationIcon type={notification.type} /></span>
                  <span className="notification-copy"><strong>{notification.title}</strong><span>{notification.message}</span>{notification.time && <small>{formatNotificationTime(notification.time)}</small>}</span>
                  <span className="notification-action">{hasNotificationAction(notification) ? notificationActionLabel(notification) : "পড়া হয়েছে"}<ChevronRight aria-hidden="true" /></span>
                </button>
              </article>
            )) : <p className="notification-empty">নতুন কোনো নোটিফিকেশন নেই।</p>}
          </div>
        </section>
      </div>, document.body,
    )}
  </>;
}
