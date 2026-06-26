import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

interface KPICardProps {
  label: string;
  value: string;
}

export function KPICard({ label, value }: KPICardProps) {
  return (
    <Box
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
      }}
    >
      <Typography
        sx={{
          fontSize: '11px',
          color: 'text.primary',
          fontWeight: 400,
          letterSpacing: '0.4px',
          lineHeight: 1.66,
        }}
      >
        {label}
      </Typography>
      <Typography
        sx={{
          fontSize: '1rem',
          color: 'text.secondary',
          fontWeight: 400,
          letterSpacing: '0.15px',
          lineHeight: 1.75,
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}
