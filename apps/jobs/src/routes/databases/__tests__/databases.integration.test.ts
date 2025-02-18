import { testClient } from "hono/testing";
import { describe, expect } from "vitest";

import createApp from "@/lib/create-app";

import router from "../databases.index";
import { it } from "./fixtures";

const client = testClient(createApp().route("/", router));

describe("databases routes", async () => {
  it("post /databases validates the database choice", async () => {
    const response = await client.databases.$post(
      {
        json: {
          // @ts-expect-error test purpose
          type: "non-existent-db-type",
        },
      },
    );
    expect(response.status).toBe(422);
    if (response.status === 422) {
      const json = await response.json();
      expect(json.error.issues[0].path[0]).toBe("type");
    }
  });
});
