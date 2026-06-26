import { Check, ChevronRight, Laptop, LogOut, Mail, Moon, Phone, Shield, Sun, User2, Wallet } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { PageContainer, PageHeader } from '@components/layout';
import { Button, Card, Typography } from '@components/ui';
import { ROUTES } from '@constants/routes.constants';
import { useAuth } from '@features/auth';
import { resolveUserHandle, userAvatarInitials } from '@features/auth/auth.utils';
import { useTheme } from '@hooks/useTheme';
import { themeRegistry } from '@theme/theme.registry';
import type { ThemeId, ThemeMode } from '@theme/theme.types';
import { cn } from '@utils/cn';

/**
 * Personal-account hub.
 *
 *  Hosts everything that used to live as individual tabs in the bottom
 *  nav (Phase 2 placeholder) — profile management, theme switcher,
 *  wallet shortcut, security shortcuts, sign-out.
 *
 *  Mobile-first single column → desktop adapts to a 2-column grid where
 *  the profile card sits beside the settings stack.
 *
 *  All theme controls go through `useTheme()` so persistence + system-
 *  preference resolution stay consistent with the boot path.
 */
const ProfileScreen = (): JSX.Element => {
  const navigate = useNavigate();
  const { user, logout, flags, roles } = useAuth();
  const { mode, setMode, themeId, setThemeId } = useTheme();

  const handle = resolveUserHandle(user);
  const initials = userAvatarInitials(user);

  const palettes = themeRegistry.list();

  return (
    <PageContainer as="div" className="gap-5 lg:gap-6">
      <PageHeader
        eyebrow="Account"
        title="Profile"
        subtitle="Manage your account, security, theme, and notification preferences."
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6">
        {/* ─── Identity card ───────────────────────────────────────── */}
        <Card padding="lg" className="lg:col-span-1">
          <div className="flex items-center gap-4">
            <span
              aria-hidden
              className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-primary text-2xl font-bold text-primary-foreground shadow-glow"
            >
              {initials}
            </span>
            <div className="min-w-0">
              <Typography variant="h3" className="block truncate">
                {handle}
              </Typography>
              {user?.username ? (
                <Typography variant="caption" tone="muted" className="mt-0.5 block truncate">
                  @{user.username}
                </Typography>
              ) : null}
              {roles.length > 0 ? (
                <div className="mt-1 flex flex-wrap gap-1">
                  {roles.map((role) => (
                    <span
                      key={role}
                      className="rounded-full bg-primary-soft px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary"
                    >
                      {role.replace('_', ' ')}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          </div>

          <div className="mt-5 space-y-2.5">
            {user?.phone ? (
              <ContactRow Icon={Phone} value={user.phone} verified={user.phoneVerified} />
            ) : null}
            {user?.email ? (
              <ContactRow Icon={Mail} value={user.email} verified={user.emailVerified} />
            ) : null}
          </div>

          <Button
            variant="outline"
            size="sm"
            fullWidth
            className="mt-5"
            leftIcon={<User2 className="h-4 w-4" />}
            disabled
            title="Profile editing ships in Phase 8"
          >
            Edit profile
          </Button>
        </Card>

        {/* ─── Settings stack ──────────────────────────────────────── */}
        <div className="flex flex-col gap-4 lg:col-span-2">
          {/* Wallet shortcut (since wallet is no longer a tab). */}
          <SettingsTile
            Icon={Wallet}
            title="Wallet"
            subtitle="View balance, add money, withdraw winnings."
            onClick={() => navigate(ROUTES.WALLET)}
          />

          {/* ─── Appearance ────────────────────────────────────────── */}
          <Card padding="lg">
            <Typography variant="h4" className="block">
              Appearance
            </Typography>
            <Typography variant="caption" tone="muted" className="mt-1 block">
              Pick how the app looks. System matches your device settings.
            </Typography>

            <div className="mt-4 grid grid-cols-3 gap-2">
              <ModeChoice
                active={mode === 'light'}
                onClick={() => setMode('light')}
                Icon={Sun}
                label="Light"
              />
              <ModeChoice
                active={mode === 'dark'}
                onClick={() => setMode('dark')}
                Icon={Moon}
                label="Dark"
              />
              <ModeChoice
                active={mode === 'system'}
                onClick={() => setMode('system')}
                Icon={Laptop}
                label="System"
              />
            </div>

            {palettes.length > 1 ? (
              <div className="mt-5">
                <Typography variant="label" className="block">
                  Theme palette
                </Typography>
                <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {palettes.map((p) => (
                    <PaletteChoice
                      key={p.id}
                      active={themeId === p.id}
                      onClick={() => setThemeId(p.id)}
                      paletteId={p.id}
                      name={p.name}
                      modeLabel={p.mode}
                      primary={p.colors.primary}
                      accent={p.colors.accent}
                      bg={p.colors.bg}
                    />
                  ))}
                </div>
              </div>
            ) : null}
          </Card>

          {/* ─── Security placeholder ─────────────────────────────── */}
          <SettingsTile
            Icon={Shield}
            title="Security"
            subtitle="Active sessions, password, two-factor (coming soon)."
            disabled
          />

          {/* ─── Sign out ────────────────────────────────────────── */}
          <Card padding="lg" className="border-danger/30">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <Typography variant="h4" className="block">
                  Sign out
                </Typography>
                <Typography variant="caption" tone="muted" className="block">
                  You'll need to sign back in to access your wallet and matches.
                </Typography>
              </div>
              <Button
                variant="outline"
                size="md"
                leftIcon={<LogOut className="h-4 w-4" />}
                onClick={() => logout()}
                loading={flags.logoutPending}
                className="shrink-0 border-danger text-danger hover:bg-danger/10"
              >
                Sign out
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
};

// ─── Pieces ───────────────────────────────────────────────────────────────

const ContactRow = ({
  Icon,
  value,
  verified,
}: {
  Icon: LucideIcon;
  value: string;
  verified?: boolean;
}): JSX.Element => (
  <div className="flex items-center justify-between gap-3 rounded-lg bg-bg-elevated px-3 py-2 text-sm">
    <span className="flex min-w-0 items-center gap-2 text-text-muted">
      <Icon className="h-4 w-4 shrink-0" />
      <span className="truncate text-text">{value}</span>
    </span>
    {typeof verified === 'boolean' ? (
      <span
        className={cn(
          'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider',
          verified ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning',
        )}
      >
        {verified ? 'Verified' : 'Unverified'}
      </span>
    ) : null}
  </div>
);

const SettingsTile = ({
  Icon,
  title,
  subtitle,
  onClick,
  disabled,
}: {
  Icon: LucideIcon;
  title: string;
  subtitle: string;
  onClick?: () => void;
  disabled?: boolean;
}): JSX.Element => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={cn(
      'flex w-full items-center gap-4 rounded-xl border border-border bg-surface px-4 py-4 text-left transition-colors',
      'hover:border-border-strong hover:bg-surface-hover',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
      'disabled:cursor-not-allowed disabled:opacity-60',
    )}
  >
    <span
      aria-hidden
      className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary"
    >
      <Icon className="h-5 w-5" />
    </span>
    <div className="min-w-0 flex-1">
      <Typography variant="body" className="block font-semibold">
        {title}
      </Typography>
      <Typography variant="caption" tone="muted" className="block truncate">
        {subtitle}
      </Typography>
    </div>
    <ChevronRight className="h-4 w-4 shrink-0 text-text-muted" aria-hidden />
  </button>
);

const ModeChoice = ({
  active,
  onClick,
  Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  Icon: LucideIcon;
  label: string;
}): JSX.Element => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={active}
    className={cn(
      'flex flex-col items-center justify-center gap-1.5 rounded-xl border px-3 py-3 text-xs font-semibold transition-colors',
      active
        ? 'border-primary bg-primary-soft text-primary'
        : 'border-border bg-surface text-text-muted hover:text-text hover:bg-surface-hover',
    )}
  >
    <Icon className="h-5 w-5" />
    {label}
  </button>
);

const PaletteChoice = ({
  active,
  onClick,
  paletteId,
  name,
  modeLabel,
  primary,
  accent,
  bg,
}: {
  active: boolean;
  onClick: () => void;
  paletteId: ThemeId;
  name: string;
  modeLabel: ThemeMode | 'dark' | 'light';
  primary: string;
  accent: string;
  bg: string;
}): JSX.Element => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={active}
    aria-label={`Use ${name} theme`}
    className={cn(
      'group relative flex items-center justify-between gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors',
      active
        ? 'border-primary bg-primary-soft'
        : 'border-border bg-surface hover:border-border-strong',
    )}
  >
    <div className="flex min-w-0 items-center gap-3">
      <span
        aria-hidden
        className="inline-flex h-9 w-9 shrink-0 overflow-hidden rounded-full border border-border"
        style={{ backgroundColor: bg }}
      >
        <span className="block h-full w-1/2" style={{ backgroundColor: primary }} />
        <span className="block h-full w-1/2" style={{ backgroundColor: accent }} />
      </span>
      <div className="min-w-0">
        <Typography variant="body" className="block truncate text-sm font-semibold">
          {name}
        </Typography>
        <Typography variant="caption" tone="muted" className="block uppercase tracking-wider">
          {paletteId} · {modeLabel}
        </Typography>
      </div>
    </div>
    {active ? (
      <Check className="h-4 w-4 shrink-0 text-primary" aria-hidden />
    ) : null}
  </button>
);

export default ProfileScreen;
