import { cn } from '@utils/cn';

import { useDream11Palette } from '../hooks/useDream11Palette';

export type HomeMatchTab = 'recommended' | 'starting-soon' | 'popular';

const TABS: { id: HomeMatchTab; label: string }[] = [
  { id: 'recommended', label: 'Recommended' },
  { id: 'starting-soon', label: 'Starting Soon' },
  { id: 'popular', label: 'Popular' },
];

interface HomeMatchTabsProps {
  active: HomeMatchTab;
  onChange: (tab: HomeMatchTab) => void;
  className?: string;
}

/** Dream11 tabs — left-aligned, vertical dividers, red underline on active. */
export const HomeMatchTabs = ({
  active,
  onChange,
  className,
}: HomeMatchTabsProps): JSX.Element => {
  const palette = useDream11Palette();

  return (
    <nav
      aria-label="Match categories"
      className={cn('border-b', className)}
      style={{
        borderColor: palette.tabBorder,
        backgroundColor: palette.tabBar,
      }}
    >
      <div className="flex items-stretch px-2">
        {TABS.map((tab, index) => {
          const selected = active === tab.id;
          return (
            <div key={tab.id} className="flex items-stretch">
              {index > 0 ? (
                <span
                  aria-hidden
                  className="my-auto h-4 w-px shrink-0"
                  style={{ backgroundColor: palette.tabDivider }}
                />
              ) : null}
              <button
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => onChange(tab.id)}
                className={cn(
                  'relative px-2.5 py-2.5 text-[12px] sm:px-3 sm:text-[13px]',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d82d2c]/25',
                  selected ? 'font-bold' : 'font-normal',
                )}
                style={{ color: selected ? palette.red : palette.tabInactive }}
              >
                {tab.label}
                {selected ? (
                  <span
                    aria-hidden
                    className="absolute inset-x-2 bottom-0 h-[2px] rounded-full"
                    style={{ backgroundColor: palette.red }}
                  />
                ) : null}
              </button>
            </div>
          );
        })}
      </div>
    </nav>
  );
};
