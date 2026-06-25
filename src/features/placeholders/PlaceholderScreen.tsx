import { motion } from 'framer-motion';
import { Sparkles, type LucideIcon } from 'lucide-react';

import { Badge, Card, CardDescription, CardTitle, Typography } from '@components/ui';
import { ScreenContainer, TopBar } from '@components/layout';

interface PlaceholderScreenProps {
  title: string;
  description: string;
  phase: number;
  Icon?: LucideIcon;
}

/**
 * Generic placeholder used by every PHASE-1 tab route. Each future
 * phase replaces the corresponding screen with real content — the
 * router contract stays stable.
 *
 * This file intentionally lives under `features/placeholders` so it
 * gets removed/migrated by the phase that owns the route.
 */
export const PlaceholderScreen = ({
  title,
  description,
  phase,
  Icon = Sparkles,
}: PlaceholderScreenProps): JSX.Element => (
  <>
    <TopBar title={title} />
    <ScreenContainer>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-1 flex-col gap-4"
      >
        <Card variant="gradient" padding="lg">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-muted text-primary">
              <Icon className="h-6 w-6" />
            </div>
            <div className="flex flex-1 flex-col gap-1">
              <div className="flex items-center gap-2">
                <CardTitle>{title}</CardTitle>
                <Badge tone="primary">Phase {phase}</Badge>
              </div>
              <CardDescription>{description}</CardDescription>
            </div>
          </div>
        </Card>

        <Card variant="flat" padding="lg">
          <Typography variant="overline" tone="muted">
            Foundation status
          </Typography>
          <Typography variant="body" className="mt-2">
            This screen is a Phase&nbsp;1 placeholder. The theme engine, store,
            socket client and layout shell are wired and ready. Feature modules
            will land here in their owning phase without touching this scaffold.
          </Typography>
        </Card>
      </motion.div>
    </ScreenContainer>
  </>
);
