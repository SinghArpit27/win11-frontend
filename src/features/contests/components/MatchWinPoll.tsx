import { ChevronRight } from 'lucide-react';
import { useState } from 'react';

import { TeamBadge } from '@features/sports/components/TeamBadge';
import { useDream11Palette } from '@features/sports/hooks/useDream11Palette';
import type { SportsMatchDetail } from '@features/sports/sports.types';
import { cn } from '@utils/cn';

interface MatchWinPollProps {
  match: SportsMatchDetail;
  className?: string;
}

const AbHexIcon = (): JSX.Element => (
  <svg aria-hidden viewBox="0 0 20 20" className="h-4 w-4 shrink-0">
    <path d="M10 1.8 17.2 5.8v8.4L10 18.2 2.8 14.2V5.8L10 1.8z" fill="#5c6570" />
    <text
      x="10"
      y="12.2"
      textAnchor="middle"
      fontSize="6"
      fontWeight="700"
      fill="#ffffff"
      fontFamily="system-ui, sans-serif"
    >
      AB
    </text>
  </svg>
);

/** Dream11 poll card — compact, grey question text, team pills. */
export const MatchWinPoll = ({ match, className }: MatchWinPollProps): JSX.Element => {
  const palette = useDream11Palette();
  const [pick, setPick] = useState<'home' | 'away' | null>(null);

  return (
    <section
      className={cn('mx-2 mt-2 mb-3 rounded-lg border px-2.5 py-1.5', className)}
      style={{
        borderColor: palette.border,
        backgroundColor: palette.card,
      }}
    >
      <div className="flex items-center gap-1.5">
        <AbHexIcon />
        <span
          className="min-w-0 flex-1 truncate text-[12px] font-normal leading-none"
          style={{ color: palette.textTertiary }}
        >
          Who will win the match?
        </span>
        <ChevronRight
          className="h-3 w-3 shrink-0"
          style={{ color: palette.chevron }}
          aria-hidden
        />
      </div>

      <div className="mt-1.5 grid grid-cols-2 gap-1.5">
        <PollTeamButton
          selected={pick === 'home'}
          shortName={match.homeTeam.shortName}
          name={match.homeTeam.name}
          logoUrl={match.homeTeam.logoUrl}
          primaryColor={match.homeTeam.primaryColor}
          onClick={() => setPick('home')}
        />
        <PollTeamButton
          selected={pick === 'away'}
          shortName={match.awayTeam.shortName}
          name={match.awayTeam.name}
          logoUrl={match.awayTeam.logoUrl}
          primaryColor={match.awayTeam.primaryColor}
          onClick={() => setPick('away')}
        />
      </div>
    </section>
  );
};

const PollTeamButton = ({
  selected,
  shortName,
  name,
  logoUrl,
  primaryColor,
  onClick,
}: {
  selected: boolean;
  shortName: string;
  name: string;
  logoUrl: string | null;
  primaryColor: string | null;
  onClick: () => void;
}): JSX.Element => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      'flex h-8 w-full items-center justify-center gap-1.5 rounded-md border bg-white',
      selected ? 'border-[#2e7d32] bg-[#fafdfa]' : 'border-[#e0e0e0]',
    )}
  >
    <TeamBadge
      shortName={shortName}
      name={name}
      logoUrl={logoUrl}
      primaryColor={primaryColor}
      size="xs"
      className="!h-5 !w-5 !text-[6px] ring-0"
    />
    <span className="text-[12px] font-bold leading-none text-[#000000]">{shortName}</span>
  </button>
);
