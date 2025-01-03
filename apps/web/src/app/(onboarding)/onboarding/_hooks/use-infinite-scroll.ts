"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export function useInfiniteScroll(isIntersecting: boolean) {
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams);
  const pathname = usePathname();
  const { replace } = useRouter();

  useEffect(() => {
    if (isIntersecting) {
      const repoPage = params.get("page");
      if (!repoPage) {
        params.set("page", "2");
      } else {
        let updatedRepoPage = parseInt(repoPage);
        updatedRepoPage++;
        params.set("page", `${updatedRepoPage}`);
      }
      replace(`${pathname}?${params.toString()}`, { scroll: false });
    }
  }, [isIntersecting, params, pathname, replace]);
}
