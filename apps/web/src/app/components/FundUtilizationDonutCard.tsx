import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { DatavizTooltip } from './DatavizTooltip';
import { useTranslation } from '../contexts/LanguageContext';
import { useOverviewData } from '../../data/access/useOverviewData';
import { useChartAnimation } from '../hooks/useChartAnimation';

export function FundUtilizationDonutCard() {
  const { t } = useTranslation();
  const { utilizationData } = useOverviewData();
  const chartAnim = useChartAnimation();

  const chartData = [
    { name: 'Available',  value: utilizationData.available,  percent: utilizationData.availablePercent,  color: '#51B994' },
    { name: 'Reimbursed', value: utilizationData.reimbursed, percent: utilizationData.reimbursedPercent, color: 'rgba(247, 134, 100, 0.9)' },
  ];

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
        height: 400,
        minWidth: 0,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
        <Typography
          sx={{ fontSize: '1rem', fontWeight: 500, color: 'text.primary', letterSpacing: '0.15px', lineHeight: '24px', flexShrink: 0 }}
        >
          {t('Fund utilization')}
        </Typography>
        <Select
          size="small"
          displayEmpty
          defaultValue=""
          sx={{
            fontSize: '12px',
            color: 'text.secondary',
            bgcolor: 'surface.inputBackground',
            border: '1px solid #cac9cf',
            borderRadius: 1,
            flexShrink: 0,
            '& .MuiSelect-select': { py: '4px', px: '8px' },
            '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
          }}
        >
          <MenuItem value="">{t('Select Fund')}</MenuItem>
        </Select>
      </Box>

      <Box sx={{ position: 'relative', width: '100%', height: 240, minHeight: 240, minWidth: 100 }}>
        <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={100} debounce={1}>
          <PieChart>
            <Tooltip
              wrapperStyle={{ zIndex: 1000 }}
              content={
                <DatavizTooltip
                  title={t('Utilization')}
                  renderItems={payload => {
                    if (!payload?.length) return null;
                    const item = payload[0].payload;
                    return (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, minWidth: 140 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: item.color }} />
                          <Typography sx={{ fontSize: '11px', fontWeight: 500, color: 'text.primary' }}>{t(item.name)}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pl: 2, fontSize: '11px' }}>
                          <Typography sx={{ color: 'text.secondary', fontWeight: 500, fontSize: '11px' }}>{item.percent}%</Typography>
                          <Typography sx={{ color: 'text.primary', fontWeight: 600, fontSize: '11px' }}>
                            ${item.value.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                          </Typography>
                        </Box>
                      </Box>
                    );
                  }}
                />
              }
            />
            <Pie data={chartData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={2} dataKey="value" {...chartAnim}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-utilization-${entry.name}-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        >
          <Typography sx={{ fontSize: '11px', color: 'text.secondary', lineHeight: 1.2 }}>{t('Total Balance')}</Typography>
          <Typography sx={{ fontSize: '1rem', fontWeight: 600, color: 'text.primary', mt: '4px' }}>
            ${utilizationData.total.toLocaleString('en-US', { maximumFractionDigits: 0 })}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {chartData.map(item => (
          <Box key={item.name} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  px: '8px',
                  py: '2px',
                  borderRadius: '9999px',
                  fontWeight: 500,
                  color: 'white',
                  textAlign: 'center',
                  minWidth: 40,
                  fontSize: '11px',
                  bgcolor: item.color,
                }}
              >
                {item.percent}%
              </Box>
              <Typography sx={{ color: 'text.primary', fontSize: '11px' }}>{t(item.name)}</Typography>
            </Box>
            <Typography sx={{ color: 'text.secondary', fontWeight: 500, fontSize: '11px' }}>
              ${item.value.toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
