import { Job, Queue, QueueEvents } from "bullmq";
import { streamSSE } from "hono/streaming";
import { basename } from "node:path";
import * as HttpStatusCodes from "stoker/http-status-codes";
import * as HttpStatusPhrases from "stoker/http-status-phrases";

import type { AppRouteHandler } from "@/lib/types";

import { db } from "@/db";
import { getApplicationByName } from "@/db/queries";
import { startDeploy } from "@/lib/tasks/deploy";
import { transformEnvVars } from "@/lib/tasks/deploy/utils";
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
  const environmentVariables = transformEnvVars(deployment.env);

  const tracking = await startDeploy({
    clone: { ...githubApp, repoUrl: deployment.repoUrl, repoName: queueRef },
    build: {
      repoName: queueRef,
      port: deployment.port,
      env: environmentVariables && environmentVariables.cmdEnvVars,
    },
    configure: {
      application: { port: deployment.port, githubAppId: githubApp.id },
      environmentVariable: environmentVariables && environmentVariables.persistedEnvVars,
    },
  });

  return c.json(tracking, HttpStatusCodes.OK);
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
console.log(activeJobs,"kfkfk")
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
        const { applicationId } = jobState.returnvalue;
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
