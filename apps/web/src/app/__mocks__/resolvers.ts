import { delay, HttpResponse } from "msw";

export function getVersionResolver() {
  return HttpResponse.json({
    version: "1.0.0",
    imageDigest: "sha256:1234567890abcdef",
    isLatest: false,
  });
}

export async function updateVersionResolver() {
  await delay(5000); // Simulate a delay for the update operation
  return HttpResponse.json({
    version: "2.0.0",
  });
}
