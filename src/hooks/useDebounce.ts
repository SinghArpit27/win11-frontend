import { useEffect, useState } from 'react';

/**
 * Returns `value` deferred by `delayMs`. Resets the timer on every
 * change — typical use is debouncing search input before firing a query.
 */
export const useDebounce = <T,>(value: T, delayMs = 300): T => {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(t);
  }, [value, delayMs]);

  return debounced;
};
