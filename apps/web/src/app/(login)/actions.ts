"use server";

import { hasLocale } from "@delivery/i18n";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { client } from "@/app/_lib/client-http";
import { validatedAction } from "@/app/_lib/form-middleware";
import { setSession } from "@/app/_lib/session";

export async function signOut() {
  (await cookies()).delete("session");
}

const signInSchema = z.object({
  email: z.string().email().min(3).max(255),
  inviteId: z.string().optional(),
  locale: z.string().refine(hasLocale, { message: "Invalid locale" }),
  password: z.string().min(8).max(100),
  redirectTo: z.string()
    .refine((pathname) => {
      const isValidSuccessSignInPathnameRedirect = /^\/(?:en|fr)\/dashboard\/applications(?:\/|$)/.test(pathname)
        || /^\/(?:en|fr)\/onboarding(?:\/|$)/.test(pathname);
      if (isValidSuccessSignInPathnameRedirect) {
        return true;
      }
    }, {
      message: "Invalid redirect URL",
    }),
});

export const signIn = validatedAction(signInSchema, async (data) => {
  const { email, password, redirectTo, inviteId, locale } = data;

  const http = await client();
  const response = await http.auth.verify.$post({
    json: {
      email,
      password,
      invitationId: inviteId ? Number.parseInt(inviteId) : undefined,
    },
  });

  if (response.status !== 200) {
    return {
      error: locale === "fr"
        ? "E-mail ou mot de passe invalide. Veuillez réessayer."
        : "Invalid email or password. Please try again.",
      inputs: data,
    };
  }

  const user = await response.json();
  await setSession(user);
  redirect(redirectTo);
});
