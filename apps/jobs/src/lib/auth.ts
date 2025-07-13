import { hashPassword } from "@delivery/utils";

export async function verifyPassword(password: string, hash: string) {
  const hashedPassword = await hashPassword(password);
  return hashedPassword === hash;
}
