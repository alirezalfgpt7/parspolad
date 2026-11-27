import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useMinimumDisplayDuration } from './useMinimumDisplayDuration.ts';

describe('useMinimumDisplayDuration', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('keeps the initial preloader visible for the configured minimum duration', () => {
    const { result } = renderHook(() => useMinimumDisplayDuration(1000));

    expect(result.current).toBe(false);
    act(() => vi.advanceTimersByTime(999));
    expect(result.current).toBe(false);
    act(() => vi.advanceTimersByTime(1));
    expect(result.current).toBe(true);
  });

  it('accounts for elapsed time if the server updates the configured duration', () => {
    const { result, rerender } = renderHook(
      ({ duration }: { duration: number }) => useMinimumDisplayDuration(duration),
      { initialProps: { duration: 500 } },
    );

    act(() => vi.advanceTimersByTime(300));
    rerender({ duration: 1000 });
    act(() => vi.advanceTimersByTime(699));
    expect(result.current).toBe(false);
    act(() => vi.advanceTimersByTime(1));
    expect(result.current).toBe(true);
  });
});
