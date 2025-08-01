import { render } from "@testing-library/react";

import { env } from "@/env";

import { SubscribeToSSE } from "../_components/subscribe-to-sse";

export function setup(jsx: React.ReactElement) {
  const baseUrl = env.WEB_BASE_URL;
  console.log("Base URL for SSE:", env);
  return {
    ...render(jsx, { wrapper: () => (
      <SubscribeToSSE baseUrl={baseUrl}>
        {jsx}
      </SubscribeToSSE>
    ) }),
  };
}
