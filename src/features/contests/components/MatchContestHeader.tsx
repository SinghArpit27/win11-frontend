import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { ROUTES } from '@constants/routes.constants';
import { useCountdown } from '@hooks/useCountdown';
import { cn } from '@utils/cn';

import type { SportsMatchDetail } from '@features/sports/sports.types';

interface MatchFixtureBarProps {
  match: SportsMatchDetail;
  className?: string;
}

/** Match title strip — back + IRE v IND + countdown (Dream11 maroon header). */
export const MatchFixtureBar = ({ match, className }: MatchFixtureBarProps): JSX.Element => {
  const navigate = useNavigate();
  const { hours, minutes, isStarted, remainingMs } = useCountdown(match.scheduledAt);

  const countdownLabel =
    isStarted || remainingMs <= 0 ? 'Match started' : `${hours}h ${minutes}m left`;

  const title = `${match.homeTeam.shortName} v ${match.awayTeam.shortName}`;

  return (
    <div
      className={cn('relative px-2 py-2.5 text-white sm:px-3 sm:py-3', className)}
      style={{
        background: 'linear-gradient(180deg, #3d1224 0%, #5a1830 55%, #4a1528 100%)',
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
          backgroundSize: '16px 16px',
        }}
      />
      <div className="relative flex items-start gap-2">
        <button
          type="button"
          aria-label="Go back"
          onClick={() => navigate(ROUTES.HOME)}
          className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white/90 transition-colors hover:bg-white/10"
        >
          <ArrowLeft className="h-5 w-5" strokeWidth={2} />
        </button>
        <div className="min-w-0 flex-1 pt-0.5">
          <h1 className="text-[17px] font-bold leading-tight tracking-tight">{title}</h1>
          <p className="mt-0.5 text-[12px] font-normal leading-none text-white/90">
            {countdownLabel}
          </p>
        </div>
      </div>
    </div>
  );
};

/** @deprecated Use MatchFixtureBar */
export const MatchContestHeader = MatchFixtureBar;
