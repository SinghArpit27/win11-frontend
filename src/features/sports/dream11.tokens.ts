/** Dream11 sports UI palette — light + dark variants for home / matches feeds. */
export interface Dream11Palette {
  greyBg: string;
  card: string;
  panel: string;
  red: string;
  border: string;
  tabBar: string;
  tabBorder: string;
  tabDivider: string;
  tabInactive: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  textMuted: string;
  divider: string;
  chevron: string;
  iconCircle: string;
  iconMuted: string;
  completed: string;
}

export const DREAM11_LIGHT: Dream11Palette = {
  greyBg: '#f8f9fb',
  card: '#ffffff',
  panel: '#f8f9fb',
  red: '#d82d2c',
  border: '#ebebeb',
  tabBar: '#ffffff',
  tabBorder: '#e5e5e5',
  tabDivider: '#d8d8d8',
  tabInactive: '#333333',
  /** Team abbreviations, prize pool — bold black. */
  textPrimary: '#000000',
  /** Inactive tab labels, strong secondary copy. */
  textSecondary: '#333333',
  /** Series header, start time under countdown — medium grey. */
  textTertiary: '#757575',
  /** Full team names, bell icon — light grey. */
  textMuted: '#999999',
  divider: '#dde3ea',
  chevron: '#bdbdbd',
  iconCircle: '#dfe8f2',
  iconMuted: '#757575',
  completed: '#2e7d32',
};

export const DREAM11_DARK: Dream11Palette = {
  greyBg: '#0f1218',
  card: '#1a1f28',
  panel: '#232933',
  red: '#d82d2c',
  border: '#2e3642',
  tabBar: '#1a1f28',
  tabBorder: '#2e3642',
  tabDivider: '#3a4350',
  tabInactive: '#b8c0cc',
  textPrimary: '#eef1f6',
  textSecondary: '#c8ced8',
  textTertiary: '#9aa3b0',
  textMuted: '#7a8494',
  divider: '#3a4350',
  chevron: '#5c6675',
  iconCircle: '#2a3340',
  iconMuted: '#8b95a5',
  completed: '#66bb6a',
};

/** @deprecated Use DREAM11_LIGHT or useDream11Palette() */
export const DREAM11 = DREAM11_LIGHT;

export const getDream11Palette = (isDark: boolean): Dream11Palette =>
  isDark ? DREAM11_DARK : DREAM11_LIGHT;
