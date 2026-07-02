"use client";

import { Suspense } from "react";

import { useInfiniteDockerImages } from "../_hooks/use-infinite-docker-images";

function InfiniteListInner({ query }: { query: string }) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage }
    = useInfiniteDockerImages(query);

  const images = data.pages.flatMap(page => page.results);

  return (
    <div>
      <ul>
        {images.map(img => (
          <li key={img.name}>{img.name}</li>
        ))}
      </ul>

      {hasNextPage && (
        <button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
          {isFetchingNextPage ? "Loading..." : "Load more"}
        </button>
      )}
    </div>
  );
}

export function InfiniteDockerImageList({ query }: { query: string }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <InfiniteListInner query={query} />
    </Suspense>
  );
}
