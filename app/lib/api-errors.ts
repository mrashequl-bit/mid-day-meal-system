import { NextResponse } from "next/server";

export function internalApiError(context: string, error: unknown, message = "সার্ভার থেকে তথ্য পাওয়া যায়নি।") {
  console.error(JSON.stringify({
    event: "api_error",
    context,
    message: error instanceof Error ? error.message : String(error),
  }));
  return NextResponse.json({ error: message }, { status: 500 });
}
