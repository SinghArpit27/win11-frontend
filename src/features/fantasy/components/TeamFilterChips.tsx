import { memo } from 'react';

import { cn } from '@utils/cn';

import type { FantasyMatchContext } from '../fantasy.types';

/**
 * Two-team filter chips used to scope the player listing to either
 * real-world team. Plus an "All" chip on the left. Renders compact at
 * mobile widths.
 */
interface TeamFilterChipsProps {
  context: FantasyMatchContext;
  active: 'ALL' | string;
  onChange: (teamId: 'ALL' | string) => void;
  countByTeam: Record<string, number>;
  className?: string;
}

const TeamFilterChipsComponent = ({
  context,
  active,
  onChange,
  countByTeam,
  className,
}: TeamFilterChipsProps): JSX.Element => {
  const teams = Array.from(
    new Map(
      context.players.flatMap((p) => (p.team ? [[p.team.id, p.team]] : [])),
    ).values(),
  );

  return (
    <div className={cn('flex items-center gap-1.5 overflow-x-auto pb-1', className)}>
      <Chip
        label="All"
        sublabel={String(
          Object.values(countByTeam).reduce((sum, n) => sum + n, 0) || 0,
        )}
        active={active === 'ALL'}
        onClick={() => onChange('ALL')}
      />
      {teams.map((team) => (
        <Chip
          key={team.id}
          label={team.shortName}
          sublabel={String(countByTeam[team.id] ?? 0)}
          active={active === team.id}
          accentColor={team.primaryColor ?? undefined}
          onClick={() => onChange(team.id)}
        />
      ))}
    </div>
  );
};

const Chip = ({
  label,
  sublabel,
  active,
  accentColor,
  onClick,
}: {
  label: string;
  sublabel: string;
  active: boolean;
  accentColor?: string;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={active}
    className={cn(
      'flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
      active
        ? 'border-transparent bg-primary text-primary-foreground'
        : 'border-border bg-surface text-text hover:border-border-strong',
    )}
    style={
      active && accentColor
        ? { backgroundColor: accentColor, color: '#fff' }
        : undefined
    }
  >
    <span className="uppercase tracking-wider">{label}</span>
    <span
      className={cn(
        'rounded-full px-1.5 text-[10px] font-bold',
        active ? 'bg-white/20 text-white' : 'bg-surface-elevated text-text-muted',
      )}
    >
      {sublabel}
    </span>
  </button>
);

export const TeamFilterChips = memo(TeamFilterChipsComponent);
