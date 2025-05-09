import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter.js";
import { HonoAdapter } from "@bull-board/hono";
import { serveStatic } from "@hono/node-server/serve-static";
import { Queue } from "bullmq";

import { PREFIX } from "@/routes/deployments/lib/tasks/const";

import type { AppOpenAPI } from "./types";

import { connection, getBullConnection } from "./tasks/utils";

const BASE_PATH = "/bull-board-ui";
const DEPLOYED_APP_NAME = "example-nextjs-15";

export default function configureBullBoard(app: AppOpenAPI) {
  const serverAdapter = new HonoAdapter(serveStatic);
  const monitoredQueue = getPredefinedDeploymentQueue();
  createBullBoard({
    queues: [new BullMQAdapter(monitoredQueue)],
    serverAdapter,
  });
  serverAdapter.setBasePath(BASE_PATH);
  app.route(BASE_PATH, serverAdapter.registerPlugin());
}

/*
    This is a predefined queue.
    If you want to monitor your own queues, you need to create it.
*/
export function getPredefinedDeploymentQueue() {
  return new Queue(DEPLOYED_APP_NAME, { connection: getBullConnection(connection), prefix: PREFIX });
}
