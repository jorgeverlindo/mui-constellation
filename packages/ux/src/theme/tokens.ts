/**
 * Constellation design tokens.
 *
 * Source of truth: AV3 Constellation Design System (Figma file
 * RHIzy0oXiFWSy77QQVDCSq) + original app `src/styles/theme.css`.
 * Every raw value lives here. The MUI theme maps them to palette /
 * typography / component slots. No magic numbers anywhere else.
 *
 * Naming mirrors the Figma layer hierarchy exactly.
 */

// ─── Brand ────────────────────────────────────────────────────────────────────

export const brand = {
  /** Primary brand — buttons, links, active states (Figma: brand/accent) */
  accent:      '#473BAB',
  /** Hover / pressed variant (Figma: brand/accent-hover) */
  accentHover: '#3D3295',
  /** Secondary brand — illustrations, charts (Figma: brand/mid) */
  mid:         '#6356E1',
  /** Light tint — highlights on dark surfaces (Figma: brand/light) */
  light:       '#8C86FC',
  /** Dark-mode accent (Figma: brand/dark-mode) */
  darkMode:    '#ACABFF',
} as const;

// ─── Rail (dark navigation surface) ──────────────────────────────────────────

export const rail = {
  /** Rail background (Figma: Nav 3.0 rail fill) */
  bg:     '#1E1A42',
  /** Active / hover pill (Figma: .Menu Item Base Component fill) */
  active: '#2F2673',
  /** Icon / label color on rail (Figma: Nav 3.0 icon fill) */
  icon:   '#ACABFF',
  /** Rail label text (Figma: Nav 3.0 label fill) */
  text:   '#FFFFFF',
} as const;

// ─── Ink (text / icon hierarchy) ──────────────────────────────────────────────

export const ink = {
  /** Primary text, icons, headings (Figma: ink/primary) */
  primary:   '#1F1D25',
  /** Secondary text, labels (Figma: ink/secondary) */
  secondary: '#686576',
  /** Tertiary text, disabled, placeholders (Figma: ink/tertiary) */
  tertiary:  '#9C99A9',
} as const;

// ─── Status (semantic) ────────────────────────────────────────────────────────

export const status = {
  /** Error / destructive (Figma: status/danger) */
  danger:  '#D2323F',
  /** Warning / revision (Figma: status/warning-orange) */
  warning: '#E17613',
  /** Success / approved (Figma: status/success) */
  success: '#1B5E20',
  /** Info / in-progress (Figma: status/info) */
  info:    '#01579B',
} as const;

// ─── Chip / badge colors (Figma "Flat" hex values from Status page) ───────────

export const chip = {
  // Success
  successBg: '#F1F9F1',
  successFg: '#1B5E20',
  // Info
  infoBg:    '#EBF5FB',
  infoFg:    '#01579B',
  // Warning
  warningBg: '#FDF4EC',
  warningFg: '#C45500',
  // Error
  errorBg:   '#FBEFF0',
  errorFg:   '#BE0E1C',
  // Neutral (gray surface, secondary text)
  neutralBg: '#F0F2F4',
  neutralFg: '#686576',
  // Channel (purple tint — brand identity badges)
  channelBg: '#F2F1FF',
  channelFg: '#473BAB',
} as const;

// ─── Surface (backgrounds, fills) ────────────────────────────────────────────

export const surface = {
  /** Pure white (cards, dialogs, paper) */
  background:       '#FFFFFF',
  /** Muted gray surface */
  muted:            '#ECECF0',
  /** Text on muted surface */
  mutedForeground:  '#717182',
  /** Neutral hover surface */
  accent:           '#E9EBEF',
  /** Input fill (Figma: Autocomplete 2.0 / M3 Search 2.0) */
  inputBackground:  '#F9FAFA',
  /** Input hairline border (Figma: M3 Search 2.0 stroke) */
  inputBorder:      '#DDDCE0',
  /** Toggle / switch track */
  switchBackground: '#CBCED4',
  /** Divider / card border */
  border:           'rgba(0, 0, 0, 0.1)',
  /** App canvas behind topbar + body (Figma: Canonical UI 2.0 root fill) */
  canvas:           '#F0F2F4',
  /** TopBar background */
  topbar:           '#F9FAFA',
  /** Filled accordion / soft section card */
  filled:           '#F4F5F6',
  /** Avatar default background (Figma: <Avatar> Content=Text fill) */
  avatar:           '#BCBBC2',
} as const;

// ─── Typography ───────────────────────────────────────────────────────────────

/** UI font stack — Roboto as Figma canonical, Inter as fallback */
export const fontFamily =
  "'Roboto', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

