import { useState, useEffect, useCallback } from 'react';
import { useIsFocused } from '@react-navigation/native';

interface UseApiState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Generic hook for fetching data from the API.
 * Calls `fetchFn` on mount and refetches when the screen regains focus.
 * Exposes `refetch` for manual reload.
 */
export function useApi<T>(fetchFn: () => Promise<T>, deps: any[] = []): UseApiState<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isFocused = useIsFocused();

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchFn();
      setData(result);
    } catch (err: any) {
      setError(err?.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  }, deps);

  useEffect(() => {
    fetch();
  }, [fetch]);

  // Refetch when screen regains focus (e.g. after adding a transaction)
  useEffect(() => {
    if (isFocused) {
      fetch();
    }
  }, [isFocused]);

  return { data, isLoading, error, refetch: fetch };
}
