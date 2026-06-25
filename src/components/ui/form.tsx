import {
  createContext,
  forwardRef,
  useContext,
  useId,
  useMemo,
  type ComponentPropsWithoutRef,
  type ElementRef,
  type HTMLAttributes,
} from 'react';
import {
  Controller,
  FormProvider,
  useFormContext,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form';

import { cn } from '@utils/cn';

import { Label } from './label';

/**
 * Form primitives — composable on top of React Hook Form. Adapted from
 * the shadcn/ui form pattern but wired to our theme tokens so error
 * states resolve through `text-danger` rather than hardcoded colours.
 *
 * Usage:
 *   <Form {...form}>
 *     <FormField name="email" control={form.control} render={({ field }) => (
 *       <FormItem>
 *         <FormLabel>Email</FormLabel>
 *         <FormControl><Input {...field} /></FormControl>
 *         <FormMessage />
 *       </FormItem>
 *     )} />
 *   </Form>
 */

export const Form = FormProvider;

interface FormFieldContextValue {
  name: string;
}
const FormFieldContext = createContext<FormFieldContextValue | null>(null);

export const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
  props: ControllerProps<TFieldValues, TName>,
): JSX.Element => (
  <FormFieldContext.Provider value={{ name: props.name }}>
    <Controller {...props} />
  </FormFieldContext.Provider>
);

interface FormItemContextValue {
  id: string;
}
const FormItemContext = createContext<FormItemContextValue | null>(null);

export const useFormField = (): {
  id: string;
  name: string;
  formItemId: string;
  formDescriptionId: string;
  formMessageId: string;
  error?: { message?: string };
} => {
  const fieldCtx = useContext(FormFieldContext);
  const itemCtx = useContext(FormItemContext);
  const { getFieldState, formState } = useFormContext();

  if (!fieldCtx) throw new Error('useFormField must be used inside <FormField>.');
  if (!itemCtx) throw new Error('useFormField must be used inside <FormItem>.');

  const fieldState = getFieldState(fieldCtx.name, formState);

  return {
    id: itemCtx.id,
    name: fieldCtx.name,
    formItemId: `${itemCtx.id}-form-item`,
    formDescriptionId: `${itemCtx.id}-form-item-description`,
    formMessageId: `${itemCtx.id}-form-item-message`,
    error: fieldState.error as { message?: string } | undefined,
  };
};

export const FormItem = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const id = useId();
    const value = useMemo(() => ({ id }), [id]);
    return (
      <FormItemContext.Provider value={value}>
        <div ref={ref} className={cn('flex flex-col gap-1.5', className)} {...props} />
      </FormItemContext.Provider>
    );
  },
);
FormItem.displayName = 'FormItem';

export const FormLabel = forwardRef<
  ElementRef<typeof Label>,
  ComponentPropsWithoutRef<typeof Label>
>(({ className, ...props }, ref) => {
  const { error, formItemId } = useFormField();
  return (
    <Label
      ref={ref}
      htmlFor={formItemId}
      className={cn(error && 'text-danger', className)}
      {...props}
    />
  );
});
FormLabel.displayName = 'FormLabel';

export const FormControl = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ ...props }, ref) => {
  const { formItemId, formDescriptionId, formMessageId, error } = useFormField();
  return (
    <div
      ref={ref}
      id={formItemId}
      aria-describedby={error ? `${formDescriptionId} ${formMessageId}` : formDescriptionId}
      aria-invalid={!!error}
      {...props}
    />
  );
});
FormControl.displayName = 'FormControl';

export const FormDescription = forwardRef<
  HTMLParagraphElement,
  HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  const { formDescriptionId } = useFormField();
  return (
    <p
      ref={ref}
      id={formDescriptionId}
      className={cn('text-[12px] leading-[16px] text-text-muted', className)}
      {...props}
    />
  );
});
FormDescription.displayName = 'FormDescription';

export const FormMessage = forwardRef<
  HTMLParagraphElement,
  HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
  const { error, formMessageId } = useFormField();
  const body = error ? String(error.message ?? '') : children;
  if (!body) return null;
  return (
    <p
      ref={ref}
      id={formMessageId}
      className={cn('text-[12px] leading-[16px] font-medium text-danger', className)}
      {...props}
    >
      {body}
    </p>
  );
});
FormMessage.displayName = 'FormMessage';
