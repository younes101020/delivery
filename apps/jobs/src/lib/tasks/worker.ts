import type { Job } from "bullmq";

import type { JobDataMap, JobName } from "./types";

import { jobs } from "./deploy/jobs";

export default async function Worker<T extends JobName>(job: Job<JobDataMap[T]> & { name: T }) {
  const processor = jobs[job.name];
  if (!processor) {
    throw new Error(`No processor found for job: ${job.name}`);
  }
  return processor(job);
}
