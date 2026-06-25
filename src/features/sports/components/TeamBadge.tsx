import { cn } from '@utils/cn';

/**
 * `TeamBadge` — round emblem with the team's short code over its primary
 * colour, with the team logo overlaid if present. Used on cards, sidebar
 * rosters, and the match-detail header.
 *
 * Falls back gracefully when:
 *   - no logo  → renders the short code with brand colour wash,
 *   - no colour → uses theme-neutral surface so the badge still pops.
 */
interface TeamBadgeProps {
  shortName: string;
  name?: string;
  logoUrl?: string | null;
  primaryColor?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const SIZE_CLASS: Record<NonNullable<TeamBadgeProps['size']>, string> = {
  sm: 'h-8 w-8 text-[10px]',
  md: 'h-12 w-12 text-xs',
  lg: 'h-16 w-16 text-sm',
  xl: 'h-20 w-20 text-base',
};

export const TeamBadge = ({
  shortName,
  name,
  logoUrl,
  primaryColor,
  size = 'md',
  className,
}: TeamBadgeProps): JSX.Element => {
  const style = primaryColor
    ? {
        backgroundImage: `linear-gradient(135deg, ${primaryColor}cc 0%, ${primaryColor}66 100%)`,
        boxShadow: `inset 0 0 0 1px ${primaryColor}55`,
      }
    : undefined;

  return (
    <div
      role="img"
      aria-label={name ?? shortName}
      style={style}
      className={cn(
        'relative flex shrink-0 items-center justify-center overflow-hidden rounded-full',
        'bg-surface-elevated text-white font-bold tracking-wide',
        SIZE_CLASS[size],
        className,
      )}
    >
      {logoUrl ? (
        <img
          src={logoUrl}
          alt=""
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : null}
      {!logoUrl ? <span className="relative drop-shadow-sm">{shortName}</span> : null}
    </div>
  );
};
