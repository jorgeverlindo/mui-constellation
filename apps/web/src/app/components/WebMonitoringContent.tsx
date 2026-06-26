import { useState, useRef, useEffect, useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import SettingsIcon from '@mui/icons-material/Settings';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useTranslation } from '../contexts/LanguageContext';
import { DateRangeInput } from './DateRangeInput';
import { DateRangePicker, DateRange } from './DateRangePicker';
import { FilterSelect } from './FilterSelect';
import { StatusChip, SeverityChip } from './StatusChip';
import type { WCMItem } from '../../data/types/compliance';

// Re-export so existing importers continue to work
export type { WCMItem };

// ─── Mock Data ────────────────────────────────────────────────────────────────
export const WCM_DATA: readonly WCMItem[] = [
  { id: 'WCM-24091', detectedOn: 'Jan 28, 2026', dealership: 'Jack Daniels Volkswagen',       violationType: 'Missing legal disclaimer (APR)',              source: 'Web Monitoring',  url: 'jackdanielsvw.com/lease-offers',   severity: 'High',   status: 'Open' },
  { id: 'WCM-24092', detectedOn: 'Jan 27, 2026', dealership: 'Emich Volkswagen',               violationType: 'Incorrect monthly payment advertised',         source: 'Manually Added',  url: 'emichvw.com/id4-deals',            severity: 'Medium', status: 'In Review' },
  { id: 'WCM-24101', detectedOn: 'Jan 27, 2026', dealership: 'Jack Daniels Volkswagen',       violationType: 'Expired incentive promoted on landing page',  source: 'Web Monitoring',  url: 'jackdanielsvw.com/atlas-specials', severity: 'Medium', status: 'In Review' },
  { id: 'WCM-24093', detectedOn: 'Jan 26, 2026', dealership: 'Volkswagen of Downtown LA',      violationType: 'Expired offer still promoted',                 source: 'Web Monitoring',  url: 'vwdtla.com/specials',              severity: 'High',   status: 'Penalty Applied' },
  { id: 'WCM-24094', detectedOn: 'Jan 25, 2026', dealership: 'Jim Ellis Volkswagen',           violationType: 'Incorrect OEM logo usage',                    source: 'Manually Added',  url: 'jimellisvw.com',                   severity: 'Low',    status: 'Resolved' },
  { id: 'WCM-24095', detectedOn: 'Jan 25, 2026', dealership: 'Hendrick Volkswagen Frisco',     violationType: 'SEM bidding on restricted keywords',          source: 'Web Monitoring',  url: 'hendrickvwfrisco.com/search',      severity: 'Medium', status: 'Open' },
  { id: 'WCM-24102', detectedOn: 'Jan 24, 2026', dealership: 'Jack Daniels Volkswagen',       violationType: 'SEM bidding on restricted brand keywords',    source: 'Manually Added',  url: 'jackdanielsvw.com/search',         severity: 'Low',    status: 'Resolved' },
  { id: 'WCM-24096', detectedOn: 'Jan 24, 2026', dealership: 'Volkswagen of Union',            violationType: 'Incentive not OEM-approved',                  source: 'Web Monitoring',  url: 'vwunion.com/taos',                 severity: 'Medium', status: 'In Review' },
  { id: 'WCM-24097', detectedOn: 'Jan 23, 2026', dealership: 'Palisades Volkswagen',           violationType: 'Unauthorized creative modification',          source: 'Manually Added',  url: 'palisadesvw.com',                  severity: 'High',   status: 'Open' },
  { id: 'WCM-24103', detectedOn: 'Jan 22, 2026', dealership: 'Jack Daniels Volkswagen',       violationType: 'Unapproved trade-in offer messaging',         source: 'Web Monitoring',  url: 'jackdanielsvw.com/trade-in',       severity: 'Medium', status: 'Open' },
  { id: 'WCM-24098', detectedOn: 'Jan 22, 2026', dealership: 'Trend Motors Volkswagen',        violationType: 'Missing offer expiration date',               source: 'Web Monitoring',  url: 'trendmotorsvw.com',                severity: 'Low',    status: 'Open' },
  { id: 'WCM-24099', detectedOn: 'Jan 21, 2026', dealership: 'Open Road Volkswagen Manhattan', violationType: 'SEO misuse of trademarked terms',             source: 'Manually Added',  url: 'openroadvw.com/seo',               severity: 'Medium', status: 'In Review' },
  { id: 'WCM-24100', detectedOn: 'Jan 20, 2026', dealership: 'Douglas Volkswagen',             violationType: 'Non-compliant landing page (offer mismatch)', source: 'Web Monitoring',  url: 'douglasvw.com/atlas',              severity: 'High',   status: 'Open' },
];

