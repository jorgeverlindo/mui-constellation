import {
  useCallback, useEffect, useMemo, useRef,
  useState, Suspense, lazy,
} from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';
import Box from '@mui/material/Box';
import Badge from '@mui/material/Badge';
import ButtonBase from '@mui/material/ButtonBase';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { alpha } from '@mui/material/styles';
import {
  AppSidebar,
  type AppSidebarItem,
  TopBar,
  SearchInput,
  IconButton,
  Avatar,
  Breadcrumb,
} from '@jorgeverlindo/constellation-ux';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
// Constellation AI icon — from imports/icons/side-rail/Constellation AI.svg
function ConstellationAIIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fillRule="evenodd" clipRule="evenodd" d="M13 7C13.4142 7 13.75 7.33579 13.75 7.75C13.75 10.1758 14.2859 11.7513 15.2673 12.7327C16.2487 13.7141 17.8242 14.25 20.25 14.25C20.6642 14.25 21 14.5858 21 15C21 15.4142 20.6642 15.75 20.25 15.75C17.8242 15.75 16.2487 16.2859 15.2673 17.2673C14.2859 18.2487 13.75 19.8242 13.75 22.25C13.75 22.6642 13.4142 23 13 23C12.5858 23 12.25 22.6642 12.25 22.25C12.25 19.8242 11.7141 18.2487 10.7327 17.2673C9.75127 16.2859 8.17581 15.75 5.75 15.75C5.33579 15.75 5 15.4142 5 15C5 14.5858 5.33579 14.25 5.75 14.25C8.17581 14.25 9.75127 13.7141 10.7327 12.7327C11.7141 11.7513 12.25 10.1758 12.25 7.75C12.25 7.33579 12.5858 7 13 7ZM13 12.0086C12.699 12.6893 12.3008 13.2859 11.7934 13.7934C11.2859 14.3008 10.6893 14.699 10.0086 15C10.6893 15.301 11.2859 15.6992 11.7934 16.2066C12.3008 16.7141 12.699 17.3107 13 17.9914C13.301 17.3107 13.6992 16.7141 14.2066 16.2066C14.7141 15.6992 15.3107 15.301 15.9914 15C15.3107 14.699 14.7141 14.3008 14.2066 13.7934C13.6992 13.2859 13.301 12.6893 13 12.0086Z" fill="currentColor"/>
      <path d="M6 5.5C6 5.22386 5.77614 5 5.5 5C5.22386 5 5 5.22386 5 5.5C5 6.48063 4.78279 7.0726 4.4277 7.4277C4.0726 7.78279 3.48063 8 2.5 8C2.22386 8 2 8.22386 2 8.5C2 8.77614 2.22386 9 2.5 9C3.48063 9 4.0726 9.21721 4.4277 9.5723C4.78279 9.9274 5 10.5194 5 11.5C5 11.7761 5.22386 12 5.5 12C5.77614 12 6 11.7761 6 11.5C6 10.5194 6.21721 9.9274 6.5723 9.5723C6.9274 9.21721 7.51937 9 8.5 9C8.77614 9 9 8.77614 9 8.5C9 8.22386 8.77614 8 8.5 8C7.51937 8 6.9274 7.78279 6.5723 7.4277C6.21721 7.0726 6 6.48063 6 5.5Z" fill="currentColor"/>
      <path d="M11 1.5C11 1.22386 10.7761 1 10.5 1C10.2239 1 10 1.22386 10 1.5C10 2.13341 9.85918 2.47538 9.66728 2.66728C9.47538 2.85918 9.13341 3 8.5 3C8.22386 3 8 3.22386 8 3.5C8 3.77614 8.22386 4 8.5 4C9.13341 4 9.47538 4.14082 9.66728 4.33272C9.85918 4.52462 10 4.86659 10 5.5C10 5.77614 10.2239 6 10.5 6C10.7761 6 11 5.77614 11 5.5C11 4.86659 11.1408 4.52462 11.3327 4.33272C11.5246 4.14082 11.8666 4 12.5 4C12.7761 4 13 3.77614 13 3.5C13 3.22386 12.7761 3 12.5 3C11.8666 3 11.5246 2.85918 11.3327 2.66728C11.1408 2.47538 11 2.13341 11 1.5Z" fill="currentColor"/>
    </svg>
  );
}

// ── Custom SVG rail icons (same filter as original) ───────────────────────────
import svgProjects       from './assets/icons/side-rail/Projects.svg';
import svgFeeds          from './assets/icons/side-rail/Feeds.svg';
import svgDesign         from './assets/icons/side-rail/Design.svg';
import svgPortal         from './assets/icons/side-rail/Portal.svg';
import svgCampaigns      from './assets/icons/side-rail/megaphone.svg';
import svgInventory      from './assets/icons/side-rail/Inventory.svg';
import svgInsights       from './assets/icons/side-rail/Insights.svg';
import svgAI             from './assets/icons/side-rail/Constellation AI.svg';
import svgChats          from './assets/icons/side-rail/Chats.svg';
import svgHelp           from './assets/icons/side-rail/circle-questionmark, faq, help, questionaire.svg';

// Icon filter to match the original's `brightness(0) saturate(100%) invert(74%) sepia(53%)...`
const RAIL_ICON_FILTER = 'brightness(0) saturate(100%) invert(74%) sepia(53%) saturate(380%) hue-rotate(203deg) brightness(101%) contrast(101%)';
const RAIL_ICON_ACTIVE_FILTER = 'brightness(0) saturate(100%) invert(74%) sepia(53%) saturate(380%) hue-rotate(203deg) brightness(101%) contrast(101%)';

function RailSvgIcon({ src, active }: { src: string; active?: boolean }) {
  return (
    <Box
      component="img"
      src={src}
      alt=""
      aria-hidden
      sx={{
        width: 24, height: 24,
        filter: active ? RAIL_ICON_ACTIVE_FILTER : RAIL_ICON_FILTER,
      }}
    />
  );
}

// ── App contexts ──────────────────────────────────────────────────────────────
import { useTranslation }  from './contexts/LanguageContext';
import { useClient }       from './contexts/ClientContext';
import { useWorkflow, WORKFLOW_DEALER, WORKFLOW_CAMPAIGN } from './contexts/WorkflowContext';
import { useFilters }      from './contexts/FilterContext';
import { useCompliance, getDealerIdentity } from './contexts/ComplianceContext';

