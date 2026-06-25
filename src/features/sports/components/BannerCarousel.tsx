import { ArrowRight, Sparkles } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { Typography } from '@components/ui';
import { cn } from '@utils/cn';

/**
 * Promotional banner carousel.
 *
 *  Phase 4 ships a *placeholder* surface: until the marketing / contests
 *  modules land we render static promo cards that promote the upcoming
 *  features. The carousel auto-advances every 5 s, pauses on hover, and
 *  supports manual dot navigation.
 *
 *  Responsive behaviour:
 *   - mobile : one banner at a time, snap-x rail (no auto-advance pause
 *              because hover doesn't exist on touch),
 *   - tablet+ : same one-up but with auto-advance + hover pause.
 */
interface Banner {
  id: string;
  title: string;
  description: string;
  cta: string;
  href?: string;
  accent?: string;
}

const DEFAULT_BANNERS: ReadonlyArray<Banner> = [
  {
    id: 'welcome',
    title: 'Build a dream team. Win real cash.',
    description:
      'Pick your XI, set a captain, and climb leaderboards for every match — coming this season.',
    cta: 'See matches',
    accent: 'from-primary/30 via-primary/10 to-transparent',
  },
  {
    id: 'contests',
    title: 'Big-prize contests launching soon',
    description: 'Lock-in for free + cash contests across IPL, EPL, and World Cup fixtures.',
    cta: 'Notify me',
    accent: 'from-accent/30 via-accent/10 to-transparent',
  },
  {
    id: 'safe',
    title: 'Withdraw winnings instantly',
    description: 'Bank-grade ledger, ID-verified withdrawals, and 24×7 support.',
    cta: 'Open wallet',
    accent: 'from-success/25 via-success/5 to-transparent',
  },
];

interface BannerCarouselProps {
  banners?: ReadonlyArray<Banner>;
  onCta?: (banner: Banner) => void;
  className?: string;
}

export const BannerCarousel = ({
  banners = DEFAULT_BANNERS,
  onCta,
  className,
}: BannerCarouselProps): JSX.Element => {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const safeIndex = useMemo(() => index % Math.max(banners.length, 1), [index, banners.length]);

  useEffect(() => {
    if (paused || banners.length <= 1) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % banners.length), 5000);
    return () => clearInterval(id);
  }, [paused, banners.length]);

  const current = banners[safeIndex];

  return (
    <section
      className={cn('relative overflow-hidden rounded-2xl bg-bg-elevated', className)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-label="Promotions"
    >
      <div
        aria-hidden
        className={cn('absolute inset-0 bg-gradient-to-br', current?.accent ?? 'from-primary/20 to-transparent')}
      />
      <div className="relative flex flex-col gap-3 p-5 sm:p-6 lg:p-7">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-text-muted">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          Spotlight
        </div>
        <Typography
          variant="h2"
          className="max-w-[40ch] text-2xl font-bold leading-tight sm:text-3xl"
        >
          {current?.title}
        </Typography>
        <Typography
          variant="body"
          tone="muted"
          className="max-w-[60ch] text-sm sm:text-[15px]"
        >
          {current?.description}
        </Typography>

        <div className="mt-1 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => current && onCta?.(current)}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            {current?.cta}
            <ArrowRight className="h-4 w-4" />
          </button>

          {banners.length > 1 ? (
            <div className="flex items-center gap-1.5">
              {banners.map((b, i) => (
                <button
                  key={b.id}
                  type="button"
                  aria-label={`Go to banner ${i + 1}`}
                  onClick={() => setIndex(i)}
                  className={cn(
                    'h-1.5 rounded-full transition-all',
                    i === safeIndex ? 'w-6 bg-primary' : 'w-1.5 bg-border',
                  )}
                />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
};
