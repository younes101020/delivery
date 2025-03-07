export type Resources = "deployment" | "database";

export const prefix = {
  DEPLOYMENT: "deployment",
  DATABASE: "database",
  APPLICATION: "application",
} as const;

export const queueNames = {
  START: "start",
  STOP: "stop",
  CREATE: "create",
} as const;
