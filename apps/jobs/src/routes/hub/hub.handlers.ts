import * as HttpStatusCodes from "stoker/http-status-codes";

import type { AppRouteHandler } from "@/lib/types";

import type { ListStacksRoute, PullRoute, RemoveStackServiceRoute, StartStackRoute, UpsertStackServiceRoute } from "./hub.routes";

import { pullImage } from "./lib/remote-docker/image-tasks";
import { listForgeStacks, removeForgeStackService, startForgeStack, upsertForgeStackService } from "./lib/remote-docker/stack-tasks";

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

export const listStacks: AppRouteHandler<ListStacksRoute> = async (c) => {
  const projects = await listForgeStacks();
  return c.json({ projects }, HttpStatusCodes.OK);
};

export const upsertStackService: AppRouteHandler<UpsertStackServiceRoute> = async (c) => {
  const result = await upsertForgeStackService(c.req.valid("json"));
  return c.json(result, HttpStatusCodes.OK);
};

export const removeStackService: AppRouteHandler<RemoveStackServiceRoute> = async (c) => {
  const { nodeId } = c.req.valid("param");
  await removeForgeStackService(nodeId);
  return c.json({ nodeId }, HttpStatusCodes.OK);
};
