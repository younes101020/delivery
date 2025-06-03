"use client";

import {
  isServer,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

function makeQueryClient(forSSE: boolean) {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // With SSR, we usually want to set some default staleTime
        // above 0 to avoid refetching immediately on the client
        staleTime: forSSE ? Infinity : 60 * 1000,
        ...(forSSE && {
          queryFn: () => null,
        }),
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;
let browserSSEQueryClient: QueryClient | undefined;

export function getQueryClient(forSSE = false) {
  if (isServer) {
    return makeQueryClient(forSSE);
  }
  else {
    if (forSSE) {
      if (!browserSSEQueryClient)
        browserSSEQueryClient = makeQueryClient(true);
      return browserSSEQueryClient;
    }
    else {
      if (!browserQueryClient)
        browserQueryClient = makeQueryClient(false);
      return browserQueryClient;
    }
  }
}

export default function ReactQueryProvider({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
