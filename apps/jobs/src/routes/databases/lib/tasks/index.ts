import { jobs as createJobs } from "./create-database/jobs";
import { jobs as startJobs } from "./start-database/jobs";
import { jobs as stopJobs } from "./stop-database/jobs";

export const jobs = {
  ...createJobs,
  ...startJobs,
  ...stopJobs,
};
