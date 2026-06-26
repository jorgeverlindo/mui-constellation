// ─── InventoryContent ─────────────────────────────────────────────────────────
// Ported from vw-funds-2. Sub-components (VehicleInventoryGrid, VehicleCardGrid,
// VehicleCardList, VehicleTableCondensed) are stubs — see each file.
// AI pipeline (replicateClient, dealerBackgroundGenerator) is preserved via
// InventoryContext and the VinDetailContent sub-component.
// TODO: port full VehicleInventoryGrid implementation from vw-funds-2.
import React, { useState, useCallback, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import InputBase from '@mui/material/InputBase';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import SearchIcon from '@mui/icons-material/Search';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import FilterListIcon from '@mui/icons-material/FilterList';
import GridViewIcon from '@mui/icons-material/GridView';
import TableRowsIcon from '@mui/icons-material/TableRows';
import BarChartIcon from '@mui/icons-material/BarChart';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import { useNavigate, useParams, useLocation } from 'react-router';
import { BreadcrumbBar } from '../BreadcrumbBar';
import { CommentsButton, useComments } from '../comments';
import { useClient } from '../../contexts/ClientContext';
import { useInventory } from '../../contexts/InventoryContext';
import { buildVinSlug, extractVinFromSlug } from '../../utils/routing';
import { STORAGE_KEYS } from '../../constants/storageKeys';
import { VEHICLE_INVENTORY } from '../../../data/inventory/vehicleInventory';
import type { SyndicationStatus, AIGenerationStatus } from '../../../data/inventory/vehicleInventory';
import { VehicleInventoryGrid } from './VehicleInventoryGrid';
import { VehicleCardGrid } from './VehicleCardGrid';
import { VehicleCardList } from './VehicleCardList';
import { VehicleTableCondensed } from './VehicleTableCondensed';
import { VinDetailContent } from './VinDetailContent';
import { AnglePreviewModal } from './AnglePreviewModal';
import { ANGLES } from './AngleBar';
import type { AngleKey } from '../../../data/inventory/types';

const ANGLE_KEYS: AngleKey[] = ['34l', 'front', '34r', 'right', 'left', 'rear'];
const emptyStateSrc = 'https://res.cloudinary.com/dvq75cqna/image/upload/v1780071197/vw-funds/inventory/empty-state.svg';

// Channel logos
const metaLogo = 'https://res.cloudinary.com/dvq75cqna/image/upload/v1780071126/vw-funds/channels/Brand_Logo/Meta.svg';
const googleLogo = 'https://res.cloudinary.com/dvq75cqna/image/upload/v1780071130/vw-funds/channels/google.png';
const vinIqLogo = 'https://res.cloudinary.com/dvq75cqna/image/upload/v1780071287/vw-funds/logos/channels/Yamaha_VIN_List/VinIQ.svg';
const aiEnabledLogo = 'https://res.cloudinary.com/dvq75cqna/image/upload/v1780071281/vw-funds/logos/channels/Yamaha_VIN_List/AI_enabled.svg';
const optymizrLogo = 'https://res.cloudinary.com/dvq75cqna/image/upload/v1780071286/vw-funds/logos/channels/Yamaha_VIN_List/Optymizr.png';
const fluencyLogo = 'https://res.cloudinary.com/dvq75cqna/image/upload/v1780071289/vw-funds/logos/channels/Yamaha_VIN_List/fluency.png';
const chainLinkIcon = 'https://res.cloudinary.com/dvq75cqna/image/upload/v1780071178/vw-funds/icons/Yamaha_VIN_List/Card___Row/Main_Pane_Header_2_0/chain-link-3_url.svg';
const filtersIcon = 'https://res.cloudinary.com/dvq75cqna/image/upload/v1780071149/vw-funds/icons/Filters.svg';

type ViewMode = 'table-large' | 'vertical-cards' | 'horizontal-cards' | 'table-small';

const VIEW_CYCLE: ViewMode[] = ['table-large', 'vertical-cards', 'horizontal-cards', 'table-small'];

interface ChannelItem { id: string; label: string; enabled: boolean; hasError?: boolean; icon: React.ReactNode; }

export function InventoryContent({ isAgentPaneOpen = false }: { isAgentPaneOpen?: boolean }) {
  const { client } = useClient();
  const commentsCtxTop = useComments();
  const isPanelOpen = commentsCtxTop?.isPanelOpen ?? false;
  const { vehicles: inventoryVehicles } = useInventory();
  const navigate  = useNavigate();
  const location  = useLocation();
  const { vinSlug } = useParams<{ vinSlug?: string }>();
  const hideChannelLabels = isPanelOpen || isAgentPaneOpen;

  const [viewMode, setViewMode] = useState<ViewMode>('table-large');
  const cycleView = useCallback(() => {
    setViewMode(prev => VIEW_CYCLE[(VIEW_CYCLE.indexOf(prev) + 1) % VIEW_CYCLE.length]);
  }, []);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState(2); // 0=insights, 1=conquest, 2=vehicles
  const [selectedVinId, setSelectedVinId] = useState<string | null>(() => {
    if (!vinSlug) return null;
    const vin = extractVinFromSlug(vinSlug);
    return VEHICLE_INVENTORY.find(r => r.vin.toUpperCase() === vin)?.id ?? null;
  });
  const [syndicationOverrides, setSyndicationOverrides] = useState<Map<string, SyndicationStatus>>(new Map());
  const [aiGenerationOverrides, setAiGenerationOverrides] = useState<Map<string, AIGenerationStatus>>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.AI_GENERATION_OVERRIDES);
      const obj: Record<string, AIGenerationStatus> = raw ? JSON.parse(raw) : {};
      return new Map(Object.entries(obj));
    } catch { return new Map(); }
  });
  const [sourceImagesVinId, setSourceImagesVinId] = useState<string | null>(null);
  const [sourceImagesAngleIdx, setSourceImagesAngleIdx] = useState(0);

  useEffect(() => {
    if (!vinSlug) { setSelectedVinId(null); return; }
    const vin = extractVinFromSlug(vinSlug);
    const record = VEHICLE_INVENTORY.find(r => r.vin.toUpperCase() === vin);
    setSelectedVinId(record?.id ?? null);
  }, [vinSlug]);

  const baseInventoryPath = vinSlug
    ? location.pathname.slice(0, location.pathname.lastIndexOf('/' + vinSlug))
    : location.pathname;

  const handleVinClick = useCallback((id: string) => {
    const record = inventoryVehicles.find(r => r.id === id);
    if (!record) return;
    const slug = buildVinSlug(record.make, record.model, record.trim, record.exteriorColor, record.vin);
    setSelectedVinId(id);
    navigate(`${baseInventoryPath}/${slug}`);
  }, [baseInventoryPath, navigate, inventoryVehicles]);

  const handleVinBack = useCallback(() => {
    setSelectedVinId(null);
    navigate(baseInventoryPath);
  }, [baseInventoryPath, navigate]);

  const handleViewSourceImages = useCallback((id: string) => {
    setSourceImagesAngleIdx(0);
    setSourceImagesVinId(id);
  }, []);

  const handleSyndicationToggle = useCallback((id: string) => {
    setSyndicationOverrides(prev => {
      const base = inventoryVehicles.find(r => r.id === id)!.syndication;
      const current = prev.get(id) ?? base;
      const next = new Map(prev);
      next.set(id, current === 'syndicated' ? 'not-syndicated' : 'syndicated');
      return next;
    });
  }, [inventoryVehicles]);

  const handleAttachComment = useCallback((id: string) => {
    const record = inventoryVehicles.find(r => r.id === id);
    if (!record || !commentsCtxTop) return;
    commentsCtxTop.openPanelForEntity({
      id: record.vin,
      label: `${record.year} ${record.make} ${record.model} ${record.trim} — ${record.vin}`,
      type: 'vehicle',
    });
  }, [commentsCtxTop, inventoryVehicles]);

  const handleAiGenerationToggle = useCallback((id: string) => {
    setAiGenerationOverrides(prev => {
      const base = inventoryVehicles.find(r => r.id === id)!.aiGeneration;
      const current = prev.get(id) ?? base;
      const next = new Map(prev);
      next.set(id, current === 'enabled' ? 'disabled' : 'enabled');
      try {
        const obj = Object.fromEntries(next.entries());
        localStorage.setItem(STORAGE_KEYS.AI_GENERATION_OVERRIDES, JSON.stringify(obj));
      } catch { /* quota exceeded */ }
      return next;
    });
  }, [inventoryVehicles]);

  const records = inventoryVehicles
    .filter(r => {
      if (!search) return true;
      const q = search.toLowerCase();
      const qNum = q.replace(/[.,]/g, '');
      return (
        r.vin.toLowerCase().includes(q) || r.make.toLowerCase().includes(q) ||
        r.model.toLowerCase().includes(q) || r.trim.toLowerCase().includes(q) ||
        r.exteriorColor.toLowerCase().includes(q) || r.condition.toLowerCase().includes(q) ||
        r.vehicleStatus.toLowerCase().includes(q) || r.year.toString().includes(qNum) ||
        r.price.toString().includes(qNum) || r.dol.toString().includes(qNum)
      );
    })
    .map(r => ({
      ...r,
      ...(syndicationOverrides.has(r.id) && { syndication: syndicationOverrides.get(r.id)! }),
      ...(aiGenerationOverrides.has(r.id) && { aiGeneration: aiGenerationOverrides.get(r.id)! }),
    }));

  const handleToggleRow = (id: string, checked: boolean) => {
    setSelected(prev => { const next = new Set(prev); checked ? next.add(id) : next.delete(id); return next; });
  };
  const handleToggleAll = (checked: boolean) => {
    setSelected(checked ? new Set(records.map(r => r.id)) : new Set());
  };

  const CHANNELS: ChannelItem[] = [
    { id: 'ai-gen',     label: 'AI Generation', enabled: true,  icon: <Box component="img" src={aiEnabledLogo} sx={{ width: 18, height: 18, objectFit: 'contain' }} /> },
    { id: 'vin-iq',     label: 'VIN IQ',        enabled: true,  icon: <Box component="img" src={vinIqLogo}     sx={{ width: 18, height: 18, objectFit: 'contain' }} /> },
    { id: 'meta',       label: 'Meta',           enabled: true,  hasError: true, icon: <Box component="img" src={metaLogo} sx={{ width: 18, height: 18, objectFit: 'contain' }} /> },
    { id: 'google-ads', label: 'Google Ads',     enabled: false, icon: <Box component="img" src={googleLogo}   sx={{ width: 18, height: 18, objectFit: 'contain' }} /> },
    { id: 'optymizr',   label: 'Optymyzr',       enabled: false, icon: <Box component="img" src={optymizrLogo} sx={{ width: 18, height: 18, objectFit: 'contain' }} /> },
    { id: 'fluency',    label: 'Fluency',         enabled: true,  icon: <Box component="img" src={fluencyLogo}  sx={{ width: 18, height: 18, objectFit: 'contain' }} /> },
  ];

  // VIN detail — replace entire content
  if (selectedVinId) {
    const record = inventoryVehicles.find(r => r.id === selectedVinId);
    if (record) {
      return (
        <VinDetailContent
          record={record}
          onBack={handleVinBack}
          variant={client.clientId === 'ride-now' ? 'sport' : 'auto'}
        />
      );
    }
  }

  const ViewIcon = () => {
    switch (viewMode) {
      case 'table-large':      return <GridViewIcon sx={{ fontSize: 20 }} />;
      case 'vertical-cards':   return <TableRowsIcon sx={{ fontSize: 20 }} />;
      case 'horizontal-cards': return <TableRowsIcon sx={{ fontSize: 18 }} />;
      case 'table-small':      return <GridViewIcon sx={{ fontSize: 18 }} />;
    }
  };

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
      {/* Header area */}
      <Box sx={{ flexShrink: 0, px: 3, pt: 2, pb: 0 }}>
        {/* Breadcrumb + Comments */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
          <BreadcrumbBar
            items={[
              { label: 'Inventory' },
              { label: 'Accounts' },
              { label: 'RideNow Powersports Weatherford' },
            ]}
            activeLabel="Vehicles"
          />
          <CommentsButton />
        </Box>

        {/* Page title */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pb: 0.25, pt: 0.5 }}>
          <Box sx={{ color: 'rgba(17,16,20,0.56)', display: 'flex', alignItems: 'center' }}>
            <svg width="16" height="13" viewBox="6 8 18 14" fill="none">
              <path d="M7.29102 9.79183C7.29102 9.33159 7.66411 8.9585 8.12435 8.9585H21.8743C22.3346 8.9585 22.7077 9.33159 22.7077 9.79183V20.2085C22.7077 20.6687 22.3346 21.0418 21.8743 21.0418H8.12435C7.66411 21.0418 7.29102 20.6687 7.29102 20.2085V9.79183Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
              <path d="M11.875 9.1665V14.9998V20.8332" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
            </svg>
          </Box>
          <Typography sx={{ fontWeight: 500, fontSize: 16, letterSpacing: '0.15px', color: 'text.primary', whiteSpace: 'nowrap' }}>
            RideNow Powersports Weatherford
          </Typography>
        </Box>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          sx={{ minHeight: 41, '& .MuiTab-root': { minHeight: 41, textTransform: 'none', fontSize: 14, fontWeight: 500, letterSpacing: '0.4px', py: 1, px: 2, color: 'text.secondary' }, '& .Mui-selected': { color: 'primary.main' }, '& .MuiTabs-indicator': { bgcolor: 'primary.main', height: 2, borderRadius: 1 } }}
        >
          <Tab label="On-Brand Insights" />
          <Tab label="Conquest Insights" />
          <Tab label="Vehicles" />
        </Tabs>
      </Box>

      {/* Toolbar */}
      <Box sx={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 1, px: 3, py: 1.25, borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
        <Tooltip title="Show filters">
          <IconButton size="small" sx={{ color: 'rgba(17,16,20,0.56)', p: '5px' }}>
            <Box component="img" src={filtersIcon} sx={{ width: 20, height: 20 }} />
          </IconButton>
        </Tooltip>

        <Button
          startIcon={<Box component="img" src={chainLinkIcon} sx={{ width: 16, height: 16 }} />}
          sx={{ bgcolor: 'primary.main', color: 'white', borderRadius: '100px', textTransform: 'none', fontSize: 13, fontWeight: 500, letterSpacing: '0.46px', px: 1.25, py: 0.5, '&:hover': { bgcolor: 'primary.dark' }, whiteSpace: 'nowrap', flexShrink: 0 }}
        >
          Ad Channels
        </Button>

        <Tooltip title="More options">
          <IconButton size="small" sx={{ color: 'rgba(17,16,20,0.56)', p: '5px' }}>
            <MoreVertIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>

        {/* Search */}
        <Box sx={{ position: 'relative', flexShrink: 0 }}>
          <SearchIcon sx={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: 'rgba(17,16,20,0.38)' }} />
          <InputBase
            placeholder="Find below"
            value={search}
            onChange={e => setSearch(e.target.value)}
            sx={{ width: 200, height: 34, pl: '30px', pr: 1.25, bgcolor: 'surface.inputBackground', border: '1px solid #cac9cf', borderRadius: '20px', fontSize: 12, color: 'text.primary', '& input': { p: 0, '&::placeholder': { color: 'rgba(17,16,20,0.38)', opacity: 1 } }, '&:focus-within': { borderColor: 'primary.main' } }}
          />
        </Box>

        <Box sx={{ flex: 1 }} />

        {/* Channel icons */}
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', px: 1, py: 0.75, borderRadius: 1.5, bgcolor: '#f4f5f6' }}>
          {CHANNELS.map(ch => (
            <Box key={ch.id} sx={{ display: 'flex', gap: 0.25, alignItems: 'center' }}>
              <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: ch.enabled ? 1 : 0.4 }}>
                {ch.icon}
                {ch.hasError && (
                  <Box sx={{ position: 'absolute', top: -2, right: -2, width: 8, height: 8, bgcolor: '#d2323f', borderRadius: '50%', zIndex: 1 }} />
                )}
              </Box>
              {!hideChannelLabels && (
                <Typography sx={{ fontSize: 11, letterSpacing: '0.4px', lineHeight: 1.66, color: ch.enabled ? '#1f1d25' : '#9c99a9', display: { xs: 'none', xl: 'inline' } }}>
                  {ch.label}
                </Typography>
              )}
            </Box>
          ))}
        </Box>

        <Box sx={{ flex: 1 }} />

        {/* Item count */}
        <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', flexShrink: 0 }}>
          <Typography sx={{ fontSize: 11, letterSpacing: '0.4px', color: 'text.secondary' }}>{records.length}</Typography>
          <Typography sx={{ fontSize: 11, letterSpacing: '0.4px', color: 'text.secondary' }}>Items</Typography>
        </Box>

        {/* View controls */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title="Manage columns">
            <IconButton size="small" sx={{ color: 'rgba(17,16,20,0.56)', p: '5px' }}>
              <ViewColumnIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Export">
            <IconButton size="small" sx={{ color: 'rgba(17,16,20,0.56)', p: '5px' }}>
              <FileDownloadIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Charts">
            <IconButton size="small" sx={{ color: 'rgba(17,16,20,0.56)', p: '5px' }}>
              <BarChartIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Change view">
            <IconButton size="small" onClick={cycleView} sx={{ color: 'rgba(17,16,20,0.56)', p: '5px' }}>
              <ViewIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* View area */}
      {activeTab !== 2 ? (
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(17,16,20,0.38)' }}>
          <Typography sx={{ fontSize: 14 }}>
            {activeTab === 0 ? 'On-Brand Insights coming soon' : 'Conquest Insights coming soon'}
          </Typography>
        </Box>
      ) : (
        <Box sx={{ flex: 1, minHeight: 0, position: 'relative', overflow: 'hidden' }}>
          {viewMode === 'table-large' && (
            <Box sx={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
              <VehicleInventoryGrid
                records={records}
                selected={selected}
                onToggleRow={handleToggleRow}
                onToggleAll={handleToggleAll}
                onVinClick={handleVinClick}
                onSyndicationToggle={handleSyndicationToggle}
                onAiGenerationToggle={handleAiGenerationToggle}
                onViewSourceImages={handleViewSourceImages}
                onAttachComment={handleAttachComment}
              />
            </Box>
          )}
          {viewMode === 'vertical-cards' && (
            <Box sx={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
              <VehicleCardGrid
                records={records}
                selected={selected}
                onToggleRow={handleToggleRow}
                onVinClick={handleVinClick}
                onSyndicationToggle={handleSyndicationToggle}
                onAiGenerationToggle={handleAiGenerationToggle}
                onViewSourceImages={handleViewSourceImages}
                onAttachComment={handleAttachComment}
              />
            </Box>
          )}
          {viewMode === 'horizontal-cards' && (
            <Box sx={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
              <VehicleCardList
                records={records}
                selected={selected}
                onToggleRow={handleToggleRow}
                onVinClick={handleVinClick}
                onSyndicationToggle={handleSyndicationToggle}
                onAiGenerationToggle={handleAiGenerationToggle}
                onViewSourceImages={handleViewSourceImages}
                onAttachComment={handleAttachComment}
              />
            </Box>
          )}
          {viewMode === 'table-small' && (
            <Box sx={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
              <VehicleTableCondensed
                records={records}
                selected={selected}
                onToggleRow={handleToggleRow}
                onToggleAll={handleToggleAll}
                onVinClick={handleVinClick}
                onSyndicationToggle={handleSyndicationToggle}
                onAiGenerationToggle={handleAiGenerationToggle}
                onViewSourceImages={handleViewSourceImages}
                onAttachComment={handleAttachComment}
              />
            </Box>
          )}
        </Box>
      )}

      {/* Source images lightbox */}
      {(() => {
        const sourceRecord = sourceImagesVinId ? records.find(r => r.id === sourceImagesVinId) ?? null : null;
        const vg = sourceRecord?.vehicleGroup ?? null;
        const angleKey = ANGLE_KEYS[sourceImagesAngleIdx];
        const angleLabel = ANGLES[sourceImagesAngleIdx]?.label ?? '';
        const vehicleName = sourceRecord ? `${sourceRecord.year} ${sourceRecord.make} ${sourceRecord.model}` : '';
        return (
          <AnglePreviewModal
            isOpen={!!sourceImagesVinId}
            onClose={() => setSourceImagesVinId(null)}
            angleLabel={angleLabel}
            vehicleName={vehicleName}
            generatedSrc={vg?.angles?.[angleKey] ?? null}
            sourceSrc={vg?.sourceAngles?.[angleKey] ?? null}
            defaultSrc={emptyStateSrc}
            defaultTab="source"
            onPrev={() => setSourceImagesAngleIdx(i => (i - 1 + ANGLE_KEYS.length) % ANGLE_KEYS.length)}
            onNext={() => setSourceImagesAngleIdx(i => (i + 1) % ANGLE_KEYS.length)}
          />
        );
      })()}
    </Box>
  );
}
