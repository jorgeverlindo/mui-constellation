// Load the Constellation palette augmentation (brand/ink/surface on Palette)
import type {} from '../../theme/createConstellationTheme';
import { forwardRef } from 'react';
import MuiTextField, {
  type TextFieldProps as MuiTextFieldProps,
} from '@mui/material/TextField';

export type TextareaProps = Omit<
  MuiTextFieldProps<'outlined'>,
  'variant' | 'multiline' | 'select'
>;

/**
 * Constellation Textarea — multiline TextField with DS input styling.
 *
 * Min-height 64px (`minRows={2}`, grows with content) per the original app;
 * surface per the Figma input spec: radius 4px, `surface.inputBackground`
 * (#F9FAFA) fill, `surface.inputBorder` (#DDDCE0) hairline border and
 * `ink.tertiary` placeholder. Not resizable, as in the original
 * (`resize-none`).
 */
export const Textarea = forwardRef<HTMLDivElement, TextareaProps>(
  function Textarea({ minRows = 2, sx, ...props }, ref) {
    return (
      <MuiTextField
        ref={ref}
        multiline
        minRows={minRows}
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
