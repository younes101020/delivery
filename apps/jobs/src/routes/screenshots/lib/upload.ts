import type { Buffer } from "node:buffer";

import { HTTPException } from "hono/http-exception";
import * as HttpStatusCodes from "stoker/http-status-codes";

import env from "@/env";

import { bucket, minioClient } from "./utils";

export async function upload(applicationName: string, buffer: Buffer) {
  const filename = `${applicationName}.webp`;
  await minioClient.putObject(bucket, filename, buffer, buffer.length, {
    "Content-Type": "image/webp",
  })
    .catch((err) => {
      throw new HTTPException(HttpStatusCodes.INTERNAL_SERVER_ERROR, {
        message: err instanceof Error ? err.message : "Error uploading image to MinIO",
      });
    });

  return `${env.MINIO_PUBLIC_DOMAIN}/${bucket}/${filename}`;
}
