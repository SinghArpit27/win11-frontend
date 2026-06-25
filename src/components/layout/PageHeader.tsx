import type { ReactNode } from 'react';

import { Typography } from '@components/ui';
import { cn } from '@utils/cn';

interface PageHeaderProps {
  /** Eyebrow text above the title (caps, muted). */
  eyebrow?: ReactNode;
  /** Main page title. */
  title: ReactNode;
  /** Optional subtitle / description rendered under the title. */
  subtitle?: ReactNode;
  /** Right-aligned actions (buttons, filters). Stacks below title on mobile. */
  actions?: ReactNode;
  /** Sticky toolbar / chips rendered under the title row. */
  trailing?: ReactNode;
  className?: string;
}

/**
 * Standardised page header used by every authenticated screen.
 *
 * Responsive contract:
 *  - mobile  → title and actions stack vertically, actions full-width below.
 *  - sm+     → title left, actions right on the same row.
 *  - lg+     → wider gap, larger title typography.
 */
export const PageHeader = ({
  eyebrow,
  title,
  subtitle,
  actions,
  trailing,
  className,
}: PageHeaderProps): JSX.Element => (
  <header className={cn('flex flex-col gap-3', className)}>
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
      <div className="min-w-0 space-y-1">
        {eyebrow ? (
          <Typography variant="overline" tone="muted">
            {eyebrow}
          </Typography>
        ) : null}
        <Typography
          variant="h2"
          className="truncate text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl"
        >
          {title}
        </Typography>
        {subtitle ? (
          <Typography variant="body" tone="muted" className="max-w-2xl">
            {subtitle}
          </Typography>
        ) : null}
      </div>
      {actions ? (
        <div className="flex flex-wrap items-center gap-2 sm:justify-end">{actions}</div>
      ) : null}
    </div>
    {trailing ? <div className="flex flex-wrap items-center gap-2">{trailing}</div> : null}
  </header>
);
