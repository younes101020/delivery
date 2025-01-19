import { UnrecoverableError } from "bullmq";

/**
 * We extend UnrecoverableError to tell BullMQ that we want to handle the retry strategy ourselves,
 * rather than using BullMQ's built-in retry mechanism.
 */
class ErrorBase<T extends string> extends UnrecoverableError {
  name: T;
  message: string;
  cause: any;

  constructor({ name, message, cause }: { name: T; message: string; cause?: any }) {
    super();
    this.name = name;
    this.cause = cause;
    this.message = message;
  }
}

type ErrorName = "BUILD_APP_ERROR" | "CLONE_APP_ERROR" | "CONFIGURE_APP_ERROR";

export class DeploymentError extends ErrorBase<ErrorName> {}
