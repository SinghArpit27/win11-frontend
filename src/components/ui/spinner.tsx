import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@utils/cn';

const spinnerVariants = cva('inline-block animate-spin rounded-full border-current border-r-transparent', {
  variants: {
    size: {
      xs: 'h-3 w-3 border-2',
      sm: 'h-4 w-4 border-2',
      md: 'h-6 w-6 border-[3px]',
      lg: 'h-10 w-10 border-4',
    },
    tone: {
      primary: 'text-primary',
      text: 'text-text',
      inverse: 'text-[var(--w11-color-text-inverse)]',
      muted: 'text-text-muted',
    },
  },
  defaultVariants: {
    size: 'sm',
    tone: 'primary',
  },
});

export interface SpinnerProps extends VariantProps<typeof spinnerVariants> {
  className?: string;
  label?: string;
}

export const Spinner = ({ size, tone, className, label = 'Loading…' }: SpinnerProps): JSX.Element => (
  <span
    role="status"
    aria-live="polite"
    aria-label={label}
    className={cn(spinnerVariants({ size, tone }), className)}
  />
);
