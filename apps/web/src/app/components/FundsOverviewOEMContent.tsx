import { useState, useRef, useEffect } from 'react';
import type { DateRange } from './DateRangePicker';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import { GenerateReportSplitButton } from './GenerateReportSplitButton';
import { FilterSelect } from './FilterSelect';
import { DateRangeInput } from './DateRangeInput';
import { DateRangePicker } from './DateRangePicker';
import { BalanceMetricsGroup } from './BalanceMetricsGroup';
import { ClaimsMetricsGroup } from './ClaimsMetricsGroup';
import {
  AccruedFundsRooftopCard,
  AccruedFundsRegionCard,
  SubmittedClaimsRooftopCard,
  LongestPaymentTimeCard,
} from './FundsOverviewOEMCharts';
import { FundsPieCard } from './FundsPieCard';
import { FundUtilizationDonutCard } from './FundUtilizationDonutCard';
import { SubmissionPhaseStackedBarCard } from './SubmissionPhaseStackedBarCard';
import { SpendBreakdownStackedBarCard } from './SpendBreakdownStackedBarCard';
import { PreApprovalsPieCard } from './PreApprovalsPieCard';
import { useFilters } from '../contexts/FilterContext';
import { useDealerships } from '../../data/access/useDealerships';

export function FundsOverviewOEMContent() {
  const { filters, setArea, setDateRange, resetFilters } = useFilters();
  const { areas } = useDealerships();
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const datePickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setIsDatePickerOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDateApply = (range: DateRange | undefined) => {
    if (range?.from && range?.to) setDateRange(range.from, range.to);
    setIsDatePickerOpen(false);
  };

  const handleDateReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    resetFilters();
  };

  const dateRangeForInput: DateRange = { from: filters.dateFrom, to: filters.dateTo };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Toolbar */}
      <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <GenerateReportSplitButton />
        </Box>
        <Box
          sx={{
            display: 'flex',
            gap: 1.5,
            alignItems: 'flex-end',
            justifyContent: 'flex-end',
            position: 'relative',
            flexShrink: 0,
            zIndex: 40,
            overflow: 'visible',
          }}
        >
          {/* OEM: Area filter only — no individual dealer filter */}
          <FilterSelect
            label="Area"
            value={filters.area}
            options={areas.map(a => ({ value: a === 'All Areas' ? null : a, label: a }))}
            onChange={setArea}
          />
          <Box sx={{ position: 'relative' }} ref={datePickerRef}>
            <DateRangeInput
              startDate={filters.dateFrom}
              endDate={filters.dateTo}
              onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
              onReset={handleDateReset}
            />
            {isDatePickerOpen && (
              <DateRangePicker
                initialRange={dateRangeForInput}
                onApply={handleDateApply}
                onCancel={() => setIsDatePickerOpen(false)}
              />
            )}
          </Box>
        </Box>
      </Box>

      {/* Metrics groups */}
      <Box
        sx={{
          display: 'flex',
          flex: 1,
          flexWrap: 'wrap',
          gap: '14px',
          alignItems: 'stretch',
          minHeight: 0,
          minWidth: 0,
        }}
      >
        <BalanceMetricsGroup />
        <ClaimsMetricsGroup />
      </Box>

      {/* OEM Row 1: Rooftop + Region + Claims rooftop */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 4 }}><AccruedFundsRooftopCard /></Grid>
        <Grid size={{ xs: 12, md: 4 }}><AccruedFundsRegionCard /></Grid>
        <Grid size={{ xs: 12, md: 4 }}><SubmittedClaimsRooftopCard /></Grid>
      </Grid>

      {/* OEM Row 2: Funds pie + Utilization donut */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}><FundsPieCard /></Grid>
        <Grid size={{ xs: 12, md: 6 }}><FundUtilizationDonutCard /></Grid>
      </Grid>

      {/* OEM Row 3: Submission phase + Payment time */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}><SubmissionPhaseStackedBarCard variant="oem" /></Grid>
        <Grid size={{ xs: 12, md: 6 }}><LongestPaymentTimeCard /></Grid>
      </Grid>

      {/* OEM Row 4: Spend + Pre-approvals */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}><SpendBreakdownStackedBarCard /></Grid>
        <Grid size={{ xs: 12, md: 6 }}><PreApprovalsPieCard /></Grid>
      </Grid>
    </Box>
  );
}
