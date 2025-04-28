import { testClient } from "hono/testing";
import { describe, expect } from "vitest";
import { ZodIssueCode } from "zod";

import createApp from "@/lib/create-app";

import router from "../screenshots.index";
import { it } from "./fixtures";

const client = testClient(createApp().route("/", router));

describe("screenshots routes / integration test", () => {
  it("post /screenshots validates the url", async ({ registeredApplicationName }) => {
    const response = await client.screenshots.$post(
      {
        json: { url: "not-an-url", applicationName: registeredApplicationName },
      },
    );
    expect(response.status).toBe(422);
    if (response.status === 422) {
      const json = await response.json();
      expect(json.error.issues[0].code).toBe(ZodIssueCode.invalid_string);
    }
  });

  it("post /screenshots validates the application name", async () => {
    const response = await client.screenshots.$post(
      {
        // @ts-expect-error test purpose
        json: { url: "https://validurl.com" },
      },
    );
    expect(response.status).toBe(422);
    if (response.status === 422) {
      const json = await response.json();
      expect(json.error.issues[0].path[0]).toBe("applicationName");
      expect(json.error.issues[0].code).toBe(ZodIssueCode.invalid_type);
    }
  });

  const SCREENSHOT_DELAY = 10000;

  it("post /screenshots returns 200", { timeout: SCREENSHOT_DELAY }, async ({ registeredApplicationName }) => {
    const response = await client.screenshots.$post(
      {
        json: { url: "https://habbo.com", applicationName: registeredApplicationName },
      },
    );
    expect(response.status).toBe(200);
  });

  it("post /screenshots returns 200 with the image url of the taken screenshot in webp format", { timeout: SCREENSHOT_DELAY }, async ({ registeredApplicationName }) => {
    const response = await client.screenshots.$post(
      {
        json: { url: "https://habbo.com", applicationName: registeredApplicationName },
      },
    );
    expect(response.status).toBe(200);
    if (response.status === 200) {
      const json = await response.json();
      expect(json.imageUrl.endsWith(".webp")).toBe(true);
    }
  });
});
