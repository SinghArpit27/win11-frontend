import { Link } from 'react-router-dom';

import { APP_LOGO_URL, APP_NAME, APP_TAGLINE } from '@constants/app.constants';
import { ROUTES } from '@constants/routes.constants';
import { cn } from '@utils/cn';

interface BrandMarkProps {
  /** Optional override — falls back to the centralized `ROUTES.ROOT`. */
  to?: string;
  /** Hide the tagline (typical inside sidebars where vertical space is tight). */
  hideTagline?: boolean;
  /** Visual size. */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Compact layout suitable for a sidebar header — logo + monogram + tagline
   * sit on top of each other instead of inline. Defaults to `false`.
   */
  stacked?: boolean;
  className?: string;
}

/**
 * Application brand mark — logo (if available) + `APP_NAME` + optional
 * tagline. All values come from the centralised `appConfig.brand` facade
 * so a rebrand is a single env-file edit.
 */
export const BrandMark = ({
  to = ROUTES.ROOT,
  hideTagline = false,
  size = 'md',
  stacked = false,
  className,
}: BrandMarkProps): JSX.Element => {
  const titleSize = size === 'sm' ? 'text-base' : size === 'lg' ? 'text-2xl' : 'text-lg';
  const logoSize = size === 'sm' ? 'h-7 w-7' : size === 'lg' ? 'h-10 w-10' : 'h-8 w-8';
  return (
    <Link
      to={to}
      className={cn(
        'inline-flex items-center gap-3 text-text transition-colors hover:text-primary',
        stacked && 'flex-col items-start gap-1',
        className,
      )}
      aria-label={APP_NAME}
    >
      <span
        className={cn(
          'inline-flex shrink-0 items-center justify-center rounded-xl bg-gradient-primary shadow-glow',
          'text-primary-foreground font-bold',
          logoSize,
        )}
        aria-hidden
      >
        {APP_LOGO_URL ? (
          <img src={APP_LOGO_URL} alt="" className="h-full w-full rounded-xl object-cover" />
        ) : (
          APP_NAME.slice(0, 1).toUpperCase()
        )}
      </span>
      <span className={cn('flex min-w-0 flex-col', stacked ? 'items-start' : 'items-baseline gap-1')}>
        <span className={cn('font-display font-bold tracking-tight', titleSize)}>
          {APP_NAME}
        </span>
        {!hideTagline ? (
          <span className="truncate text-[10px] uppercase tracking-[0.2em] text-text-muted">
            {APP_TAGLINE}
          </span>
        ) : null}
      </span>
    </Link>
  );
};
