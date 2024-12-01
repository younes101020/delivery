"use client";

import { Button } from "@/components/ui/button";
import { CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@/lib/auth";
import { ActionState } from "@/lib/auth/middleware";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import { signIn, signUp } from "../actions";

export function Login({ mode = "signup" }: { mode?: "signin" | "signup" }) {
  const session = useUser();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(false);
    if (session) router.replace("/?step=2");
  }, []);

  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    mode === "signin" ? signIn : signUp,
    { error: "" },
  );

  return isLoading ? (
    <div className="space-y-10">
      <div className="space-y-2">
        <Skeleton className="h-5 w-[10%]" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-5 w-[10%]" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  ) : (
    <form className="space-y-6" action={formAction}>
      <div>
        <Label htmlFor="email" className="block text-sm font-medium">
          Email
        </Label>
        <div className="mt-1">
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            maxLength={50}
            className="appearance-none relative block w-full px-3 py-2 border focus:z-10 sm:text-sm"
            placeholder="Enter your email"
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
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            required
            minLength={8}
            maxLength={100}
            className="appearance-none relative block w-full px-3 py-2 border focus:outline-none focus:z-10 sm:text-sm"
            placeholder="Enter your password"
          />
        </div>
      </div>

      {state?.error && <div className="text-destructive text-sm">{state.error}</div>}

      <CardFooter className="flex px-0 pt-8 justify-end">
        <Button type="submit" disabled={pending}>
          {pending ? (
            <>
              <Loader2 className="animate-spin mr-2 h-4 w-4" />
              Loading...
            </>
          ) : mode === "signin" ? (
            "Sign in"
          ) : (
            "Sign up"
          )}
        </Button>
      </CardFooter>
    </form>
  );
}
