import { HTTPException } from "hono/http-exception";
import * as Minio from "minio";
import sharp from "sharp";
import * as HttpStatusCodes from "stoker/http-status-codes";

import env from "@/env";

export const minioClient = new Minio.Client({
  endPoint: env.MINIO_ENDPOINT,
  port: env.MINIO_PORT,
  useSSL: false,
  accessKey: env.MINIO_ROOT_USER,
  secretKey: env.MINIO_ROOT_PASSWORD,
});

export const bucket = env.MINIO_BUCKETS;

export async function toWebp(screenshot: Uint8Array) {
  return await sharp(screenshot)
    .webp({ quality: 80 })
    .toBuffer()
    .catch((err) => {
      throw new HTTPException(HttpStatusCodes.INTERNAL_SERVER_ERROR, { message: err instanceof Error ? err.message : "Error converting image to webp" });
    });
}
