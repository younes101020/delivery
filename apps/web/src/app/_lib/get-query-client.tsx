import { defaultShouldDehydrateQuery, isServer, QueryClient } from "@tanstack/react-query";

function makeQueryClient(forSSE: boolean) {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: forSSE ? Infinity : 60 * 1000,
        queryFn: () => null,
      },
      dehydrate: {
        // include pending queries in dehydration
        shouldDehydrateQuery: query =>
          defaultShouldDehydrateQuery(query)
          || query.state.status === "pending",
        shouldRedactErrors: () => {
          // We should not catch Next.js server errors
          // as that's how Next.js detects dynamic pages
          // so we cannot redact them.
          // Next.js also automatically redacts errors for us
          // with better digests.
          return false;
        },
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;
let browserSSEQueryClient: QueryClient | undefined;

export function getQueryClient(forSSE = false) {
  if (isServer) {
    // Server: always make a new query client
    return makeQueryClient(forSSE);
  }
  else {
    // Browser: make a new query client if we don't already have one
    // This is very important, so we don't re-make a new client if React
    // suspends during the initial render. This may not be needed if we
    // have a suspense boundary BELOW the creation of the query client
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
