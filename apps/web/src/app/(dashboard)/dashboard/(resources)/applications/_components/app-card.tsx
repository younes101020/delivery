"use client";

import Link from "next/link";

import { Card, CardContent, CardHeader } from "@/app/_components/ui/card";

import { ApplicationActions } from "./application-actions";
import { ApplicationStatus } from "./application-status";

interface AppCardProps {
  name: string;
  initialState: "created" | "restarting" | "running" | "removing" | "paused" | "exited" | "dead";
  id: string;
  firstDeploymentAt: string;
  lastDeployed?: string;
}

export function AppCard({ name, firstDeploymentAt, id, initialState }: AppCardProps) {
  return (

    <Card className="w-full transition-all">
      <CardHeader>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold truncate">{name}</h2>
          <ApplicationActions id={id} name={name} initialState={initialState} />
        </div>
      </CardHeader>
      <Link href={`/dashboard/applications/${name}`} className="block">
        <CardContent className="p-6 bg-sidebar/50">

          <dl className="text-xs pt-2">
            <dt className="text-muted-foreground">State</dt>
            <ApplicationStatus name={name} initialState={initialState} />
          </dl>
          <dl className="text-xs pt-2">
            <dt className="text-muted-foreground">First deployment at</dt>
            <dd className="text-xs">{firstDeploymentAt}</dd>
          </dl>
        </CardContent>
      </Link>
    </Card>

  );
}
