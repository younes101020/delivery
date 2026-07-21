import * as HttpStatusCodes from "stoker/http-status-codes";

import type { AppRouteHandler } from "@/lib/types";

import type { PullRoute } from "./hub.routes";

import { pullImage } from "./lib/remote-docker/image-tasks";

export const pull: AppRouteHandler<PullRoute> = async (c) => {
  const { image } = c.req.valid("json");

  await pullImage({ image });

  return c.json({ image }, HttpStatusCodes.OK);
};
