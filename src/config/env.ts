import { z } from 'zod';

/**
 * Public env contract. Validated once at boot — if the bundle ships with
 * missing/invalid public env we surface a loud error instead of letting
 * the UI silently misbehave at runtime.
 */
const booleanString = z
  .string()
  .transform((v) => v === 'true' || v === '1')
  .pipe(z.boolean());

const envSchema = z.object({
  // ── Branding / identity ─────────────────────────────────────────────────
  // The platform is white-label ready: every brand-facing string lives in
  // env, never in source. Change these to rebrand the entire UI.
  VITE_APP_NAME: z.string().min(1).default('Win11'),
  VITE_APP_SLUG: z
    .string()
    .regex(/^[a-z0-9-]+$/i, 'VITE_APP_SLUG must be url-safe (a-z, 0-9, -)')
    .default('win11'),
  VITE_APP_TAGLINE: z.string().default('Fantasy Sports — Reimagined'),
  VITE_APP_LOGO_URL: z.string().default(''),
  VITE_APP_VERSION: z.string().min(1).default('0.0.0'),
  VITE_APP_ENV: z.enum(['development', 'staging', 'production']).default('development'),
  VITE_APP_DEFAULT_CURRENCY: z.string().length(3).default('INR'),
  VITE_APP_DEFAULT_LOCALE: z.string().default('en-IN'),

  VITE_API_BASE_URL: z.string().url(),
  VITE_API_PREFIX: z.string().startsWith('/').default('/api/v1'),
  VITE_API_TIMEOUT_MS: z.coerce.number().int().positive().default(15000),

  VITE_SOCKET_URL: z.string().url(),
  VITE_SOCKET_PATH: z.string().startsWith('/').default('/socket.io'),
  VITE_SOCKET_TRANSPORTS: z.string().default('websocket,polling'),

  VITE_DEFAULT_THEME_ID: z.string().min(1).default('light'),
  VITE_DEFAULT_THEME_MODE: z.enum(['dark', 'light', 'system']).default('light'),
  VITE_THEME_REMOTE_CONFIG_ENABLED: booleanString.default('false'),

  VITE_FEATURE_PWA: booleanString.default('false'),
  VITE_FEATURE_ANALYTICS: booleanString.default('false'),
});

const parsed = envSchema.safeParse(import.meta.env);
if (!parsed.success) {
  console.error('[env] Invalid VITE_ environment variables', parsed.error.flatten().fieldErrors);
  throw new Error('Invalid frontend environment configuration — see console for details.');
}

const raw = parsed.data;

export const env = {
  app: {
    name: raw.VITE_APP_NAME,
    slug: raw.VITE_APP_SLUG,
    tagline: raw.VITE_APP_TAGLINE,
    logoUrl: raw.VITE_APP_LOGO_URL || null,
    version: raw.VITE_APP_VERSION,
    env: raw.VITE_APP_ENV,
    defaultCurrency: raw.VITE_APP_DEFAULT_CURRENCY.toUpperCase(),
    defaultLocale: raw.VITE_APP_DEFAULT_LOCALE,
    isProduction: raw.VITE_APP_ENV === 'production',
    isDevelopment: raw.VITE_APP_ENV === 'development',
  },
  api: {
    // In Vite dev/preview, use same-origin `/api` (proxied to the backend) so
    // phone/tablet testing over LAN works — `localhost:4000` on a phone is wrong.
    baseUrl: import.meta.env.DEV
      ? ''
      : raw.VITE_API_BASE_URL.replace(/\/+$/, ''),
    prefix: raw.VITE_API_PREFIX,
    timeoutMs: raw.VITE_API_TIMEOUT_MS,
    fullBaseUrl: import.meta.env.DEV
      ? raw.VITE_API_PREFIX
      : `${raw.VITE_API_BASE_URL.replace(/\/+$/, '')}${raw.VITE_API_PREFIX}`,
  },
  socket: {
    url: raw.VITE_SOCKET_URL,
    path: raw.VITE_SOCKET_PATH,
    transports: raw.VITE_SOCKET_TRANSPORTS.split(',')
      .map((t) => t.trim())
      .filter(Boolean) as Array<'websocket' | 'polling'>,
  },
  theme: {
    defaultId: raw.VITE_DEFAULT_THEME_ID,
    defaultMode: raw.VITE_DEFAULT_THEME_MODE,
    remoteConfigEnabled: raw.VITE_THEME_REMOTE_CONFIG_ENABLED,
  },
  features: {
    pwa: raw.VITE_FEATURE_PWA,
    analytics: raw.VITE_FEATURE_ANALYTICS,
  },
} as const;

export type AppEnv = typeof env;