export function wcmStatusToChipStatus(status: string): string {
  switch (status) {
    case 'Open':            return 'Open';
    case 'In Review':       return 'In Review';
    case 'Resolved':        return 'Approved';
    case 'Penalty Applied': return 'Penalty Applied';
    default:                return status;
  }
}

const DEFAULT_DATE_RANGE: DateRange = {
  from: new Date(2025, 0, 1),
  to:   new Date(2025, 11, 31),
};

const COLUMNS = [
  { label: 'Detected On',    minWidth: 120 },
  { label: 'ID',             minWidth: 100 },
  { label: 'Dealership',     minWidth: 212 },
  { label: 'Violation Type', minWidth: 264 },
  { label: 'Source',         minWidth: 150 },
  { label: 'Added By',       minWidth: 180 },
  { label: 'Website / URL',  minWidth: 210 },
  { label: 'Severity',       minWidth: 140 },
  { label: 'Status',         minWidth: 160 },
] as const;

interface WebMonitoringContentProps {
  selectedId: string | null;
  onSelectItem: (id: string) => void;
  dateRange?: DateRange;
  onDateRangeChange?: (range: DateRange | undefined) => void;
  dealershipFilter?: string;
  reportedByFilter?: string;
  userAddedInfractions?: WCMItem[];
  onAddInfraction?: () => void;
  userType?: 'dealer' | 'dealer-singular' | 'dealer-emich' | 'oem';
  onOpenWebMonitoringConfig?: () => void;
  caseSolutions?: Record<string, { solved?: boolean }>;
  deletedInfractionIds?: Set<string>;
  onDeleteInfraction?: (id: string) => void;
  onReopenInfraction?: (id: string) => void;
}

