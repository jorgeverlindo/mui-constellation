import { forwardRef } from 'react';
import MuiLinearProgress, {
  type LinearProgressProps as MuiLinearProgressProps,
} from '@mui/material/LinearProgress';
import { styled } from '@mui/material/styles';
// Load the Constellation palette augmentation (palette.brand/surface/...)
import type {} from '../../theme/createConstellationTheme';

export type ProgressLinearProps = MuiLinearProgressProps;

const Root = styled(MuiLinearProgress)(({ theme }) => ({
  // Original app (ui/progress.tsx): h-2 w-full rounded-full
  height: 8,
  borderRadius: 999,
  backgroundColor: theme.palette.surface.muted,
  '& .MuiLinearProgress-bar': {
    borderRadius: 999,
    backgroundColor: theme.palette.brand.accent,
  },
  // Buffer dash dots inherit the track tone instead of MUI's default primary
  '& .MuiLinearProgress-dashed': {
    backgroundImage: 'none',
    backgroundColor: theme.palette.surface.muted,
  },
}));

/**
 * Constellation ProgressLinear — MUI LinearProgress with the DS bar style:
 * 8px pill track in `surface.muted`, bar in `brand.accent`.
 * Defaults to `variant="determinate"` (pass `value`); use
 * `variant="indeterminate"` for unknown duration.
 */
export const ProgressLinear = forwardRef<HTMLSpanElement, ProgressLinearProps>(
  function ProgressLinear({ variant = 'determinate', value = 0, ...props }, ref) {
    return <Root ref={ref} variant={variant} value={value} {...props} />;
  },
);
