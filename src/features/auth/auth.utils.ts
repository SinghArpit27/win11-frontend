import type { AuthUser } from './auth.types';

/** Primary in-app handle — always prefer the game username. */
export const resolveUserHandle = (user?: AuthUser | null): string =>
  user?.username ?? user?.displayName ?? user?.email ?? 'Player';

/** Two-letter avatar initials derived from the game username. */
export const usernameAvatarInitials = (username: string): string => {
  const parts = username.split(/[^a-zA-Z0-9]+/).filter(Boolean);
  if (parts.length >= 2) {
    const first = parts[0]?.[0] ?? '';
    const second = parts[1]?.[0] ?? '';
    const initials = `${first}${second}`.toUpperCase();
    return initials || 'P';
  }

  const word = parts[0] ?? username.replace(/[^a-zA-Z0-9]/g, '');
  if (word.length >= 2) return word.slice(0, 2).toUpperCase();
  return (word[0] ?? 'P').toUpperCase();
};

/** Avatar initials for the signed-in user — never uses phone (avoids "+" from E.164). */
export const userAvatarInitials = (user?: AuthUser | null): string => {
  if (user?.username) return usernameAvatarInitials(user.username);
  if (user?.displayName?.trim()) {
    return user.displayName.trim().slice(0, 2).toUpperCase() || 'P';
  }
  if (user?.email?.trim()) {
    return user.email.trim().slice(0, 2).toUpperCase();
  }
  return 'P';
};

/** Normalise Indian mobile input to digits-only local part (10 digits). */
export const normalizeIndianPhoneInput = (value: string): string =>
  value.replace(/\D/g, '').slice(0, 10);

export const isValidIndianMobile = (digits: string): boolean =>
  /^[6-9]\d{9}$/.test(digits);

export const toE164India = (digits: string): string => `+91${digits}`;
