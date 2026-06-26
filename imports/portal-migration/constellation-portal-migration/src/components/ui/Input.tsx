import React from 'react';
import { Box, Typography, TextField, InputAdornment } from '@mui/material';

// AV3 tokens
const PRIMARY = '#3730a3';

export interface InputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  /** Icon or element rendered at the trailing edge of the input */
  endAdornment?: React.ReactNode;
  /** Element rendered inline to the right of the label (e.g. ConfidenceBadge) */
  badge?: React.ReactNode;
  id?: string;
}

export function Input({
  label,
  value,
  onChange,
  required,
  placeholder,
  disabled,
  error,
  endAdornment,
  badge,
  id,
}: InputProps) {
  const fieldId = id ?? `input-${label.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography
          component="label"
          htmlFor={fieldId}
          variant="caption"
          sx={{ fontWeight: 500, color: error ? 'error.main' : 'text.secondary', lineHeight: 1.4 }}
        >
          {required && (
            <Box component="span" sx={{ color: 'error.main', mr: 0.25 }}>
              *
            </Box>
          )}
          {label}
        </Typography>
        {badge}
      </Box>

      <TextField
        id={fieldId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        error={Boolean(error)}
        helperText={error}
        size="small"
        fullWidth
        variant="outlined"
        InputProps={{
          endAdornment: endAdornment ? (
            <InputAdornment position="end">{endAdornment}</InputAdornment>
          ) : undefined,
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: PRIMARY,
            },
          },
          '& label': { display: 'none' },    // label is rendered above, not inside
          '& .MuiFormHelperText-root': { mx: 0 },
        }}
      />
    </Box>
  );
}
