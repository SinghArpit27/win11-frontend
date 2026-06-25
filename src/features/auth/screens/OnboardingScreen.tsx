import { motion } from 'framer-motion';
import { ChevronRight, Sparkles, Trophy, Wallet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@components/ui';
import { STORAGE_KEYS } from '@constants/app.constants';
import { ROUTES } from '@constants/routes.constants';
import { localStore } from '@services/storage';

const SLIDES = [
  {
    icon: Trophy,
    title: 'Pick winners, win big',
    body: 'Build fantasy teams across cricket, football, and more. Real matches, real rewards.',
  },
  {
    icon: Wallet,
    title: 'Secure wallet',
    body: 'Add money, withdraw winnings, and track every transaction with bank-grade security.',
  },
  {
    icon: Sparkles,
    title: 'Live action',
    body: 'Watch points update in real-time as the game plays out. Climb the leaderboard.',
  },
];

/**
 * 3-slide onboarding shown on first launch. The "Continue" CTA persists
 * the seen flag so the user never sees it twice (unless they wipe storage).
 */
export const OnboardingScreen = (): JSX.Element => {
  const navigate = useNavigate();

  const handleContinue = (): void => {
    localStore.set(STORAGE_KEYS.ONBOARDING_SEEN, true);
    navigate(ROUTES.LOGIN, { replace: true });
  };

  return (
    <div className="flex min-h-[100dvh] flex-col bg-bg text-text">
      <div className="flex flex-1 flex-col gap-6 px-6 py-12 sm:items-center sm:py-16">
        {SLIDES.map(({ icon: Icon, title, body }, idx) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.32, delay: idx * 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="flex w-full max-w-md items-start gap-4 rounded-2xl border border-border bg-surface p-5 shadow-card"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-muted text-primary">
              <Icon className="h-6 w-6" />
            </span>
            <div className="space-y-1">
              <h3 className="text-base font-semibold">{title}</h3>
              <p className="text-sm text-text-muted">{body}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="sticky bottom-0 border-t border-border bg-surface px-6 py-4">
        <Button onClick={handleContinue} fullWidth rightIcon={<ChevronRight className="h-4 w-4" />}>
          Get started
        </Button>
      </div>
    </div>
  );
};
