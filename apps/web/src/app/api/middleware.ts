import { type NextRequest, NextResponse } from "next/server";

import { checkSession } from "../_lib/session";

export async function apiMiddleware(request: NextRequest) {
  const res = NextResponse.next();
  try {
    await checkSession(request);
  }
  catch (error) {
    console.error("Error checking session in API middleware:", error);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return res;
}
