import axios, { AxiosRequestConfig } from "axios";
import debounce from "lodash/debounce";
import { useCallback, useEffect, useState } from "react";

interface UseSelectOptions {
  url: string;
  searchParam?: string;
  defaultParams?: Record<string, any>;
  debounceTime?: number;
  initialData?: any[];
  axiosConfig?: AxiosRequestConfig;
  transformResponse?: (data: any) => any[];
}

interface UseSelectResult<T> {
  loading: boolean;
  data: T[];
  error: Error | null;
  search: (query: string) => void;
  reset: () => void;
}

function useSelect<T = any>({
  url,
  searchParam = "q",
  defaultParams = {},
  debounceTime = 300,
  initialData = [],
  axiosConfig = {},
  transformResponse = (data) => data,
}: UseSelectOptions): UseSelectResult<T> {
  const [data, setData] = useState<T[]>(initialData);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Create debounced search function
  const debouncedFetch = useCallback(
    debounce(async (query: string) => {
      if (!url) return;

      setLoading(true);
      setError(null);

      try {
        const params = {
          ...defaultParams,
          [searchParam]: query,
        };

        const response = await axios.get(url, {
          params,
          ...axiosConfig,
        });

        const transformedData = transformResponse(response.data);
        setData(transformedData);
      } catch (err) {
        setError(
          err instanceof Error
            ? err
            : new Error("An error occurred during search"),
        );
        setData([]);
      } finally {
        setLoading(false);
      }
    }, debounceTime),
    [
      url,
      searchParam,
      defaultParams,
      axiosConfig,
      transformResponse,
      debounceTime,
    ],
  );

  // Search function to be called from component
  const search = useCallback(
    (query: string) => {
      setSearchTerm(query);
      debouncedFetch(query);
    },
    [debouncedFetch],
  );

  // Reset function
  const reset = useCallback(() => {
    setData(initialData);
    setSearchTerm("");
    setError(null);
  }, [initialData]);

  // Clean up debounce on unmount
  useEffect(() => {
    return () => {
      debouncedFetch.cancel();
    };
  }, [debouncedFetch]);

  return {
    loading,
    data,
    error,
    search,
    reset,
  };
}

export default useSelect;
