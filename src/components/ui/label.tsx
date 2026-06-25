import * as LabelPrimitive from '@radix-ui/react-label';
import { forwardRef, type ComponentPropsWithoutRef, type ElementRef } from 'react';

import { cn } from '@utils/cn';

export const Label = forwardRef<
  ElementRef<typeof LabelPrimitive.Root>,
  ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(
      'inline-flex select-none items-center gap-1 text-[13px] font-medium leading-tight text-text peer-disabled:cursor-not-allowed peer-disabled:opacity-60',
      className,
    )}
    {...props}
  />
));
Label.displayName = LabelPrimitive.Root.displayName;
