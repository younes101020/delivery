"use client";

import { useQuery } from "@tanstack/react-query";

import { Badge } from "@/app/_components/ui/badge";
import { Bounce } from "@/app/_components/ui/bounce";

import type { ContainerStatusProps } from "../../types";
import type { ApplicationStatusData } from "./types";

import { state, variants } from "../../const";

const statusComponents = {
  active: <ProcessingContainerProcessStatusBadge />,
  completed: (data: ApplicationStatusData) => <CompletedContainerProcessStatusBadge processName={data.queueName} />,
  failed: <FailedContainerProcessStatusBadge />,
};

export function ApplicationStatus({ initialState, id }: ContainerStatusProps) {
  const { data } = useQuery<ApplicationStatusData>({ queryKey: [id] });

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
  processName: ApplicationStatusData["queueName"];
}

function CompletedContainerProcessStatusBadge({ processName }: CompletedContainerProcessStatusBadgeProps) {
  return (
    <dd className="py-2">
      <Badge variant={variants[processName]}>
        <ContainerBounce isActive={processName === "start"} />
        <p className="ml-2">{state[processName]}</p>
      </Badge>
    </dd>
  );
}

function ProcessingContainerProcessStatusBadge() {
  return (
    <dd>
      <Badge variant="processing">
        Processing
      </Badge>
    </dd>
  );
}

function FailedContainerProcessStatusBadge() {
  return (
    <dd>
      <Badge variant="failed">
        Failed
      </Badge>
    </dd>
  );
}

function ContainerBounce({ isActive }: { isActive: boolean }) {
  return <Bounce className="flex items-center mb-[.1rem]" isActive={isActive} />;
}
