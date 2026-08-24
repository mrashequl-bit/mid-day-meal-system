import { NextResponse } from "next/server";
import { ensureDatabase } from "../../../db/bootstrap";
import {
  type AuthUser,
  requirePermission,
  requireSuperAdmin,
} from "../../lib/auth";

const itemCodes = new Set(["bun", "egg", "banana"]);
const transactionTypes = new Set([
  "opening",
  "stock_in",
  "stock_out",
  "damaged",
  "returned",
]);
const outgoingTypes = new Set(["stock_out", "damaged", "adjustment_sub"]);

type TransactionInput = {
  itemCode?: unknown;
  transactionType?: unknown;
  quantity?: unknown;
  transactionDate?: unknown;
  note?: unknown;
  supplierId?: unknown;
  unitPricePoisha?: unknown;
  paidAmountPoisha?: unknown;
  areaCode?: unknown;
  areaCodes?: unknown;
};

type StockReplayRow = {
  id: number;
  itemCode: string;
  transactionType: string;
  quantity: number;
  transactionDate: string;
};

type StoredStockTransaction = Record<string, unknown> & {
  item_code: string;
  transaction_type: string;
  quantity: number;
  transaction_date: string;
};

function validateTransaction(payload: TransactionInput) {
  const itemCode = String(payload.itemCode ?? "");
  const transactionType = String(payload.transactionType ?? "");
  const quantity = Number(payload.quantity);
  const transactionDate = String(payload.transactionDate ?? "");
  const note =
    typeof payload.note === "string" ? payload.note.trim().slice(0, 500) : "";
  const areaCodes = Array.isArray(payload.areaCodes)
    ? Array.from(new Set(payload.areaCodes.map((value) => String(value).trim()).filter(Boolean)))
    : typeof payload.areaCode === "string" && payload.areaCode.trim().length > 0
      ? (() => {
          const stored = payload.areaCode.trim();
          if (!stored.startsWith("[")) return [stored];
          try {
            const parsed = JSON.parse(stored);
            return Array.isArray(parsed) ? parsed.map((value) => String(value).trim()).filter(Boolean) : [];
          } catch {
            return [stored];
          }
        })()
      : [];
  const areaCode = areaCodes[0] ?? null;
  const areaCodesJson = areaCodes.length ? JSON.stringify(areaCodes) : null;
  const supplierId =
    payload.supplierId === null || payload.supplierId === undefined
      ? null
      : Number(payload.supplierId);
  const unitPricePoisha = Number(payload.unitPricePoisha ?? 0);
  const paidAmountPoisha = Number(payload.paidAmountPoisha ?? 0);

  if (!itemCodes.has(itemCode) || !transactionTypes.has(transactionType)) {
    return { error: "Invalid item or transaction type." } as const;
  }
  if (!Number.isInteger(quantity) || quantity <= 0) {
    return { error: "Quantity must be a positive integer." } as const;
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(transactionDate)) {
    return { error: "A valid transaction date is required." } as const;
  }
  if (transactionType === "stock_out" && areaCodes.length === 0) {
    return { error: "At least one area is required for a distribution." } as const;
  }

  if (transactionType !== "stock_in") {
    return {
      value: {
        itemCode,
        transactionType,
        quantity,
        transactionDate,
        note,
        supplierId: null,
        areaCode: transactionType === "stock_out" ? areaCode : null,
        areaCodesJson: transactionType === "stock_out" ? areaCodesJson : null,
        unitPricePoisha: 0,
        totalAmountPoisha: 0,
        paidAmountPoisha: 0,
        dueAmountPoisha: 0,
      },
    } as const;
  }

  if (!Number.isInteger(supplierId) || Number(supplierId) <= 0) {
    return { error: "A supplier is required for a purchase." } as const;
  }
  if (!Number.isInteger(unitPricePoisha) || unitPricePoisha < 0) {
    return { error: "Unit price must be a valid non-negative amount." } as const;
  }
  if (!Number.isInteger(paidAmountPoisha) || paidAmountPoisha < 0) {
    return { error: "Paid amount must be a valid non-negative amount." } as const;
  }
  const totalAmountPoisha = quantity * unitPricePoisha;
  let actualPaid = paidAmountPoisha;
  let overpaid = 0;
  if (paidAmountPoisha > totalAmountPoisha) {
    actualPaid = totalAmountPoisha;
    overpaid = paidAmountPoisha - totalAmountPoisha;
  }

  return {
    value: {
      itemCode,
      transactionType,
      quantity,
      transactionDate,
      note,
      supplierId: Number(supplierId),
      areaCode: null,
      areaCodesJson: null,
      unitPricePoisha,
      totalAmountPoisha,
      paidAmountPoisha: actualPaid,
      dueAmountPoisha: totalAmountPoisha - actualPaid,
      overpaidAmountPoisha: overpaid,
    },
  } as const;
}

