import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { env } from "@/env";

import { SubscribeToSSE } from "../_components/subscribe-to-sse";

export function setup(jsx: React.ReactElement) {
  return {
    userAction: userEvent.setup(),
    ...render(jsx, { wrapper: () => (
      <SubscribeToSSE baseUrl={env.BASE_URL}>
        {jsx}
      </SubscribeToSSE>
    ) }),
  };
}
