import { memo } from 'react';

import { Skeleton } from '@components/ui';
import { QueryErrorState } from '@components/common/QueryErrorState';
import { useGetContestLeaderboardQuery } from '@features/leaderboard/leaderboard.api';
import type { LeaderboardRow } from '@features/leaderboard/leaderboard.types';
import { useDream11Palette } from '@features/sports/hooks/useDream11Palette';

interface ContestDetailLeaderboardPanelProps {
  contestId: string;
}

const initialsOf = (name: string): string => {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return name.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
};

const ComeLeaderboardRow = ({ row }: { row: LeaderboardRow }): JSX.Element => (
  <div
    className="flex items-center gap-3 px-3 py-3"
    style={{
      backgroundColor: row.isSelf ? '#fffde7' : '#fff',
    }}
  >
    <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#eceff1] text-[11px] font-bold text-[#78909c]">
      {row.avatarUrl ? (
        <img src={row.avatarUrl} alt="" loading="lazy" className="h-full w-full object-cover" />
      ) : (
        initialsOf(row.displayName)
      )}
    </div>
    <p
      className="min-w-0 flex-1 truncate text-[13px] font-semibold"
      style={{ color: '#212121' }}
    >
      {row.displayName}
    </p>
    <span
      className="inline-flex h-6 min-w-[28px] shrink-0 items-center justify-center rounded-[4px] px-1.5 text-[11px] font-bold"
      style={{ backgroundColor: '#eceff1', color: '#607d8b' }}
    >
      T{row.entryNumber}
    </span>
  </div>
);

const ContestDetailLeaderboardPanelComponent = ({
  contestId,
}: ContestDetailLeaderboardPanelProps): JSX.Element => {
  const palette = useDream11Palette();
  const leaderboardQuery = useGetContestLeaderboardQuery(
    { contestId, page: 1, limit: 100 },
    { skip: !contestId },
  );

  if (leaderboardQuery.isLoading) {
    return (
      <div className="flex flex-col gap-2 p-3">
        <Skeleton className="h-8 w-full rounded-none" />
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-none" />
        ))}
      </div>
    );
  }

  if (leaderboardQuery.isError) {
    return (
      <QueryErrorState
        error={leaderboardQuery.error}
        title="Unable to load leaderboard"
        onRetry={() => leaderboardQuery.refetch()}
        className="mx-3 my-4"
      />
    );
  }

  const page = leaderboardQuery.data;
  const rows = page?.rows ?? [];
  const total = page?.meta.totalEntries ?? rows.length;

  return (
    <div className="flex flex-col pb-8">
      <div
        className="px-3 py-2.5 text-[12px] font-semibold"
        style={{ backgroundColor: '#f5f5f5', color: palette.textMuted }}
      >
        All Teams ({total.toLocaleString('en-IN')})
      </div>

      {rows.length === 0 ? (
        <p className="px-4 py-10 text-center text-[12px]" style={{ color: palette.textMuted }}>
          No teams joined yet.
        </p>
      ) : (
        <div className="flex flex-col">
          {rows.map((row) => (
            <div key={row.entryId} className="border-b border-[#f0f0f0] last:border-b-0">
              <ComeLeaderboardRow row={row} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const ContestDetailLeaderboardPanel = memo(ContestDetailLeaderboardPanelComponent);
