export const prefix = {
  DEPLOYMENT: "deployment",
  DATABASE: "database",
  APPLICATION: "application",
} as const;

export const queueNames = {
  START: "start",
  STOP: "stop",
  CREATE: "create",
  REMOVE: "remove",
  BACKUP: "backup",
} as const;
