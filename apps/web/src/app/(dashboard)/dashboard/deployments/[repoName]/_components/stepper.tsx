"use client";

import { Nullable } from "@/lib/utils";
import { ExternalLink as ExternalLinkIcon } from "lucide-react";
import { useEffect, useState } from "react";
import BoxReveal from "./ui/box-reveal";
import { LogsTerminal } from "./ui/logsterminal";
import Ripple from "./ui/ripple";

interface StepperProps {
  baseUrl: string;
  repoName: string;
}

const DEPLOYMENTMETADATA = {
  clone: {
    phrase: "We clone your GitHub repo to your server",
    position: "1 / 2",
  },
  build: {
    phrase: "We deploy your application",
    position: "2 / 2",
  },
};

type SseData = Nullable<{
  step: "clone" | "build";
  logs: string;
}>;

export function Stepper({ repoName, baseUrl }: StepperProps) {
  const [sseData, setSseData] = useState<SseData>({
    step: null,
    logs: null,
  });

  useEffect(() => {
    const url = `${baseUrl}/api/deployments/logs/${repoName}`;
    const eventSource = new EventSource(url);

    const handleLogs = (e: MessageEvent) => {
      const data = JSON.parse(e.data);
      setSseData((prev) => ({
        step: data.jobName,
        logs: prev.logs ? `${prev.logs}\n${data.logs}` : data.logs,
      }));
    };

    eventSource.addEventListener(`${repoName}-build-logs`, handleLogs);

    return () => {
      eventSource.removeEventListener(`${repoName}-build-logs`, handleLogs);
      eventSource.close();
    };
  }, [baseUrl, repoName]);

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden">
      <BoxReveal duration={0.5}>
        <p className="text-xl font-semibold">
          {sseData.step && DEPLOYMENTMETADATA[sseData.step].phrase}
          <span className="text-primary">.</span>
        </p>
      </BoxReveal>
      <div className="flex gap-2">
        <p className="text-xs text-primary">
          {sseData.step && DEPLOYMENTMETADATA[sseData.step].position}
        </p>
        <LogsTerminalButton step={sseData.step} logs={sseData.logs} />
      </div>
      <Ripple />
    </div>
  );
}

function LogsTerminalButton({ step, logs }: SseData) {
  if (step !== "build" || !logs) return null;

  return (
    <LogsTerminal logs={logs}>
      <ExternalLinkIcon />
    </LogsTerminal>
  );
}
