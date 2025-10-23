import { useCallback, useEffect, useRef, useState } from "react";

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

interface FetchOptions extends RequestInit {
  skipJsonParsing?: boolean; 
}

export const useApi = <T>(defaultData: T | null = null) => {
  const [state, setState] = useState<ApiState<T>>({
    data: defaultData,
    loading: false,
    error: null,
  });

  const abortController = useRef<AbortController | null>(null);

  const fetchData = useCallback(
    async (url: string, options?: FetchOptions): Promise<T | Response> => {
      // Cancel previous request if still running
      if (abortController.current) {
        abortController.current.abort();
      }

      abortController.current = new AbortController();
      const { skipJsonParsing, ...fetchOptions } = options || {};
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const response = await fetch(url, {
          ...fetchOptions,
          signal: abortController.current.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: T | Response = skipJsonParsing ? response : await response.json();

        if (!skipJsonParsing) {
          setState({ data: data as T, loading: false, error: null });
        } else {
          setState((prev) => ({ ...prev, loading: false, error: null }));
        }

        return data;
      } catch (error) {
        if (
          typeof error === "object" &&
          error !== null &&
          "name" in error &&
          (error as { name?: string }).name === "AbortError"
        ) {
          console.warn("Request aborted:", url);
          setState((prev) => ({ ...prev, loading: false }));
          throw new Error("Request aborted");
        }

        setState((prev) => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error : new Error("An error occurred"),
        }));

        throw error;
      }
    },
    []
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abortController.current?.abort();
    };
  }, []);

  return {
    ...state,
    fetchData,
  };
};



// const { data, loading, error, fetchData } = useApi<{ users: string[] }>();

// useEffect(() => {
//   fetchData("/api/users").catch(console.error);
// }, []);


// POST example
// await fetchData("/api/users", {
//   method: "POST",
//   headers: { "Content-Type": "application/json" },
//   body: JSON.stringify({ name: "John" }),
// });
