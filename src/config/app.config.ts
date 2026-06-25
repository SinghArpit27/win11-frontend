import { env } from './env';

/**
 * Static, env-derived app config consumed by the rest of the app.
 * Anything sourced from `import.meta.env` should be read through here
 * so we have a single seam to swap defaults / mock in tests.
 */
export const appConfig = {
  appName: env.app.name,
  appSlug: env.app.slug,
  appTagline: env.app.tagline,
  appLogoUrl: env.app.logoUrl,
  appVersion: env.app.version,
  environment: env.app.env,
  defaultCurrency: env.app.defaultCurrency,
  defaultLocale: env.app.defaultLocale,

  api: env.api,
  socket: env.socket,
  theme: env.theme,
  features: env.features,

  layout: {
    bottomTabsBreakpoint: 'md' as const,
  },

  pagination: {
    defaultPage: 1,
    defaultLimit: 20,
    maxLimit: 100,
  },

  /**
   * Branding facade. Centralises every "what is this app called?" read.
   * Components should `import { appConfig } from '@config'` and reference
   * `appConfig.brand.name` rather than inlining strings.
   */
  brand: {
    name: env.app.name,
    slug: env.app.slug,
    tagline: env.app.tagline,
    logoUrl: env.app.logoUrl,
    theme: env.theme.defaultId,
  },
} as const;

export type AppConfig = typeof appConfig;
