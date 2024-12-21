"use server";

import { cookies } from "next/headers";

export async function signOut() {
  (await cookies()).delete("session");
}
