import { useNavigate } from 'react-router-dom';

import { ROUTES } from '@constants/routes.constants';
import { useDream11Palette } from '@features/sports/hooks/useDream11Palette';

/** Come-style empty state — cricket illustration + CTA to home matches. */
export const MyMatchesEmptyState = (): JSX.Element => {
  const navigate = useNavigate();
  const palette = useDream11Palette();

  return (
    <div className="flex flex-col items-center px-4 pb-8 pt-6 text-center">
      <CricketPlayerIllustration className="mx-auto h-[180px] w-[220px] max-w-full" />

      <p
        className="mt-4 text-[15px] font-normal leading-snug"
        style={{ color: '#4a5568' }}
      >
        Ready to Play? Join a match now.
      </p>

      <button
        type="button"
        onClick={() => navigate(ROUTES.HOME)}
        className="mt-6 w-full max-w-[320px] rounded-[8px] border py-3.5 text-[13px] font-bold uppercase tracking-wide"
        style={{
          borderColor: palette.border,
          backgroundColor: '#f3f4f6',
          color: palette.textPrimary,
        }}
      >
        View Upcoming Matches
      </button>
    </div>
  );
};

const CricketPlayerIllustration = ({ className }: { className?: string }): JSX.Element => (
  <svg
    viewBox="0 0 220 180"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden
  >
    <ellipse cx="110" cy="168" rx="72" ry="8" fill="#e8edf2" />
    <rect x="28" y="118" width="164" height="42" rx="4" fill="#dce8d8" />
    <path d="M40 118h140v8c0 0-18 6-70 6s-70-6-70-6v-8z" fill="#c5dcc0" />
    <circle cx="175" cy="42" r="18" fill="#f5d547" opacity="0.35" />
    <circle cx="45" cy="52" r="12" fill="#f5d547" opacity="0.25" />
    <path
      d="M62 145c8-38 28-58 48-58s38 18 44 58"
      fill="#c62828"
    />
    <rect x="88" y="92" width="36" height="34" rx="4" fill="#f5f5f5" />
    <rect x="82" y="124" width="48" height="10" rx="2" fill="#eceff1" />
    <rect x="78" y="134" width="56" height="12" rx="2" fill="#eceff1" />
    <circle cx="118" cy="72" r="14" fill="#f4c9a8" />
    <path
      d="M104 68c2-10 12-16 22-14 8 2 12 10 10 18-1 6-6 10-12 10"
      fill="#5d4037"
    />
    <ellipse cx="52" cy="148" rx="10" ry="6" fill="#c62828" />
    <rect x="148" y="88" width="6" height="62" rx="2" fill="#8d6e63" transform="rotate(12 151 119)" />
    <rect x="154" y="82" width="18" height="8" rx="2" fill="#c62828" transform="rotate(12 163 86)" />
    <ellipse cx="46" cy="132" rx="14" ry="8" fill="#c62828" />
    <path d="M36 128h20v18c0 0-10 4-10 8s-10-8-10-8v-18z" fill="#fafafa" />
  </svg>
);
