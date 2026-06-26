import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, PieChart, Pie, Legend, ReferenceLine, LabelList,
} from 'recharts';
import { DatavizTooltip } from './DatavizTooltip';
import { useTranslation } from '../contexts/LanguageContext';
import { useOverviewData } from '../../data/access/useOverviewData';
import { useClaimPhaseData } from '../../data/access/useClaimPhaseData';
import { useChartAnimation } from '../hooks/useChartAnimation';

const OEMCardHeader = ({
  title,
  subtitle,
  onDownload,
}: {
  title: string;
  subtitle?: string;
  onDownload?: () => void;
}) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
    <Box>
      <Typography sx={{ fontSize: '1rem', fontWeight: 500, color: 'text.primary', letterSpacing: '0.15px', lineHeight: '24px' }}>
        {title}
      </Typography>
      {subtitle && (
        <Typography sx={{ fontSize: '11px', color: 'text.secondary', letterSpacing: '0.4px', lineHeight: 1.66 }}>
          {subtitle}
        </Typography>
      )}
    </Box>
    <IconButton
      onClick={onDownload}
      size="small"
      title="Download CSV"
      sx={{ color: 'primary.light', '&:hover': { color: 'primary.dark' } }}
    >
      <DownloadOutlinedIcon fontSize="small" />
    </IconButton>
  </Box>
);

export function AccruedFundsRooftopCard() {
  const { t } = useTranslation();
  const { rooftopChart } = useOverviewData();
  const chartAnim = useChartAnimation();

  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        borderRadius: 3,
        p: 2,
        border: '1px solid rgba(0,0,0,0.12)',
        display: 'flex',
        flexDirection: 'column',
        height: 400,
      }}
    >
      <OEMCardHeader title={t('Accrued funds — by rooftop (USD)')} />
      <Box sx={{ flex: 1, minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={100} debounce={1}>
          <BarChart data={rooftopChart} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E0E0E0" />
            <XAxis type="number" hide />
            <YAxis dataKey="name" type="category" width={140} tick={{ fontSize: 11, fill: '#686576' }} interval={0} />
            <Tooltip
              content={<DatavizTooltip title={t('Accrued funds — by rooftop (USD)')} />}
              cursor={{ fill: 'transparent' }}
              formatter={(value: number) => [`$${value.toLocaleString()}`, 'Value']}
            />
            <Bar dataKey="value" fill="#6050E0" radius={[0, 4, 4, 0]} barSize={16} {...chartAnim}>
              <LabelList
                dataKey="value"
                position="right"
                style={{ fontSize: '10px', fill: '#686576' }}
                formatter={(val: number) => `$${(val / 1000).toFixed(0)}k`}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
}

export function AccruedFundsRegionCard() {
  const { t } = useTranslation();
  const { regionChart } = useOverviewData();
  const chartAnim = useChartAnimation();
  const total = regionChart.reduce((s, r) => s + r.value, 0) || 1;
  const dataWithPercent = regionChart.map(item => ({ ...item, percent: item.value / total }));

  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        borderRadius: 3,
        p: 2,
        border: '1px solid rgba(0,0,0,0.12)',
        display: 'flex',
        flexDirection: 'column',
        height: 400,
      }}
    >
      <OEMCardHeader title={t('Accrued Funds — by Region (USD)')} />
      <Box sx={{ flex: 1, minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={100} debounce={1}>
          <PieChart>
            <Pie
              data={dataWithPercent}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
              {...chartAnim}
            >
              {dataWithPercent.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<DatavizTooltip title={t('Accrued Funds — by Region (USD)')} />} />
            <Legend
              layout="vertical"
              verticalAlign="middle"
              align="right"
              wrapperStyle={{ fontSize: '11px', color: 'text.primary' }}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={(value: string, entry: any) => (
                <span style={{ color: 'text.primary', marginLeft: '4px' }}>
                  {value} ({Math.round((entry.payload?.percent ?? 0) * 100)}%)
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
}

export function SubmittedClaimsRooftopCard() {
  const { t } = useTranslation();
  const { claimsRooftopChart } = useOverviewData();
  const chartAnim = useChartAnimation();

  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        borderRadius: 3,
        p: 2,
        border: '1px solid rgba(0,0,0,0.12)',
        display: 'flex',
        flexDirection: 'column',
        height: 400,
      }}
    >
      <OEMCardHeader title={t('Submitted Claims — by Rooftop (Count)')} />
      <Box sx={{ flex: 1, minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={100} debounce={1}>
          <BarChart data={claimsRooftopChart} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E0E0E0" />
            <XAxis type="number" hide />
            <YAxis dataKey="name" type="category" width={140} tick={{ fontSize: 11, fill: '#686576' }} interval={0} />
            <Tooltip
              content={<DatavizTooltip title={t('Submitted Claims — by Rooftop (Count)')} />}
              cursor={{ fill: 'transparent' }}
            />
            <Bar dataKey="value" fill="#51B994" radius={[0, 4, 4, 0]} barSize={16} {...chartAnim}>
              <LabelList dataKey="value" position="right" style={{ fontSize: '10px', fill: '#686576' }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
}

export function LongestPaymentTimeCard() {
  const { t } = useTranslation();
  const { paymentTimings, paymentAverage: average } = useClaimPhaseData();
  const chartAnim = useChartAnimation();
  const data = paymentTimings.map(r => ({ name: r.id, value: r.days }));

  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        borderRadius: 3,
        p: 2,
        border: '1px solid rgba(0,0,0,0.12)',
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        width: '100%',
        minWidth: 0,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <Typography sx={{ fontSize: '1rem', fontWeight: 600, color: 'text.primary', letterSpacing: '0.17px', lineHeight: '24px' }}>
          {t('Time in Payment phase')}
        </Typography>
        <IconButton size="small" title="Download" sx={{ color: 'primary.light', '&:hover': { color: 'primary.dark' } }}>
          <DownloadOutlinedIcon fontSize="small" />
        </IconButton>
      </Box>
      <Typography sx={{ fontSize: '11px', color: 'text.secondary', flexShrink: 0 }}>{t('Claim ID vs days')}</Typography>
      <Box sx={{ width: '100%', height: 320, minWidth: 100, minHeight: 320 }}>
        <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={100} debounce={1}>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 0, right: 30, left: 10, bottom: 20 }}
            barSize={16}
            barGap={8}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E0E0E0" />
            <XAxis
              type="number"
              tick={{ fontSize: 10, fill: '#686576' }}
              tickLine={false}
              axisLine={{ stroke: '#E6E8EC' }}
              domain={[0, 25]}
            />
            <YAxis
              dataKey="name"
              type="category"
              width={80}
              tick={{ fontSize: 11, fill: '#686576' }}
              interval={0}
              tickFormatter={(val: string) => val.trim()}
            />
            <Tooltip content={<DatavizTooltip title={t('In days')} />} cursor={{ fill: 'transparent' }} />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} {...chartAnim}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.value > average ? '#F78664' : '#51B994'} />
              ))}
            </Bar>
            <ReferenceLine
              x={average}
              stroke="#686576"
              strokeDasharray="3 3"
              isFront
              label={({ viewBox }: { viewBox: { x: number; y: number; height: number } }) => {
                const { x, y, height } = viewBox;
                return (
                  <text x={x + 5} y={y + height - 5} fill="#1F1D25" fontSize="10" fontWeight="500" textAnchor="start">
                    {`${t('Average')}: ${average}`}
                  </text>
                );
              }}
            />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
}
