import * as HttpStatusCodes from "stoker/http-status-codes";

import type { AppRouteHandler } from "@/lib/types";

import type { GetImageUrl } from "./screenshots.routes";

import { screenPage } from "./lib/screen-page";
import { upload } from "./lib/upload";

export const getImageUrl: AppRouteHandler<GetImageUrl> = async (c) => {
  const { url, applicationName } = c.req.valid("json");

  const screenshotPngBuffer = await screenPage(url);
  const imageUrl = await upload(applicationName, screenshotPngBuffer);

  return c.json({ imageUrl }, HttpStatusCodes.OK);
};
