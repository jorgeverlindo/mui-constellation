import { useState, useRef, useEffect, useMemo } from 'react';
import type { DateRange } from './DateRangePicker';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import OutlinedInput from '@mui/material/OutlinedInput';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import SearchIcon from '@mui/icons-material/Search';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useTranslation } from '../contexts/LanguageContext';
import {
  useWorkflow,
  WORKFLOW_DEALER,
  WORKFLOW_CAMPAIGN,
  type PreApprovalWorkflowStatus,
  type ArchivedCycle,
  type PortalSubmission,
} from '../contexts/WorkflowContext';
import { DateRangeInput } from './DateRangeInput';
import { DateRangePicker } from './DateRangePicker';
import { FilterSelect } from './FilterSelect';
import { useFilters } from '../contexts/FilterContext';
import { ActionButton } from './ActionButton';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { StatusChip } from './StatusChip';

// People portraits
const imgFabioVeloso = 'https://res.cloudinary.com/dvq75cqna/image/upload/v1780071054/vw-funds/175d81a7864ae50d37ddf9a160e546af1d2a8ee8.png';
const imgZakFlaten = 'https://res.cloudinary.com/dvq75cqna/image/upload/v1780071066/vw-funds/48ea8970f6d4b2ca434cf82051473b99fc39b3d9.png';
const imgJennyEckart = 'https://res.cloudinary.com/dvq75cqna/image/upload/v1780071131/vw-funds/d484fabc75bc7296e02313bb481ed79708e6e083.png';
const imgRyanLedger = 'https://res.cloudinary.com/dvq75cqna/image/upload/v1780071088/vw-funds/770d9bb001df989daf31ad74015dfc377b65a73d.png';
const imgGarrySchwietert = 'https://res.cloudinary.com/dvq75cqna/image/upload/v1780071072/vw-funds/547c86f89f339b487e6c680775e87c8222c8c564.png';
const imgMalloryManning = 'https://res.cloudinary.com/dvq75cqna/image/upload/v1780071138/vw-funds/f0494d5017440bdc302141d9ab01c7c81e4a339a.png';

const AVATARS = [
  imgFabioVeloso,
  imgZakFlaten,
  imgJennyEckart,
  imgRyanLedger,
  imgGarrySchwietert,
  imgMalloryManning,
];

export interface PreApproval {
  id: string;
  title?: string;
  date: Date;
  dealershipCode: string;
  dealershipName: string;
  dealershipCity: string;
  status: 'Pending' | 'Approved' | 'Revision Requested' | 'In Review' | 'Declined';
  timeInPreApproval: number;
  submittedBy: { name: string; avatarUrl: string };
  mediaType: string;
  details: string;
  lastUpdated: Date;
  submittedAt: Date;
  initiativeType: string;
  claimsCount: number;
  contactEmail: string;
  description: string;
  documents: Array<{ name: string; size: string; type: string }>;
}

