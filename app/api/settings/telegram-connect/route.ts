import { NextResponse } from "next/server";
import { requireSuperAdmin } from "../../../lib/auth";
import { getSecretSetting } from "../../../lib/admin-settings";

export async function POST() {
  const user = await requireSuperAdmin();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const token = await getSecretSetting("telegram_bot_token");
    if (!token) return NextResponse.json({ error: "আগে Telegram bot token সংরক্ষণ করুন।" }, { status: 400 });
    const response = await fetch(`https://api.telegram.org/bot${token}/getUpdates?limit=100&timeout=0`, { cache: "no-store" });
    const payload = await response.json() as {
      ok?: boolean;
      description?: string;
      result?: Array<{ message?: { chat?: { id?: number; type?: string; username?: string; first_name?: string; title?: string } } }>;
    };
    if (!response.ok || !payload.ok) throw new Error(payload.description || "Telegram bot যাচাই করা যায়নি।");
    const chats = (payload.result || []).map((update) => update.message?.chat).filter((chat) => chat?.id);
    const chat = [...chats].reverse().find((item) => item?.type === "private") || chats.at(-1);
    if (!chat?.id) {
      return NextResponse.json({ error: "Telegram-এ bot খুলে Start চাপুন, তারপর আবার চেষ্টা করুন।" }, { status: 404 });
    }
    return NextResponse.json({ chatId: String(chat.id), label: chat.title || chat.first_name || chat.username || String(chat.id) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Telegram সংযোগ যাচাই করা যায়নি।" }, { status: 500 });
  }
}
