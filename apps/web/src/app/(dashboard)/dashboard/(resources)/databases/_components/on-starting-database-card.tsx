"use client";

import type { Nullable } from "@/app/_lib/utils";

import { useEventSource } from "@/app/_hooks/use-event-source";
import { env } from "@/env";

import { DatabaseCard } from "./database-card";

export type DatabaseData = Nullable<{
  jobId: string;
  containerId: string;
  timestamp: number;
  queueName: string;
  status: "completed" | "failed" | "active";
}>[];

const DEFAULT_STATE: DatabaseData = [{
  jobId: null,
  containerId: null,
  timestamp: null,
  queueName: null,
  status: "active",
}];

export function OnStartingDatabaseCard() {
  const onMessage = (prevDbContainers: DatabaseData, data: DatabaseData) => {
    const existingContainerIds = new Set(data.map(d => d.containerId));
    const filteredPrev = prevDbContainers.filter(prev =>
      prev.containerId && !existingContainerIds.has(prev.containerId),
    );
    return [...filteredPrev, ...data];
  };

  const dbContainers = useEventSource<DatabaseData>({
    eventUrl: `${env.NEXT_PUBLIC_BASEURL}/api/databases-proxy/ongoing`,
    initialState: DEFAULT_STATE,
    onMessage,
  });

  return dbContainers
    .filter(({ jobId, containerId }) => jobId && containerId)
    .map(({ jobId, containerId }) => (
      <DatabaseCard key={jobId} isProcessing={true} id={containerId!} name="" />
    ));
}
