"use client";

import { useQuery } from "@tanstack/react-query";
import { PowerOff } from "lucide-react";

import type { DeploymentCountState } from "../types";

import { getQueryClient } from "../_lib/react-query-provider";
import { PinnedToast } from "./pinned-toast";

export function DeploymentTracker() {
  const { data } = useQuery<DeploymentCountState>({ queryKey: ["deployment-tracker"] }, getQueryClient(true));

  return (
    <PinnedToast
      isPending={data?.isActiveDeployment}
      icon={<PowerOff size={15} className="text-primary" />}
    >
      {data?.isActiveDeployment
        ? <p className="underline decoration-primary underline-offset-4">Deployment in progress.</p>
        : <p className="underline decoration-primary underline-offset-4">No deployment.</p>}
    </PinnedToast>
  );
}
