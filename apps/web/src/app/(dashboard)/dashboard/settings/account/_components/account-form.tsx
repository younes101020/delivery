"use client";

import { Loader2, UserPen } from "lucide-react";
import { Suspense, useActionState } from "react";

import type { ActionState } from "@/app/_lib/form-middleware";

import { Button } from "@/app/_components/ui/button";
import { Input } from "@/app/_components/ui/input";
import { Label } from "@/app/_components/ui/label";
import { Paragraph } from "@/app/_components/ui/paragraph";
import { Skeleton } from "@/app/_components/ui/skeleton";
import { useUser } from "@/app/_hooks/use-user";

import { updateAccount } from "../actions";

export function AccountForm() {
  return (
    <div>
      <h2 className="text-2xl py-2">Update account</h2>
      <Suspense fallback={<PendingForm />}>
        <Form />
      </Suspense>
    </div>
  );
}

function Form() {
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

function PendingForm() {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <Skeleton className="h-4 w-[5%]" />
        <Skeleton className="h-9" />
      </div>
      <div className="space-y-1">
        <Skeleton className="h-4 w-[5%]" />
        <Skeleton className="h-9" />
      </div>
      <Skeleton className="h-9 w-[10%]" />
    </div>
  );
}
