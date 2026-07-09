import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useAutocomplete } from '../hooks/useAutocomplete';

describe('useAutocomplete', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('returns empty results for empty query without making API call', async () => {
    const { result } = renderHook(() => useAutocomplete(''));

    await act(async () => {
      vi.advanceTimersByTime(400);
    });

    expect(result.current.results).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('returns empty results for whitespace-only query', async () => {
    const { result } = renderHook(() => useAutocomplete('   '));

    await act(async () => {
      vi.advanceTimersByTime(400);
    });

    expect(result.current.results).toEqual([]);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('fetches results after debounce delay', async () => {
    const mockData = [
      { type: 'stock', ticker: 'AAPL', name: 'Apple Inc', marketCap: 3900351316097 },
    ];

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockData),
    });

    const { result } = renderHook(() => useAutocomplete('AAPL'));

    // Before debounce — no fetch yet
    expect(global.fetch).not.toHaveBeenCalled();

    // Advance past debounce and flush microtasks
    await act(async () => {
      vi.advanceTimersByTime(400);
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/autocomplete?query=AAPL',
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );

    await waitFor(() => {
      expect(result.current.results).toEqual(mockData);
      expect(result.current.loading).toBe(false);
    });
  });

  it('sets error state on network failure', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error('Network error'),
    );

    const { result } = renderHook(() => useAutocomplete('test'));

    await act(async () => {
      vi.advanceTimersByTime(400);
    });

    await waitFor(() => {
      expect(result.current.error).toBe('Network error');
      expect(result.current.results).toEqual([]);
    });
  });

  it('sets error state on non-OK response', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    const { result } = renderHook(() => useAutocomplete('test'));

    await act(async () => {
      vi.advanceTimersByTime(400);
    });

    await waitFor(() => {
      expect(result.current.error).toBe('HTTP 500');
      expect(result.current.results).toEqual([]);
    });
  });

  it('debounces rapid query changes', async () => {
    const mockData = [
      { type: 'expert', name: 'Andrew Bary', expertType: 'blogger' },
    ];

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockData),
    });

    const { rerender } = renderHook(
      ({ query }) => useAutocomplete(query),
      { initialProps: { query: 'a' } },
    );

    // Simulate rapid typing — each rerender resets the debounce timer
    await act(async () => {
      vi.advanceTimersByTime(100);
    });
    rerender({ query: 'an' });

    await act(async () => {
      vi.advanceTimersByTime(100);
    });
    rerender({ query: 'and' });

    await act(async () => {
      vi.advanceTimersByTime(100);
    });
    rerender({ query: 'andr' });

    // Advance past debounce from the last change
    await act(async () => {
      vi.advanceTimersByTime(400);
    });

    await waitFor(() => {
      // Only the last query should have triggered a fetch
      const calls = (global.fetch as ReturnType<typeof vi.fn>).mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      const lastCall = calls[calls.length - 1];
      expect(lastCall[0]).toBe('/api/autocomplete?query=andr');
    });
  });
});
