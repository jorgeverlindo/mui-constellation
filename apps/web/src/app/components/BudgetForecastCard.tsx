import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import BarChartIcon from '@mui/icons-material/BarChart';
import { useTranslation } from '../contexts/LanguageContext';
import { useContractsData } from '../../data/access/useContractsData';
import { ContractForDisplay, RangeOption } from '../../data/types/overview';
import { BudgetForecastRangeTabs } from './budget-forecast/BudgetForecastRangeTabs';
import { BudgetForecastYearPicker } from './budget-forecast/BudgetForecastYearPicker';
import { CheckIcon } from './budget-forecast/icons';

const MONTHS = [
  "Jan '26", "Feb '26", "Mar '26", "Apr '26", "May '26", "Jun '26",
  "Jul '26", "Aug '26", "Sep '26", "Oct '26", "Nov '26", "Dec '26",
];

// ─── MetricBan ────────────────────────────────────────────────────────────────

interface MetricBanProps {
  label: string;
  value: string;
  legendColor?: string;
}

function MetricBan({ label, value, legendColor }: MetricBanProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        p: '12px',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        minWidth: 120,
        flex: 1,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px', mb: '4px' }}>
        {legendColor && (
          <Box sx={{ width: 12, height: 12, borderRadius: '2px', bgcolor: legendColor, flexShrink: 0 }} />
        )}
        <Typography sx={{ fontSize: '11px', color: 'text.secondary', fontWeight: 400, lineHeight: 1.3 }}>
          {label}
        </Typography>
      </Box>
      <Typography sx={{ fontSize: '14px', color: 'text.primary', fontWeight: 400, lineHeight: 1.3 }}>
        {value}
      </Typography>
    </Box>
  );
}

// ─── BudgetForecastStatusChip ─────────────────────────────────────────────────

