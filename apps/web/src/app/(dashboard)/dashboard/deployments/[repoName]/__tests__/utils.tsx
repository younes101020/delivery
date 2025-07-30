import { render } from "@testing-library/react";

import { env } from "@/env";

import { SubscribeToSSE } from "../_components/subscribe-to-sse";

export function setup(jsx: React.ReactElement) {
  const baseUrl = env.BASE_URL;
  console.log("Setting up test with base URL:", baseUrl);
  return {
    ...render(jsx, { wrapper: () => (
      <SubscribeToSSE baseUrl={baseUrl}>
        {jsx}
      </SubscribeToSSE>
    ) }),
  };
}
