import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/_components/ui/card";

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
}

export function DatabaseCard({ name, id, createdAt, image, isActive }: DatabaseCardProps) {
  const state = isActive ? "running" : "stop";
  return (
    <Card className="relative">
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
        <dl>
          <dt className="text-muted-foreground">Creation date</dt>
          <DatabaseDate date={createdAt} />
        </dl>

      </CardContent>
    </Card>
  );
}
