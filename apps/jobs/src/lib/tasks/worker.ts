import { type Job, UnrecoverableError } from "bullmq";

import { jobs } from "./deploy/jobs";
import { jobCanceler } from "./utils";

export default async function Worker(job: Job) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), job.data.timeout);
  const processor = jobs[job.name];
  const signal = jobCanceler.createSignal(job.id!);
  try {
    if (!processor) {
      throw new UnrecoverableError(`No processor found for job: ${job.name}`);
    }
    return processor(job, signal);
  }
  finally {
    clearTimeout(timer);
  }
}
