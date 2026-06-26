import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useTranslation } from '../contexts/LanguageContext';

interface MetricCardProps {
  label: string;
  value: string;
  onClick?: () => void;
}

export function MetricCard({ label, value, onClick }: MetricCardProps) {
  const { t } = useTranslation();
  const isClickable = !!onClick;

  return (
    <Box
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={isClickable ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick?.(); } } : undefined}
      sx={{
        bgcolor: 'background.paper',
        borderRadius: 2,
        px: '12px',
        py: '8px',
        border: '1px solid rgba(0,0,0,0.12)',
        minWidth: 100,
        maxWidth: 360,
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
        ...(isClickable && {
          cursor: 'pointer',
          '&:hover': {
            borderColor: 'primary.main',
            boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
          },
          transition: 'all 0.15s',
        }),
      }}
    >
      <Typography
        sx={{
          fontWeight: 400,
          lineHeight: 1.66,
          color: 'text.primary',
          fontSize: '11px',
          letterSpacing: '0.4px',
        }}
      >
        {t(label)}
      </Typography>
      <Typography
        sx={{
          fontWeight: 400,
          lineHeight: 1.75,
          color: 'text.secondary',
          fontSize: '1rem',
          letterSpacing: '0.15px',
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}
