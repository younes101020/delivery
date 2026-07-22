import * as HttpStatusCodes from "stoker/http-status-codes";

import type { AppRouteHandler } from "@/lib/types";

import type { PullRoute, StartStackRoute } from "./hub.routes";

import { pullImage } from "./lib/remote-docker/image-tasks";
import { startForgeStack } from "./lib/remote-docker/stack-tasks";

export const pull: AppRouteHandler<PullRoute> = async (c) => {
  const { image } = c.req.valid("json");

  await pullImage({ image });

  return c.json({ image }, HttpStatusCodes.OK);
};

export const startStack: AppRouteHandler<StartStackRoute> = async (c) => {
  const stack = c.req.valid("json");
  const results = await startForgeStack(stack);

  return c.json({ results }, HttpStatusCodes.OK);
};
