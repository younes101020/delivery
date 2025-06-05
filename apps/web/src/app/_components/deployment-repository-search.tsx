"use client";

import { SearchIcon } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { startTransition } from "react";
import { useDebouncedCallback } from "use-debounce";

import { useDeploymentApplicationList } from "../_ctx/deployment-application-list";
import { Input } from "./ui/input";

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
    <div className="flex w-full items-center border rounded-lg px-2.5 py-1.5 mb-2">
      <SearchIcon className="h-4 w-4 mr-2.5" />
      <Input
        type="text"
        className="w-full border-0"
        placeholder="Search repositories..."
        autoComplete="off"
        defaultValue={searchParams.get("query")?.toString()}
        onChange={(e) => {
          handleRepositorySearch(e.target.value);
        }}
      />
    </div>
  );
}
