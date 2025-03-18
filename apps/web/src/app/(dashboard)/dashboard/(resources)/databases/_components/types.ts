type processName = "start" | "stop" | "create" | "remove";
export interface DatabaseStatusData {
  status: "completed" | "failed" | "active";
  jobId: string;
  containerId: string;
  queueName: processName;
  processName: processName;
}
