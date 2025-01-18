"use client";

import { ExternalLink as ExternalLinkIcon } from "lucide-react";
import { redirect, useRouter } from "next/navigation";
import { useCallback } from "react";

import type { Nullable } from "@/lib/utils";

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
  const onMessage = useCallback(
    (prev: DeploymentData, data: SSEMessage<DeploymentData>) => {
      if (data.completed && data.id) {
        redirect(`/dashboard/applications/${data.id}`);
      }
      return {
        step: data.jobName,
        logs: prev.logs ? `${prev.logs}${data.logs}` : data.logs,
        isCriticalError: data.isCriticalError,
      };
    },
    [],
  );
  const { step, logs, isCriticalError } = useEventSource<DeploymentData>({
    type: `${repoName}-deployment-logs`,
    eventUrl: `${baseUrl}/api/deployments/logs/${repoName}`,
    initialState: DEFAULT_STATE,
    onMessage,
  });

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
      {true && (
        <div className="flex flex-col gap-2 text-center items-center">
          <p className="text-destructive font-semibold">We were unable to deploy your application</p>
          <p className="text-xs text-destructive">Once you think you have resolved the issue, you can redeploy.</p>
          <Button variant={"outline"} className="w-fit">Redeploy</Button>
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