export function WebMonitoringContent({
  selectedId,
  onSelectItem,
  dateRange,
  onDateRangeChange,
  dealershipFilter,
  reportedByFilter,
  userAddedInfractions,
  onAddInfraction,
  onOpenWebMonitoringConfig,
  caseSolutions,
  deletedInfractionIds,
  onDeleteInfraction,
  onReopenInfraction,
  userType = 'oem',
}: WebMonitoringContentProps) {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const datePickerRef = useRef<HTMLDivElement>(null);
  const [contextMenu, setContextMenu] = useState<{ id: string; status: string; x: number; y: number } | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setIsDatePickerOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!contextMenu) return;
    const close = () => setContextMenu(null);
    window.addEventListener('click', close);
    window.addEventListener('scroll', close, true);
    return () => {
      window.removeEventListener('click', close);
      window.removeEventListener('scroll', close, true);
    };
  }, [contextMenu]);

  const sourceData = useMemo<readonly WCMItem[]>(
    () => [...(userAddedInfractions ?? []), ...WCM_DATA],
    [userAddedInfractions],
  );

  const filteredData = useMemo(() => {
    return sourceData.filter((item) => {
      if (deletedInfractionIds?.has(item.id)) return false;
      if (dealershipFilter) {
        const isOwn = item.dealership === dealershipFilter;
        const isMyReport = !!reportedByFilter && item.reportedBy === reportedByFilter;
        if (!isOwn && !isMyReport) return false;
        if (isOwn && !!item.reportedBy && item.status === 'Pending') return false;
      }
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          item.id.toLowerCase().includes(q) ||
          item.dealership.toLowerCase().includes(q) ||
          item.violationType.toLowerCase().includes(q) ||
          item.url.toLowerCase().includes(q) ||
          item.severity.toLowerCase().includes(q) ||
          item.status.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [searchQuery, dealershipFilter, reportedByFilter, sourceData, deletedInfractionIds]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative', overflow: 'hidden' }}>
      {/* Controls row */}
      <Box sx={{ flexShrink: 0, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', px: 3, py: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {onAddInfraction && (
            <Button
              onClick={onAddInfraction}
              variant="contained"
              startIcon={<AddIcon />}
              sx={{ bgcolor: 'primary.main', borderRadius: '100px', textTransform: 'none', fontSize: 14, '&:hover': { bgcolor: 'primary.dark' }, whiteSpace: 'nowrap' }}
            >
              {userType === 'oem' ? t('Add Infraction') : t('Report Infraction')}
            </Button>
          )}
          {onOpenWebMonitoringConfig && (
            <Button
              onClick={onOpenWebMonitoringConfig}
              variant="outlined"
              startIcon={<SettingsIcon />}
              sx={{ borderColor: 'primary.main', color: 'primary.main', borderRadius: '100px', textTransform: 'none', fontSize: 14, '&:hover': { bgcolor: 'rgba(71,59,171,0.06)' }, whiteSpace: 'nowrap' }}
            >
              {t('Web Monitoring')}
            </Button>
          )}

          {/* Search */}
          <Box sx={{
            display: 'flex', alignItems: 'center', gap: 1,
            pl: 1.5, pr: 2, height: 40,
            border: '1px solid #ccc', borderRadius: '20px', bgcolor: 'white',
            width: 280,
          }}>
            <SearchIcon sx={{ fontSize: 20, color: '#9CA3AF' }} />
            <InputBase
              placeholder={t('Find below')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ flex: 1, fontSize: 14, '& input': { p: 0 } }}
            />
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, zIndex: 30 }}>
          <FilterSelect label="Area"       value="All Areas"       width="w-[110px]" />
          <FilterSelect label="Dealership" value="All Dealerships" width="w-[274px]" />

          {/* Date Range */}
          <Box ref={datePickerRef} sx={{ position: 'relative' }}>
            <DateRangeInput
              startDate={dateRange?.from}
              endDate={dateRange?.to}
              onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
              onReset={(e) => {
                e.stopPropagation();
                onDateRangeChange?.(DEFAULT_DATE_RANGE);
              }}
            />
            {isDatePickerOpen && (
              <Box sx={{ position: 'absolute', right: 0, top: '100%', zIndex: 50, mt: 0.5 }}>
                <DateRangePicker
                  initialRange={dateRange}
                  onApply={(range) => { onDateRangeChange?.(range); setIsDatePickerOpen(false); }}
                  onCancel={() => setIsDatePickerOpen(false)}
                />
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      {/* Table */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, bgcolor: 'white', borderTop: '1px solid #E5E7EB' }}>
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          <table style={{ minWidth: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ background: 'white', position: 'sticky', top: 0, zIndex: 10, boxShadow: '0 1px 0 rgba(0,0,0,0.06)' }}>
              <tr>
                {COLUMNS.map((col) => (
                  <th key={col.label} style={{
                    padding: '12px 16px', fontSize: 12, fontWeight: 500,
                    color: 'text.secondary', letterSpacing: '0.17px',
                    borderBottom: '1px solid rgba(0,0,0,0.12)',
                    whiteSpace: 'nowrap', minWidth: col.minWidth,
                  }}>
                    {t(col.label)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredData.map((row) => {
                const isSelected = selectedId === row.id;
                return (
                  <tr
                    key={row.id}
                    onClick={() => onSelectItem(row.id)}
                    onContextMenu={(onDeleteInfraction || onReopenInfraction) ? (e) => {
                      e.preventDefault();
                      setContextMenu({ id: row.id, status: row.status, x: e.clientX, y: e.clientY });
                    } : undefined}
                    style={{
                      cursor: 'pointer',
                      background: isSelected ? 'rgba(71,59,171,0.04)' : 'white',
                      borderLeft: isSelected ? '2px solid #473BAB' : '2px solid transparent',
                      transition: 'background 0.1s',
                    }}
                    onMouseEnter={(e) => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = '#F9FAFB'; }}
                    onMouseLeave={(e) => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'white'; }}
                  >
                    <td style={{ padding: '14px 16px', fontSize: 12, color: 'text.secondary', whiteSpace: 'nowrap', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>{row.detectedOn}</td>
                    <td style={{ padding: '14px 16px', fontSize: 12, fontWeight: 500, color: 'text.primary', whiteSpace: 'nowrap', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>{row.id}</td>
                    <td style={{ padding: '14px 16px', fontSize: 12, color: 'text.primary', whiteSpace: 'nowrap', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>{row.dealership}</td>
                    <td style={{ padding: '14px 16px', fontSize: 12, color: 'text.primary', maxWidth: 264, borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={row.violationType}>{row.violationType}</div>
                    </td>
                    <td style={{ padding: '14px 16px', whiteSpace: 'nowrap', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
                      <Box component="span" sx={{
                        display: 'inline-flex', alignItems: 'center',
                        px: 1, py: 0.25, borderRadius: '100px', fontSize: 11, fontWeight: 500, border: '1px solid',
                        ...(row.source === 'Manually Added'
                          ? { bgcolor: 'rgba(71,59,171,0.08)', borderColor: 'rgba(71,59,171,0.24)', color: 'primary.main' }
                          : { bgcolor: 'rgba(0,0,0,0.04)', borderColor: 'rgba(0,0,0,0.12)', color: 'rgba(31,29,37,0.7)' }),
                      }}>
                        {t(row.source)}
                      </Box>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: 12, color: 'text.primary', whiteSpace: 'nowrap', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
                      {(() => {
                        const hideForTargetDealer = !!dealershipFilter && row.dealership === dealershipFilter && !!row.reportedBy;
                        return row.reportedBy && !hideForTargetDealer
                          ? row.reportedBy
                          : <span style={{ color: 'text.disabled' }}>—</span>;
                      })()}
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: 12, whiteSpace: 'nowrap', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
                      <a
                        href={/^https?:\/\//i.test(row.url) ? row.url : `https://${row.url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        style={{ color: 'primary.main', textDecoration: 'none' }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.textDecoration = 'underline'; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.textDecoration = 'none'; }}
                      >
                        {row.url}
                      </a>
                    </td>
                    <td style={{ padding: '14px 16px', whiteSpace: 'nowrap', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
                      <SeverityChip severity={row.severity} />
                    </td>
                    <td style={{ padding: '14px 16px', whiteSpace: 'nowrap', paddingRight: 40, position: 'relative', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
                      <StatusChip status={
                        caseSolutions?.[row.id]?.solved
                          ? 'Solved'
                          : caseSolutions?.[row.id]
                            ? 'Solution Submitted'
                            : wcmStatusToChipStatus(row.status)
                      } />
                      <Box sx={{
                        position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                        opacity: isSelected ? 1 : 0,
                        transition: 'opacity 0.15s',
                        '& tr:hover &': { opacity: 1 },
                      }}>
                        <IconButton size="small" onClick={(e) => e.stopPropagation()}>
                          <MoreVertIcon sx={{ fontSize: 16, color: 'rgba(31,29,37,0.6)' }} />
                        </IconButton>
                      </Box>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredData.length === 0 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 10 }}>
              <Typography sx={{ color: '#9CA3AF', fontSize: 14 }}>
                {t('No violations found matching your criteria.')}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* Right-click context menu */}
      {contextMenu && (onDeleteInfraction || (onReopenInfraction && contextMenu.status === 'Resolved')) && (
        <Box
          sx={{
            position: 'fixed', zIndex: 50, minWidth: 180,
            bgcolor: 'white', borderRadius: 1.5,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)', border: '1px solid rgba(0,0,0,0.1)',
            py: 0.5, left: contextMenu.x, top: contextMenu.y,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {onReopenInfraction && contextMenu.status === 'Resolved' && (
            <Box
              component="button"
              onClick={() => { onReopenInfraction(contextMenu.id); setContextMenu(null); }}
              sx={{ width: '100%', textAlign: 'left', px: 1.5, py: 1, fontSize: 14, color: '#014361', cursor: 'pointer', border: 'none', bgcolor: 'transparent', '&:hover': { bgcolor: '#E1F5FE' }, display: 'flex', alignItems: 'center', gap: 1 }}
            >
              Reopen infraction
            </Box>
          )}
          {onDeleteInfraction && (
            <Box
              component="button"
              onClick={() => { onDeleteInfraction(contextMenu.id); setContextMenu(null); }}
              sx={{ width: '100%', textAlign: 'left', px: 1.5, py: 1, fontSize: 14, color: '#dc2626', cursor: 'pointer', border: 'none', bgcolor: 'transparent', '&:hover': { bgcolor: '#FEF2F2' }, display: 'flex', alignItems: 'center', gap: 1 }}
            >
              Delete infraction
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}
