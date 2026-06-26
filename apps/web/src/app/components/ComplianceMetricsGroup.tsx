// Compliance infractions metrics group — mirrors ClaimsMetricsGroup
import { useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { MetricCard } from './MetricCard';
import { useTranslation } from '../contexts/LanguageContext';
import type { WCMItem } from '../../data/types/compliance';

const fmt = (n: number) => n.toLocaleString('en-US');

// ─── Static mock data (same as vw-funds-2 WebMonitoringContent) ──────────────

const WCM_DATA: readonly WCMItem[] = [
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

const PENDING_STATUSES = new Set(['Pending', 'Solution Submitted', 'In Review', 'Revision Requested']);

interface ComplianceMetricsGroupProps {
  userAddedInfractions?: WCMItem[];
  caseSolutions?: Record<string, { solved?: boolean }>;
  dealershipFilter?: string;
  reportedByFilter?: string;
  onNavigateToCompliance?: () => void;
}

export function ComplianceMetricsGroup({
  userAddedInfractions = [],
  caseSolutions = {},
  dealershipFilter,
  reportedByFilter,
  onNavigateToCompliance,
}: ComplianceMetricsGroupProps) {
  const { t } = useTranslation();

  const { open, pending, solvedYTD } = useMemo(() => {
    const all: WCMItem[] = [...userAddedInfractions, ...WCM_DATA];

    const visible = dealershipFilter
      ? all.filter(
          (i) =>
            i.dealership === dealershipFilter ||
            (!!reportedByFilter && i.reportedBy === reportedByFilter),
        )
      : all;

    let openCount = 0, pendingCount = 0, solvedCount = 0;
    for (const item of visible) {
      const sol = caseSolutions[item.id];
      const effective = sol?.solved ? 'Solved' : sol ? 'Solution Submitted' : item.status;
      if (effective === 'Open') openCount++;
      else if (PENDING_STATUSES.has(effective)) pendingCount++;
      else if (effective === 'Solved' || effective === 'Resolved') solvedCount++;
    }
    return { open: openCount, pending: pendingCount, solvedYTD: solvedCount };
  }, [userAddedInfractions, caseSolutions, dealershipFilter, reportedByFilter]);

  return (
    <Box
      sx={{
        bgcolor: 'surface.canvas',
        flex: 1,
        minHeight: 0,
        minWidth: 0,
        position: 'relative',
        borderRadius: 3,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          p: '8px',
          width: '100%',
        }}
      >
        <Typography
          sx={{
            fontWeight: 500,
            lineHeight: '24px',
            color: 'text.primary',
            fontSize: '0.875rem',
            letterSpacing: '0.17px',
            mb: '8px',
            px: '4px',
            flexShrink: 0,
          }}
        >
          {t('Compliance Infractions')}
        </Typography>
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            alignItems: 'center',
            width: '100%',
            flexShrink: 0,
          }}
        >
          <MetricCard label="Open"           value={fmt(open)}      onClick={onNavigateToCompliance} />
          <MetricCard label="Pending Review" value={fmt(pending)}   onClick={onNavigateToCompliance} />
          <MetricCard label="Solved YTD"     value={fmt(solvedYTD)} onClick={onNavigateToCompliance} />
        </Box>
      </Box>
    </Box>
  );
}
