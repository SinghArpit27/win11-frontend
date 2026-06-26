import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { ROUTES } from '@constants/routes.constants';
import type { FantasyTeam } from '@features/fantasy/fantasy.types';
import { useDream11Palette } from '@features/sports/hooks/useDream11Palette';
import { buildRoute } from '@utils/routes.util';

import type { ContestEntry } from '../contest.types';
import { MatchHubJoinedContestCard } from './MatchHubJoinedContestCard';
import { MatchHubShareBanner } from './MatchHubShareBanner';

interface MatchHubMyMatchesPanelProps {
  matchId: string;
  entries: ContestEntry[];
  teams: FantasyTeam[];
}

export const MatchHubMyMatchesPanel = ({
  matchId,
  entries,
  teams,
}: MatchHubMyMatchesPanelProps): JSX.Element => {
  const palette = useDream11Palette();
  const navigate = useNavigate();

  const teamsById = useMemo(
    () => new Map(teams.map((team) => [team.id, team])),
    [teams],
  );

  const joinedGroups = useMemo(() => {
    const map = new Map<
      string,
      { contest: NonNullable<ContestEntry['contest']>; entries: ContestEntry[] }
    >();
    for (const entry of entries) {
      if (!entry.contest) continue;
      const bucket = map.get(entry.contestId);
      if (bucket) bucket.entries.push(entry);
      else map.set(entry.contestId, { contest: entry.contest, entries: [entry] });
    }
    return [...map.values()];
  }, [entries]);

  if (joinedGroups.length === 0) {
    return (
      <div
        className="mx-2 mt-3 rounded-[10px] border px-4 py-12 text-center"
        style={{ borderColor: palette.border, backgroundColor: palette.card }}
      >
        <p className="text-[13px] font-bold" style={{ color: palette.textPrimary }}>
          No joined contests yet
        </p>
        <p className="mt-1 text-[11px]" style={{ color: palette.textMuted }}>
          Join a contest from the Contests tab.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 pb-4">
      <MatchHubShareBanner />
      <div className="flex flex-col gap-2 px-2">
        {joinedGroups.map(({ contest, entries: contestEntries }) => (
          <MatchHubJoinedContestCard
            key={contest.id}
            matchId={matchId}
            contest={contest}
            entries={contestEntries}
            teamsById={teamsById}
            onOpenContest={() =>
              navigate(buildRoute(ROUTES.CONTEST_DETAIL, { matchId, contestId: contest.id }))
            }
          />
        ))}
      </div>
    </div>
  );
};
