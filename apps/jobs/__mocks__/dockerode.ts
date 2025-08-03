import { vi } from "vitest";

const Docker = vi.fn(function () {
  this.listServices = vi.fn().mockResolvedValue([
    {
      ID: "service-id",
      inspect: vi.fn().mockResolvedValue({
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
      }),
      Spec: 1,
    },
  ]);
});

export default Docker;
