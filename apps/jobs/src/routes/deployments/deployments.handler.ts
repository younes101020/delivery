import { Job, Queue, QueueEvents } from "bullmq";
import { streamSSE } from "hono/streaming";
import * as HttpStatusCodes from "stoker/http-status-codes";
import * as HttpStatusPhrases from "stoker/http-status-phrases";

import type { AppRouteHandler } from "@/lib/types";

import { getApplicationByName } from "@/db/queries";
import { createWorker } from "@/lib/tasks";
import { startDeploy } from "@/lib/tasks/deploy";
import { prepareDataForProcessing } from "@/lib/tasks/deploy/jobs";
import { fetchQueueTitles } from "@/lib/tasks/deploy/utils";
import { connection, getBullConnection } from "@/lib/tasks/utils";

import type { CreateRoute, ListRoute, RetryRoute, StreamRoute } from "./deployments.routes";

export const create: AppRouteHandler<CreateRoute> = async (c) => {
  const deployment = c.req.valid("json");

  const data = await prepareDataForProcessing(deployment);

  if (!data) {
    return c.json(
      {
        message: HttpStatusPhrases.NOT_FOUND,
      },
      HttpStatusCodes.NOT_FOUND,
    );
  }

  const queueName = await startDeploy(data);

  return c.json(queueName, HttpStatusCodes.OK);
};

export const streamLog: AppRouteHandler<StreamRoute> = async (c) => {
  const { slug } = c.req.valid("param");

  const queue = new Queue(slug, { connection: getBullConnection(connection) });

  const activeJobsCount = await queue.getActiveCount();
  const failedJobsCount = await queue.getFailedCount();

  const ongoingDeploymentExist = activeJobsCount > 0 || failedJobsCount > 0;

  if (!ongoingDeploymentExist) {
    const hasAlreadyBeenDeployed = await getApplicationByName(slug);
    if (hasAlreadyBeenDeployed) {
      return c.json(
        {
          message: HttpStatusPhrases.GONE,
        },
        HttpStatusCodes.GONE,
      );
    }
    return c.json(
      {
        message: HttpStatusPhrases.NOT_FOUND,
      },
      HttpStatusCodes.NOT_FOUND,
    );
  }

  const queueEvents = new QueueEvents(slug, { connection: getBullConnection(connection) });

  const job = await queue.getJobs(["active", "failed"]).then(jobs => jobs[0]);

  const { name, data, id } = job;

  return streamSSE(c, async (stream) => {
    await stream.writeSSE({
      data: JSON.stringify({ jobName: name, logs: data.logs, isCriticalError: data.isCriticalError, jobId: id }),
    });

    async function progressHandler({ data, jobId }: { data: number | object; jobId: string }) {
      const jobState = await Job.fromId(queue, jobId);
      const sseData = JSON.stringify({
        jobName: jobState?.name,
        ...(typeof data === "object" && "logs" in data ? { logs: data.logs } : {}),
        ...(typeof data === "object" && "isCriticalError" in data ? { isCriticalError: data.isCriticalError } : {}),
      });
      await stream.writeSSE({
        data: sseData,
      });
    }

    async function completeHandler(job: { jobId: string }) {
      const jobState = await Job.fromId(queue, job.jobId);
      if (jobState?.name === "configure") {
        const applicationId = jobState.returnvalue;
        await stream.writeSSE({
          data: JSON.stringify({ completed: true, appId: applicationId }),
        });
      }
    }

    async function failedHandler({ jobId }: { jobId: string }) {
      await stream.writeSSE({
        data: JSON.stringify({ jobId }),

      });
    }

    queueEvents.on("progress", progressHandler);
    queueEvents.on("completed", completeHandler);
    queueEvents.on("failed", failedHandler);

    stream.onAbort(() => {
      queueEvents.removeListener("progress", progressHandler);
      queueEvents.removeListener("completed", completeHandler);
    });

    while (true) {
      await stream.sleep(4000);
    }
    // casting cause: no typescript support for sse in hono https://github.com/honojs/hono/issues/3309
  }) as any;
};

export const list: AppRouteHandler<ListRoute> = async (c) => {
  const queueTitles = await fetchQueueTitles(connection);
  const allJobs = [];

  for (const item of queueTitles) {
    const queue = new Queue(item.queueName, { connection: getBullConnection(connection) });
    const jobs = await queue.getJobs(["active", "failed"]) || [];

    for (const job of jobs) {
      allJobs.push({
        id: job.id,
        name: job.name,
        timestamp: job.timestamp,
        stacktrace: job.stacktrace,
        repoName: item.queueName,
        status: "active",
      });
    }
  }

  return c.json(allJobs);
};

export const retryJob: AppRouteHandler<RetryRoute> = async (c) => {
  const { slug: jobId } = c.req.valid("param");
  const { slug: queueName } = c.req.valid("json");
  const queue = new Queue(queueName, { connection: connection.duplicate() });
  const faileJob = await Job.fromId(queue, jobId);

  if (!faileJob) {
    return c.json(
      {
        message: HttpStatusPhrases.NOT_FOUND,
      },
      HttpStatusCodes.NOT_FOUND,
    );
  }

  const response = await faileJob?.retry();
  await createWorker(queueName);

  return c.json(
    { response },
    HttpStatusCodes.OK,
  );
};