export const MOCK_DATA: PreApproval[] = [
  {
    id: 'MFA386592', date: new Date(2026, 0, 6), dealershipCode: '408253',
    dealershipName: 'Rick Case Volkswagen Weston', dealershipCity: 'Weston',
    status: 'Pending', timeInPreApproval: 13, submittedBy: { name: 'Fabio Veloso', avatarUrl: AVATARS[0] },
    mediaType: 'Display/Internet Banners', details: 'Display Feb2025',
    lastUpdated: new Date(2026, 0, 3), submittedAt: new Date(2025, 1, 4),
    initiativeType: 'Pre-Approval', claimsCount: 1, contactEmail: 'complianceteam@teamvelocitymarketing.com',
    description: 'Display Feb2025', documents: [{ name: 'VolkswagenofDowntownChicago_59568_Feb2025_display.pdf', size: '90.96 kB', type: 'PDF' }],
  },
  {
    id: 'MFA386593', date: new Date(2026, 0, 3), dealershipCode: '408254',
    dealershipName: 'Gunther Volkswagen of Coconut Creek', dealershipCity: 'Coconut Creek',
    status: 'Pending', timeInPreApproval: 12, submittedBy: { name: 'Zak Flaten', avatarUrl: AVATARS[1] },
    mediaType: 'Search SEM', details: 'search feb2025',
    lastUpdated: new Date(2026, 0, 2), submittedAt: new Date(2025, 1, 3),
    initiativeType: 'Pre-Approval', claimsCount: 1, contactEmail: 'complianceteam@teamvelocitymarketing.com',
    description: 'Search SEM Campaign for February', documents: [],
  },
  {
    id: 'MFA386594', date: new Date(2025, 11, 21), dealershipCode: '408255',
    dealershipName: 'Emich Volkswagen', dealershipCity: 'Denver',
    status: 'Approved', timeInPreApproval: 11, submittedBy: { name: 'Jenny Eckart', avatarUrl: AVATARS[2] },
    mediaType: 'Search SEM', details: 'KELLY MARCH RADIO',
    lastUpdated: new Date(2025, 11, 20), submittedAt: new Date(2025, 11, 10),
    initiativeType: 'Pre-Approval', claimsCount: 2, contactEmail: 'complianceteam@teamvelocitymarketing.com',
    description: 'Radio campaign for Kelly March event.', documents: [],
  },
  {
    id: 'MFA386597', date: new Date(2026, 0, 10), dealershipCode: '12345',
    dealershipName: 'Jack Daniels Volkswagen', dealershipCity: 'Paramus',
    status: 'Approved', timeInPreApproval: 6, submittedBy: { name: 'Mallory Manning', avatarUrl: AVATARS[5] },
    mediaType: 'Search SEM', details: 'Google SEM — Jan 2026',
    lastUpdated: new Date(2026, 0, 9), submittedAt: new Date(2026, 0, 4),
    initiativeType: 'Pre-Approval', claimsCount: 1, contactEmail: 'mallory@vwanytown.com',
    description: 'Paid search campaign on Google Ads covering Tiguan, Jetta and ID.4 keywords.', documents: [],
  },
  {
    id: 'MFA386598', date: new Date(2025, 11, 5), dealershipCode: '12345',
    dealershipName: 'Jack Daniels Volkswagen', dealershipCity: 'Paramus',
    status: 'In Review', timeInPreApproval: 8, submittedBy: { name: 'Mallory Manning', avatarUrl: AVATARS[5] },
    mediaType: 'Video / OTT', details: 'OTT Video — Holiday 2025',
    lastUpdated: new Date(2025, 11, 4), submittedAt: new Date(2025, 10, 27),
    initiativeType: 'Pre-Approval', claimsCount: 0, contactEmail: 'mallory@vwanytown.com',
    description: 'Holiday OTT/CTV video campaign on Hulu and Peacock.', documents: [],
  },
  {
    id: 'MFA386599', date: new Date(2025, 10, 2), dealershipCode: '12345',
    dealershipName: 'Jack Daniels Volkswagen', dealershipCity: 'Paramus',
    status: 'Revision Requested', timeInPreApproval: 5, submittedBy: { name: 'Mallory Manning', avatarUrl: AVATARS[5] },
    mediaType: 'Search SEM', details: 'Google SEM — Nov 2025',
    lastUpdated: new Date(2025, 10, 1), submittedAt: new Date(2025, 10, 1),
    initiativeType: 'Pre-Approval', claimsCount: 1, contactEmail: 'mallory@vwanytown.com',
    description: 'Revision requested due to image quality guidelines not met on ad creative.', documents: [],
  },
  {
    id: 'MFA386600', date: new Date(2025, 10, 1), dealershipCode: '408259',
    dealershipName: 'Luther Westside Volkswagen', dealershipCity: 'St. Louis Park',
    status: 'Pending', timeInPreApproval: 4, submittedBy: { name: 'Fabio Veloso', avatarUrl: AVATARS[0] },
    mediaType: 'Display/Internet Banners', details: 'These are the different variations for the ads for the Taos.',
    lastUpdated: new Date(2025, 9, 30), submittedAt: new Date(2025, 9, 28),
    initiativeType: 'Pre-Approval', claimsCount: 3, contactEmail: 'complianceteam@teamvelocitymarketing.com',
    description: 'Taos San Juan campaign variations.', documents: [],
  },
];

const DEFAULT_DATE_RANGE: DateRange = {
  from: new Date(2025, 0, 1),
  to: new Date(2025, 11, 31),
};

export interface FundsPreApprovalsContentProps {
  dateRange: DateRange | undefined;
  onDateRangeChange: (range: DateRange | undefined) => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  selectedPreApprovalId: string | null;
  onSelectPreApproval: (id: string | null) => void;
  userType?: 'dealer' | 'dealer-singular' | 'oem';
}

