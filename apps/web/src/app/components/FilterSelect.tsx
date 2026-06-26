import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import { useTranslation } from '../contexts/LanguageContext';

interface FilterSelectOption {
  value: string | null;
  label: string;
}

interface FilterSelectProps {
  label: string;
  value: string | null;
  width?: string;
  options?: FilterSelectOption[];
  onChange?: (value: string | null) => void;
}

export function FilterSelect({ label, value, options, onChange }: FilterSelectProps) {
  const { t } = useTranslation();

  if (options && onChange) {
    const handleChange = (e: SelectChangeEvent<string>) => {
      onChange(e.target.value === '' ? null : e.target.value);
    };

    return (
      <FormControl size="small" sx={{ minWidth: 120 }}>
        <InputLabel
          shrink
          sx={{
            fontSize: '0.75rem',
            color: 'text.secondary',
            fontWeight: 400,
            letterSpacing: '0.15px',
          }}
        >
          {t(label)}
        </InputLabel>
        <Select
          value={value ?? ''}
          onChange={handleChange}
          label={t(label)}
          notched
          sx={{
            bgcolor: 'surface.inputBackground',
            fontSize: '0.75rem',
            color: 'text.primary',
            letterSpacing: '0.17px',
            height: 40,
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: '#cac9cf',
            },
          }}
        >
          {options.map(opt => (
            <MenuItem key={opt.value ?? '__all'} value={opt.value ?? ''}>
              <Typography sx={{ fontSize: '0.75rem' }}>{t(opt.label)}</Typography>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    );
  }

  // Static display mode
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '4px', width: 'fit-content' }}>
      <Typography
        sx={{ fontSize: '0.75rem', color: 'text.secondary', fontWeight: 400, letterSpacing: '0.15px', px: '4px', whiteSpace: 'nowrap' }}
      >
        {t(label)}
      </Typography>
      <Box
        sx={{
          position: 'relative',
          bgcolor: 'surface.inputBackground',
          border: '1px solid #cac9cf',
          borderRadius: '4px',
          px: '8px',
          height: 40,
          display: 'flex',
          alignItems: 'center',
          minWidth: 'max-content',
          gap: '8px',
        }}
      >
        <Typography sx={{ fontSize: '0.75rem', color: 'text.primary', fontWeight: 400, letterSpacing: '0.17px', whiteSpace: 'nowrap' }}>
          {t(value ?? label)}
        </Typography>
        <svg style={{ width: 24, height: 24, color: 'rgba(0,0,0,0.56)', flexShrink: 0, marginRight: -4 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Box>
    </Box>
  );
}
