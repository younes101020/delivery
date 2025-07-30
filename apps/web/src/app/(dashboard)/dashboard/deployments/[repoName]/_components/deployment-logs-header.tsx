"use client";

import { Separator } from "@radix-ui/react-separator";

import type { OngoingDeploymentData } from "../../types";

import BoxReveal from "./ui/box-reveal";

const DEPLOYMENT_HEADER_METADATA = {
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

interface DeploymentLogsHeaderProps {
  data: OngoingDeploymentData;
}

export function DeploymentLogsHeader({ data }: DeploymentLogsHeaderProps) {
  return (
    <div className="w-[50rem] flex flex-col">
      {data?.jobName && (
        <BoxReveal duration={0.5}>
          <p className="text-xl font-medium tracking-tighter">
            {DEPLOYMENT_HEADER_METADATA[data?.jobName].phrase}
            <span className="text-primary">.</span>
          </p>
        </BoxReveal>
      )}

      <div className="flex flex-col">
        <Separator />
        <p className="text-xs text-primary-foreground bg-primary size-fit px-1 self-end">
          {data?.jobName && DEPLOYMENT_HEADER_METADATA[data.jobName].position}
        </p>
      </div>

    </div>
  );
}
