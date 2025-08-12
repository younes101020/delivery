import { describe, expect } from "vitest";

import { getVersionFromImageRef } from "../utils";
import { it } from "./fixtures";

describe("delivery version utils unit tests", () => {
  it("get delivery version from image reference", ({ imageName, versionSchema }) => {
    const deliveryVersion = getVersionFromImageRef(imageName);
    const deliveryVersionData = versionSchema.safeParse(deliveryVersion);
    expect(deliveryVersionData.success).toBe(true);
  });
});
