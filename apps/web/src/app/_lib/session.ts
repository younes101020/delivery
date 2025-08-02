import type { SelectUserSchema } from "@delivery/jobs/types";
import type { NextRequest } from "next/server";

import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

// TODO: wait for nextjs middleware to be nodejs compatible (https://github.com/vercel/next.js/discussions/71727) to use `serverEnv.AUTH_SECRET`
// eslint-disable-next-line node/no-process-env
const key = new TextEncoder().encode(process.env.AUTH_SECRET);

interface SessionData {
  user: { id: number };
  expires: string;
}

export async function checkSession(request: NextRequest) {
  const sessionCookie = request.cookies.get("session");

  if (!sessionCookie)
    throw new Error("Session cookie not found");

  const res = NextResponse.next();

  try {
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

export async function signToken(payload: SessionData) {
  return await new SignJWT({ ...payload } as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1 day from now")
    .sign(key);
}

export async function verifyToken(input: string) {
  const { payload } = await jwtVerify(input, key, {
    algorithms: ["HS256"],
  });
  return payload as unknown as SessionData;
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
    user: { id: user.id },
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
