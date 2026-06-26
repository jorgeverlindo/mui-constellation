import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { DatavizTooltip } from './DatavizTooltip';
import { useTranslation } from '../contexts/LanguageContext';
import { useOverviewData } from '../../data/access/useOverviewData';
import { useChartAnimation } from '../hooks/useChartAnimation';

export function PreApprovalsPieCard() {
  const { t } = useTranslation();
  const { preApprovalStats } = useOverviewData();
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
        height: 320,
        minWidth: 0,
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography sx={{ fontSize: '1rem', fontWeight: 600, color: 'text.primary', letterSpacing: '0.15px', lineHeight: '24px' }}>
          {t('Pre-Approvals')}
        </Typography>
        <IconButton size="small" title={t('Download')} sx={{ color: 'primary.light', '&:hover': { color: 'primary.dark' } }}>
          <DownloadOutlinedIcon fontSize="small" />
        </IconButton>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, minHeight: 0, gap: 3 }}>
        <Box sx={{ flex: 1, height: 240, minWidth: 100, position: 'relative', minHeight: 240 }}>
          <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={100} debounce={1}>
            <PieChart>
              <Tooltip
                content={
                  <DatavizTooltip
                    title={t('Pre-Approvals')}
                    renderItems={payload => {
                      if (!payload?.length) return null;
                      const item = payload[0].payload;
                      return (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, minWidth: 140 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: item.color }} />
                            <Typography sx={{ fontSize: '11px', fontWeight: 500, color: 'text.primary' }}>{t(item.name)}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pl: 2 }}>
                            <Typography sx={{ color: 'text.secondary', fontWeight: 500, fontSize: '11px' }}>{item.percent}%</Typography>
                            <Typography sx={{ color: 'text.primary', fontWeight: 600, fontSize: '11px' }}>
                              {item.value.toLocaleString()}
                            </Typography>
                          </Box>
                        </Box>
                      );
                    }}
                  />
                }
              />
              <Pie
                data={preApprovalStats}
                cx="50%"
                cy="50%"
                outerRadius="90%"
                dataKey="value"
                stroke="none"
                {...chartAnim}
              >
                {preApprovalStats.map((entry, index) => (
                  <Cell key={`cell-pre-approval-${entry.name}-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </Box>

        <Box
          sx={{
            width: 180,
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
            pl: 2,
            borderLeft: '1px solid rgba(0,0,0,0.06)',
            flexShrink: 0,
          }}
        >
          {preApprovalStats.map(item => (
            <Box key={item.name} sx={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      px: '6px',
                      py: '2px',
                      borderRadius: 1,
                      fontSize: '10px',
                      fontWeight: 500,
                      color: 'white',
                      minWidth: 32,
                      textAlign: 'center',
                      bgcolor: item.color,
                    }}
                  >
                    {item.percent}%
                  </Box>
                  <Typography sx={{ color: 'text.primary', fontSize: '11px', maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {t(item.name)}
                  </Typography>
                </Box>
                <Typography sx={{ color: 'text.primary', fontWeight: 500, fontSize: '11px', textAlign: 'right' }}>
                  {item.value.toLocaleString()}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
