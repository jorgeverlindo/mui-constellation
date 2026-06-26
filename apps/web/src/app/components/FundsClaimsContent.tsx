import { useState, useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import OutlinedInput from '@mui/material/OutlinedInput';
import Collapse from '@mui/material/Collapse';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import SearchIcon from '@mui/icons-material/Search';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import type { DateRange } from './DateRangePicker';
import { useTranslation } from '../contexts/LanguageContext';
import { DateRangeInput } from './DateRangeInput';
import { DateRangePicker } from './DateRangePicker';
import { FilterSelect } from './FilterSelect';
import { ClaimsSubmittedBans } from './ClaimsSubmittedBans';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { StatusChip } from './StatusChip';
import type { ClaimStatus } from './StatusChip';
import type { Claim } from './ClaimsPanel';
import { ActionButton } from './ActionButton';
import {
  useWorkflow,
  WORKFLOW_DEALER,
  WORKFLOW_CAMPAIGN,
  type ClaimWorkflowStatus,
  type ArchivedCycle,
} from '../contexts/WorkflowContext';
import { useFilters } from '../contexts/FilterContext';
import { useOverviewData } from '../../data/access/useOverviewData';

// People portraits
const imgFabioVeloso = 'https://res.cloudinary.com/dvq75cqna/image/upload/v1780071054/vw-funds/175d81a7864ae50d37ddf9a160e546af1d2a8ee8.png';
const imgZakFlaten = 'https://res.cloudinary.com/dvq75cqna/image/upload/v1780071066/vw-funds/48ea8970f6d4b2ca434cf82051473b99fc39b3d9.png';
const imgJennyEckart = 'https://res.cloudinary.com/dvq75cqna/image/upload/v1780071131/vw-funds/d484fabc75bc7296e02313bb481ed79708e6e083.png';
const imgRyanLedger = 'https://res.cloudinary.com/dvq75cqna/image/upload/v1780071088/vw-funds/770d9bb001df989daf31ad74015dfc377b65a73d.png';
const imgGarrySchwietert = 'https://res.cloudinary.com/dvq75cqna/image/upload/v1780071072/vw-funds/547c86f89f339b487e6c680775e87c8222c8c564.png';
const imgMalloryManning = 'https://res.cloudinary.com/dvq75cqna/image/upload/v1780071138/vw-funds/f0494d5017440bdc302141d9ab01c7c81e4a339a.png';

const MONTH_AGGREGATES = [
  { key: 'Jan 2025', accrual: '$64,236.90', submission: '$52,358.70', difference: '$11,877.30', paid: '$52,236.80 (72%)', pending: '$12,524.80 (28%)', diffColor: '#1f1d25' },
  { key: 'Feb 2025', accrual: '$34,781.00', submission: '$50,390.09', difference: '($15,609.09)', paid: '$52,236.80 (72%)', pending: '$12,524.80 (28%)', diffColor: '#d32f2f' },
  { key: 'Mar 2025', accrual: '$29,773.00', submission: '$56,260.03', difference: '($26,487.03)', paid: '$52,236.80 (72%)', pending: '$12,524.80 (28%)', diffColor: '#d32f2f' },
  { key: 'Apr 2025', accrual: '$33,368.00', submission: '$57,554.00', difference: '($24,186.00)', paid: '$52,236.80 (72%)', pending: '$12,524.80 (28%)', diffColor: '#d32f2f' },
  { key: 'May 2025', accrual: '$17,052.00', submission: '$49,663.93', difference: '($32,611.93)', paid: '$52,236.80 (72%)', pending: '$12,524.80 (28%)', diffColor: '#d32f2f' },
  { key: 'Jun 2025', accrual: '$34,359.00', submission: '$51,260.89', difference: '($16,901.89)', paid: '$52,236.80 (72%)', pending: '$12,524.80 (28%)', diffColor: '#d32f2f' },
  { key: 'Jul 2025', accrual: '$46,211.00', submission: '$53,449.57', difference: '($7,238.57)', paid: '$52,236.80 (72%)', pending: '$12,524.80 (28%)', diffColor: '#d32f2f' },
  { key: 'Aug 2025', accrual: '$56,217.00', submission: '$65,598.84', difference: '($9,381.84)', paid: '$52,236.80 (72%)', pending: '$12,524.80 (28%)', diffColor: '#d32f2f' },
  { key: 'Sep 2025', accrual: '$59,509.00', submission: '-', difference: '-', paid: '$52,236.80 (72%)', pending: '$12,524.80 (28%)', diffColor: '#1f1d25' },
  { key: 'Oct 2025', accrual: '$57,444.00', submission: '-', difference: '-', paid: '$52,236.80 (72%)', pending: '$12,524.80 (28%)', diffColor: '#1f1d25' },
  { key: 'Nov 2025', accrual: '$37,496.00', submission: '-', difference: '-', paid: '$52,236.80 (72%)', pending: '$12,524.80 (28%)', diffColor: '#1f1d25' },
  { key: 'Dec 2025', accrual: '-', submission: '-', difference: '-', paid: '$52,236.80 (72%)', pending: '$12,524.80 (28%)', diffColor: '#1f1d25' },
  { key: 'Jan 2026', accrual: '-', submission: '-', difference: '-', paid: '$52,236.80 (72%)', pending: '$12,524.80 (28%)', diffColor: '#1f1d25' },
];

const AVATARS = [imgFabioVeloso, imgZakFlaten, imgJennyEckart, imgRyanLedger, imgGarrySchwietert, imgMalloryManning];

const createClaim = (
  id: string, date: Date, amount: number, status: ClaimStatus | 'Revision Requested',
  daysClaim: number, daysPay: number, dealCode: string, dealName: string, dealCity: string,
  fund: string, avatarIdx: number, name: string,
): Claim => ({
  id, uid: id, date, amount, status: status as ClaimStatus, timeInClaim: daysClaim,
  timeInPayment: daysPay, dealershipCode: dealCode, dealershipName: dealName,
  dealershipCity: dealCity, fund, submittedBy: { name, avatarUrl: AVATARS[avatarIdx] },
  type: 'CRM AUGUST', lastUpdated: '3 days ago',
  details: `Claim details for ${id}. This claim covers marketing expenses for the CRM campaign.`,
});

export const CLAIMS_MOCK_DATA: Claim[] = [
  createClaim('MFC539881', new Date(2026, 0, 25), 4070.05, 'Approved', 6, 6, '408252', 'Jack Daniels Volkswagen (Paramus)', 'Paramus', 'DMP - Hard Costs', 0, 'Fabio Veloso'),
  createClaim('MFC540978', new Date(2026, 0, 22), 3069.56, 'Pending', 8, 22, '423063', 'Armstrong Volkswagen of Gladstone', 'Gladstone', 'DMP - Hard Costs', 1, 'Zak Flaten'),
  createClaim('MFC540992', new Date(2026, 0, 21), 2268.56, 'Approved', 6, 7, '409210', 'Paramount Volkswagen of Hickory', 'Hickory', 'DMP - Hard Costs', 3, 'Ryan Ledger'),
  createClaim('MFC541000', new Date(2026, 0, 19), 2269.56, 'Approved', 10, 4, '402165', 'Volkswagen of Downtown Chicago', 'Chicago', 'DMP - Hard Costs', 4, 'Garry Schwietert'),
  createClaim('MFC539882', new Date(2026, 0, 18), 4070.05, 'Approved', 5, 4, '408252', 'Jack Daniels Volkswagen (Paramus)', 'Paramus', 'DMP - Hard Costs', 5, 'Mallory Manning'),
  createClaim('MFC540979', new Date(2026, 0, 18), 3069.56, 'Revision Requested', 6, 3, '402165', 'Volkswagen of Downtown Chicago', 'Chicago', 'DMP - Hard Costs', 0, 'Fabio Veloso'),
  createClaim('MFC540990', new Date(2026, 0, 15), 3114.47, 'In Review', 4, 7, '402165', 'Volkswagen of Downtown Chicago', 'Chicago', 'DMP - Hard Costs', 1, 'Zak Flaten'),
  createClaim('MFC539883', new Date(2026, 0, 9), 4070.05, 'Approved', 8, 7, '408253', 'Jack Daniels Volkswagen (Paramus)', 'Paramus', 'DMP - Hard Costs', 2, 'Jenny Eckart'),
  createClaim('MFC540980', new Date(2026, 0, 9), 3069.56, 'Pending', 8, 8, '423063', 'Armstrong Volkswagen of Gladstone', 'Gladstone', 'DMP - Hard Costs', 3, 'Ryan Ledger'),
  createClaim('MFC560010', new Date(2026, 3, 27), 2850.00, 'Pending', 2, 0, '12345', 'Jack Daniels Volkswagen', 'Paramus', 'DMF - Media Costs', 5, 'Mallory Manning'),
  createClaim('MFC560011', new Date(2026, 3, 25), 1780.00, 'In Review', 4, 0, '12345', 'Jack Daniels Volkswagen', 'Paramus', 'DMF - Hard Costs', 5, 'Mallory Manning'),
  createClaim('MFC560012', new Date(2026, 3, 21), 3420.00, 'Approved', 7, 3, '12345', 'Jack Daniels Volkswagen', 'Paramus', 'DMP - Hard Costs', 5, 'Mallory Manning'),
  createClaim('MFC541010', new Date(2026, 1, 18), 4250.00, 'Approved', 5, 4, '12345', 'Jack Daniels Volkswagen', 'Paramus', 'DMF - Media Costs', 5, 'Mallory Manning'),
  createClaim('MFC541013', new Date(2026, 0, 10), 3780.00, 'Paid', 16, 14, '12345', 'Jack Daniels Volkswagen', 'Paramus', 'DMP - Hard Costs', 5, 'Mallory Manning'),
];

interface FundsClaimsContentProps {
  dateRange: DateRange | undefined;
  onDateRangeChange: (range: DateRange | undefined) => void;
  selectedClaimId: string | null;
  onSelectClaim: (id: string | null) => void;
  userType?: 'dealer' | 'dealer-singular' | 'oem';
}

function mapWorkflowClaimStatus(s: ClaimWorkflowStatus): ClaimStatus {
  switch (s) {
    case 'Approved':           return 'Approved';
    case 'Declined':           return 'Declined';
    case 'Ready for Payment':  return 'Ready for Payment';
    case 'Paid':               return 'Paid';
    case 'Revision Requested': return 'Revision Requested';
    case 'In Review':          return 'In Review';
    case 'Resubmitted':        return 'In Review';
    default:                   return 'Pending';
  }
}

function formatDays(n: number): string {
  if (n <= 0) return 'just now';
  if (n === 1) return '1 day';
  return `${n} days`;
}

function parseAmount(s: string | undefined): number | null {
  if (!s || s === '-') return null;
  const negative = s.startsWith('(');
  const num = parseFloat(s.replace(/[^0-9.]/g, ''));
  if (isNaN(num)) return null;
  return negative ? -num : num;
}

function fmtUSD(n: number): string {
  return '$' + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function stripPct(s: string | undefined): string {
  if (!s) return '-';
  return s.replace(/\s*\(\d+%\)/, '');
}

function archivedCycleToClaimRow(cycle: ArchivedCycle): Claim {
  const cl = cycle.claim;
  return {
    id: cl.id, uid: cl.id,
    date: cl.submittedAt ? new Date(cl.submittedAt) : new Date(cycle.archivedAt),
    amount: cl.invoiceTotal,
    status: cl.status ? mapWorkflowClaimStatus(cl.status) : 'Paid',
    timeInClaim: 2, timeInPayment: 2,
    dealershipCode: WORKFLOW_DEALER.code, dealershipName: WORKFLOW_DEALER.name,
    dealershipCity: WORKFLOW_DEALER.city, fund: 'DMF - Media Costs',
    submittedBy: { name: WORKFLOW_DEALER.contact, avatarUrl: imgMalloryManning },
    type: WORKFLOW_CAMPAIGN.initiativeType,
    lastUpdated: new Date(cycle.archivedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    details: WORKFLOW_CAMPAIGN.description,
  };
}

export function FundsClaimsContent({
  dateRange,
  onDateRangeChange,
  selectedClaimId,
  onSelectClaim,
  userType = 'dealer',
}: FundsClaimsContentProps) {
  const { t } = useTranslation();
  const { workflow } = useWorkflow();
  const { filters: filterCtx, isLockedDealership } = useFilters();
  const { monthlyChart } = useOverviewData();

  const overviewAccruals = useMemo(() => {
    const map = new Map<string, number>();
    monthlyChart.forEach(row => {
      const [mon, yr] = row.month.split(' ');
      const fullYear = parseInt(yr) + 2000;
      map.set(`${mon} ${fullYear}`, row.accruals);
    });
    return map;
  }, [monthlyChart]);

  const archivedClaimRows = useMemo(
    () => [...workflow.archivedCycles].reverse().map(archivedCycleToClaimRow),
    [workflow.archivedCycles],
  );

  const [activeFilter, setActiveFilter] = useState<ClaimStatus | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedMonths, setExpandedMonths] = useState<Record<string, boolean>>(() => ({
    'Jan 2026': true,
    [new Date().toLocaleString('en-US', { month: 'short', year: 'numeric' })]: true,
  }));
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const workflowClaim: Claim | null = workflow.claim.status !== null
    ? {
        id: workflow.claim.id, uid: workflow.claim.id, date: new Date(),
        amount: workflow.claim.invoiceTotal || WORKFLOW_CAMPAIGN.totalAmount,
        status: mapWorkflowClaimStatus(workflow.claim.status),
        timeInClaim: workflow.claim.submittedAt
          ? Math.round((Date.now() - new Date(workflow.claim.submittedAt).getTime()) / 86_400_000)
          : 0,
        timeInPayment: workflow.claim.status === 'Paid' ? 2 : 0,
        dealershipCode: WORKFLOW_DEALER.code, dealershipName: WORKFLOW_DEALER.name,
        dealershipCity: WORKFLOW_DEALER.city, fund: 'DMF - Media Costs',
        submittedBy: { name: WORKFLOW_DEALER.contact, avatarUrl: imgMalloryManning },
        type: WORKFLOW_CAMPAIGN.initiativeType, lastUpdated: 'just now',
        details: WORKFLOW_CAMPAIGN.description,
      }
    : null;

  const filteredData = useMemo(() => {
    return CLAIMS_MOCK_DATA.filter(item => {
      if (isLockedDealership && filterCtx.dealershipCode && item.dealershipCode !== filterCtx.dealershipCode) return false;
      if (dateRange?.from && item.date < dateRange.from) return false;
      if (dateRange?.to && item.date > dateRange.to) return false;
      if (activeFilter && item.status !== activeFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return item.id.toLowerCase().includes(q) || item.dealershipName.toLowerCase().includes(q) || item.status.toLowerCase().includes(q);
      }
      return true;
    });
  }, [dateRange, activeFilter, searchQuery, isLockedDealership, filterCtx.dealershipCode]);

  const filteredArchivedRows = useMemo(() => {
    return archivedClaimRows.filter(cl => {
      if (activeFilter && cl.status !== activeFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return cl.id.toLowerCase().includes(q) || cl.dealershipName.toLowerCase().includes(q) || cl.status.toLowerCase().includes(q);
      }
      return true;
    });
  }, [archivedClaimRows, activeFilter, searchQuery]);

  const workflowClaimVisible = useMemo(() => {
    if (!workflowClaim) return false;
    if (activeFilter && workflowClaim.status !== activeFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return workflowClaim.id.toLowerCase().includes(q) || workflowClaim.dealershipName.toLowerCase().includes(q) || workflowClaim.status.toLowerCase().includes(q);
    }
    return true;
  }, [workflowClaim, activeFilter, searchQuery]);

  const statsData = useMemo(() => {
    const baseList = CLAIMS_MOCK_DATA.filter(item => {
      if (dateRange?.from && item.date < dateRange.from) return false;
      if (dateRange?.to && item.date > dateRange.to) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return item.id.toLowerCase().includes(q) || item.dealershipName.toLowerCase().includes(q);
      }
      return true;
    });
    return baseList.reduce((acc, curr) => {
      if (curr.status === 'Approved') { acc.counts.approved++; acc.amounts.approved += curr.amount; }
      else if (curr.status === 'Pending') { acc.counts.pending++; acc.amounts.pending += curr.amount; }
      else if (['In Review', 'Revision Requested'].includes(curr.status)) { acc.counts.inReview++; acc.amounts.inReview += curr.amount; }
      return acc;
    }, { counts: { approved: 0, pending: 0, inReview: 0 }, amounts: { approved: 0, pending: 0, inReview: 0 } });
  }, [dateRange, searchQuery]);

  const groupedData = useMemo(() => {
    const all: Claim[] = [
      ...(workflowClaimVisible && workflowClaim ? [workflowClaim] : []),
      ...filteredArchivedRows,
      ...filteredData,
    ].sort((a, b) => b.date.getTime() - a.date.getTime());
    const groups: Record<string, Claim[]> = {};
    all.forEach(claim => {
      const key = claim.date.toLocaleString('en-US', { month: 'short', year: 'numeric' });
      if (!groups[key]) groups[key] = [];
      groups[key].push(claim);
    });
    return groups;
  }, [workflowClaim, workflowClaimVisible, filteredArchivedRows, filteredData]);

  const allMonthKeys = useMemo(() => {
    const aggregateKeys = MONTH_AGGREGATES.map(m => m.key);
    const claimKeys = Object.keys(groupedData);
    const union = [...new Set([...claimKeys, ...aggregateKeys])];
    return union.sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  }, [groupedData]);

  const toggleMonth = (month: string) => {
    setExpandedMonths(prev => ({ ...prev, [month]: !prev[month] }));
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: 'background.paper', overflowY: 'auto' }}>
      <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>

        {/* Top Controls */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: 2 }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2 }}>
            <ActionButton label={t('New Claim')} />
            <OutlinedInput
              size="small"
              placeholder={t('Find below')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              startAdornment={<InputAdornment position="start"><SearchIcon sx={{ fontSize: 20, color: 'text.secondary' }} /></InputAdornment>}
              sx={{ width: 280, borderRadius: '20px', bgcolor: 'background.paper', fontSize: '14px', '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0,0,0,0.23)' }, '& input': { py: '6px', px: 0 } }}
            />
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1.5 }}>
            <FilterSelect label="Area" value="All Areas" width="w-[110px]" />
            <FilterSelect label="Dealership" value="All Dealerships" width="w-[274px]" />
            <Box sx={{ position: 'relative' }}>
              <DateRangeInput
                startDate={dateRange?.from} endDate={dateRange?.to}
                onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                onReset={(e) => { e.stopPropagation(); onDateRangeChange({ from: new Date(2025, 0, 1), to: new Date(2026, 11, 31) }); }}
              />
              {isDatePickerOpen && (
                <DateRangePicker
                  initialRange={dateRange}
                  onApply={(range) => { onDateRangeChange(range); setIsDatePickerOpen(false); }}
                  onCancel={() => setIsDatePickerOpen(false)}
                />
              )}
            </Box>
          </Box>
        </Box>

        {/* Claims Submitted BANs */}
        <ClaimsSubmittedBans
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          counts={statsData.counts}
          amounts={statsData.amounts}
        />

        {/* Grouped Table */}
        <Box sx={{ bgcolor: 'background.paper', borderRadius: 3, border: '1px solid rgba(0,0,0,0.12)', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          <Box sx={{ overflowX: 'auto' }}>
            <Box sx={{ minWidth: 1200 }}>
              {/* Primary header row */}
              <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: 'background.paper', borderBottom: '1px solid rgba(0,0,0,0.12)', height: 48, px: 2, position: 'sticky', top: 0, zIndex: 10 }}>
                <Box sx={{ width: 220, fontSize: '12px', fontWeight: 500, color: 'text.primary', pl: 4 }}>{t('Month')}</Box>
                <Box sx={{ width: 120, fontSize: '12px', fontWeight: 500, color: 'text.primary' }}>{t('Accrual')}</Box>
                <Box sx={{ width: 120, fontSize: '12px', fontWeight: 500, color: 'text.primary' }}>{t('Submission')}</Box>
                <Box sx={{ width: 120, fontSize: '12px', fontWeight: 500, color: 'text.primary' }}>{t('Difference')}</Box>
                <Box sx={{ width: 140, fontSize: '12px', fontWeight: 500, color: 'text.primary' }}>{t('Paid')}</Box>
                <Box sx={{ width: 140, fontSize: '12px', fontWeight: 500, color: 'text.primary' }}>{t('Pending')}</Box>
              </Box>

              {allMonthKeys.map(monthKey => {
                const monthData = MONTH_AGGREGATES.find(m => m.key === monthKey);
                const claims = groupedData[monthKey] || [];
                const isExpanded = expandedMonths[monthKey];

                const computedSubmissionNum = claims.length > 0 ? claims.reduce((sum, c) => sum + c.amount, 0) : null;
                const accrualNum = isLockedDealership ? (overviewAccruals.get(monthKey) ?? null) : parseAmount(monthData?.accrual);
                const submissionNum = computedSubmissionNum ?? parseAmount(monthData?.submission);
                const differenceNum = (accrualNum !== null && submissionNum !== null) ? accrualNum - submissionNum : null;

                const accrualDisplay = accrualNum !== null ? fmtUSD(accrualNum) : '-';
                const submissionDisplay = submissionNum !== null ? fmtUSD(submissionNum) : '-';
                const differenceDisplay = differenceNum !== null ? (differenceNum < 0 ? `(${fmtUSD(differenceNum)})` : fmtUSD(differenceNum)) : '-';
                const differenceColor = differenceNum !== null && differenceNum < 0 ? '#d32f2f' : '#1f1d25';
                const paidDisplay = isLockedDealership ? '-' : stripPct(monthData?.paid);
                const pendingDisplay = isLockedDealership ? '-' : stripPct(monthData?.pending);

                return (
                  <Box key={monthKey}>
                    {/* Month row */}
                    <Box
                      onClick={() => toggleMonth(monthKey)}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        bgcolor: 'background.paper',
                        borderBottom: '1px solid rgba(0,0,0,0.12)',
                        height: 56,
                        px: 2,
                        cursor: 'pointer',
                        '&:hover': { bgcolor: 'rgba(0,0,0,0.02)' },
                        userSelect: 'none',
                        transition: 'background-color 0.15s',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: 220 }}>
                        <Box sx={{ transition: 'transform 0.2s', transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)' }}>
                          <KeyboardArrowDownIcon sx={{ width: 20, height: 20, color: 'rgba(0,0,0,0.5)' }} />
                        </Box>
                        <Typography sx={{ fontSize: '14px', fontWeight: 500, color: 'text.primary', letterSpacing: '0.17px' }}>{monthKey}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', fontSize: '12px', color: 'text.primary' }}>
                        <Typography sx={{ width: 120, fontSize: '12px', color: accrualNum !== null ? '#1f1d25' : '#686576' }}>{accrualDisplay}</Typography>
                        <Typography sx={{ width: 120, fontSize: '12px', color: submissionNum !== null ? '#1f1d25' : '#686576' }}>{submissionDisplay}</Typography>
                        <Typography sx={{ width: 120, fontSize: '12px', color: differenceNum !== null ? differenceColor : '#686576' }}>{differenceDisplay}</Typography>
                        <Typography sx={{ width: 140, fontSize: '12px', color: monthData?.paid ? '#1f1d25' : '#686576' }}>{paidDisplay}</Typography>
                        <Typography sx={{ width: 140, fontSize: '12px', color: monthData?.pending ? '#1f1d25' : '#686576' }}>{pendingDisplay}</Typography>
                      </Box>
                    </Box>

                    {/* Claims accordion */}
                    <Collapse in={isExpanded && claims.length > 0}>
                      <Box sx={{ bgcolor: 'surface.inputBackground', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                        {/* Sub-header */}
                        <Box sx={{ display: 'flex', alignItems: 'center', height: 40, px: 2, borderBottom: '1px solid rgba(0,0,0,0.06)', bgcolor: 'surface.inputBackground' }}>
                          <Box sx={{ width: 120, pl: 2, fontSize: '11px', fontWeight: 500, color: 'text.secondary' }}>{t('Date')}</Box>
                          <Box sx={{ width: 100, fontSize: '11px', fontWeight: 500, color: 'text.secondary' }}>{t('ID')}</Box>
                          <Box sx={{ width: 100, fontSize: '11px', fontWeight: 500, color: 'text.secondary' }}>{t('Amount')}</Box>
                          <Box sx={{ width: 160, fontSize: '11px', fontWeight: 500, color: 'text.secondary' }}>{t('Status')}</Box>
                          <Box sx={{ width: 100, fontSize: '11px', fontWeight: 500, color: 'text.secondary' }}>{t('Time in claim')}</Box>
                          <Box sx={{ width: 120, fontSize: '11px', fontWeight: 500, color: 'text.secondary' }}>{t('Time in payment')}</Box>
                          <Box sx={{ flex: 1, minWidth: 200, fontSize: '11px', fontWeight: 500, color: 'text.secondary' }}>{t('Dealership')}</Box>
                          <Box sx={{ width: 140, fontSize: '11px', fontWeight: 500, color: 'text.secondary' }}>{t('Fund')}</Box>
                          <Box sx={{ width: 160, fontSize: '11px', fontWeight: 500, color: 'text.secondary' }}>{t('Submitted by')}</Box>
                        </Box>
                        {claims.map(claim => (
                          <Box
                            key={`${claim.id}-${claim.date.getTime()}`}
                            onClick={() => onSelectClaim(claim.id)}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              height: 52,
                              borderBottom: '1px solid rgba(0,0,0,0.06)',
                              '&:last-child': { borderBottom: 0 },
                              cursor: 'pointer',
                              px: 2,
                              bgcolor: selectedClaimId === claim.id ? '#F2F1FF' : '#F9FAFA',
                              '&:hover': { bgcolor: selectedClaimId === claim.id ? '#F2F1FF' : 'rgba(0,0,0,0.06)' },
                              transition: 'background-color 0.15s',
                            }}
                          >
                            <Typography sx={{ width: 120, pl: 2, fontSize: '12px', color: 'text.primary' }}>
                              {claim.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </Typography>
                            <Typography sx={{ width: 100, fontSize: '12px', fontWeight: 500, color: 'text.primary' }}>{claim.id}</Typography>
                            <Typography sx={{ width: 100, fontSize: '12px', color: 'text.primary' }}>
                              ${claim.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </Typography>
                            <Box sx={{ width: 160, pr: 1 }}>
                              <StatusChip
                                status={claim.status === 'At risk' && userType !== 'oem' ? (claim.underlyingStatus ?? 'Pending') : claim.status}
                              />
                            </Box>
                            <Typography sx={{ width: 100, fontSize: '12px', color: 'text.primary' }}>{formatDays(claim.timeInClaim)}</Typography>
                            <Typography sx={{ width: 120, fontSize: '12px', color: 'text.primary' }}>{formatDays(claim.timeInPayment)}</Typography>
                            <Typography
                              noWrap
                              title={`${claim.dealershipCode} - ${claim.dealershipName} (${claim.dealershipCity})`}
                              sx={{ flex: 1, minWidth: 200, fontSize: '12px', color: 'text.primary', pr: 2 }}
                            >
                              {claim.dealershipCode} - {claim.dealershipName}
                            </Typography>
                            <Typography sx={{ width: 140, fontSize: '12px', color: 'text.primary' }}>{claim.fund}</Typography>
                            <Box sx={{ width: 160, display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Box sx={{ width: 24, height: 24, borderRadius: '50%', bgcolor: 'grey.200', overflow: 'hidden', flexShrink: 0 }}>
                                <ImageWithFallback
                                  src={claim.submittedBy.avatarUrl}
                                  alt={claim.submittedBy.name}
                                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                              </Box>
                              <Typography noWrap sx={{ fontSize: '12px', color: 'text.primary' }}>{claim.submittedBy.name}</Typography>
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    </Collapse>
                  </Box>
                );
              })}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
