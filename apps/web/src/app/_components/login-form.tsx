"use client";

import { ArrowRight, Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useActionState } from "react";

import type { ActionState } from "@/app/_lib/form-middleware";

import { Button } from "@/app/_components/ui/button";
import { CardFooter } from "@/app/_components/ui/card";
import { Input } from "@/app/_components/ui/input";
import { Label } from "@/app/_components/ui/label";
import { signUp } from "@/app/actions";

import { signIn } from "../(login)/actions";
import { Paragraph } from "./ui/paragraph";

export function Login({ mode = "signup", redirectTo = "/dashboard/applications" }: { mode?: "signin" | "signup"; redirectTo?: string }) {
  const searchParams = useSearchParams();
  const inviteId = searchParams.get("inviteId");
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    mode === "signin" ? signIn : signUp,
    { error: "", inputs: {} },
  );

  return (
    <form className="space-y-6" action={formAction} aria-label="form">
      <div>
        <Label htmlFor="email" className="block text-sm font-medium">
          Email
        </Label>
        <div className="mt-1">
          <Input
            id="email"
            name="email"
            aria-label="email"
            type="email"
            autoComplete="email"
            required
            maxLength={50}
            className="appearance-none relative block w-full px-3 py-2 border focus:z-10 sm:text-sm"
            placeholder="Enter your email"
            defaultValue={state.inputs.email ?? ""}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="password" className="block text-sm font-medium">
          Password
        </Label>
        <div className="mt-1">
          <Input
            id="password"
            name="password"
            type="password"
            aria-label="password"
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            required
            minLength={8}
            className="appearance-none relative block w-full px-3 py-2 border focus:outline-none focus:z-10 sm:text-sm"
            placeholder="Enter your password"
            defaultValue={state.inputs.passwordHash ?? ""}
          />
        </div>
      </div>
      <input type="hidden" name="redirectTo" defaultValue={redirectTo} />
      <input type="hidden" name="inviteId" value={inviteId || ""} />

      {state?.error && <Paragraph variant="error">{state.error}</Paragraph>}

      <CardFooter className="flex px-0 pt-8">
        <Button type="submit" disabled={pending} aria-label="submit" className="w-full">
          {pending
            ? (
                <>
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                  Loading...
                </>
              )
            : mode === "signin"
              ? (
                  <>
                    Sign in
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>

                )
              : (
                  <>
                    Sign up
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
        </Button>
      </CardFooter>
    </form>
  );
}
