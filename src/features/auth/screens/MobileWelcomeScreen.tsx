import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';

import { Button, Typography } from '@components/ui';
import { APP_NAME, APP_TAGLINE } from '@constants/app.constants';

interface MobileWelcomeScreenProps {
  onLetsPlay: () => void;
}

/**
 * Dream11-style full-screen welcome for mobile.
 * Red hero, brand lockup, athlete imagery, and a single CTA.
 */
export const MobileWelcomeScreen = ({ onLetsPlay }: MobileWelcomeScreenProps): JSX.Element => (
  <div className="relative flex min-h-[100dvh] flex-col overflow-hidden bg-[#e02020] text-white">
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(255,255,255,0.12),transparent_55%)]"
    />
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/35 via-transparent to-transparent"
    />

    <header className="relative z-10 flex flex-col items-center px-6 pt-10">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center"
      >
        <span className="mb-3 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
          <Trophy className="h-9 w-9 text-white" strokeWidth={1.5} />
        </span>
        <Typography
          variant="h1"
          className="text-3xl font-extrabold tracking-[0.08em] text-white"
        >
          {APP_NAME.toUpperCase()}
        </Typography>
        <Typography
          variant="caption"
          className="mt-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-white/85"
        >
          {APP_TAGLINE || "India's Biggest Sports Game"}
        </Typography>
      </motion.div>
    </header>

    <div className="relative z-10 flex flex-1 items-end justify-center px-4 pb-28 pt-6">
      <motion.img
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        src="https://images.unsplash.com/photo-1531415077838-de341deae72d?auto=format&fit=crop&w=900&q=80"
        alt=""
        className="max-h-[52vh] w-full max-w-sm object-contain object-bottom drop-shadow-2xl"
      />
    </div>

    <div className="fixed inset-x-0 bottom-0 z-20 border-t border-white/10 bg-[#e02020]/95 px-6 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4 backdrop-blur-sm">
      <Button
        fullWidth
        size="lg"
        onClick={onLetsPlay}
        className="h-12 rounded-xl bg-white text-base font-bold text-[#e02020] shadow-lg hover:bg-white/95"
      >
        Let&apos;s Play
      </Button>
    </div>
  </div>
);

export default MobileWelcomeScreen;
