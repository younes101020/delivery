import { streamSSE } from "hono/streaming";
import * as HttpStatusCodes from "stoker/http-status-codes";

import type { AppRouteHandler } from "@/lib/types";

import type { CreateRoute, ListRoute, StartRoute, StopRoute, StreamCurrentDatabaseRoute } from "./databases.routes";

import { getDatabasesContainers } from "./lib/remote-docker/utils";
import { createDatabase } from "./lib/tasks/create-database";
import { startDatabase } from "./lib/tasks/start-database";
import { stopDatabase } from "./lib/tasks/stop-database";
import { getDatabaseJobByIdFromQueue, getDatabaseQueuesEvents, getDatabasesActiveJobs } from "./lib/tasks/utils";

export const create: AppRouteHandler<CreateRoute> = async (c) => {
  const databaseJobData = c.req.valid("json");
  await createDatabase(databaseJobData);
  return c.json(null, HttpStatusCodes.ACCEPTED);
};

export const list: AppRouteHandler<ListRoute> = async (c) => {
  const dbs = await getDatabasesContainers();
  return c.json(dbs, HttpStatusCodes.OK);
};

export const stop: AppRouteHandler<StopRoute> = async (c) => {
  const { id } = c.req.valid("param");

  await stopDatabase(id);

  return c.json(null, HttpStatusCodes.ACCEPTED);
};

export const start: AppRouteHandler<StartRoute> = async (c) => {
  const { id } = c.req.valid("param");
  await startDatabase(id);

  return c.json(null, HttpStatusCodes.ACCEPTED);
};

export const streamCurrentDatabase: AppRouteHandler<StreamCurrentDatabaseRoute> = async (c) => {
  return streamSSE(c, async (stream) => {
    const activeDatabasesJobs = await getDatabasesActiveJobs();

    if (activeDatabasesJobs.length > 0) {
      await stream.writeSSE({
        data: JSON.stringify(activeDatabasesJobs),
      });
    }

    const dbQueuesEvents = await getDatabaseQueuesEvents();

    for (const queueEvents of dbQueuesEvents) {
      queueEvents.on("active", activeHandler);
      queueEvents.on("completed", completeHandler);
      queueEvents.on("failed", failedHandler);
    }

    stream.onAbort(() => {
      for (const queueEvents of dbQueuesEvents) {
        queueEvents.removeListener("active", activeHandler);
        queueEvents.removeListener("completed", completeHandler);
        queueEvents.removeListener("failed", failedHandler);
      }
    });

    async function activeHandler({ jobId }: { jobId: string }) {
      const job = await getDatabaseJobByIdFromQueue(jobId);
      await stream.writeSSE({
        data: JSON.stringify([{
          jobId,
          containerId: job?.data.containerId,
          timestamp: job?.timestamp,
          database: job?.data.type,
          queueName: activeDatabasesJobs.find(j => j.jobId === jobId)?.queueName,
          status: "completed",
        }]),
      });
    }

    async function completeHandler({ jobId }: { jobId: string }) {
      const job = await getDatabaseJobByIdFromQueue(jobId);
      await stream.writeSSE({
        data: JSON.stringify({
          jobId,
          timestamp: job?.timestamp,
          database: job?.data.type,
          queueName: activeDatabasesJobs.find(j => j.jobId === jobId)?.queueName,
          status: "completed",
        }),
      });
    }

    async function failedHandler({ jobId }: { jobId: string }) {
      const job = await getDatabaseJobByIdFromQueue(jobId);
      await stream.writeSSE({
        data: JSON.stringify({
          jobId,
          timestamp: job?.timestamp,
          database: job?.data.type,
          queueName: activeDatabasesJobs.find(j => j.jobId === jobId)?.queueName,
          status: "failed",
        }),
      });
    }
    // casting cause: no typescript support for sse in hono https://github.com/honojs/hono/issues/3309
  }) as any;
};
