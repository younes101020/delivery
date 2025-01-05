import { Job, Queue, QueueEvents } from "bullmq";
import { streamSSE } from "hono/streaming";
import { basename } from "node:path";
import * as HttpStatusCodes from "stoker/http-status-codes";
import * as HttpStatusPhrases from "stoker/http-status-phrases";

import type { AppRouteHandler } from "@/lib/types";

import { db } from "@/db";
import { startDeploy } from "@/lib/tasks/deploy";
import { connection } from "@/lib/tasks/worker";

import type { CreateRoute, StreamRoute } from "./deployments.routes";

export const create: AppRouteHandler<CreateRoute> = async (c) => {
  const deployment = c.req.valid("json");

  const githubApp = await db.query.githubApp.findFirst({
    where(fields, operators) {
      return operators.eq(fields.appId, deployment.githubAppId);
    },
    with: {
      secret: true,
    },
  });

  if (!githubApp) {
    return c.json(
      {
        message: HttpStatusPhrases.NOT_FOUND,
      },
      HttpStatusCodes.NOT_FOUND,
    );
  }

  const queueRef = basename(deployment.repoUrl, ".git");

  const tracking = await startDeploy({
    clone: { ...githubApp, repoUrl: deployment.repoUrl, repoName: queueRef },
    build: { repoName: queueRef, port: deployment.port, env: deployment.env },
    configure: { port: deployment.port },
  });

  return c.json(tracking, HttpStatusCodes.OK);
};

export const streamLog: AppRouteHandler<StreamRoute> = async (c) => {
  return streamSSE(c, async (stream) => {
    const { slug } = c.req.valid("param");

    const queue = new Queue(slug, { connection: connection.duplicate() });
    const queueEvents = new QueueEvents(slug, { connection: connection.duplicate() });
    const activeJobsCount = await queue.getActiveCount();
    if (activeJobsCount === 0 || !activeJobsCount) {
      stream.close();
    }

    const activeJobs = await queue.getJobs("active");
    const activeJob = activeJobs[0];
    await stream.writeSSE({
      data: JSON.stringify({ jobName: activeJob.name }),
      event: `${slug}-deployment-logs`,
    });

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
        await stream.writeSSE({
          data: JSON.stringify({ completed: true }),
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
    while (true) {
      await stream.sleep(4000);
    }
    // casting cause: no typescript support for sse in hono https://github.com/honojs/hono/issues/3309
  }) as any;
};
