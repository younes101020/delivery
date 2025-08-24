"use client";

import { Cog, Scroll } from "lucide-react";
import Link from "next/link";

import { Button, buttonVariants } from "@/app/_components/ui/button";
import { Card, CardAction, CardContent, CardFooter, CardHeader } from "@/app/_components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/app/_components/ui/dialog";
import { Separator } from "@/app/_components/ui/separator";
import { cn, formatDateFromTimestamp } from "@/app/_lib/utils";
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
              Application setting
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
              View build logs
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl w-full border-none">
            <DialogHeader>
              <DialogTitle>Logs</DialogTitle>
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
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Step</TableHead>
          <TableHead>Started at</TableHead>
          <TableHead>Ended at</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {deploymentDuration.map(duration => (
          <TableRow key={duration.id}>
            <TableCell className="font-medium">{duration.label}</TableCell>
            <TableCell>{formatDateFromTimestamp(duration.startTimeTimestamp)}</TableCell>
            <TableCell>{formatDateFromTimestamp(duration.endTimeTimestamp)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
