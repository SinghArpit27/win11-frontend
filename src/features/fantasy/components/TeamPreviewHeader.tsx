import { ChevronDown, X } from 'lucide-react';
import { memo } from 'react';

import { cn } from '@utils/cn';

import type { FantasyMatchContext } from '../fantasy.types';

/**
 * Header for the team-preview surface (both draft preview and saved
 * team detail).
 *
 *  Layout (Dream11 reference):
 *    Row 1 — [ X ]  Team Name ▾                              [ Credits Left ]
 *                   ENG-W 0 vs NZ-W 0                           xx.x
 *    Row 2 — Players 11 / 11
 *
 *  Rendered against the dark navy fantasy gradient so it pairs with
 *  the green field underneath.
 */
interface TeamPreviewHeaderProps {
  context: FantasyMatchContext;
  teamName: string;
  selected: number;
  required: number;
  creditsLeft: number;
  onClose?: () => void;
  className?: string;
}

const TeamPreviewHeaderComponent = ({
  context,
  teamName,
  selected,
  required,
  creditsLeft,
  onClose,
  className,
}: TeamPreviewHeaderProps): JSX.Element => {
  const match = context.match;
  const home = match?.homeTeam;
  const away = match?.awayTeam;
  const homeScore = match?.scores.find((s) => s.teamId === home?.id);
  const awayScore = match?.scores.find((s) => s.teamId === away?.id);

  return (
    <div
      className={cn(
        'relative bg-gradient-fantasy-header px-3 pb-2 pt-3 text-text-inverse',
        className,
      )}
    >
      <div className="flex items-start gap-2">
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-ml-1 mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white hover:bg-white/10"
          >
            <X className="h-5 w-5" />
          </button>
        ) : null}

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <span className="truncate text-[14px] font-bold leading-tight">{teamName}</span>
            <ChevronDown className="h-3.5 w-3.5 shrink-0 text-white/70" />
          </div>
          {home && away ? (
            <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-white/80">
              <Flag short={home.shortName} logoUrl={home.logoUrl} primaryColor={home.primaryColor} />
              <span className="font-bold tabular-nums text-white">
                {homeScore?.score ?? 0}
              </span>
              <span className="text-white/60">vs</span>
              <span className="font-bold tabular-nums text-white">
                {awayScore?.score ?? 0}
              </span>
              <Flag short={away.shortName} logoUrl={away.logoUrl} primaryColor={away.primaryColor} />
            </div>
          ) : null}
        </div>

        <div className="min-w-[64px] text-right leading-tight">
          <div className="text-[10px] uppercase tracking-wider text-white/65">Credits Left</div>
          <div
            className={cn(
              'text-[15px] font-bold tabular-nums',
              creditsLeft < 0 ? 'text-[#ff7a85]' : 'text-white',
            )}
          >
            {creditsLeft.toFixed(1)}
          </div>
        </div>
      </div>

      <div className="mt-1.5 flex items-center justify-end text-[10px] uppercase tracking-wider text-white/65">
        Players{' '}
        <span className="ml-1 font-bold text-white">
          {selected}/{required}
        </span>
      </div>
    </div>
  );
};

const Flag = ({
  short,
  logoUrl,
  primaryColor,
}: {
  short: string;
  logoUrl: string | null;
  primaryColor: string | null;
}): JSX.Element => (
  <div
    className="flex h-4 w-4 shrink-0 items-center justify-center overflow-hidden rounded-full ring-1 ring-white/20"
    style={primaryColor ? { backgroundColor: primaryColor } : { backgroundColor: '#222' }}
    title={short}
  >
    {logoUrl ? (
      <img src={logoUrl} alt={short} loading="lazy" className="h-full w-full object-cover" />
    ) : (
      <span className="text-[7px] font-bold text-white/90">{short.slice(0, 2)}</span>
    )}
  </div>
);

export const TeamPreviewHeader = memo(TeamPreviewHeaderComponent);
