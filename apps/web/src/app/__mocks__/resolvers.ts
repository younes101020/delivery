import { HttpResponse } from "msw";

export function isLatestVersionResolver() {
  return HttpResponse.json({
    version: "1.0.0",
    imageDigest: "sha256:1234567890abcdef",
    isLatest: true,
  });
}

export function isOutdatedVersionResolver() {
  return HttpResponse.json({
    version: "1.0.0",
    imageDigest: "sha256:1234567890abcdef",
    isLatest: false,
  });
}

export async function updateVersionResolver() {
  return HttpResponse.json({
    version: "2.0.0",
  });
}
