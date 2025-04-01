"use client";

import { useQuery } from "@tanstack/react-query";
import { Ban, Loader2, Play } from "lucide-react";
import { useActionState } from "react";

import type { ActionState } from "@/app/_lib/form-middleware";

import { Button } from "@/app/_components/ui/button";
import { cn } from "@/app/_lib/utils";

import type { DatabaseStatusData } from "./types";

import { state } from "../../const";
import { startDatabaseService, stopDatabaseService } from "../actions";

interface DatabaseActionsProps {
  initialState: string;
  serviceName: string;
}

export function DatabaseActions({ initialState, serviceName }: DatabaseActionsProps) {
  const { data } = useQuery<DatabaseStatusData>({ queryKey: [serviceName] });

  if (data?.status === "completed" || !data || data.processName) {
    const isProcessingCompleted = data?.status === "completed";
    const canStopContainer = isProcessingCompleted ? state[data.queueName] === "running" : data?.processName ? state[data.processName] === "start" : initialState === "running";
    const canStartContainer = isProcessingCompleted ? state[data.queueName] === "stop" || state[data.queueName] === "created" : data?.processName ? state[data?.processName] === "stop" || state[data?.processName] === "created" : initialState === "stop" || initialState === "created";

    return (
      <>
        {canStopContainer && (
          <StopButton serviceName={serviceName} className="text-xs">
            <Ban className="stroke-destructive" />
            Shutdown
          </StopButton>
        )}
        {canStartContainer && (
          <StartButton serviceName={serviceName} className="text-xs">
            <Play className="stroke-primary" />
            Start
          </StartButton>
        )}
      </>
    );
  }
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  serviceName: string;
}

function StartButton({
  children,
  className,
  serviceName,
}: ButtonProps) {
  const initialInputs = {
    serviceName,
  };

  const [state, formAction, pending] = useActionState<ActionState<{ serviceName: string }>, FormData>(
    startDatabaseService,
    {
      inputs: initialInputs,
    },
  );

  return (
    <form>
      <input type="hidden" name="containerId" value={serviceName} />
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
  serviceName,
}: ButtonProps) {
  const initialInputs = {
    serviceName,
  };

  const [state, formAction, pending] = useActionState<ActionState<{ serviceName: string }>, FormData>(
    stopDatabaseService,
    {
      inputs: initialInputs,
    },
  );

  return (
    <form>
      <input type="hidden" name="containerId" value={serviceName} />
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
