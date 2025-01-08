import { Job, Queue, QueueEvents } from "bullmq";
import { streamSSE } from "hono/streaming";
import * as HttpStatusCodes from "stoker/http-status-codes";
import * as HttpStatusPhrases from "stoker/http-status-phrases";

import type { AppRouteHandler } from "@/lib/types";

import { getApplicationByName } from "@/db/queries";
import { connection } from "@/lib/tasks";
import { startDeploy } from "@/lib/tasks/deploy";
import { prepareDataForProcessing } from "@/lib/tasks/deploy/jobs";

import type { CreateRoute, StreamRoute } from "./deployments.routes";

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

const queueEventsMap = new Map<string, QueueEvents>();

export const streamLog: AppRouteHandler<StreamRoute> = async (c) => {
  const { slug } = c.req.valid("param");

  const queue = new Queue(slug, { connection: connection.duplicate() });

  let queueEvents = queueEventsMap.get(slug);
  if (!queueEvents) {
    queueEvents = new QueueEvents(slug, { connection: connection.duplicate() });
    queueEventsMap.set(slug, queueEvents);
  }
  const activeJobsCount = await queue.getActiveCount();
  const activeJobs = await queue.getJobs("active");

  if (activeJobsCount === 0 || !activeJobsCount) {
    const hasBeenDeployed = await getApplicationByName(slug);
    if (hasBeenDeployed) {
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

  const activeJobName = activeJobs[0].name;

  return streamSSE(c, async (stream) => {
    async function progressHandler({ data, jobId }: { data: number | object; jobId: string }) {
      const jobState = await Job.fromId(queue, jobId);
      const sseData = JSON.stringify({
        jobName: jobState?.name,
        ...(typeof data === "object" && "logs" in data ? { logs: data.logs } : {}),
      });
      await stream.writeSSE({
        data: sseData,
        event: `${slug}-deployment-logs`,
      });
    }

    async function completeHandler(job: { jobId: string }) {
      const jobState = await Job.fromId(queue, job.jobId);
      if (jobState?.name === "configure") {
        const applicationId = jobState.returnvalue;
        await stream.writeSSE({
          data: JSON.stringify({ completed: true, id: applicationId }),
          event: `${slug}-deployment-logs`,
        });
      }
    }

    queueEvents.on("progress", progressHandler);
    queueEvents.on("completed", completeHandler);

    stream.onAbort(() => {
      queueEvents.removeListener("progress", progressHandler);
      queueEvents.removeListener("completed", completeHandler);
    });

    await stream.writeSSE({
      data: JSON.stringify({ jobName: activeJobName }),
      event: `${slug}-deployment-logs`,
    });

    while (true) {
      await stream.sleep(4000);
    }
    // casting cause: no typescript support for sse in hono https://github.com/honojs/hono/issues/3309
  }) as any;
};
