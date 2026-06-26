import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
  Legend, LabelList, Tooltip as RechartsTooltip,
} from 'recharts';
import { useTranslation } from '../contexts/LanguageContext';
import { useOverviewData } from '../../data/access/useOverviewData';
import { useChartAnimation } from '../hooks/useChartAnimation';

const fmt = (n: number) =>
  '$' + n.toLocaleString('en-US', { maximumFractionDigits: 0 });

const MetricBan = ({
  title,
  metrics,
}: {
  title: string;
  metrics: { label: string; value: string }[];
}) => {
  const { t } = useTranslation();
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Typography sx={{ fontSize: '14px', fontWeight: 600, color: 'text.primary', letterSpacing: '0.17px' }}>
        {t(title)}
      </Typography>
      <Box sx={{ display: 'flex', gap: 1 }}>
        {metrics.map((m) => (
          <Box
            key={m.label}
            sx={{
              border: '1px solid #E0E0E0',
              borderRadius: 2,
              px: 1.5,
              py: 1,
              minWidth: 120,
              bgcolor: 'background.paper',
            }}
          >
            <Typography sx={{ fontSize: '11px', color: 'text.secondary', lineHeight: 1.66 }}>{t(m.label)}</Typography>
            <Typography sx={{ fontSize: '14px', color: 'text.primary', lineHeight: 1.43 }}>{m.value}</Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ dataKey: string; value: number }>;
  label?: string;
}) => {
  const { t } = useTranslation();
  if (!active || !payload?.length) return null;
  const accruals = payload.find(p => p.dataKey === 'accruals');
  const submitted = payload.find(p => p.dataKey === 'submitted');
  const difference = payload.find(p => p.dataKey === 'difference');
  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        borderRadius: 1,
        boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
        border: '1px solid rgba(0,0,0,0.08)',
        p: 1.5,
        minWidth: 200,
      }}
    >
      <Box sx={{ mb: 1, pb: 0.5, borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
        <Typography sx={{ fontWeight: 500, fontSize: '14px', color: 'text.primary' }}>{label}</Typography>
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {accruals && (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 8, height: 8, bgcolor: '#6050E0' }} />
              <Typography sx={{ fontSize: '11px', color: 'text.secondary' }}>{t('Accruals')} ($)</Typography>
            </Box>
            <Typography sx={{ fontSize: '11px', color: 'text.primary', textAlign: 'right' }}>
              ${accruals.value.toLocaleString()}
            </Typography>
          </Box>
        )}
        {submitted && (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 8, height: 8, bgcolor: '#F89070' }} />
              <Typography sx={{ fontSize: '11px', color: 'text.secondary' }}>{t('Submitted')} ($)</Typography>
            </Box>
            <Typography sx={{ fontSize: '11px', color: 'text.primary', textAlign: 'right' }}>
              ${submitted.value.toLocaleString()}
            </Typography>
          </Box>
        )}
        {difference && (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 8, height: 8, bgcolor: '#9CA3AF' }} />
              <Typography sx={{ fontSize: '11px', color: 'text.secondary' }}>{t('Difference')} ($)</Typography>
            </Box>
            <Typography sx={{ fontSize: '11px', color: 'text.primary', textAlign: 'right' }}>
              ${difference.value.toLocaleString()}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export function AccrualsSubmittedDifferenceCard() {
  const { t } = useTranslation();
  const { kpis, monthlyChart } = useOverviewData();
  const chartAnim = useChartAnimation();

  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        borderRadius: 3,
        p: 3,
        border: '1px solid rgba(0,0,0,0.12)',
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        minWidth: 0,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 4 }}>
        <MetricBan
          title="Accruals"
          metrics={[
            { label: 'Year-to-Date', value: fmt(kpis.accrualsYTD) },
            { label: 'Avg. Accrual/mo', value: fmt(kpis.avgAccrualPerMonth) },
          ]}
        />
        <MetricBan
          title="Submitted"
          metrics={[
            { label: 'Year-to-Date', value: fmt(kpis.submittedYTD) },
            { label: 'Avg. Submitted/mo', value: fmt(kpis.avgSubmittedPerMonth) },
          ]}
        />
      </Box>

      <Box sx={{ width: '100%', height: 280, minWidth: 100, minHeight: 280 }}>
        <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={100} debounce={1}>
          <BarChart data={monthlyChart} margin={{ top: 20, right: 0, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E6E8EC" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 10, fill: '#686576' }}
              tickLine={false}
              axisLine={{ stroke: '#E6E8EC' }}
            />
            <YAxis
              tick={{ fontSize: 10, fill: '#686576' }}
              tickLine={false}
              axisLine={false}
              width={50}
              tickFormatter={(value: number) => `$${(value / 1000).toFixed(0)}k`}
            />
            <Legend
              verticalAlign="top"
              height={36}
              iconType="square"
              iconSize={8}
              formatter={(value: string) => (
                <span style={{ fontSize: '11px', color: 'text.secondary', marginLeft: '4px' }}>{t(value)}</span>
              )}
            />
            <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
            <Bar dataKey="accruals" fill="#6050E0" name="Accruals" {...chartAnim}>
              <LabelList
                dataKey="accruals"
                position="top"
                fontSize={9}
                fill="#6050E0"
                formatter={(val: number) => val ? `$${(val / 1000).toFixed(1)}k` : ''}
              />
            </Bar>
            <Bar dataKey="submitted" fill="#F89070" name="Submitted" {...chartAnim}>
              <LabelList
                dataKey="submitted"
                position="top"
                fontSize={9}
                fill="#F89070"
                formatter={(val: number) => val ? `$${(val / 1000).toFixed(1)}k` : ''}
              />
            </Bar>
            <Bar dataKey="difference" fill="#9CA3AF" name="Difference" {...chartAnim}>
              <LabelList
                dataKey="difference"
                position="top"
                fontSize={9}
                fill="#9CA3AF"
                formatter={(val: number) => val ? `$${(val / 1000).toFixed(1)}k` : ''}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
}
