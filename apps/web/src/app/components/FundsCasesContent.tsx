import { useState, useRef, useEffect, useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useTranslation } from '../contexts/LanguageContext';
import type { DateRange } from './DateRangePicker';
import { DateRangeInput } from './DateRangeInput';
import { DateRangePicker } from './DateRangePicker';
import { FilterSelect } from './FilterSelect';
import { ActionButton } from './ActionButton';
import { StatusChip } from './StatusChip';

// --- Types ---
export interface FundCase {
  id: string;
  date: Date;
  dealershipName: string;
  type: 'Compliance' | 'Audit' | 'Dispute';
  status: 'Open' | 'Resolved' | 'Escalated';
  priority: 'High' | 'Medium' | 'Low';
  assignedTo: string;
  lastActivity: Date;
  description: string;
}

// --- Mock Data ---
export const CASES_MOCK_DATA: FundCase[] = [
  {
    id: 'CS-9921',
    date: new Date(2026, 0, 15),
    dealershipName: 'Rick Case Volkswagen Weston',
    type: 'Compliance',
    status: 'Open',
    priority: 'High',
    assignedTo: 'Compliance Team A',
    lastActivity: new Date(2026, 0, 20),
    description: 'Missing signature on media invoice for MFA386592.',
  },
  {
    id: 'CS-9922',
    date: new Date(2026, 0, 10),
    dealershipName: 'Gunther Volkswagen of Coconut Creek',
    type: 'Audit',
    status: 'Resolved',
    priority: 'Medium',
    assignedTo: 'Audit Team',
    lastActivity: new Date(2026, 0, 12),
    description: 'Quarterly audit review for Q4 2025.',
  },
  {
    id: 'CS-9923',
    date: new Date(2026, 0, 5),
    dealershipName: 'Emich Volkswagen',
    type: 'Dispute',
    status: 'Escalated',
    priority: 'High',
    assignedTo: 'Finance Director',
    lastActivity: new Date(2026, 0, 21),
    description: 'Reimbursement rate dispute for campaign Radio-March.',
  },
];

const DEFAULT_DATE_RANGE: DateRange = {
  from: new Date(2025, 0, 1),
  to: new Date(2025, 11, 31),
};

export interface FundsCasesContentProps {
  dateRange: DateRange | undefined;
  onDateRangeChange: (range: DateRange | undefined) => void;
}

const PRIORITY_TOKENS = {
  High:   { bg: 'rgba(210,50,63,0.08)',  color: '#be0e1c' },
  Medium: { bg: 'rgba(225,118,19,0.08)', color: '#613f02' },
  Low:    { bg: '#E1F5FE',               color: '#014361' },
} as const;

function PriorityBadge({ priority }: { priority: 'High' | 'Medium' | 'Low' }) {
  const { t } = useTranslation();
  const tok = PRIORITY_TOKENS[priority];
  return (
    <Box
      component="span"
      sx={{
        px: '8px',
        py: '2px',
        borderRadius: '4px',
        fontSize: '10px',
        fontWeight: 700,
        letterSpacing: '0.8px',
        textTransform: 'uppercase',
        display: 'inline-block',
        bgcolor: tok.bg,
        color: tok.color,
        whiteSpace: 'nowrap',
      }}
    >
      {t(priority)}
    </Box>
  );
}

const COLUMNS = [
  { label: 'Case ID',       minWidth: 120 },
  { label: 'Date Opened',   minWidth: 140 },
  { label: 'Dealership',    minWidth: 300 },
  { label: 'Type',          minWidth: 140 },
  { label: 'Priority',      minWidth: 120 },
  { label: 'Status',        minWidth: 140 },
  { label: 'Assigned To',   minWidth: 180 },
  { label: 'Last Activity', minWidth: 140 },
];

