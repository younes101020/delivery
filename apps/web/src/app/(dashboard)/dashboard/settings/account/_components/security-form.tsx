"use client";

import { Loader2, Shield } from "lucide-react";
import { useActionState } from "react";

import type { ActionState } from "@/app/_lib/form-middleware";

import { Button } from "@/app/_components/ui/button";
import { Input } from "@/app/_components/ui/input";
import { Label } from "@/app/_components/ui/label";

import { updateSecuritySettings } from "../actions";

export function SecurityForm() {
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    updateSecuritySettings,
    { error: "", success: "", inputs: {} },
  );

  return (

    <form className="space-y-4" action={formAction}>
      <div>
        <Label htmlFor="password">New password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
        />
      </div>
      <div>
        <Label htmlFor="repeat-password">Repeat new password</Label>
        <Input
          id="repeat-password"
          name="repeat-password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
      </div>
      {state.error && (
        <p className="text-red-500 text-sm">{state.error}</p>
      )}
      {state.success && (
        <p className="text-green-500 text-sm">{state.success}</p>
      )}
      <Button
        type="submit"
        className="bg-orange-500 hover:bg-orange-600 text-white"
        disabled={isPending}
      >
        {isPending
          ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            )
          : (
              <>
                <Shield />
                Change password
              </>
            )}
      </Button>
    </form>
  );
}
