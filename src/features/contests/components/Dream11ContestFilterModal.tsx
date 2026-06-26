import { X } from 'lucide-react';
import { useEffect, useState } from 'react';

import {
  Modal,
  ModalContent,
  ModalTitle,
} from '@components/ui';
import { useDream11Palette } from '@features/sports/hooks/useDream11Palette';
import { cn } from '@utils/cn';

import type {
  Dream11AdvancedFilters,
  EntryFeeRange,
  PrizePoolRange,
  SpotsRange,
} from '../dream11.contest-filters';
import { EMPTY_ADVANCED_FILTERS } from '../dream11.contest-filters';

const ENTRY_FEE_OPTIONS: ReadonlyArray<{ id: EntryFeeRange; label: string }> = [
  { id: '1-50', label: '₹1 - ₹50' },
  { id: '51-100', label: '₹51 - ₹100' },
  { id: '101-500', label: '₹101 - ₹500' },
  { id: '501-1000', label: '₹501 - ₹1,000' },
  { id: '1001+', label: '₹1,001 & above' },
];

const PRIZE_POOL_OPTIONS: ReadonlyArray<{ id: PrizePoolRange; label: string }> = [
  { id: '1-10k', label: '₹1 - ₹10,000' },
  { id: '10k-50k', label: '₹10,001 - ₹50,000' },
  { id: '50k-1L', label: '₹50,001 - ₹1 Lakh' },
  { id: '1L+', label: '₹1 Lakh & above' },
];

const SPOTS_OPTIONS: ReadonlyArray<{ id: SpotsRange; label: string }> = [
  { id: '2', label: '2' },
  { id: '3-10', label: '3 - 10' },
  { id: '11-100', label: '11 - 100' },
  { id: '101-1000', label: '101 - 1,000' },
  { id: '1001+', label: '1,001 & above' },
];

interface Dream11ContestFilterModalProps {
  open: boolean;
  value: Dream11AdvancedFilters;
  onOpenChange: (open: boolean) => void;
  onApply: (next: Dream11AdvancedFilters) => void;
}

/** Dream11 bottom-sheet filter — entry fee, prize pool, contest spots. */
export const Dream11ContestFilterModal = ({
  open,
  value,
  onOpenChange,
  onApply,
}: Dream11ContestFilterModalProps): JSX.Element => {
  const palette = useDream11Palette();
  const [draft, setDraft] = useState<Dream11AdvancedFilters>(value);

  useEffect(() => {
    if (open) setDraft(value);
  }, [open, value]);

  const hasDraft = draft.entryFee !== null || draft.prizePool !== null || draft.spots !== null;

  const toggle = <K extends keyof Dream11AdvancedFilters>(
    key: K,
    id: Dream11AdvancedFilters[K],
  ): void => {
    setDraft((prev) => ({
      ...prev,
      [key]: prev[key] === id ? null : id,
    }));
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent
        showClose={false}
        className="max-h-[85vh] gap-0 overflow-y-auto rounded-t-2xl bg-white px-0 pb-0 pt-0 md:max-w-lg"
      >
        <div
          className="relative border-b px-4 py-3"
          style={{ borderColor: palette.border }}
        >
          <button
            type="button"
            aria-label="Close filter"
            onClick={() => onOpenChange(false)}
            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full p-1"
            style={{ color: palette.textTertiary }}
          >
            <X className="h-5 w-5" />
          </button>
          <ModalTitle
            className="text-center text-[15px] font-bold"
            style={{ color: palette.textPrimary }}
          >
            Filter
          </ModalTitle>
        </div>

        <div className="space-y-5 px-4 py-4">
          <FilterSection
            title="Entry Fee"
            options={ENTRY_FEE_OPTIONS}
            selected={draft.entryFee}
            onSelect={(id) => toggle('entryFee', id)}
            palette={palette}
          />
          <FilterSection
            title="Prize Pool"
            options={PRIZE_POOL_OPTIONS}
            selected={draft.prizePool}
            onSelect={(id) => toggle('prizePool', id)}
            palette={palette}
          />
          <FilterSection
            title="Contest Spots"
            options={SPOTS_OPTIONS}
            selected={draft.spots}
            onSelect={(id) => toggle('spots', id)}
            palette={palette}
          />
        </div>

        <div
          className="grid grid-cols-2 gap-3 border-t px-4 py-3"
          style={{
            borderColor: palette.border,
            backgroundColor: palette.card,
          }}
        >
          <button
            type="button"
            disabled={!hasDraft}
            onClick={() => setDraft(EMPTY_ADVANCED_FILTERS)}
            className={cn(
              'rounded-md border py-2.5 text-[13px] font-bold uppercase tracking-wide',
              !hasDraft && 'opacity-50',
            )}
            style={{
              borderColor: palette.border,
              backgroundColor: '#f5f5f5',
              color: palette.textTertiary,
            }}
          >
            Clear
          </button>
          <button
            type="button"
            onClick={() => {
              onApply(draft);
              onOpenChange(false);
            }}
            className="rounded-md py-2.5 text-[13px] font-bold uppercase tracking-wide text-white"
            style={{ backgroundColor: '#2e7d32' }}
          >
            Apply
          </button>
        </div>
      </ModalContent>
    </Modal>
  );
};

const FilterSection = <T extends string>({
  title,
  options,
  selected,
  onSelect,
  palette,
}: {
  title: string;
  options: ReadonlyArray<{ id: T; label: string }>;
  selected: T | null;
  onSelect: (id: T) => void;
  palette: ReturnType<typeof useDream11Palette>;
}): JSX.Element => (
  <section>
    <h3
      className="mb-2 text-[12px] font-normal"
      style={{ color: palette.textTertiary }}
    >
      {title}
    </h3>
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = selected === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onSelect(opt.id)}
            className={cn(
              'rounded-full border px-3 py-1.5 text-[11px] font-normal leading-none',
              active && 'font-semibold',
            )}
            style={{
              borderColor: active ? palette.red : '#e0e0e0',
              backgroundColor: palette.card,
              color: active ? palette.red : palette.textPrimary,
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  </section>
);
