import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { MetricCard } from './MetricCard';
import { useTranslation } from '../contexts/LanguageContext';
import { useOverviewData } from '../../data/access/useOverviewData';

const fmt = (n: number) =>
  '$' + n.toLocaleString('en-US', { maximumFractionDigits: 0 });

export function BalanceMetricsGroup() {
  const { t } = useTranslation();
  const { kpis } = useOverviewData();

  return (
    <Box
      sx={{
        bgcolor: 'surface.canvas',
        flex: 1,
        minHeight: 0,
        minWidth: 0,
        position: 'relative',
        borderRadius: 3,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          p: 1,
          width: '100%',
        }}
      >
        <Typography
          sx={{
            fontWeight: 500,
            lineHeight: '24px',
            color: 'text.primary',
            fontSize: '14px',
            letterSpacing: '0.17px',
            mb: 1,
            px: '4px',
          }}
        >
          {t('Balance')}
        </Typography>
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 1,
            alignItems: 'center',
            width: '100%',
          }}
        >
          <MetricCard label="Current Balance"     value={fmt(kpis.currentBalance)} />
          <MetricCard label="Available Funds"     value={fmt(kpis.availableFunds)} />
          <MetricCard label="Proj. EOY Balance"   value={fmt(kpis.projEOYBalance)} />
          <MetricCard label="Expiring this month" value={fmt(kpis.expiringThisMonth)} />
        </Box>
      </Box>
    </Box>
  );
}
