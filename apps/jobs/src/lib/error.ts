import { UnrecoverableError } from "bullmq";

export const DEPLOYMENTERRORNAME = {
  clone: "CLONE_APP_ERROR",
  build: "BUILD_APP_ERROR",
  configure: "CONFIGURE_APP_ERROR",
} as const;

export type ErrorNameType = typeof DEPLOYMENTERRORNAME[keyof typeof DEPLOYMENTERRORNAME];

/**
 * Custom error class that extends UnrecoverableError to handle deployment errors
 * with custom retry strategy rather than using BullMQ's built-in mechanism.
 */
export class DeploymentError extends UnrecoverableError {
  constructor({
    name,
    message,
    cause,
  }: {
    name: ErrorNameType;
    message: string;
    cause?: unknown;
  }) {
    super(message);
    this.name = name;
    this.cause = cause;
  }
}
