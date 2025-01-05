class ErrorBase<T extends string> extends Error {
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
