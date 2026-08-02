import { NextResponse } from "next/server";
import { ensureDatabase } from "../../../db/bootstrap";
import { getAuthUser } from "../../lib/auth";

export async function GET() {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ notifications: [] });
    }

    const db = await ensureDatabase();
    
    if (authUser.role === 'super_admin') {
      // Get unread expenses
      const expenses = await db.prepare(
        `SELECT e.id, e.area_code, e.expense_date, a.name_bn as area_name, e.amount_poisha as amount, e.vehicle_type, e.created_at 
         FROM area_expenses e 
         JOIN areas a ON e.area_code = a.code 
         WHERE e.is_read = 0 
         ORDER BY e.created_at DESC`
      ).all();

      const expenseNotifications = (expenses.results as any[]).map(e => ({
        id: e.id,
        type: 'expense',
        area_code: e.area_code,
        date: e.expense_date,
        title: `${e.area_name} থেকে নতুন খরচ যুক্ত হয়েছে`,
        message: `${e.vehicle_type} বাবদ ${e.amount / 100} টাকা খরচ যুক্ত করা হয়েছে।`,
        time: e.created_at
      }));

      // Get system notifications (like distribution adjustments)
      const sysNotifs = await db.prepare(
        `SELECT id, type, title, message, link, created_at 
         FROM notifications 
         WHERE is_read = 0 AND area_code IS NULL
         ORDER BY created_at DESC`
      ).all();

      const systemNotifications = (sysNotifs.results as any[]).map(n => ({
        id: n.id,
        type: n.type,
        title: n.title,
        message: n.message,
        link: n.link,
        time: n.created_at
      }));

      const notifications = [...expenseNotifications, ...systemNotifications].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

      return NextResponse.json({ notifications });
    } else if (authUser.areaCode) {
      // Get unread payments for area manager
      const payments = await db.prepare(
        `SELECT id, amount_poisha as amount, created_at 
         FROM area_payments 
         WHERE area_code = ? AND is_read = 0 
         ORDER BY created_at DESC`
      ).bind(authUser.areaCode).all();

      const notifications = (payments.results as any[]).map(p => ({
        id: p.id,
        type: 'payment',
        area_code: authUser.areaCode,
        title: `নতুন পরিশোধ গ্রহণ করা হয়েছে`,
        message: `${p.amount / 100} টাকা পরিশোধ করা হয়েছে।`,
        time: p.created_at
      }));

      // Get system notifications for area manager
      const sysNotifs = await db.prepare(
        `SELECT id, type, title, message, link, created_at 
         FROM notifications 
         WHERE is_read = 0 AND area_code = ?
         ORDER BY created_at DESC`
      ).bind(authUser.areaCode).all();

      const systemNotifications = (sysNotifs.results as any[]).map(n => ({
        id: n.id,
        type: n.type,
        title: n.title,
        message: n.message,
        link: n.link,
        time: n.created_at
      }));

      const allNotifications = [...notifications, ...systemNotifications].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

      return NextResponse.json({ notifications: allNotifications });
    }

    return NextResponse.json({ notifications: [] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, type } = (await request.json()) as { id: number, type: string };
    const db = await ensureDatabase();

    if (type === 'expense' && authUser.role === 'super_admin') {
      await db.prepare("UPDATE area_expenses SET is_read = 1 WHERE id = ?").bind(id).run();
    } else if (type === 'payment' && authUser.areaCode) {
      await db.prepare("UPDATE area_payments SET is_read = 1 WHERE id = ? AND area_code = ?").bind(id, authUser.areaCode).run();
    } else if (authUser.role === 'super_admin') {
      // Mark system notifications as read
      await db.prepare("UPDATE notifications SET is_read = 1 WHERE id = ? AND type = ?").bind(id, type).run();
    } else if (authUser.areaCode) {
      // Mark system notifications as read for area manager
      await db.prepare("UPDATE notifications SET is_read = 1 WHERE id = ? AND type = ? AND area_code = ?").bind(id, type, authUser.areaCode).run();
    } else {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
