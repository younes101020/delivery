"use client";

import Link from "next/link";

import type { Nullable } from "@/app/_lib/utils";

import { Badge } from "@/app/_components/ui/badge";
import { Bounce } from "@/app/_components/ui/bounce";
import { buttonVariants } from "@/app/_components/ui/button";
import { Card, CardContent, CardFooter } from "@/app/_components/ui/card";
import { Skeleton } from "@/app/_components/ui/skeleton";
import { useEventSource } from "@/app/_hooks/use-event-source";
import { cn, formatDate } from "@/app/_lib/utils";
import { env } from "@/env";

interface DeploymentPreviewCardProps {
  id: string;
  timestamp: string;
  repoName: string;
  stacktrace: (string | null)[];
}

export type DeploymentPreview = Nullable<{
  step: "clone" | "build" | "configure";
  status: "completed" | "failed" | "active" | "delayed" | "prioritized" | "waiting" | "waiting-children" | "unknown";
  logs?: string;
}>;

const DEFAULT_STATE = { step: null, status: null };

export function DeploymentPreviewCard({
  timestamp,
  repoName,
}: DeploymentPreviewCardProps) {
  const date = formatDate(timestamp);
  const onMessage = (prev: DeploymentPreview, data: DeploymentPreview) => {
    return data.logs ? { ...data, logs: prev.logs ? `${prev.logs}${data.logs}` : data.logs } : data;
  };
  const { status, step } = useEventSource<DeploymentPreview>({
    eventUrl: `${env.NEXT_PUBLIC_BASEURL}/api/deployments-proxy/preview/${repoName}`,
    initialState: DEFAULT_STATE,
    onMessage,
  });

  const previousStep = step === "build" ? "clone" : step === "configure" ? "build" : null;
  const nextStep = step === "clone" ? "build" : step === "build" ? "configure" : null;

  return (
    <Card
      className="flex flex-col border py-10 relative group/feature"
    >
      <div className={`opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-t ${status === "failed" && "from-red-500/25"} ${status === "active" && "from-green-500/25"} to-transparent pointer-events-none`} />
      <CardContent className="px-0">
        {status === "active" && (
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
                {step}
              </dd>
            </dl>
            <dl className="text-xs">
              <dd className="flex gap-2 opacity-50">
                {nextStep}
              </dd>
            </dl>
          </div>
        )}

        <div className="text-lg font-bold mb-2 relative z-10 px-10 flex flex-col">
          <span className="group-hover/feature:translate-x-2 transition duration-200 inline-block mb-2">
            {repoName}
          </span>
          {status
            ? (
                <Badge variant={status === "failed" ? "destructive" : "success"} className="w-fit">
                  {status}
                </Badge>
              )
            : <Skeleton className="inline-flex items-center h-7 px-2.5 py-0.5 text-xs border w-fit">Checking status...</Skeleton>}

        </div>
      </CardContent>

      <CardFooter className="px-0">
        {status === "completed"
          ? (
              <Link href="/dashboard/applications" className={cn(buttonVariants({ variant: "default" }), "mt-4 mx-6")}>
                Go to applications
              </Link>
            )
          : (
              <div className="text-xs max-w-xs relative z-10 px-10">
                {status && status !== "failed" && (
                  <dl>
                    <dt className="text-muted-foreground">This step started at</dt>
                    <dd>
                      {date}
                    </dd>
                  </dl>
                )}
                {status && (
                  <Link href={`/dashboard/deployments/${repoName}`} className={cn(buttonVariants({ variant: status === "failed" ? "destructive" : status === "active" ? "default" : "ghost" }), "mt-4")}>
                    View details
                  </Link>
                )}

              </div>
            )}
      </CardFooter>

    </Card>
  );
}
