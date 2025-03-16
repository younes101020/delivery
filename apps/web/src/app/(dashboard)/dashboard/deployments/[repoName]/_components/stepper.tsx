"use client";

import { ExternalLink as ExternalLinkIcon, Loader2, RotateCcw } from "lucide-react";
import { redirect } from "next/navigation";
import { useActionState } from "react";

import type { ActionState } from "@/app/_lib/form-middleware";
import type { Nullable } from "@/app/_lib/utils";

import { Button } from "@/app/_components/ui/button";
import { Paragraph } from "@/app/_components/ui/paragraph";
import { useEventSource } from "@/app/_hooks/use-event-source";
import { retryDeploy } from "@/app/actions";
import { env } from "@/env";

import { LogsTerminal } from "../../_components/deployment-logs";
import BoxReveal from "./ui/box-reveal";
import Ripple from "./ui/ripple";

interface StepperProps {
  repoName: string;
}

export type DeploymentData = Nullable<{
  jobName: keyof typeof DEPLOYMENTMETADATA;
  logs?: string;
  isCriticalError?: boolean;
  jobId?: string;
  appId?: string;
  completed?: boolean;
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

const DEFAULT_STATE = { jobName: null, logs: null };

export function Stepper({ repoName }: StepperProps) {
  const onMessage = (prev: DeploymentData, data: DeploymentData) => {
    if (data.completed && data.appId) {
      redirect(`/dashboard/applications/${data.appId}`);
    }
    return data.logs ? { ...data, logs: prev.logs ? `${prev.logs}${data.logs}` : data.logs } : data;
  };
  const { jobName, logs, isCriticalError, jobId } = useEventSource<DeploymentData>({
    eventUrl: `${env.NEXT_PUBLIC_BASEURL}/api/deployments-proxy/logs/${repoName}`,
    initialState: DEFAULT_STATE,
    onMessage,
  });

  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    retryDeploy,
    { error: "", success: "", inputs: { repoName, jobId } },
  );

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden gap-4">
      <BoxReveal duration={0.5}>
        <p className="text-xl font-semibold">
          {jobName && DEPLOYMENTMETADATA[jobName].phrase}
          <span className="text-primary">.</span>
        </p>
      </BoxReveal>
      <div className="flex gap-2">
        <p className="text-xs text-primary">{jobName && DEPLOYMENTMETADATA[jobName].position}</p>
        <LogsTerminalButton logs={logs} />
      </div>
      {isCriticalError && (
        <div className="flex flex-col gap-2 text-center items-center">
          <p className="text-destructive font-semibold">We were unable to deploy your application</p>
          <p className="text-xs text-destructive">Once you think you have resolved the issue, you can redeploy.</p>
          {jobId && (
            <div className="flex flex-col gap-2">
              {state.error && <Paragraph variant="error">{state.error}</Paragraph>}
              <form>
                <input type="hidden" name="repoName" defaultValue={repoName} />
                <input type="hidden" name="jobId" defaultValue={jobId} />
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
        </div>
      )}
      <Ripple />
    </div>
  );
}

function LogsTerminalButton({ logs }: Pick<DeploymentData, "logs">) {
  if (!logs)
    return null;

  return (
    <LogsTerminal logs={logs}>
      <ExternalLinkIcon className="text-primary cursor-pointer" size={15} />
    </LogsTerminal>
  );
}
