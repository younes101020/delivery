import type { JobFn } from "../../types";

export const build: JobFn<"build"> = async (job) => {
  return job;
};