function currentActor(user: AuthUser) {
  return user.username || user.name;
}

export async function GET() {
  if (!(await requirePermission("stock"))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const db = await ensureDatabase();
  const [balances, transactions, suppliers] = await Promise.all([
    db
      .prepare(
        `SELECT item_code AS itemCode, item_name_bn AS itemName,
         unit, current_quantity AS currentQuantity,
         minimum_level AS minimumLevel, updated_at AS updatedAt
         FROM stock_balances ORDER BY item_code`,
      )
      .all(),
    db
      .prepare(
        `SELECT st.id, st.item_code AS itemCode,
         st.transaction_type AS transactionType, st.quantity,
         st.previous_balance AS previousBalance, st.new_balance AS newBalance,
         st.transaction_date AS transactionDate, st.note, st.actor,
         st.supplier_id AS supplierId, s.name AS supplierName,
         COALESCE(st.area_codes_json, st.area_code) AS areaCode,
         st.unit_price_poisha AS unitPricePoisha,
         st.total_amount_poisha AS totalAmountPoisha,
         st.paid_amount_poisha AS paidAmountPoisha,
         st.due_amount_poisha AS dueAmountPoisha,
         st.created_at AS createdAt, st.updated_at AS updatedAt
         FROM stock_transactions st
         LEFT JOIN suppliers s ON s.id = st.supplier_id
         ORDER BY st.id DESC`,
      )
      .all(),
    db
      .prepare(
        `SELECT s.id, s.item_code AS itemCode, s.name,
         s.owner_name AS ownerName, s.mobile, s.address,
         s.default_unit_price_poisha AS defaultUnitPricePoisha,
         s.is_active AS isActive,
         (SELECT amount_poisha FROM supplier_ledgers WHERE supplier_id = s.id AND note = 'প্রারম্ভিক জের' LIMIT 1) AS openingBalancePoisha,
         (
           COALESCE((SELECT SUM(total_amount_poisha) FROM stock_transactions WHERE supplier_id = s.id AND transaction_type = 'stock_in'), 0)
           + COALESCE((SELECT SUM(amount_poisha) FROM supplier_ledgers WHERE supplier_id = s.id AND transaction_type = 'purchase'), 0)
         ) AS totalPurchasePoisha,
         
         (
           COALESCE((SELECT SUM(paid_amount_poisha) FROM stock_transactions WHERE supplier_id = s.id AND transaction_type = 'stock_in'), 0)
           + COALESCE((SELECT SUM(amount_poisha) FROM supplier_ledgers WHERE supplier_id = s.id AND transaction_type = 'payment'), 0)
         ) AS totalPaidPoisha,
         
         (
           COALESCE((SELECT SUM(due_amount_poisha) FROM stock_transactions WHERE supplier_id = s.id AND transaction_type = 'stock_in'), 0)
           + COALESCE((SELECT SUM(amount_poisha) FROM supplier_ledgers WHERE supplier_id = s.id AND transaction_type = 'purchase'), 0)
           - COALESCE((SELECT SUM(amount_poisha) FROM supplier_ledgers WHERE supplier_id = s.id AND transaction_type = 'payment'), 0)
           - COALESCE((SELECT SUM(amount_poisha) FROM supplier_ledgers WHERE supplier_id = s.id AND transaction_type = 'commission'), 0)
         ) AS totalDuePoisha
         FROM suppliers s
         ORDER BY s.item_code, s.name`,
      )
      .all(),
  ]);

  return NextResponse.json({
    balances: balances.results,
    transactions: transactions.results,
    suppliers: suppliers.results,
  });
}

export async function POST(request: Request) {
  const authUser = await requireSuperAdmin();
  if (!authUser) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const payload = (await request.json()) as TransactionInput & {
    kind?: unknown;
    id?: unknown;
    name?: unknown;
    ownerName?: unknown;
    mobile?: unknown;
    address?: unknown;
    defaultUnitPricePoisha?: unknown;
    openingBalancePoisha?: unknown;
  };
  const db = await ensureDatabase();

  if (payload.kind === "supplier") {
    const itemCode = String(payload.itemCode ?? "");
    const name = String(payload.name ?? "").trim().slice(0, 120);
    const ownerName = String(payload.ownerName ?? "").trim().slice(0, 120);
    const mobile = String(payload.mobile ?? "").trim().slice(0, 30);
    const address = String(payload.address ?? "").trim().slice(0, 300);
    const defaultUnitPricePoisha = Number(payload.defaultUnitPricePoisha ?? 0);
    if (!itemCodes.has(itemCode) || !name) {
      return NextResponse.json(
        { error: "পণ্য ও সরবরাহকারীর নাম আবশ্যক।" },
        { status: 422 },
      );
    }
    if (mobile && !/^01\d{9}$/.test(mobile)) {
      return NextResponse.json(
        { error: "মোবাইল নম্বরটি ১১ সংখ্যার হতে হবে।" },
        { status: 422 },
      );
    }
    if (
      !Number.isInteger(defaultUnitPricePoisha) ||
      defaultUnitPricePoisha < 0
    ) {
      return NextResponse.json(
        { error: "সঠিক ডিফল্ট ক্রয়রেট লিখুন।" },
        { status: 422 },
      );
    }
    try {
      if (payload.id) {
        await db
          .prepare(
            `UPDATE suppliers
             SET item_code = ?, name = ?, owner_name = ?, mobile = ?, address = ?, default_unit_price_poisha = ?
             WHERE id = ?`,
          )
          .bind(
            itemCode,
            name,
            ownerName || null,
            mobile || null,
            address || null,
            defaultUnitPricePoisha,
            payload.id,
          )
          .run();
          
        await db.prepare(`DELETE FROM supplier_ledgers WHERE supplier_id = ? AND note = 'প্রারম্ভিক জের'`).bind(payload.id).run();
        const openingBalancePoisha = Number(payload.openingBalancePoisha || 0);
        if (openingBalancePoisha > 0) {
          const d = new Date();
          const dateStr = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
          await db.prepare(
            `INSERT INTO supplier_ledgers (supplier_id, date, transaction_type, amount_poisha, balance_poisha, note)
             VALUES (?, ?, 'purchase', ?, 0, 'প্রারম্ভিক জের')`
          ).bind(payload.id, dateStr, openingBalancePoisha).run();
        }

        return NextResponse.json({ ok: true, id: payload.id });
      } else {
        const result = await db
          .prepare(
            `INSERT INTO suppliers
             (item_code, name, owner_name, mobile, address, default_unit_price_poisha)
             VALUES (?, ?, ?, ?, ?, ?)`,
          )
          .bind(
            itemCode,
            name,
            ownerName || null,
            mobile || null,
            address || null,
            defaultUnitPricePoisha,
          )
          .run();
          
        const supplierId = result.meta.last_row_id;
        const openingBalancePoisha = Number(payload.openingBalancePoisha || 0);
        if (openingBalancePoisha > 0) {
          const d = new Date();
          const dateStr = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
          await db.prepare(
            `INSERT INTO supplier_ledgers (supplier_id, date, transaction_type, amount_poisha, balance_poisha, note)
             VALUES (?, ?, 'purchase', ?, 0, 'প্রারম্ভিক জের')`
          ).bind(supplierId, dateStr, openingBalancePoisha).run();
        }
        
        return NextResponse.json({ ok: true, id: supplierId });
      }
    } catch {
      return NextResponse.json(
        { error: "এই পণ্যের জন্য একই নামের সরবরাহকারী আগে থেকেই আছে।" },
        { status: 409 },
      );
    }
  }

  const parsed = validateTransaction(payload);
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 422 });
  }
  const value = parsed.value;
  if (value.supplierId) {
    const supplier = await db
      .prepare(
        "SELECT id FROM suppliers WHERE id = ? AND item_code = ? AND is_active = 1",
      )
      .bind(value.supplierId, value.itemCode)
      .first();
    if (!supplier) {
      return NextResponse.json(
        { error: "নির্বাচিত সরবরাহকারী এই পণ্যের জন্য প্রযোজ্য নয়।" },
        { status: 422 },
      );
    }
  }

  const current = await db
    .prepare(
      "SELECT current_quantity AS currentQuantity FROM stock_balances WHERE item_code = ?",
    )
    .bind(value.itemCode)
    .first<{ currentQuantity: number }>();
  if (!current) {
    return NextResponse.json({ error: "Stock item not found." }, { status: 404 });
  }

  const delta = outgoingTypes.has(value.transactionType)
    ? -value.quantity
    : value.quantity;
  const nextBalance = current.currentQuantity + delta;
  if (nextBalance < 0) {
    return NextResponse.json(
      { error: "INSUFFICIENT_STOCK", currentQuantity: current.currentQuantity },
      { status: 409 },
    );
  }

  const actor = currentActor(authUser);
  const beforeJson = JSON.stringify({
    itemCode: value.itemCode,
    currentQuantity: current.currentQuantity,
  });
  const afterJson = JSON.stringify({
    ...value,
    currentQuantity: nextBalance,
  });

  const batchStmts = [
    db
      .prepare(
        `UPDATE stock_balances
         SET current_quantity = ?, updated_at = CURRENT_TIMESTAMP
         WHERE item_code = ? AND current_quantity = ?`,
      )
      .bind(nextBalance, value.itemCode, current.currentQuantity),
    db
      .prepare(
        `INSERT INTO stock_transactions
         (item_code, transaction_type, quantity, previous_balance, new_balance,
          transaction_date, note, supplier_id, area_code, area_codes_json, unit_price_poisha,
          total_amount_poisha, paid_amount_poisha, due_amount_poisha, actor)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        value.itemCode,
        value.transactionType,
        value.quantity,
        current.currentQuantity,
        nextBalance,
        value.transactionDate,
        value.note || null,
        value.supplierId,
        value.areaCode,
        value.areaCodesJson,
        value.unitPricePoisha,
        value.totalAmountPoisha,
        value.paidAmountPoisha,
        value.dueAmountPoisha,
        actor,
      ),
    db
      .prepare(
        `INSERT INTO audit_logs
         (actor, action, entity_type, entity_id, before_json, after_json)
         VALUES (?, 'STOCK_TRANSACTION', 'stock_item', ?, ?, ?)`,
      )
      .bind(actor, value.itemCode, beforeJson, afterJson),
  ];

  if (value.overpaidAmountPoisha && value.overpaidAmountPoisha > 0) {
    batchStmts.push(
      db.prepare(
        `INSERT INTO supplier_ledgers (supplier_id, date, transaction_type, amount_poisha, balance_poisha, note)
         VALUES (?, ?, 'payment', ?, 0, 'অগ্রিম প্রদান (ক্রয়ের সাথে)')`
      ).bind(value.supplierId, value.transactionDate, value.overpaidAmountPoisha)
    );
  }

  const results = await db.batch(batchStmts);

  return NextResponse.json({
    ok: true,
    id: results[1].meta.last_row_id,
    itemCode: value.itemCode,
    previousBalance: current.currentQuantity,
    currentQuantity: nextBalance,
  });
}

export async function PATCH(request: Request) {
  const authUser = await requireSuperAdmin();
  if (!authUser) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const payload = (await request.json()) as TransactionInput & { id?: unknown };
  const id = Number(payload.id);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: "Invalid transaction id." }, { status: 422 });
  }
  const parsed = validateTransaction(payload);
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 422 });
  }
  const value = parsed.value;
  const db = await ensureDatabase();
  const existing = await db
    .prepare(
      `SELECT id, item_code AS itemCode, transaction_type AS transactionType,
       quantity, transaction_date AS transactionDate, note, supplier_id AS supplierId,
       COALESCE(area_codes_json, area_code) AS areaCode,
       unit_price_poisha AS unitPricePoisha,
       total_amount_poisha AS totalAmountPoisha,
       paid_amount_poisha AS paidAmountPoisha,
       due_amount_poisha AS dueAmountPoisha
       FROM stock_transactions WHERE id = ?`,
    )
    .bind(id)
    .first<Record<string, unknown>>();
  if (!existing) {
    return NextResponse.json({ error: "Transaction not found." }, { status: 404 });
  }

  if (value.supplierId) {
    const supplier = await db
      .prepare(
        "SELECT id FROM suppliers WHERE id = ? AND item_code = ? AND is_active = 1",
      )
      .bind(value.supplierId, value.itemCode)
      .first();
    if (!supplier) {
      return NextResponse.json(
        { error: "নির্বাচিত সরবরাহকারী এই পণ্যের জন্য প্রযোজ্য নয়।" },
        { status: 422 },
      );
    }
  }

  const affectedItems = Array.from(
    new Set([String(existing.itemCode), value.itemCode]),
  );
  const placeholders = affectedItems.map(() => "?").join(", ");
  const allRows = await db
    .prepare(
      `SELECT id, item_code AS itemCode, transaction_type AS transactionType,
       quantity, transaction_date AS transactionDate
       FROM stock_transactions
       WHERE item_code IN (${placeholders})`,
    )
    .bind(...affectedItems)
    .all<StockReplayRow>();

  const recalculated: Array<{
    id: number;
    previousBalance: number;
    newBalance: number;
  }> = [];
  const finalBalances = new Map<string, number>();

  for (const itemCode of affectedItems) {
    const itemRows = allRows.results
      .filter(
        (row: StockReplayRow) => row.id !== id && row.itemCode === itemCode,
      )
      .concat(
        value.itemCode === itemCode
          ? [
              {
                id,
                itemCode: value.itemCode,
                transactionType: value.transactionType,
                quantity: value.quantity,
                transactionDate: value.transactionDate,
              },
            ]
          : [],
      )
      .sort(
        (left: StockReplayRow, right: StockReplayRow) =>
          left.transactionDate.localeCompare(right.transactionDate) ||
          left.id - right.id,
      );
    let balance = 0;
    for (const row of itemRows) {
      const previousBalance = balance;
      balance += outgoingTypes.has(row.transactionType)
        ? -row.quantity
        : row.quantity;
      if (balance < 0) {
        return NextResponse.json(
          {
            error: "INSUFFICIENT_STOCK",
            currentQuantity: previousBalance,
          },
          { status: 409 },
        );
      }
      recalculated.push({ id: row.id, previousBalance, newBalance: balance });
    }
    finalBalances.set(itemCode, balance);
  }

  const actor = currentActor(authUser);
  const statements = [
    db
      .prepare(
        `UPDATE stock_transactions
         SET item_code = ?, transaction_type = ?, quantity = ?,
         transaction_date = ?, note = ?, supplier_id = ?, area_code = ?, area_codes_json = ?,
         unit_price_poisha = ?, total_amount_poisha = ?,
         paid_amount_poisha = ?, due_amount_poisha = ?,
         updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
      )
      .bind(
        value.itemCode,
        value.transactionType,
        value.quantity,
        value.transactionDate,
        value.note || null,
        value.supplierId,
        value.areaCode,
        value.areaCodesJson,
        value.unitPricePoisha,
        value.totalAmountPoisha,
        value.paidAmountPoisha,
        value.dueAmountPoisha,
        id,
      ),
    ...recalculated.map((row) =>
      db
        .prepare(
          "UPDATE stock_transactions SET previous_balance = ?, new_balance = ? WHERE id = ?",
        )
        .bind(row.previousBalance, row.newBalance, row.id),
    ),
    ...Array.from(finalBalances.entries()).map(([itemCode, balance]) =>
      db
        .prepare(
          `UPDATE stock_balances
           SET current_quantity = ?, updated_at = CURRENT_TIMESTAMP
           WHERE item_code = ?`,
        )
        .bind(balance, itemCode),
    ),
    db
      .prepare(
        `INSERT INTO audit_logs
         (actor, action, entity_type, entity_id, before_json, after_json)
         VALUES (?, 'STOCK_TRANSACTION_UPDATED', 'stock_transaction', ?, ?, ?)`,
      )
      .bind(actor, String(id), JSON.stringify(existing), JSON.stringify(value)),
  ];
  await db.batch(statements);

  return NextResponse.json({ ok: true, id });
}


