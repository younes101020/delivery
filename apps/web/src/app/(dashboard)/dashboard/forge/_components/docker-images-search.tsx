"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { SearchInput } from "@/app/_components/search-input";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
} from "@/app/_components/ui/combobox";

interface DockerImagesSearchProps {
  category?: string;
  query: string;
  onQueryChange: (query: string) => void;
}

export function DockerImagesSearch({ category, query, onQueryChange }: DockerImagesSearchProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedCategories = category === "databases" ? ["databases"] : [];

  function updateCategory(value: string[]) {
    const params = new URLSearchParams(searchParams.toString());
    if (value.includes("databases"))
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
      <Combobox multiple items={["databases"]} value={selectedCategories} onValueChange={updateCategory}>
        <ComboboxChips className="w-36 rounded-lg border px-1.5">
          <ComboboxValue>
            {selectedCategories.map(item => <ComboboxChip key={item}>Databases</ComboboxChip>)}
          </ComboboxValue>
          <ComboboxChipsInput placeholder="Filter" aria-label="Filter Docker image categories" />
        </ComboboxChips>
        <ComboboxContent>
          <ComboboxEmpty>No category found.</ComboboxEmpty>
          <ComboboxList>
            <ComboboxItem value="databases">Databases</ComboboxItem>
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  );
}
