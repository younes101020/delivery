"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { SearchInput } from "@/app/_components/search-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/_components/ui/select";

interface DockerImagesSearchProps {
  category?: string;
  query: string;
  onQueryChange: (query: string) => void;
}

export function DockerImagesSearch({ category, query, onQueryChange }: DockerImagesSearchProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateCategory(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "databases")
      params.set("category", "databases");
    else
      params.delete("category");
    router.replace(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex items-start gap-2">
      <SearchInput
        type="text"
        value={query}
        onChange={e => onQueryChange(e.target.value)}
        placeholder="Search Docker images..."
        className="mb-2 min-w-0 flex-1"
      />
      <Select value={category ?? "all"} onValueChange={updateCategory}>
        <SelectTrigger className="w-36" aria-label="Filter Docker image categories">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All images</SelectItem>
          <SelectItem value="databases">Databases</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
