import { ArrowRight, Check, ChevronDown, Medal, Pencil } from 'lucide-react';
import { memo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { ROUTES } from '@constants/routes.constants';
import type { FantasyTeam } from '@features/fantasy/fantasy.types';
import { useDream11Palette } from '@features/sports/hooks/useDream11Palette';
import { ContestStatus } from '@shared/enums';
import { cn } from '@utils/cn';
import { buildRoute } from '@utils/routes.util';

import type { ContestEntry, ContestSummary } from '../contest.types';

interface MatchHubJoinedContestCardProps {
  matchId: string;
  contest: ContestSummary;
  entries: ContestEntry[];
  teamsById: Map<string, FantasyTeam>;
  onOpenContest?: () => void;
}

const initialsOf = (name: string): string => {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return name.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
};

const MatchHubJoinedContestCardComponent = ({
  matchId,
  contest,
  entries,
  teamsById,
  onOpenContest,
}: MatchHubJoinedContestCardProps): JSX.Element => {
  const palette = useDream11Palette();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);

  const left = Math.max(0, contest.totalSpots - contest.filledSpots);
  const fillPct = Math.min(100, Math.max(0, Math.round(contest.fillPercentage)));
  const isFull = contest.status === ContestStatus.FULL || left === 0;
  const teamLabel = `${entries.length} teams`;

  return (
    <article
      className="overflow-hidden rounded-[10px] border bg-white shadow-[0_1px_6px_rgba(0,0,0,0.08)]"
      style={{ borderColor: palette.border }}
    >
      <button
        type="button"
        onClick={onOpenContest}
        className="w-full px-3 pb-2.5 pt-3 text-left"
      >
        {contest.isGuaranteed ? (
          <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold leading-none text-[#757575]">
            <span
              aria-hidden
              className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#2e7d32]"
            >
              <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />
            </span>
            Guaranteed
          </div>
        ) : null}

        <p className="text-[18px] font-extrabold leading-tight text-[#212121]">{contest.name}</p>

        <div className="mt-2.5 flex items-center justify-between gap-2">
          <span className="inline-flex min-w-0 items-center gap-1 text-[11px] font-semibold text-[#212121]">
            <Medal className="h-3.5 w-3.5 shrink-0 text-[#f4c430]" aria-hidden />
            <span className="truncate">Glory awaits!</span>
            <span
              aria-hidden
              className="ml-0.5 inline-flex h-4 min-w-[16px] shrink-0 items-center justify-center rounded-[3px] border px-0.5 text-[9px] font-bold leading-none"
              style={{ borderColor: '#90a4ae', color: '#607d8b' }}
            >
              S
            </span>
          </span>

          <div className="flex shrink-0 items-center gap-1.5 text-[10px] font-semibold leading-none">
            {isFull ? (
              <span className="text-[#d82d2c]">Full</span>
            ) : (
              <span className="text-[#d82d2c]">{left} Left</span>
            )}
            <span className="text-[#bdbdbd]">|</span>
            <span className="font-normal text-[#757575]">
              {contest.totalSpots.toLocaleString('en-IN')} spots
            </span>
          </div>
        </div>

        <div className="mt-1.5 h-[3px] w-full overflow-hidden rounded-full bg-[#ececec]">
          <div
            className="h-full rounded-full bg-[#d82d2c]"
            style={{ width: `${fillPct}%` }}
          />
        </div>
      </button>

      <div className="border-t" style={{ borderColor: palette.border }}>
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex w-full items-center justify-between px-3 py-2.5 text-left"
        >
          <span className="text-[12px] font-normal text-[#424242]">
            Joined with {teamLabel}
          </span>
          <ChevronDown
            className={cn('h-4 w-4 transition-transform', expanded && 'rotate-180')}
            style={{ color: palette.textMuted }}
            aria-hidden
          />
        </button>

        {expanded ? (
          <div className="flex flex-col gap-2 px-3 pb-3">
            {entries.map((entry, index) => {
              const team = teamsById.get(entry.teamId);
              const tag = `T${entry.entryNumber || index + 1}`;
              const captain = team?.players.find((p) => p.isCaptain);
              const viceCaptain = team?.players.find((p) => p.isViceCaptain);

              return (
                <div key={entry.id} className="flex flex-col gap-1.5">
                  <span
                    className="inline-flex h-7 w-7 items-center justify-center self-start rounded-full text-[11px] font-bold text-[#607d8b]"
                    style={{ backgroundColor: '#eceff1' }}
                  >
                    {tag}
                  </span>

                  <div
                    className="rounded-[8px] border bg-white px-2.5 py-2.5"
                    style={{ borderColor: palette.border }}
                  >
                    <div className="mb-2.5 flex items-center justify-between">
                      <span
                        className="inline-flex h-6 min-w-[28px] items-center justify-center rounded-[4px] px-1.5 text-[11px] font-bold text-[#607d8b]"
                        style={{ backgroundColor: '#eceff1' }}
                      >
                        {tag}
                      </span>
                      <div className="flex items-center gap-0.5">
                        <button
                          type="button"
                          aria-label="Edit team"
                          onClick={() =>
                            navigate(
                              `${buildRoute(ROUTES.FANTASY_CREATE_TEAM, { matchId })}?editTeamId=${entry.teamId}`,
                            )
                          }
                          className="rounded-full p-1.5 text-[#757575] hover:bg-[#f5f5f5]"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          aria-label="Switch team"
                          className="rounded-full p-1.5 text-[#757575] hover:bg-[#f5f5f5]"
                        >
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-start gap-5">
                      <JoinedPlayerBlock
                        label="C"
                        name={captain?.player?.shortName ?? captain?.player?.name ?? '—'}
                        photoUrl={captain?.player?.photoUrl ?? null}
                        fallback={initialsOf(captain?.player?.name ?? 'C')}
                      />
                      <JoinedPlayerBlock
                        label="VC"
                        name={viceCaptain?.player?.shortName ?? viceCaptain?.player?.name ?? '—'}
                        photoUrl={viceCaptain?.player?.photoUrl ?? null}
                        fallback={initialsOf(viceCaptain?.player?.name ?? 'VC')}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}
      </div>
    </article>
  );
};

const JoinedPlayerBlock = ({
  label,
  name,
  photoUrl,
  fallback,
}: {
  label: 'C' | 'VC';
  name: string;
  photoUrl: string | null;
  fallback: string;
}): JSX.Element => (
  <div className="flex min-w-0 flex-1 flex-col gap-1">
    <span className="text-[10px] font-bold leading-none text-[#757575]">{label}</span>
    <div className="flex min-w-0 items-center gap-2">
      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-[#eceff1]">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover object-top"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[11px] font-bold text-[#78909c]">
            {fallback}
          </div>
        )}
      </div>
      <span className="truncate text-[11px] font-semibold leading-tight text-[#212121]">
        {name}
      </span>
    </div>
  </div>
);

export const MatchHubJoinedContestCard = memo(MatchHubJoinedContestCardComponent);
