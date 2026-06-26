import { useState, useMemo, useRef, useEffect } from 'react';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import { useTranslation } from '../contexts/LanguageContext';
import type { DateRange } from './DateRangePicker';
import { FilterSelect } from './FilterSelect';
import { DateRangeInput } from './DateRangeInput';
import { DateRangePicker } from './DateRangePicker';
import { ActionButton } from './ActionButton';
import { StatusChip } from './StatusChip';
import { useFilters } from '../contexts/FilterContext';

export interface Case {
  id: string;
  date: Date;
  status: 'Approved' | 'Pending' | 'Revision Requested';
  dealership: string;
  type: string;
  lastUpdated: string;
}

// ── Agency (multi-dealer) cases ───────────────────────────────────────────────
const AGENCY_CASES: Case[] = [
  { id: 'MFC539881', date: new Date(2025, 0, 2), status: 'Approved',           dealership: '408252 - Jack Daniels Volkswagen',          type: 'CRM AUGUST',        lastUpdated: '3 days ago' },
  { id: 'MFC539882', date: new Date(2025, 0, 2), status: 'Pending',            dealership: '423063 - Armstrong Volkswagen of Gladstone', type: 'CRM AUGUST',        lastUpdated: '3 days ago' },
  { id: 'MFC539883', date: new Date(2025, 0, 2), status: 'Revision Requested', dealership: '408252 - Jack Daniels Volkswagen',          type: 'CRM AUGUST',        lastUpdated: '3 days ago' },
  { id: 'MFC539884', date: new Date(2025, 0, 2), status: 'Approved',           dealership: '409210 - Paramount Volkswagen of Hickory',  type: 'CRM AUGUST',        lastUpdated: '3 days ago' },
  { id: 'MFC539885', date: new Date(2025, 0, 2), status: 'Approved',           dealership: '402165 - Volkswagen of Downtown Chicago',   type: 'CRM AUGUST',        lastUpdated: '3 days ago' },
  { id: 'MFC539886', date: new Date(2025, 0, 2), status: 'Approved',           dealership: '423063 - Armstrong Volkswagen of Gladstone', type: 'CRM AUGUST',       lastUpdated: '3 days ago' },
  { id: 'MFC539887', date: new Date(2025, 0, 2), status: 'Pending',            dealership: '408252 - Jack Daniels Volkswagen',          type: 'CRM AUGUST',        lastUpdated: '3 days ago' },
  { id: 'MFC539888', date: new Date(2025, 0, 2), status: 'Approved',           dealership: '408252 - Jack Daniels Volkswagen',          type: 'CRM AUGUST',        lastUpdated: '3 days ago' },
  { id: 'MFC539889', date: new Date(2025, 0, 2), status: 'Pending',            dealership: '423063 - Armstrong Volkswagen of Gladstone', type: 'BRAND COMPLIANCE', lastUpdated: '3 days ago' },
  { id: 'MFC539890', date: new Date(2025, 0, 2), status: 'Revision Requested', dealership: '408252 - Jack Daniels Volkswagen',          type: 'BRAND COMPLIANCE',  lastUpdated: '3 days ago' },
  { id: 'MFC539891', date: new Date(2025, 0, 2), status: 'Approved',           dealership: '409210 - Paramount Volkswagen of Hickory',  type: 'CRM AUGUST',        lastUpdated: '3 days ago' },
  { id: 'MFC539892', date: new Date(2025, 0, 2), status: 'Approved',           dealership: '402165 - Volkswagen of Downtown Chicago',   type: 'CRM AUGUST',        lastUpdated: '3 days ago' },
  { id: 'MFC539893', date: new Date(2025, 0, 2), status: 'Pending',            dealership: '408252 - Jack Daniels Volkswagen',          type: 'BRAND COMPLIANCE',  lastUpdated: '3 days ago' },
  { id: 'MFC539894', date: new Date(2025, 0, 2), status: 'Revision Requested', dealership: '408252 - Jack Daniels Volkswagen',          type: 'CRM AUGUST',        lastUpdated: '3 days ago' },
];

// ── Jack Daniels Volkswagen (12345) cases ─────────────────────────────────────────
const ANY_TOWN_CASES: Case[] = [
  { id: 'MFC560020', date: new Date(2026, 3, 20), status: 'Pending',            dealership: '12345 - Jack Daniels Volkswagen', type: 'SPRING DIGITAL 2026',    lastUpdated: '1 week ago'  },
  { id: 'MFC560021', date: new Date(2026, 3, 10), status: 'Revision Requested', dealership: '12345 - Jack Daniels Volkswagen', type: 'BRAND COMPLIANCE',        lastUpdated: '2 weeks ago' },
  { id: 'MFC560022', date: new Date(2026, 2, 5),  status: 'Approved',           dealership: '12345 - Jack Daniels Volkswagen', type: 'SPRING DIGITAL 2026',    lastUpdated: '3 weeks ago' },
  { id: 'MFC560023', date: new Date(2026, 1, 18), status: 'Approved',           dealership: '12345 - Jack Daniels Volkswagen', type: 'SOCIAL MEDIA FEB 2026',   lastUpdated: '1 month ago' },
  { id: 'MFC560024', date: new Date(2026, 0, 12), status: 'Approved',           dealership: '12345 - Jack Daniels Volkswagen', type: 'GOOGLE SEM JAN 2026',     lastUpdated: '3 months ago'},
  { id: 'MFC560025', date: new Date(2025, 11, 8), status: 'Approved',           dealership: '12345 - Jack Daniels Volkswagen', type: 'HOLIDAY OTT 2025',        lastUpdated: '4 months ago'},
  { id: 'MFC560026', date: new Date(2025, 10, 3), status: 'Revision Requested', dealership: '12345 - Jack Daniels Volkswagen', type: 'BRAND COMPLIANCE',        lastUpdated: '5 months ago'},
  { id: 'MFC560027', date: new Date(2025, 8, 20), status: 'Approved',           dealership: '12345 - Jack Daniels Volkswagen', type: 'FALL DISPLAY 2025',       lastUpdated: '7 months ago'},
];

