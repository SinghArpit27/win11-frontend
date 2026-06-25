import { cn } from '@utils/cn';

/**
 * Mega-contest prize indicator shown in the match-card footer.
 *
 *  Phase 4 ships a *placeholder* — actual prize-pool data lands with the
 *  Contest module in Phase 6. The visual structure is finalised here so
 *  swapping the data later is a one-line change.
 *
 *  Visual contract:
 *   - Hexagonal "M" badge in the brand primary tone on the left.
 *   - Amount (or "Coming Soon") on the right.
 *   - Inherits the parent's typography colour by default.
 *
 *  Reusable across home / matches list / details footer rows.
 */
interface MegaContestBadgeProps {
  /** Pre-formatted prize amount (e.g. `₹57.03 Lakhs+`). Optional. */
  amount?: string | null;
  /** Override the placeholder text when no amount is available. */
  placeholder?: string;
  className?: string;
}

export const MegaContestBadge = ({
  amount,
  placeholder = 'Coming Soon',
  className,
}: MegaContestBadgeProps): JSX.Element => (
  <div className={cn('flex items-center gap-2 text-xs font-semibold', className)}>
    <MegaHexIcon />
    <span className={amount ? 'text-text' : 'text-text-muted'}>
      {amount ?? placeholder}
    </span>
  </div>
);

const MegaHexIcon = (): JSX.Element => (
  <svg
    aria-hidden
    viewBox="0 0 24 24"
    className="h-5 w-5 shrink-0"
    fill="none"
  >
    <path
      d="M12 1.5l9.526 5.5v11L12 23.5 2.474 18V7L12 1.5z"
      fill="var(--w11-color-warning)"
      opacity="0.18"
    />
    <path
      d="M12 1.5l9.526 5.5v11L12 23.5 2.474 18V7L12 1.5z"
      stroke="var(--w11-color-warning)"
      strokeWidth="1.4"
    />
    <text
      x="12"
      y="16"
      textAnchor="middle"
      fontSize="11"
      fontWeight="800"
      fill="var(--w11-color-warning)"
      fontFamily="system-ui, sans-serif"
    >
      M
    </text>
  </svg>
);
