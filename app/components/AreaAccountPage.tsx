"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { getDhakaClock } from "../lib/distribution-reporting-window";
import { formatDateDMY } from "../lib/date-format";
import { printDesktopLayout } from "../lib/desktop-print";
import "./area-account-page.css";

type LedgerRow = {
  id: number;
  date: string;
  type: string;
  amount: number;
  note?: string | null;
  category: "expense" | "payment";
  created_at?: string;
};

type AccountResponse = {
  ledger?: LedgerRow[];
  totalExpense?: number;
  totalPayment?: number;
  due?: number;
  error?: string;
};

type Props = {
  enabled: boolean;
  areaName?: string;
};

const currency = new Intl.NumberFormat("bn-BD", {
  maximumFractionDigits: 0,
});

function takaFromPoisha(value = 0) {
  return `৳${currency.format(Math.round(value / 100))}`;
}

export function AreaAccountPage({ enabled, areaName = "" }: Props) {
  const [pageTarget, setPageTarget] = useState<Element | null>(null);
  const [open, setOpen] = useState(false);
  const [ledger, setLedger] = useState<LedgerRow[]>([]);
  const [totalExpense, setTotalExpense] = useState(0);
  const [totalPayment, setTotalPayment] = useState(0);
  const [due, setDue] = useState(0);
  const [vehicleType, setVehicleType] = useState("অটো ভাড়া");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const loadingRef = useRef(false);
  const previousActiveNavRef = useRef<HTMLButtonElement | null>(null);
  const closingForNavigationRef = useRef(false);

  const loadAccount = useCallback(async () => {
    if (!enabled || loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    try {
      const response = await fetch("/api/my-account", { cache: "no-store" });
      const data = (await response.json()) as AccountResponse;
      if (!response.ok) throw new Error(data.error || "হিসাব লোড করা যায়নি।");
      setLedger(data.ledger || []);
      setTotalExpense(data.totalExpense || 0);
      setTotalPayment(data.totalPayment || 0);
      setDue(data.due || 0);
      setLoaded(true);
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;
    const locate = () => {
      const main = document.querySelector(".app-main");
      if (!main) return false;
      setPageTarget(main);
      return true;
    };
    if (locate()) return;
    const observer = new MutationObserver(() => {
      if (locate()) observer.disconnect();
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [enabled]);

  useEffect(() => {
    if (!enabled || !open || loaded) return;
    loadAccount().catch((error) =>
      setMessage(error instanceof Error ? error.message : "হিসাব লোড করা যায়নি।"),
    );
  }, [enabled, loadAccount, loaded, open]);

  useEffect(() => {
    if (!enabled || open || loaded) return;
    const timer = window.setTimeout(() => {
      loadAccount().catch(() => undefined);
    }, 2600);
    return () => window.clearTimeout(timer);
  }, [enabled, loadAccount, loaded, open]);

  useEffect(() => {
    if (!enabled || !open) return;
    closingForNavigationRef.current = false;
    document.querySelector(".app-main")?.classList.add("area-account-open");
    const activeNav = document.querySelector<HTMLButtonElement>(
      ".sidebar nav button.nav-active:not(.area-account-nav)",
    );
    const accountNav = document.querySelector<HTMLButtonElement>(
      '.sidebar nav button[title="হিসাব"]',
    );
    previousActiveNavRef.current = activeNav;
    activeNav?.classList.remove("nav-active");
    activeNav?.removeAttribute("aria-current");
    accountNav?.classList.add("area-account-nav", "area-account-nav-active");
    accountNav?.setAttribute("aria-current", "page");
    const closeWhenOtherNavOpens = (event: MouseEvent) => {
      const button = (event.target as Element | null)?.closest<HTMLButtonElement>(
        ".sidebar nav button",
      );
      if (!button || button.title === "হিসাব") return;
      closingForNavigationRef.current = true;
      setOpen(false);
    };
    document.addEventListener("click", closeWhenOtherNavOpens, true);
    return () => {
      document.querySelector(".app-main")?.classList.remove("area-account-open");
      document.removeEventListener("click", closeWhenOtherNavOpens, true);
      if (!closingForNavigationRef.current && previousActiveNavRef.current) {
        previousActiveNavRef.current.classList.add("nav-active");
        previousActiveNavRef.current.setAttribute("aria-current", "page");
      }
      accountNav?.classList.remove("area-account-nav", "area-account-nav-active");
      accountNav?.removeAttribute("aria-current");
      previousActiveNavRef.current = null;
      closingForNavigationRef.current = false;
    };
  }, [enabled, open]);

  const latestRows = useMemo(() => ledger.slice().reverse().slice(0, 8), [ledger]);

  const openAccountPage = useCallback((event?: Event) => {
    setOpen(true);
    if (!loaded) {
      loadAccount().catch((error) =>
        setMessage(error instanceof Error ? error.message : "হিসাব লোড করা যায়নি।"),
      );
    }
    if ((event as CustomEvent<{ focus?: string }> | undefined)?.detail?.focus === "expense") {
      let attempts = 0;
      const focusExpenseForm = () => {
        const form = document.querySelector<HTMLElement>(".area-expense-form");
        if (!form && attempts++ < 20) {
          window.setTimeout(focusExpenseForm, 50);
          return;
        }
        form?.scrollIntoView({ behavior: "smooth", block: "start" });
        form?.querySelector<HTMLInputElement>('input[name="expense-amount"], input[type="number"]')?.focus({ preventScroll: true });
      };
      window.setTimeout(focusExpenseForm, 0);
    }
  }, [loadAccount, loaded]);

  useEffect(() => {
    if (!enabled) return;
    window.addEventListener("area-account-open", openAccountPage);
    return () => window.removeEventListener("area-account-open", openAccountPage);
  }, [enabled, openAccountPage]);

  async function submitExpense(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const response = await fetch("/api/my-account", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          expense_date: getDhakaClock().date,
          vehicle_type: vehicleType,
          amount,
          note,
        }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error || "পেমেন্ট রিকোয়েস্ট পাঠানো যায়নি।");
      setAmount("");
      setNote("");
      setMessage("খরচ এন্ট্রি হয়েছে এবং সুপার অ্যাডমিনের কাছে পেমেন্ট রিকোয়েস্ট পাঠানো হয়েছে।");
      await loadAccount();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "পেমেন্ট রিকোয়েস্ট পাঠানো যায়নি।");
    } finally {
      setSaving(false);
    }
  }

  if (!enabled) return null;

  return (
    <>
      {open && pageTarget &&
        createPortal(
          <main className="area-account-page" aria-label="হিসাব">
            <header className="area-account-header">
              <div>
                <h1>হিসাব</h1>
                <span>{areaName || "আপনার অঞ্চল"} · প্রতিদিনের পরিবহণ ব্যয় ও পেমেন্ট রিকোয়েস্ট</span>
              </div>
            </header>

            <section className="area-account-metrics">
              <article className={loading && !loaded ? "area-account-loading" : ""}><small>মোট খরচ</small><strong>{takaFromPoisha(totalExpense)}</strong></article>
              <article className={loading && !loaded ? "area-account-loading" : ""}><small>মোট পরিশোধ</small><strong>{takaFromPoisha(totalPayment)}</strong></article>
              <article className={loading && !loaded ? "area-account-loading" : ""}><small>বর্তমান বকেয়া</small><strong>{takaFromPoisha(due)}</strong></article>
            </section>

            <section className="area-account-grid">
              <form className="area-expense-form panel" onSubmit={submitExpense}>
                <div className="panel-head">
                  <div>
                    <h2>প্রতিদিনের খরচ এন্ট্রি</h2>
                  </div>
                </div>
                {message && <p className="area-account-message">{message}</p>}
                <label>
                  খরচের পরিমাণ
                  <input
                    required
                    inputMode="decimal"
                    min="1"
                    type="number"
                    value={amount}
                    onChange={(event) => setAmount(event.target.value)}
                    placeholder="টাকায় লিখুন"
                  />
                </label>
                <label>
                  কিসের খরচ?
                  <select value={vehicleType} onChange={(event) => setVehicleType(event.target.value)}>
                    <option value="অটো ভাড়া">অটো ভাড়া</option>
                    <option value="ভ্যান ভাড়া">ভ্যান ভাড়া</option>
                    <option value="মোটরসাইকেল ভাড়া">মোটরসাইকেল ভাড়া</option>
                    <option value="নৌকা ভাড়া">নৌকা ভাড়া</option>
                    <option value="পরিবহণ লেবার">পরিবহণ লেবার</option>
                    <option value="বেতন">বেতন</option>
                    <option value="বিলিং খরচ">বিলিং খরচ</option>
                    <option value="হাওলাত">হাওলাত</option>
                    <option value="অন্যান্য">অন্যান্য</option>
                  </select>
                </label>
                <label className="area-account-wide">
                  মন্তব্য
                  <textarea rows={3} value={note} onChange={(event) => setNote(event.target.value)} placeholder="যেমন: ১২টি স্কুলে সরবরাহ" />
                </label>
                <button className="button-primary" type="submit" disabled={saving}>
                  {saving ? "রিকোয়েস্ট পাঠানো হচ্ছে..." : "পেমেন্ট রিকোয়েস্ট পাঠান"}
                </button>
              </form>

              <section className="area-account-ledger panel">
                <div className="panel-head print-hide">
                  <div>
                    <h2>সাম্প্রতিক হিসাব</h2>
                  </div>
                  <button className="button-secondary print-hide" type="button" onClick={() => printDesktopLayout()}>
                    প্রিন্ট করুন
                  </button>
                </div>

                <div className="area-print-header area-ledger-print-only" style={{ textAlign: "center" }}>
                  <h2 style={{ margin: "0 0 10px 0", fontSize: "24px" }}>{areaName || "অঞ্চল"} - সাম্প্রতিক হিসাব</h2>
                  <div style={{ display: "flex", justifyContent: "center", gap: "40px", marginBottom: "20px", borderBottom: "2px solid #000", paddingBottom: "10px" }}>
                    <span><strong>মোট খরচ:</strong> {takaFromPoisha(totalExpense)}</span>
                    <span><strong>মোট পরিশোধ:</strong> {takaFromPoisha(totalPayment)}</span>
                    <span><strong>বর্তমান বকেয়া:</strong> {takaFromPoisha(due)}</span>
                  </div>
                </div>
                <div className="area-ledger-list">
                  {loading && !loaded ? (
                    <div className="area-ledger-skeleton" aria-label="হিসাব লোড হচ্ছে">
                      <span />
                      <span />
                      <span />
                    </div>
                  ) : latestRows.length ? latestRows.map((row) => (
                    <article key={`${row.category}-${row.id}`}>
                      <span className={row.category === "payment" ? "ledger-paid" : "ledger-request"}>
                        {row.category === "payment" ? "জমা" : "খরচ"}
                      </span>
                      <div>
                        <strong>{row.type === "payment" ? "পরিশোধ করা হয়েছে" : row.type.replace(/^(অটো|ভ্যান|মোটরসাইকেল|নৌকা)$/, "$1 ভাড়া")}</strong>
                        <small>{formatDateDMY(row.date)}{row.note ? ` · ${row.note}` : ""}</small>
                      </div>
                      <b>{takaFromPoisha(row.amount)}</b>
                    </article>
                  )) : <p className="area-ledger-empty">এখনও কোনো হিসাব এন্ট্রি করা হয়নি।</p>}
                </div>

                {latestRows.length > 0 && (
                  <table className="area-ledger-print-table area-ledger-print-only">
                    <thead>
                      <tr>
                        <th style={{ textAlign: "left" }}>তারিখ</th>
                        <th style={{ textAlign: "left" }}>ধরণ</th>
                        <th style={{ textAlign: "left" }}>বিবরণ ও মন্তব্য</th>
                        <th style={{ textAlign: "right" }}>পরিমাণ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {latestRows.map(row => (
                        <tr key={`print-${row.category}-${row.id}`}>
                          <td>{formatDateDMY(row.date)}</td>
                          <td>{row.category === "payment" ? "জমা" : "খরচ"}</td>
                          <td>
                            {row.type === "payment" ? "পরিশোধ করা হয়েছে" : row.type.replace(/^(অটো|ভ্যান|মোটরসাইকেল|নৌকা)$/, "$1 ভাড়া")}
                            {row.note && <><br/><small style={{ color: "#555" }}>{row.note}</small></>}
                          </td>
                          <td style={{ textAlign: "right" }}>{takaFromPoisha(row.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </section>
            </section>
          </main>,
          pageTarget,
        )}
    </>
  );
}
