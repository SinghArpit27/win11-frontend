import { z } from 'zod';

/**
 * Money is captured in MAJOR units (rupees / dollars) in form fields,
 * matching how users speak. The api layer transforms to MINOR on POST.
 */

const moneyMajor = (min: number, max: number) =>
  z
    .union([z.string(), z.number()])
    .transform((v) => (typeof v === 'string' ? Number(v.replace(/[^\d.]/g, '')) : v))
    .pipe(
      z
        .number({ invalid_type_error: 'Enter a valid amount' })
        .finite()
        .min(min, `Minimum amount is ${min}`)
        .max(max, `Maximum amount is ${max}`),
    );

export const depositFormSchema = z.object({
  amount: moneyMajor(10, 100_000),
  description: z.string().max(120).optional(),
});
export type DepositFormValues = z.infer<typeof depositFormSchema>;

export const withdrawFormSchema = z.object({
  amount: moneyMajor(100, 50_000),
  description: z.string().max(120).optional(),
});
export type WithdrawFormValues = z.infer<typeof withdrawFormSchema>;

export const adminAdjustFormSchema = z.object({
  direction: z.enum(['CREDIT', 'DEBIT']),
  bucket: z.enum(['DEPOSIT', 'WINNING', 'BONUS']),
  amount: moneyMajor(1, 50_000),
  reason: z.string().min(8, 'Reason must be at least 8 characters').max(500),
  ticketRef: z.string().max(64).optional(),
  notes: z.string().max(2000).optional(),
});
export type AdminAdjustFormValues = z.infer<typeof adminAdjustFormSchema>;
