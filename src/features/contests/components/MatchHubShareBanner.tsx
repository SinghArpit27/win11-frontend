import { Share2 } from 'lucide-react';

/** Come-style share strip above joined contests. */
export const MatchHubShareBanner = (): JSX.Element => (
  <div
    className="mx-2 mt-2 flex items-center justify-between gap-3 rounded-[8px] px-3 py-2.5"
    style={{ backgroundColor: '#e8f4fc' }}
  >
    <p className="text-[12px] font-semibold leading-snug" style={{ color: '#1a3a5c' }}>
      Share this contest with your friends!
    </p>
    <button
      type="button"
      aria-label="Share contest"
      className="shrink-0 rounded-full p-1.5"
      style={{ color: '#1a3a5c' }}
    >
      <Share2 className="h-4 w-4" strokeWidth={2} />
    </button>
  </div>
);
