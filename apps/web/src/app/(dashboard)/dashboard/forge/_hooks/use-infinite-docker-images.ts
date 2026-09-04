"use client";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";

import { useFetch } from "@/app/_lib/fetch-provider";

import type { DockerHubResponse } from "../_lib/docker-hub";

export function useInfiniteDockerImages(query: string, category?: string, initialPage?: DockerHubResponse) {
  const { fetcher } = useFetch();
  const trimmedQuery = query.trim();

  return useSuspenseInfiniteQuery({
    queryKey: ["docker-images-infinite", category ?? "library", trimmedQuery],
    queryFn: ({ pageParam }) => {
      const params = new URLSearchParams({ page: String(pageParam) });
      if (category)
        params.set("category", category);
      if (trimmedQuery)
        params.set("query", trimmedQuery);
      if (!category && !trimmedQuery)
        params.set("page_size", "25");

      return fetcher(`/api/hub-proxy?${params.toString()}`);
    },
    initialData: initialPage
      ? {
          pages: [initialPage],
          pageParams: [1],
        }
      : undefined,
    initialPageParam: 1,
    getNextPageParam: lastPage =>
      lastPage.next ? lastPage.next.match(/page=(\d+)/)?.[1] ? Number(lastPage.next.match(/page=(\d+)/)?.[1]) : undefined : undefined,
  });
}
