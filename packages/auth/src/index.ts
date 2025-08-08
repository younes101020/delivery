import { jwtVerify, SignJWT } from "jose";

export interface SessionData {
  user: { id: number, role: string };
  expires: string;
}

// eslint-disable-next-line node/no-process-env
const key = new TextEncoder().encode(process.env.AUTH_SECRET);

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
