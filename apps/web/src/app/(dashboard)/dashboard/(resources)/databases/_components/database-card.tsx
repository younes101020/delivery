import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/_components/ui/card";
import { CopyButton } from "@/app/(dashboard)/dashboard/_components/copy-button";

import { DatabaseActions } from "./database-actions";
import { DatabaseDate } from "./database-date";
import { DatabaseOptions } from "./database-options";
import { DatabaseStatus } from "./database-status";
import { PostgresIcon } from "./ui/postgres-icon";

interface DatabaseCardProps {
  id: string;
  image?: string;
  name: string;
  isProcessing: boolean;
  createdAt: string;
  isActive: boolean;
  dbConnectionUri: string | null;
}

export function DatabaseCard({ name, id, createdAt, image, isActive, dbConnectionUri }: DatabaseCardProps) {
  const state = isActive ? "running" : "stop";
  return (
    <Card className="h-fit">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex gap-2 truncate items-center">
          <PostgresIcon size={25} />
          /
          <div>
            <CardTitle className="text-lg truncate">{name}</CardTitle>
            <CardDescription className="text-xs">{image}</CardDescription>
          </div>

        </div>

        <div className="flex">
          <DatabaseActions initialState={state} serviceId={id} />
          <DatabaseOptions serviceName={name} />
        </div>

      </CardHeader>
      <CardContent className="text-xs space-y-3">
        <dl>
          <dt className="text-muted-foreground">State</dt>
          <DatabaseStatus id={id} initialState={state} />
        </dl>
        {dbConnectionUri && (
          <dl>
            <dt className="text-muted-foreground">Connection URI</dt>
            <dd className="flex items-center gap-2 bg-muted text-muted-foreground px-2 py-1">
              <p className="truncate">{dbConnectionUri}</p>
              <CopyButton value={dbConnectionUri} />
            </dd>
          </dl>
        )}

        <dl>
          <dt className="text-muted-foreground">Creation date</dt>
          <DatabaseDate date={createdAt} />
        </dl>

      </CardContent>
    </Card>
  );
}
