import type { getApplications } from "../_lib/queries";
import type { getActiveDatabaseServices } from "../../databases/_lib/queries";

type ProcessName = "start" | "stop" | "create" | "remove";

export interface ApplicationStatusData {
  status: "active" | "completed" | "failed";
  jobId: string;
  containerId: string;
  queueName: ProcessName;
  processName: ProcessName;
}

export type Applications = Awaited<ReturnType<typeof getApplications>>;
export type ActiveContainers = Awaited<ReturnType<typeof getActiveDatabaseServices>>;
