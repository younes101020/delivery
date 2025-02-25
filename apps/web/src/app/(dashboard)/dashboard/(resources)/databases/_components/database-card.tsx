import { Ban, ChevronsLeftRightEllipsis, Play } from "lucide-react";

import { Badge } from "@/app/_components/ui/badge";
import { Bounce } from "@/app/_components/ui/bounce";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/app/_components/ui/card";
import { formatDate } from "@/app/_lib/utils";

import { EnvButton } from "./env-button";
import { StartButton } from "./start-button";
import { StopButton } from "./stop-button";
import { PostgresIcon } from "./ui/postgres-icon";

type DatabaseCardProps = {
  id: string;
  name: string;
  isProcessing: true;
} | {
  id: string;
  name: string;
  state: string;
  status: string;
  createdAt: number;
  isProcessing: false;
};

export function DatabaseCard(props: DatabaseCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">

        <div className="flex gap-2 truncate">
          <PostgresIcon size={25} />
          <CardTitle className="text-lg truncate">{props.name}</CardTitle>
        </div>

        {!props.isProcessing && <ContainerActions state={props.state} id={props.id} />}

      </CardHeader>
      <CardContent className="text-xs space-y-2">
        {props.isProcessing && <Badge variant="processing">Processing</Badge>}

        {props.isProcessing
          ? <Bounce />
          : (
              <>
                <dl>
                  <dt className="text-muted-foreground">State</dt>
                  <dd className="flex gap-1">
                    <Bounce variant={props.state === "running" ? "active" : props.state === "exited" ? "failed" : "primary"} />
                    {props.state}
                  </dd>
                </dl>
                <dl>
                  <dt className="text-muted-foreground">Creation date</dt>
                  <dd>{formatDate(props.createdAt)}</dd>
                </dl>
                <dl>
                  <dt className="text-muted-foreground">Status</dt>
                  <dd>{props.status}</dd>
                </dl>
              </>
            )}

      </CardContent>
      <CardFooter className="gap-2">

        <EnvButton containerId={props.id} className="text-xs">
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
