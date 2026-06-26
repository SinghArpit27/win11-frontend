import { ChevronDown } from 'lucide-react';
import { memo } from 'react';

import { cn } from '@utils/cn';

import { CREATE_TEAM_COLORS, CREATE_TEAM_LAYOUT } from '../fantasy.create-team.tokens';
import { SplitPlayerColumnHeader } from './PlayerListRow';

interface SquadListHeaderProps {
  homeLabel: React.ReactNode;
  awayLabel: React.ReactNode;
  creditsDesc: boolean;
  onToggleCreditsSort: () => void;
  className?: string;
}

/**
 * Dream11 squad list chrome:
 *  1. White row — team · Credits pill · team
 *  2. `#f8fbff` row — % Sel By · Credits (×2 columns)
 *  3. Navy “Squad” tab straddling header ↔ list
 */
const SquadListHeaderComponent = ({
  homeLabel,
  awayLabel,
  creditsDesc,
  onToggleCreditsSort,
  className,
}: SquadListHeaderProps): JSX.Element => (
  <div className={cn('shrink-0', className)}>
    <div
      className="flex items-center justify-between gap-2 border-b"
      style={{
        backgroundColor: CREATE_TEAM_COLORS.white,
        borderColor: CREATE_TEAM_COLORS.divider,
        paddingLeft: 12,
        paddingRight: 12,
        paddingTop: 8,
        paddingBottom: 8,
      }}
    >
      {homeLabel}
      <button
        type="button"
        onClick={onToggleCreditsSort}
        className="inline-flex items-center gap-1 rounded-full border bg-[#ffffff] font-semibold text-[#000000]"
        style={{
          borderColor: CREATE_TEAM_COLORS.divider,
          fontSize: CREATE_TEAM_LAYOUT.creditsPillFontPx,
          paddingLeft: 10,
          paddingRight: 10,
          paddingTop: 3,
          paddingBottom: 3,
        }}
        aria-label="Sort by credits"
      >
        Credits
        <ChevronDown
          className={cn('h-3 w-3 transition-transform', !creditsDesc && 'rotate-180')}
          strokeWidth={2.5}
        />
      </button>
      {awayLabel}
    </div>

    <div
      className="relative border-b"
      style={{
        backgroundColor: CREATE_TEAM_COLORS.columnHeaderBg,
        borderColor: CREATE_TEAM_COLORS.divider,
        paddingBottom: 14,
      }}
    >
      <div className="grid grid-cols-2">
        <SplitPlayerColumnHeader />
        <SplitPlayerColumnHeader className="border-l border-dashed border-[#d8d8d8]" />
      </div>

      <div
        className="pointer-events-none absolute bottom-0 left-1/2 z-10 -translate-x-1/2 translate-y-1/2"
        aria-hidden
      >
        <span
          className="inline-block rounded-sm font-bold uppercase tracking-wider text-white"
          style={{
            backgroundColor: CREATE_TEAM_COLORS.squadTab,
            fontSize: CREATE_TEAM_LAYOUT.squadTabFontPx,
            paddingLeft: 16,
            paddingRight: 16,
            paddingTop: 4,
            paddingBottom: 4,
          }}
        >
          Squad
        </span>
      </div>
    </div>
  </div>
);

export const SquadListHeader = memo(SquadListHeaderComponent);
