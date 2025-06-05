"use client";

import { useQuery } from "@tanstack/react-query";
import { PowerOff } from "lucide-react";

import { Spinner } from "@/app/_components/ui/spinner";
import { roboto } from "@/app/font";

import type { DeploymentCountState } from "../types";

import { getQueryClient } from "../_lib/react-query-provider";

export function DeploymentTracker() {
  const { data } = useQuery<DeploymentCountState>({ queryKey: ["deployment-tracker"] }, getQueryClient(true));

  return (
    <div className={`${roboto.className} p-4 flex items-center gap-4 bg-secondary border mb-2 text-xs`}>
      <div className="flex items-center gap-2">
        {data?.isActiveDeployment
          ? (
              <>
                <Spinner />
                <span className="font-thin">/</span>
                <p>Deployment in progress.</p>
              </>
            )
          : (
              <>
                <PowerOff size={14} />
                <span className="font-thin">/</span>
                No deployment.
              </>
            )}
      </div>

    </div>
  );
}