// ── Routing ───────────────────────────────────────────────────────────────────
import { buildUrl, SLUG_TO_TAB, type UserType } from './utils/routing';

// ── Shared components ─────────────────────────────────────────────────────────
import { ConstellationLogo }     from './components/ConstellationLogo';
import { BreadcrumbBar }         from './components/BreadcrumbBar';
import { LanguageToggleButton }  from './components/LanguageToggleButton';
import { ClientSwitcher }        from './components/ClientSwitcher';
import { ClientSettingsContent } from './components/client-settings/ClientSettingsContent';
import { AgentPane }             from './components/AgentPane';
import { MainPane, RightPane }   from './components/LayoutWrappers';
import { usePaneResize, PaneResizer } from './components/PaneResizer';
import { emitSnackbar }          from './components/Snackbar';
import { CommentsProvider, CommentsSidePanel, CommentsButton } from './components/comments';
import type { NotifItem } from './components/comments/types';

// ── Hooks ─────────────────────────────────────────────────────────────────────
import { useSelectedPreApproval } from './hooks/useSelectedPreApproval';
import { useSelectedClaim }       from './hooks/useSelectedClaim';

// ── Tab screens (campaigns section) ──────────────────────────────────────────
import { FundsOverviewContent }    from './components/FundsOverviewContent';
import { FundsOverviewOEMContent } from './components/FundsOverviewOEMContent';
import { FundsPreApprovalsContent } from './components/FundsPreApprovalsContent';
import { FundsClaimsContent }      from './components/FundsClaimsContent';
import { CasesTab }                from './components/CasesTab';
import { GuidelinesContent }       from './components/GuidelinesContent';
import { WebMonitoringContent, WCM_DATA } from './components/WebMonitoringContent';

// ── Side panels ───────────────────────────────────────────────────────────────
import { PreApprovalPanel }        from './components/PreApprovalPanel';
import { ClaimsPanel }             from './components/ClaimsPanel';
import { WebMonitoringPanel }      from './components/WebMonitoringPanel';
import { WebMonitoringModal }      from './components/WebMonitoringModal';
import { WebMonitoringConfigModal } from './components/WebMonitoringConfigModal';
import { DrawerOEM }               from './components/pre-approval/DrawerOEM';

// ── Planner ───────────────────────────────────────────────────────────────────
import {
  PlannerContent,
  INITIAL_CAMPAIGNS as PLANNER_INITIAL_CAMPAIGNS,
  GANTT_COLORS,
  type Campaign as PlannerCampaign,
} from './components/planner/PlannerContent';
import { PlannerPanel } from './components/planner/PlannerPanel';

// ── Projects agent pane ───────────────────────────────────────────────────────
import { ProjectAgentPane } from './components/projects/ProjectAgentPane';

// ── Lazy sections ─────────────────────────────────────────────────────────────
const PortalContent   = lazy(() => import('./components/portal/PortalContent').then(m => ({ default: m.PortalContent })));
const ProjectsModule  = lazy(() => import('./components/projects/ProjectsModule').then(m => ({ default: m.ProjectsModule })));
const InventoryContent = lazy(() => import('./components/inventory/InventoryContent').then(m => ({ default: m.InventoryContent })));

import type { DateRange } from './components/DateRangePicker';

// ─── Tab definitions ──────────────────────────────────────────────────────────

const DEALER_TABS = [
  { id: 'overview',       label: 'Overview' },
  { id: 'pre-approvals',  label: 'Pre-Approvals' },
  { id: 'claims',         label: 'Claims' },
  { id: 'cases',          label: 'Cases' },
  { id: 'planner',        label: 'Planner' },
  { id: 'web-monitoring', label: 'Compliance' },
  { id: 'guidelines',     label: 'Guidelines & Assets' },
];

const OEM_TABS = [
  { id: 'overview',       label: 'Overview' },
  { id: 'pre-approvals',  label: 'Pre-Approvals' },
  { id: 'claims',         label: 'Claims' },
  { id: 'cases',          label: 'Cases' },
  { id: 'planner',        label: 'Planner' },
  { id: 'web-monitoring', label: 'Compliance' },
];

const defaultDateRange: DateRange = {
  from: new Date(2025, 0, 1),
  to:   new Date(2026, 11, 31),
};

// ─── NAV items — SVG icons from original app ──────────────────────────────────

function makeSvgIcon(src: string): React.ReactNode {
  return <RailSvgIcon src={src} />;
}

const NAV_ITEMS: AppSidebarItem[] = [
  { id: 'projects',   label: 'Projects',   icon: makeSvgIcon(svgProjects) },
  { id: 'feeds',      label: 'Feeds',      icon: makeSvgIcon(svgFeeds) },
  { id: 'design',     label: 'Design',     icon: makeSvgIcon(svgDesign) },
  { id: 'portal',     label: 'Portal',     icon: makeSvgIcon(svgPortal) },
  { id: 'campaigns',  label: 'Campaigns',  icon: makeSvgIcon(svgCampaigns) },
  { id: 'inventory',  label: 'Inventory',  icon: makeSvgIcon(svgInventory) },
  { id: 'insights',   label: 'Insights',   icon: makeSvgIcon(svgInsights) },
  { id: 'ai-tools',   label: 'AI Tools',   icon: makeSvgIcon(svgAI) },
  { id: 'chats',      label: 'Chats',      icon: makeSvgIcon(svgChats) },
];

const SECTION_LABELS: Record<string, string> = {
  feeds: 'Feeds', design: 'Design', insights: 'Insights',
  'ai-tools': 'AI Tools', chats: 'Chats',
};

// ─── Client logos ─────────────────────────────────────────────────────────────

const LOGO_URLS = {
  audiOEM:      'https://res.cloudinary.com/dvq75cqna/image/upload/v1780071269/vw-funds/logos/Audi.png',
  audiPacific:  'https://res.cloudinary.com/dvq75cqna/image/upload/v1780071269/vw-funds/logos/Audi-Pacific.png',
  vwDealer:     'https://res.cloudinary.com/dvq75cqna/image/upload/v1780071276/vw-funds/logos/JackDanielsVW.png',
  vwOEM:        'https://res.cloudinary.com/dvq75cqna/image/upload/v1780071278/vw-funds/logos/VW-Logo.jpg',
  vwEmich:      'https://res.cloudinary.com/dvq75cqna/image/upload/v1780071272/vw-funds/logos/Emich.png',
  constellation:'https://res.cloudinary.com/dvq75cqna/image/upload/v1780071277/vw-funds/logos/Projects___Website_Campaigns/Brand_Logo/Constellation.png',
  rideNow:      'https://res.cloudinary.com/dvq75cqna/image/upload/v1780071277/vw-funds/logos/RideNow.png',
  rideNowOEM:   'https://res.cloudinary.com/dvq75cqna/image/upload/v1780073800/vw-funds/logos/RideNow-OEM2.png',
} as const;

