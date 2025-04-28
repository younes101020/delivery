import { UnrecoverableError } from "bullmq";

export const DEPLOYMENTERRORNAME = {
  clone: "CLONE_APP_ERROR",
  deployment: "DEPLOYMENT_APP_ERROR",
  configure: "CONFIGURE_APP_ERROR",
} as const;

export const APPLICATIONERRORNAME = {
  start: "START_APP_ERROR",
  stop: "STOP_APP_ERROR",
  remove: "REMOVE_APP_ERROR",
} as const;

export const DATABASEERRORNAME = {
  start: "START_DATABASE_ERROR",
  stop: "STOP_DATABASE_ERROR",
  create: "CREATE_DATABASE_ERROR",
  remove: "REMOVE_DATABASE_ERROR",
} as const;

export type DeploymentErrorNameType = typeof DEPLOYMENTERRORNAME[keyof typeof DEPLOYMENTERRORNAME];
export type DatabaseErrorNameType = typeof DATABASEERRORNAME[keyof typeof DATABASEERRORNAME];
export type ApplicationErrorNameType = typeof APPLICATIONERRORNAME[keyof typeof APPLICATIONERRORNAME];

/**
 * By extending UnrecoverableError, jobs that throw this error will not be retried and will be marked as failed.
 */
export class DeploymentError extends UnrecoverableError {
  constructor({
    name,
    message,
    cause,
  }: {
    name: DeploymentErrorNameType;
    message: string;
    cause?: unknown;
  }) {
    super(message);
    this.name = name;
    this.cause = cause;
  }
}

export class DatabaseError extends UnrecoverableError {
  constructor({
    name,
    message,
    cause,
  }: {
    name: DatabaseErrorNameType;
    message: string;
    cause?: unknown;
  }) {
    super(message);
    this.name = name;
    this.cause = cause;
  }
}

export class ApplicationError extends UnrecoverableError {
  constructor({
    name,
    message,
    cause,
  }: {
    name: ApplicationErrorNameType;
    message: string;
    cause?: unknown;
  }) {
    super(message);
    this.name = name;
    this.cause = cause;
  }
}
