import { defaultShouldDehydrateQuery, QueryClient } from "@tanstack/react-query";
import { cache } from "react";

// cache() is scoped per request, so we don't leak data between requests
const getQueryClient = cache(() => new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
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
}));

export { getQueryClient };
