"use client";

import { useQuery } from "@tanstack/react-query";
import { Ban, Loader2, Play } from "lucide-react";
import { useActionState } from "react";

import type { ActionState } from "@/app/_lib/form-middleware";

import { Button } from "@/app/_components/ui/button";
import { cn } from "@/app/_lib/utils";

import type { DatabaseStatusData } from "./types";

import { startContainer, stopContainer } from "../actions";

interface DatabaseActionsProps {
  state: string;
  id: string;
}

export function DatabaseActions({ id, state }: DatabaseActionsProps) {
  const { data } = useQuery<DatabaseStatusData>({ queryKey: [id] });
  const canStopContainer = state === "running";
  const canStartContainer = state === "exited" || state === "created";
  return (
    <>
      {canStopContainer && (
        <StopButton containerId={id} className="text-xs" disabled={!!data}>
          <Ban className="stroke-destructive" />
          Shutdown
        </StopButton>
      )}
      {canStartContainer && (
        <StartButton containerId={id} className="text-xs" disabled={!!data}>
          <Play className="stroke-primary" />
          Start
        </StartButton>
      )}
    </>
  );
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  containerId: string;
}

function StartButton({
  children,
  className,
  containerId,
}: ButtonProps) {
  const initialInputs = {
    containerId,
  };

  const [state, formAction, pending] = useActionState<ActionState<{ containerId: string }>, FormData>(
    startContainer,
    {
      inputs: initialInputs,
    },
  );

  return (
    <form>
      <input type="hidden" name="containerId" value={containerId} />
      <Button
        variant="outline"
        className={cn(className)}
        formAction={formAction}
        disabled={pending}
        type="submit"
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

function StopButton({
  children,
  className,
  containerId,
}: ButtonProps) {
  const initialInputs = {
    containerId,
  };

  const [state, formAction, pending] = useActionState<ActionState<{ containerId: string }>, FormData>(
    stopContainer,
    {
      inputs: initialInputs,
    },
  );

  return (
    <form>
      <input type="hidden" name="containerId" value={containerId} />
      <Button
        variant="outline"
        className={cn(className)}
        formAction={formAction}
        disabled={pending}
        type="submit"
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
