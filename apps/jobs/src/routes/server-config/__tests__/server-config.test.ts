import { afterEach, describe, expect, vi } from "vitest";

import {
  getDeliveryWebContainerInfo,
  toWebContainerConfig,
} from "../lib/remote-docker/utils";
import { it } from "./fixtures";

describe("server configuration tests", () => {
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

    const webDeliveryConfigContainer = toWebContainerConfig({
      webContainerName: "mydeliverydashboard.com",
      traefikLabel: newHostnameLabels,
      currentDeliveryWebConfigContainer: deliveryWebConfigContainer,
    });

    expect(webDeliveryConfigContainer).toEqual(
      expect.objectContaining({
        Labels: expect.objectContaining(newHostnameLabels),
      }),
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });
});

vi.mock("@/lib/remote-docker", async (importOriginal) => {
  return {
    ...await importOriginal(),
    getDocker: async () => {
      return {
        getContainer: () => ({
          inspect: async () => ({
            Created: "2023-10-01T00:00:00Z",
            Config: {
              Labels: {
                "traefik.http.routers.web.rule": "Host(`mydeliverydashboard.com`)",
              },
            },
          }),
        }),
        listContainers: async () => {
          return [
            {
              Id: "1234567890abcdef",
              Names: ["/mydeliverydashboard.com"],
              State: "running",
            },
          ];
        },
      };
    },
  };
});
