"use client";

import { Loader2, UserPen } from "lucide-react";
import { useActionState } from "react";

import type { ActionState } from "@/lib/form-middleware";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUser } from "@/lib/auth";

import { updateAccount } from "../actions";

export function AccountForm() {
  const { user } = useUser();
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    updateAccount,
    { error: "", success: "", inputs: user ?? {} },
  );

  return (

    <form className="space-y-4" action={formAction}>
      <div>
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          placeholder="eg: John Doe"
          defaultValue={state.inputs.name || ""}
          required
        />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="Enter your email"
          defaultValue={state.inputs.email || ""}
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
                <UserPen />
                Save Changes
              </>

            )}
      </Button>
    </form>
  );
}
