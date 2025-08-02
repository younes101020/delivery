import { describe, expect } from "vitest";

import { getImageDigest, getVersionFromImageName } from "../utils";
import { it } from "./fixtures";

describe("delivery version utils unit tests", () => {
  it("get delivery version from image name", ({ imageName, versionSchema }) => {
    const deliveryVersion = getVersionFromImageName(imageName);
    const deliveryVersionData = versionSchema.safeParse(deliveryVersion);
    expect(deliveryVersionData.success).toBe(true);
  });
  it("get delivery image digest from image name", ({ imageDigestSchema, fullImageName }) => {
    const deliveryImageDigest = getImageDigest(fullImageName);
    const deliveryImageDigestData = imageDigestSchema.safeParse(deliveryImageDigest);
    expect(deliveryImageDigestData.success).toBe(true);
  });
});
