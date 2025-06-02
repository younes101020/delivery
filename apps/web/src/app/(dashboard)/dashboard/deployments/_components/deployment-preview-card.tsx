"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

import { Badge } from "@/app/_components/ui/badge";
import { Bounce } from "@/app/_components/ui/bounce";
import { buttonVariants } from "@/app/_components/ui/button";
import { Card, CardContent, CardFooter } from "@/app/_components/ui/card";
import { Skeleton } from "@/app/_components/ui/skeleton";
import { getQueryClient } from "@/app/_lib/react-query-provider";
import { cn, formatDate } from "@/app/_lib/utils";

import type { DeploymentPreviewState } from "../types";

interface DeploymentPreviewCardProps {
  id: string;
  timestamp: string;
  repoName: string;
  stacktrace: (string | null)[];
}

export function DeploymentPreviewCard({
  timestamp,
  repoName,
}: DeploymentPreviewCardProps) {
  const date = formatDate(timestamp);
  const { data } = useQuery<DeploymentPreviewState>({ queryKey: [repoName] }, getQueryClient(true));

  const previousStep = data?.step === "build" ? "clone" : data?.step === "configure" ? "build" : null;
  const nextStep = data?.step === "clone" ? "build" : data?.step === "build" ? "configure" : null;

  return (
    <Card
      className="flex flex-col border py-10 relative group/feature"
    >
      <div className={`opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-t ${data?.status === "failed" && "from-red-500/25"} ${data?.status === "active" && "from-green-500/25"} to-transparent pointer-events-none`} />
      <CardContent className="px-0">
        {data?.status === "active" && (
          <div className="mb-4 relative z-10 px-10">
            <dl className="text-xs">
              <dd className="flex gap-2 line-through opacity-50">
                {previousStep}
              </dd>
            </dl>
            <dl className="text-sm flex gap-2">
              <dt className="pt-[.1rem]">
                <Bounce variant="active" />
              </dt>
              <dd className="flex gap-2 align-middle">
                {data?.step}
              </dd>
            </dl>
            <dl className="text-xs">
              <dd className="flex gap-2 opacity-50">
                {nextStep}
              </dd>
            </dl>
          </div>
        )}

        <div className="text-lg relative z-10 px-10 flex flex-col">
          <span className="group-hover/feature:translate-x-2 transition duration-200 inline-block mb-2">
            {repoName}
          </span>
          {data?.status
            ? (
                <Badge variant={data.status === "failed" ? "destructive" : "success"} className="w-fit">
                  {data.status}
                </Badge>
              )
            : <Skeleton className="inline-flex items-center h-7 px-2.5 py-0.5 text-xs border w-fit">Checking status...</Skeleton>}

        </div>
      </CardContent>

      <CardFooter className="px-0">
        {data?.status === "completed"
          ? (
              <Link href="/dashboard/applications" className={cn(buttonVariants({ variant: "default" }), "mt-4 mx-6")}>
                Go to applications
              </Link>
            )
          : (
              <div className="text-xs max-w-xs relative z-10 px-10">
                {data?.status && data.status !== "failed" && (
                  <dl>
                    <dt className="text-muted-foreground">This step started at</dt>
                    <dd>
                      {date}
                    </dd>
                  </dl>
                )}
                {data?.status && (
                  <Link href={`/dashboard/deployments/${repoName}`} className={cn(buttonVariants({ variant: data.status === "failed" ? "destructive" : data.status === "active" ? "default" : "ghost" }), "mt-2")}>
                    View details
                  </Link>
                )}

              </div>
            )}
      </CardFooter>

    </Card>
  );
}
