import type { ContainerInspectInfo } from "dockerode";

import { faker } from "@faker-js/faker";
import { it as base } from "vitest";

interface ServerConfigFixtures {
  deliveryWebConfigContainer: ContainerInspectInfo["Config"];
}

const deliveryWebConfigContainer: ContainerInspectInfo["Config"] = {
  Hostname: faker.string.alphanumeric(12).toLowerCase(),
  Domainname: "",
  User: "",
  AttachStdin: false,
  AttachStdout: true,
  AttachStderr: true,
  ExposedPorts: {
    "443/tcp": {},
    "80/tcp": {},
  },
  Tty: false,
  OpenStdin: false,
  StdinOnce: false,
  Env: [
    `PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin`,
  ],
  Cmd: ["traefik"],
  Image: `traefik:v${faker.system.semver()}`,
  Volumes: {},
  WorkingDir: "/",
  Entrypoint: ["/entrypoint.sh"],
  OnBuild: null,
  Labels: {
    "com.docker.compose.config-hash": faker.string.hexadecimal({ length: 64, casing: "lower" }),
    "com.docker.compose.container-number": "1",
  },
};

export const it = base.extend<ServerConfigFixtures>({
  deliveryWebConfigContainer: async ({}, use) => {
    await use(deliveryWebConfigContainer);
  },
});
