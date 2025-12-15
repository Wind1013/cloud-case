// src/app/(app)/cases/search.tsx
"use client";
import { Input } from "@/components/ui/input";
import { useQueryState } from "nuqs";
import { useDebouncedCallback } from "use-debounce";
import { useEffect, useState } from "react";

export function Search() {
  const [query, setQuery] = useQueryState("query", { shallow: false });
  const [searchValue, setSearchValue] = useState(query ?? "");

  // Sync searchValue with URL query param when it changes externally
  useEffect(() => {
    setSearchValue(query ?? "");
  }, [query]);

  const handleSearch = useDebouncedCallback((value: string) => {
    const trimmedValue = value.trim();
    setQuery(trimmedValue || null);
  }, 500);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    handleSearch(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const trimmedValue = e.currentTarget.value.trim();
      setSearchValue(trimmedValue);
      setQuery(trimmedValue || null);
      handleSearch.cancel(); // Cancel debounced call
    }
  };

  return (
    <Input
      value={searchValue}
      placeholder="Search title, description or client name"
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      className="w-full"
    />
  );
}
