import { SearchInput } from "@/app/_components/search-input";

interface DockerImagesSearchProps {
  query: string;
  onQueryChange: (query: string) => void;
}

export function DockerImagesSearch({ query, onQueryChange }: DockerImagesSearchProps) {
  return (
    <SearchInput
      type="text"
      value={query}
      onChange={e => onQueryChange(e.target.value)}
      placeholder="Search applications..."
    />
  );
};
