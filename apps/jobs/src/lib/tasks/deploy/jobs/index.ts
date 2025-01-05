import type { Jobs } from "../../types";

import { build } from "./build";
import { clone } from "./clone";
import { configure } from "./configure";

export const jobs: Jobs = {
  clone,
  build,
  configure,
};
