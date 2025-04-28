import { type Job, UnrecoverableError } from "bullmq";

import { jobs } from "./deploy/jobs";

// This processor will timeout in 30 minutes.
const MAX_TTL = 1_800_000;

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
