import { Ban, ChevronsLeftRightEllipsis, Play } from "lucide-react";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/app/_components/ui/card";
import { formatDate } from "@/app/_lib/utils";

import { DatabaseStatus } from "./database-status";
import { EnvButton } from "./env-button";
import { StartButton } from "./start-button";
import { StopButton } from "./stop-button";
import { PostgresIcon } from "./ui/postgres-icon";

interface DatabaseCardProps {
  id: string;
  name: string;
  state: string;
  status: string;
  createdAt: number;
}

export function DatabaseCard({ name, state, id, status, createdAt }: DatabaseCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">

        <div className="flex gap-2 truncate">
          <PostgresIcon size={25} />
          <CardTitle className="text-lg truncate">{name}</CardTitle>
        </div>

        <ContainerActions state={state} id={id} />

      </CardHeader>
      <CardContent className="text-xs space-y-2">

        <>
          <dl>
            <dt className="text-muted-foreground">State</dt>
            <DatabaseStatus state={state} />
          </dl>
          <dl>
            <dt className="text-muted-foreground">Creation date</dt>
            <dd>{formatDate(createdAt)}</dd>
          </dl>
          <dl>
            <dt className="text-muted-foreground">Status</dt>
            <dd>{status}</dd>
          </dl>
        </>

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

interface ContainerActionsProps {
  state: string;
  id: string;
}

function ContainerActions({ id, state }: ContainerActionsProps) {
  const canStopContainer = state === "running";
  const canStartContainer = state === "exited" || state === "created";
  return (
    <>
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
    </>
  );
}
