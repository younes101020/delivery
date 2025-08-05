import { vi } from "vitest";

const Docker = vi.fn(function () {
  this.listServices = vi.fn().mockResolvedValue([
    {
      ID: "service-id",
      Spec: {
        Name: "test-service",
        Labels: {
          "com.docker.stack.image": "test-image:1.0.0-latest",
        },
        TaskTemplate: {
          ContainerSpec: {
            Image: "test-image:1.0.0-latest@sha256:1234567890abcdef",
          },
        },
      },
      Version: {
        Index: 1,
      },
      update: vi.fn().mockResolvedValue(true),
    },
  ]);
  this.getService = vi.fn().mockImplementation(() => (
    {
      update: vi.fn().mockResolvedValue(""),
    }));
});

export default Docker;