function BudgetForecastStatusChip({ value }: { value: string }) {
  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        pl: '6px',
        pr: '8px',
        py: '2px',
        borderRadius: '8px',
        bgcolor: '#e8f5e9',
        border: '1px solid #1b5e20',
        boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
        whiteSpace: 'nowrap',
      }}
    >
      <Box sx={{ width: 14, height: 14, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CheckIcon />
      </Box>
      <Typography
        sx={{
          fontSize: '11px',
          color: 'success.main',
          fontWeight: 400,
          lineHeight: '1.66',
          letterSpacing: '0.4px',
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}

// ─── BudgetForecastTooltip ────────────────────────────────────────────────────

function BudgetForecastTooltip({
  month,
  monthIndex,
  contracts,
}: {
  month: string;
  monthIndex: number;
  contracts: ContractForDisplay[];
}) {
  const currentMonthDate = new Date(2026, monthIndex, 1);
  const relevantContracts = contracts.filter((c) => c.expiresDate >= currentMonthDate);
  const maxValue = contracts.length > 0 ? Math.max(...contracts.map((c) => c.value)) : 1;

  return (
    <Paper
      elevation={6}
      sx={{
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        p: '16px',
        minWidth: 320,
        pointerEvents: 'auto',
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {/* Header */}
        <Box>
          <Typography sx={{ fontSize: '14px', fontWeight: 500, color: 'text.primary', letterSpacing: '0.1px' }}>
            {month}
          </Typography>
          <Typography sx={{ fontSize: '11px', color: 'text.secondary', letterSpacing: '0.4px' }}>
            Total Available:{' '}
            {contracts
              .reduce((s, c) => s + c.value, 0)
              .toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 })}
          </Typography>
        </Box>

        {/* Legend */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Box sx={{ width: 10, height: 10, borderRadius: '2px', bgcolor: '#6356e1' }} />
            <Typography sx={{ fontSize: '11px', color: 'text.primary' }}>Media Cost</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Box sx={{ width: 10, height: 10, borderRadius: '2px', bgcolor: 'rgba(247,134,100,0.9)' }} />
            <Typography sx={{ fontSize: '11px', color: 'text.primary' }}>Hard Cost</Typography>
          </Box>
        </Box>

        {/* Contract rows */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {relevantContracts.map((contract) => {
            const isExpiringThisMonth = contract.expiresDate.getMonth() === monthIndex;
            const textColor = isExpiringThisMonth ? '#f44336' : '#1f1d25';
            const labelColor = isExpiringThisMonth ? '#f44336' : 'text.secondary';
            const totalWidthPercent = (contract.value / maxValue) * 100;
            const mediaPercent = (contract.mediaCost / contract.value) * 100;
            const hardPercent = (contract.hardCost / contract.value) * 100;

            return (
              <Box key={contract.id} sx={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', minWidth: 100 }}>
                  <Typography sx={{ fontSize: '11px', fontWeight: 500, color: textColor, lineHeight: 1.3 }}>
                    {contract.formattedValue}
                  </Typography>
                  <Typography sx={{ fontSize: '10px', color: labelColor, lineHeight: 1.3 }}>
                    Expires {contract.expiresAt}
                  </Typography>
                </Box>
                <Box sx={{ flex: 1, height: 18, display: 'flex', alignItems: 'center', minWidth: 120 }}>
                  <Box
                    sx={{
                      height: '100%',
                      display: 'flex',
                      borderRadius: '2px',
                      overflow: 'hidden',
                      width: `${totalWidthPercent}%`,
                    }}
                  >
                    <Box
                      sx={{
                        height: '100%',
                        bgcolor: '#6356e1',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: `${mediaPercent}%`,
                        fontSize: '9px',
                        color: '#fff',
                        fontWeight: 500,
                      }}
                    >
                      {mediaPercent > 20 && contract.mediaCostFormatted}
                    </Box>
                    <Box
                      sx={{
                        height: '100%',
                        bgcolor: 'rgba(247,134,100,0.9)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: `${hardPercent}%`,
                        fontSize: '9px',
                        color: '#fff',
                        fontWeight: 500,
                      }}
                    >
                      {hardPercent > 20 && contract.hardCostFormatted}
                    </Box>
                  </Box>
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>
    </Paper>
  );
}

// ─── BudgetForecastCard ───────────────────────────────────────────────────────

export function BudgetForecastCard({ variant = 'card' }: { variant?: 'card' | 'clean' | 'oem' }) {
  const { t } = useTranslation();
  const [selectedRange, setSelectedRange] = useState<RangeOption>('12m');
  const [selectedYear, setSelectedYear] = useState(2026);
  const [hoveredMonth, setHoveredMonth] = useState<string | null>(null);

  const { contracts, kpis: contractKpis } = useContractsData();
  const kpiData = contractKpis[selectedRange];

  const monthsToShow = selectedRange === '3m' ? 3 : selectedRange === '6m' ? 6 : 12;
  const visibleMonths = MONTHS.slice(0, monthsToShow);

  const visibleContracts = contracts.filter((contract) => {
    const monthIndex = contract.expiresDate.getMonth();
    return monthIndex < monthsToShow;
  });

  const gridColsStyle = {
    gridTemplateColumns: `repeat(${monthsToShow}, minmax(0, 1fr))`,
  };

  return (
    <Box
      sx={{
        width: '100%',
        ...(variant === 'card' || variant === 'oem'
          ? {
              bgcolor: 'background.paper',
              borderRadius: 3,
              boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
              border: '1px solid',
              borderColor: 'divider',
              p: '24px',
            }
          : { bgcolor: 'transparent' }),
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: '24px' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Typography sx={{ fontSize: '18px', fontWeight: 700, color: 'text.primary', letterSpacing: '-0.3px' }}>
            {t('Budget Forecast')}
          </Typography>
          <BudgetForecastRangeTabs selectedRange={selectedRange} onRangeChange={setSelectedRange} />
        </Box>
        <Box sx={{ color: 'text.secondary', transform: 'rotate(90deg)', display: 'flex' }}>
          <BarChartIcon sx={{ fontSize: 20 }} />
        </Box>
      </Box>

      {/* Controls & KPIs */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '32px', mb: '32px' }}>
        <BudgetForecastYearPicker selectedYear={selectedYear} onYearChange={setSelectedYear} />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
          <MetricBan label="Available" value={kpiData.available} />
          <MetricBan label="Expiring" value={kpiData.expiring} />
          <MetricBan label="Media Cost" value={kpiData.mediaCost} legendColor="#6356e1" />
          <MetricBan label="Hard Cost" value={kpiData.hardCost} legendColor="rgba(247,134,100,0.9)" />
        </Box>
      </Box>

      {/* Timeline Container */}
      <Box sx={{ position: 'relative', borderTop: '1px solid', borderColor: 'divider' }}>
        {/* Month Grid */}
        <Box sx={{ display: 'grid', width: '100%', position: 'relative', zIndex: 10, ...gridColsStyle }}>
          {visibleMonths.map((month, index) => (
            <Box
              key={month}
              onMouseEnter={() => setHoveredMonth(month)}
              onMouseLeave={() => setHoveredMonth(null)}
              sx={{
                position: 'relative',
                height: 380,
                borderRight: '1px solid',
                borderColor: 'divider',
                cursor: 'pointer',
                bgcolor: hoveredMonth === month ? 'rgba(99,86,225,0.05)' : 'transparent',
                transition: 'background-color 0.15s',
              }}
            >
              {/* Month Label */}
              <Typography
                sx={{
                  p: '12px',
                  fontSize: '11px',
                  color: 'text.primary',
                  fontWeight: 400,
                  letterSpacing: '0.4px',
                }}
              >
                {month}
              </Typography>

              {/* Scrubber Line */}
              {hoveredMonth === month && (
                <Box
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    left: '50%',
                    width: '1px',
                    borderLeft: '2px dashed #111014',
                    opacity: 0.56,
                    pointerEvents: 'none',
                    zIndex: 10,
                  }}
                />
              )}

              {/* Tooltip */}
              {hoveredMonth === month && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 55,
                    left: '50%',
                    zIndex: 50,
                    transform: 'translateX(8px)',
                    pointerEvents: 'auto',
                  }}
                >
                  <BudgetForecastTooltip month={month} monthIndex={index} contracts={contracts} />
                </Box>
              )}
            </Box>
          ))}
        </Box>

        {/* Contract Rows Overlay */}
        <Box
          sx={{
            position: 'absolute',
            top: 40,
            left: 0,
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        >
          {visibleContracts.map((contract) => {
            const expiryMonthIndex = contract.expiresDate.getMonth();
            const durationInMonths = expiryMonthIndex + 1;
            const widthPercent = (durationInMonths / monthsToShow) * 100;

            return (
              <Box
                key={contract.id}
                sx={{
                  position: 'relative',
                  height: 40,
                  bgcolor: 'rgba(231,231,233,0.75)',
                  borderRadius: '0 10px 10px 0',
                  width: `${Math.min(widthPercent, 100)}%`,
                  maxWidth: '100%',
                  transition: 'width 0.3s ease-out',
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    right: 0,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    pr: '4px',
                    display: 'flex',
                    justifyContent: 'flex-end',
                    width: '100%',
                  }}
                >
                  <Box sx={{ mr: '4px' }}>
                    <BudgetForecastStatusChip value={contract.formattedValue} />
                  </Box>
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
}
