import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
  ReferenceLine, Cell, Tooltip,
} from 'recharts';
import { DatavizTooltip } from './DatavizTooltip';
import { useTranslation } from '../contexts/LanguageContext';
import { useClaimPhaseData } from '../../data/access/useClaimPhaseData';
import { useChartAnimation } from '../hooks/useChartAnimation';

export function TimeInPaymentPhaseBarCard() {
  const { t } = useTranslation();
  const { paymentTimings: data, paymentAverage: average } = useClaimPhaseData();
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
        gap: 1.5,
        width: '100%',
        minWidth: 0,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography sx={{ fontSize: '14px', fontWeight: 600, color: 'text.primary', letterSpacing: '0.17px', lineHeight: '24px' }}>
            {t('Time in Payment phase')}
          </Typography>
          <Typography sx={{ fontSize: '11px', color: 'text.secondary', mt: '4px' }}>
            {t('Claim ID vs days')}
          </Typography>
        </Box>
        <IconButton
          size="small"
          sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' }, '&:active': { color: 'primary.dark' } }}
        >
          <DownloadOutlinedIcon fontSize="small" />
        </IconButton>
      </Box>

      <Box sx={{ width: '100%', minWidth: 100, height: 260, minHeight: 260 }}>
        <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={100} debounce={1}>
          <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E6E8EC" horizontal={false} />
            <XAxis
              type="number"
              tick={{ fontSize: 10, fill: '#686576' }}
              tickLine={false}
              axisLine={{ stroke: '#E6E8EC' }}
              domain={[0, 25]}
              ticks={[0, 5, 10, 15, 20, 25]}
            />
            <YAxis
              type="category"
              dataKey="id"
              tick={{ fontSize: 10, fill: '#686576' }}
              tickLine={false}
              axisLine={false}
              width={70}
              reversed
            />
            <Tooltip
              content={
                <DatavizTooltip
                  renderTitle={(payload) => payload[0]?.payload.id}
                  renderItems={(payload) => {
                    if (!payload || !payload.length) return null;
                    const item = payload[0];
                    return (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
                          <Typography sx={{ color: 'text.secondary', fontSize: '11px' }}>{t('In days')}</Typography>
                          <Typography sx={{ fontWeight: 600, color: 'text.primary', fontSize: '11px' }}>{item.value as number}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
                          <Typography sx={{ color: 'text.secondary', fontSize: '11px' }}>{t('Benchmark')}</Typography>
                          <Typography sx={{ fontWeight: 600, color: 'text.primary', fontSize: '11px' }}>{average}</Typography>
                        </Box>
                      </Box>
                    );
                  }}
                />
              }
              cursor={{ fill: 'rgba(0,0,0,0.04)' }}
            />
            <Bar dataKey="days" radius={[0, 4, 4, 0]} barSize={12} {...chartAnim}>
              {data.map((entry, index) => (
                <Cell key={`cell-${entry.id}-${index}`} fill={entry.days > average ? 'rgba(247, 134, 100, 0.9)' : '#60C098'} />
              ))}
            </Bar>
            <ReferenceLine x={average} stroke="#9CA3AF" strokeDasharray="4 4" strokeWidth={1} isFront>
              <text x={average} y={245} dx={5} dy={0} fontSize={10} fill="#686576" textAnchor="start">
                {`${t('Average')}: ${average}`}
              </text>
            </ReferenceLine>
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
}
