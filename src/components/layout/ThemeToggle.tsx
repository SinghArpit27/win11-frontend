import { Moon, Sun } from 'lucide-react';

import { useTheme } from '@hooks/useTheme';
import { cn } from '@utils/cn';

interface ThemeToggleProps {
  className?: string;
  /** Render compact (icon-only, square). Defaults to `true`. */
  iconOnly?: boolean;
}

/**
 * Two-state theme toggle (dark ↔ light).
 *
 * Wraps `useTheme().toggleMode` and renders an icon button styled with
 * the same token language as the rest of the shell. `mode: 'system'`
 * users get pushed onto an explicit mode the first time they click.
 */
export const ThemeToggle = ({ className, iconOnly = true }: ThemeToggleProps): JSX.Element => {
  const { mode, theme, setMode } = useTheme();
  // Resolve the effective light/dark we're displaying right now so the icon matches.
  const effective = mode === 'system' ? theme.mode : mode;
  const isDark = effective === 'dark';

  const next = isDark ? 'light' : 'dark';
  const label = `Switch to ${next} mode`;

  return (
    <button
      type="button"
      onClick={() => setMode(next)}
      className={cn(
        'inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border bg-surface text-text-muted',
        'transition-colors hover:bg-surface-hover hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
        iconOnly ? 'w-10' : 'px-3 text-sm',
        className,
      )}
      aria-label={label}
      title={label}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      {!iconOnly ? <span>{isDark ? 'Light' : 'Dark'}</span> : null}
    </button>
  );
};