function getClientLogo(clientId: string, userType: UserType) {
  if (clientId === 'ride-now') return userType === 'oem'
    ? { src: LOGO_URLS.rideNowOEM,  alt: 'RideNow Group',                    noPadding: true }
    : { src: LOGO_URLS.rideNow,     alt: 'RideNow Powersports Weatherford',  noPadding: true };
  if (clientId === 'audi') return userType === 'oem'
    ? { src: LOGO_URLS.audiOEM,     alt: 'Audi',                             noPadding: false }
    : { src: LOGO_URLS.audiPacific, alt: 'Audi Pacific',                     noPadding: false };
  if (userType === 'oem')          return { src: LOGO_URLS.vwOEM,        alt: 'Volkswagen',               noPadding: true };
  if (userType === 'dealer-emich') return { src: LOGO_URLS.vwEmich,      alt: 'Emich Volkswagen',         noPadding: false };
  if (userType === 'dealer')       return { src: LOGO_URLS.constellation, alt: 'Constellation',           noPadding: true };
  return                                  { src: LOGO_URLS.vwDealer,     alt: 'Jack Daniels Volkswagen',  noPadding: false };
}

function ClientLogo({ clientId, userType, onClick }: { clientId: string; userType: UserType; onClick?: () => void }) {
  const { src, alt, noPadding } = getClientLogo(clientId, userType);
  return (
    <ButtonBase
      onClick={onClick}
      title="Switch Client"
      sx={{
        width: 40, height: 40, borderRadius: '4px',
        bgcolor: noPadding ? 'transparent' : '#fff',
        px: noPadding ? 0 : '5px',
        overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
        '&:active': { transform: 'scale(0.95)' },
      }}
    >
      <Box component="img" src={src} alt={alt} sx={
        noPadding
          ? { width: '100%', height: '100%', objectFit: 'cover', display: 'block' }
          : { maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', display: 'block' }
      } />
    </ButtonBase>
  );
}

function RailHelpItem({ active, onClick }: { active?: boolean; onClick?: () => void }) {
  return (
    <ButtonBase
      onClick={onClick}
      sx={{
        width: '100%', height: 48, flexShrink: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px',
        '&:hover .pill': active ? undefined : { bgcolor: (t) => alpha(t.palette.rail.active, 0.1) },
      }}
    >
      <Box className="pill" sx={{
        width: 56, height: 32, borderRadius: 999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background-color 200ms',
        bgcolor: active ? 'rail.active' : 'transparent',
      }}>
        <Box component="img" src={svgHelp} alt="" sx={{ width: 24, height: 24, filter: RAIL_ICON_FILTER }} />
      </Box>
      <Typography sx={{ fontSize: '0.6875rem', letterSpacing: '0.4px', lineHeight: 1, color: 'rail.text' }}>
        Help
      </Typography>
    </ButtonBase>
  );
}

function getCurrentUserName(clientId: string, userType: UserType): string {
  if (clientId === 'ride-now') return userType === 'oem' ? 'Jenny Eckhart' : 'Rachel Hui';
  if (userType === 'oem')          return 'OEM Reviewer';
  if (userType === 'dealer-emich') return 'Katelyn Gray';
  if (userType === 'dealer-singular') return 'Zak Flaten';
  return 'Mallory Manning';
}

// ─────────────────────────────────────────────────────────────────────────────

export default function AppContent() {
  const { t } = useTranslation();
  const { client, switchClient } = useClient();
  const { workflow, approvePreApproval, requestPreApprovalRevision } = useWorkflow();
  const { lockDealership, unlockDealership } = useFilters();

  const {
    userAddedInfractions, deletedInfractionIds, caseSolutions,
    addInfraction, deleteInfraction, updateInfractionStatus,
    markSeenInfraction, submitCaseSolution, markCaseSolved,
    markOemSeenSolution, markOemSeenReported,
    addWcmComment, wcmComments,
    dealerInfractionNotifs, dealerInfractionUnread,
    dealerSubmittedNotifs, dealerSubmittedUnread,
    oemSolutionNotifs, oemSolutionUnread,
    oemReportedNotifs, oemReportedUnread,
    caseUpdates, addDealerCaseUpdate, markSeenCaseUpdate,
    dealerCaseUpdateNotifs, dealerCaseUpdateUnread,
  } = useCompliance();

  const routeParams = useParams<{ brand?: string; tab?: string }>();
  const location    = useLocation();
  const navigate    = useNavigate();

  // ── Derived init from URL ─────────────────────────────────────────────────
  const _initPath = location.pathname.toLowerCase();
  const _initRole: UserType = _initPath.includes('/dealership-singular/') ? 'dealer-singular'
    : _initPath.includes('/dealership-emich/')   ? 'dealer-emich'
    : _initPath.includes('/dealership/')         ? 'dealer' : 'oem';
  const _initTab     = SLUG_TO_TAB[routeParams.tab ?? ''] ?? 'overview';
  const _initSection = (_initTab === 'projects' || _initTab === 'portal' || _initTab === 'inventory') ? _initTab : 'campaigns';

  // ── State ─────────────────────────────────────────────────────────────────
  const [activeAppSection, setActiveAppSection] = useState(_initSection);
  const [activeTab,        setActiveTab]         = useState(_initSection === 'campaigns' ? _initTab : 'overview');
  const [userType,         setUserType]           = useState<UserType>(_initRole);
  const [dateRange,        setDateRange]           = useState<DateRange | undefined>(defaultDateRange);
  const [clientSwitcherOpen, setClientSwitcherOpen] = useState(false);
  const [isAgentPaneOpen,    setIsAgentPaneOpen]     = useState(false);
  const [isOEMDrawerOpen,    setIsOEMDrawerOpen]     = useState(false);
  const campaignPane = usePaneResize({ initialWidth: 716, min: 400, max: 960, side: 'right' });
  const plannerPane  = usePaneResize({ initialWidth: 440, min: 300, max: 700, side: 'right' });
  const [settingsAnchorEl,   setSettingsAnchorEl]    = useState<HTMLElement | null>(null);
  const [settingsSection,    setSettingsSection]     = useState<string | null>(null);
  const [notifOpenProjectId, setNotifOpenProjectId]  = useState<string | null>(null);

  // Pre-Approvals
  const [preApprovalSearchQuery, setPreApprovalSearchQuery] = useState('');
  const [selectedPreApprovalId,  setSelectedPreApprovalId]  = useState<string | null>(null);
  const selectedPreApproval = useSelectedPreApproval(selectedPreApprovalId);

  // Claims
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null);
  const selectedClaim = useSelectedClaim(selectedClaimId);

  // Planner
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [isAddingCampaign,   setIsAddingCampaign]   = useState(false);
  const [plannerCampaigns, setPlannerCampaigns] = useState<PlannerCampaign[]>(() =>
    PLANNER_INITIAL_CAMPAIGNS.map((c, i) => ({ ...c, assetCount: c.assets.length, color: GANTT_COLORS[i % GANTT_COLORS.length] })),
  );
  const selectedCampaign = useMemo(
    () => selectedCampaignId ? plannerCampaigns.find(c => c.id === selectedCampaignId) : null,
    [selectedCampaignId, plannerCampaigns],
  );

  const handleSavePlannerCampaign = (data: Partial<PlannerCampaign>) => {
    if (selectedCampaignId) {
      setPlannerCampaigns(prev => prev.map(c =>
        c.id === selectedCampaignId ? { ...c, ...data, assetCount: data.assets?.length ?? c.assetCount } as PlannerCampaign : c,
      ));
    } else {
      const assets = data.assets ?? [];
      setPlannerCampaigns(prev => [
        ...prev,
        {
          id: `campaign-${Date.now()}`,
          name: data.name || 'New Campaign',
          campaignGroup: data.campaignGroup || 'SUV Launch Campaigns',
          quarter: data.quarter || 'Q1',
          mediaType: data.mediaType || [],
          startDate: data.startDate || 'Mar 20, 2026',
          endDate: data.endDate || 'Apr 5, 2026',
          budget: data.budget || 0,
          thumbnail: data.thumbnail || PLANNER_INITIAL_CAMPAIGNS[0].thumbnail,
          color: GANTT_COLORS[prev.length % GANTT_COLORS.length],
          startDayIndex: 5,
          durationDays: 14,
          assetCount: assets.length,
          assets,
          status: 'Pending',
        },
      ]);
    }
    setIsAddingCampaign(false);
    setSelectedCampaignId(null);
  };

  // Web Monitoring
  const [selectedWebMonitoringId,    setSelectedWebMonitoringId]    = useState<string | null>(null);
  const [isWebMonitoringModalOpen,   setIsWebMonitoringModalOpen]   = useState(false);
  const [isWebMonitoringConfigOpen,  setIsWebMonitoringConfigOpen]  = useState(false);
  const [isCreatingInfraction,       setIsCreatingInfraction]       = useState(false);

  const selectedWCMItem = useMemo(() => {
    if (!selectedWebMonitoringId) return null;
    return userAddedInfractions.find(i => i.id === selectedWebMonitoringId)
        ?? WCM_DATA.find(i => i.id === selectedWebMonitoringId)
        ?? null;
  }, [selectedWebMonitoringId, userAddedInfractions]);

  // Comments context
  const [commentsContextId,   setCommentsContextId]   = useState('campaigns-main');
  const [commentsContextName, setCommentsContextName] = useState('');
  const [commentNotifs,       setCommentNotifs]       = useState<NotifItem[]>([]);
  const [commentUnreadCount,  setCommentUnreadCount]  = useState(0);
  const [pendingCommentNav,   setPendingCommentNav]   = useState<{ contextId: string; commentId?: string } | null>(null);
  const commentsContextIdRef = useRef(commentsContextId);
  commentsContextIdRef.current = commentsContextId;

  // ── Effects ───────────────────────────────────────────────────────────────

  // Sync CSS mode
  const cssMode = (userType === 'dealer-singular' || userType === 'dealer-emich' || userType === 'dealer-ridenow') ? 'dealer' : userType;
  useEffect(() => { document.documentElement.setAttribute('data-mode', cssMode); }, [cssMode]);

  const currentDealerIdentity = getDealerIdentity(userType);

  // URL → state sync on back/forward navigation
  useEffect(() => {
    const path      = location.pathname.toLowerCase();
    const role: UserType = path.includes('/dealership-singular/') ? 'dealer-singular'
      : path.includes('/dealership-emich/')  ? 'dealer-emich'
      : path.includes('/dealership/')        ? 'dealer' : 'oem';
    const tabId   = SLUG_TO_TAB[routeParams.tab ?? ''] ?? 'overview';
    const brandId = routeParams.brand?.toLowerCase() === 'audi' ? 'audi'
                  : routeParams.brand?.toLowerCase() === 'ride-now' ? 'ride-now' : 'vw';
    setUserType(role);
    if (tabId === 'projects' || tabId === 'portal' || tabId === 'inventory') {
      setActiveAppSection(tabId);
    } else {
      setActiveAppSection('campaigns');
      setActiveTab(tabId);
    }
    if (brandId !== client.clientId) switchClient(brandId);
    if (role === 'dealer-singular') lockDealership(WORKFLOW_DEALER.code);
    else unlockDealership();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // Deep-link: ?project=<id>
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const pid = params.get('project');
    if (pid) {
      setActiveAppSection('projects');
      setNotifOpenProjectId(pid);
      navigate(buildUrl(userType, client.clientId, 'projects'), { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (['input', 'textarea', 'select'].includes(tag)) return;
      if ((e.target as HTMLElement)?.isContentEditable) return;
      // ⇧A — toggle agent pane
      if (e.shiftKey && e.key === 'A') {
        e.preventDefault();
        setIsAgentPaneOpen(o => { if (!o) window.dispatchEvent(new CustomEvent('agent-opened')); return !o; });
        return;
      }
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === 'c') { window.dispatchEvent(new CustomEvent('toggle-comments-panel')); return; }
      if (e.key === 'e') {
        const nextTab = activeTab === 'guidelines' ? 'overview' : activeTab;
        unlockDealership(); setUserType('oem'); setActiveTab(nextTab);
        navigate(buildUrl('oem', client.clientId, nextTab), { replace: true });
        emitSnackbar(client.clientId === 'ride-now' ? 'RideNow OEM (e)' : 'OEM view (e)');
      }
      if (e.key === 'a') {
        unlockDealership(); setUserType('dealer');
        navigate(buildUrl('dealer', client.clientId, activeTab), { replace: true });
        emitSnackbar('Agency view (a)');
      }
      if (e.key === 'd') {
        if (client.clientId === 'ride-now') {
          unlockDealership(); setUserType('dealer-ridenow');
          navigate(buildUrl('dealer-singular', client.clientId, activeTab), { replace: true });
          emitSnackbar('RideNow Powersports Weatherford (d)');
        } else {
          lockDealership(WORKFLOW_DEALER.code); setUserType('dealer-singular');
          navigate(buildUrl('dealer-singular', client.clientId, activeTab), { replace: true });
          emitSnackbar('Jack Daniels Volkswagen (d)');
        }
      }
      if (e.key === 's') {
        unlockDealership(); setUserType('dealer-emich');
        navigate(buildUrl('dealer-emich', client.clientId, activeTab), { replace: true });
        emitSnackbar('Emich Volkswagen (s)');
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [activeTab, client.clientId, navigate, lockDealership, unlockDealership]);

  // Close agent when comments open
  useEffect(() => {
    const handler = () => setIsAgentPaneOpen(false);
    window.addEventListener('comments-opened', handler);
    return () => window.removeEventListener('comments-opened', handler);
  }, []);

  // Comment notifications
  useEffect(() => {
    const handler = (e: Event) => {
      const d = (e as CustomEvent).detail as { notifs: NotifItem[]; unreadCount: number };
      setCommentNotifs(d.notifs);
      setCommentUnreadCount(d.unreadCount);
    };
    window.addEventListener('comment-notifs-changed', handler);
    return () => window.removeEventListener('comment-notifs-changed', handler);
  }, []);

  // Sync comments context id to section/tab
  useEffect(() => {
    setCommentsContextId(`${activeAppSection}-${activeTab || 'main'}`);
    setCommentsContextName('');
  }, [activeAppSection, activeTab]);

  // Fire comment-open-to once context matches pending nav
  useEffect(() => {
    if (!pendingCommentNav || commentsContextId !== pendingCommentNav.contextId) return;
    const delays = [200, 600, 1200];
    const timers = delays.map((delay, i) => setTimeout(() => {
      window.dispatchEvent(new CustomEvent('comment-open-to', { detail: { contextId: pendingCommentNav.contextId, commentId: pendingCommentNav.commentId } }));
      if (i === delays.length - 1) setPendingCommentNav(null);
    }, delay));
    return () => timers.forEach(clearTimeout);
  }, [commentsContextId, pendingCommentNav]);

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    if (tabId !== 'pre-approvals')  setSelectedPreApprovalId(null);
    if (tabId !== 'claims')         setSelectedClaimId(null);
    if (tabId !== 'planner')        setSelectedCampaignId(null);
    if (tabId !== 'web-monitoring') { setSelectedWebMonitoringId(null); setIsCreatingInfraction(false); }
    navigate(buildUrl(userType, client.clientId, tabId), { replace: true });
  };

  const handleNavigate = (route: string) => {
    setActiveAppSection(route);
    setSettingsSection(null);
    if (route === 'projects' || route === 'portal' || route === 'inventory') {
      navigate(buildUrl(userType, client.clientId, route), { replace: true });
    } else {
      navigate(buildUrl(userType, client.clientId, activeTab), { replace: true });
    }
  };

  const handlePortalPreApproval = () => {
    setActiveAppSection('campaigns');
    setActiveTab('pre-approvals');
    navigate(buildUrl(userType, client.clientId, 'pre-approvals'), { replace: true });
  };

  const handleCreateClaim = useCallback(() => {
    setActiveTab('claims');
    setSelectedPreApprovalId(null);
    setSelectedClaimId(workflow.claim.id);
    navigate(buildUrl(userType, client.clientId, 'claims'), { replace: true });
  }, [workflow.claim.id, userType, client.clientId, navigate]);

  const handleProjectChange = useCallback((id: string | null, name: string) => {
    if (id) { setCommentsContextId(id); setCommentsContextName(name); }
    else    { setCommentsContextId('projects-main'); setCommentsContextName(''); }
  }, []);

  const handleCommentNotifNavigate = useCallback((notif: NotifItem) => {
    const targetCtxId = notif.projectId;
    if (targetCtxId === commentsContextIdRef.current) {
      window.dispatchEvent(new CustomEvent('comment-open-to', { detail: { contextId: targetCtxId, commentId: notif.targetCommentId } }));
      return;
    }
    setPendingCommentNav({ contextId: targetCtxId, commentId: notif.targetCommentId });
    const SECTION_TABS: Record<string, string> = { campaigns: 'overview', portal: 'portal', inventory: 'inventory' };
    const dashIdx   = targetCtxId.indexOf('-');
    const sectionKey = dashIdx !== -1 ? targetCtxId.slice(0, dashIdx) : '';
    const tabPart   = dashIdx !== -1 ? targetCtxId.slice(dashIdx + 1) : '';
    if (sectionKey in SECTION_TABS) {
      const tab = (tabPart && tabPart !== 'main') ? tabPart : SECTION_TABS[sectionKey];
      setActiveAppSection(sectionKey); setActiveTab(tab);
      navigate(buildUrl(userType, client.clientId, sectionKey === 'campaigns' ? tab : sectionKey), { replace: true });
    } else if (targetCtxId === 'projects-main') {
      setActiveAppSection('projects');
      navigate(buildUrl(userType, client.clientId, 'projects'), { replace: true });
    } else {
      setActiveAppSection('projects'); setNotifOpenProjectId(targetCtxId);
      navigate(buildUrl(userType, client.clientId, 'projects'), { replace: true });
    }
  }, [userType, client.clientId, navigate]);

  // ── Derived ───────────────────────────────────────────────────────────────

  const showLanguageToggle = activeAppSection === 'campaigns';

  const translatedTabs = useMemo(() =>
    (userType !== 'oem' ? DEALER_TABS : OEM_TABS).map(tab => ({
      ...tab, label: showLanguageToggle ? t(tab.label) : tab.label,
    })),
    [t, showLanguageToggle, userType],
  );

  const translatedNavItems = useMemo(() => NAV_ITEMS.map(item => ({ ...item, label: t(item.label) })), [t]);

  const currentUserName = getCurrentUserName(client.clientId, userType);
  // Normalize extended variants to their base for components with narrower prop types
  const dealerUserType = (userType === 'dealer-emich' || userType === 'dealer-ridenow') ? 'dealer' : userType as 'oem' | 'dealer' | 'dealer-singular';

  const currentUserId = ({
    'ride-now:oem':            'jenny-eckhart',
    'ride-now:dealer-ridenow': 'rachel-hui',
    'vw:dealer':               'mallory-manning',
    'vw:dealer-emich':         'katelyn-gray',
    'vw:oem':                  'jenny-eckhart',
    'vw:dealer-singular':      'zak-flaten',
    'audi:dealer':             'mallory-manning',
    'audi:oem':                'jenny-eckhart',
  } as Record<string, string>)[`${client.clientId}:${userType}`]
    ?? (client.clientId === 'ride-now' ? 'rachel-hui' : 'jorge-verlindo');

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden', bgcolor: 'surface.topbar' }} data-mode={cssMode}>

      {/* ── Left rail ── */}
      <AppSidebar
        items={translatedNavItems}
        activeId={activeAppSection}
        onSelect={handleNavigate}
        logo={
          <ClientLogo
            clientId={client.clientId}
            userType={userType}
            onClick={() => setClientSwitcherOpen(true)}
          />
        }
        footer={<RailHelpItem active={activeAppSection === 'help'} />}
      />

      {/* ── Right column ── */}
      <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        {/* CommentsProvider wraps TopBar too so CommentsButton has context */}
        <CommentsProvider contextId={commentsContextId} contextName={commentsContextName} currentUserId={currentUserId}>
        <TopBar
          title={<ConstellationLogo />}
          actions={
            <>
              <LanguageToggleButton active={showLanguageToggle} />
              <Tooltip title="AI Agent (⇧A)">
                <IconButton
                  aria-label="AI Agent"
                  onClick={() => setIsAgentPaneOpen(o => { if (!o) window.dispatchEvent(new CustomEvent('agent-opened')); return !o; })}
                  sx={isAgentPaneOpen ? { bgcolor: (t) => alpha(t.palette.brand.accent, 0.1), color: 'brand.accent' } : undefined}
                >
                  <ConstellationAIIcon />
                </IconButton>
              </Tooltip>

              {/* Comments button — wired via CommentsProvider context below */}
              <CommentsButton />

              <Tooltip title="Notifications">
                <IconButton aria-label="Notifications">
                  <Badge badgeContent={commentUnreadCount || undefined} color="primary" max={99} sx={{ '& .MuiBadge-badge': { fontSize: '0.625rem', minWidth: 16, height: 16 } }}>
                    <NotificationsNoneOutlinedIcon fontSize="small" />
                  </Badge>
                </IconButton>
              </Tooltip>
              <Tooltip title="Settings">
                <IconButton
                  aria-label="Settings"
                  onClick={(e) => setSettingsAnchorEl(e.currentTarget as HTMLElement)}
                  sx={settingsSection ? { bgcolor: (t) => alpha(t.palette.brand.accent, 0.1), color: 'brand.accent' } : undefined}
                >
                  <SettingsOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Menu
                anchorEl={settingsAnchorEl}
                open={Boolean(settingsAnchorEl)}
                onClose={() => setSettingsAnchorEl(null)}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                slotProps={{ paper: { sx: { mt: 0.5, minWidth: 220 } } }}
              >
                {[
                  { id: 'global-ai-configs',       label: 'Global AI Configs' },
                  { id: 'accounts',                 label: 'Accounts' },
                  { id: 'ad-shell-configurations',  label: 'Ad Shell Configurations' },
                  { id: 'brand-kits',               label: 'Brand Kits' },
                  { id: 'billing',                  label: 'Billing' },
                  { id: 'dashboards',               label: 'Dashboards' },
                  { id: 'features',                 label: 'Features' },
                  { id: 'fields',                   label: 'Fields' },
                  { id: 'integrations',             label: 'Integrations' },
                  { id: 'prompts',                  label: 'Prompts' },
                  { id: 'tags',                     label: 'Tags' },
                  { id: 'users',                    label: 'Users' },
                  { id: 'settings',                 label: 'Settings' },
                ].map(item => (
                  <MenuItem
                    key={item.id}
                    selected={settingsSection === item.id}
                    onClick={() => { setSettingsSection(item.id); setSettingsAnchorEl(null); }}
                    sx={{ fontSize: '0.875rem' }}
                  >
                    {item.label}
                  </MenuItem>
                ))}
              </Menu>
              <Avatar name={currentUserName} colorFromName sx={{ ml: 1, cursor: 'pointer' }} />
            </>
          }
        >
          <Box sx={{ maxWidth: 560, mx: 'auto' }}>
            <SearchInput fullWidth placeholder={t('Search anything')} />
          </Box>
        </TopBar>

        {/* ── Modals / overlays rendered at top level ── */}
        <ClientSwitcher
          isOpen={clientSwitcherOpen}
          onClose={() => setClientSwitcherOpen(false)}
          currentClientId={client.clientId}
          onSelect={(id) => {
            switchClient(id);
            setClientSwitcherOpen(false);
            navigate(buildUrl(userType, id, activeTab), { replace: true });
          }}
        />

        {/* ── Main content ── */}
          <Box
            component="main"
            sx={{ flex: 1, minHeight: 0, display: 'flex', overflow: 'hidden',
              ...(activeAppSection === 'portal' ? { pt: '8px', pl: 3, pr: 3, pb: 0, gap: '16px' } : { p: 3, gap: 3 }) }}
          >
            {/* ── PORTAL SECTION — full-bleed, no MainPane wrapper ── */}
            {activeAppSection === 'portal' && (
              <Suspense fallback={<Box sx={{ p: 4, color: 'text.secondary', fontSize: '0.875rem' }}>Loading…</Box>}>
                <PortalContent onPreApproval={handlePortalPreApproval} />
              </Suspense>
            )}

            {/* ── Client Settings overlay (Ride Now OEM) ── */}
            {activeAppSection !== 'portal' && settingsSection && client.clientId === 'ride-now' && userType === 'oem' && (
              <ClientSettingsContent initialSection={settingsSection} />
            )}

            {/* ── Main pane (non-portal sections) ── */}
            {activeAppSection !== 'portal' && <MainPane style={settingsSection && client.clientId === 'ride-now' && userType === 'oem' ? { display: 'none' } : undefined}>
              {/* CAMPAIGNS SECTION */}
              {activeAppSection === 'campaigns' && (
                <>
                  {/* Header */}
                  <Box sx={{ flexShrink: 0, px: 3, pt: 2, pb: 0 }}>
                    <Box sx={{ mb: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <BreadcrumbBar
                        items={[{ label: showLanguageToggle ? t('Campaigns') : 'Campaigns' }, { label: showLanguageToggle ? t('Funds') : 'Funds' }]}
                        activeLabel={translatedTabs.find(tab => tab.id === activeTab)?.label ?? activeTab}
                      />
                      <CommentsButton />
                    </Box>
                    <Typography sx={{ mb: 2, fontSize: 20, fontWeight: 500, letterSpacing: '0.15px', lineHeight: '24px' }}>
                      {showLanguageToggle ? t('Funds') : 'Funds'}
                    </Typography>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                      <Tabs
                        value={activeTab}
                        onChange={(_e, v: string) => handleTabChange(v)}
                        variant="scrollable"
                        scrollButtons={false}
                        sx={{ minHeight: 40, '& .MuiTab-root': { minHeight: 40, textTransform: 'none' } }}
                      >
                        {translatedTabs.map(tab => (
                          <Tab key={tab.id} value={tab.id} label={tab.label} />
                        ))}
                      </Tabs>
                    </Box>
                  </Box>

                  {/* Tab content */}
                  <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
                    {activeTab === 'overview' && (
                      <Box sx={{ p: 3 }}>
                        {userType !== 'oem' ? (
                          <FundsOverviewContent userType={userType} />
                        ) : (
                          <FundsOverviewOEMContent />
                        )}
                      </Box>
                    )}

                    {activeTab === 'pre-approvals' && (
                      <FundsPreApprovalsContent
                        dateRange={dateRange}
                        onDateRangeChange={setDateRange}
                        searchQuery={preApprovalSearchQuery}
                        onSearchQueryChange={setPreApprovalSearchQuery}
                        selectedPreApprovalId={selectedPreApprovalId}
                        onSelectPreApproval={setSelectedPreApprovalId}
                        userType={dealerUserType}
                      />
                    )}

                    {activeTab === 'claims' && (
                      <FundsClaimsContent
                        dateRange={dateRange}
                        onDateRangeChange={setDateRange}
                        selectedClaimId={selectedClaimId}
                        onSelectClaim={setSelectedClaimId}
                        userType={dealerUserType}
                      />
                    )}

                    {activeTab === 'cases' && (
                      <CasesTab dateRange={dateRange} onDateRangeChange={setDateRange} />
                    )}

                    {activeTab === 'planner' && (
                      <PlannerContent
                        selectedCampaignId={selectedCampaignId}
                        onSelectCampaign={(id) => { setSelectedCampaignId(id); if (id) setIsAddingCampaign(false); }}
                        onNewCampaign={() => { setSelectedCampaignId(null); setIsAddingCampaign(true); }}
                        dateRange={dateRange}
                        onDateRangeChange={setDateRange}
                        campaigns={plannerCampaigns}
                        onCampaignsChange={setPlannerCampaigns}
                      />
                    )}

                    {activeTab === 'guidelines' && <GuidelinesContent />}

                    {activeTab === 'web-monitoring' && (
                      <WebMonitoringContent
                        selectedId={selectedWebMonitoringId}
                        onSelectItem={(id) => { setSelectedWebMonitoringId(id); setIsCreatingInfraction(false); }}
                        dateRange={dateRange}
                        onDateRangeChange={setDateRange}
                        dealershipFilter={userType !== 'oem' ? currentDealerIdentity.dealership : undefined}
                        reportedByFilter={userType !== 'oem' ? currentDealerIdentity.userName : undefined}
                        userType={dealerUserType}
                        userAddedInfractions={userAddedInfractions}
                        onAddInfraction={() => { setSelectedWebMonitoringId(null); setIsCreatingInfraction(true); }}
                        onOpenWebMonitoringConfig={userType === 'oem' ? () => setIsWebMonitoringConfigOpen(true) : undefined}
                        caseSolutions={caseSolutions}
                        deletedInfractionIds={deletedInfractionIds}
                        onDeleteInfraction={(id) => { deleteInfraction(id); setSelectedWebMonitoringId(p => p === id ? null : p); }}
                        onReopenInfraction={(id) => updateInfractionStatus(id, 'Open')}
                      />
                    )}
                  </Box>
                </>
              )}

              {/* PROJECTS SECTION */}
              {activeAppSection === 'projects' && (
                <Box sx={{ height: '100%', overflow: 'hidden' }}>
                  <Suspense fallback={<Box sx={{ p: 4, color: 'text.secondary', fontSize: '0.875rem' }}>Loading…</Box>}>
                    <ProjectsModule openProjectId={notifOpenProjectId} onProjectChange={handleProjectChange} />
                  </Suspense>
                </Box>
              )}

              {/* INVENTORY SECTION */}
              {activeAppSection === 'inventory' && client.clientId === 'ride-now' && (
                <Suspense fallback={<Box sx={{ p: 4, color: 'text.secondary', fontSize: '0.875rem' }}>Loading…</Box>}>
                  <InventoryContent isAgentPaneOpen={isAgentPaneOpen} />
                </Suspense>
              )}

              {/* PLACEHOLDER SECTIONS */}
              {Object.keys(SECTION_LABELS).includes(activeAppSection) && (
                <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 6 }}>
                  <Typography sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                    {SECTION_LABELS[activeAppSection]} — coming soon
                  </Typography>
                </Box>
              )}
            </MainPane>}

            {/* ── Right panels (Campaigns section) ── */}
            {activeAppSection === 'campaigns' && (
              <>
                {activeTab === 'pre-approvals' && selectedPreApproval && (
                  <Box sx={{ flexShrink: 0, height: '100%', overflow: 'hidden', width: campaignPane.width, display: 'flex' }}>
                    <PaneResizer onMouseDown={campaignPane.handleResizeStart} isDragging={campaignPane.isDragging} />
                    <RightPane>
                      <PreApprovalPanel
                        preApproval={selectedPreApproval}
                        onClose={() => setSelectedPreApprovalId(null)}
                        userType={dealerUserType}
                        onCreateClaim={handleCreateClaim}
                        onOpenAIReview={() => setIsOEMDrawerOpen(true)}
                      />
                    </RightPane>
                  </Box>
                )}

                {activeTab === 'claims' && selectedClaim && (
                  <Box sx={{ flexShrink: 0, height: '100%', overflow: 'hidden', width: campaignPane.width, display: 'flex' }}>
                    <PaneResizer onMouseDown={campaignPane.handleResizeStart} isDragging={campaignPane.isDragging} />
                    <RightPane>
                      <ClaimsPanel
                        claim={selectedClaim}
                        onClose={() => setSelectedClaimId(null)}
                        userType={dealerUserType}
                      />
                    </RightPane>
                  </Box>
                )}

                {activeTab === 'planner' && (selectedCampaign || isAddingCampaign) && (
                  <Box sx={{ flexShrink: 0, height: '100%', overflow: 'hidden', width: plannerPane.width, display: 'flex' }}>
                    <PaneResizer onMouseDown={plannerPane.handleResizeStart} isDragging={plannerPane.isDragging} />
                    <RightPane>
                      <PlannerPanel
                        campaign={selectedCampaign}
                        onClose={() => { setSelectedCampaignId(null); setIsAddingCampaign(false); }}
                        onSave={handleSavePlannerCampaign}
                      />
                    </RightPane>
                  </Box>
                )}

                {activeTab === 'web-monitoring' && selectedWCMItem && !isCreatingInfraction && (
                  <Box sx={{ flexShrink: 0, height: '100%', overflow: 'hidden', width: campaignPane.width, display: 'flex' }}>
                    <PaneResizer onMouseDown={campaignPane.handleResizeStart} isDragging={campaignPane.isDragging} />
                    <RightPane>
                      <WebMonitoringPanel
                        item={selectedWCMItem}
                        onClose={() => setSelectedWebMonitoringId(null)}
                        onOpenModal={() => setIsWebMonitoringModalOpen(true)}
                        userType={dealerUserType}
                        currentDealerName={currentDealerIdentity.dealership}
                        solution={caseSolutions[selectedWCMItem.id]}
                        onSubmitSolution={(draft) => submitCaseSolution(selectedWCMItem.id, draft, currentDealerIdentity.userName)}
                        onMarkSolved={() => {
                          markCaseSolved(selectedWCMItem.id);
                          if (userType === 'oem' && selectedWCMItem.dealership)
                            addDealerCaseUpdate(selectedWCMItem.id, `Compliance case resolved · ${selectedWCMItem.violationType ?? 'Infraction'}`, selectedWCMItem.dealership);
                        }}
                        onAcceptReport={() => {
                          updateInfractionStatus(selectedWCMItem.id, 'Open');
                          if (userType === 'oem' && selectedWCMItem.dealership)
                            addDealerCaseUpdate(selectedWCMItem.id, `A compliance infraction was accepted against your dealership · ${selectedWCMItem.violationType ?? 'Compliance case'}`, selectedWCMItem.dealership);
                        }}
                        wcmComments={wcmComments[selectedWCMItem.id] ?? []}
                        onAddComment={(text) => {
                          addWcmComment(selectedWCMItem.id, text, userType === 'oem' ? 'OEM' : currentDealerIdentity.userName, userType === 'oem' ? 'oem' : 'dealer');
                          if (userType === 'oem' && selectedWCMItem.dealership)
                            addDealerCaseUpdate(selectedWCMItem.id, 'OEM added a note on your compliance case', selectedWCMItem.dealership);
                        }}
                        currentUserName={userType === 'oem' ? 'OEM' : currentDealerIdentity.userName}
                      />
                    </RightPane>
                  </Box>
                )}

                {activeTab === 'web-monitoring' && isCreatingInfraction && (
                  <Box sx={{ flexShrink: 0, height: '100%', overflow: 'hidden', width: campaignPane.width, display: 'flex' }}>
                    <PaneResizer onMouseDown={campaignPane.handleResizeStart} isDragging={campaignPane.isDragging} />
                    <RightPane>
                      <WebMonitoringPanel
                        mode="create"
                        userType={dealerUserType}
                        currentDealerName={currentDealerIdentity.dealership}
                        currentReporterName={currentDealerIdentity.userName}
                        onClose={() => setIsCreatingInfraction(false)}
                        onSave={(infraction) => {
                          addInfraction(infraction);
                          setIsCreatingInfraction(false);
                          emitSnackbar(`Infraction ${infraction.id} added`);
                        }}
                      />
                    </RightPane>
                  </Box>
                )}
              </>
            )}

            {/* ── Agent pane — projects gets dedicated one ── */}
            {activeAppSection === 'projects' && (
              <ProjectAgentPane
                isOpen={isAgentPaneOpen}
                onClose={() => setIsAgentPaneOpen(false)}
                userType={userType}
                activeUserName={currentDealerIdentity.userName}
              />
            )}
            {activeAppSection !== 'projects' && (
              <AgentPane
                isOpen={isAgentPaneOpen}
                onClose={() => setIsAgentPaneOpen(false)}
                accountName={userType === 'dealer' ? 'Honda of Anywhere' : undefined}
              />
            )}

            {/* ── Comments side panel ── */}
            <CommentsSidePanel />
          </Box>
        </CommentsProvider>
      </Box>

      {/* ── Full-screen drawers / modals ── */}
      <DrawerOEM
        open={isOEMDrawerOpen}
        onClose={() => setIsOEMDrawerOpen(false)}
        preApproval={selectedPreApproval ?? undefined}
        onApprove={(comment) => { approvePreApproval(comment.trim() || undefined); setIsOEMDrawerOpen(false); setSelectedPreApprovalId(null); }}
        onRequestRevision={(comment) => { requestPreApprovalRevision(comment.trim()); setIsOEMDrawerOpen(false); setSelectedPreApprovalId(null); }}
      />

      <WebMonitoringConfigModal
        open={isWebMonitoringConfigOpen}
        onClose={() => setIsWebMonitoringConfigOpen(false)}
      />

      {isWebMonitoringModalOpen && selectedWCMItem && (
        <WebMonitoringModal
          item={selectedWCMItem}
          open={isWebMonitoringModalOpen}
          onClose={() => setIsWebMonitoringModalOpen(false)}
        />
      )}
    </Box>
  );
}
