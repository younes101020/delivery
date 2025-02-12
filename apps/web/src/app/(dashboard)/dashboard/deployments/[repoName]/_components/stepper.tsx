"use client";

import { ExternalLink as ExternalLinkIcon, Loader2, RotateCcw } from "lucide-react";
import { redirect } from "next/navigation";
import { useActionState, useEffect } from "react";

import type { ActionState } from "@/app/_lib/form-middleware";
import type { Nullable } from "@/lib/utils";

import { useRefreshTracker } from "@/app/_lib/refresh-tracker-provider";
import { retryDeploy } from "@/app/actions";
import { Button } from "@/components/ui/button";

import { useEventSource } from "../../_hooks/use-event-source";
import BoxReveal from "./ui/box-reveal";
import { LogsTerminal } from "./ui/logsterminal";
import Ripple from "./ui/ripple";

interface StepperProps {
  baseUrl: string;
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

  const { setRefreshTracker } = useRefreshTracker();
  const onMessage = (_: DeploymentData, data: DeploymentData) => {
    console.log("is finished: ", data.jobName, data.completed, data.appId);
    if (data.completed && data.appId) {
      redirect(`/dashboard/applications/${data.appId}`);
    }
  };
  const { jobName, logs, isCriticalError, jobId } = useEventSource<DeploymentData>({
    eventUrl: `${baseUrl}/api/deployments/logs/${repoName}`,
    initialState: DEFAULT_STATE,
    onMessage,
  });
  useEffect(() => {
    setRefreshTracker(true);
  }, []);
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
              {state.error && <p className="text-xs text-destructive">{state.error}</p>}
              <form>
                <input type="hidden" name="repoName" defaultValue={state.inputs.repoName} />
                <input type="hidden" name="jobId" defaultValue={state.inputs.jobId ?? ""} />
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
