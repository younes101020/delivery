import { act, render } from "@testing-library/react";

import { FetcherProvider } from "@/app/_lib/fetch-provider";
import { env } from "@/env";

import ReactQueryProvider from "../_lib/react-query-provider";

export async function setup(jsx: React.ReactElement) {
  return act(() => render(jsx, { wrapper: () => (
    <FetcherProvider baseUrl={env.WEB_BASE_URL}>
      <ReactQueryProvider>
        {jsx}
      </ReactQueryProvider>
    </FetcherProvider>
  ) }),
  );
}
