"use client";

import type { AuthDictionary, Locale } from "@delivery/i18n";

import { ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
// import { useSearchParams } from "next/navigation";
import { Suspense, useActionState, useState } from "react";

import type { ActionState } from "@/app/_lib/form-middleware";

import { Button } from "@/app/_components/ui/button";
import { CardFooter } from "@/app/_components/ui/card";
import { Input } from "@/app/_components/ui/input";
import { Label } from "@/app/_components/ui/label";
import { signUp } from "@/app/actions";

import { signIn } from "../(login)/actions";
import { Paragraph } from "./ui/paragraph";
import { Separator } from "./ui/separator";

interface LoginFormProps {
  auth: AuthDictionary;
  isOnboarding?: boolean;
  locale: Locale;
  mode?: "signin" | "signup";
  redirectTo?: string;
}

function LoginForm({ auth, mode = "signup", redirectTo, isOnboarding, locale }: LoginFormProps) {
  const searchParams = useSearchParams();
  const inviteId = searchParams.get("inviteId");
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    mode === "signin" ? signIn : signUp,
    { error: "", inputs: {} },
  );
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);

  return (
    <form className="space-y-6" action={formAction} aria-label="form">
      <div>
        <Label htmlFor="email" className="block text-sm font-medium">
          {auth.emailLabel}
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
            placeholder={auth.emailPlaceholder}
            defaultValue={state.inputs.email ?? ""}
          />
        </div>
      </div>
      <Separator />
      <div>
        <Label htmlFor="password" className="block text-sm font-medium">
          {auth.passwordLabel}
        </Label>
        <div className="mt-1 relative z-0">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            aria-label="password"
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            required
            minLength={8}
            className="appearance-none relative block w-full px-3 py-2 border pr-10 focus:outline-hidden focus:z-0 sm:text-sm"
            placeholder={auth.passwordPlaceholder}
            defaultValue={state.inputs.password ?? ""}
          />
          <span
            tabIndex={0}
            onMouseDown={event => event.preventDefault()}
            onClick={() => setShowPassword(value => !value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ")
                setShowPassword(value => !value);
            }}
            className="absolute inset-y-0 right-0 z-10 flex items-center pr-3 text-muted-foreground hover:text-foreground"
            aria-label={showPassword ? auth.hidePassword : auth.showPassword}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </span>
        </div>
      </div>
      {mode === "signup" && (
        <div>
          <Label htmlFor="repeatPassword" className="block text-sm font-medium">
            {auth.repeatPasswordLabel}
          </Label>
          <div className="mt-1">
            <div className="mt-1 relative z-0">
              <Input
                id="repeatPassword"
                name="repeatPassword"
                type={showRepeatPassword ? "text" : "password"}
                aria-label="repeatPassword"
                autoComplete="new-password"
                required
                minLength={8}
                className="appearance-none relative block w-full px-3 py-2 border pr-10 focus:outline-hidden focus:z-0 sm:text-sm"
                placeholder={auth.repeatPasswordPlaceholder}
                defaultValue={state.inputs.repeatPassword ?? ""}
              />
              <span
                tabIndex={0}
                onMouseDown={event => event.preventDefault()}
                onClick={() => setShowRepeatPassword(value => !value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ")
                    setShowRepeatPassword(value => !value);
                }}
                className="absolute inset-y-0 right-0 z-10 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                aria-label={showRepeatPassword ? auth.hideRepeatPassword : auth.showRepeatPassword}
              >
                {showRepeatPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </span>
            </div>
          </div>
        </div>
      )}

      <input type="hidden" name="redirectTo" defaultValue={redirectTo ?? `/${locale}/dashboard/applications`} />
      <input type="hidden" name="inviteId" value={inviteId || ""} />
      <input type="hidden" name="locale" value={locale} />

      {state?.error && <Paragraph variant="error">{state.error}</Paragraph>}

      <div className="text-xs text-muted-foreground">
        {mode === "signin"
          ? (
              <>
                {auth.noAccount}
                {" "}
                <Link
                  href={{
                    pathname: `/${locale}/signup`,
                    query: { inviteId },
                  }}
                  className="underline underline-offset-4"
                >
                  {auth.registerHere}
                </Link>
              </>
            )
          : !isOnboarding && (
              <>
                {auth.alreadyAccount}
                {" "}
                <Link
                  href={{
                    pathname: `/${locale}`,
                    query: { inviteId },
                  }}
                  className="underline underline-offset-4"
                >
                  {auth.signInHere}
                </Link>
              </>
            )}

      </div>
      <CardFooter className="flex px-0">
        <Button type="submit" disabled={pending} aria-label="submit" className="w-full">
          {pending
            ? (
                <>
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                  {auth.loading}
                </>
              )
            : mode === "signin"
              ? (
                  <>
                    {auth.signIn}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>

                )
              : (
                  <>
                    {auth.signUp}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
        </Button>
      </CardFooter>
    </form>
  );
}

export function Login({ auth, locale, mode = "signup", redirectTo, isOnboarding = false }: LoginFormProps) {
  return (
    <Suspense>
      <LoginForm auth={auth} locale={locale} mode={mode} redirectTo={redirectTo} isOnboarding={isOnboarding} />
    </Suspense>
  );
}
