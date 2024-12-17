import type { Jobs } from "../../types";

import { build } from "./build";
import { clone } from "./clone";

export const jobs: Jobs = {
  clone,
  build,
};
