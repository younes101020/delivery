/* eslint-disable node/no-process-env */

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    if (process.env.CI !== "true") {
      const { config } = await import("dotenv");
      config({ path: "../../.env" });
    }

    const enableHTTPMocking = process.env.NODE_ENV === "development";
    if (enableHTTPMocking) {
      console.warn("HTTP mocking enabled for development or test environment");
      const { server } = await import("../__mocks__/node");
      server.listen();
    };
  }
}
