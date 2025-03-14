import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/app/_components/ui/card";

import { DatabaseActions } from "./database-actions";
import { DatabaseDate } from "./database-date";
import { DeleteDatabaseForm } from "./database-remove";
import { DatabaseStatus } from "./database-status";
import { EnvironmentVariableCard } from "./environment-variable-card";
import { PostgresIcon } from "./ui/postgres-icon";

interface DatabaseCardProps {
  id: string;
  name: string;
  state: "created" | "restarting" | "running" | "removing" | "paused" | "exited" | "dead";
  isProcessing: boolean;
  createdAt: number;
  applications: {
    applicationName: string;
  }[] | null;
}

export function DatabaseCard({ name, state, id, createdAt, applications }: DatabaseCardProps) {
  return (
    <Card className="relative">
      <DeleteDatabaseForm containerId={id} />
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex gap-2 truncate">
          <PostgresIcon size={25} />
          <CardTitle className="text-lg truncate">{name}</CardTitle>
        </div>

        <DatabaseActions initialState={state} id={id} />

      </CardHeader>
      <CardContent className="text-xs space-y-2">

        <>
          <dl>
            <dt className="text-muted-foreground">State</dt>
            <DatabaseStatus id={id} initialState={state} />
          </dl>
          <dl>
            <dt className="text-muted-foreground">Creation date</dt>
            <DatabaseDate date={createdAt} />
          </dl>
        </>

      </CardContent>
      <CardFooter className="gap-2">

        {applications && <EnvironmentVariableCard containerId={id} applications={applications} />}

      </CardFooter>
    </Card>
  );
}
