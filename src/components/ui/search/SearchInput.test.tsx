import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import SearchInput from "./SearchInput";

describe("SearchInput", () => {
  it("renders with placeholder", () => {
    const onSearch = vi.fn();
    render(<SearchInput onSearch={onSearch} placeholder="Find items" />);
    expect(screen.getByPlaceholderText("Find items")).toBeInTheDocument();
  });

  it("calls onSearch with debounce", async () => {
    const onSearch = vi.fn();
    render(<SearchInput onSearch={onSearch} delay={300} />);

    const input = screen.getByPlaceholderText("Search...");
    fireEvent.change(input, { target: { value: "React" } });

    // debounce delay + buffer
    await waitFor(() => {
      expect(onSearch).toHaveBeenCalledWith("React");
    }, { timeout: 500 });
  });

  it("clears input and triggers onSearch when clear button clicked", async () => {
    const onSearch = vi.fn();
    render(<SearchInput onSearch={onSearch} />);

    const input = screen.getByPlaceholderText("Search...");
    fireEvent.change(input, { target: { value: "Test" } });

    // Wait for debounce to trigger
    await waitFor(() => {
      expect(onSearch).toHaveBeenCalledWith("Test");
    });

    const clearButton = screen.getByRole("button", { name: /clear search/i });
    fireEvent.click(clearButton);

    expect(input).toHaveValue("");
    expect(onSearch).toHaveBeenCalledWith("");
  });

  it("calls onSearch immediately when Enter is pressed", () => {
    const onSearch = vi.fn();
    render(<SearchInput onSearch={onSearch} />);

    const input = screen.getByPlaceholderText("Search...");
    fireEvent.change(input, { target: { value: "Next.js" } });

    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });

    expect(onSearch).toHaveBeenCalledWith("Next.js");
  });

  it("calls onSearch with empty string when input is cleared", () => {
    const onSearch = vi.fn();
    render(<SearchInput onSearch={onSearch} />);

    // Initial effect should call with empty string
    expect(onSearch).toHaveBeenCalledWith("");
  });
});
