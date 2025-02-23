"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/app/_components/ui/card";
import { Spinner } from "@/app/_components/ui/spinner";

interface OnStartingDatabaseCardProps {
  name: string;
}

export function OnStartingDatabaseCard({ name }: OnStartingDatabaseCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg truncate">{name}</CardTitle>
        <Spinner className="border-primary" />
      </CardHeader>
      <CardContent className="text-xs">

      </CardContent>
    </Card>
  );
}
