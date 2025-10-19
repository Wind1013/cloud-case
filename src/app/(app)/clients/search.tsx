// src/app/(app)/clients/search.tsx
"use client";
import { Input } from "@/components/ui/input";
import { useQueryState } from "nuqs";
import { useDebouncedCallback } from "use-debounce";

export function Search() {
  const [query, setQuery] = useQueryState("query", { shallow: false });

  const handleSearch = useDebouncedCallback((value: string) => {
    setQuery(value);
  }, 500);

  return (
    <Input
      defaultValue={query ?? ""}
      placeholder="Search by name or email..."
      onChange={e => handleSearch(e.target.value)}
      onKeyDown={e => {
        if (e.key === "Enter") {
          setQuery(e.currentTarget.value);
        }
      }}
    />
  );
}
