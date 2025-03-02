export const state = {
  stop: "exited",
  start: "running",
  create: "running",
};

export const variants = {
  stop: "failed",
  start: "active",
  create: "primary",
  running: "active",
  paused: "primary",
  exited: "failed",
  dead: "failed",
  restarting: "active",
  removing: "failed",
  created: "primary",
} as const;
