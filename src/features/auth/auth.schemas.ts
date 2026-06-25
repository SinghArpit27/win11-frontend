import { z } from 'zod';

import { OtpChannel, OtpPurpose } from '@shared/enums';

/**
 * Zod schemas for every auth form on the frontend. We deliberately mirror
 * the backend rules so client-side and server-side validation never drift.
 * Form components consume these through `zodResolver`.
 */

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password too long')
  .refine((v) => /[a-z]/.test(v), { message: 'Add a lowercase letter' })
  .refine((v) => /[A-Z]/.test(v), { message: 'Add an uppercase letter' })
  .refine((v) => /\d/.test(v), { message: 'Add a digit' })
  .refine((v) => /[^A-Za-z0-9]/.test(v), { message: 'Add a symbol' });

export const emailSchema = z.string().email('Enter a valid email').toLowerCase();
export const phoneSchema = z
  .string()
  .regex(/^\+?[1-9]\d{7,14}$/, 'Enter a valid phone number');

export const identifierSchema = z.string().min(3).refine(
  (v) => /^\S+@\S+\.\S+$/.test(v) || /^\+?[1-9]\d{7,14}$/.test(v),
  { message: 'Enter a valid email or phone' },
);

export const loginSchema = z.object({
  identifier: identifierSchema,
  password: z.string().min(1, 'Password is required'),
});
export type LoginFormValues = z.infer<typeof loginSchema>;

export const signupSchema = z
  .object({
    email: emailSchema.optional().or(z.literal('')),
    phone: phoneSchema.optional().or(z.literal('')),
    password: passwordSchema,
    confirmPassword: z.string(),
    displayName: z.string().min(1).max(64).optional(),
  })
  .refine((v) => !!v.email || !!v.phone, {
    message: 'Provide either an email or phone',
    path: ['email'],
  })
  .refine((v) => v.password === v.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });
export type SignupFormValues = z.infer<typeof signupSchema>;

export const forgotPasswordSchema = z.object({
  identifier: identifierSchema,
});
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    identifier: identifierSchema,
    code: z.string().regex(/^\d{6}$/, 'Enter the 6-digit code'),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export const otpSchema = z.object({
  identifier: identifierSchema,
  channel: z.nativeEnum(OtpChannel),
  purpose: z.nativeEnum(OtpPurpose),
  code: z.string().regex(/^\d{6}$/, 'Enter the 6-digit code'),
});
export type OtpFormValues = z.infer<typeof otpSchema>;

export const verifyEmailSchema = z.object({
  email: emailSchema,
  code: z.string().regex(/^\d{6}$/),
});
export type VerifyEmailFormValues = z.infer<typeof verifyEmailSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });
export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;
