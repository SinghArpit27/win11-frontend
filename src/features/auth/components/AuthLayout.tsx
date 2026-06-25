import { motion } from 'framer-motion';
import { type ReactNode } from 'react';

import { BrandMark } from '@components/layout';
import { APP_LOGO_URL, APP_NAME, APP_TAGLINE } from '@constants/app.constants';
import { cn } from '@utils/cn';

interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  footer?: ReactNode;
  children: ReactNode;
  className?: string;
}

/**
 * Shared shell for unauthenticated screens (login / signup / forgot / OTP).
 *
 * Responsive contract:
 *  - mobile        → centered card on a vertically-tinted background.
 *  - tablet        → wider card, generous breathing room.
 *  - desktop (lg+) → split-pane: marketing/brand panel on the left,
 *                    form panel on the right. Feels like a premium
 *                    fantasy-sports web product, not a phone emulator.
 *
 * Pulls every colour from CSS variables → respects light/dark and the
 * dynamic theme engine without a single hardcoded hex.
 */
export const AuthLayout = ({
  title,
  subtitle,
  footer,
  children,
  className,
}: AuthLayoutProps): JSX.Element => (
  <div className="relative grid min-h-[100dvh] grid-cols-1 bg-bg text-text lg:grid-cols-[1.05fr_minmax(420px,0.95fr)]">
    {/* ── Brand / marketing pane (desktop only) ───────────────────── */}
    <aside
      aria-hidden
      className="relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-16"
    >
      <div className="absolute inset-0 bg-gradient-hero opacity-90" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(255,255,255,0.18),transparent_45%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_90%,rgba(0,0,0,0.45),transparent_50%)]" />

      <div className="relative z-10 flex items-center gap-3 text-white">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 text-lg font-bold backdrop-blur-sm">
          {APP_LOGO_URL ? (
            <img src={APP_LOGO_URL} alt="" className="h-full w-full rounded-xl object-cover" />
          ) : (
            APP_NAME.slice(0, 1).toUpperCase()
          )}
        </span>
        <span className="font-display text-2xl font-bold tracking-tight">{APP_NAME}</span>
      </div>

      <div className="relative z-10 max-w-md space-y-4 text-white">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/70">
          {APP_TAGLINE}
        </p>
        <h2 className="text-3xl font-bold leading-tight tracking-tight lg:text-4xl">
          Build the team. Beat the field. Win the game.
        </h2>
        <p className="text-white/80">
          {APP_NAME} is a production-grade fantasy sports platform engineered for speed,
          fairness, and a premium experience on every screen.
        </p>
      </div>

      <div className="relative z-10 text-xs text-white/60">
        © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
      </div>
    </aside>

    {/* ── Form pane ──────────────────────────────────────────────── */}
    <main className="relative flex min-h-[100dvh] flex-col px-4 pb-10 pt-8 sm:px-6 sm:pt-12 lg:px-12 lg:pt-16">
      {/* Mobile-only tinted halo above the card — replaced by the brand
          pane on desktop, so render it only under lg. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-60 bg-gradient-to-b from-primary-muted to-transparent lg:hidden"
      />

      <header className="relative flex items-center justify-center pb-8 lg:hidden">
        <BrandMark />
      </header>

      <div className="relative flex flex-1 items-center justify-center">
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className={cn(
            'w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-lg sm:p-8',
            className,
          )}
        >
          <header className="mb-6 space-y-1">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
            {subtitle ? <p className="text-sm text-text-muted">{subtitle}</p> : null}
          </header>
          {children}
        </motion.section>
      </div>

      {footer ? (
        <footer className="relative mt-6 flex justify-center text-center text-sm text-text-muted">
          <div className="max-w-md">{footer}</div>
        </footer>
      ) : null}
    </main>
  </div>
);
