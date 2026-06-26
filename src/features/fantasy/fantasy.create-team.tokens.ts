/** Create-team player picker — colors + layout metrics from design spec. */
export const CREATE_TEAM_COLORS = {
  white: '#ffffff',
  columnHeaderBg: '#f8fbff',
  plus: '#1fa444',
  minus: '#dd5111',
  squadTab: '#0a1628',
  columnHeaderText: '#6b7c8f',
  selectedRowBg: '#fffde7',
  divider: '#eeeeee',
  dividerDashed: '#d8d8d8',
  tabActive: '#e53935',
  tabInactive: '#212121',
  roleText: '#bdbdbd',
  nameText: '#000000',
  selText: '#757575',
  creditsText: '#000000',
  avatarBg: '#f0f0f0',
  avatarRing: '#e8e8e8',
} as const;

/** Shared sizing — keeps player rows + headers pixel-aligned. */
export const CREATE_TEAM_LAYOUT = {
  /** Role gutter (vertical label). */
  roleWidthPx: 14,
  /** Player photo diameter. */
  avatarPx: 40,
  /** +/- column width. */
  actionWidthPx: 30,
  /** Outlined +/- ring. */
  actionIconSizePx: 22,
  actionIconBorderPx: 2.5,
  actionIconGlyphPx: 10,
  actionIconStroke: 3,
  /** Row */
  rowMinHeightPx: 72,
  rowPaddingX: 4,
  rowPaddingY: 10,
  rowGapPx: 4,
  /** Typography (px) */
  roleFontPx: 8,
  nameFontPx: 12,
  selFontPx: 10,
  creditsFontPx: 11,
  columnHeaderFontPx: 9,
  teamLabelFontPx: 11,
  creditsPillFontPx: 11,
  squadTabFontPx: 9,
  tabFontPx: 12,
} as const;
