import { alpha, createTheme, type Theme } from '@mui/material/styles';
import {
  brand,
  chip,
  elevation,
  fontFamily,
  ink,
  rail,
  shape,
  status,
  surface,
  typeScale,
} from './tokens';

// ─── Palette augmentation ─────────────────────────────────────────────────────

declare module '@mui/material/styles' {
  interface Palette {
    brand: {
      accent: string;
      accentHover: string;
      mid: string;
      light: string;
      darkMode: string;
    };
    rail: {
      bg: string;
      active: string;
      icon: string;
      text: string;
    };
    chip: {
      successBg: string;  successFg: string;
      infoBg: string;     infoFg: string;
      warningBg: string;  warningFg: string;
      errorBg: string;    errorFg: string;
      neutralBg: string;  neutralFg: string;
      channelBg: string;  channelFg: string;
    };
    ink: {
      primary: string;
      secondary: string;
      tertiary: string;
    };
    surface: {
      muted: string;
      mutedForeground: string;
      accent: string;
      inputBackground: string;
      inputBorder: string;
      switchBackground: string;
      canvas: string;
      topbar: string;
      filled: string;
      avatar: string;
    };
  }
  interface PaletteOptions {
    brand?: Palette['brand'];
    rail?: Palette['rail'];
    ink?: Palette['ink'];
    chip?: Palette['chip'];
    surface?: Palette['surface'];
  }

  // Expose the Constellation type scale as MUI typography variants
  interface TypographyVariants {
    'label/xs': React.CSSProperties;
    'label/sm': React.CSSProperties;
    'label/md': React.CSSProperties;
    'body/sm':  React.CSSProperties;
    'body/md':  React.CSSProperties;
    'body/lg':  React.CSSProperties;
    'title/sm': React.CSSProperties;
    'title/md': React.CSSProperties;
    'title/lg': React.CSSProperties;
    display:    React.CSSProperties;
  }
  interface TypographyVariantsOptions {
    'label/xs'?: React.CSSProperties;
    'label/sm'?: React.CSSProperties;
    'label/md'?: React.CSSProperties;
    'body/sm'?:  React.CSSProperties;
    'body/md'?:  React.CSSProperties;
    'body/lg'?:  React.CSSProperties;
    'title/sm'?: React.CSSProperties;
    'title/md'?: React.CSSProperties;
    'title/lg'?: React.CSSProperties;
    display?:    React.CSSProperties;
  }
}

declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    'label/xs': true;
    'label/sm': true;
    'label/md': true;
    'body/sm':  true;
    'body/md':  true;
    'body/lg':  true;
    'title/sm': true;
    'title/md': true;
    'title/lg': true;
    display:    true;
  }
}

// ─── Helper: convert px-based type token to MUI typography entry ──────────────

function t(key: keyof typeof typeScale): React.CSSProperties {
  const { size, lineHeight, weight, letterSpacing } = typeScale[key];
  return {
    fontSize:      `${size}px`,
    lineHeight:    `${lineHeight}px`,
    fontWeight:    weight,
    letterSpacing: letterSpacing ? `${letterSpacing}px` : undefined,
  };
}

// ─── Theme factory ────────────────────────────────────────────────────────────

