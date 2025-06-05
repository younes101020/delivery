"use client";

import { useQuery } from "@tanstack/react-query";

import { Badge } from "@/app/_components/ui/badge";
import { Bounce } from "@/app/_components/ui/bounce";
import { getQueryClient } from "@/app/_lib/react-query-provider";

import type { ContainerStatusProps } from "../../types";
import type { DatabaseStatusData } from "./types";

import { state, variants } from "../../const";

const statusComponents = {
  active: <ProcessingContainerProcessStatusBadge />,
  completed: (data: DatabaseStatusData) => <CompletedContainerProcessStatusBadge processName={data.queueName} />,
  failed: <FailedContainerProcessStatusBadge />,
};

export function DatabaseStatus({ initialState, id }: ContainerStatusProps) {
  const { data } = useQuery<DatabaseStatusData>({ queryKey: [id] }, getQueryClient(true));

  if (!data) {
    return (
      <dd className="py-1">
        <Badge variant={variants[initialState]}>
          <ContainerBounce isActive={initialState === "running"} />
          <p className="ml-2">{initialState}</p>
        </Badge>
      </dd>
    );
  }

  const ContainerStatusBadge = statusComponents[data.status];

  if (ContainerStatusBadge)
    return ContainerStatusBadge instanceof Function ? ContainerStatusBadge(data) : ContainerStatusBadge;

  return (
    <dd className="py-1">
      <Badge variant={variants[data.processName]}>
        <ContainerBounce isActive={false} />
        <p className="ml-2">{data.processName}</p>
      </Badge>
    </dd>
  );
}

interface CompletedContainerProcessStatusBadgeProps {
  processName: DatabaseStatusData["queueName"];
}

function CompletedContainerProcessStatusBadge({ processName }: CompletedContainerProcessStatusBadgeProps) {
  return (
    <dd className="py-1">
      {processName === "remove"
        ? (
            <Badge variant={processName}>
              <p>removed</p>
            </Badge>
          )
        : (
            <Badge variant={processName}>
              <ContainerBounce isActive={processName === "start"} />
              <p className="ml-2">{state[processName]}</p>
            </Badge>
          )}
    </dd>
  );
}

function ProcessingContainerProcessStatusBadge() {
  return (
    <dd className="py-1">
      <Badge variant="processing">
        Processing
      </Badge>
    </dd>
  );
}

function FailedContainerProcessStatusBadge() {
  return (
    <dd className="py-1">
      <Badge variant="failed">
        Failed
      </Badge>
    </dd>
  );
}

function ContainerBounce({ isActive }: { isActive: boolean }) {
  return <Bounce className="flex items-center mb-[.1rem]" isActive={isActive} />;
}
