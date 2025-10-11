// app/documents/search.tsx
"use client";
import { Input } from "@/components/ui/input";
import { useQueryStates } from "nuqs";
import { useDebouncedCallback } from "use-debounce";
import { documentsSearchParams } from "./searchParams"; // Import shared definition

export function Search() {
  const [{ query }, setQueryStates] = useQueryStates(documentsSearchParams);

  const handleSearch = useDebouncedCallback((value: string) => {
    setQueryStates({ query: value, page: 1 }); // Reset to page 1
  }, 500);

  return (
    <Input
      defaultValue={query}
      placeholder="Search..."
      onChange={e => handleSearch(e.target.value)}
      onKeyDown={e => {
        if (e.key === "Enter") {
          // Send immediate update
          setQueryStates({ query: e.currentTarget.value });
        }
      }}
    />
  );
}
