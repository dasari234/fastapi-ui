import React, { useState, useEffect, useCallback } from "react";
import { Search, X } from "lucide-react";

interface SearchInputProps {
  onSearch: (value: string) => void;
  placeholder?: string;
  delay?: number;
}

const SearchInput: React.FC<SearchInputProps> = ({
  onSearch,
  placeholder = "Search...",
  delay = 400,
}) => {
  const [query, setQuery] = useState("");

  // Debounce logic
  const debouncedSearch = useCallback(() => {
    const handler = setTimeout(() => {
      onSearch(query.trim());
    }, delay);

    return () => clearTimeout(handler);
  }, [query, delay, onSearch]);

  useEffect(() => {
    return debouncedSearch();
  }, [debouncedSearch]);

  const handleClear = () => {
    setQuery("");
    onSearch(""); // notify parent
  };

  return (
    <div className="relative w-full max-w-sm">
      {/* Search Icon */}
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-4" />

      {/* Input */}
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-8 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {/* Clear Icon */}
      {query && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 focus:outline-none"
          aria-label="Clear search"
        >
          <X className="size-4 text-gray-400 hover:text-gray-600" />
        </button>
      )}
    </div>
  );
};

export default SearchInput;
