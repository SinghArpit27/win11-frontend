import { ChevronLeft, X } from 'lucide-react';
import { memo } from 'react';

import { useCountdown } from '@hooks/useCountdown';
import { cn } from '@utils/cn';

import type { FantasyMatchContext } from '../fantasy.types';

/**
 * Dream11-style "Create Team" header.
 *
 *  Visual reference (My11Circle):
 *   - Dark navy gradient (#041220 → #071b2e) — handled by the
 *     `bg-gradient-fantasy-header` Tailwind utility.
 *   - Row 1:  back chevron · stacked title + countdown · outlined "PTS"
 *             circle on the right.
 *   - Row 2:  centred score band — ENG-W flag · "ENG-W" · "0 - 0" ·
 *             "NZ-W" · NZ-W flag.
 *   - Row 3:  "0/11" counter · segmented progress bar · "×" close.
 *   - Optional subtitle row for the captain screen ("Select Captain &
 *     Vice Captain").
 */
export interface FantasyMatchHeaderProps {
  context: FantasyMatchContext;
  title?: string;
  subtitle?: string;
  navIcon?: 'back' | 'close';
  onBack?: () => void;
  /** Custom right slot — defaults to an outlined "PTS" circle. */
  rightSlot?: React.ReactNode;
  selectedCount?: number;
  requiredCount?: number;
  /** Per-team pick counts — replaces the live score band when provided. */
  homePickCount?: number;
  awayPickCount?: number;
  onClearSelection?: () => void;
  /** Hide the score row + progress bar (used by the captain header). */
  compact?: boolean;
  className?: string;
}

const pad2 = (n: number): string => (n < 10 ? `0${n}` : String(n));

const FantasyMatchHeaderComponent = ({
  context,
  title = 'Create Team',
  subtitle,
  navIcon = 'back',
  onBack,
  rightSlot,
  selectedCount,
  requiredCount,
  homePickCount,
  awayPickCount,
  onClearSelection,
  compact,
  className,
}: FantasyMatchHeaderProps): JSX.Element => {
  const match = context.match;
  const targetIso = context.lineupLockedAt ?? match?.scheduledAt ?? null;
  const { days, hours, minutes, isStarted } = useCountdown(targetIso);

  const home = match?.homeTeam;
  const away = match?.awayTeam;
  const homeScore = match?.scores.find((s) => s.teamId === home?.id);
  const awayScore = match?.scores.find((s) => s.teamId === away?.id);

  const countdownLabel = (() => {
    if (!targetIso) return null;
    if (isStarted) return context.isLocked ? 'Locked' : 'Live';
    if (days >= 1) return `${days}d ${pad2(hours)}h left`;
    if (hours >= 1) return `${hours}h ${pad2(minutes)}m left`;
    return `${minutes}m left`;
  })();

  return (
    <div
      className={cn('relative w-full bg-gradient-fantasy-header text-text-inverse', className)}
    >
      <div className="flex flex-col px-3 pt-3 sm:px-4">
        {/* Row 1 — title bar */}
        <div className="flex items-start gap-2">
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              aria-label={navIcon === 'close' ? 'Close' : 'Back'}
              className="-ml-1 mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
            >
              {navIcon === 'close' ? <X className="h-5 w-5" /> : <ChevronLeft className="h-6 w-6" />}
            </button>
          ) : null}
          <div className="min-w-0 flex-1 leading-tight">
            <div className="truncate text-[15px] font-bold tracking-tight">{title}</div>
            {countdownLabel ? (
              <div className="mt-0.5 text-[11px] font-medium text-white/65">{countdownLabel}</div>
            ) : null}
          </div>
          {rightSlot !== undefined ? (
            rightSlot
          ) : (
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/35 text-[10px] font-bold uppercase tracking-wider text-white/90">
              PTS
            </span>
          )}
        </div>

        {/* Row 2 — team pick counts or live score */}
        {!compact && home && away ? (
          <div className="mt-2.5 flex items-center justify-center gap-3">
            <TeamSideBlock
              short={home.shortName}
              logoUrl={home.logoUrl}
              primaryColor={home.primaryColor}
              align="end"
            />
            <span className="text-[18px] font-bold tabular-nums leading-none">
              {typeof homePickCount === 'number' && typeof awayPickCount === 'number' ? (
                <>
                  {homePickCount}
                  <span className="mx-1.5 text-white/60">-</span>
                  {awayPickCount}
                </>
              ) : (
                <>
                  {homeScore?.score ?? 0}
                  <span className="mx-1 text-white/60">-</span>
                  {awayScore?.score ?? 0}
                </>
              )}
            </span>
            <TeamSideBlock
              short={away.shortName}
              logoUrl={away.logoUrl}
              primaryColor={away.primaryColor}
              align="start"
            />
          </div>
        ) : null}

        {/* Row 3 — segmented progress */}
        {!compact && typeof selectedCount === 'number' && typeof requiredCount === 'number' ? (
          <div className="mt-2.5 flex items-center gap-2">
            <span className="text-[11px] font-bold tabular-nums text-white">
              {selectedCount}/{requiredCount}
            </span>
            <div
              className="flex h-2 flex-1 items-center gap-[2px]"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={requiredCount}
              aria-valuenow={selectedCount}
            >
              {Array.from({ length: requiredCount }).map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    'h-2 flex-1 -skew-x-12 transition-colors',
                    i < selectedCount ? 'bg-[#43a047]' : 'bg-white/20',
                  )}
                />
              ))}
            </div>
            {onClearSelection ? (
              <button
                type="button"
                onClick={onClearSelection}
                aria-label="Clear selection"
                className="flex h-5 w-5 items-center justify-center rounded-full text-white/60 hover:bg-white/10 hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            ) : (
              <span className="h-5 w-5" aria-hidden />
            )}
          </div>
        ) : null}

        {/* Subtitle */}
        {subtitle ? (
          <div className="mt-2 text-center text-[13px] font-semibold text-white/90">
            {subtitle}
          </div>
        ) : null}

        <div className="h-2" />
      </div>
    </div>
  );
};

// ── Internal — score-row team block (flag + short code) ────────────────
const TeamSideBlock = ({
  short,
  logoUrl,
  primaryColor,
  align,
}: {
  short: string;
  logoUrl: string | null;
  primaryColor: string | null;
  align: 'start' | 'end';
}): JSX.Element => (
  <div
    className={cn(
      'flex items-center gap-1.5',
      align === 'end' ? 'flex-row' : 'flex-row-reverse',
    )}
  >
    <span className="text-[13px] font-bold uppercase tracking-wide text-white">{short}</span>
    <div
      className="flex h-6 w-6 items-center justify-center overflow-hidden rounded-full ring-1 ring-white/20"
      style={{ backgroundColor: primaryColor ?? '#222' }}
      aria-hidden
    >
      {logoUrl ? (
        <img src={logoUrl} alt="" loading="lazy" className="h-full w-full object-cover" />
      ) : (
        <span className="text-[8px] font-bold text-white">{short.slice(0, 2)}</span>
      )}
    </div>
  </div>
);

export const FantasyMatchHeader = memo(FantasyMatchHeaderComponent);
