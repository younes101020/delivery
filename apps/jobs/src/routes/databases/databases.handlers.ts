import type { Buffer } from "node:buffer";

import { streamSSE } from "hono/streaming";
import * as HttpStatusCodes from "stoker/http-status-codes";

import type { AppRouteHandler } from "@/lib/types";

import { patchApplication } from "@/db/queries/queries";
import { getDocker, getDockerResourceEvents } from "@/lib/remote-docker";
import { queueNames } from "@/lib/tasks/const";
import { getJobAndQueueNameByJobId } from "@/lib/tasks/utils";

import type { CreateRoute, LinkRoute, ListRoute, RemoveRoute, StartRoute, StopRoute, StreamCurrentDatabaseRoute } from "./databases.routes";
import type { AllQueueDatabaseJobsData } from "./lib/tasks/types";

import { addEnvironmentVariableToAppService, getDatabaseCredentialsEnvVarsByName } from "./lib/remote-docker/utils";
import { PREFIX } from "./lib/tasks/const";
import { createDatabase } from "./lib/tasks/create-database";
import { removeDatabase } from "./lib/tasks/remove-database";
import { startDatabase } from "./lib/tasks/start-database";
import { stopDatabase } from "./lib/tasks/stop-database";
import { getDatabaseQueuesEvents, getDatabasesActiveJobs } from "./lib/tasks/utils";

export const create: AppRouteHandler<CreateRoute> = async (c) => {
  const databaseJobData = c.req.valid("json");
  await createDatabase(databaseJobData);
  return c.json(null, HttpStatusCodes.ACCEPTED);
};

export const list: AppRouteHandler<ListRoute> = async (c) => {
  const [databases, activeJobs] = await Promise.all([
    getDatabasesContainers(),
    getDatabasesActiveJobs(),
  ]);
  const databasesWithStatus = databases.map((db) => {
    const activeJob = activeJobs.find(job => job.containerId === db.id);
    if (activeJob) {
      return {
        ...db,
        isProcessing: true,
      };
    }
    return db;
  });
  return c.json(databasesWithStatus, HttpStatusCodes.OK);
};

export const stop: AppRouteHandler<StopRoute> = async (c) => {
  const { name } = c.req.valid("param");

  await stopDatabase(name);

  return c.json(null, HttpStatusCodes.ACCEPTED);
};

export const start: AppRouteHandler<StartRoute> = async (c) => {
  const { name } = c.req.valid("param");
  await startDatabase(name);

  return c.json(null, HttpStatusCodes.ACCEPTED);
};

export const remove: AppRouteHandler<RemoveRoute> = async (c) => {
  const { name } = c.req.valid("param");
  await removeDatabase(name);

  return c.json(null, HttpStatusCodes.ACCEPTED);
};

export const streamCurrentDatabase: AppRouteHandler<StreamCurrentDatabaseRoute> = async (c) => {
  return streamSSE(c, async (stream) => {
    const [dbQueuesEvents, containerEventStream] = await Promise.all([
      getDatabaseQueuesEvents(),
      getDockerResourceEvents("database"),
    ]);

    containerEventStream.on("data", onDatabaseContainerEventHandler);

    for (const queueEvents of dbQueuesEvents) {
      queueEvents.on("active", activeHandler);
      queueEvents.on("completed", completeHandler);
      queueEvents.on("failed", failedHandler);
    }

    async function onDatabaseContainerEventHandler(chunk: Buffer) {
      const event = JSON.parse(chunk.toString());
      const processName = event.status === "die" || event.status === "exited" ? "stop" : event.status;
      await stream.writeSSE({
        data: JSON.stringify({
          containerId: event.id,
          processName,
        }),
      });
    }

    async function activeHandler({ jobId }: { jobId: string }) {
      const jobsWithQueueName = await getJobAndQueueNameByJobId<AllQueueDatabaseJobsData>(jobId, queueNames, PREFIX);

      if (jobsWithQueueName?.job) {
        const { job, queueName } = jobsWithQueueName;
        await stream.writeSSE({
          data: JSON.stringify({
            jobId,
            containerId: job?.data.containerId,
            queueName,
            status: "active",
          }),
        });
      }
    }

    async function completeHandler({ jobId }: { jobId: string }) {
      const jobsWithQueueName = await getJobAndQueueNameByJobId<AllQueueDatabaseJobsData>(jobId, queueNames, PREFIX);

      if (jobsWithQueueName?.job) {
        const { job, queueName } = jobsWithQueueName;
        await stream.writeSSE({
          data: JSON.stringify({
            jobId,
            containerId: job?.data.containerId,
            queueName,
            status: "completed",
          }),
        });
        await job.remove();
      }
    }

    async function failedHandler({ jobId }: { jobId: string }) {
      const jobsWithQueueName = await getJobAndQueueNameByJobId<AllQueueDatabaseJobsData>(jobId, queueNames, PREFIX);

      if (jobsWithQueueName?.job) {
        const { job, queueName } = jobsWithQueueName;
        await stream.writeSSE({
          data: JSON.stringify({
            jobId,
            containerId: job?.data.containerId,
            queueName,
            status: "failed",
          }),
        });
      }
    }
    return new Promise((resolve) => {
      stream.onAbort(() => {
        for (const queueEvents of dbQueuesEvents) {
          queueEvents.removeListener("active", activeHandler);
          queueEvents.removeListener("completed", completeHandler);
          queueEvents.removeListener("failed", failedHandler);
        }
        containerEventStream.removeListener("data", onDatabaseContainerEventHandler);
        resolve();
      });
    });
    // casting cause: no typescript support for sse in hono https://github.com/honojs/hono/issues/3309
  }) as any;
};

export const link: AppRouteHandler<LinkRoute> = async (c) => {
  const { name } = c.req.valid("param");
  const { environmentKey, applicationName } = c.req.valid("json");

  const dbCredentialsEnvVars = await getDatabaseCredentialsEnvVarsByName({ name: [name] });

  const postgresUserEnv = dbCredentialsEnvVars.find(envVar => envVar.includes("POSTGRES_USER"));
  const postgresPasswordEnv = dbCredentialsEnvVars.find(envVar => envVar.includes("POSTGRES_PASSWORD"));

  const postgresUser = postgresUserEnv?.split("=")[1];
  const postgresPassword = postgresPasswordEnv?.split("=")[1];

  if (!postgresUser || !postgresPassword)
    return c.json({ error: "Unable to link database" }, HttpStatusCodes.BAD_REQUEST);

  const databaseUrl = `postgres://${postgresUser}:${postgresPassword}@localhost:5432`;

  const docker = await getDocker();

  await Promise.all([
    patchApplication(applicationName, { applicationData: {}, environmentVariable: [{ key: environmentKey, value: databaseUrl }] }),
    addEnvironmentVariableToAppService(applicationName, `${environmentKey}=${databaseUrl}`, docker),
  ]);

  return c.json(null, HttpStatusCodes.OK);
};
