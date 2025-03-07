import { type Job, UnrecoverableError } from "bullmq";

import { jobs as startDbJobs } from "./start-application/jobs";
import { jobs as stopDbJobs } from "./stop-application/jobs";

// This processor will timeout in 15 minutes.
const MAX_TTL = 900_000;

const jobs = Object.assign({}, startDbJobs, stopDbJobs);

export default async function WorkerFactory(job: Job) {
  const hardKillTimeout = setTimeout(() => {
    process.exit(10);
  }, MAX_TTL);
  const processor = jobs[job.name];
  if (!processor) {
    throw new UnrecoverableError(`No processor found for job: ${job.name}`);
  }
  try {
    await processor(job);
  }
  finally {
    clearTimeout(hardKillTimeout);
  }
}
