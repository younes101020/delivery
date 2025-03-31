"use client";

import { useQuery } from "@tanstack/react-query";
import { Ban, Loader2, Play } from "lucide-react";
import { useActionState } from "react";

import type { ActionState } from "@/app/_lib/form-middleware";

import { Button } from "@/app/_components/ui/button";
import { cn } from "@/app/_lib/utils";

import type { ApplicationStatusData } from "./types";

import { state } from "../../const";
import { startApplication, stopApplication } from "../actions";

interface DatabaseActionsProps {
  initialState: string;
  applicationName: string;
}

export function ApplicationActions({ initialState, applicationName }: DatabaseActionsProps) {
  const { data } = useQuery<ApplicationStatusData>({ queryKey: [applicationName] });

  if (data?.status === "completed" || !data || data.processName) {
    const isProcessingCompleted = data?.status === "completed";
    const canStopContainer = isProcessingCompleted ? state[data.queueName] === "running" : data?.processName ? state[data.processName] === "start" : initialState === "running";
    const canStartContainer = isProcessingCompleted ? state[data.queueName] === "stop" : data?.processName ? state[data?.processName] === "stop" : initialState === "stop";

    return (
      <>
        {canStopContainer && (
          <StopButton applicationName={applicationName} className="text-xs">
            <Ban className="stroke-destructive" />
            Shutdown
          </StopButton>
        )}
        {canStartContainer && (
          <StartButton applicationName={applicationName} className="text-xs">
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
  applicationName: string;
}

function StartButton({
  children,
  className,
  applicationName,
}: ButtonProps) {
  const initialInputs = {
    applicationName,
  };

  const [state, formAction, pending] = useActionState<ActionState<{ applicationName: string }>, FormData>(
    startApplication,
    {
      inputs: initialInputs,
    },
  );

  return (
    <form>
      <input type="hidden" name="applicationName" value={applicationName} />
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
  applicationName,
}: ButtonProps) {
  const initialInputs = {
    applicationName,
  };

  const [state, formAction, pending] = useActionState<ActionState<{ applicationName: string }>, FormData>(
    stopApplication,
    {
      inputs: initialInputs,
    },
  );

  return (
    <form>
      <input type="hidden" name="applicationName" value={applicationName} />
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
