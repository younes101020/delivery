import type { QueueEvents } from "bullmq";

import { streamSSE } from "hono/streaming";
import * as HttpStatusCodes from "stoker/http-status-codes";
import * as HttpStatusPhrases from "stoker/http-status-phrases";

import type { AppRouteHandler } from "@/lib/types";

import type { CreateRoute, ListRoute, StopRoute, StreamCurrentDatabaseRoute } from "./databases.routes";

import { getDatabasesContainers, stopDatabaseContainer } from "./lib/remote-docker/utils";
import { startDatabase } from "./lib/tasks/start-database";
import { getDatabaseJobByIdFromQueue, getDatabaseQueueEvents, getInStartingDatabases } from "./lib/tasks/start-database/utils";

export const create: AppRouteHandler<CreateRoute> = async (c) => {
  const databaseJobData = c.req.valid("json");
  await startDatabase(databaseJobData);
  return c.json({ success: true }, HttpStatusCodes.OK);
};

export const list: AppRouteHandler<ListRoute> = async (c) => {
  const dbs = await getDatabasesContainers();
  return c.json(dbs, HttpStatusCodes.OK);
};

export const stop: AppRouteHandler<StopRoute> = async (c) => {
  const { id } = c.req.valid("param");

  await stopDatabaseContainer(id)
    .catch(() => {
      return c.json(
        {
          message: HttpStatusPhrases.NOT_FOUND,
        },
        HttpStatusCodes.NOT_FOUND,
      );
    });

  return c.json(null, HttpStatusCodes.NO_CONTENT);
};

export const streamCurrentDatabase: AppRouteHandler<StreamCurrentDatabaseRoute> = async (c) => {
  const activeInStartingDatabasesJobs = await getInStartingDatabases();

  if (activeInStartingDatabasesJobs.length < 1) {
    return c.json(
      {
        message: HttpStatusPhrases.NOT_FOUND,
      },
      HttpStatusCodes.NOT_FOUND,
    );
  }

  return streamSSE(c, async (stream) => {
    const inMemoryQueueEvents: QueueEvents[] = [];

    for (const activeInStartingDatabasesJob of activeInStartingDatabasesJobs) {
      const queueEvents = getDatabaseQueueEvents(activeInStartingDatabasesJob.database);
      inMemoryQueueEvents.push(queueEvents);
    }

    await stream.writeSSE({
      data: JSON.stringify(activeInStartingDatabasesJobs),
    });

    async function completeHandler({ jobId }: { jobId: string }) {
      const job = await getDatabaseJobByIdFromQueue(jobId);
      await stream.writeSSE({
        data: JSON.stringify({
          id: job?.id,
          timestamp: job?.timestamp,
          database: job?.data.type,
          status: "completed",
        }),
      });
    }

    async function failedHandler({ jobId }: { jobId: string }) {
      const job = await getDatabaseJobByIdFromQueue(jobId);
      await stream.writeSSE({
        data: JSON.stringify({
          id: job?.id,
          timestamp: job?.timestamp,
          database: job?.data.type,
          status: "failed",
        }),
      });
    }

    for (const queueEvents of inMemoryQueueEvents) {
      queueEvents.on("completed", completeHandler);
      queueEvents.on("failed", failedHandler);
    }

    stream.onAbort(() => {
      for (const queueEvents of inMemoryQueueEvents) {
        queueEvents.removeListener("completed", completeHandler);
        queueEvents.removeListener("failed", failedHandler);
      }
    });
    // casting cause: no typescript support for sse in hono https://github.com/honojs/hono/issues/3309
  }) as any;
};
