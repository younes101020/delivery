import { describe, expect, it } from "vitest";

import type { Database } from "../../dto";

import { DATABASE_NODE_CONSTRAINT, databaseDataDirectories } from "../const";
import { createDatabaseServiceSpec } from "../manifest";

describe("database service manifest", () => {
  it.each(Object.entries(databaseDataDirectories))("persists %s at its native data directory", (database, target) => {
    const spec = createDatabaseServiceSpec({
      database: database as Database,
      name: "orders",
      port: 1234,
      initialEnvCreds: [],
    });
    const container = spec.TaskTemplate && "ContainerSpec" in spec.TaskTemplate
      ? spec.TaskTemplate.ContainerSpec
      : undefined;

    expect(container?.Mounts).toContainEqual({
      Type: "volume",
      Source: "delivery-orders-data",
      Target: target,
    });
    expect(spec.TaskTemplate?.Placement?.Constraints).toEqual([DATABASE_NODE_CONSTRAINT]);
    expect(spec.Labels?.["delivery.database.type"]).toBe(database);
  });
});
