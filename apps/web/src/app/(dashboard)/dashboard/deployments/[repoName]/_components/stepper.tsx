"use client";

import { ExternalLink as ExternalLinkIcon, Loader2, RotateCcw } from "lucide-react";
import { redirect } from "next/navigation";
import { useActionState, useEffect } from "react";

import type { ActionState } from "@/lib/form-middleware";
import type { Nullable } from "@/lib/utils";

import { retryDeploy } from "@/app/actions";
import { Button } from "@/components/ui/button";

import { type SSEMessage, useEventSource } from "../_hooks/use-event-source";
import BoxReveal from "./ui/box-reveal";
import { LogsTerminal } from "./ui/logsterminal";
import Ripple from "./ui/ripple";

interface StepperProps {
  baseUrl: string;
  repoName: string;
}

export type DeploymentData = Nullable<{
  step: keyof typeof DEPLOYMENTMETADATA;
  logs: string;
  isCriticalError?: boolean;
  jobId?: string;
}>;

export const DEPLOYMENTMETADATA = {
  clone: {
    phrase: "We clone your GitHub repo to your server",
    position: "1 / 3",
  },
  build: {
    phrase: "We deploy your application",
    position: "2 / 3",
  },
  configure: {
    phrase: "We configure your application",
    position: "3 / 3",
  },
};

const DEFAULT_STATE = { step: null, logs: null };

export function Stepper({ repoName, baseUrl }: StepperProps) {
  const onMessage = (prev: DeploymentData, data: SSEMessage<DeploymentData>) => {
    if (data.completed && data.appId) {
      redirect(`/dashboard/applications/${data.appId}`);
    }
    return {
      step: data.jobName,
      logs: prev.logs ? `${prev.logs}${data.logs}` : data.logs,
      isCriticalError: data.isCriticalError,
      jobId: data.jobId,
    };
  };
  const { step, logs, isCriticalError, jobId, reconnect } = useEventSource<DeploymentData>({
    type: `${repoName}-deployment-logs`,
    eventUrl: `${baseUrl}/api/deployments/logs/${repoName}`,
    initialState: DEFAULT_STATE,
    onMessage,
  });
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    retryDeploy,
    { error: "", success: "", inputs: { repoName, jobId } },
  );

  useEffect(() => {
    if (state.success)
      reconnect();
  }, [state, reconnect]);

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden gap-4">
      <BoxReveal duration={0.5}>
        <p className="text-xl font-semibold">
          {step && DEPLOYMENTMETADATA[step].phrase}
          <span className="text-primary">.</span>
        </p>
      </BoxReveal>
      <div className="flex gap-2">
        <p className="text-xs text-primary">{step && DEPLOYMENTMETADATA[step].position}</p>
        <LogsTerminalButton step={step} logs={logs} />
      </div>
      {isCriticalError && (
        <div className="flex flex-col gap-2 text-center items-center">
          <p className="text-destructive font-semibold">We were unable to deploy your application</p>
          <p className="text-xs text-destructive">Once you think you have resolved the issue, you can redeploy.</p>
          {state.error && <p className="text-xs text-destructive">{state.error}</p>}
          <form>
            <input type="hidden" name="repoName" defaultValue={state.inputs.repoName} />
            <input type="hidden" name="jobId" value={state.inputs.jobId ?? ""} />
            <Button
              variant="outline"
              className="w-fit"
              formAction={formAction}
            >
              {isPending
                ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Redeployment...
                    </>
                  )
                : (
                    <>
                      <RotateCcw />
                      Retry
                    </>
                  )}
            </Button>
          </form>

        </div>
      )}
      <Ripple />
    </div>
  );
}

function LogsTerminalButton({ step, logs }: DeploymentData) {
  if (step === "clone" || !logs)
    return null;

  return (
    <LogsTerminal logs={logs}>
      <ExternalLinkIcon className="text-primary cursor-pointer" size={15} />
    </LogsTerminal>
  );
}
