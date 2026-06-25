import { Eye, History, type LucideIcon } from 'lucide-react';
import { memo, type ReactNode } from 'react';

import { cn } from '@utils/cn';

/**
 * Bottom-anchored "pill" action bar used by the create-team flow.
 *
 *  - Floats above the global tab bar on mobile.
 *  - Renders as a centered rounded-pill with two ghost actions on the
 *    left (Preview, Past Lineup) and one primary CTA on the right.
 *  - The primary CTA can hold a count badge (e.g. "5 of 13").
 *
 *  This component mirrors the Dream11 visual reference where the bar
 *  becomes a single dark pill rather than a full-width footer.
 */
export interface FantasyPillAction {
  id: string;
  label: string;
  icon?: LucideIcon;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  /** Right-side CTA. When set, this action renders in primary style. */
  primary?: boolean;
  /** Optional small numeric pill displayed before the label ("5 of 13"). */
  badge?: string;
}

interface FantasyPillActionBarProps {
  actions: FantasyPillAction[];
  /** Slot above the pill — typically meters / validation feedback. */
  summary?: ReactNode;
  className?: string;
}

const FantasyPillActionBarComponent = ({
  actions,
  summary,
  className,
}: FantasyPillActionBarProps): JSX.Element => {
  return (
    <div
      className={cn(
        'pointer-events-none fixed inset-x-0 bottom-[max(env(safe-area-inset-bottom),12px)] z-40',
        'flex flex-col items-center gap-2 px-3 sm:px-4',
        className,
      )}
    >
      {summary ? (
        <div className="pointer-events-auto w-full max-w-sm">{summary}</div>
      ) : null}
      <div
        role="toolbar"
        className={cn(
          'pointer-events-auto flex w-full max-w-sm items-center justify-between gap-1 rounded-full',
          'bg-[#0F0F10] px-1.5 py-1 text-white shadow-[0_10px_28px_rgba(0,0,0,0.45)] ring-1 ring-white/5',
        )}
      >
        {actions.map((a) => {
          const Icon = a.icon ?? null;
          const isPrimary = Boolean(a.primary);
          return (
            <button
              key={a.id}
              type="button"
              onClick={a.onClick}
              disabled={a.disabled || a.loading}
              className={cn(
                'flex items-center justify-center gap-1.5 rounded-full px-3 py-2 text-[12px] font-bold uppercase tracking-wider transition-all',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40',
                isPrimary
                  ? 'bg-success px-4 py-2.5 text-white shadow-md hover:brightness-110 disabled:bg-text-muted/40 disabled:text-white/60'
                  : 'text-white/85 hover:text-white disabled:text-white/30',
                isPrimary && 'min-w-[6.5rem]',
              )}
            >
              {a.loading ? (
                <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : Icon ? (
                <Icon className="h-4 w-4" />
              ) : null}
              {a.badge ? (
                <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-[10px] font-bold tabular-nums">
                  {a.badge}
                </span>
              ) : null}
              <span>{a.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export const FantasyPillActionBar = memo(FantasyPillActionBarComponent);

// Re-export commonly used icons so screens don't need to import lucide directly.
export { Eye as PreviewIcon, History as PastLineupIcon };
