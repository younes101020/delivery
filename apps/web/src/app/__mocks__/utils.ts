export async function enableMocking() {
  /* eslint-disable node/no-process-env */
  if (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test") {
    return;
  }

  const { worker } = await import("./browser");

  // `worker.start()` returns a Promise that resolves
  // once the Service Worker is up and ready to intercept requests.
  return worker.start();
}
