import type { SessionData } from "@delivery/auth";
import type { SelectUserSchema } from "@delivery/jobs/types";
import type { NextRequest } from "next/server";

import { signToken, verifyToken } from "@delivery/auth";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

/*
  This function checks the session cookie in the request.
  If the session is valid, it refreshes the session cookie with a new expiration date.
*/
export async function checkSession(request: NextRequest) {
  const sessionCookie = request.cookies.get("session");

  const res = NextResponse.next();

  try {
    if (!sessionCookie)
      throw new Error("Session cookie not found");
    const parsed = await verifyToken(sessionCookie.value);
    const expiresInOneDay = new Date(Date.now() + 24 * 60 * 60 * 1000);

    res.cookies.set({
      name: "session",
      value: await signToken({
        ...parsed,
        expires: expiresInOneDay.toISOString(),
      }),
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      expires: expiresInOneDay,
    });
  }
  catch (error) {
    console.error("Error updating session:", error);
    res.cookies.delete("session");
    throw error;
  }
}

export async function getSession() {
  const session = (await cookies()).get("session")?.value;
  if (!session)
    return null;
  return await verifyToken(session);
}

export async function setSession(user: SelectUserSchema) {
  const expiresInOneDay = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const session: SessionData = {
    user: { id: user.id, role: user.role },
    expires: expiresInOneDay.toISOString(),
  };
  const encryptedSession = await signToken(session);
  (await cookies()).set("session", encryptedSession, {
    expires: expiresInOneDay,
    httpOnly: true,
    secure: true,
    sameSite: "lax",
  });
}
