import { type Job, UnrecoverableError } from "bullmq";

import { jobs } from "./deploy/jobs";

export default async function Worker(job: Job) {
  const processor = jobs[job.name];
  if (!processor) {
    throw new UnrecoverableError(`No processor found for job: ${job.name}`);
  }
  return processor(job);
}
