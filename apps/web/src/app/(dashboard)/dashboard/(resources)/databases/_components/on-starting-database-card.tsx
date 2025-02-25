"use client";

import type { Nullable } from "@/app/_lib/utils";

import { useEventSource } from "@/app/_hooks/use-event-source";
import { env } from "@/env";

import { DatabaseCard } from "./database-card";

export type DatabaseData = Nullable<{
  jobId: string;
  containerId: string;
  timestamp: number;
  database: string;
  queueName: string;
  status: "completed" | "failed";
}>[];

const DEFAULT_STATE: DatabaseData = [{
  jobId: null,
  containerId: null,
  timestamp: null,
  database: null,
  queueName: null,
  status: null,
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
    .filter(({ jobId, containerId, database }) => jobId && containerId && database)
    .map(({ jobId, containerId, database }) => (
      <DatabaseCard key={jobId} isProcessing={true} id={containerId!} name={database!} />
    ));
}
