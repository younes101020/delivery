/* eslint-disable node/no-process-env */

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    if (process.env.CI !== "true") {
      const { config } = await import("dotenv");
      config({ path: "../../.env" });
    }
  }
}
