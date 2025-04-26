"use client";

import { useQuery } from "@tanstack/react-query";
import { PowerOff } from "lucide-react";

import { Spinner } from "@/app/_components/ui/spinner";
import { roboto } from "@/app/font";

import type { DeploymentCountState } from "../types";

export function DeploymentTracker() {
  const { data } = useQuery<DeploymentCountState>({ queryKey: ["deployment-tracker"] });

  return (
    <div className={`${roboto.className} p-4 flex items-center gap-4 bg-secondary border mb-2 text-xs`}>
      {data?.isActiveDeployment
        ? (
            <>
              <Spinner />
              <p>Deployment in progress.</p>
            </>
          )
        : (
            <p className="flex items-center gap-2">
              <PowerOff size={14} />
              <span className="font-thin">/</span>
              No deployment.
            </p>
          )}

    </div>
  );
}
