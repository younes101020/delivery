import type { Buffer } from "node:buffer";

import env from "@/env";

import { bucket, minioClient } from "./utils";

export async function upload(applicationName: string, buffer: Buffer) {
  const filename = `${applicationName}.webp`;
  await minioClient.putObject(bucket, filename, buffer, buffer.length, {
    "Content-Type": "image/webp",
  });

  return `${env.MINIO_PUBLIC_DOMAIN}/${bucket}/${filename}`;
}
