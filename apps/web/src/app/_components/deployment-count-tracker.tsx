"use client";

import { useQuery } from "@tanstack/react-query";

import { Spinner } from "@/app/_components/ui/spinner";

import type { DeploymentCountState } from "../types";

export function DeploymentTracker() {
  const { data } = useQuery<DeploymentCountState>({ queryKey: ["deployment-tracker"] });

  return (
    <div className="p-4 flex items-center gap-4 bg-gradient-to-l from-primary to-primary/75 border-dashed border-secondary border mb-2">
      {data?.isActiveDeployment
        ? (
            <>
              <Spinner />
              <p className="text-xs text-primary-foreground">Deployment in progress.</p>
            </>
          )
        : <p className="text-xs text-primary-foreground">No deployment in progress.</p>}

    </div>
  );
}