/**
 * Type scale — mirrors text-style tokens from Figma.
 * Each entry: { size (px), lineHeight (px), weight, letterSpacing (px) }
 *
 * Confirmed from Figma text styles:
 *   button/large  → 15 / 26 / 500 / 0.46
 *   button/medium → 14 / 24 / 500 / 0.40
 *   button/small  → 13 / 22 / 500 / 0.46
 *   avatar/40px   → 20 / 20 / 400 / 0.14
 *   avatar/32px   → 16 / 20 / 400 / 0.14
 *   avatar/24px   → 12 / ~20 / 400 / 0.40
 *
 * Derived from component usage across the DS:
 *   label/xs, label/sm, label/md (chip labels, breadcrumb, table headers)
 *   body/sm, body/md, body/lg
 *   title/sm, title/md, title/lg
 *   display
 */
export const typeScale = {
  'label/xs':  { size: 10, lineHeight: 14, weight: 500, letterSpacing: 0.40 },
  'label/sm':  { size: 11, lineHeight: 16, weight: 500, letterSpacing: 0.40 },  // DS Chip
  'label/md':  { size: 12, lineHeight: 16, weight: 500, letterSpacing: 0.40 },  // BreadcrumbBar
  'body/sm':   { size: 13, lineHeight: 18, weight: 400, letterSpacing: 0    },
  'body/md':   { size: 14, lineHeight: 20, weight: 400, letterSpacing: 0    },
  'body/lg':   { size: 16, lineHeight: 24, weight: 400, letterSpacing: 0    },
  'title/sm':  { size: 16, lineHeight: 24, weight: 500, letterSpacing: 0    },
  'title/md':  { size: 18, lineHeight: 26, weight: 500, letterSpacing: 0    },
  'title/lg':  { size: 20, lineHeight: 28, weight: 500, letterSpacing: 0    },
  'display':   { size: 24, lineHeight: 32, weight: 500, letterSpacing: 0    },
  'button/sm': { size: 13, lineHeight: 22, weight: 500, letterSpacing: 0.46 },  // Figma button/small
  'button/md': { size: 14, lineHeight: 24, weight: 500, letterSpacing: 0.40 },  // Figma button/medium
  'button/lg': { size: 15, lineHeight: 26, weight: 500, letterSpacing: 0.46 },  // Figma button/large
} as const;

export type TypeScaleKey = keyof typeof typeScale;

// ─── Shape ────────────────────────────────────────────────────────────────────

export const shape = {
  /** MUI borderRadius multiplier base = 4px (borderRadius: 3 → 12px, 4 → 16px) */
  borderRadius: 4,
  /** Text inputs, selects, menus (Figma: Autocomplete 2.0 / <Menu> Paper) */
  inputRadius:  4,
  /** Cards, dropdowns */
  cardRadius:   3,   // × 4 = 12px
  /** Dialogs / modals (Figma: <Dialog> <Paper>) */
  modalRadius:  24,
  /** Pills — buttons, chips (Figma: Button 3.0) */
  pillRadius:   999,
} as const;

// ─── Elevation (box shadows) ──────────────────────────────────────────────────

export const elevation = {
  /** Card resting state */
  card:     '0 1px 3px rgba(0,0,0,0.08)',
  /** Dropdowns, menus */
  dropdown: '0 8px 32px rgba(0,0,0,0.12)',
  /** Dialogs / modals */
  dialog:   '0 24px 48px rgba(0,0,0,0.16)',
  /** Tooltips */
  tooltip:  '0 4px 16px rgba(0,0,0,0.12)',
  /** Activity monitors, floating panels */
  floating: '0 4px 24px rgba(0,0,0,0.14)',
} as const;

// ─── Z-index ──────────────────────────────────────────────────────────────────

export const zIndex = {
  rail:     10,
  topbar:   20,
  drawer:   1200,
  modal:    1300,
  snackbar: 1400,
  tooltip:  1500,
} as const;

// ─── Spacing ──────────────────────────────────────────────────────────────────

/**
 * Named spacing aliases — all multiples of the 4px grid.
 * In MUI sx: use `theme.spacing(n)` where 1 unit = 8px,
 * or use these for pixel-exact values.
 */
export const spacing = {
  '1':  '4px',
  '2':  '8px',
  '3':  '12px',
  '4':  '16px',
  '5':  '20px',
  '6':  '24px',
  '8':  '32px',
  '10': '40px',
  '12': '48px',
  '16': '64px',
} as const;

// ─── Consolidated export ──────────────────────────────────────────────────────

export const constellationTokens = {
  brand,
  rail,
  ink,
  status,
  chip,
  surface,
  fontFamily,
  typeScale,
  shape,
  elevation,
  zIndex,
  spacing,
} as const;

export type ConstellationTokens = typeof constellationTokens;

// ─── Legacy aliases (backwards compat with existing theme file) ───────────────

/** @deprecated use `shape` */
export const shapeTokens = {
  radius:      shape.borderRadius,
  inputRadius: shape.inputRadius,
  modalRadius: shape.modalRadius,
} as const;

/** @deprecated use `fontFamily` and `typeScale` directly */
export const typographyTokens = {
  fontFamily,
  htmlFontSize:     16,
  fontWeightNormal: 400,
  fontWeightMedium: 500,
} as const;
