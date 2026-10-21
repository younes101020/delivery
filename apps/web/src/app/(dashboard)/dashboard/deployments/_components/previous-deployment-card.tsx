"use client";

import { Cog, Scroll } from "lucide-react";
import Link from "next/link";

import { Button, buttonVariants } from "@/app/_components/ui/button";
import { Card, CardAction, CardContent, CardFooter, CardHeader } from "@/app/_components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/app/_components/ui/dialog";
import { Separator } from "@/app/_components/ui/separator";
import { useDeploymentsDictionary, useResourcesDictionary } from "@/app/_ctx/resources-dictionary";
import { cn, toLocalDateString } from "@/app/_lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/(dashboard)/dashboard/_components/ui/table";

import { DeploymentLogsCard } from "./deployment-logs";

interface DeploymentPreviewCardProps {
  id: string;
  repoName: string;
  logs: string;
  applicationId: number;
  deploymentDuration: DeploymentDuration[];
}

interface DeploymentDuration {
  id: string;
  step: string;
  label: string;
  startTimeTimestamp: number;
  endTimeTimestamp: number;
}

export function PreviousDeploymentPreviewCard({
  repoName,
  logs,
  applicationId,
  deploymentDuration,
}: DeploymentPreviewCardProps) {
  const deployments = useDeploymentsDictionary();
  return (
    <Card
      className="rounded-none"
    >
      <CardHeader>
        <div className="flex flex-row justify-between items-center">
          <p>{repoName}</p>
          <CardAction>
            <Link href={`/dashboard/applications/${applicationId}`} className={cn(buttonVariants({ variant: "outline" }), "text-xs")}>
              <Cog strokeWidth={0.8} />
              {" "}
              {deployments.applicationSettings}
            </Link>
          </CardAction>
        </div>

      </CardHeader>
      <Separator />
      <CardContent className="text-xs">
        <DeploymentDurationTable deploymentDuration={deploymentDuration} />
      </CardContent>

      <CardFooter>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="text-xs">
              <Scroll />
              {" "}
              {deployments.viewBuildLogs}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl w-full border-none">
            <DialogHeader>
              <DialogTitle>{deployments.logs}</DialogTitle>
            </DialogHeader>
            <DeploymentLogsCard logs={logs} />
          </DialogContent>
        </Dialog>
      </CardFooter>

    </Card>
  );
}

interface DeploymentDurationTableProps {
  deploymentDuration: DeploymentDuration[];
}

function DeploymentDurationTable({ deploymentDuration }: DeploymentDurationTableProps) {
  const deployments = useDeploymentsDictionary();
  const { locale } = useResourcesDictionary();
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{deployments.step}</TableHead>
          <TableHead>{deployments.startedAt}</TableHead>
          <TableHead>{deployments.endedAt}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {deploymentDuration.map(duration => (
          <TableRow key={duration.id}>
            <TableCell className="font-medium">{duration.label}</TableCell>
            <TableCell>{toLocalDateString(duration.startTimeTimestamp, locale)}</TableCell>
            <TableCell>{toLocalDateString(duration.endTimeTimestamp, locale)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
