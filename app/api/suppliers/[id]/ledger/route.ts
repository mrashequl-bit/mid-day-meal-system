import { NextResponse } from "next/server";
import { ensureDatabase } from "../../../../../db/bootstrap";
import { requireSuperAdmin } from "../../../../lib/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireSuperAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const db = await ensureDatabase();
  const { id } = await params;
  const supplierId = Number(id);

  if (!Number.isInteger(supplierId) || supplierId <= 0) {
    return NextResponse.json({ error: "Invalid supplier ID" }, { status: 400 });
  }
  
  const query = `
    SELECT * FROM (
      SELECT 
        id,
        transaction_date AS date, 
        'purchase' AS type, 
        quantity,
        unit_price_poisha,
        total_amount_poisha AS amount, 
        note, 
        created_at 
      FROM stock_transactions 
      WHERE supplier_id = ? AND transaction_type = 'stock_in'
      
      UNION ALL
      
      SELECT 
        id,
        transaction_date AS date, 
        'payment' AS type, 
        0 AS quantity,
        0 AS unit_price_poisha,
        paid_amount_poisha AS amount, 
        'Initial payment for stock in' AS note, 
        created_at 
      FROM stock_transactions 
      WHERE supplier_id = ? AND transaction_type = 'stock_in' AND paid_amount_poisha > 0
      
      UNION ALL
      
      SELECT 
        id,
        date, 
        transaction_type AS type, 
        0 AS quantity,
        0 AS unit_price_poisha,
        amount_poisha AS amount, 
        note, 
        created_at 
      FROM supplier_ledgers 
      WHERE supplier_id = ?
    )
    ORDER BY date ASC, created_at ASC
  `;

  const results = await db.prepare(query).bind(supplierId, supplierId, supplierId).all();

  let runningBalance = 0;
  const ledger = results.results.map((row: any) => {
    if (row.type === 'purchase') {
      runningBalance += row.amount;
    } else {
      runningBalance -= row.amount;
    }
    return {
      id: row.id,
      date: row.date,
      type: row.type,
      quantity: row.quantity,
      unitPricePoisha: row.unit_price_poisha,
      amount: row.amount,
      balance: runningBalance,
      note: row.note,
      createdAt: row.created_at
    };
  });

  ledger.reverse();

  return NextResponse.json({ ledger });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireSuperAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const db = await ensureDatabase();
  const { id } = await params;
  const supplierId = Number(id);

  if (!Number.isInteger(supplierId) || supplierId <= 0) {
    return NextResponse.json({ error: "Invalid supplier ID" }, { status: 400 });
  }

  const payload = (await request.json()) as any;
  const date = String(payload.date || "").trim();
  const type = String(payload.type || "").trim();
  const amount = Number(payload.amount);
  const note = String(payload.note || "").trim();

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "Invalid date" }, { status: 400 });
  }
  if (type !== 'payment' && type !== 'commission') {
    return NextResponse.json({ error: "Invalid transaction type" }, { status: 400 });
  }
  if (!Number.isInteger(amount) || amount <= 0) {
    return NextResponse.json({ error: "Amount must be greater than zero" }, { status: 400 });
  }

  await db.prepare(`
    INSERT INTO supplier_ledgers (supplier_id, date, transaction_type, amount_poisha, balance_poisha, note)
    VALUES (?, ?, ?, ?, 0, ?)
  `).bind(supplierId, date, type, amount, note).run();

  return NextResponse.json({ success: true });
}
