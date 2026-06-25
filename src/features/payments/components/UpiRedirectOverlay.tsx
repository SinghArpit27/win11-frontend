import { Loader2, Smartphone } from 'lucide-react';

import { Typography } from '@components/ui';

import { upiAppLabel, type UpiAppId } from '../upi.types';

interface UpiRedirectOverlayProps {
  app: UpiAppId;
  amountLabel: string;
  simulating?: boolean;
}

export const UpiRedirectOverlay = ({
  app,
  amountLabel,
  simulating = false,
}: UpiRedirectOverlayProps): JSX.Element => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
    <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-6 text-center shadow-glow">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary-soft">
        {simulating ? (
          <Loader2 className="h-7 w-7 animate-spin text-primary" aria-hidden />
        ) : (
          <Smartphone className="h-7 w-7 text-primary" aria-hidden />
        )}
      </div>
      <Typography variant="h3" className="text-lg">
        Opening {upiAppLabel(app)}
      </Typography>
      <Typography variant="body" tone="muted" className="mt-2">
        {simulating
          ? `Simulating UPI payment of ${amountLabel}…`
          : `Complete ${amountLabel} in your ${upiAppLabel(app)} app, then return here.`}
      </Typography>
    </div>
  </div>
);
