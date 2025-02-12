"use client";

import { Spinner } from "@/components/ui/spinner";
import { env } from "@/env";

import { useEventSource } from "../_hooks/use-event-source";
import { useRefreshTracker } from "../_lib/refresh-tracker-provider";

interface DeploymentTrackerEventData {
  isActiveDeployment: boolean;
  logs?: string;
};

const DEFAULT_STATE = { isActiveDeployment: false };

export function DeploymentTracker() {
  const { refreshTracker } = useRefreshTracker();

  const { isActiveDeployment } = useEventSource<DeploymentTrackerEventData>({
    eventUrl: `${env.NEXT_PUBLIC_BASEURL}/api/deployments/count`,
    initialState: DEFAULT_STATE,
    boolDependency: refreshTracker,
  });

  return (
    <div className="p-4 flex items-center gap-4 bg-gradient-to-l from-primary to-primary/75 border-dashed border-secondary border mb-2">
      {isActiveDeployment
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
