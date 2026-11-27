import { useEffect, useRef, useState } from 'react';

export function useMinimumDisplayDuration(durationMs: number): boolean {
  const startedAt = useRef(Date.now());
  const [elapsedDuration, setElapsedDuration] = useState(0);

  useEffect(() => {
    const remaining = Math.max(0, durationMs - (Date.now() - startedAt.current));
    const timeout = window.setTimeout(() => setElapsedDuration(durationMs), remaining);

    return () => window.clearTimeout(timeout);
  }, [durationMs]);

  return elapsedDuration >= durationMs;
}
