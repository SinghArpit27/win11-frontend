import { cn } from '@utils/cn';

import type { Dream11Palette } from '../dream11.tokens';
import { useDream11Palette } from '../hooks/useDream11Palette';

interface MegaContestBadgeProps {
  amount?: string | null;
  placeholder?: string;
  className?: string;
  palette?: Dream11Palette;
}

/** Dream11 mega prize row — gold hexagon + bold INR amount with superscript +. */
export const MegaContestBadge = ({
  amount,
  placeholder = '₹1.27 Crores+',
  className,
  palette: paletteProp,
}: MegaContestBadgeProps): JSX.Element => {
  const resolved = useDream11Palette();
  const palette = paletteProp ?? resolved;
  const label = amount ?? placeholder;
  const hasPlus = label.endsWith('+');
  const base = hasPlus ? label.slice(0, -1) : label;

  return (
    <div className={cn('flex min-w-0 items-center gap-1.5', className)}>
      <MegaHexIcon />
      <span
        className="truncate text-[11px] font-bold leading-none"
        style={{ color: palette.textPrimary }}
      >
        {base}
        {hasPlus ? <sup className="ml-px text-[9px] font-bold leading-none">+</sup> : null}
      </span>
    </div>
  );
};

const MegaHexIcon = (): JSX.Element => (
  <svg aria-hidden viewBox="0 0 24 24" className="h-[18px] w-[18px] shrink-0" fill="none">
    <path
      d="M12 2.2 20.2 7v10L12 21.8 3.8 17V7L12 2.2z"
      fill="#f4c430"
      stroke="#c9a000"
      strokeWidth="0.7"
    />
    <text
      x="12"
      y="15.2"
      textAnchor="middle"
      fontSize="9.5"
      fontWeight="800"
      fill="#5c4a00"
      fontFamily="system-ui, sans-serif"
    >
      M
    </text>
  </svg>
);
