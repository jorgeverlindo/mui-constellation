// Load the Constellation palette augmentation (brand/ink/surface on Palette)
import type {} from '../../theme/createConstellationTheme';
import { forwardRef } from 'react';
import MuiTextField, {
  type TextFieldProps as MuiTextFieldProps,
} from '@mui/material/TextField';

/** DS text inputs are always the outlined visual; `variant` is fixed. */
export type TextFieldProps = Omit<MuiTextFieldProps<'outlined'>, 'variant'>;

/**
 * Constellation TextField — outlined input on the DS input surface.
 *
 * Figma Autocomplete 2.0 / Field Types input spec: 36px height, radius 4px,
 * `surface.inputBackground` (#F9FAFA) fill, `surface.inputBorder` (#DDDCE0)
 * hairline border and `ink.tertiary` placeholder. Supports `label`,
 * `helperText` and `error` straight from MUI.
 */
export const TextField = forwardRef<HTMLDivElement, TextFieldProps>(
  function TextField({ size = 'small', sx, ...props }, ref) {
    return (
      <MuiTextField
        ref={ref}
        size={size}
        sx={[
          (theme) => ({
            '& .MuiOutlinedInput-root': {
              backgroundColor: theme.palette.surface.inputBackground,
              // Figma input radius (Autocomplete 2.0 "Input" frame): 4px
              borderRadius: '4px',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: theme.palette.surface.inputBorder,
              },
            },
            // h-9 (36px) for single-line inputs; multiline keeps auto height
            '& .MuiOutlinedInput-root:not(.MuiInputBase-multiline)': {
              height: 36,
            },
            '& .MuiInputBase-input::placeholder': {
              color: theme.palette.ink.tertiary,
              opacity: 1,
            },
          }),
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
        {...props}
      />
    );
  },
);
