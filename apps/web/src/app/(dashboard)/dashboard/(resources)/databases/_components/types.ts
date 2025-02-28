export interface DatabaseStatusData {
  status: string;
  jobID: string;
  containerId: string;
  queueName: "start" | "stop" | "create";
}
