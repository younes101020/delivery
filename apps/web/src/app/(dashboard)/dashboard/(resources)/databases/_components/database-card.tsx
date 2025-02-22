import { Ban, ChevronsLeftRightEllipsis } from "lucide-react";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/app/_components/ui/card";
import { formatDate } from "@/app/_lib/utils";

import { EnvButton } from "./env-button";
import { StopButton } from "./stop-button";

interface DatabaseCardProps {
  id: string;
  name: string;
  state: string;
  status: string;
  createdAt: number;
}

export function DatabaseCard({ name, status, state, createdAt, id }: DatabaseCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg truncate">{name}</CardTitle>
        <StopButton containerId={id} className="text-xs">
          <Ban className="stroke-destructive" />
          Shutdown
        </StopButton>
      </CardHeader>
      <CardContent className="text-xs">
        <dl>
          <dt className="text-muted-foreground">Status</dt>
          <dd>{status}</dd>
        </dl>
        <dl>
          <dt className="text-muted-foreground">State</dt>
          <dd>{state}</dd>
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
