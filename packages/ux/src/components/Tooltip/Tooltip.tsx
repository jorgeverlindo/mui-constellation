import MuiTooltip, {
  tooltipClasses,
  type TooltipProps as MuiTooltipProps,
} from '@mui/material/Tooltip';
import { styled } from '@mui/material/styles';
// Palette module augmentation (brand/ink/rail/surface)
import type {} from '../../theme/createConstellationTheme';
import { ink } from '../../theme/tokens';

export type TooltipProps = MuiTooltipProps;

/**
 * Constellation Tooltip — MUI Tooltip themed per the DS.
 *
 * DS spec: bg = ink.primary (#1F1D25), white 11px / 500 text, lh 14px,
 * radius 4px (inputRadius), padding 4px 8px. Arrow shown by default.
 */
export const Tooltip = styled(
  ({ className, arrow = true, ...props }: TooltipProps) => (
    <MuiTooltip {...props} arrow={arrow} classes={{ popper: className }} />
  ),
)({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: ink.primary, // DS token: ink.primary #1F1D25
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 500,
    lineHeight: '14px',
    letterSpacing: 0,
    borderRadius: 4,
    padding: '4px 8px',
    maxWidth: 220,
  },
  [`& .${tooltipClasses.arrow}`]: {
    color: ink.primary,
  },
});
