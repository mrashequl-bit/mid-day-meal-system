import { NextResponse } from "next/server";
import { ensureDatabase } from "../../../db/bootstrap";
import { getAuthUser } from "../../lib/auth";

type ExpensePayload = {
  id?: unknown;
  areaCode?: unknown;
  expenseDate?: unknown;
  expense_date?: unknown;
  vehicleType?: unknown;
  vehicle_type?: unknown;
  amountPoisha?: unknown;
  amount?: unknown;
  note?: unknown;
};

function monthRange(month: string | null) {
  const selectedMonth = /^\d{4}-\d{2}$/.test(month || "")
    ? String(month)
    : new Date().toISOString().slice(0, 7);
  return {
    selectedMonth,
    start: `${selectedMonth}-01`,
    end: `${selectedMonth}-31`,
  };
}

function dateOnly(date: Date) {
  return date.toISOString().slice(0, 10);
}

function normalizedDate(date: string | null) {
  return /^\d{4}-\d{2}-\d{2}$/.test(date || "")
    ? String(date)
    : dateOnly(new Date());
}

function weekRange(date: string | null) {
  const selectedDate = normalizedDate(date);
  const anchor = new Date(`${selectedDate}T00:00:00.000Z`);
  const day = anchor.getUTCDay() || 7;
  const startDate = new Date(anchor);
  startDate.setUTCDate(anchor.getUTCDate() - day + 1);
  const endDate = new Date(startDate);
  endDate.setUTCDate(startDate.getUTCDate() + 6);
  return {
    selectedDate,
    start: dateOnly(startDate),
    end: dateOnly(endDate),
  };
}

function expenseRange(searchParams: URLSearchParams) {
  const period = searchParams.get("period");
  if (period === "day") {
    const selectedDate = normalizedDate(searchParams.get("date"));
    return {
      period,
      selectedDate,
      start: selectedDate,
      end: selectedDate,
    };
  }
  if (period === "week") {
    return {
      period,
      ...weekRange(searchParams.get("date")),
    };
  }
  const month = monthRange(searchParams.get("month"));
  return {
    period: "month",
    selectedMonth: month.selectedMonth,
    start: month.start,
    end: month.end,
  };
}

function parseAmountPoisha(payload: ExpensePayload) {
  if (payload.amountPoisha !== undefined) {
    const amountPoisha = Number(payload.amountPoisha);
    return Number.isInteger(amountPoisha) ? amountPoisha : null;
  }
  const amount = Number(payload.amount);
  return Number.isFinite(amount) ? Math.round(amount * 100) : null;
}

function validateExpense(payload: ExpensePayload, fallbackAreaCode?: string) {
  const areaCode = String(payload.areaCode ?? fallbackAreaCode ?? "").trim();
  const expenseDate = String(payload.expenseDate ?? payload.expense_date ?? "").trim();
  const vehicleType = String(payload.vehicleType ?? payload.vehicle_type ?? "").trim();
  const note = String(payload.note ?? "").trim().slice(0, 500);
  const amountPoisha = parseAmountPoisha(payload);

  if (!areaCode) return { error: "Area is required." } as const;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(expenseDate)) {
    return { error: "Valid expense date is required." } as const;
  }
  if (!vehicleType) return { error: "Vehicle type is required." } as const;
  if (amountPoisha === null || !Number.isInteger(amountPoisha) || amountPoisha <= 0) {
    return { error: "Amount must be greater than zero." } as const;
  }
  const validAmountPoisha = amountPoisha;

  return {
    value: {
      areaCode,
      expenseDate,
      vehicleType,
      amountPoisha: validAmountPoisha,
      note,
    },
  } as const;
}

export async function GET(request: Request) {
  const authUser = await getAuthUser();
  if (!authUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const range = expenseRange(searchParams);
  const areaCode =
    authUser.role === "super_admin"
      ? searchParams.get("areaCode") || searchParams.get("area_code")
      : authUser.areaCode;

  const db = await ensureDatabase();
  const baseQuery = `
    SELECT e.id, e.area_code AS areaCode, a.name_bn AS areaName,
     e.expense_date AS expenseDate, e.vehicle_type AS vehicleType,
     e.amount_poisha AS amountPoisha, e.note, e.created_at AS createdAt
     FROM area_expenses e
     JOIN areas a ON a.code = e.area_code
     WHERE e.expense_date BETWEEN ? AND ?
  `;
  const result = areaCode
    ? await db
        .prepare(`${baseQuery} AND e.area_code = ? ORDER BY e.expense_date DESC, e.id DESC`)
        .bind(range.start, range.end, areaCode)
        .all()
    : await db
        .prepare(`${baseQuery} ORDER BY a.name_bn, e.expense_date DESC, e.id DESC`)
        .bind(range.start, range.end)
        .all();

  return NextResponse.json({
    ...range,
    expenses: result.results,
  });
}

export async function POST(request: Request) {
  const authUser = await getAuthUser();
  if (!authUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = (await request.json()) as ExpensePayload;
  const id = Number(payload.id);
  const parsed = validateExpense(
    payload,
    authUser.role === "super_admin"
      ? undefined
      : authUser.areaCode ?? undefined,
  );
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 422 });
  }
  const value = parsed.value;

  if (authUser.role !== "super_admin" && value.areaCode !== authUser.areaCode) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const db = await ensureDatabase();
  if (Number.isInteger(id) && id > 0) {
    if (authUser.role !== "super_admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    await db
      .prepare(
        `UPDATE area_expenses
         SET area_code = ?, expense_date = ?, vehicle_type = ?,
          amount_poisha = ?, note = ?, is_read = 0
         WHERE id = ?`,
      )
      .bind(
        value.areaCode,
        value.expenseDate,
        value.vehicleType,
        value.amountPoisha,
        value.note,
        id,
      )
      .run();
    return NextResponse.json({ success: true, id });
  }

  const result = await db
    .prepare(
      `INSERT INTO area_expenses
       (area_code, expense_date, vehicle_type, amount_poisha, note, is_read)
       VALUES (?, ?, ?, ?, ?, 0)`,
    )
    .bind(
      value.areaCode,
      value.expenseDate,
      value.vehicleType,
      value.amountPoisha,
      value.note,
    )
    .run();

  return NextResponse.json({
    success: true,
    id: result.meta.last_row_id,
  });
}

export async function DELETE(request: Request) {
  const authUser = await getAuthUser();
  if (!authUser || authUser.role !== "super_admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const id = Number(new URL(request.url).searchParams.get("id"));
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: "Invalid expense id." }, { status: 422 });
  }

  const db = await ensureDatabase();
  await db.prepare("DELETE FROM area_expenses WHERE id = ?").bind(id).run();
  return NextResponse.json({ success: true });
}
