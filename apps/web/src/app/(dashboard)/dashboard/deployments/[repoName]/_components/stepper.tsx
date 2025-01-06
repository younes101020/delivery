"use client";

import { Nullable } from "@/lib/utils";
import { ExternalLink as ExternalLinkIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEventSource } from "../_hooks/use-event-source";
import BoxReveal from "./ui/box-reveal";
import { LogsTerminal } from "./ui/logsterminal";
import Ripple from "./ui/ripple";

interface StepperProps {
  baseUrl: string;
  repoName: string;
}

export type SseData = Nullable<{
  step: keyof typeof DEPLOYMENTMETADATA;
  logs: string;
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

export function Stepper({ repoName, baseUrl }: StepperProps) {
  const router = useRouter();
  const { step, logs } = useEventSource<SseData>({
    type: `${repoName}-deployment-logs`,
    eventUrl: `${baseUrl}/api/deployments/logs/${repoName}`,
    initialState: {
      step: null,
      logs: null,
    },
    onMessage: (prev, data) => {
      if (data.completed && data.id) {
        router.replace(`/dashboard/applications/${data.id}`);
        return prev;
      }
      return {
        step: data.jobName,
        logs: prev.logs ? `${prev.logs}${data.logs}` : data.logs,
      };
    },
  });

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden">
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
      <Ripple />
    </div>
  );
}

function LogsTerminalButton({ step, logs }: SseData) {
  if (step === "clone" || !logs) return null;

  return (
    <LogsTerminal logs={logs}>
      <ExternalLinkIcon className="text-primary cursor-pointer" size={15} />
    </LogsTerminal>
  );
}
