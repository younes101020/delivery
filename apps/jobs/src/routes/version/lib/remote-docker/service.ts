import type { ContainerTaskSpec } from "dockerode";

import { HTTPException } from "hono/http-exception";
import * as HttpStatusCodes from "stoker/http-status-codes";
import * as HttpStatusPhrases from "stoker/http-status-phrases";

import { getSwarmServiceById, getSwarmServiceByName } from "@/lib/remote-docker/utils";

import { getLatestDeliveryVersion } from "../github";
import { DELIVERY_WEB_IMAGE_NAME, DELIVERY_WEB_SERVICE_NAME } from "./const";
import { getImageDigest, getVersionFromImageRef } from "./utils";

export async function getDeliveryServiceVersionInfo() {
  const deliveryService = await getSwarmServiceByName(DELIVERY_WEB_SERVICE_NAME);

  if (!deliveryService.Spec)
    throw new HTTPException(HttpStatusCodes.NOT_FOUND, { message: HttpStatusPhrases.NOT_FOUND });

  const imageName = deliveryService.Spec.Labels && deliveryService.Spec.Labels["com.docker.stack.image"];
  const fullImageName = deliveryService.Spec.TaskTemplate ? (deliveryService.Spec.TaskTemplate as ContainerTaskSpec).ContainerSpec?.Image : `${imageName}@none`;

  const deliveryVersion = getVersionFromImageRef(imageName || "");
  const deliveryCurrentImageDigest = getImageDigest(fullImageName || "");

  return {
    version: deliveryVersion,
    deliveryCurrentImageDigest,
  };
}

export async function updateDeliveryVersion() {
  const deliveryService = await getSwarmServiceByName(DELIVERY_WEB_SERVICE_NAME);

  if (!deliveryService.Spec)
    throw new HTTPException(HttpStatusCodes.NOT_FOUND, { message: HttpStatusPhrases.NOT_FOUND });

  const latestImageVersion = await getLatestDeliveryVersion();
  const updatedImageReference = `${DELIVERY_WEB_IMAGE_NAME}:${latestImageVersion}-latest`;

  const version = deliveryService?.Version?.Index;
  const containerSpec = (deliveryService.Spec.TaskTemplate as ContainerTaskSpec).ContainerSpec;
  const taskTemplate = deliveryService.Spec.TaskTemplate;

  const deliveryServiceWithUpdate = await getSwarmServiceById(deliveryService.ID);

  await deliveryServiceWithUpdate.update({
    ...deliveryService.Spec,
    TaskTemplate: {
      ...taskTemplate,
      ContainerSpec: {
        ...containerSpec,
        Image: updatedImageReference,
      },
    },
    version,
  });

  return latestImageVersion;
}
