import { memo, type ReactNode } from 'react';

import { cn } from '@utils/cn';

interface FantasySortChipProps {
  label: string;
  icon?: ReactNode;
  active: boolean;
  onClick: () => void;
}

const FantasySortChipComponent = ({
  label,
  icon,
  active,
  onClick,
}: FantasySortChipProps): JSX.Element => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={active}
    className={cn(
      'flex shrink-0 items-center gap-1 rounded-full border px-3 py-1.5 text-[11px] font-semibold transition-colors',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
      active
        ? 'border-text bg-text text-bg'
        : 'border-border bg-surface text-text-muted hover:border-border-strong hover:text-text',
    )}
  >
    <span>{label}</span>
    {icon}
  </button>
);

export const FantasySortChip = memo(FantasySortChipComponent);
