import { useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { DatavizTooltip } from './DatavizTooltip';
import { useTranslation } from '../contexts/LanguageContext';
import { useOverviewData } from '../../data/access/useOverviewData';
import { useChartAnimation } from '../hooks/useChartAnimation';

export function SpendBreakdownStackedBarCard() {
  const { t } = useTranslation();
  const { spendBreakdown } = useOverviewData();
  const chartAnim = useChartAnimation();

  // Sort to stable order: CPO, OTHER, HARD
  const displayData = useMemo(() => {
    const order = ['MEDIA - CPO', 'MEDIA - OTHER', 'HARD'];
    return [...spendBreakdown].sort((a, b) => order.indexOf(a.category) - order.indexOf(b.category));
  }, [spendBreakdown]);

  const chartData = useMemo(() => {
    const row: Record<string, number | string> = { name: 'Total' };
    displayData.forEach(item => { row[item.category] = item.percent; });
    return [row];
  }, [displayData]);

  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        borderRadius: 3,
        p: 2,
        border: '1px solid rgba(0,0,0,0.12)',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        height: 320,
        minWidth: 0,
        overflow: 'hidden',
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography sx={{ fontSize: '1rem', fontWeight: 600, color: 'text.primary', letterSpacing: '0.15px', lineHeight: '24px' }}>
          {t('Spend')}
        </Typography>
        <IconButton size="small" title={t('Download')} sx={{ color: 'primary.light', '&:hover': { color: 'primary.dark' } }}>
          <DownloadOutlinedIcon fontSize="small" />
        </IconButton>
      </Box>

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', px: 2, width: '100%', minWidth: 0 }}>
        <Box sx={{ width: '100%', minWidth: 100, flex: 1, minHeight: 120 }}>
          <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={120} debounce={1}>
            <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <XAxis
                type="number"
                domain={[0, 100]}
                tick={{ fontSize: 10, fill: '#686576' }}
                tickLine={false}
                axisLine={{ stroke: '#E6E8EC' }}
                ticks={[0, 20, 40, 60, 80, 100]}
              />
              <YAxis type="category" dataKey="name" hide />
              <Tooltip
                cursor={false}
                content={
                  <DatavizTooltip
                    title={t('Spend')}
                    renderItems={() => (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        {displayData.map(item => (
                          <Box key={item.category} sx={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: item.color }} />
                              <Typography sx={{ fontSize: '10px', fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                {t(item.category)}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pl: 2, gap: 2 }}>
                              <Typography sx={{ fontSize: '11px', fontWeight: 500, color: 'text.primary' }}>{item.percent.toFixed(2)}%</Typography>
                              <Typography sx={{ fontSize: '11px', color: 'text.secondary' }}>
                                ${item.value.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                              </Typography>
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    )}
                  />
                }
              />
              {displayData.map((item, idx) => (
                <Bar
                  key={item.category}
                  dataKey={item.category}
                  stackId="a"
                  fill={item.color}
                  barSize={32}
                  radius={idx === 0 ? [4, 0, 0, 4] : idx === displayData.length - 1 ? [0, 4, 4, 0] : [0, 0, 0, 0]}
                  name={t(item.category)}
                  {...chartAnim}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 'auto' }}>
        {displayData.map(item => (
          <Box key={item.category} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  px: '8px',
                  py: '2px',
                  borderRadius: '9999px',
                  fontWeight: 500,
                  color: 'white',
                  fontSize: '10px',
                  bgcolor: item.color,
                }}
              >
                {item.percent.toFixed(2)}%
              </Box>
              <Typography sx={{ color: 'text.primary', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '10px', fontWeight: 500 }}>
                {t(item.category)}
              </Typography>
            </Box>
            <Typography sx={{ color: 'text.primary', fontSize: '11px' }}>
              ${item.value.toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
