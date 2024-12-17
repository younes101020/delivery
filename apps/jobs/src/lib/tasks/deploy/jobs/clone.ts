import type { JobFn } from "../../types";

export const clone: JobFn<"clone"> = async (job) => {
  return job;
};
