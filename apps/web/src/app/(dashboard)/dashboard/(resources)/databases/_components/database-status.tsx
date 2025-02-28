"use client";

import { useQuery } from "@tanstack/react-query";

import { Badge } from "@/app/_components/ui/badge";
import { Bounce } from "@/app/_components/ui/bounce";

import type { DatabaseStatusData } from "./types";

interface DatabaseStatusProps {
  initialState: "created" | "restarting" | "running" | "removing" | "paused" | "exited" | "dead";
  id: string;
}

const variants = {
  stop: "failed",
  start: "active",
  create: "primary",
  running: "active",
  paused: "primary",
  exited: "failed",
  dead: "failed",
  restarting: "active",
  removing: "failed",
  created: "primary",
} as const;

export function DatabaseStatus({ initialState, id }: DatabaseStatusProps) {
  const { data } = useQuery<DatabaseStatusData>({ queryKey: [id] });

  const variant = data?.status === "completed" ? variants[data.queueName] : variants[initialState];

  const state = data?.status === "completed" ? data.queueName : initialState;

  return (
    <>
      <dd className="flex gap-1">
        <Bounce variant={variant} />
        {state}
      </dd>
      <dd className="mt-1">
        {data?.status === "active"
        && (
          <Badge variant="processing">
            Processing
          </Badge>
        )}
      </dd>
    </>
  );
}
