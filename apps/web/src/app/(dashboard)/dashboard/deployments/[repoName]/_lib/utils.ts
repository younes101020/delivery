export async function enableMocking() {
  // eslint-disable-next-line node/no-process-env
  if (process.env.NODE_ENV !== "development") {
    return;
  }

  const { worker } = await import("../__tests__/mocks/browser");

  // `worker.start()` returns a Promise that resolves
  // once the Service Worker is up and ready to intercept requests.
  return worker.start();
}
