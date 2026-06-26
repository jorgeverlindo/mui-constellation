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
import { PaymentStatusTableCard } from './PaymentStatusTableCard';
import { FundsPieCard } from './FundsPieCard';
import { FundUtilizationDonutCard } from './FundUtilizationDonutCard';
import { SubmissionPhaseStackedBarCard } from './SubmissionPhaseStackedBarCard';
import { TimeInClaimPhaseBarCard } from './TimeInClaimPhaseBarCard';
import { TimeInPaymentPhaseBarCard } from './TimeInPaymentPhaseBarCard';
import { AccrualsSubmittedDifferenceCard } from './AccrualsSubmittedDifferenceCard';
import { SpendBreakdownStackedBarCard } from './SpendBreakdownStackedBarCard';
import { PreApprovalsPieCard } from './PreApprovalsPieCard';
import { useFilters } from '../contexts/FilterContext';
import { useDealerships } from '../../data/access/useDealerships';
import type { UserType } from '../utils/routing';

interface FundsOverviewContentProps {
  userType?: UserType;
}

export function FundsOverviewContent({
  userType = 'dealer',
}: FundsOverviewContentProps) {
  const { filters, setArea, setDealership, setDateRange, resetFilters, isLockedDealership } = useFilters();
  const { areas, dealerships } = useDealerships();
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
          {!isLockedDealership && (
            <>
              <FilterSelect
                label="Area"
                value={filters.area}
                options={areas.map(a => ({ value: a === 'All Areas' ? null : a, label: a }))}
                onChange={setArea}
              />
              <FilterSelect
                label="Dealership"
                value={filters.dealershipCode}
                options={dealerships.map(d => ({ value: d.code, label: d.name }))}
                onChange={setDealership}
              />
            </>
          )}
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
          position: 'relative',
        }}
      >
        <BalanceMetricsGroup />
        <ClaimsMetricsGroup />
      </Box>

      {/* Row 1: Payment table + Funds pie + Donut */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 4 }}><PaymentStatusTableCard /></Grid>
        <Grid size={{ xs: 12, md: 4 }}><FundsPieCard /></Grid>
        <Grid size={{ xs: 12, md: 4 }}><FundUtilizationDonutCard /></Grid>
      </Grid>

      {/* Row 2: Submission + Claim phase + Payment phase */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 4 }}><SubmissionPhaseStackedBarCard /></Grid>
        <Grid size={{ xs: 12, md: 4 }}><TimeInClaimPhaseBarCard /></Grid>
        <Grid size={{ xs: 12, md: 4 }}><TimeInPaymentPhaseBarCard /></Grid>
      </Grid>

      {/* Accruals bar card */}
      <AccrualsSubmittedDifferenceCard />

      {/* Row 3: Spend + Pre-approvals */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}><SpendBreakdownStackedBarCard /></Grid>
        <Grid size={{ xs: 12, md: 6 }}><PreApprovalsPieCard /></Grid>
      </Grid>
    </Box>
  );
}
