"use client";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";

import { useFetch } from "@/app/_lib/fetch-provider";

export function useInfiniteDockerImages(query: string) {
  const { fetcher } = useFetch();
  const trimmedQuery = query.trim();

  return useSuspenseInfiniteQuery({
    queryKey: ["docker-images-infinite", trimmedQuery || "library"],
    queryFn: ({ pageParam }) => {
      if (trimmedQuery) {
        return fetcher(
          `/api/hub-proxy?query=${encodeURIComponent(trimmedQuery)}&page=${pageParam}`,
        );
      }

      return fetcher(
        `/api/hub-proxy?page=${pageParam}&page_size=25`,
      );
    },
    initialPageParam: 1,
    getNextPageParam: lastPage =>
      lastPage.next ? lastPage.next.match(/page=(\d+)/)?.[1] ? Number(lastPage.next.match(/page=(\d+)/)?.[1]) : undefined : undefined,
  });
}
