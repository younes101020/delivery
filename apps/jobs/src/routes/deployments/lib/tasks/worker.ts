import { type Job, UnrecoverableError } from "bullmq";

import { jobs } from "./deploy/jobs";

const MAX_TTL = 1200000; // 20min
const TTL_EXIT_CODE = 10;

export default async function Worker(job: Job) {
  let hasCompleted = false;
  const harKillTimeout = setTimeout(() => {
    if (!hasCompleted) {
      process.exit(TTL_EXIT_CODE);
    }
  }, MAX_TTL);

  const processor = jobs[job.name];

  try {
    if (!processor) {
      throw new UnrecoverableError(`No processor found for job: ${job.name}`);
    }
    await processor(job);
    hasCompleted = true;
  }
  finally {
    clearTimeout(harKillTimeout);
  }
}
