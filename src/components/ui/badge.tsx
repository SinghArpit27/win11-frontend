import { cva, type VariantProps } from 'class-variance-authority';
import type { HTMLAttributes } from 'react';

import { cn } from '@utils/cn';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-pill px-2.5 py-0.5 text-[11px] font-semibold leading-none whitespace-nowrap',
  {
    variants: {
      tone: {
        neutral: 'bg-surface-elevated text-text-muted border border-border',
        primary: 'bg-primary-muted text-primary',
        accent: 'bg-[color-mix(in_srgb,var(--w11-color-accent)_18%,transparent)] text-accent',
        success: 'bg-[color-mix(in_srgb,var(--w11-color-success)_18%,transparent)] text-success',
        warning: 'bg-[color-mix(in_srgb,var(--w11-color-warning)_18%,transparent)] text-warning',
        danger: 'bg-[color-mix(in_srgb,var(--w11-color-danger)_18%,transparent)] text-danger',
        info: 'bg-[color-mix(in_srgb,var(--w11-color-info)_18%,transparent)] text-info',
        solid: 'bg-primary text-[var(--w11-color-primary-foreground)]',
      },
    },
    defaultVariants: { tone: 'neutral' },
  },
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export const Badge = ({ className, tone, ...props }: BadgeProps): JSX.Element => (
  <span className={cn(badgeVariants({ tone }), className)} {...props} />
);
