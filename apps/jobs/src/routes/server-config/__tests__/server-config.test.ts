import { afterEach, describe, expect, vi } from "vitest";

import { createDeliveryWebConfigContainerWithHostnameLabel, getDeliveryWebContainerInfo } from "../lib/remote-docker/utils";
import { it } from "./fixtures";

describe("server configuration tests", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should return the delivery web container info", async () => {
    const deliveryWebContainerInfo = await getDeliveryWebContainerInfo();

    expect(deliveryWebContainerInfo).toEqual(
      expect.objectContaining({
        Created: expect.any(String),
      }),
    );
  });

  it("should create container config object with new hostname labels", async ({ deliveryWebConfigContainer }) => {
    const newHostnameLabels = { "traefik.http.routers.web.rule": "Host(`mydeliverydashboard.com`)" };

    const webDeliveryConfigContainer = createDeliveryWebConfigContainerWithHostnameLabel(deliveryWebConfigContainer, newHostnameLabels);

    expect(webDeliveryConfigContainer).toEqual(
      expect.objectContaining({
        Labels: expect.objectContaining(newHostnameLabels),
      }),
    );
  });
});
