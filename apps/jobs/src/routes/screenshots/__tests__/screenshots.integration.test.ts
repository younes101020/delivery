import { testClient } from "hono/testing";
import * as HttpStatusPhrases from "stoker/http-status-phrases";
import { describe, expect } from "vitest";
import { ZodIssueCode } from "zod";

import createApp from "@/lib/create-app";

import router from "../screenshots.index";
import { it } from "./fixtures";

const client = testClient(createApp().route("/", router));

describe("screenshots routes / integration test", () => {
  it("post /screenshots validates the url", async () => {
    const response = await client.screenshots.$post(
      {
        json: { url: "not-an-url", applicationId: 1 },
      },
    );
    expect(response.status).toBe(422);
    if (response.status === 422) {
      const json = await response.json();
      expect(json.error.issues[0].code).toBe(ZodIssueCode.invalid_string);
    }
  });

  it("post /screenshots validates the application id", async () => {
    const response = await client.screenshots.$post(
      {
        // @ts-expect-error test purpose
        json: { url: "https://validurl.com" },
      },
    );
    expect(response.status).toBe(422);
    if (response.status === 422) {
      const json = await response.json();
      expect(json.error.issues[0].path[0]).toBe("applicationId");
      expect(json.error.issues[0].code).toBe(ZodIssueCode.invalid_type);
    }
  });

  it("post /screenshots returns 404 when the application is not found", async () => {
    const response = await client.screenshots.$post(
      {
        json: { url: "https://validurl.com", applicationId: 1000 },
      },
    );
    expect(response.status).toBe(404);
    if (response.status === 404) {
      const json = await response.json();
      expect(json.message).toBe(HttpStatusPhrases.NOT_FOUND);
    }
  });

  const SCREENSHOT_DELAY = 10000;

  it("post /screenshots returns 200", { timeout: SCREENSHOT_DELAY }, async ({ registeredApplicationId }) => {
    const response = await client.screenshots.$post(
      {
        json: { url: "https://habbo.com", applicationId: registeredApplicationId },
      },
    );
    expect(response.status).toBe(200);
  });

  it("post /screenshots returns 200 with the image url of the taken screenshot in webp format", { timeout: SCREENSHOT_DELAY }, async ({ registeredApplicationId }) => {
    const response = await client.screenshots.$post(
      {
        json: { url: "https://habbo.com", applicationId: registeredApplicationId },
      },
    );
    expect(response.status).toBe(200);
    if (response.status === 200) {
      const json = await response.json();
      expect(json.imageUrl.endsWith(".webp")).toBe(true);
    }
  });
});
