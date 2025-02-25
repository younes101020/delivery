"use client";

import { Loader2 } from "lucide-react";
import { useActionState } from "react";

import type { ActionState } from "@/app/_lib/form-middleware";

import { Button } from "@/app/_components/ui/button";
import { cn } from "@/app/_lib/utils";

import { injectEnv } from "../actions";

interface EnvButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  containerId: string;
}

export function EnvButton({
  children,
  className,
  containerId,
}: EnvButtonProps) {
  const initialInputs = {
    containerId,
  };

  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    injectEnv,
    {
      inputs: initialInputs,
    },
  );

  return (
    <form>
      <Button
        className={cn(className)}
        formAction={formAction}
        disabled={pending}
        type="submit"
        variant="outline"
      >
        {pending
          ? (
              <>
                <Loader2 className="animate-spin mr-2 h-4 w-4" />
                Loading...
              </>
            )
          : state.error
            ? "Error"
            : children}
      </Button>
    </form>
  );
}
