import { describe, expect, it } from "vitest";

import { getEnvironmentVariablesByKeys } from "../utils";

describe("database utils unit tests", () => {
  it("get delivery version from image reference", () => {
    const dbEnvVars = [
      "DB_USER=admin",
      "DB_PASSWORD=secret",
      "random_var=123",
      "random_var2=456",
    ];
    const dbEnvVarKeys = [
      "DB_USER",
      "DB_PASSWORD",
    ];
    const deliveryVersion = getEnvironmentVariablesByKeys(dbEnvVars, dbEnvVarKeys);
    expect(deliveryVersion).toStrictEqual([
      "DB_USER=admin",
      "DB_PASSWORD=secret",
    ]);
  });
});
