import { useState, useEffect, useRef, useCallback } from 'react';
import type { AutocompleteResult } from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL 
  ? `${import.meta.env.VITE_API_BASE_URL}/api/autocomplete` 
  : '/api/autocomplete';
const DEBOUNCE_MS = 300;

interface UseAutocompleteReturn {
  results: AutocompleteResult[];
  loading: boolean;
  error: string | null;
}

/**
 * Custom hook that provides debounced autocomplete search.
 *
 * - Debounces the query by 300ms to avoid API spam
 * - Cancels in-flight requests when a new query arrives
 * - Returns empty results for empty queries (no API call)
 */
export function useAutocomplete(query: string): UseAutocompleteReturn {
  const [results, setResults] = useState<AutocompleteResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchResults = useCallback(async (searchQuery: string) => {
    // Cancel any in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    if (!searchQuery.trim()) {
      setResults([]);
      setLoading(false);
      setError(null);
      return;
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_BASE}?query=${encodeURIComponent(searchQuery)}`,
        { signal: controller.signal },
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data: AutocompleteResult[] = await response.json();
      setResults(data);
      setError(null);
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        // Request was cancelled — ignore
        return;
      }
      setResults([]);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchResults(query);
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
    };
  }, [query, fetchResults]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return { results, loading, error };
}
