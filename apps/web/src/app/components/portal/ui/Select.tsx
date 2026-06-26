import React from 'react';
import { Box, Typography, Autocomplete, TextField, InputAdornment } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { ink, brand, surface as surfaceTokens, status as statusTokens } from '@jorgeverlindo/constellation-ux';

const BRAND = brand.accent;

export interface SelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  badge?: React.ReactNode;
  id?: string;
  showCheckIcon?: boolean;
}

export function Select({
  label,
  value,
  onChange,
  options,
  required,
  placeholder,
  disabled,
  error,
  badge,
  id,
  showCheckIcon = true,
}: SelectProps) {
  const fieldId = id ?? `select-${label.toLowerCase().replace(/\s+/g, '-')}`;
  const hasValue = Boolean(value);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: '4px' }}>
        <Typography
          component="label"
          htmlFor={fieldId}
          sx={{ fontSize: 11, fontWeight: 500, color: error ? 'error.main' : 'text.secondary', lineHeight: 1.4, flex: 1, display: 'flex', gap: '2px' }}
        >
          {required && <Box component="span" sx={{ color: 'error.main' }}>*</Box>}
          {label}
        </Typography>
        {badge}
      </Box>

      <Autocomplete
        value={value || null}
        onChange={(_, newValue) => onChange(newValue ?? '')}
        options={options}
        disabled={disabled}
        disableClearable={false}
        openOnFocus
        autoHighlight
        renderInput={(params) => (
          <TextField
            {...params}
            id={fieldId}
            placeholder={disabled ? '—' : placeholder}
            size="small"
            variant="outlined"
            error={Boolean(error)}
            helperText={error}
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {showCheckIcon && hasValue && !disabled && (
                    <InputAdornment position="end" sx={{ mr: -0.5 }}>
                      <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main', opacity: 0.85, flexShrink: 0 }} />
                    </InputAdornment>
                  )}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '6px',
                fontSize: 13,
                               '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: BRAND },
                ...(hasValue && !disabled && {
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: `${BRAND}60` },
                }),
              },
              '& .MuiFormHelperText-root': { mx: 0 },
            }}
          />
        )}
        slotProps={{
          paper: {
            sx: {
              borderRadius: '8px',
              boxShadow: '0px 4px 16px rgba(0,0,0,0.12)',
              '& .MuiAutocomplete-option': {
                fontSize: 14,
                '&.Mui-focused': { bgcolor: `${BRAND}14` },
                '&[aria-selected="true"]': { bgcolor: `${BRAND}1A`, fontWeight: 600 },
              },
            },
          },
        }}
      />
    </Box>
  );
}
