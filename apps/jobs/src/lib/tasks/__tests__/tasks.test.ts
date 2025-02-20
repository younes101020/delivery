import Redis from "ioredis";
import { describe, expect, it } from "vitest";

import { connection, getBullConnection } from "../utils";

describe("tasks unit tests", () => {
  it("return cached redis connection if exists", () => {
    const connection1 = getBullConnection(connection);
    const connection2 = getBullConnection(connection);

    expect(connection1).toBe(connection2);
  });

  it("return redis instance if redis is passed", () => {
    const connection1 = getBullConnection(connection);

    expect(connection1).toBeInstanceOf(Redis);
  });
});
