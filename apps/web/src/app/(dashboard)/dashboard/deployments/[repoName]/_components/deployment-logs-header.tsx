"use client";

import { Separator } from "@radix-ui/react-separator";

import { useDeploymentsDictionary } from "@/app/_ctx/resources-dictionary";

import type { OngoingDeploymentData } from "../../types";

import BoxReveal from "./ui/box-reveal";

const DEPLOYMENT_HEADER_POSITIONS = {
  clone: "1 / 3",
  build: "2 / 3",
  configure: "3 / 3",
};

interface DeploymentLogsHeaderProps {
  data: OngoingDeploymentData;
}

export function DeploymentLogsHeader({ data }: DeploymentLogsHeaderProps) {
  const deployments = useDeploymentsDictionary();
  const phrases = {
    clone: deployments.cloneProgress,
    build: deployments.buildProgress,
    configure: deployments.configureProgress,
  };

  return (
    <div className="w-200 flex flex-col">
      {data?.jobName && (
        <BoxReveal duration={0.5}>
          <p className="text-xl font-medium tracking-tighter">
            {phrases[data.jobName]}
            <span className="text-primary">.</span>
          </p>
        </BoxReveal>
      )}

      <div className="flex flex-col">
        <Separator />
        <p className="text-xs text-primary-foreground bg-primary size-fit px-1 self-end">
          {data?.jobName && DEPLOYMENT_HEADER_POSITIONS[data.jobName]}
        </p>
      </div>

    </div>
  );
}
