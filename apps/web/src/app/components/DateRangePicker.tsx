// TODO: port full implementation from vw-funds-2
// Stub: uses MUI Box + Button for the preset buttons; calendar not yet ported
// (react-day-picker is not installed in constellation-full-app)
import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { format, startOfWeek, endOfWeek, subWeeks, subDays, startOfMonth, endOfMonth, addMonths } from 'date-fns';
import { frCA } from 'date-fns/locale';
import { useTranslation } from '../contexts/LanguageContext';

export interface DateRange {
  from?: Date;
  to?: Date;
}

interface DateRangePickerProps {
  initialRange: DateRange | undefined;
  onApply: (range: DateRange | undefined) => void;
  onCancel: () => void;
  className?: string;
  sx?: object;
}

const PRESETS = ['This Week', 'Last Week', 'Last 7 Days', 'Current Month', 'Next Month', 'Reset'] as const;

export function DateRangePicker({ initialRange, onApply, onCancel, sx }: DateRangePickerProps) {
  const { t, language } = useTranslation();
  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>(initialRange);
  const dateLocale = language === 'fr' ? frCA : undefined;
  const fmtDate = (d: Date) => format(d, 'MMM d', { locale: dateLocale });

  const formattedRange = selectedRange?.from && selectedRange?.to
    ? `${fmtDate(selectedRange.from)} - ${fmtDate(selectedRange.to)}`
    : selectedRange?.from
      ? `${fmtDate(selectedRange.from)} - ${t('Select End')}`
      : t('Select Range');

  const handlePreset = (preset: string) => {
    const today = new Date();
    let newRange: DateRange | undefined;
    switch (preset) {
      case 'This Week':   newRange = { from: startOfWeek(today), to: endOfWeek(today) }; break;
      case 'Last Week': { const lw = subWeeks(today, 1); newRange = { from: startOfWeek(lw), to: endOfWeek(lw) }; break; }
      case 'Last 7 Days': newRange = { from: subDays(today, 7), to: today }; break;
      case 'Current Month': newRange = { from: startOfMonth(today), to: endOfMonth(today) }; break;
      case 'Next Month': { const nm = addMonths(today, 1); newRange = { from: startOfMonth(nm), to: endOfMonth(nm) }; break; }
      case 'Reset': newRange = initialRange; break;
    }
    setSelectedRange(newRange);
  };

  return (
    <Box
      sx={{
        position: 'absolute',
        top: '100%',
        right: 0,
        mt: '8px',
        zIndex: 50,
        bgcolor: 'background.paper',
        borderRadius: 2,
        boxShadow: 8,
        border: '1px solid rgba(0,0,0,0.12)',
        p: '24px',
        width: 380,
        ...sx,
      }}
    >
      <Typography sx={{ fontSize: '10px', fontWeight: 500, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.8px', mb: '8px' }}>
        {t('SELECT DATE RANGE')}
      </Typography>
      <Typography sx={{ fontSize: '26px', fontWeight: 400, color: 'text.primary', mb: '24px' }}>
        {formattedRange}
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {PRESETS.map(preset => (
          <Button
            key={preset}
            variant="outlined"
            size="small"
            onClick={() => handlePreset(preset)}
            sx={{
              borderRadius: '100px',
              borderColor: 'rgba(99,86,225,0.5)',
              color: 'primary.main',
              fontSize: '0.8125rem',
              fontWeight: 500,
              textTransform: 'none',
              justifyContent: 'flex-start',
              px: '16px',
              '&:hover': { bgcolor: 'rgba(71,59,171,0.04)', borderColor: 'primary.main' },
            }}
          >
            {t(preset)}
          </Button>
        ))}
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', mt: '32px', pt: '16px' }}>
        <Button
          onClick={onCancel}
          sx={{ color: 'primary.main', fontWeight: 500, textTransform: 'none', '&:hover': { bgcolor: 'rgba(71,59,171,0.04)' } }}
        >
          {t('Cancel')}
        </Button>
        <Button
          onClick={() => onApply(selectedRange)}
          sx={{ color: 'primary.main', fontWeight: 500, textTransform: 'none', '&:hover': { bgcolor: 'rgba(71,59,171,0.04)' } }}
        >
          {t('Ok')}
        </Button>
      </Box>
    </Box>
  );
}
