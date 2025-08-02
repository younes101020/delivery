import type { ContainerTaskSpec } from "dockerode";

import { HTTPException } from "hono/http-exception";
import * as HttpStatusCodes from "stoker/http-status-codes";

import { getSwarmServiceByName } from "@/lib/remote-docker/utils";

import { DELIVERY_WEB_SERVICE_NAME } from "./const";
import { getImageDigest, getVersionFromImageName } from "./utils";

export async function getDeliveryServiceVersionInfo() {
  const deliveryService = await getSwarmServiceByName(DELIVERY_WEB_SERVICE_NAME);
  if (!deliveryService.Spec)
    throw new HTTPException(HttpStatusCodes.NOT_FOUND, { message: "Delivery service specification not found." });

  const deliveryServiceInspect = await deliveryService.inspect();

  const imageName = deliveryServiceInspect.Spec.Labels["com.docker.stack.image"];
  const fullImageName = deliveryServiceInspect.Spec.TaskTemplate ? (deliveryServiceInspect.Spec.TaskTemplate as ContainerTaskSpec).ContainerSpec?.Image : `${imageName}@none`;

  const deliveryVersion = getVersionFromImageName(imageName);
  const deliveryCurrentImageDigest = getImageDigest(fullImageName || "");

  return {
    version: deliveryVersion,
    deliveryCurrentImageDigest,
  };
}
