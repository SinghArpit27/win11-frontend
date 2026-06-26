import { Medal } from 'lucide-react';

/** Come-style incentive strip below the JOIN button. */
export const ContestDetailGloryBar = (): JSX.Element => (
  <div
    className="flex items-center gap-2 border-y px-3 py-2.5"
    style={{
      borderColor: '#e3edf3',
      backgroundColor: '#eef5f9',
    }}
  >
    <Medal className="h-4 w-4 shrink-0 text-[#f4c430]" aria-hidden />
    <span className="text-[12px] font-semibold" style={{ color: '#1a237e' }}>
      Glory awaits!
    </span>
    <span
      aria-hidden
      className="ml-0.5 inline-flex h-4 w-4 items-center justify-center rounded-[3px] border text-[9px] font-bold"
      style={{ borderColor: '#90a4ae', color: '#607d8b' }}
    >
      S
    </span>
  </div>
);