export function FundsCasesContent({ dateRange, onDateRangeChange }: FundsCasesContentProps) {
  const { t } = useTranslation();
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
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
    return CASES_MOCK_DATA.filter((item) => {
      if (dateRange?.from && item.date < dateRange.from) return false;
      if (dateRange?.to && item.date > dateRange.to) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          item.id.toLowerCase().includes(q) ||
          item.dealershipName.toLowerCase().includes(q) ||
          item.status.toLowerCase().includes(q) ||
          item.type.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [dateRange, searchQuery]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Controls Row */}
      <Box
        sx={{
          flexShrink: 0,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          px: '20px',
          py: '24px',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ActionButton label={t('New Case')} onClick={() => {}} />

          <OutlinedInput
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('Search cases')}
            startAdornment={
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
              </InputAdornment>
            }
            sx={{
              width: 280,
              height: 40,
              borderRadius: '20px',
              fontSize: '0.875rem',
              bgcolor: 'background.paper',
              '& .MuiOutlinedInput-notchedOutline': { borderColor: '#D1D5DB' },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#6200EE' },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#6200EE', borderWidth: 1 },
            }}
          />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px', zIndex: 30 }}>
          <FilterSelect label="Case Type" value="All Types" />
          <FilterSelect label="Priority" value="All Priorities" />

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

      {/* Table Section */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          bgcolor: 'background.paper',
          borderTop: '1px solid',
          borderColor: 'divider',
          overflow: 'auto',
        }}
      >
        <Table stickyHeader size="small" sx={{ minWidth: 900 }}>
          <TableHead>
            <TableRow>
              {COLUMNS.map((col) => (
                <TableCell
                  key={col.label}
                  sx={{
                    minWidth: col.minWidth,
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    color: 'text.secondary',
                    letterSpacing: '0.17px',
                    bgcolor: 'background.paper',
                    borderBottom: '1px solid rgba(0,0,0,0.12)',
                    whiteSpace: 'nowrap',
                    py: '12px',
                    px: '16px',
                  }}
                >
                  {t(col.label)}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData.map((row) => (
              <TableRow
                key={row.id}
                hover
                sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'rgba(0,0,0,0.02)' } }}
              >
                <TableCell sx={{ fontSize: '0.75rem', fontWeight: 500, color: 'primary.main', whiteSpace: 'nowrap', px: '16px', py: '14px' }}>
                  {row.id}
                </TableCell>
                <TableCell sx={{ fontSize: '0.75rem', color: 'text.primary', whiteSpace: 'nowrap', px: '16px', py: '14px' }}>
                  {row.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </TableCell>
                <TableCell sx={{ fontSize: '0.75rem', color: 'text.primary', whiteSpace: 'nowrap', px: '16px', py: '14px' }}>
                  {row.dealershipName}
                </TableCell>
                <TableCell sx={{ fontSize: '0.75rem', color: 'text.primary', whiteSpace: 'nowrap', px: '16px', py: '14px' }}>
                  {t(row.type)}
                </TableCell>
                <TableCell sx={{ px: '16px', py: '14px', whiteSpace: 'nowrap' }}>
                  <PriorityBadge priority={row.priority} />
                </TableCell>
                <TableCell sx={{ px: '16px', py: '14px', whiteSpace: 'nowrap' }}>
                  <StatusChip
                    status={
                      row.status === 'Open'
                        ? 'Pending'
                        : row.status === 'Resolved'
                          ? 'Approved'
                          : 'Revision Requested'
                    }
                  />
                </TableCell>
                <TableCell sx={{ fontSize: '0.75rem', color: 'text.primary', whiteSpace: 'nowrap', px: '16px', py: '14px' }}>
                  {row.assignedTo}
                </TableCell>
                <TableCell sx={{ fontSize: '0.75rem', color: 'text.primary', whiteSpace: 'nowrap', px: '16px', py: '14px' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography component="span" sx={{ fontSize: '0.75rem' }}>
                      {Math.round((new Date().getTime() - row.lastActivity.getTime()) / (1000 * 3600 * 24))} days ago
                    </Typography>
                    <IconButton size="small" sx={{ opacity: 0, '.MuiTableRow-root:hover &': { opacity: 1 }, p: '4px' }}>
                      <MoreVertIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    </Box>
  );
}
