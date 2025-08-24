"use client";

import { useQuery } from "@tanstack/react-query";
import { Radio } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/app/_components/ui/badge";
import { Bounce } from "@/app/_components/ui/bounce";
import { buttonVariants } from "@/app/_components/ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/app/_components/ui/card";
import { Separator } from "@/app/_components/ui/separator";
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
      className="rounded-none"
    >
      <CardHeader>
        <div className="flex flex-row justify-between items-center">
          <CardTitle className="font-normal space-x-4">{repoName}</CardTitle>
          {data?.status !== "completed" && (
            <div>
              <CardAction>
                <Link href={`/dashboard/deployments/${repoName}`} className={cn(buttonVariants({ variant: "outline" }), "mt-2 text-xs")}>
                  <Radio strokeWidth={0.9} size={0.5} />
                  Live logs
                </Link>
              </CardAction>
            </div>
          )}
        </div>

      </CardHeader>
      <CardContent>
        <Separator className="my-2" />
        <div className="text-lg flex flex-col">
          {data?.status
            ? (
                <Badge variant={data.status === "failed" ? "destructive" : "success"} className="w-fit">
                  {data.status}
                </Badge>
              )
            : <Skeleton className="inline-flex items-center h-7 px-2.5 py-0.5 text-xs border w-fit">Checking status...</Skeleton>}

        </div>
        {(data?.status === "active" || data?.status === "failed") && (
          <div className="my-4 relative z-10">
            <dl className="text-xs">
              <dd className="flex gap-2 line-through opacity-50">
                {previousStep}
              </dd>
            </dl>
            <dl className="text-sm flex gap-2">
              <dt className="pt-[.1rem]">
                <Bounce variant={data.status} />
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
        <Separator className="my-2" />
        <div className="text-xs max-w-xs mt-3">
          {data?.status && (
            <dl>
              <dt className="text-muted-foreground">This step started at</dt>
              <dd>
                {date}
              </dd>
            </dl>
          )}
        </div>
      </CardContent>

    </Card>
  );
}
