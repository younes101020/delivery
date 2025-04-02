import { UnrecoverableError } from "bullmq";

export const DEPLOYMENTERRORNAME = {
  clone: "CLONE_APP_ERROR",
  build: "BUILD_APP_ERROR",
  configure: "CONFIGURE_APP_ERROR",
} as const;

export type ErrorNameType = typeof DEPLOYMENTERRORNAME[keyof typeof DEPLOYMENTERRORNAME];

/**
 * By extending UnrecoverableError, jobs that throw this error will not be retried and will be marked as failed.
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
