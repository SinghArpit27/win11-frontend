import { appConfig } from '@config/index';

/**
 * Money + wallet helpers. Centralised so every component formats and
 * converts amounts identically.
 *
 * The backend stores amounts in MINOR units (paise / cents). The UI
 * accepts MAJOR units (rupees / dollars). One source of truth here
 * keeps the conversion + formatting boundary out of components.
 */

const MINOR_PER_MAJOR = 100;

export const toMinorUnits = (major: number): number =>
  Math.round(major * MINOR_PER_MAJOR);

export const toMajorUnits = (minor: number): number => minor / MINOR_PER_MAJOR;

/**
 * Locale + currency aware money formatter. Uses the brand-configured
 * default currency unless overridden.
 */
export const formatMoney = (
  minor: number,
  options: { currency?: string; locale?: string; signed?: boolean } = {},
): string => {
  const currency = options.currency ?? appConfig.defaultCurrency;
  const locale = options.locale ?? appConfig.defaultLocale;
  const major = toMajorUnits(minor);
  const formatted = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(major);
  if (options.signed && major > 0) return `+${formatted}`;
  return formatted;
};

/**
 * Idempotency key generator. We send one per write attempt so retries
 * (network blip, double-tap, page refresh while spinner) collapse to a
 * single ledger transaction.
 */
export const newIdempotencyKey = (prefix = 'wlt'): string => {
  const id =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
  return `${prefix}-${id}`;
};

/**
 * Compact date+time formatter (`12 Mar, 14:35`). Avoids pulling in a
 * date-formatting library for what's effectively two Intl calls.
 */
export const formatTimestamp = (iso: string): string => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat(appConfig.defaultLocale, {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
};

export const formatRelative = (iso: string): string => {
  if (!iso) return '';
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const diff = Date.now() - then;
  const minutes = Math.round(diff / 60_000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatTimestamp(iso);
};
