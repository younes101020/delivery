import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { FetcherProvider } from "@/app/_lib/fetch-provider";

export function setup(jsx: React.ReactElement) {
  return {
    userAction: userEvent.setup(),
    ...render(jsx, { wrapper: () => (
      <FetcherProvider baseUrl="http://test.com">
        {jsx}
      </FetcherProvider>
    ) }),
  };
}
