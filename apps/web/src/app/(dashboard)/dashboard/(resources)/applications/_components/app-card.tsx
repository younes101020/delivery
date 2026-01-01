"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { Suspense } from "react";

import { buttonVariants } from "@/app/_components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/app/_components/ui/card";
import { Skeleton } from "@/app/_components/ui/skeleton";
import { useUser } from "@/app/_hooks/use-user";

import type { ContainerStatusProps } from "../../types";

import { AppOptions } from "./app-options";
import { ApplicationActions } from "./application-actions";
import { ApplicationStatus } from "./application-status";
// to avoid hydration mismatch
const AppDeploymentDate = dynamic(() => import("./app-deployment-date"), { ssr: false });

interface AppCardProps {
  name: string;
  initialState: ContainerStatusProps["initialState"];
  id: string;
  firstDeploymentAt: string;
  lastDeployed?: string;
  refetchApplications: () => void;
}

export function AppCard({ name, firstDeploymentAt, id, initialState, refetchApplications }: AppCardProps) {
  const { user } = useUser();

  return (
    <Card className="w-full transition-all">
      <CardHeader>
        <div className="flex items-center justify-between gap-1 flex-wrap">
          <div className="truncate flex gap-1">
            <h2 className="decoration-primary underline">{name}</h2>
          </div>

          {user.role === "owner" && (
            <div className="flex gap-2 items-center">
              <ApplicationActions serviceId={id} initialState={initialState} />
              <AppOptions applicationName={name} />
            </div>
          )}

        </div>
      </CardHeader>
      <CardContent className="px-6 pb-6">

        <dl className="text-xs pt-2">
          <dt className="text-muted-foreground">State</dt>
          <ApplicationStatus id={id} initialState={initialState} refetchApplications={refetchApplications} />
        </dl>
        <dl className="text-xs pt-2">
          <dt className="text-muted-foreground">First deployment at</dt>
          <Suspense fallback={<Skeleton className="h-12 w-full bg-red-500" />}>
            <AppDeploymentDate deployedAt={firstDeploymentAt} />
          </Suspense>
        </dl>
      </CardContent>
      <CardFooter>
        <Link href={`/dashboard/applications/${name}`} className={buttonVariants()}>View details</Link>
      </CardFooter>
    </Card>

  );
}
