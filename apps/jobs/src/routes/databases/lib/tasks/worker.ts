import { type Job, UnrecoverableError } from "bullmq";

import { jobs as createDbJobs } from "./create-database/jobs";
import { jobs as removeDbJobs } from "./remove-database/jobs";
import { jobs as startDbJobs } from "./start-database/jobs";
import { jobs as stopDbJobs } from "./stop-database/jobs";

// This processor will timeout in 15 minutes.
const MAX_TTL = 900_000;

const jobs = Object.assign({}, createDbJobs, startDbJobs, stopDbJobs, removeDbJobs);

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
