import { CreditCard, ChevronLeft } from 'lucide-react';

import { Button, Typography } from '@components/ui';
import { cn } from '@utils/cn';

import { UPI_APP_OPTIONS, type UpiAppId } from '../upi.types';

interface UpiAppSelectorProps {
  amountLabel: string;
  loading?: boolean;
  selectedApp?: UpiAppId | null;
  onSelect: (app: UpiAppId) => void;
  onBack: () => void;
}

export const UpiAppSelector = ({
  amountLabel,
  loading = false,
  selectedApp,
  onSelect,
  onBack,
}: UpiAppSelectorProps): JSX.Element => (
  <div className="space-y-4">
    <div className="flex items-center gap-2">
      <Button type="button" variant="ghost" size="sm" onClick={onBack} disabled={loading}>
        <ChevronLeft className="h-4 w-4" />
        Back
      </Button>
      <Typography variant="caption" tone="muted">
        Pay {amountLabel} via UPI
      </Typography>
    </div>

    <Typography variant="label">Choose your UPI app</Typography>

    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {UPI_APP_OPTIONS.map((app) => (
        <button
          key={app.id}
          type="button"
          disabled={loading}
          onClick={() => onSelect(app.id)}
          className={cn(
            'flex flex-col items-center gap-2 rounded-xl border border-border bg-surface-elevated p-4 text-center transition-all',
            'hover:border-primary hover:shadow-md active:scale-[0.98]',
            'disabled:pointer-events-none disabled:opacity-60',
            selectedApp === app.id && 'border-primary ring-2 ring-primary/30',
          )}
        >
          <span
            className={cn(
              'flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br text-sm font-bold text-white shadow-sm',
              app.gradient,
            )}
          >
            {app.badge}
          </span>
          <span className="text-xs font-semibold text-text">{app.label}</span>
        </button>
      ))}
    </div>

    <div className="flex items-start gap-2 rounded-lg border border-border/60 bg-surface-muted/30 px-3 py-2">
      <CreditCard className="mt-0.5 h-4 w-4 shrink-0 text-text-muted" aria-hidden />
      <Typography variant="caption" tone="muted" className="text-left">
        Tap an app to open it and approve the payment. Your wallet updates automatically once confirmed.
      </Typography>
    </div>
  </div>
);
