import { Ban, ChevronsLeftRightEllipsis, Play } from "lucide-react";

import { Bounce } from "@/app/_components/ui/bounce";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/app/_components/ui/card";
import { formatDate } from "@/app/_lib/utils";

import { EnvButton } from "./env-button";
import { StartButton } from "./start-button";
import { StopButton } from "./stop-button";

interface DatabaseCardProps {
  id: string;
  name: string;
  state: string;
  status: string;
  createdAt: number;
}

export function DatabaseCard({ name, status, state, createdAt, id }: DatabaseCardProps) {
  const canStopContainer = state === "running";
  const canStartContainer = state === "exited" || state === "created";

  const bounceVariant = state === "running" ? "active" : state === "exited" ? "failed" : "primary";

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg truncate">{name}</CardTitle>
        {canStopContainer && (
          <StopButton containerId={id} className="text-xs">
            <Ban className="stroke-destructive" />
            Shutdown
          </StopButton>
        )}
        {canStartContainer && (
          <StartButton containerId={id} className="text-xs">
            <Play className="stroke-primary" />
            Start
          </StartButton>
        )}

      </CardHeader>
      <CardContent className="text-xs space-y-2">
        <dl>
          <dt className="text-muted-foreground">Status</dt>
          <dd>{status}</dd>
        </dl>
        <dl>
          <dt className="text-muted-foreground">State</dt>
          <dd className="flex gap-1">
            <Bounce variant={bounceVariant} />
            {state}
          </dd>
        </dl>
        <dl>
          <dt className="text-muted-foreground">Creation date</dt>
          <dd>{formatDate(createdAt)}</dd>
        </dl>
      </CardContent>
      <CardFooter className="gap-2">
        <EnvButton containerId={id} className="text-xs">
          <ChevronsLeftRightEllipsis />
          Link to application
        </EnvButton>
      </CardFooter>
    </Card>
  );
}
