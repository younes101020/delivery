"use client";

import Link from "next/link";

import { Button, buttonVariants } from "@/app/_components/ui/button";
import { Card, CardContent, CardFooter } from "@/app/_components/ui/card";
import { Dialog, DialogTrigger } from "@/app/_components/ui/dialog";
import { cn } from "@/app/_lib/utils";

import { DeploymentLogsCard } from "./deployment-logs";

interface DeploymentPreviewCardProps {
  id: string;
  repoName: string;
  logs: string;
  applicationId: number;
}

export function PreviousDeploymentPreviewCard({
  repoName,
  logs,
  applicationId,
}: DeploymentPreviewCardProps) {
  return (
    <Card
      className="flex flex-col border py-10 relative group/feature"
    >
      <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-linear-to-t to-transparent pointer-events-none from-primary/25" />

      <CardContent className="px-0">
        <div className="text-lg mb-2 relative z-10 px-10 flex flex-col">
          <span className="group-hover/feature:translate-x-2 transition duration-200 inline-block">
            {repoName}
          </span>
        </div>
      </CardContent>

      <CardFooter className="flex flex-wrap gap-3">
        <Dialog>
          <DialogTrigger asChild>
            <Button className="text-xs">View build logs</Button>
          </DialogTrigger>
          <DeploymentLogsCard logs={logs} />
        </Dialog>
        <Link href={`/dashboard/applications/${applicationId}`} className={cn(buttonVariants({ variant: "outline" }), "text-xs")}>
          Application setting
        </Link>
      </CardFooter>

    </Card>
  );
}
