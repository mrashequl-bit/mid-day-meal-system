"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Banknote, CalendarDays, ReceiptText, Edit2, Trash2, Check, X } from "lucide-react";
import { formatDateDMY } from "../lib/date-format";
import "./admin-expense-management-page.css";

type AreaSummary = {
  code: string;
  name: string;
  manager_name?: string | null;
  totalExpense?: number;
  totalPayment?: number;
  due?: number;
};

type ExpenseRow = {
  id: number;
  areaCode: string;
  areaName: string;
  expenseDate: string;
  vehicleType: string;
  amountPoisha: number;
  note?: string | null;
};

type LedgerRow = {
  id: number;
  date: string;
  type: string;
  amount: number;
  note?: string | null;
  category: "expense" | "payment";
};

type Props = {
  initialAreaCode?: string;
  initialExpenseId?: number;
  initialExpenseDate?: string;
};

const currency = new Intl.NumberFormat("bn-BD", { maximumFractionDigits: 0 });

function dateOnly(date: Date) {
  return date.toISOString().slice(0, 10);
}

function monthOnly(date: Date) {
  return dateOnly(date).slice(0, 7);
}

function taka(value = 0) {
  return `৳${currency.format(Math.round(value / 100))}`;
}

function periodLabel(period: string, month: string, date: string) {
  if (period === "month") {
    return `মাসিক রিপোর্ট: ${formatDateDMY(`${month}-01`)}`;
  }
  const selected = new Date(`${date}T12:00:00`);
  if (period === "day") {
    return `দিনভিত্তিক রিপোর্ট: ${formatDateDMY(selected)}`;
  }
  const start = new Date(selected);
  start.setDate(selected.getDate() - ((selected.getDay() + 6) % 7));
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return `সাপ্তাহিক রিপোর্ট: ${formatDateDMY(start)} - ${formatDateDMY(end)}`;
}

