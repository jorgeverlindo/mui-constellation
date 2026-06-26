// Load the Constellation palette augmentation (brand/ink/surface on Palette)
import type {} from '../../theme/createConstellationTheme';
import { forwardRef } from 'react';
import MuiIconButton, {
  type IconButtonProps as MuiIconButtonProps,
} from '@mui/material/IconButton';

export type IconButtonProps = MuiIconButtonProps;

/**
 * Constellation IconButton — round icon-only button.
 *
 * Defaults to `size="small"` to match the compact icon buttons of the original
 * app (≈28px circles, hover bg black/5 — e.g. panel close buttons,
 * LanguageToggleButton). With `color="default"` the icon renders in
 * `ink.secondary`, the DS secondary-icon tone.
 */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton({ size = 'small', color = 'default', sx, ...props }, ref) {
    return (
      <MuiIconButton
        ref={ref}
        size={size}
        color={color}
        sx={[
          color === 'default' &&
            ((theme) => ({ color: theme.palette.ink.secondary })),
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
        {...props}
      />
    );
  },
);
