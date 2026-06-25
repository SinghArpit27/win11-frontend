import { REGEX } from '@constants/index';

/**
 * Pure validators. For form schemas prefer composing these inside Zod
 * (`z.string().refine(isEmail)`) so error messages and validation logic
 * live in one place per form.
 */

export const isEmail = (v: string): boolean => REGEX.EMAIL.test(v.trim());
export const isMobileIndia = (v: string): boolean => REGEX.MOBILE_INDIA.test(v.trim());
export const isPhoneE164 = (v: string): boolean => REGEX.PHONE_E164.test(v.trim());
export const isOtp6 = (v: string): boolean => REGEX.OTP_6.test(v.trim());
export const isStrongPassword = (v: string): boolean => REGEX.PASSWORD_STRONG.test(v);
export const isUsername = (v: string): boolean => REGEX.USERNAME.test(v);
export const isHexColor = (v: string): boolean => REGEX.HEX_COLOR.test(v);
export const isHttpsUrl = (v: string): boolean => REGEX.URL_HTTPS.test(v);
