// Load the Constellation palette augmentation (brand/ink/surface on Palette)
import type {} from '../../theme/createConstellationTheme';
import { forwardRef } from 'react';
import MuiTextField, {
  type TextFieldProps as MuiTextFieldProps,
} from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';

export type SearchInputProps = Omit<
  MuiTextFieldProps<'outlined'>,
  'variant' | 'multiline' | 'rows' | 'minRows' | 'maxRows' | 'select'
>;

/**
 * Constellation SearchInput — pill search field with a leading search icon.
 *
 * Figma "M3 Search 2.0": 34px-high pill, `surface.inputBackground` (#F9FAFA)
 * fill, `surface.inputBorder` (#DDDCE0) hairline border, 8px side padding,
 * 24px search icon in `ink.secondary` and `ink.tertiary` placeholder
 * ("Search anything", 14px).
 */
export const SearchInput = forwardRef<HTMLDivElement, SearchInputProps>(
  function SearchInput(
    { size = 'small', placeholder = 'Search anything', slotProps, sx, ...props },
    ref,
  ) {
    return (
      <MuiTextField
        ref={ref}
        type="search"
        size={size}
        placeholder={placeholder}
        slotProps={{
          ...slotProps,
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            ...(slotProps?.input as object | undefined),
          },
        }}
        sx={[
          (theme) => ({
            '& .MuiOutlinedInput-root': {
              height: 34,
              borderRadius: 999,
              backgroundColor: theme.palette.surface.inputBackground,
              fontSize: '0.875rem',
              // Figma M3 Search: 8px horizontal padding
              paddingLeft: '8px',
              paddingRight: '8px',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: theme.palette.surface.inputBorder,
              },
            },
            '& .MuiInputAdornment-root .MuiSvgIcon-root': {
              // black/56 in the original app ≈ ink.secondary
              color: theme.palette.ink.secondary,
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
