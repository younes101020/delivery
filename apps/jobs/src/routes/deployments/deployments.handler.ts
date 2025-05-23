import type { JobProgress } from "bullmq";

import { Job, Queue, QueueEvents } from "bullmq";
import { streamSSE } from "hono/streaming";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as HttpStatusCodes from "stoker/http-status-codes";
import * as HttpStatusPhrases from "stoker/http-status-phrases";

import type { AppRouteHandler } from "@/lib/types";

import { APPLICATIONS_PATH } from "@/lib/constants";
import { ssh } from "@/lib/ssh";
import { connection, getBullConnection, subscribeWorkerTo } from "@/lib/tasks/utils";
import { deployApp, redeployApp } from "@/routes/deployments/lib/tasks/deploy";
import { getCurrentDeploymentCount, getCurrentDeploymentsState, getJobs, getPreviousDeploymentsState } from "@/routes/deployments/lib/tasks/deploy/utils";

import type { CreateRoute, GetCurrentDeploymentStep, GetPreviousDeploymentStep, RedeployRoute, RetryRoute, StreamCurrentDeploymentCount, StreamLogsRoute, StreamPreview } from "./deployments.routes";

import { PREFIX } from "./lib/tasks/const";

export const create: AppRouteHandler<CreateRoute> = async (c) => {
  const deployment = c.req.valid("json");

  const queueName = await deployApp(deployment);

  return c.json({ queueName }, HttpStatusCodes.ACCEPTED);
};

export const redeploy: AppRouteHandler<RedeployRoute> = async (c) => {
  const { queueName } = c.req.valid("param");

  const appName = queueName;

  await ssh(
    "git pull",
    {
      cwd: `${APPLICATIONS_PATH}/${appName}`,
      onStdout: () => Promise.resolve(),
    },
  );

  await redeployApp(queueName);

  return c.json({ queueName }, HttpStatusCodes.ACCEPTED);
};

export const streamPreview: AppRouteHandler<StreamPreview> = async (c) => {
  return streamSSE(c, async (stream) => {
    const { queueName } = c.req.valid("param");
    const queue = new Queue(queueName, { connection: getBullConnection(connection), prefix: PREFIX });

    const queueEvents = new QueueEvents(queueName, { connection: getBullConnection(connection), prefix: PREFIX });
    const job = await getJobs(queue);

    await stream.writeSSE({
      data: JSON.stringify({ step: job.name, status: await job.getState(), repoName: queueName }),
    });

    async function activeHandler(job: { jobId: string }) {
      const jobState = await Job.fromId(queue, job.jobId);
      await stream.writeSSE({
        data: JSON.stringify({ step: jobState?.name, status: "active", repoName: queueName }),
      });
    }

    async function failedHandler({ jobId }: { jobId: string }) {
      const jobState = await Job.fromId(queue, jobId);
      await stream.writeSSE({
        data: JSON.stringify({ step: jobState?.name, status: "failed", repoName: queueName }),
      });
    }

    async function completedHandler({ jobId }: { jobId: string }) {
      const jobState = await Job.fromId(queue, jobId);
      const isLastDeploymentStep = jobState?.name === "configure";
      if (isLastDeploymentStep) {
        await stream.writeSSE({
          data: JSON.stringify({ step: jobState?.name, status: "completed", repoName: queueName }),
        });
      }
    }

    queueEvents.on("active", activeHandler);
    queueEvents.on("failed", failedHandler);
    queueEvents.on("completed", completedHandler);

    return new Promise((resolve) => {
      stream.onAbort(() => {
        queueEvents.removeListener("active", activeHandler);
        queueEvents.removeListener("failed", failedHandler);
        queueEvents.removeListener("completed", completedHandler);
        resolve();
      });
    });
    // casting cause: no typescript support for sse in hono https://github.com/honojs/hono/issues/3309
  }) as any;
};

