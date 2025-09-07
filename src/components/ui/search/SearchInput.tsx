import React, { useState, useEffect } from "react";
import { Search, X } from "lucide-react";

interface SearchInputProps {
  onSearch: (value: string) => void;
  placeholder?: string;
  delay?: number; // debounce delay in ms
}

const SearchInput: React.FC<SearchInputProps> = ({
  onSearch,
  placeholder = "Search...",
  delay = 400,
}) => {
  const [query, setQuery] = useState("");

  // Debounce effect
  useEffect(() => {
    if (!query) {
      onSearch(""); // clear search immediately if query is empty
      return;
    }

    const handler = setTimeout(() => {
      onSearch(query.trim());
    }, delay);

    return () => clearTimeout(handler);
  }, [query, delay, onSearch]);

  // Clear input handler
  const handleClear = () => {
    setQuery("");
    onSearch(""); // notify parent instantly
  };

  // Handle Enter key (immediate search)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onSearch(query.trim());
    }
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
        onKeyDown={handleKeyDown}
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