export function AdminExpenseManagementPage({ initialAreaCode, initialExpenseId, initialExpenseDate }: Props) {
  const [summary, setSummary] = useState<AreaSummary[]>([]);
  const [expenses, setExpenses] = useState<ExpenseRow[]>([]);
  const [ledger, setLedger] = useState<LedgerRow[]>([]);
  const [selectedArea, setSelectedArea] = useState("all");
  const [period, setPeriod] = useState("month");
  const [month, setMonth] = useState(monthOnly(new Date()));
  const [date, setDate] = useState(dateOnly(new Date()));
  const [paymentDate, setPaymentDate] = useState(dateOnly(new Date()));
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");
  const [isPrintingLedger, setIsPrintingLedger] = useState(false);
  const [isPrintingReport, setIsPrintingReport] = useState(false);
  const [printLedgers, setPrintLedgers] = useState<Map<string, { areaName: string; rows: LedgerRow[] }>>(new Map());

  useEffect(() => {
    if (isPrintingLedger) {
      document.body.classList.add("printing-ledger-only");
      setTimeout(() => {
        window.print();
        document.body.classList.remove("printing-ledger-only");
        setIsPrintingLedger(false);
      }, 50);
    }
  }, [isPrintingLedger]);

  useEffect(() => {
    if (isPrintingReport) {
      document.body.classList.add("printing-report-only");
      setTimeout(() => {
        window.print();
        document.body.classList.remove("printing-report-only");
        setIsPrintingReport(false);
      }, 50);
    }
  }, [isPrintingReport]);

  const [saving, setSaving] = useState(false);
  const [mutatingId, setMutatingId] = useState("");
  const [editingExpense, setEditingExpense] = useState<ExpenseRow | null>(null);
  const [expenseEditForm, setExpenseEditForm] = useState({
    expenseDate: "",
    vehicleType: "",
    amount: "",
    note: "",
  });
  const [editingPayment, setEditingPayment] = useState<LedgerRow | null>(null);
  const [paymentEditForm, setPaymentEditForm] = useState({
    date: "",
    amount: "",
    note: "",
  });

  useEffect(() => {
    setSelectedArea(initialAreaCode || "all");
    if (initialExpenseDate) {
      setPeriod("month");
      setMonth(initialExpenseDate.slice(0, 7));
      setDate(initialExpenseDate);
    }
  }, [initialAreaCode, initialExpenseDate]);

  useEffect(() => {
    if (!initialExpenseId) return;
    const target = document.querySelector<HTMLElement>(`[data-ledger-expense-id="${initialExpenseId}"]`);
    target?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [initialExpenseId, ledger]);

  const loadSummary = useCallback(async () => {
    const response = await fetch("/api/my-account?summary=true", { cache: "no-store" });
    const data = (await response.json()) as { summary?: AreaSummary[]; error?: string };
    if (!response.ok) throw new Error(data.error || "অঞ্চল লোড করা যায়নি");
    const rows = data.summary || [];
    setSummary(rows);
    setSelectedArea((current) => current || "all");
  }, []);

  const loadExpenses = useCallback(async () => {
    const params = new URLSearchParams({ period });
    if (period === "month") params.set("month", month);
    else params.set("date", date);
    const response = await fetch(`/api/expenses?${params.toString()}`, { cache: "no-store" });
    const data = (await response.json()) as { expenses?: ExpenseRow[]; error?: string };
    if (!response.ok) throw new Error(data.error || "খরচের রিপোর্ট লোড করা যায়নি।");
    setExpenses(data.expenses || []);
  }, [date, month, period]);

  const loadLedger = useCallback(async () => {
    if (!selectedArea || selectedArea === "all") {
      setLedger([]);
      return;
    }
    const params = new URLSearchParams({ area_code: selectedArea });
    if (period === "month") params.set("month", month);
    const response = await fetch(`/api/my-account?${params.toString()}`, { cache: "no-store" });
    const data = (await response.json()) as { ledger?: LedgerRow[]; error?: string };
    if (!response.ok) throw new Error(data.error || "লেজার লোড করা যায়নি");
    setLedger(data.ledger || []);
  }, [selectedArea, period, month]);

  useEffect(() => {
    loadSummary().catch((error) => setMessage(error instanceof Error ? error.message : "ডেটা লোড করা যায়নি।"));
  }, [loadSummary]);

  useEffect(() => {
    loadExpenses().catch((error) => setMessage(error instanceof Error ? error.message : "রিপোর্ট লোড করা যায়নি।"));
  }, [loadExpenses]);

  useEffect(() => {
    loadLedger().catch((error) => setMessage(error instanceof Error ? error.message : "লেজার লোড করা যায়নি।"));
  }, [loadLedger]);

  const expenseByArea = useMemo(() => {
    const totals = new Map<string, number>();
    expenses.forEach((expense) => {
      totals.set(expense.areaCode, (totals.get(expense.areaCode) || 0) + expense.amountPoisha);
    });
    return totals;
  }, [expenses]);

  const selectedSummary = selectedArea === "all" ? undefined : summary.find((area) => area.code === selectedArea);
  const periodTotal = expenses.reduce((total, expense) => total + expense.amountPoisha, 0);
  const dueTotal = summary.reduce((total, area) => total + (area.due || 0), 0);
  const paymentTotal = summary.reduce((total, area) => total + (area.totalPayment || 0), 0);
  const rowsToRender = summary.filter((area) =>
    selectedArea === "all"
      ? expenseByArea.has(area.code) || (area.due || 0) > 0
      : area.code === selectedArea,
  );

  const ledgerTotalPayment = useMemo(() => {
    return ledger.filter(r => r.category === "payment").reduce((sum, r) => sum + r.amount, 0);
  }, [ledger]);

  const ledgerTotalExpense = useMemo(() => {
    return ledger.filter(r => r.category === "expense").reduce((sum, r) => sum + r.amount, 0);
  }, [ledger]);

  async function submitPayment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedArea || selectedArea === "all") {
      setMessage("পেমেন্ট দিতে নির্দিষ্ট একটি অঞ্চল নির্বাচন করুন।");
      return;
    }
    const dueTaka = Math.floor((selectedSummary?.due || 0) / 100);
    if (Number(amount) > dueTaka) {
      setMessage(`আপনি বকেয়া পরিমাণের (${currency.format(dueTaka)} টাকা) চেয়ে বেশি পেমেন্ট করতে পারবেন না।`);
      return;
    }
    setSaving(true);
    setMessage("");
    try {
      const response = await fetch("/api/my-account", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          area_code: selectedArea,
          payment_date: paymentDate,
          amount,
          note,
        }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error || "পেমেন্ট সংরক্ষণ করা যায়নি।");
      setAmount("");
      setNote("");
      setMessage("পেমেন্ট সংরক্ষণ হয়েছে এবং Area Manager-এর হিসাবে যুক্ত হয়েছে।");
      await Promise.all([loadSummary(), loadLedger()]);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "পেমেন্ট সংরক্ষণ করা যায়নি।");
    } finally {
      setSaving(false);
    }
  }

  function startEditExpense(expense: ExpenseRow) {
    setEditingExpense(expense);
    setEditingPayment(null);
    setExpenseEditForm({
      expenseDate: expense.expenseDate,
      vehicleType: expense.vehicleType,
      amount: String(Math.round(expense.amountPoisha / 100)),
      note: expense.note || "",
    });
    setMessage("");
  }

  async function saveExpenseEdit(event?: React.FormEvent) {
    if (event) event.preventDefault();
    if (!editingExpense) return;
    const actionId = `expense-${editingExpense.id}`;
    setMutatingId(actionId);
    setMessage("");
    try {
      const response = await fetch("/api/expenses", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          id: editingExpense.id,
          areaCode: editingExpense.areaCode,
          expenseDate: expenseEditForm.expenseDate,
          vehicleType: expenseEditForm.vehicleType,
          amount: expenseEditForm.amount,
          note: expenseEditForm.note,
        }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error || "পেমেন্ট রিকোয়েস্ট আপডেট করা যায়নি।");
      setEditingExpense(null);
      setMessage("পেমেন্ট রিকোয়েস্ট আপডেট হয়েছে।");
      await Promise.all([loadSummary(), loadExpenses(), loadLedger()]);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "পেমেন্ট রিকোয়েস্ট আপডেট করা যায়নি।");
    } finally {
      setMutatingId("");
    }
  }

  async function deleteExpense(id: number) {
    if (!window.confirm("এই পেমেন্ট রিকোয়েস্টটি ডিলিট করতে চান?")) return;
    const actionId = `expense-${id}`;
    setMutatingId(actionId);
    setMessage("");
    try {
      const response = await fetch(`/api/expenses?id=${id}`, { method: "DELETE" });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error || "পেমেন্ট রিকোয়েস্ট ডিলিট করা যায়নি।");
      if (editingExpense?.id === id) setEditingExpense(null);
      setMessage("পেমেন্ট রিকোয়েস্ট ডিলিট হয়েছে।");
      await Promise.all([loadSummary(), loadExpenses(), loadLedger()]);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "পেমেন্ট রিকোয়েস্ট ডিলিট করা যায়নি।");
    } finally {
      setMutatingId("");
    }
  }

  function startEditPayment(row: LedgerRow) {
    setEditingPayment(row);
    setEditingExpense(null);
    setPaymentEditForm({
      date: row.date,
      amount: String(Math.round(row.amount / 100)),
      note: row.note || "",
    });
    setMessage("");
  }

  function startEditLedgerExpense(row: LedgerRow) {
    const expense = expenses.find((item) => item.id === row.id) || {
      id: row.id,
      areaCode: selectedArea,
      areaName: selectedSummary?.name || "",
      expenseDate: row.date,
      vehicleType: row.type,
      amountPoisha: row.amount,
      note: row.note,
    };
    startEditExpense(expense);
  }

  async function savePaymentEdit(event?: React.FormEvent) {
    if (event) event.preventDefault();
    if (!editingPayment) return;
    const actionId = `payment-${editingPayment.id}`;
    setMutatingId(actionId);
    setMessage("");
    try {
      const response = await fetch("/api/my-account", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          id: editingPayment.id,
          payment_date: paymentEditForm.date,
          amount: paymentEditForm.amount,
          note: paymentEditForm.note,
        }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error || "পেমেন্ট আপডেট করা যায়নি।");
      setEditingPayment(null);
      setMessage("পেমেন্ট আপডেট হয়েছে।");
      await Promise.all([loadSummary(), loadLedger()]);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "পেমেন্ট আপডেট করা যায়নি।");
    } finally {
      setMutatingId("");
    }
  }

  async function deletePayment(id: number) {
    if (!window.confirm("এই পেমেন্ট রেকর্ডটি ডিলিট করতে চান?")) return;
    const actionId = `payment-${id}`;
    setMutatingId(actionId);
    setMessage("");
    try {
      const response = await fetch(`/api/my-account?id=${id}`, { method: "DELETE" });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error || "পেমেন্ট ডিলিট করা যায়নি।");
      if (editingPayment?.id === id) setEditingPayment(null);
      setMessage("পেমেন্ট ডিলিট হয়েছে।");
      await Promise.all([loadSummary(), loadLedger()]);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "পেমেন্ট ডিলিট করা যায়নি।");
    } finally {
      setMutatingId("");
    }
  }

  return (
    <main className="admin-expense-page" aria-label="অঞ্চলভিত্তিক খরচ ও পেমেন্ট ম্যানেজমেন্ট">
      <section className="admin-expense-filters panel no-print">
        <label>
          রিপোর্ট ধরন
          <select value={period} onChange={(event) => setPeriod(event.target.value)}>
            <option value="day">দিনভিত্তিক</option>
            <option value="week">সাপ্তাহিক</option>
            <option value="month">মাসিক</option>
          </select>
        </label>
        {period === "month" ? (
          <label>
            মাস
            <input type="month" value={month} onChange={(event) => setMonth(event.target.value)} />
          </label>
        ) : (
          <label>
            তারিখ
            <input type="date" lang="en-GB" value={date} onChange={(event) => setDate(event.target.value)} />
          </label>
        )}
        <label>
          অঞ্চল
          <select value={selectedArea} onChange={(event) => setSelectedArea(event.target.value)}>
            <option value="all">সকল অঞ্চল</option>
            {summary.map((area) => (
              <option value={area.code} key={area.code}>{area.name}</option>
            ))}
          </select>
        </label>
        <button
          type="button"
          className="button-primary"
          style={{ alignSelf: "flex-end", whiteSpace: "nowrap" }}
          onClick={async () => {
            const areasToFetch = selectedArea === "all"
              ? rowsToRender
              : rowsToRender.filter(a => a.code === selectedArea);
            const ledgerMap = new Map<string, { areaName: string; rows: LedgerRow[] }>();
            await Promise.all(areasToFetch.map(async (area) => {
              try {
                const params = new URLSearchParams({ area_code: area.code });
                if (period === "month") params.set("month", month);
                const res = await fetch(`/api/my-account?${params.toString()}`, { cache: "no-store" });
                const data = (await res.json()) as { ledger?: LedgerRow[] };
                ledgerMap.set(area.code, { areaName: area.name, rows: data.ledger || [] });
              } catch {
                ledgerMap.set(area.code, { areaName: area.name, rows: [] });
              }
            }));
            setPrintLedgers(ledgerMap);
            setIsPrintingReport(true);
          }}
        >
          প্রিন্ট করুন
        </button>
        <strong>{periodLabel(period, month, date)}</strong>
      </section>

      <section className="admin-expense-print-report">
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <h2 style={{ margin: "0 0 6px", fontSize: "22px" }}>অঞ্চলভিত্তিক খরচের তালিকা</h2>
          <p style={{ margin: "0 0 4px", fontSize: "14px", color: "#4b5563" }}>{periodLabel(period, month, date)}</p>
          <p style={{ margin: "0", fontSize: "14px", color: "#4b5563" }}>
            {selectedArea === "all" ? "সকল অঞ্চল" : (selectedSummary?.name || "")}
          </p>
        </div>
        <table>
          <thead>
            <tr>
              <th style={{ textAlign: "left" }}>অঞ্চল</th>
              <th style={{ textAlign: "left" }}>এরিয়া ম্যানেজার</th>
              <th style={{ textAlign: "right" }}>নির্বাচিত সময়ের খরচ</th>
              <th style={{ textAlign: "right" }}>মোট পরিশোধ</th>
              <th style={{ textAlign: "right" }}>বর্তমান বকেয়া</th>
            </tr>
          </thead>
          <tbody>
            {rowsToRender.map((area) => (
              <tr key={`print-report-${area.code}`}>
                <td>{area.name}</td>
                <td>{area.manager_name || "পদ খালি"}</td>
                <td style={{ textAlign: "right" }}>{taka(expenseByArea.get(area.code) || 0)}</td>
                <td style={{ textAlign: "right" }}>{taka(area.totalPayment || 0)}</td>
                <td style={{ textAlign: "right" }}><strong>{taka(area.due || 0)}</strong></td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={2} style={{ textAlign: "right" }}><strong>মোট:</strong></td>
              <td style={{ textAlign: "right" }}><strong>{taka(periodTotal)}</strong></td>
              <td style={{ textAlign: "right" }}><strong>{taka(paymentTotal)}</strong></td>
              <td style={{ textAlign: "right" }}><strong>{taka(dueTotal)}</strong></td>
            </tr>
          </tfoot>
        </table>

        {Array.from(printLedgers.entries()).map(([code, { areaName: name, rows }]) => (
          rows.length > 0 && (
            <div key={`print-ledger-${code}`} style={{ marginTop: "30px", pageBreakInside: "avoid" }}>
              <h3 style={{ margin: "0 0 8px", fontSize: "16px", borderBottom: "2px solid #333", paddingBottom: "6px" }}>
                {name} - লেজার
              </h3>
              <table>
                <thead>
                  <tr>
                    <th style={{ textAlign: "left" }}>তারিখ</th>
                    <th style={{ textAlign: "left" }}>বিবরণ</th>
                    <th style={{ textAlign: "right" }}>প্রদান</th>
                    <th style={{ textAlign: "right" }}>খরচ</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.slice().reverse().map((row) => (
                    <tr key={`pl-${row.category}-${row.id}`}>
                      <td>{formatDateDMY(row.date)}</td>
                      <td>
                        {row.category === "payment" ? "পরিশোধ করা হয়েছে" : (row.type || "খরচ")}
                        {row.note && <><br/><small style={{ color: "#555" }}>{row.note}</small></>}
                      </td>
                      <td style={{ textAlign: "right" }}>{row.category === "payment" ? taka(row.amount) : ""}</td>
                      <td style={{ textAlign: "right" }}>{row.category === "expense" ? taka(row.amount) : ""}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={2} style={{ textAlign: "right" }}><strong>মোট:</strong></td>
                    <td style={{ textAlign: "right" }}><strong>{taka(rows.filter(r => r.category === "payment").reduce((s, r) => s + r.amount, 0))}</strong></td>
                    <td style={{ textAlign: "right" }}><strong>{taka(rows.filter(r => r.category === "expense").reduce((s, r) => s + r.amount, 0))}</strong></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )
        ))}
      </section>

      {message && <p className="admin-expense-message" role="status">{message}</p>}

      <section className="admin-expense-metrics">
        <article><CalendarDays aria-hidden="true" /><small>নির্বাচিত সময়ের খরচ</small><strong>{taka(periodTotal)}</strong></article>
        <article><Banknote aria-hidden="true" /><small>মোট পরিশোধ</small><strong>{taka(paymentTotal)}</strong></article>
        <article><ReceiptText aria-hidden="true" /><small>বর্তমান বকেয়া</small><strong>{taka(dueTotal)}</strong></article>
      </section>

      <section className="panel admin-expense-report" style={{ marginTop: "16px" }}>
        <div className="panel-head">
          <div>
            <h2>অঞ্চলভিত্তিক খরচের তালিকা</h2>
          </div>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>অঞ্চল</th>
                <th>এরিয়া ম্যানেজার</th>
                <th>নির্বাচিত সময়ের খরচ</th>
                <th>মোট পরিশোধ</th>
                <th>বর্তমান বকেয়া</th>
              </tr>
            </thead>
            <tbody>
              {rowsToRender.length ? rowsToRender.map((area) => (
                <tr key={area.code} className={area.code === selectedArea ? "admin-expense-selected-row" : ""}>
                  <td><strong>{area.name}</strong></td>
                  <td>{area.manager_name || "পদ খালি"}</td>
                  <td>{taka(expenseByArea.get(area.code) || 0)}</td>
                  <td>{taka(area.totalPayment || 0)}</td>
                  <td><strong>{taka(area.due || 0)}</strong></td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="admin-expense-empty">এই সময়ের জন্য কোনো খরচ বা বকেয়া পাওয়া যায়নি।</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {selectedArea !== "all" && (
        <section className="panel admin-ledger-panel">
          <div className="panel-head admin-ledger-panel-head">
            <div className="admin-ledger-panel-title">
              <span className="admin-ledger-panel-icon" aria-hidden="true">
                <Banknote />
              </span>
              <h2>{selectedSummary?.name} - লেজার ও পেমেন্ট</h2>
            </div>
            <form onSubmit={submitPayment} className="no-print admin-ledger-payment-form">
              <label>
                <span>তারিখ</span>
                <input
                  type="date"
                  lang="en-GB"
                  required
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  disabled={saving}
                />
              </label>
              <label>
                <span>পরিমাণ</span>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="টাকা"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  disabled={saving}
                />
              </label>
              <label>
                <span>মন্তব্য</span>
                <input
                  type="text"
                  placeholder="ঐচ্ছিক"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  disabled={saving}
                />
              </label>
              <button type="submit" className="button-primary" disabled={saving || !amount || !paymentDate}>
                {saving ? "হচ্ছে..." : "পেমেন্ট করুন"}
              </button>
            </form>
          </div>
          <div className="table-scroll admin-ledger-table-wrap">
            <table className="ledger-book-table">
              <thead>
                <tr>
                  <th>তারিখ</th>
                  <th>বিবরণ</th>
                  <th>প্রদান</th>
                  <th>খরচ</th>
                  <th style={{ width: "60px", textAlign: "center" }}>অ্যাকশন</th>
                </tr>
              </thead>
              <tbody>
                {ledger.slice().reverse().map((row) => {
                  const isEditingPayment = editingPayment?.id === row.id && row.category === "payment";
                  const isEditingExpense = editingExpense?.id === row.id && row.category === "expense";
                  const isMutating = mutatingId === `${row.category}-${row.id}`;

                  if (isEditingPayment) {
                    return (
                      <tr key={`${row.category}-${row.id}`}>
                        <td style={{ padding: "4px" }}>
                          <input
                            type="date"
                            lang="en-GB"
                            value={paymentEditForm.date}
                            onChange={(e) => setPaymentEditForm((f) => ({ ...f, date: e.target.value }))}
                            required
                            disabled={isMutating}
                            style={{ width: "100%", padding: "4px", fontSize: "12px" }}
                          />
                        </td>
                        <td style={{ padding: "4px" }}>
                          <input
                            type="text"
                            value={paymentEditForm.note}
                            onChange={(e) => setPaymentEditForm((f) => ({ ...f, note: e.target.value }))}
                            placeholder="মন্তব্য (ঐচ্ছিক)"
                            disabled={isMutating}
                            style={{ width: "100%", padding: "4px", fontSize: "12px" }}
                          />
                        </td>
                        <td style={{ padding: "4px" }}>
                          <input
                            type="number"
                            value={paymentEditForm.amount}
                            onChange={(e) => setPaymentEditForm((f) => ({ ...f, amount: e.target.value }))}
                            placeholder="টাকা"
                            min="1"
                            required
                            disabled={isMutating}
                            style={{ width: "100%", padding: "4px", fontSize: "12px" }}
                          />
                        </td>
                        <td style={{ padding: "4px", textAlign: "center" }}>-</td>
                        <td style={{ padding: "4px", textAlign: "center", whiteSpace: "nowrap" }}>
                          <button
                            type="button"
                            className="ledger-action-btn"
                            onClick={() => savePaymentEdit()}
                            disabled={isMutating || !paymentEditForm.date || !paymentEditForm.amount}
                            title="সেভ করুন"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            type="button"
                            className="ledger-action-btn danger"
                            onClick={() => setEditingPayment(null)}
                            disabled={isMutating}
                            title="বাতিল করুন"
                          >
                            <X size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  }

                  if (isEditingExpense) {
                    return (
                      <tr key={`${row.category}-${row.id}`}>
                        <td style={{ padding: "4px" }}>
                          <input
                            type="date"
                            lang="en-GB"
                            value={expenseEditForm.expenseDate}
                            onChange={(e) => setExpenseEditForm((f) => ({ ...f, expenseDate: e.target.value }))}
                            required
                            disabled={isMutating}
                            style={{ width: "100%", padding: "4px", fontSize: "12px" }}
                          />
                        </td>
                        <td style={{ padding: "4px", display: "flex", gap: "4px" }}>
                          <select
                            value={expenseEditForm.vehicleType}
                            onChange={(e) => setExpenseEditForm((f) => ({ ...f, vehicleType: e.target.value }))}
                            disabled={isMutating}
                            style={{ padding: "4px", fontSize: "12px", width: "100px" }}
                          >
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
                          <input
                            type="text"
                            value={expenseEditForm.note}
                            onChange={(e) => setExpenseEditForm((f) => ({ ...f, note: e.target.value }))}
                            placeholder="মন্তব্য"
                            disabled={isMutating}
                            style={{ width: "100%", padding: "4px", fontSize: "12px" }}
                          />
                        </td>
                        <td style={{ padding: "4px", textAlign: "center" }}>-</td>
                        <td style={{ padding: "4px" }}>
                          <input
                            type="number"
                            value={expenseEditForm.amount}
                            onChange={(e) => setExpenseEditForm((f) => ({ ...f, amount: e.target.value }))}
                            placeholder="টাকা"
                            min="1"
                            required
                            disabled={isMutating}
                            style={{ width: "100%", padding: "4px", fontSize: "12px" }}
                          />
                        </td>
                        <td style={{ padding: "4px", textAlign: "center", whiteSpace: "nowrap" }}>
                          <button
                            type="button"
                            className="ledger-action-btn"
                            onClick={() => saveExpenseEdit()}
                            disabled={isMutating || !expenseEditForm.expenseDate || !expenseEditForm.amount || !expenseEditForm.vehicleType}
                            title="সেভ করুন"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            type="button"
                            className="ledger-action-btn danger"
                            onClick={() => setEditingExpense(null)}
                            disabled={isMutating}
                            title="বাতিল করুন"
                          >
                            <X size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  }

                  return (
                    <tr
                      key={`${row.category}-${row.id}`}
                      data-ledger-expense-id={row.category === "expense" ? row.id : undefined}
                      className={row.category === "expense" && row.id === initialExpenseId ? "admin-ledger-notification-target" : undefined}
                    >
                      <td style={{ whiteSpace: "nowrap" }}>{formatDateDMY(row.date)}</td>
                      <td style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "200px" }}>
                        <strong>{row.type === "payment" ? "পরিশোধ করা হয়েছে" : row.type}</strong>
                        {row.note && <span style={{ color: "var(--muted)", marginLeft: "4px", fontWeight: "normal" }}>({row.note})</span>}
                      </td>
                      <td style={{ color: "var(--green)", fontWeight: 600, whiteSpace: "nowrap" }}>
                        {row.category === "payment" ? taka(row.amount) : "-"}
                      </td>
                      <td style={{ color: "#805200", fontWeight: 600, whiteSpace: "nowrap" }}>
                        {row.category === "expense" ? taka(row.amount) : "-"}
                      </td>
                      <td style={{ textAlign: "center", whiteSpace: "nowrap" }}>
                        <button
                          type="button"
                          className="ledger-action-btn"
                          onClick={() => row.category === "payment" ? startEditPayment(row) : startEditLedgerExpense(row)}
                          disabled={!!mutatingId}
                          title="এডিট করুন"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          type="button"
                          className="ledger-action-btn danger"
                          onClick={() => row.category === "payment" ? deletePayment(row.id) : deleteExpense(row.id)}
                          disabled={!!mutatingId}
                          title="ডিলিট করুন"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={2} style={{ textAlign: "right", fontWeight: "bold" }}>সর্বমোট:</td>
                  <td style={{ fontWeight: "bold", color: "var(--green)" }}>{taka(ledgerTotalPayment)}</td>
                  <td style={{ fontWeight: "bold", color: "var(--danger)" }}>{taka(ledgerTotalExpense)}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>
      )}
    </main>
  );
}

