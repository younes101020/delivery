import * as HttpStatusCodes from "stoker/http-status-codes";
import * as HttpStatusPhrases from "stoker/http-status-phrases";

import type { AppRouteHandler } from "@/lib/types";

import { getApplicationNameById } from "@/db/queries/queries";

import type { GetImageUrl } from "./screenshots.routes";

import { screenPage } from "./lib/screen-page";
import { upload } from "./lib/upload";

export const getImageUrl: AppRouteHandler<GetImageUrl> = async (c) => {
  const { url, applicationId } = c.req.valid("json");
  const applicationName = await getApplicationNameById(applicationId);

  if (!applicationName) {
    return c.json(
      {
        message: HttpStatusPhrases.NOT_FOUND,
      },
      HttpStatusCodes.NOT_FOUND,
    );
  }

  const screenshotPngBuffer = await screenPage(url);
  const imageUrl = await upload(applicationName, screenshotPngBuffer);

  return c.json({ imageUrl }, HttpStatusCodes.OK);
};
