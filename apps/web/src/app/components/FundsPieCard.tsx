import { useState, useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { DatavizTooltip } from './DatavizTooltip';
import { useTranslation } from '../contexts/LanguageContext';
import { useOverviewData } from '../../data/access/useOverviewData';
import { useChartAnimation } from '../hooks/useChartAnimation';

type TabKey = 'funds' | 'available' | 'approved' | 'pending' | 'expiring';
const TABS: { id: TabKey; label: string }[] = [
  { id: 'funds',     label: 'Funds' },
  { id: 'available', label: 'Available' },
  { id: 'approved',  label: 'Approved' },
  { id: 'pending',   label: 'Pending' },
  { id: 'expiring',  label: 'Expiring' },
];

export function FundsPieCard() {
  const { t } = useTranslation();
  const { fundSplitViews, kpis } = useOverviewData();
  const [activeTab, setActiveTab] = useState<TabKey>('available');
  const chartAnim = useChartAnimation();

  const data = fundSplitViews[activeTab];

  const displayTotal = useMemo(() => {
    switch (activeTab) {
      case 'funds':     return kpis.accrualsYTD;
      case 'available': return kpis.availableFunds;
      case 'approved':  return kpis.approvedYTD;
      case 'pending':   return kpis.pendingInReview;
      case 'expiring':  return kpis.expiringThisMonth;
    }
  }, [activeTab, kpis]);

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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Typography sx={{ fontSize: '1rem', fontWeight: 500, color: 'text.primary', letterSpacing: '0.15px', lineHeight: '24px' }}>
          {t('Funds')}
        </Typography>
      </Box>

      {/* Tab strip */}
      <Box sx={{ overflowX: 'auto' }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: '2px',
            p: '4px',
            bgcolor: 'surface.inputBackground',
            borderRadius: 2,
            minWidth: 'max-content',
          }}
        >
          {TABS.map(tab => (
            <Box
              key={tab.id}
              component="button"
              onClick={() => setActiveTab(tab.id)}
              sx={{
                flexShrink: 0,
                px: '10px',
                py: '6px',
                fontSize: '11px',
                fontWeight: 500,
                letterSpacing: '0.4px',
                lineHeight: 1.66,
                borderRadius: 1.5,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                border: 'none',
                transition: 'all 0.15s',
                bgcolor: activeTab === tab.id ? 'background.paper' : 'transparent',
                color: activeTab === tab.id ? '#1f1d25' : '#686576',
                boxShadow: activeTab === tab.id ? '0 1px 3px rgba(0,0,0,0.12)' : 'none',
                '&:hover': { color: 'text.primary' },
              }}
            >
              {t(tab.label)}
            </Box>
          ))}
        </Box>
      </Box>

      <Box sx={{ width: '100%', height: 200, minHeight: 200, minWidth: 100 }}>
        <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={100} debounce={1}>
          <PieChart>
            <Tooltip
              content={
                <DatavizTooltip
                  title={t('Funds Breakdown')}
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
                            ${item.value.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                          </Typography>
                        </Box>
                      </Box>
                    );
                  }}
                />
              }
            />
            <Pie data={data} cx="50%" cy="50%" outerRadius={80} dataKey="value" paddingAngle={2} {...chartAnim}>
              {data.map((entry, index) => (
                <Cell key={`cell-funds-${entry.name}-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {data.map(item => (
          <Box
            key={item.name}
            sx={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', alignItems: 'center', gap: '6px', fontSize: '11px' }}
          >
            <Box
              sx={{
                px: '6px',
                py: '2px',
                borderRadius: '9999px',
                fontWeight: 500,
                whiteSpace: 'nowrap',
                fontSize: '10px',
                bgcolor: `${item.color}20`,
                color: item.color,
              }}
            >
              {item.percent}%
            </Box>
            <Typography
              sx={{
                color: 'text.primary',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                minWidth: 0,
                fontSize: '11px',
              }}
              title={t(item.name)}
            >
              {t(item.name)}
            </Typography>
            <Typography sx={{ color: 'text.secondary', fontWeight: 500, whiteSpace: 'nowrap', textAlign: 'right', fontSize: '11px' }}>
              ${item.value.toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </Typography>
          </Box>
        ))}
      </Box>

      <Box sx={{ pt: 1.5, borderTop: '1px solid #E6E8EC' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px' }}>
          <Typography sx={{ color: 'text.secondary', fontSize: '11px' }}>
            {t(TABS.find(tab => tab.id === activeTab)?.label ?? 'Available')}
          </Typography>
          <Typography sx={{ color: 'text.primary', fontWeight: 600, fontSize: '11px' }}>
            ${displayTotal.toLocaleString('en-US', { maximumFractionDigits: 0 })}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
