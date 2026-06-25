import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef, type HTMLAttributes } from 'react';

import { cn } from '@utils/cn';

/**
 * Semantic typography primitive. Variant names map 1:1 to the
 * Theme Engine's `typography` tokens — the matching CSS reads from
 * the theme via Tailwind tokens for line-height & weight, while
 * variant-specific micro-spacing/letter-spacing is baked in here.
 */
const typographyVariants = cva('text-text', {
  variants: {
    variant: {
      // Display + heading variants scale up gracefully from mobile to desktop.
      display:
        'font-display text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl',
      h1: 'font-display text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl',
      h2: 'font-display text-xl font-bold tracking-tight sm:text-2xl lg:text-3xl',
      h3: 'font-sans text-lg font-semibold sm:text-xl lg:text-2xl',
      h4: 'font-sans text-base font-semibold sm:text-lg',
      bodyLg: 'font-sans text-base leading-relaxed font-normal',
      body: 'font-sans text-sm leading-6 font-normal sm:text-[15px]',
      bodySm: 'font-sans text-xs leading-5 font-normal',
      label: 'font-sans text-[13px] leading-5 font-medium',
      caption: 'font-sans text-[11px] leading-4 font-medium text-text-muted',
      button: 'font-sans text-sm leading-5 font-semibold',
      overline:
        'font-sans text-[11px] leading-4 font-semibold uppercase tracking-[0.18em] text-text-muted',
    },
    tone: {
      default: 'text-text',
      muted: 'text-text-muted',
      primary: 'text-primary',
      accent: 'text-accent',
      success: 'text-success',
      warning: 'text-warning',
      danger: 'text-danger',
      info: 'text-info',
      inverse: 'text-[var(--w11-color-text-inverse)]',
    },
    align: {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
    },
    truncate: {
      true: 'truncate',
      false: '',
    },
  },
  defaultVariants: {
    variant: 'body',
    tone: 'default',
    align: 'left',
    truncate: false,
  },
});

type Element = 'p' | 'span' | 'div' | 'h1' | 'h2' | 'h3' | 'h4' | 'label';

export interface TypographyProps
  extends HTMLAttributes<HTMLElement>,
    VariantProps<typeof typographyVariants> {
  as?: Element;
}

const VARIANT_DEFAULT_ELEMENT: Record<NonNullable<TypographyProps['variant']>, Element> = {
  display: 'h1',
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  bodyLg: 'p',
  body: 'p',
  bodySm: 'p',
  label: 'span',
  caption: 'span',
  button: 'span',
  overline: 'span',
};

export const Typography = forwardRef<HTMLElement, TypographyProps>(
  ({ as, variant = 'body', tone, align, truncate, className, ...props }, ref) => {
    const Tag = (as ?? VARIANT_DEFAULT_ELEMENT[variant ?? 'body']) as Element;
    return (
      <Tag
        ref={ref as React.Ref<HTMLElement>}
        className={cn(typographyVariants({ variant, tone, align, truncate }), className)}
        {...props}
      />
    );
  },
);
Typography.displayName = 'Typography';

export { typographyVariants };
