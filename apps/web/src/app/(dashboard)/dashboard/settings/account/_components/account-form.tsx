"use client";

import { Loader2, UserPen } from "lucide-react";
import { useActionState } from "react";

import type { ActionState } from "@/app/_lib/form-middleware";

import { Button } from "@/app/_components/ui/button";
import { Input } from "@/app/_components/ui/input";
import { Label } from "@/app/_components/ui/label";
import { Paragraph } from "@/app/_components/ui/paragraph";
import { useUser } from "@/app/_lib/user-provider";

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
        <Paragraph variant="error">{state.error}</Paragraph>
      )}
      {state.success && (
        <Paragraph variant="success">{state.success}</Paragraph>
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
