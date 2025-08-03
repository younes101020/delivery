// Allow HTTP mocking in development environment
export async function register() {
  // eslint-disable-next-line node/no-process-env
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("../__mocks__/enable");
  }
}
