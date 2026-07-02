"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { startTransition } from "react";
import { useDebouncedCallback } from "use-debounce";

import { useDeploymentApplicationList } from "../_ctx/deployment-application-list";
import { SearchInput } from "./search-input";

export function RepositorySearch() {
  const { triggerPending } = useDeploymentApplicationList();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const handleRepositorySearch = useDebouncedCallback((term) => {
    startTransition(() => {
      triggerPending();
    });

    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set("query", term);
    }
    else {
      params.delete("query");
    }
    replace(`${pathname}?${params.toString()}`);
  }, 300);

  return (
    <SearchInput
      type="text"
      placeholder="Search repositories..."
      autoComplete="off"
      defaultValue={searchParams.get("query")?.toString()}
      onChange={(e) => {
        handleRepositorySearch(e.target.value);
      }}
    />
  );
}
