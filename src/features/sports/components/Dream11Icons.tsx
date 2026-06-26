import { BellPlus, ChevronRight, Plus, Shirt } from 'lucide-react';

import type { Dream11Palette } from '../dream11.tokens';
import { useDream11Palette } from '../hooks/useDream11Palette';

/** Cricket bat + ball — 🏏 emoji in a themed circle. */
export const CricketBatBallIcon = ({
  palette: paletteProp,
}: {
  palette?: Dream11Palette;
}): JSX.Element => {
  const resolved = useDream11Palette();
  const palette = paletteProp ?? resolved;

  return (
    <span
      aria-hidden
      className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] leading-none"
      style={{ backgroundColor: palette.iconCircle }}
    >
      🏏
    </span>
  );
};

/** Outline jersey with a tiny plus — lineups / create team affordance. */
export const JerseyPlusIcon = ({
  palette: paletteProp,
}: {
  palette?: Dream11Palette;
}): JSX.Element => {
  const resolved = useDream11Palette();
  const palette = paletteProp ?? resolved;

  return (
    <span
      aria-hidden
      className="relative inline-flex h-4 w-4 shrink-0"
      style={{ color: palette.iconMuted }}
    >
      <Shirt className="h-4 w-4" strokeWidth={1.45} />
      <Plus
        className="absolute -right-[3px] -top-[2px] h-[7px] w-[7px]"
        strokeWidth={3}
      />
    </span>
  );
};

export { BellPlus, ChevronRight };
