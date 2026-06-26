import { forwardRef } from 'react';
import MuiButton, { type ButtonProps as MuiButtonProps } from '@mui/material/Button';

export type ButtonProps = MuiButtonProps;

/**
 * Constellation Button — MUI Button themed as a pill with brand colors.
 * Defaults to `variant="contained"` (brand accent), per the DS.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button({ variant = 'contained', ...props }, ref) {
    return <MuiButton ref={ref} variant={variant} {...props} />;
  },
);
