export const state = {
  stop: "stop",
  start: "running",
  create: "created",
  remove: "removed",
};

export const variants = {
  stop: "failed",
  start: "active",
  create: "default",
  running: "active",
  paused: "default",
  exited: "failed",
  dead: "failed",
  restarting: "active",
  remove: "failed",
  created: "default",
} as const;
