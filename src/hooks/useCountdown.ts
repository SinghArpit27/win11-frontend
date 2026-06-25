import { useEffect, useMemo, useState } from 'react';

/**
 * Countdown timer hook.
 *
 *  Tracks the time remaining until `target`. Updates once per second
 *  while there's still time left and then snaps to 0. Pauses entirely
 *  when the tab is hidden (visibility API) to avoid wasted renders, and
 *  re-syncs on visibility-change so the displayed value is fresh the
 *  moment the user looks at the tab again.
 *
 *  Returns a discriminated object so consumers can branch on `isLive` or
 *  `isStarted` without re-doing the time math.
 */
export interface CountdownState {
  /** Whole-second components for the most natural display. */
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  /** Total milliseconds remaining. Negative once the target has passed. */
  remainingMs: number;
  /** True once `Date.now() >= target`. */
  isStarted: boolean;
}

const computeState = (targetMs: number): CountdownState => {
  const remainingMs = targetMs - Date.now();
  const isStarted = remainingMs <= 0;
  const abs = Math.max(0, remainingMs);
  const days = Math.floor(abs / (24 * 60 * 60 * 1000));
  const hours = Math.floor((abs % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  const minutes = Math.floor((abs % (60 * 60 * 1000)) / (60 * 1000));
  const seconds = Math.floor((abs % (60 * 1000)) / 1000);
  return { days, hours, minutes, seconds, remainingMs, isStarted };
};

export const useCountdown = (target: string | Date | null | undefined): CountdownState => {
  const targetMs = useMemo(() => {
    if (!target) return Number.POSITIVE_INFINITY;
    const t = target instanceof Date ? target : new Date(target);
    const ms = t.getTime();
    return Number.isFinite(ms) ? ms : Number.POSITIVE_INFINITY;
  }, [target]);

  const [state, setState] = useState<CountdownState>(() => computeState(targetMs));

  useEffect(() => {
    if (!Number.isFinite(targetMs)) return;

    let timer: ReturnType<typeof setInterval> | null = null;
    const tick = (): void => setState(computeState(targetMs));

    const start = (): void => {
      if (timer) return;
      tick();
      timer = setInterval(tick, 1000);
    };
    const stop = (): void => {
      if (!timer) return;
      clearInterval(timer);
      timer = null;
    };

    start();

    const handleVisibility = (): void => {
      if (document.visibilityState === 'visible') start();
      else stop();
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      stop();
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [targetMs]);

  return state;
};
