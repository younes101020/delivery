import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/_components/ui/card";

import type { ContainerStatusProps } from "../../types";

import { DatabaseActions } from "./database-actions";
import { DatabaseDate } from "./database-date";
import { DatabaseOptions } from "./database-options";
import { DatabaseStatus } from "./database-status";
import { PostgresIcon } from "./ui/postgres-icon";

interface DatabaseCardProps {
  id: string;
  image: string;
  name: string;
  state: ContainerStatusProps["initialState"];
  isProcessing: boolean;
  createdAt: number;
}

export function DatabaseCard({ name, state, id, createdAt, image }: DatabaseCardProps) {
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
          <DatabaseActions initialState={state} id={id} />
          <DatabaseOptions containerId={id} />
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
