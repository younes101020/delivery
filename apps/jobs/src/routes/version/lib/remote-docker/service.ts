import type { ContainerTaskSpec } from "dockerode";

import { HTTPException } from "hono/http-exception";
import * as HttpStatusCodes from "stoker/http-status-codes";
import * as HttpStatusPhrases from "stoker/http-status-phrases";

import { getSwarmServiceById, getSwarmServicesByName } from "@/lib/remote-docker/utils";

import { getLatestDeliveryVersion } from "../github";
import { DELIVERY_JOBS_IMAGE_NAME, DELIVERY_JOBS_SERVICE_NAME, DELIVERY_WEB_IMAGE_NAME, DELIVERY_WEB_SERVICE_NAME } from "./const";
import { getVersionFromImageRef } from "./utils";

export async function getDeliveryServiceVersionInfo() {
  const deliveryServices = await getSwarmServicesByName([DELIVERY_WEB_SERVICE_NAME]);
  const deliveryService = deliveryServices[0];

  if (!deliveryService.Spec)
    throw new HTTPException(HttpStatusCodes.NOT_FOUND, { message: HttpStatusPhrases.NOT_FOUND });

  const fullImageName = deliveryService.Spec.TaskTemplate ? (deliveryService.Spec.TaskTemplate as ContainerTaskSpec).ContainerSpec?.Image : "Unknown";

  const deliveryVersion = getVersionFromImageRef(fullImageName || "");

  return {
    version: deliveryVersion,
  };
}

export async function updateDeliveryVersion() {
  const deliveryServices = await getSwarmServicesByName([
    DELIVERY_WEB_SERVICE_NAME,
    DELIVERY_JOBS_SERVICE_NAME,
  ]);
  const latestImageVersion = await getLatestDeliveryVersion();

  for (const deliveryService of deliveryServices) {
    if (!deliveryService.Spec)
      throw new HTTPException(HttpStatusCodes.NOT_FOUND, { message: HttpStatusPhrases.NOT_FOUND });

    const deliveryServiceImageName = deliveryService.Spec.Name?.includes("web") ? DELIVERY_WEB_IMAGE_NAME : DELIVERY_JOBS_IMAGE_NAME;

    const updatedImageReference = `${deliveryServiceImageName}:${latestImageVersion}-latest`;

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
  }

  return latestImageVersion;
}

export async function isDeliveryServicesUpdating() {
  const deliveryServices = await getSwarmServicesByName(
    [DELIVERY_WEB_SERVICE_NAME, DELIVERY_JOBS_SERVICE_NAME],
  );
  return deliveryServices.some(s => s.UpdateStatus?.State === "updating");
}
