import { describe, expect } from "vitest";

import { getVersionFromTag } from "../utils";
import { it } from "./fixtures";

describe("github service utils unit tests", () => {
  it("get delivery version from image name", ({ tag, tagSchema }) => {
    const deliveryVersion = getVersionFromTag(tag);
    const deliveryVersionData = tagSchema.safeParse(deliveryVersion);
    expect(deliveryVersionData.success).toBe(true);
  });
});
