"use client";

import { useQuery } from "@tanstack/react-query";

import { Badge } from "@/app/_components/ui/badge";
import { Bounce } from "@/app/_components/ui/bounce";

import type { ContainerStatusProps } from "../../types";
import type { ApplicationStatusData } from "./types";

import { state, variants } from "../../const";

interface ApplicationStatusProps extends ContainerStatusProps {
  name: string;
}

export function ApplicationStatus({ initialState, name }: ApplicationStatusProps) {
  const { data } = useQuery<ApplicationStatusData>({ queryKey: [name] });

  const isProcessing = data && data.status !== "completed";

  if (isProcessing) {
    return (
      <dd>
        <Badge variant="processing">
          Processing
        </Badge>
      </dd>
    );
  }

  const isCompleted = data?.status === "completed";

  if (isCompleted) {
    return (
      <dd className="flex gap-1">
        <Bounce variant={variants[data.queueName]} />
        {state[data.queueName]}
      </dd>
    );
  }

  return (
    <dd className="flex gap-1">
      <Bounce variant={variants[initialState]} />
      {initialState}
    </dd>
  );
}
