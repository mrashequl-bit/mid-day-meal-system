import { NextResponse } from "next/server";
import { ensureDatabase } from "../../../db/bootstrap";
import { getAuthUser } from "../../lib/auth";
import { getDhakaClock } from "../../lib/distribution-reporting-window";
import { internalApiError } from "../../lib/api-errors";

export async function GET(request: Request) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = new URL(request.url).searchParams;
    const targetAreaCode =
      authUser.role === "super_admin"
        ? searchParams.get("area_code")
        : authUser.areaCode;
    const month = searchParams.get("month"); // Format: YYYY-MM
    const db = await ensureDatabase();

    if (authUser.role === 'super_admin' && !searchParams.has("area_code")) {
      const includeSummary = searchParams.get("summary") === "true";
      if (includeSummary) {
        const summary = await db.prepare(
          `WITH expense_totals AS (
             SELECT area_code, SUM(amount_poisha) AS total_expense
             FROM area_expenses
             GROUP BY area_code
           ), payment_totals AS (
             SELECT area_code, SUM(amount_poisha) AS total_payment
             FROM area_payments
             GROUP BY area_code
           )
           SELECT a.code, a.name_bn AS name, a.manager_name,
             COALESCE(e.total_expense, 0) AS totalExpense,
             COALESCE(p.total_payment, 0) AS totalPayment,
             COALESCE(e.total_expense, 0) - COALESCE(p.total_payment, 0) AS due
           FROM areas a
           LEFT JOIN expense_totals e ON e.area_code = a.code
           LEFT JOIN payment_totals p ON p.area_code = a.code
           WHERE a.is_active = 1`,
        ).all();
        return NextResponse.json({ summary: summary.results });
      }
    }

    if (!targetAreaCode) {
       return NextResponse.json({ error: "No area selected" }, { status: 400 });
    }
    
    const totals = await db.prepare(
      `SELECT
        COALESCE((SELECT SUM(amount_poisha) FROM area_expenses WHERE area_code = ?), 0) AS totalExpense,
        COALESCE((SELECT SUM(amount_poisha) FROM area_payments WHERE area_code = ?), 0) AS totalPayment`
    ).bind(targetAreaCode, targetAreaCode).first() as { totalExpense?: number; totalPayment?: number } | null;

    let ledgerResult;
    
    if (month) {
      ledgerResult = await db.prepare(
        `SELECT * FROM (
          SELECT id, expense_date as date, vehicle_type as type, amount_poisha as amount,
            note, 'expense' as category, created_at
          FROM area_expenses
          WHERE area_code = ? AND expense_date LIKE ?
          UNION ALL
          SELECT id, payment_date as date, 'payment' as type, amount_poisha as amount,
            note, 'payment' as category, created_at
          FROM area_payments
          WHERE area_code = ? AND payment_date LIKE ?
        )
        ORDER BY date DESC, created_at DESC`
      ).bind(targetAreaCode, `${month}%`, targetAreaCode, `${month}%`).all();
    } else {
      ledgerResult = await db.prepare(
        `SELECT * FROM (
          SELECT id, expense_date as date, vehicle_type as type, amount_poisha as amount,
            note, 'expense' as category, created_at
          FROM area_expenses
          WHERE area_code = ?
          UNION ALL
          SELECT id, payment_date as date, 'payment' as type, amount_poisha as amount,
            note, 'payment' as category, created_at
          FROM area_payments
          WHERE area_code = ?
        )
        ORDER BY date DESC, created_at DESC
        LIMIT 12`
      ).bind(targetAreaCode, targetAreaCode).all();
    }

    const ledger = (ledgerResult.results as any[]).reverse();
    const totalExpense = Number(totals?.totalExpense || 0);
    const totalPayment = Number(totals?.totalPayment || 0);

    const due = totalExpense - totalPayment; 

    return NextResponse.json({ ledger, totalExpense, totalPayment, due });
  } catch (error) {
    return internalApiError("my-account.get", error, "হিসাবের তথ্য পাওয়া যায়নি।");
  }
}

export async function POST(request: Request) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = (await request.json()) as any;
    const db = await ensureDatabase();
    const amount = Number.parseFloat(String(data.amount ?? ""));
    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: "Amount must be greater than zero." }, { status: 422 });
    }

    if (authUser.role === 'super_admin') {
      if (!data.area_code || !/^\d{4}-\d{2}-\d{2}$/.test(String(data.payment_date || ""))) {
        return NextResponse.json({ error: "Valid area and payment date are required." }, { status: 422 });
      }
      // Super admin adds payment
      await db.prepare(
        `INSERT INTO area_payments (area_code, payment_date, amount_poisha, note, is_read) VALUES (?, ?, ?, ?, 0)`
      ).bind(
        data.area_code,
        data.payment_date,
        Math.round(amount * 100),
        data.note || ''
      ).run();
    } else if (authUser.areaCode) {
      const expenseDate = getDhakaClock().date;
      // Area manager adds expense
      await db.prepare(
        `INSERT INTO area_expenses (area_code, expense_date, vehicle_type, amount_poisha, note, is_read) VALUES (?, ?, ?, ?, ?, 0)`
      ).bind(
        authUser.areaCode,
        expenseDate,
        data.vehicle_type,
        Math.round(amount * 100),
        data.note || ''
      ).run();
    } else {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return internalApiError("my-account.create", error, "হিসাব সংরক্ষণ করা যায়নি।");
  }
}

export async function PUT(request: Request) {
  try {
    const authUser = await getAuthUser();
    if (!authUser || authUser.role !== 'super_admin') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = (await request.json()) as any;
    const db = await ensureDatabase();
    const id = Number(data.id);
    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json({ error: "Invalid payment id." }, { status: 422 });
    }
    const amount = Number.parseFloat(String(data.amount ?? ""));
    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: "Amount must be greater than zero." }, { status: 422 });
    }
    const paymentDate = String(data.payment_date || "").trim();
    if (paymentDate && !/^\d{4}-\d{2}-\d{2}$/.test(paymentDate)) {
      return NextResponse.json({ error: "Valid payment date is required." }, { status: 422 });
    }

    await db.prepare(
      `UPDATE area_payments
       SET payment_date = COALESCE(?, payment_date), amount_poisha = ?, note = ?, is_read = 0
       WHERE id = ?`
    ).bind(
      paymentDate || null,
      Math.round(amount * 100),
      data.note || '',
      id
    ).run();

    return NextResponse.json({ success: true });
  } catch (error) {
    return internalApiError("my-account.update", error, "হিসাব আপডেট করা যায়নি।");
  }
}

export async function DELETE(request: Request) {
  try {
    const authUser = await getAuthUser();
    if (!authUser || authUser.role !== 'super_admin') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = Number(new URL(request.url).searchParams.get("id"));
    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json({ error: "Invalid payment id." }, { status: 422 });
    }

    const db = await ensureDatabase();
    await db.prepare("DELETE FROM area_payments WHERE id = ?").bind(id).run();

    return NextResponse.json({ success: true });
  } catch (error) {
    return internalApiError("my-account.delete", error, "হিসাব মুছে ফেলা যায়নি।");
  }
}