export const streamLog: AppRouteHandler<StreamLogsRoute> = async (c) => {
  return streamSSE(c, async (stream) => {
    const { queueName } = c.req.valid("param");
    const queue = new Queue(queueName, { connection: getBullConnection(connection), prefix: PREFIX });
    const queueEvents = new QueueEvents(queueName, { connection: getBullConnection(connection), prefix: PREFIX });
    const { name, data, id } = await getJobs(queue);

    await stream.writeSSE({
      data: JSON.stringify({ jobName: name, logs: data.logs, isCriticalError: data.isCriticalError, jobId: id }),
    });

    queueEvents.on("active", activeHandler);
    queueEvents.on("progress", progressHandler);
    queueEvents.on("completed", completeHandler);
    queueEvents.on("failed", failedHandler);

    async function activeHandler({ jobId }: { jobId: string }) {
      const jobState = await Job.fromId(queue, jobId);
      await stream.writeSSE({
        data: JSON.stringify({ jobName: jobState?.name, logs: jobState?.data.logs, isCriticalError: jobState?.data.isCriticalError, jobId }),
      });
    }

    async function progressHandler({ data, jobId }: { data: JobProgress; jobId: string }) {
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

    async function completeHandler({ jobId }: { jobId: string }) {
      const jobState = await Job.fromId(queue, jobId);
      if (jobState?.name === "configure") {
        const applicationId = jobState.returnvalue;
        await stream.writeSSE({
          data: JSON.stringify({ completed: true, appId: applicationId }),
        });
      }
    }

    async function failedHandler({ jobId }: { jobId: string }) {
      const jobState = await Job.fromId(queue, jobId);
      await stream.writeSSE({
        data: JSON.stringify({ jobName: jobState?.name, logs: jobState?.data.logs, isCriticalError: true, jobId }),
      });
    }

    return new Promise((resolve) => {
      stream.onAbort(() => {
        queueEvents.removeListener("active", activeHandler);
        queueEvents.removeListener("progress", progressHandler);
        queueEvents.removeListener("completed", completeHandler);
        queueEvents.removeListener("failed", failedHandler);
        resolve();
      });
    });
    // casting cause: no typescript support for sse in hono https://github.com/honojs/hono/issues/3309
  }) as any;
};

export const getCurrentDeploymentsStep: AppRouteHandler<GetCurrentDeploymentStep> = async (c) => {
  const currentDeploymentsState = await getCurrentDeploymentsState();

  return c.json(currentDeploymentsState);
};

export const streamCurrentDeploymentsCount: AppRouteHandler<StreamCurrentDeploymentCount> = async (c) => {
  return streamSSE(c, async (stream) => {
    const { currentActiveDeploymentCount, activeQueues } = await getCurrentDeploymentCount();
    let inMemoryActiveDeploymentCount = currentActiveDeploymentCount;
    const inMemoryQueueEvents: QueueEvents[] = [];

    for (const activeQueue of activeQueues) {
      const queueEvents = new QueueEvents(activeQueue.name, { connection: getBullConnection(connection), prefix: PREFIX });
      inMemoryQueueEvents.push(queueEvents);
    }
    await stream.writeSSE({
      data: JSON.stringify({ isActiveDeployment: inMemoryActiveDeploymentCount > 0, queryKey: "deployment-tracker" }),
    });

    async function completeHandler() {
      inMemoryActiveDeploymentCount--;
      await stream.writeSSE({
        data: JSON.stringify({ isActiveDeployment: inMemoryActiveDeploymentCount > 0, queryKey: "deployment-tracker" }),
      });
    }

    async function failedHandler() {
      inMemoryActiveDeploymentCount--;
      await stream.writeSSE({
        data: JSON.stringify({ isActiveDeployment: inMemoryActiveDeploymentCount > 0, queryKey: "deployment-tracker" }),
      });
    }

    async function activeHandler() {
      inMemoryActiveDeploymentCount++;
      await stream.writeSSE({
        data: JSON.stringify({ isActiveDeployment: true, queryKey: "deployment-tracker" }),
      });
    }

    for (const queueEvents of inMemoryQueueEvents) {
      queueEvents.on("completed", completeHandler);
      queueEvents.on("failed", failedHandler);
      queueEvents.on("active", activeHandler);
    }

    return new Promise((resolve) => {
      stream.onAbort(() => {
        for (const queueEvents of inMemoryQueueEvents) {
          queueEvents.removeListener("completed", completeHandler);
          queueEvents.removeListener("failed", failedHandler);
          queueEvents.removeListener("active", activeHandler);
        }
        resolve();
      });
    });
    // casting cause: no typescript support for sse in hono https://github.com/honojs/hono/issues/3309
  }) as any;
};

export const getPreviousDeploymentStep: AppRouteHandler<GetPreviousDeploymentStep> = async (c) => {
  const previousDeploymentsState = await getPreviousDeploymentsState();

  return c.json(previousDeploymentsState);
};

const processorFile = join(dirname(fileURLToPath(import.meta.url)), "lib/tasks/worker.ts");

export const retryJob: AppRouteHandler<RetryRoute> = async (c) => {
  const { jobId } = c.req.valid("param");
  const { queueName } = c.req.valid("json");
  const queue = new Queue(queueName, { connection: getBullConnection(connection), prefix: PREFIX });
  const faileJob = await Job.fromId(queue, jobId);

  if (!faileJob) {
    return c.json(
      {
        message: HttpStatusPhrases.NOT_FOUND,
      },
      HttpStatusCodes.NOT_FOUND,
    );
  }

  if (faileJob.name === "build") {
    await ssh(
      "git pull",
      {
        cwd: `${APPLICATIONS_PATH}/${queueName}`,
        onStdout: () => Promise.resolve(),
      },
    );
  }

  await faileJob?.retry();
  subscribeWorkerTo(queueName, PREFIX, processorFile);
  return c.json(null, HttpStatusCodes.ACCEPTED);
};
