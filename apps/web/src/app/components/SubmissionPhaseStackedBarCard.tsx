import { useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import { DatavizTooltip } from './DatavizTooltip';
import { useTranslation } from '../contexts/LanguageContext';
import { useClaimPhaseData } from '../../data/access/useClaimPhaseData';
import { useChartAnimation } from '../hooks/useChartAnimation';

export function SubmissionPhaseStackedBarCard({ variant = 'dealer' }: { variant?: 'dealer' | 'oem' }) {
  const { t } = useTranslation();
  const { submissionPhases } = useClaimPhaseData();
  const chartAnim = useChartAnimation();

  const chartData = useMemo(() => {
    const rows = variant === 'dealer'
      ? submissionPhases.length >= 2
        ? [submissionPhases[0], submissionPhases[submissionPhases.length - 1]]
        : submissionPhases
      : submissionPhases.slice(0, 11);

    return rows.map(item => ({ ...item, name: t(item.name) }));
  }, [t, variant, submissionPhases]);

  const displayLegendItems = useMemo(() => {
    if (variant === 'oem') {
      return [
        { name: 'Submission', color: 'secondary.main' },
        { name: 'Pre-Approval', color: '#acabff' },
        { name: 'Final Approval', color: '#72c6a8' },
        { name: 'Payment', color: '#e0e0e0' },
      ];
    }
    return [
      { name: 'Submission → Pre-Approval', color: 'secondary.main' },
      { name: 'Pre-Approval → Final Approval', color: '#acabff' },
      { name: 'Final Approval → Payment', color: '#72c6a8' },
    ];
  }, [variant]);

  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        borderRadius: 3,
        p: 1.5,
        border: '1px solid rgba(0,0,0,0.12)',
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        width: '100%',
        minWidth: 0,
        height: variant === 'oem' ? 500 : 420,
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexShrink: 0 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: 'text.primary', letterSpacing: '0.15px', lineHeight: 1.4 }}>
            {t('Breakdown by time in submission phase')}
          </Typography>
          <Typography sx={{ fontSize: '11px', color: 'text.primary', letterSpacing: '0.4px', lineHeight: 1.2 }}>
            {t('In days')}
          </Typography>
        </Box>
        <IconButton size="small" title={t('Download')} sx={{ color: 'rgba(0,0,0,0.56)' }}>
          <DownloadOutlinedIcon />
        </IconButton>
      </Box>

      {/* Legend */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '8px 16px',
          py: 1,
          flexShrink: 0,
          maxWidth: 600,
          mx: 'auto',
        }}
      >
        {displayLegendItems.map((item) => (
          <Box key={item.name} sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Box sx={{ width: 14, height: 14, flexShrink: 0, bgcolor: item.color }} />
            <Typography sx={{ fontSize: '11px', color: 'text.primary', letterSpacing: '0.4px' }}>
              {t(item.name)}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Chart */}
      <Box sx={{ width: '100%', flex: 1, minHeight: 250, mt: 2 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 0, right: 40, left: 40, bottom: 20 }}
            barSize={variant === 'oem' ? 12 : 60}
            barGap={variant === 'oem' ? 8 : 32}
          >
            <CartesianGrid strokeDasharray="0" stroke="rgba(0,0,0,0.12)" horizontal={false} />
            <XAxis
              type="number"
              tick={{ fontSize: 10, fill: '#1f1d25' }}
              tickLine={false}
              axisLine={false}
              domain={[0, 50]}
              ticks={[0, 10, 20, 30, 40, 50]}
              height={30}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={(props) => {
                const { x, y, payload } = props;
                const isBenchmark = payload.value === t('Benchmark');
                return (
                  <g transform={`translate(${x},${y})`}>
                    <text
                      x={-10}
                      y={0}
                      dy={variant === 'oem' ? 4 : (isBenchmark ? 4 : -4)}
                      textAnchor="end"
                      fill="#1f1d25"
                      fontSize={10}
                      fontWeight={isBenchmark ? 'bold' : 'normal'}
                    >
                      {variant === 'oem' ? (
                        <tspan>{payload.value.length > 25 ? `${payload.value.substring(0, 22)}...` : payload.value}</tspan>
                      ) : (
                        payload.value.split(' ').map((word: string, i: number, arr: string[]) => (
                          <tspan x={-10} dy={i === 0 ? 0 : 10} key={`tspan-${payload.value}-${i}`}>
                            {word} {i === 1 && arr.length > 2 ? arr.slice(2).join(' ') : ''}
                          </tspan>
                        ))
                      )}
                    </text>
                  </g>
                );
              }}
              tickLine={false}
              axisLine={false}
              width={160}
            />
            <Tooltip
              content={
                <DatavizTooltip
                  renderItems={(payload) => {
                    if (!payload || !payload.length) return null;
                    const total = payload.reduce((sum, entry) => sum + (Number(entry.value) || 0), 0);
                    return (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {payload.map((entry) => (
                          <Box key={entry.dataKey as string} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', gap: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Box sx={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, bgcolor: entry.color || (entry as { fill?: string }).fill }} />
                              <Typography sx={{ color: 'text.secondary', fontWeight: 500, fontSize: '11px' }}>
                                {entry.name}
                              </Typography>
                            </Box>
                            <Typography sx={{ color: 'text.primary', fontWeight: 600, fontSize: '11px', fontVariantNumeric: 'tabular-nums' }}>
                              {entry.value as number}
                            </Typography>
                          </Box>
                        ))}
                        <Box sx={{ pt: '6px', mt: '6px', borderTop: '1px solid rgba(0,0,0,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
                          <Typography sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '11px' }}>{t('Total days')}</Typography>
                          <Typography sx={{ color: 'text.primary', fontWeight: 700, fontSize: '11px' }}>{total}</Typography>
                        </Box>
                      </Box>
                    );
                  }}
                />
              }
              cursor={{ fill: 'rgba(0,0,0,0.04)' }}
            />
            <Bar dataKey="Submission → Pre-Approval" stackId="a" fill="#6356e1" radius={[0, 0, 0, 0]} name={t("Submission → Pre-Approval")} {...chartAnim} />
            <Bar dataKey="Pre-Approval → Final Approval" stackId="a" fill="#acabff" radius={[0, 0, 0, 0]} name={t("Pre-Approval → Final Approval")} {...chartAnim} />
            <Bar dataKey="Final Approval → Payment" stackId="a" fill="#72c6a8" radius={[0, 4, 4, 0]} name={t("Final Approval → Payment")} {...chartAnim} />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
}
