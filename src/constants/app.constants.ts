/**
 * App-wide non-secret constants. NEVER inline these strings in code —
 * import from here so values change in exactly one place.
 *
 * Brand-facing strings (name / tagline / logo / theme / currency) are
 * sourced from the centralised `appConfig.brand` facade so the platform
 * is white-label ready. Pure technical constants (storage keys, headers,
 * pagination ceilings) stay co-located here.
 */
import { appConfig } from '@config/index';
import { SharedHeaders } from '@shared/constants';

export const APP_NAME = appConfig.brand.name;
export const APP_SLUG = appConfig.brand.slug;
export const APP_TAGLINE = appConfig.brand.tagline;
export const APP_LOGO_URL = appConfig.brand.logoUrl;
export const APP_THEME = appConfig.brand.theme;
export const APP_DEFAULT_CURRENCY = appConfig.defaultCurrency;
export const APP_DEFAULT_LOCALE = appConfig.defaultLocale;

export const QUERY_PARAMS = {
  REDIRECT: 'redirect',
  PAGE: 'page',
  LIMIT: 'limit',
  SEARCH: 'q',
  TAB: 'tab',
} as const;

export const STORAGE_KEYS = {
  THEME: 'w11.theme',
  ACCESS_TOKEN: 'w11.auth.access',
  REFRESH_TOKEN: 'w11.auth.refresh',
  AUTH_USER: 'w11.auth.user',
  DEVICE_ID: 'w11.device.id',
  ONBOARDING_SEEN: 'w11.onboarding.seen',
  LAST_ROUTE: 'w11.route.last',
  /** Short-lived signup session held until OTP verification completes. */
  PENDING_SIGNUP: 'w11.auth.pending-signup',
} as const;

/** @deprecated Prefer `SharedHeaders` from `@shared/constants` — kept for compat. */
export const SHARED_HEADERS = SharedHeaders;

export const CLIENT_PLATFORM = 'WEB' as const;

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;
