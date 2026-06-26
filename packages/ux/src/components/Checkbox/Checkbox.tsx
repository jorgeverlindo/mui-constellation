// Load the Constellation palette augmentation (brand/ink/surface on Palette)
import type {} from '../../theme/createConstellationTheme';
import { forwardRef, type ReactNode } from 'react';
import MuiCheckbox, {
  type CheckboxProps as MuiCheckboxProps,
} from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';

export type CheckboxProps = MuiCheckboxProps & {
  /** When set, wraps the checkbox in a FormControlLabel. */
  label?: ReactNode;
};

/**
 * Constellation Checkbox — MUI Checkbox in the OEM Constellation style.
 *
 * Mirrors `ui/CheckboxOEM.tsx` from the original app: 20px box (small),
 * `ink.secondary` border when unchecked, brand accent fill when checked
 * (via `color="primary"`), hover tinted to the accent. Pass `label` to get
 * a labelled control without wiring FormControlLabel yourself.
 */
export const Checkbox = forwardRef<HTMLButtonElement, CheckboxProps>(
  function Checkbox({ label, size = 'small', sx, ...props }, ref) {
    const checkbox = (
      <MuiCheckbox
        ref={ref}
        size={size}
        sx={[
          (theme) => ({
            // Unchecked box border tone (OEM: border #686576)
            color: theme.palette.ink.secondary,
            '&:hover': { color: theme.palette.brand.accent },
          }),
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
        {...props}
      />
    );

    if (label == null) return checkbox;
    return (
      <FormControlLabel
        control={checkbox}
        label={label}
        disabled={props.disabled}
      />
    );
  },
);
