import { Eye } from 'lucide-react';
import { memo } from 'react';

import { cn } from '@utils/cn';

interface FantasyCreateTeamFooterProps {
  onPreview: () => void;
  onNext: () => void;
  previewDisabled?: boolean;
  nextDisabled?: boolean;
  className?: string;
}

/** Floating Preview + Next pills — no pitch bar, no validation strip. */
const FantasyCreateTeamFooterComponent = ({
  onPreview,
  onNext,
  previewDisabled,
  nextDisabled,
  className,
}: FantasyCreateTeamFooterProps): JSX.Element => (
  <div
    className={cn(
      'pointer-events-none fixed inset-x-0 bottom-[max(env(safe-area-inset-bottom),14px)] z-40',
      'flex items-center justify-center gap-2.5 px-4',
      className,
    )}
  >
    <button
      type="button"
      onClick={onPreview}
      disabled={previewDisabled}
      className={cn(
        'pointer-events-auto inline-flex items-center justify-center gap-2 rounded-full px-6 py-3',
        'bg-[#0a1628] text-[11px] font-bold uppercase tracking-wider text-white',
        'shadow-[0_8px_24px_rgba(0,0,0,0.35)] transition-all',
        'hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0a1628]/40',
        'disabled:cursor-not-allowed disabled:opacity-45',
      )}
    >
      <Eye className="h-4 w-4" strokeWidth={2.25} />
      Preview
    </button>
    <button
      type="button"
      onClick={onNext}
      disabled={nextDisabled}
      className={cn(
        'pointer-events-auto inline-flex min-w-[7.5rem] items-center justify-center rounded-full px-8 py-3',
        'text-[11px] font-bold uppercase tracking-wider shadow-[0_8px_24px_rgba(0,0,0,0.2)] transition-all',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#43a047]/40',
        nextDisabled
          ? 'cursor-not-allowed bg-[#cfd8dc] text-[#78909c]'
          : 'text-white hover:brightness-110',
      )}
      style={nextDisabled ? undefined : { backgroundColor: '#1fa444' }}
    >
      Next
    </button>
  </div>
);

export const FantasyCreateTeamFooter = memo(FantasyCreateTeamFooterComponent);
