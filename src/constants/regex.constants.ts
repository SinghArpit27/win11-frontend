/**
 * Centralised regex bank. Reuse these — never re-author validation
 * regexes at the call site.
 */
export const REGEX = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_E164: /^\+?[1-9]\d{7,14}$/,
  MOBILE_INDIA: /^[6-9]\d{9}$/,
  OTP_6: /^\d{6}$/,
  PASSWORD_STRONG: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])[A-Za-z\d\W_]{8,}$/,
  USERNAME: /^[a-zA-Z0-9_]{3,20}$/,
  URL_HTTPS: /^https:\/\/[^\s]+$/,
  HEX_COLOR: /^#([0-9a-fA-F]{3}){1,2}$/,
} as const;
