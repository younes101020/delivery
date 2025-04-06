"use client";

import Link from "next/link";

import { buttonVariants } from "@/app/_components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/app/_components/ui/card";

import type { ContainerStatusProps } from "../../types";

import { AppOptions } from "./app-options";
import { ApplicationActions } from "./application-actions";
import { ApplicationStatus } from "./application-status";
import { InjectEnvCard } from "./link-to-database";

interface AppCardProps {
  name: string;
  initialState: ContainerStatusProps["initialState"];
  id: string;
  firstDeploymentAt: string;
  lastDeployed?: string;
  databases: {
    id: string;
    name: string;
  }[] | null;
}

export function AppCard({ name, firstDeploymentAt, id, initialState, databases }: AppCardProps) {
  return (

    <Card className="w-full transition-all">
      <CardHeader>
        <div className="flex items-center justify-between gap-1">
          <div className="truncate flex gap-1">
            <h2 className="decoration-primary underline">{name}</h2>
          </div>

          <div className="flex">
            <ApplicationActions serviceId={id} initialState={initialState} />
            <AppOptions applicationName={name} />
          </div>

        </div>
      </CardHeader>
      <CardContent className="px-6 pb-6">

        <dl className="text-xs pt-2">
          <dt className="text-muted-foreground">State</dt>
          <ApplicationStatus id={id} initialState={initialState} />
        </dl>
        <dl className="text-xs pt-2">
          <dt className="text-muted-foreground">First deployment at</dt>
          <dd className="text-xs">{firstDeploymentAt}</dd>
        </dl>
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2">
        <Link href={`/dashboard/applications/${name}`} className={buttonVariants()}>View details</Link>
        <InjectEnvCard applicationName={name} databases={databases} />
      </CardFooter>
    </Card>

  );
}
