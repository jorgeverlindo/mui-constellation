import { forwardRef } from 'react';
import MuiChip, { type ChipProps as MuiChipProps } from '@mui/material/Chip';
import { type Theme } from '@mui/material/styles';
// Palette module augmentation (brand/ink/rail/chip/surface)
import type {} from '../../theme/createConstellationTheme';

/**
 * DS chip variants, derived from the original app:
 * - `channel`   — ChannelChip (platform chips: icon in white pill + label)
 * - `success`   — StatusChip Approved/Paid/Confirmed/Solved (green)
 * - `warning`   — StatusChip Pending/Revision Requested (orange)
 * - `error`     — StatusChip Denied/Penalty Applied/At risk (red)
 * - `info`      — StatusChip Open/In Review (blue)
 * - `neutral`   — SeverityChip Low / fallback (gray)
 */
export type ChipVariant =
  | 'neutral'
  | 'channel'
  | 'success'
  | 'warning'
  | 'error'
  | 'info';

export interface ChipProps extends Omit<MuiChipProps, 'variant'> {
  /** Constellation variant (replaces MUI's filled/outlined). @default 'neutral' */
  variant?: ChipVariant;
}

// Colors per the Figma Status page ("'Flat' Hex Values"), via palette.chip.
function variantColors(theme: Theme, variant: ChipVariant) {
  const c = theme.palette.chip;
  switch (variant) {
    case 'channel':
      return { bg: c.neutralBg, fg: theme.palette.ink.primary };
    case 'success':
      return { bg: c.successBg, fg: c.successFg };
    case 'warning':
      return { bg: c.warningBg, fg: c.warningFg };
    case 'error':
      return { bg: c.errorBg, fg: c.errorFg };
    case 'info':
      return { bg: c.infoBg, fg: c.infoFg };
    case 'neutral':
    default:
      return { bg: c.neutralBg, fg: theme.palette.ink.secondary };
  }
}

/**
 * Constellation Chip — MUI Chip with the DS status/channel variants.
 *
 * Shared shape per the Figma Status Indicator: height 24px, radius 8px,
 * 11px text, tracking 0.4px, padding 6/8. Use `avatar` for the channel icon
 * (rendered in a white 20px pill) and `icon` for status glyphs; `onDelete`
 * renders the × button (0.26 idle / 0.6 hover opacity).
 */
export const Chip = forwardRef<HTMLDivElement, ChipProps>(
  function Chip({ variant = 'neutral', sx, ...props }, ref) {
    return (
      <MuiChip
        ref={ref}
        size="small"
        sx={[
          (theme) => {
            const { bg, fg } = variantColors(theme, variant);
            return {
              height: 24,
              borderRadius: '8px',
              backgroundColor: bg,
              color: fg,
              fontSize: 11,
              fontWeight: 400,
              letterSpacing: '0.4px',
              lineHeight: '18px',
              // Figma .Status Indicator Structure: pad left 6 / right 8
              '& .MuiChip-label': { pl: '6px', pr: '8px' },
              '& .MuiChip-icon': {
                color: 'inherit',
                fontSize: 14,
                ml: '6px',
                mr: '-2px',
              },
              // Channel icon — 20px white pill, 2px padding
              '& .MuiChip-avatar': {
                width: 20,
                height: 20,
                ml: '4px',
                mr: '-2px',
                p: '2px',
                backgroundColor: theme.palette.background.paper,
                '& img': { objectFit: 'contain' },
              },
              '& .MuiChip-deleteIcon': {
                fontSize: 14,
                mr: '5px',
                color: theme.palette.ink.primary,
                opacity: 0.26,
                transition: theme.transitions.create('opacity'),
                '&:hover': { color: theme.palette.ink.primary, opacity: 0.6 },
              },
            };
          },
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
        {...props}
      />
    );
  },
);
