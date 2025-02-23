import { streamSSE } from "hono/streaming";
import * as HttpStatusCodes from "stoker/http-status-codes";
import * as HttpStatusPhrases from "stoker/http-status-phrases";

import type { AppRouteHandler } from "@/lib/types";

import type { CreateRoute, ListRoute, StartRoute, StopRoute, StreamCurrentDatabaseRoute } from "./databases.routes";

import { getDatabasesContainers } from "./lib/remote-docker/utils";
import { createDatabase } from "./lib/tasks/create-database";
import { getCreateDatabaseQueueEvents, getDatabaseJobByIdFromQueue, getInCreatingDatabasesJobs } from "./lib/tasks/create-database/utils";
import { startDatabase } from "./lib/tasks/start-database";
import { stopDatabase } from "./lib/tasks/stop-database";

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
  const activeInStartingDatabasesJobs = await getInCreatingDatabasesJobs();

  if (activeInStartingDatabasesJobs.length < 1) {
    return c.json(
      {
        message: HttpStatusPhrases.NOT_FOUND,
      },
      HttpStatusCodes.NOT_FOUND,
    );
  }

  const queueEvents = getCreateDatabaseQueueEvents();

  return streamSSE(c, async (stream) => {
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

    queueEvents.on("completed", completeHandler);
    queueEvents.on("failed", failedHandler);

    stream.onAbort(() => {
      queueEvents.removeListener("completed", completeHandler);
      queueEvents.removeListener("failed", failedHandler);
    });
    // casting cause: no typescript support for sse in hono https://github.com/honojs/hono/issues/3309
  }) as any;
};
