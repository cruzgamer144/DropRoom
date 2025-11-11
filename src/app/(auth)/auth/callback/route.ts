import { NextResponse } from "next/server";

import { handleAuthCallback } from "@/lib/actions";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const result = await handleAuthCallback(url.searchParams);
  const destination = new URL(result.redirectTo, url.origin);

  return NextResponse.redirect(destination);
}
