import { useEffect } from 'react';

import { useAppDispatch, useAppSelector } from '@hooks/index';
import { cn } from '@utils/cn';
import { dismissToast, selectToast } from '@store/slices/app.slice';

/**
 * Renders the global toast from `app.slice`. Realtime listeners push
 * wallet / notification toasts here without importing feature UI.
 */
export const ToastHost = (): JSX.Element | null => {
  const dispatch = useAppDispatch();
  const toast = useAppSelector(selectToast);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => dispatch(dismissToast()), 4000);
    return () => window.clearTimeout(timer);
  }, [dispatch, toast]);

  if (!toast) return null;

  const toneClass =
    toast.variant === 'success'
      ? 'border-success/30 bg-success/10 text-success'
      : toast.variant === 'danger'
        ? 'border-danger/30 bg-danger/10 text-danger'
        : toast.variant === 'warning'
          ? 'border-warning/30 bg-warning/10 text-warning'
          : 'border-border bg-surface-elevated text-text';

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'pointer-events-none fixed inset-x-0 bottom-[calc(var(--w11-layout-tab-bar-height,4rem)+12px)] z-50 flex justify-center px-4',
        'lg:bottom-6',
      )}
    >
      <div
        className={cn(
          'pointer-events-auto max-w-md rounded-xl border px-4 py-3 text-sm shadow-lg backdrop-blur-sm',
          toneClass,
        )}
      >
        {toast.message}
      </div>
    </div>
  );
};