function mapWorkflowPAStatus(s: PreApprovalWorkflowStatus): PreApproval['status'] {
  switch (s) {
    case 'Approved':           return 'Approved';
    case 'Declined':           return 'Declined';
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

function archivedCycleToPA(cycle: ArchivedCycle): PreApproval {
  const pa = cycle.preApproval;
  return {
    id: pa.id,
    title: pa.title,
    date: new Date(cycle.archivedAt),
    dealershipCode: WORKFLOW_DEALER.code,
    dealershipName: WORKFLOW_DEALER.name,
    dealershipCity: WORKFLOW_DEALER.city,
    status: mapWorkflowPAStatus(pa.status),
    timeInPreApproval: 0,
    submittedBy: { name: WORKFLOW_DEALER.contact, avatarUrl: AVATARS[5] },
    mediaType: pa.mediaType || WORKFLOW_CAMPAIGN.mediaType,
    details: pa.details || WORKFLOW_CAMPAIGN.description,
    lastUpdated: new Date(cycle.archivedAt),
    submittedAt: pa.submittedAt ? new Date(pa.submittedAt) : new Date(cycle.archivedAt),
    initiativeType: WORKFLOW_CAMPAIGN.initiativeType,
    claimsCount: pa.claimsCount,
    contactEmail: pa.contactEmail || WORKFLOW_DEALER.email,
    description: WORKFLOW_CAMPAIGN.description,
    documents: pa.documents,
  };
}

function portalSubmissionToPA(sub: PortalSubmission): PreApproval {
  return {
    id: sub.id,
    title: sub.title || undefined,
    date: new Date(sub.submittedAt),
    dealershipCode: WORKFLOW_DEALER.code,
    dealershipName: WORKFLOW_DEALER.name,
    dealershipCity: WORKFLOW_DEALER.city,
    status: (sub.status ?? 'Pending') as PreApproval['status'],
    timeInPreApproval: 0,
    submittedBy: { name: WORKFLOW_DEALER.contact, avatarUrl: AVATARS[5] },
    mediaType: sub.mediaType || WORKFLOW_CAMPAIGN.mediaType,
    details: sub.title || 'Portal Pre-Approval',
    lastUpdated: new Date(sub.submittedAt),
    submittedAt: new Date(sub.submittedAt),
    initiativeType: sub.initiativeType || WORKFLOW_CAMPAIGN.initiativeType,
    claimsCount: 0,
    contactEmail: WORKFLOW_DEALER.email,
    description: sub.title || 'Submitted via portal',
    documents: [],
  };
}

const TABLE_COLUMNS = [
  { label: 'Date', width: 120 },
  { label: 'Dealership', width: 360 },
  { label: 'ID', width: 120 },
  { label: 'Status', width: 140 },
  { label: 'Time in Pre-approval', width: 160 },
  { label: 'Submitted by', width: 180 },
  { label: 'Media Type', width: 180 },
  { label: 'Details', width: 280 },
  { label: 'Last Updated', width: 140 },
];

export function FundsPreApprovalsContent({
  dateRange,
  onDateRangeChange,
  searchQuery,
  onSearchQueryChange,
  selectedPreApprovalId,
  onSelectPreApproval,
  userType = 'dealer',
}: FundsPreApprovalsContentProps) {
  const { t } = useTranslation();
  const { workflow, archiveAndReset } = useWorkflow();
  const { filters: filterCtx, isLockedDealership } = useFilters();
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

  const filteredData = useMemo(() => {
    const wfPA = workflow.preApproval;

    const workflowPreApproval: PreApproval = {
      id: wfPA.id,
      title: wfPA.title,
      date: new Date(),
      dealershipCode: WORKFLOW_DEALER.code,
      dealershipName: WORKFLOW_DEALER.name,
      dealershipCity: WORKFLOW_DEALER.city,
      status: mapWorkflowPAStatus(wfPA.status),
      timeInPreApproval: wfPA.submittedAt
        ? Math.round((Date.now() - new Date(wfPA.submittedAt).getTime()) / 86_400_000)
        : 0,
      submittedBy: { name: WORKFLOW_DEALER.contact, avatarUrl: AVATARS[5] },
      mediaType: wfPA.mediaType || WORKFLOW_CAMPAIGN.mediaType,
      details: wfPA.details || 'Digital Ad Campaign',
      lastUpdated: new Date(),
      submittedAt: wfPA.submittedAt ? new Date(wfPA.submittedAt) : new Date('2026-04-20'),
      initiativeType: WORKFLOW_CAMPAIGN.initiativeType,
      claimsCount: wfPA.claimsCount,
      contactEmail: wfPA.contactEmail || WORKFLOW_DEALER.email,
      description: wfPA.details || WORKFLOW_CAMPAIGN.description,
      documents: wfPA.documents,
    };

    const showActiveWorkflow = wfPA.status !== 'Draft';

    const filteredMock = MOCK_DATA.filter((item) => {
      if (isLockedDealership && filterCtx.dealershipCode && item.dealershipCode !== filterCtx.dealershipCode) return false;
      if (dateRange?.from && item.date < dateRange.from) return false;
      if (dateRange?.to && item.date > dateRange.to) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          item.id.toLowerCase().includes(query) ||
          item.dealershipName.toLowerCase().includes(query) ||
          item.dealershipCode.toLowerCase().includes(query) ||
          item.status.toLowerCase().includes(query) ||
          item.submittedBy.name.toLowerCase().includes(query) ||
          item.mediaType.toLowerCase().includes(query) ||
          item.details.toLowerCase().includes(query)
        );
      }
      return true;
    });

    const archivedRows = [...workflow.archivedCycles].reverse().map(archivedCycleToPA);

    const filterRow = (row: PreApproval) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        row.id.toLowerCase().includes(q) ||
        row.dealershipName.toLowerCase().includes(q) ||
        row.dealershipCode.toLowerCase().includes(q) ||
        row.status.toLowerCase().includes(q) ||
        row.submittedBy.name.toLowerCase().includes(q) ||
        row.mediaType.toLowerCase().includes(q) ||
        row.details.toLowerCase().includes(q)
      );
    };

    const portalRows = [...workflow.portalSubmissions].map(portalSubmissionToPA).filter(filterRow);

    const pinnedRows = [
      ...portalRows,
      ...(showActiveWorkflow && filterRow(workflowPreApproval) ? [workflowPreApproval] : []),
      ...archivedRows.filter(filterRow),
    ];

    return [...pinnedRows, ...filteredMock];
  }, [
    dateRange, searchQuery, workflow.preApproval, workflow.archivedCycles,
    workflow.portalSubmissions, isLockedDealership, filterCtx.dealershipCode,
  ]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative', overflow: 'hidden' }}>
      {/* Controls row */}
      <Box sx={{ flexShrink: 0, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {userType !== 'oem' && (
            <ActionButton
              label={t('New Pre-Approval')}
              onClick={() => {
                if (workflow.preApproval.status !== 'Draft') {
                  archiveAndReset();
                }
              }}
            />
          )}
          <OutlinedInput
            size="small"
            placeholder={t('Find below')}
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            startAdornment={
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
              </InputAdornment>
            }
            sx={{
              width: 280,
              borderRadius: '20px',
              bgcolor: 'background.paper',
              fontSize: '14px',
              '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0,0,0,0.23)' },
              '& input': { py: '6px', px: 0 },
            }}
          />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, zIndex: 30 }}>
          <FilterSelect label="Area" value="All Areas" width="w-[110px]" />
          <FilterSelect label="Dealership" value="All Dealerships" width="w-[274px]" />
          <Box sx={{ position: 'relative' }} ref={datePickerRef}>
            <DateRangeInput
              startDate={dateRange?.from}
              endDate={dateRange?.to}
              onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
              onReset={(e) => {
                e.stopPropagation();
                onDateRangeChange(DEFAULT_DATE_RANGE);
              }}
            />
            {isDatePickerOpen && (
              <DateRangePicker
                initialRange={dateRange}
                onApply={(range) => {
                  onDateRangeChange(range);
                  setIsDatePickerOpen(false);
                }}
                onCancel={() => setIsDatePickerOpen(false)}
              />
            )}
          </Box>
        </Box>
      </Box>

      {/* Table section */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: 0, bgcolor: 'background.paper', borderTop: '1px solid rgba(0,0,0,0.08)' }}>
        <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
          <Table stickyHeader size="small" sx={{ minWidth: 'max-content' }}>
            <TableHead>
              <TableRow>
                {TABLE_COLUMNS.map((col) => (
                  <TableCell
                    key={col.label}
                    sx={{
                      minWidth: col.width,
                      px: 2,
                      py: 1.5,
                      fontSize: '12px',
                      fontWeight: 500,
                      color: 'text.secondary',
                      letterSpacing: '0.17px',
                      whiteSpace: 'nowrap',
                      borderBottom: '1px solid rgba(0,0,0,0.12)',
                      bgcolor: 'background.paper',
                    }}
                  >
                    {t(col.label)}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData.map((row) => {
                const isSelected = selectedPreApprovalId === row.id;
                return (
                  <TableRow
                    key={row.id}
                    onClick={() => onSelectPreApproval(isSelected ? null : row.id)}
                    sx={{
                      cursor: 'pointer',
                      bgcolor: isSelected ? '#F2F1FF' : 'background.paper',
                      '&:hover': { bgcolor: isSelected ? '#F2F1FF' : 'rgba(0,0,0,0.02)' },
                      transition: 'background-color 0.15s',
                      '& td': { borderBottom: '1px solid rgba(0,0,0,0.08)' },
                    }}
                  >
                    <TableCell sx={{ px: 2, py: 1.5, fontSize: '12px', color: 'text.primary', whiteSpace: 'nowrap' }}>
                      {row.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </TableCell>
                    <TableCell sx={{ px: 2, py: 1.5, fontSize: '12px', color: 'text.primary', whiteSpace: 'nowrap' }}>
                      {row.dealershipCode} - {row.dealershipName}
                    </TableCell>
                    <TableCell sx={{ px: 2, py: 1.5, fontSize: '12px', color: 'text.primary', whiteSpace: 'nowrap' }}>
                      {row.id}
                    </TableCell>
                    <TableCell sx={{ px: 2, py: 1.5, whiteSpace: 'nowrap' }}>
                      <StatusChip status={row.status} />
                    </TableCell>
                    <TableCell sx={{ px: 2, py: 1.5, fontSize: '12px', color: 'text.primary', whiteSpace: 'nowrap' }}>
                      {formatDays(row.timeInPreApproval)}
                    </TableCell>
                    <TableCell sx={{ px: 2, py: 1.5, whiteSpace: 'nowrap' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box
                          sx={{
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            bgcolor: 'grey.200',
                            overflow: 'hidden',
                            flexShrink: 0,
                            position: 'relative',
                          }}
                        >
                          <ImageWithFallback
                            src={row.submittedBy.avatarUrl}
                            alt={row.submittedBy.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        </Box>
                        <Typography sx={{ fontSize: '12px', color: 'text.primary' }}>{row.submittedBy.name}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ px: 2, py: 1.5, fontSize: '12px', color: 'text.primary', whiteSpace: 'nowrap' }}>
                      {row.mediaType}
                    </TableCell>
                    <TableCell sx={{ px: 2, py: 1.5, fontSize: '12px', color: 'text.primary', maxWidth: 280 }}>
                      <Box
                        component="div"
                        title={row.details}
                        sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                      >
                        {row.details}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ px: 2, py: 1.5, fontSize: '12px', color: 'text.primary', whiteSpace: 'nowrap', pr: 5, position: 'relative' }}>
                      {(() => {
                        const days = Math.round((new Date().getTime() - row.lastUpdated.getTime()) / (1000 * 3600 * 24));
                        if (days <= 0) return 'just now';
                        if (days === 1) return '1 day ago';
                        return `${days} days ago`;
                      })()}
                      <Box
                        sx={{
                          position: 'absolute',
                          right: 8,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          opacity: isSelected ? 1 : 0,
                          '.MuiTableRow-root:hover &': { opacity: 1 },
                          transition: 'opacity 0.15s',
                        }}
                      >
                        <Box
                          component="button"
                          sx={{
                            p: '4px',
                            borderRadius: '50%',
                            border: 'none',
                            bgcolor: 'transparent',
                            cursor: 'pointer',
                            color: 'rgba(31,29,37,0.6)',
                            display: 'flex',
                            alignItems: 'center',
                            '&:hover': { bgcolor: 'rgba(0,0,0,0.05)' },
                          }}
                        >
                          <MoreVertIcon sx={{ width: 16, height: 16 }} />
                        </Box>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {filteredData.length === 0 && (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                py: 10,
                color: 'text.secondary',
              }}
            >
              <Typography sx={{ fontSize: '14px' }}>
                {t('No pre-approvals found matching your criteria.')}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}
