import { ChevronsLeftRightEllipsis } from "lucide-react";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/app/_components/ui/card";
import { formatDate } from "@/app/_lib/utils";

import { DatabaseActions } from "./database-actions";
import { DatabaseStatus } from "./database-status";
import { EnvButton } from "./env-button";
import { PostgresIcon } from "./ui/postgres-icon";

interface DatabaseCardProps {
  id: string;
  name: string;
  state: "created" | "restarting" | "running" | "removing" | "paused" | "exited" | "dead";
  status: string;
  isProcessing: boolean;
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

        <DatabaseActions state={state} id={id} />

      </CardHeader>
      <CardContent className="text-xs space-y-2">

        <>
          <dl>
            <dt className="text-muted-foreground">State</dt>
            <DatabaseStatus id={id} initialState={state} />
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
