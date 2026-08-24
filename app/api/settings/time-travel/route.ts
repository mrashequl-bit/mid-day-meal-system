import { env } from "cloudflare:workers";
import { NextResponse } from "next/server";
import { ensureDatabase } from "../../../../db/bootstrap";
import { requireSuperAdmin } from "../../../lib/auth";
import { writeAudit } from "../../../lib/admin-settings";

type TimeTravelEnv = Env & {
  CLOUDFLARE_ACCOUNT_ID?: string;
  CLOUDFLARE_D1_DATABASE_ID?: string;
  CLOUDFLARE_D1_API_TOKEN?: string;
};

type CloudflareResponse<T> = {
  success: boolean;
  result?: T;
  errors?: Array<{ message?: string }>;
};

function configuration() {
  const runtime = env as TimeTravelEnv;
  return {
    accountId: runtime.CLOUDFLARE_ACCOUNT_ID?.trim() || "",
    databaseId: runtime.CLOUDFLARE_D1_DATABASE_ID?.trim() || "",
    apiToken: runtime.CLOUDFLARE_D1_API_TOKEN?.trim() || "",
  };
}

function validTimestamp(value: string) {
  const parsed = new Date(value);
  if (!value || Number.isNaN(parsed.getTime()))
    throw new Error("সঠিক restore date ও time নির্বাচন করুন।");
  if (parsed.getTime() > Date.now())
    throw new Error("ভবিষ্যতের সময় নির্বাচন করা যাবে না।");
  return parsed.toISOString();
}

async function cloudflareRequest<T>(path: string, init?: RequestInit) {
  const { accountId, databaseId, apiToken } = configuration();
  if (!accountId || !databaseId || !apiToken) {
    throw new Error(
      "Cloudflare Time Travel API connection এখনও configured নয়।",
    );
  }
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${databaseId}/time_travel/${path}`,
    {
      ...init,
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
        ...init?.headers,
      },
    },
  );
  const result = (await response.json()) as CloudflareResponse<T>;
  if (!response.ok || !result.success || !result.result) {
    throw new Error(
      result.errors?.[0]?.message ||
        "Cloudflare Time Travel request সম্পন্ন হয়নি।",
    );
  }
  return result.result;
}

async function bookmarkAt(timestamp: string) {
  return cloudflareRequest<{ bookmark?: string }>(
    `bookmark?timestamp=${encodeURIComponent(timestamp)}`,
  );
}

export async function GET(request: Request) {
  const user = await requireSuperAdmin();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const configured = Object.values(configuration()).every(Boolean);
  const timestampValue = new URL(request.url).searchParams.get("timestamp");
  if (!timestampValue)
    return NextResponse.json({ configured, databaseName: "midday-meal-db" });
  if (!configured)
    return NextResponse.json(
      {
        error: "Cloudflare Time Travel API connection এখনও configured নয়।",
        configured: false,
      },
      { status: 503 },
    );
  try {
    const timestamp = validTimestamp(timestampValue);
    const result = await bookmarkAt(timestamp);
    if (!result.bookmark)
      throw new Error("নির্বাচিত সময়ের restore point পাওয়া যায়নি।");
    return NextResponse.json({
      configured: true,
      timestamp,
      bookmark: result.bookmark,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Restore point যাচাই করা যায়নি।",
      },
      { status: 400 },
    );
  }
}

export async function POST(request: Request) {
  const user = await requireSuperAdmin();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const body = (await request.json()) as {
      timestamp?: string;
      bookmark?: string;
      confirmation?: string;
    };
    if (body.confirmation !== "RESTORE")
      throw new Error("Restore নিশ্চিত করতে RESTORE লিখুন।");
    const timestamp = validTimestamp(String(body.timestamp || ""));
    const expectedBookmark = String(body.bookmark || "");
    const preview = await bookmarkAt(timestamp);
    if (!expectedBookmark || preview.bookmark !== expectedBookmark) {
      throw new Error("Restore point পরিবর্তিত হয়েছে। আবার যাচাই করুন।");
    }
    const restored = await cloudflareRequest<{
      bookmark?: string;
      previous_bookmark?: string;
      message?: string;
    }>(`restore?bookmark=${encodeURIComponent(expectedBookmark)}`, {
      method: "POST",
      body: "{}",
    });
    try {
      const db = await ensureDatabase();
      await db
        .prepare(
          "INSERT INTO backup_runs (frequency, status, details, completed_at) VALUES ('time-travel', 'completed', ?, CURRENT_TIMESTAMP)",
        )
        .bind(
          JSON.stringify({
            timestamp,
            bookmark: restored.bookmark,
            previousBookmark: restored.previous_bookmark,
          }),
        )
        .run();
      await writeAudit(
        user.username,
        "backup.time_travel_restored",
        "database",
        "DB",
        null,
        {
          timestamp,
          previousBookmark: restored.previous_bookmark,
        },
      );
    } catch (auditError) {
      console.error(
        "Time Travel restore completed but local audit write failed",
        {
          message:
            auditError instanceof Error
              ? auditError.message
              : String(auditError),
        },
      );
    }
    return NextResponse.json({
      success: true,
      timestamp,
      bookmark: restored.bookmark,
      previousBookmark: restored.previous_bookmark,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Time Travel restore সম্পন্ন হয়নি।",
      },
      { status: 400 },
    );
  }
}
