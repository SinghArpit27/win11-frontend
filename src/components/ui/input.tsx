import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';

import { cn } from '@utils/cn';

const inputVariants = cva(
  'w-full bg-surface text-text placeholder:text-text-muted rounded-lg border outline-none transition-colors focus:ring-2 focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed',
  {
    variants: {
      state: {
        default: 'border-border focus:border-primary focus:ring-primary-muted',
        error: 'border-danger focus:border-danger focus:ring-[rgba(255,77,109,0.18)]',
        success: 'border-success focus:border-success focus:ring-[rgba(22,199,132,0.18)]',
      },
      size: {
        sm: 'h-9 px-3 text-sm',
        md: 'h-11 px-3.5 text-sm',
        lg: 'h-12 px-4 text-base',
      },
    },
    defaultVariants: { state: 'default', size: 'md' },
  },
);

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  leftAdornment?: ReactNode;
  rightAdornment?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, state, size, leftAdornment, rightAdornment, ...props }, ref) => {
    if (!leftAdornment && !rightAdornment) {
      return <input ref={ref} className={cn(inputVariants({ state, size }), className)} {...props} />;
    }

    return (
      <div
        className={cn(
          'flex w-full items-center gap-2 rounded-lg border bg-surface px-3 transition-colors focus-within:ring-2',
          state === 'error'
            ? 'border-danger focus-within:border-danger focus-within:ring-[rgba(255,77,109,0.18)]'
            : state === 'success'
              ? 'border-success focus-within:border-success focus-within:ring-[rgba(22,199,132,0.18)]'
              : 'border-border focus-within:border-primary focus-within:ring-primary-muted',
          size === 'sm' ? 'h-9' : size === 'lg' ? 'h-12' : 'h-11',
          className,
        )}
      >
        {leftAdornment ? (
          <span className="flex shrink-0 items-center text-text-muted">{leftAdornment}</span>
        ) : null}
        <input
          ref={ref}
          className="h-full flex-1 bg-transparent text-sm text-text outline-none placeholder:text-text-muted"
          {...props}
        />
        {rightAdornment ? (
          <span className="flex shrink-0 items-center text-text-muted">{rightAdornment}</span>
        ) : null}
      </div>
    );
  },
);
Input.displayName = 'Input';

export { inputVariants };
