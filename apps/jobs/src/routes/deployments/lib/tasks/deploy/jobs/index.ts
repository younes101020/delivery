import type { QueueDeploymentJobFns } from "../types";

import { build } from "./build";
import { clone } from "./clone";
import { configure } from "./configure";

export const jobs: QueueDeploymentJobFns = {
  clone,
  build,
  configure,
};