// Merged dataset for agency view
const CASES_DATA: Case[] = [...AGENCY_CASES, ...ANY_TOWN_CASES];

const COLUMNS = [
  { label: 'Date',         minWidth: 120 },
  { label: 'ID',           minWidth: 100 },
  { label: 'Status',       minWidth: 160 },
  { label: 'Dealership',   minWidth: 400 },
  { label: 'Type',         minWidth: 150 },
  { label: 'Last Updated', minWidth: 130 },
];

export function CasesTab({
  dateRange: propDateRange,
  onDateRangeChange: propOnDateRangeChange,
}: {
  dateRange?: DateRange;
  onDateRangeChange?: (range: DateRange | undefined) => void;
}) {
  const { t } = useTranslation();
  const { isLockedDealership } = useFilters();
  const [internalDateRange, setInternalDateRange] = useState<DateRange | undefined>({
    from: new Date(2025, 0, 1),
    to: new Date(2025, 11, 31),
  });

  const dateRange = propDateRange ?? internalDateRange;
  const setDateRange = propOnDateRangeChange ?? setInternalDateRange;

  const [searchQuery, setSearchQuery] = useState('');
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const datePickerRef = useRef<HTMLDivElement>(null);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);

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
    const source = isLockedDealership ? ANY_TOWN_CASES : CASES_DATA;
    return source.filter((item) => {
      if (dateRange?.from && item.date < dateRange.from) return false;
      if (dateRange?.to && item.date > dateRange.to) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          item.id.toLowerCase().includes(q) ||
          item.dealership.toLowerCase().includes(q) ||
          item.status.toLowerCase().includes(q) ||
          item.type.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [dateRange, searchQuery, isLockedDealership]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', bgcolor: 'background.paper' }}>
      {/* Controls Row */}
      <Box sx={{ flexShrink: 0, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', p: '24px' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ActionButton label={t('New Case')} onClick={() => {}} />

          <OutlinedInput
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('Find below')}
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
          <FilterSelect label="Area" value="All Areas" />
          <FilterSelect label="Dealership" value="All Dealerships" />

          <Box sx={{ position: 'relative' }} ref={datePickerRef}>
            <DateRangeInput
              startDate={dateRange?.from}
              endDate={dateRange?.to}
              onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
              onReset={(e) => {
                e.stopPropagation();
                setDateRange({ from: new Date(2025, 0, 1), to: new Date(2025, 11, 31) });
              }}
            />
            {isDatePickerOpen && (
              <DateRangePicker
                initialRange={dateRange}
                onApply={(range) => {
                  setDateRange(range);
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
            {filteredData.map((row, index) => {
              const key = `${row.id}-${index}`;
              const isSelected = selectedCaseId === key;
              return (
                <TableRow
                  key={key}
                  onClick={() => setSelectedCaseId(isSelected ? null : key)}
                  sx={{
                    cursor: 'pointer',
                    bgcolor: isSelected ? '#F2F1FF' : 'background.paper',
                    '&:hover': { bgcolor: isSelected ? '#F2F1FF' : 'rgba(0,0,0,0.02)' },
                    borderBottom: '1px solid rgba(0,0,0,0.08)',
                  }}
                >
                  <TableCell sx={{ fontSize: '0.75rem', color: 'text.primary', whiteSpace: 'nowrap', px: '16px', py: '14px' }}>
                    {row.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.75rem', color: 'text.primary', whiteSpace: 'nowrap', fontWeight: 500, px: '16px', py: '14px' }}>
                    {row.id}
                  </TableCell>
                  <TableCell sx={{ px: '16px', py: '14px', whiteSpace: 'nowrap' }}>
                    <StatusChip status={row.status} />
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.75rem', color: 'text.primary', maxWidth: 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', px: '16px', py: '14px' }}>
                    {row.dealership}
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.75rem', color: 'text.primary', whiteSpace: 'nowrap', px: '16px', py: '14px' }}>
                    {row.type}
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.75rem', color: 'text.primary', whiteSpace: 'nowrap', px: '16px', py: '14px' }}>
                    {row.lastUpdated}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Box>
    </Box>
  );
}
