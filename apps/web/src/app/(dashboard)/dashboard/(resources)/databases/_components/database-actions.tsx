"use client";

import { useQuery } from "@tanstack/react-query";
import { Ban, Loader2, Play } from "lucide-react";
import { useActionState } from "react";

import type { ActionState } from "@/app/_lib/form-middleware";

import { Button } from "@/app/_components/ui/button";
import { getQueryClient } from "@/app/_lib/react-query-provider";
import { cn } from "@/app/_lib/utils";

import type { DatabaseStatusData } from "./types";

import { state } from "../../const";
import { startDatabaseService, stopDatabaseService } from "../actions";

interface DatabaseActionsProps {
  initialState: string;
  serviceId: string;
}

export function DatabaseActions({ initialState, serviceId }: DatabaseActionsProps) {
  const { data } = useQuery<DatabaseStatusData>({ queryKey: [serviceId] }, getQueryClient(true));

  if (data?.status === "completed" || !data || data.processName) {
    const isProcessingCompleted = data?.status === "completed";
    const canStopContainer = isProcessingCompleted ? state[data.queueName] === "running" : data?.processName ? state[data.processName] === "start" : initialState === "running";
    const canStartContainer = isProcessingCompleted ? state[data.queueName] === "stop" || state[data.queueName] === "created" : data?.processName ? state[data?.processName] === "stop" || state[data?.processName] === "created" : initialState === "stop" || initialState === "created";

    return (
      <>
        {canStopContainer && (
          <StopButton serviceId={serviceId} className="text-xs">
            <Ban className="stroke-destructive" />
            Shutdown
          </StopButton>
        )}
        {canStartContainer && (
          <StartButton serviceId={serviceId} className="text-xs">
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
  serviceId: string;
}

function StartButton({
  children,
  className,
  serviceId,
}: ButtonProps) {
  const initialInputs = {
    serviceId,
  };

  const [state, formAction, pending] = useActionState<ActionState<{ serviceId: string }>, FormData>(
    startDatabaseService,
    {
      inputs: initialInputs,
    },
  );

  return (
    <form>
      <input type="hidden" name="serviceId" value={serviceId} />
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
  serviceId,
}: ButtonProps) {
  const initialInputs = {
    serviceId,
  };

  const [state, formAction, pending] = useActionState<ActionState<{ serviceId: string }>, FormData>(
    stopDatabaseService,
    {
      inputs: initialInputs,
    },
  );

  return (
    <form>
      <input type="hidden" name="serviceId" value={serviceId} />
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