export function createConstellationTheme(): Theme {
  return createTheme({
    // ── Palette ──────────────────────────────────────────────────────────────
    palette: {
      mode: 'light',
      primary: {
        main:          brand.accent,
        dark:          brand.accentHover,
        light:         brand.light,
        contrastText:  '#FFFFFF',
      },
      secondary: {
        main:         brand.mid,
        light:        brand.light,
        contrastText: '#FFFFFF',
      },
      error:   { main: status.danger },
      warning: { main: status.warning },
      success: { main: status.success },
      info:    { main: status.info },
      text: {
        primary:  ink.primary,
        secondary: ink.secondary,
        disabled:  ink.tertiary,
      },
      divider:    surface.border,
      background: {
        default: surface.background,
        paper:   surface.background,
      },
      // Custom Constellation tokens
      brand:   { ...brand },
      rail:    { ...rail },
      ink:     { ...ink },
      chip:    { ...chip },
      surface: {
        muted:            surface.muted,
        mutedForeground:  surface.mutedForeground,
        accent:           surface.accent,
        inputBackground:  surface.inputBackground,
        inputBorder:      surface.inputBorder,
        switchBackground: surface.switchBackground,
        canvas:           surface.canvas,
        topbar:           surface.topbar,
        filled:           surface.filled,
        avatar:           surface.avatar,
      },
    },

    // ── Shape ─────────────────────────────────────────────────────────────────
    shape: {
      borderRadius: shape.borderRadius,
    },

    // ── Typography ────────────────────────────────────────────────────────────
    typography: {
      fontFamily,
      htmlFontSize:     16,
      fontWeightRegular: 400,
      fontWeightMedium:  500,
      fontWeightBold:    700,

      // MUI heading scale  (mapped to title/* tokens)
      h1: { ...t('title/lg'),  fontSize: '1.5rem'   },
      h2: { ...t('title/md'),  fontSize: '1.25rem'  },
      h3: { ...t('title/sm'),  fontSize: '1.125rem' },
      h4: { ...t('body/lg'),   fontSize: '1rem',     fontWeight: 500 },
      h5: { ...t('body/md'),   fontWeight: 500 },
      h6: { ...t('body/sm'),   fontWeight: 500 },

      // MUI body / subtitle
      subtitle1: { ...t('body/lg') },
      subtitle2: { ...t('body/md'), fontWeight: 500 },
      body1:     { ...t('body/md') },
      body2:     { ...t('body/sm') },
      caption:   { ...t('label/md') },
      overline:  { ...t('label/xs'), textTransform: 'uppercase', letterSpacing: '0.08em' },

      // Button uses Figma button/medium as default
      button: { ...t('button/md'), textTransform: 'none' },

      // Constellation type scale exposed as MUI variants
      'label/xs': t('label/xs'),
      'label/sm': t('label/sm'),
      'label/md': t('label/md'),
      'body/sm':  t('body/sm'),
      'body/md':  t('body/md'),
      'body/lg':  t('body/lg'),
      'title/sm': t('title/sm'),
      'title/md': t('title/md'),
      'title/lg': t('title/lg'),
      display:    t('display'),
    },

    // ── Component overrides ───────────────────────────────────────────────────
    components: {
      MuiButtonBase: {
        defaultProps: { disableRipple: false },
      },

      // Pill buttons per Figma "Button 3.0" spec
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: {
            borderRadius:    shape.pillRadius,
            textTransform:   'none',
            fontWeight:      500,
            letterSpacing:   '0.4px',
            boxShadow:       'none',
            '&:hover':       { boxShadow: 'none' },
          },
          sizeSmall:  { height: 30, ...t('button/sm'), padding: '0 10px' },
          sizeMedium: { height: 36, ...t('button/md'), padding: '0 16px' },
          sizeLarge:  { height: 48, ...t('button/lg'), padding: '0 24px' },
          outlinedPrimary: { borderColor: alpha(brand.mid, 0.5) },
        },
      },

      // Menus: 4px radius (Figma <Menu> <Paper>)
      MuiMenu: {
        styleOverrides: {
          paper: {
            borderRadius: shape.inputRadius,
            boxShadow:    elevation.dropdown,
          },
        },
      },

      // Tooltips: 11px / ink.primary bg (Figma Tooltip spec)
      MuiTooltip: {
        defaultProps: { arrow: true },
        styleOverrides: {
          tooltip: {
            backgroundColor: ink.primary,
            fontSize:        '11px',
            fontWeight:      500,
            borderRadius:    4,
            padding:         '4px 8px',
          },
          arrow: { color: ink.primary },
        },
      },

      // Paper: subtle card shadow
      MuiPaper: {
        styleOverrides: {
          elevation1: { boxShadow: elevation.card },
        },
      },

      // Dialog: 24px radius (Figma <Dialog> <Paper>)
      MuiDialog: {
        styleOverrides: {
          paper: { borderRadius: shape.modalRadius },
        },
      },
    },
  });
}

export const constellationTheme = createConstellationTheme();
