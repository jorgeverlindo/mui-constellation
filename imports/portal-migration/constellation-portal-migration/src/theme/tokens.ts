// ─── Constellation Portal — Design Tokens ────────────────────────────────────
// Single source of truth for all colors, radii, and sizing constants.
// Every component should import from here instead of declaring local hex values.

export const tokens = {
  // ── Brand / Primary ────────────────────────────────────────────────────────
  primary:       '#3730a3',   // main brand purple
  primaryHover:  '#312e81',   // darker primary for hover states
  primaryLight:  '#7F77DD',   // lighter purple (selection bar, AI badge tagged)
  primaryAccent: '#a78bfa',   // accent violet (scan line, spinner tint)
  primaryBrand:  '#473bab',   // folder-tree brand tint

  // ── Semantic ───────────────────────────────────────────────────────────────
  success:       '#22C55E',   // approved / check icons
  error:         '#EF4444',   // dismissed / cancel icons, dislike feedback
  errorHover:    '#DC2626',   // delete hover
  warning:       '#EF9F27',   // needs-review badge, warning icons
  info:          '#6B7280',   // dismissed count, neutral icon

  // ── Surfaces ───────────────────────────────────────────────────────────────
  surfaceDefault:  '#ffffff',
  surfaceMuted:    '#f0f2f4', // card bg, chip bg, topbar shortcut bg, canvas
  surfaceCanvas:   '#F0F2F4', // modal image canvas (same value, semantic alias)
  surfaceStrip:    '#F0EFF8', // bottom thumbnail strip bg
  surfaceRail:     '#F7F8FA', // left thumbnail rail bg
  surfaceInput:    '#f9fafa', // search input bg
  surfaceHover:    '#F3F2FD', // selection bar hover, light purple hover

  // ── Nav (sidebar) ─────────────────────────────────────────────────────────
  navBg:         '#1e1a42',
  navActiveBg:   '#2f2673',
  navIcon:       '#acabff',
  navLabelActive:   '#f9fafa',
  navLabelInactive: '#ffffff',

  // ── Text ───────────────────────────────────────────────────────────────────
  textPrimary:   '#1f1d25',
  textSecondary: '#686576',
  textPlaceholder: '#9c96aa', // search placeholder, muted hints
  textIcon:      '#6B6B80',   // selection bar icon default
  textDim:       'rgba(17,16,20,0.56)', // folder tree dim labels

  // ── Borders ────────────────────────────────────────────────────────────────
  borderDefault: '#e7e7e9',
  divider:       'rgba(0,0,0,0.12)',

  // ── Overlays ───────────────────────────────────────────────────────────────
  activeBg:      'rgba(99,86,225,0.12)', // folder-tree active item bg

  // ── Radii ──────────────────────────────────────────────────────────────────
  radiusCard:    12,
  radiusDialog:  24,
  radiusChip:    8,
  radiusPill:    100,  // "100px" — fully rounded pills
  radiusMenu:    10,

  // ── Sizing — modal ────────────────────────────────────────────────────────
  panelWidth:    356,
  railWidth:     156,
  stripHeight:   64,
  stripThumbW:   56,
  stripThumbH:   40,

  // ── Sizing — folder tree ──────────────────────────────────────────────────
  treeItemHeight: 32,
  treeLabelSize:  14,

  // ── Misc constants ─────────────────────────────────────────────────────────
  highConfThreshold: 0.85,
} as const;
