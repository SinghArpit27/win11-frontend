import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef, type ButtonHTMLAttributes } from 'react';

import { cn } from '@utils/cn';

import { Spinner } from './spinner';

/**
 * Variant matrix. Adding a new visual style → extend the `variants` map;
 * call sites only need to set `variant="..."` or `size="..."`.
 *
 * No raw colours here — every value resolves to a theme variable so
 * white-label and dark/light flow through automatically.
 */
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 font-semibold whitespace-nowrap rounded-lg select-none transition-all duration-150 ease-app-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] touch-manipulation',
  {
    variants: {
      variant: {
        primary:
          'bg-primary text-[var(--w11-color-primary-foreground)] shadow-sm hover:brightness-110',
        gradient:
          'bg-gradient-primary text-[var(--w11-color-primary-foreground)] shadow-glow hover:brightness-110',
        secondary:
          'bg-surface-elevated text-text border border-border hover:bg-surface',
        outline:
          'bg-transparent text-text border border-border hover:bg-surface',
        ghost: 'bg-transparent text-text hover:bg-surface',
        danger:
          'bg-danger text-[var(--w11-color-text-inverse)] hover:brightness-110 shadow-sm',
        success:
          'bg-success text-[var(--w11-color-text-inverse)] hover:brightness-110 shadow-sm',
        link: 'bg-transparent text-primary underline-offset-4 hover:underline px-0 py-0',
      },
      size: {
        sm: 'h-9 px-3 text-sm',
        md: 'h-11 px-4 text-sm',
        lg: 'h-12 px-5 text-base',
        icon: 'h-11 w-11',
      },
      fullWidth: { true: 'w-full', false: '' },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      fullWidth: false,
    },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Render as the child component (e.g. <a>) preserving variant styles. */
  asChild?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      asChild = false,
      loading = false,
      disabled,
      leftIcon,
      rightIcon,
      children,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : 'button';
    const isDisabled = disabled || loading;

    // Radix Slot requires a single child, so when `asChild` is set we
    // forward `children` untouched and skip our loading / icon adornments.
    if (asChild) {
      return (
        <Comp
          ref={ref}
          className={cn(buttonVariants({ variant, size, fullWidth }), className)}
          data-loading={loading || undefined}
          {...props}
        >
          {children}
        </Comp>
      );
    }

    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, fullWidth }), className)}
        disabled={isDisabled}
        data-loading={loading || undefined}
        {...props}
      >
        {loading ? <Spinner size="sm" /> : leftIcon}
        <span className={cn(loading && 'opacity-80')}>{children}</span>
        {!loading && rightIcon}
      </Comp>
    );
  },
);
Button.displayName = 'Button';

export { buttonVariants };
