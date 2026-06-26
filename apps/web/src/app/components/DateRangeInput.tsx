import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { format } from 'date-fns';
import { frCA } from 'date-fns/locale';
import { useTranslation } from '../contexts/LanguageContext';

interface DateRangeInputProps {
  startDate: Date | undefined;
  endDate: Date | undefined;
  onClick: () => void;
  onReset: (e: React.MouseEvent) => void;
}

export function DateRangeInput({ startDate, endDate, onClick, onReset }: DateRangeInputProps) {
  const { t, language } = useTranslation();
  const dateLocale = language === 'fr' ? frCA : undefined;
  const fmtDate = (d: Date) => format(d, 'MMM d, yyyy', { locale: dateLocale });

  const displayText = startDate && endDate
    ? `${fmtDate(startDate)} - ${fmtDate(endDate)}`
    : t('Select Date Range');

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', position: 'relative', width: 'fit-content' }}>
      <Typography sx={{ color: 'text.secondary', fontSize: '0.75rem', fontWeight: 400, mb: '4px', letterSpacing: '0.15px', whiteSpace: 'nowrap' }}>
        {t('Date Range')}
      </Typography>
      <Box
        onClick={onClick}
        sx={{
          position: 'relative',
          minWidth: 'max-content',
          bgcolor: 'surface.inputBackground',
          border: '1px solid #cac9cf',
          borderRadius: '4px',
          height: 40,
          display: 'flex',
          alignItems: 'center',
          px: '8px',
          pr: '40px',
          cursor: 'pointer',
          gap: '8px',
          '&:hover': { borderColor: '#6356E1' },
          transition: 'border-color 0.15s',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            px: '4px',
            py: '2px',
            bgcolor: 'rgba(17,16,20,0.04)',
            borderRadius: '4px',
            fontSize: '11px',
            color: 'text.primary',
            letterSpacing: '0.16px',
          }}
        >
          <Typography component="span" sx={{ whiteSpace: 'nowrap', fontSize: '11px' }}>
            {displayText}
          </Typography>
          <Box
            role="button"
            tabIndex={0}
            onClick={onReset}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 16,
              height: 16,
              borderRadius: '50%',
              cursor: 'pointer',
              '&:hover': { bgcolor: 'rgba(0,0,0,0.1)' },
              transition: 'background 0.15s',
            }}
          >
            <svg style={{ width: 12, height: 12, opacity: 0.25 }} fill="none" viewBox="0 0 16 16" stroke="currentColor">
              <path d="M4 4l8 8M12 4l-8 8" strokeWidth={2} strokeLinecap="round" />
            </svg>
          </Box>
        </Box>
        <Box sx={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(0,0,0,0.56)', display: 'flex' }}>
          <CalendarTodayIcon sx={{ fontSize: 22 }} />
        </Box>
      </Box>
    </Box>
  );
}
