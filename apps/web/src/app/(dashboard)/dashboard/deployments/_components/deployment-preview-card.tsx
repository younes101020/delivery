"use client";

import Link from "next/link";

import type { Nullable } from "@/lib/utils";

import { Bounce } from "@/app/_components/bounce";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, formatDate } from "@/lib/utils";

import { useEventSource } from "../_hooks/use-event-source";

interface DeploymentPreviewCardProps {
  id: string;
  timestamp: string;
  repoName: string;
  stacktrace: (string | null)[];
  baseUrl: string;
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
  baseUrl,
}: DeploymentPreviewCardProps) {
  const date = formatDate(timestamp);
  const { status, step } = useEventSource<DeploymentPreview>({
    eventUrl: `${baseUrl}/api/deployments/preview/${repoName}`,
    initialState: DEFAULT_STATE,
  });

  const previousStep = step === "build" ? "clone" : step === "configure" ? "build" : null;
  const nextStep = step === "clone" ? "build" : step === "build" ? "configure" : null;

  return (
    <div
      className="flex flex-col border py-10 relative group/feature"
    >
      <div className={`opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-t ${status === "failed" ? "from-red-500/25" : "from-green-500/25"} to-transparent pointer-events-none`} />

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
        <span className="group-hover/feature:translate-x-2 transition duration-200 inline-block">
          {repoName}
        </span>
        {status
          ? (
              <Badge variant={status === "failed" ? "destructive" : "success"} className="w-fit">
                {status}
              </Badge>
            )
          : <Skeleton className="inline-flex items-center h-7 px-2.5 py-0.5 text-xs border w-fit">Loading</Skeleton>}

      </div>
      {status === "completed"
        ? (
            <Link href="/dashboard/applications" className={cn(buttonVariants({ variant: "default" }), "mt-4")}>
              Go to applications
            </Link>
          )
        : (
            <div className="text-xs max-w-xs relative z-10 px-10">

              <dl>
                <dt className="text-muted-foreground">This step started at</dt>
                <dd>
                  {date}
                </dd>
              </dl>
              <Link href={`/dashboard/deployments/${repoName}`} className={cn(buttonVariants({ variant: "outline" }), "mt-4")}>
                View details
                {" "}
                {">"}
              </Link>
            </div>
          )}

    </div>
  );
}
