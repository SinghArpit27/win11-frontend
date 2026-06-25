import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ElementRef,
  type HTMLAttributes,
  type ReactNode,
} from 'react';

import { cn } from '@utils/cn';

/**
 * Mobile-aware modal built on Radix Dialog:
 *  - sheet-style slide-up on mobile (height auto, bottom-anchored),
 *  - centered card on tablet+ (md breakpoint),
 *  - dismiss-via-overlay + ESC + close button,
 *  - all colours / radii / shadows resolve via theme vars.
 */

export const Modal = DialogPrimitive.Root;
export const ModalTrigger = DialogPrimitive.Trigger;
export const ModalClose = DialogPrimitive.Close;

const ModalOverlay = forwardRef<
  ElementRef<typeof DialogPrimitive.Overlay>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 z-50 bg-black/60 backdrop-blur-sm',
      'data-[state=open]:animate-in data-[state=open]:fade-in-0',
      'data-[state=closed]:animate-out data-[state=closed]:fade-out-0',
      className,
    )}
    {...props}
  />
));
ModalOverlay.displayName = DialogPrimitive.Overlay.displayName;

export const ModalContent = forwardRef<
  ElementRef<typeof DialogPrimitive.Content>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & { showClose?: boolean }
>(({ className, children, showClose = true, ...props }, ref) => (
  <DialogPrimitive.Portal>
    <ModalOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        'fixed z-50 grid w-full gap-4 bg-surface-elevated text-text shadow-lg',
        'inset-x-0 bottom-0 rounded-t-2xl pt-4 pb-[max(env(safe-area-inset-bottom),16px)] px-4',
        'data-[state=open]:animate-slide-up data-[state=open]:animate-fade-in',
        'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-bottom',
        'md:inset-x-auto md:bottom-auto md:left-1/2 md:top-1/2 md:max-w-md md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-2xl md:p-6 md:pb-6',
        className,
      )}
      {...props}
    >
      {children}
      {showClose ? (
        <DialogPrimitive.Close
          aria-label="Close"
          className="absolute right-3 top-3 rounded-full p-2 text-text-muted opacity-80 transition-colors hover:bg-surface hover:text-text focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <X className="h-4 w-4" />
        </DialogPrimitive.Close>
      ) : null}
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
));
ModalContent.displayName = DialogPrimitive.Content.displayName;

interface ModalHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

export const ModalHeader = ({ className, ...props }: ModalHeaderProps): JSX.Element => (
  <div className={cn('flex flex-col gap-1 pr-8', className)} {...props} />
);

export const ModalTitle = forwardRef<
  ElementRef<typeof DialogPrimitive.Title>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn('text-lg font-semibold leading-tight text-text', className)}
    {...props}
  />
));
ModalTitle.displayName = DialogPrimitive.Title.displayName;

export const ModalDescription = forwardRef<
  ElementRef<typeof DialogPrimitive.Description>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn('text-sm text-text-muted', className)}
    {...props}
  />
));
ModalDescription.displayName = DialogPrimitive.Description.displayName;

export const ModalFooter = ({ className, ...props }: HTMLAttributes<HTMLDivElement>): JSX.Element => (
  <div
    className={cn(
      'flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3',
      className,
    )}
    {...props}
  />
);
