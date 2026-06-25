import { cn } from '@utils/cn';

/**
 * Pulsing "LIVE" pill rendered on top of match cards while a match is
 * in progress. Uses Tailwind's `animate-pulse` on the dot — the label
 * itself stays static for readability.
 */
interface LiveBadgeProps {
  label?: string;
  className?: string;
}

export const LiveBadge = ({ label = 'LIVE', className }: LiveBadgeProps): JSX.Element => (
  <span
    className={cn(
      'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider',
      'bg-danger/15 text-danger ring-1 ring-inset ring-danger/40',
      className,
    )}
    aria-label={label}
  >
    <span className="relative inline-flex h-2 w-2">
      <span className="absolute inset-0 animate-ping rounded-full bg-danger opacity-75" />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-danger" />
    </span>
    {label}
  </span>
);