export async function DELETE(request: Request) {
  const authUser = await requireSuperAdmin();
  if (!authUser) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const url = new URL(request.url);
  const id = Number(url.searchParams.get("id"));
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: "Invalid transaction id." }, { status: 422 });
  }
  try {
    const db = await ensureDatabase();
    const existing = await db
      .prepare("SELECT * FROM stock_transactions WHERE id = ?")
      .bind(id)
      .first<StoredStockTransaction>();
    if (!existing) {
      return NextResponse.json({ error: "Transaction not found." }, { status: 404 });
    }

    const current = await db
      .prepare(
        "SELECT current_quantity AS currentQuantity FROM stock_balances WHERE item_code = ?",
      )
      .bind(existing.item_code)
      .first<{ currentQuantity: number }>();
    if (!current) {
      return NextResponse.json({ error: "Stock item not found." }, { status: 404 });
    }

    const deletedDelta = outgoingTypes.has(existing.transaction_type)
      ? -existing.quantity
      : existing.quantity;
    const reverseDelta = -deletedDelta;
    const nextCurrentBalance = current.currentQuantity + reverseDelta;

    const laterRows = await db
      .prepare(
        `SELECT id, previous_balance AS previousBalance, new_balance AS newBalance
         FROM stock_transactions
         WHERE item_code = ? AND id <> ?
         AND (transaction_date > ? OR (transaction_date = ? AND id > ?))
         ORDER BY transaction_date, id`,
      )
      .bind(
        existing.item_code,
        id,
        existing.transaction_date,
        existing.transaction_date,
        id,
      )
      .all<{ id: number; previousBalance: number; newBalance: number }>();

    const adjustedRows = laterRows.results.map((row) => ({
      id: row.id,
      previousBalance: row.previousBalance + reverseDelta,
      newBalance: row.newBalance + reverseDelta,
    }));
    if (
      nextCurrentBalance < 0 ||
      adjustedRows.some((row) => row.previousBalance < 0 || row.newBalance < 0)
    ) {
      return NextResponse.json(
        {
          error:
            "এই ক্রয়/স্টক লেনদেনটি মুছলে পরবর্তী মজুদ অপর্যাপ্ত হবে। আগে সংশ্লিষ্ট বিতরণ বা নষ্ট লেনদেন সমন্বয় করুন।",
        },
        { status: 409 },
      );
    }

    const actor = currentActor(authUser);
    await db.batch([
      db.prepare("DELETE FROM stock_transactions WHERE id = ?").bind(id),
      ...adjustedRows.map((row) =>
        db
          .prepare(
            "UPDATE stock_transactions SET previous_balance = ?, new_balance = ? WHERE id = ?",
          )
          .bind(row.previousBalance, row.newBalance, row.id),
      ),
      db
        .prepare(
          "UPDATE stock_balances SET current_quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE item_code = ?",
        )
        .bind(nextCurrentBalance, existing.item_code),
      db
        .prepare(
          `INSERT INTO audit_logs
           (actor, action, entity_type, entity_id, before_json, after_json)
           VALUES (?, 'DELETE_STOCK_TRANSACTION', 'stock_transaction', ?, ?, null)`,
        )
        .bind(actor, id, JSON.stringify(existing)),
    ]);

    return NextResponse.json({
      ok: true,
      itemCode: existing.item_code,
      currentQuantity: nextCurrentBalance,
    });
  } catch (error) {
    console.error("Stock transaction deletion failed", error);
    return NextResponse.json(
      { error: "লেনদেনটি মুছে ফেলা যায়নি। আবার চেষ্টা করুন।" },
      { status: 500 },
    );
  }
}
