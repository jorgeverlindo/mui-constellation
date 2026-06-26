import { forwardRef } from 'react';
import {
  DatePicker as MuiDatePicker,
  type DatePickerProps as MuiDatePickerProps,
} from '@mui/x-date-pickers/DatePicker';

export type DatePickerProps = MuiDatePickerProps;

/**
 * Constellation DatePicker — MUI X DatePicker (v8, date-fns) styled per the DS:
 * input background `palette.surface.inputBackground`, theme radius and the
 * `MMM d, yyyy` display format used across the reference app.
 *
 * The host app is responsible for the LocalizationProvider:
 *
 * ```tsx
 * import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
 * import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'; // date-fns v3/v4
 *
 * <LocalizationProvider dateAdapter={AdapterDateFns}>
 *   <DatePicker label="Start Date" value={date} onChange={setDate} />
 * </LocalizationProvider>
 * ```
 *
 * Pass `format` to override the display format (e.g. for locale-specific
 * formats when the host provides a non-English date-fns locale).
 */
export const DatePicker = forwardRef<HTMLDivElement, DatePickerProps>(
  function DatePicker({ format = 'MMM d, yyyy', sx, ...props }, ref) {
    return (
      <MuiDatePicker
        ref={ref}
        format={format}
        sx={[
          {
            // Accessible field DOM structure (v8 default) and legacy TextField
            '& .MuiPickersInputBase-root, & .MuiOutlinedInput-root': {
              bgcolor: 'surface.inputBackground',
              // Figma input radius/border (Autocomplete 2.0 "Input" frame)
              borderRadius: '4px',
              '& .MuiPickersOutlinedInput-notchedOutline, & .MuiOutlinedInput-notchedOutline':
                {
                  borderColor: 'surface.inputBorder',
                },
            },
          },
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
        {...props}
      />
    );
  },
);
