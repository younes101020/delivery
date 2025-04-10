import { Job, Queue, QueueEvents } from "bullmq";
import { streamSSE } from "hono/streaming";
import * as HttpStatusCodes from "stoker/http-status-codes";
import * as HttpStatusPhrases from "stoker/http-status-phrases";

import type { AppRouteHandler } from "@/lib/types";

import { getApplicationByName } from "@/db/queries/queries";
import { subscribeWorkerTo } from "@/routes/deployments/lib/tasks";
import { startDeploy } from "@/routes/deployments/lib/tasks/deploy";
import { prepareDataForProcessing } from "@/routes/deployments/lib/tasks/deploy/jobs/utils";
import { checkIfOngoingDeploymentExist, getCurrentDeploymentsState, getJobs } from "@/routes/deployments/lib/tasks/deploy/utils";
import { connection, getBullConnection, jobCanceler } from "@/routes/deployments/lib/tasks/utils";

import type { CancelRoute, CreateRoute, GetCurrentDeploymentStep, RetryRoute, StreamPreview, StreamRoute } from "./deployments.routes";

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

export const streamPreview: AppRouteHandler<StreamPreview> = async (c) => {
  const { queueName } = c.req.valid("param");
  const queue = new Queue(queueName, { connection: getBullConnection(connection) });
  const ongoingDeploymentExist = await checkIfOngoingDeploymentExist(queue);

  if (!ongoingDeploymentExist) {
    const hasAlreadyBeenDeployed = await getApplicationByName(queueName);
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

  const queueEvents = new QueueEvents(queueName, { connection: getBullConnection(connection) });
  const job = await getJobs(queue);

  return streamSSE(c, async (stream) => {
    await stream.writeSSE({
      data: JSON.stringify({ step: job.name, status: await job.getState() }),
    });

    async function activeHandler(job: { jobId: string }) {
      const jobState = await Job.fromId(queue, job.jobId);
      await stream.writeSSE({
        data: JSON.stringify({ step: jobState?.name, status: "active" }),
      });
    }

    async function failedHandler({ jobId }: { jobId: string }) {
      const jobState = await Job.fromId(queue, jobId);
      await stream.writeSSE({
        data: JSON.stringify({ step: jobState?.name, status: "failed" }),
      });
    }

    async function completedHandler({ jobId }: { jobId: string }) {
      const jobState = await Job.fromId(queue, jobId);
      const isLastDeploymentStep = jobState?.name === "configure";
      if (isLastDeploymentStep) {
        await stream.writeSSE({
          data: JSON.stringify({ step: jobState?.name, status: "completed" }),
        });
      }
    }

    queueEvents.on("active", activeHandler);
    queueEvents.on("failed", failedHandler);
    queueEvents.on("completed", completedHandler);

    stream.onAbort(() => {
      queueEvents.removeListener("active", activeHandler);
      queueEvents.removeListener("failed", failedHandler);
      queueEvents.on("completed", completedHandler);
    });

    while (true) {
      await stream.sleep(4000);
    }
    // casting cause: no typescript support for sse in hono https://github.com/honojs/hono/issues/3309
  }) as any;
};

export const streamLog: AppRouteHandler<StreamRoute> = async (c) => {
  const { queueName } = c.req.valid("param");
  const queue = new Queue(queueName, { connection: getBullConnection(connection) });
  const ongoingDeploymentExist = await checkIfOngoingDeploymentExist(queue);

  if (!ongoingDeploymentExist) {
    const hasAlreadyBeenDeployed = await getApplicationByName(queueName);
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

  const queueEvents = new QueueEvents(queueName, { connection: getBullConnection(connection) });
  const { name, data, id } = await getJobs(queue);

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
      const jobState = await Job.fromId(queue, jobId);
      await stream.writeSSE({
        data: JSON.stringify({ jobName: jobState?.name, logs: jobState?.data.logs, isCriticalError: true, jobId }),
      });
    }

    queueEvents.on("progress", progressHandler);
    queueEvents.on("completed", completeHandler);
    queueEvents.on("failed", failedHandler);

    stream.onAbort(() => {
      queueEvents.removeListener("progress", progressHandler);
      queueEvents.removeListener("completed", completeHandler);
      queueEvents.removeListener("failed", failedHandler);
    });

    while (true) {
      await stream.sleep(4000);
    }
    // casting cause: no typescript support for sse in hono https://github.com/honojs/hono/issues/3309
  }) as any;
};

export const getCurrentDeploymentsStep: AppRouteHandler<GetCurrentDeploymentStep> = async (c) => {
  const currentDeploymentsState = await getCurrentDeploymentsState();

  return c.json(currentDeploymentsState);
};

export const retryJob: AppRouteHandler<RetryRoute> = async (c) => {
  const { jobId } = c.req.valid("param");
  const { queueName } = c.req.valid("json");
  const queue = new Queue(queueName, { connection: getBullConnection(connection) });
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
  await subscribeWorkerTo(queueName);

  return c.json(
    { response },
    HttpStatusCodes.OK,
  );
};

export const cancelJob: AppRouteHandler<CancelRoute> = async (c) => {
  const { jobId } = c.req.valid("param");
  const { queueName } = c.req.valid("json");
  const queue = new Queue(queueName, { connection: getBullConnection(connection) });
  const job = await Job.fromId(queue, jobId);

  if (!job) {
    return c.json(
      {
        message: HttpStatusPhrases.NOT_FOUND,
      },
      HttpStatusCodes.NOT_FOUND,
    );
  }

  jobCanceler.cancel(jobId);

  return c.body(null, HttpStatusCodes.NO_CONTENT);
};
