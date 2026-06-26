// ─── InventoryDataGrid ────────────────────────────────────────────────────────
// 4 view modes with crossfade animation.
// Data: initialAssets (Asset[]) mapped to VinInventoryRecord[].
// Toolbar: folder toggle, filter, title, New+upload, More+download, search, count, view cycle.

import React, { useState, useCallback, useMemo, useRef } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import SvgIcon from '@mui/material/SvgIcon';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import AddIcon from '@mui/icons-material/Add';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import FilterListIcon from '@mui/icons-material/FilterList';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import UploadOutlinedIcon from '@mui/icons-material/UploadOutlined';
import PhotoFilterOutlinedIcon from '@mui/icons-material/PhotoFilterOutlined';
import DashboardCustomizeOutlinedIcon from '@mui/icons-material/DashboardCustomizeOutlined';
import WidgetsOutlinedIcon from '@mui/icons-material/WidgetsOutlined';
import TextSnippetOutlinedIcon from '@mui/icons-material/TextSnippetOutlined';
import WebAssetOutlinedIcon from '@mui/icons-material/WebAssetOutlined';
import { SearchInput } from '@jorgeverlindo/constellation-ux';
import type { SyndicationStatus, AIGenerationStatus, VinInventoryRecord } from '../../../../../data/inventory/vehicleInventory';
import type { Asset } from '../../types/asset';
import { emitSnackbar } from '../../../Snackbar';
import { useAssetViewStore, type FilterValues, DEFAULT_FILTERS } from '../../store/useAssetViewStore';
import { useDownloadStore } from '../../store/useDownloadStore';
import { useUploadStore } from '../../store/useUploadStore';
import { useFolderStore } from '../../store/useFolderStore';
import { usePortalNav } from '../../PortalNavContext';
import { FolderUploadConfirmDialog } from '../../ui/FolderUploadConfirmDialog';
import { extractZip } from '../../utils/extractZip';
import { VehicleInventoryGrid } from './VehicleInventoryGrid';
import { VehicleCardGrid } from './VehicleCardGrid';
import { VehicleCardList } from './VehicleCardList';
import { VehicleTableCondensed } from './VehicleTableCondensed';

const STORAGE_KEY_AI = 'inv_ai_generation_overrides';
const PRIMARY = '#473bab';

// ─── Folder icon (Figma-exact SVG) ───────────────────────────────────────────
const IconFolder = () => (
  <SvgIcon viewBox="0 0 30 30" sx={{ fontSize: 30 }}>
    <path d="M7.2915 8.95833V20.2083C7.2915 20.6686 7.6646 21.0417 8.12484 21.0417H21.8748C22.3351 21.0417 22.7082 20.6686 22.7082 20.2083V11.4583C22.7082 10.9981 22.3351 10.625 21.8748 10.625H15.4458C15.1672 10.625 14.907 10.4857 14.7524 10.2539L13.5806 8.49608C13.426 8.26425 13.1658 8.125 12.8872 8.125H8.12484C7.6646 8.125 7.2915 8.4981 7.2915 8.95833Z" stroke="currentColor" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </SvgIcon>
);

// ─── View mode icons ──────────────────────────────────────────────────────────
const IconCardVertical = () => (
  <svg width="20" height="20" viewBox="0 0 30 30" fill="none">
    <path d="M16.67 8C17.2223 8 17.67 8.44772 17.67 9V13.5C17.67 14.0523 17.2223 14.5 16.67 14.5H13.33C12.7777 14.5 12.33 14.0523 12.33 13.5V9C12.33 8.44772 12.7777 8 13.33 8H16.67ZM18.67 13.5C18.67 14.0523 19.1177 14.5 19.67 14.5H23C23.5523 14.5 24 14.0523 24 13.5V9C24 8.44772 23.5523 8 23 8H19.67C19.1177 8 18.67 8.44772 18.67 9V13.5ZM16.67 22C17.2223 22 17.67 21.5523 17.67 21V16.5C17.67 15.9477 17.2223 15.5 16.67 15.5H13.33C12.7777 15.5 12.33 15.9477 12.33 16.5V21C12.33 21.5523 12.7777 22 13.33 22H16.67ZM19.67 15.5C19.1177 15.5 18.67 15.9477 18.67 16.5V21C18.67 21.5523 19.1177 22 19.67 22H23C23.5523 22 24 21.5523 24 21V16.5C24 15.9477 23.5523 15.5 23 15.5H19.67ZM11.33 16.5C11.33 15.9477 10.8823 15.5 10.33 15.5H7C6.44771 15.5 6 15.9477 6 16.5V21C6 21.5523 6.44772 22 7 22H10.33C10.8823 22 11.33 21.5523 11.33 21V16.5ZM10.33 14.5C10.8823 14.5 11.33 14.0523 11.33 13.5V9C11.33 8.44772 10.8823 8 10.33 8H7C6.44771 8 6 8.44772 6 9V13.5C6 14.0523 6.44772 14.5 7 14.5H10.33Z" fill="currentColor"/>
  </svg>
);
const IconCardHorizontal = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <rect x="10.8335" y="13.3335" width="5.83333" height="3.33333" rx="1" fill="currentColor"/>
    <rect x="3.3335"  y="13.3335" width="5.83333" height="3.33333" rx="1" fill="currentColor"/>
    <rect x="10.8335" y="8.3335"  width="5.83333" height="3.33333" rx="1" fill="currentColor"/>
    <rect x="3.3335"  y="8.3335"  width="5.83333" height="3.33333" rx="1" fill="currentColor"/>
    <rect x="10.8335" y="3.3335"  width="5.83333" height="3.33333" rx="1" fill="currentColor"/>
    <rect x="3.3335"  y="3.3335"  width="5.83333" height="3.33333" rx="1" fill="currentColor"/>
  </svg>
);
const IconTableLarge = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path d="M2.5 4.16683C2.5 3.70659 2.8731 3.3335 3.33333 3.3335H16.6667C17.1269 3.3335 17.5 3.70659 17.5 4.16683V5.8335C17.5 6.29373 17.1269 6.66683 16.6667 6.66683H3.33333C2.8731 6.66683 2.5 6.29373 2.5 5.8335V4.16683Z" fill="currentColor"/>
    <path d="M2.5 9.16683C2.5 8.70659 2.8731 8.3335 3.33333 8.3335H16.6667C17.1269 8.3335 17.5 8.70659 17.5 9.16683V10.8335C17.5 11.2937 17.1269 11.6668 16.6667 11.6668H3.33333C2.8731 11.6668 2.5 11.2937 2.5 10.8335V9.16683Z" fill="currentColor"/>
    <path d="M2.5 14.1668C2.5 13.7066 2.8731 13.3335 3.33333 13.3335H16.6667C17.1269 13.3335 17.5 13.7066 17.5 14.1668V15.8335C17.5 16.2937 17.1269 16.6668 16.6667 16.6668H3.33333C2.8731 16.6668 2.5 16.2937 2.5 15.8335V14.1668Z" fill="currentColor"/>
  </svg>
);
const IconTableSmall = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M5 15H19C19.55 15 20 14.55 20 14C20 13.45 19.55 13 19 13H5C4.45 13 4 13.45 4 14C4 14.55 4.45 15 5 15ZM5 19H19C19.55 19 20 18.55 20 18C20 17.45 19.55 17 19 17H5C4.45 17 4 17.45 4 18C4 18.55 4.45 19 5 19ZM5 11H19C19.55 11 20 10.55 20 10C20 9.45 19.55 9 19 9H5C4.45 9 4 9.45 4 10C4 10.55 4.45 11 5 11ZM4 6C4 6.55 4.45 7 5 7H19C19.55 7 20 6.55 20 6C20 5.45 19.55 5 19 5H5C4.45 5 4 5.45 4 6Z" fill="currentColor"/>
  </svg>
);

// View mode cycle: table-large → vertical → horizontal → small → table-large
type ViewMode = 'table-large' | 'vertical-cards' | 'horizontal-cards' | 'table-small';
const VIEW_MODES: { id: ViewMode; label: string; Icon: React.FC }[] = [
  { id: 'table-large',      label: 'Table (large)',    Icon: IconTableLarge     },
  { id: 'vertical-cards',   label: 'Vertical cards',   Icon: IconCardVertical   },
  { id: 'horizontal-cards', label: 'Horizontal cards', Icon: IconCardHorizontal },
  { id: 'table-small',      label: 'Table (small)',     Icon: IconTableSmall     },
];
const ALL_VIEWS: ViewMode[] = ['table-large', 'vertical-cards', 'horizontal-cards', 'table-small'];

// ─── Asset → VinInventoryRecord ───────────────────────────────────────────────
// Falls back to aiSuggestion fields for assets that have no top-level YMMT.
function assetToVin(asset: Asset): VinInventoryRecord {
  const s = asset.aiSuggestion;
  return {
    id: asset.id,
    vin: asset.name,
    thumbnail: asset.url,
    year: parseInt(asset.year ?? s?.year ?? '2024') || 2024,
    make: asset.make ?? s?.make ?? 'Unknown',
    model: asset.model ?? s?.model ?? 'Unknown',
    trim: asset.trim ?? s?.trim ?? '',
    condition: 'New',
    price: 45000,
    dol: 0,
    priceToMarket: 'close',
    priorityScore: 5,
    vehicleStatus: 'On the lot',
    exteriorColor: 'Black',
    aiGeneration: 'enabled',
    syndication: 'syndicated',
  };
}

// ─── Props ────────────────────────────────────────────────────────────────────
export interface InventoryDataGridProps {
  title?: string;
  initialAssets?: Asset[];
  onToggleFolderTree?: () => void;
  folderTreeOpen?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────
export function InventoryDataGrid({
  title = 'Portal',
  initialAssets = [],
  onToggleFolderTree,
  folderTreeOpen,
}: InventoryDataGridProps) {

  // Map assets → VIN records (stable reference)
  const inventoryVehicles = useMemo(() => initialAssets.map(assetToVin), [initialAssets]);

  // View state
  const [viewMode, setViewMode] = useState<ViewMode>('table-large');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Override maps (toggled per-row)
  const [syndicationOverrides, setSyndicationOverrides] = useState<Map<string, SyndicationStatus>>(new Map());
  const [aiGenerationOverrides, setAiGenerationOverrides] = useState<Map<string, AIGenerationStatus>>(() => {
    try {
      const obj: Record<string, AIGenerationStatus> = JSON.parse(localStorage.getItem(STORAGE_KEY_AI) ?? '{}');
      return new Map(Object.entries(obj));
    } catch { return new Map(); }
  });

  // Upload refs + menus
  const fileInputRef   = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const [newMenuAnchor,  setNewMenuAnchor]  = useState<HTMLElement | null>(null);
  const [moreAnchor,     setMoreAnchor]     = useState<HTMLElement | null>(null);
  const [pendingFolderUpload, setPendingFolderUpload] = useState<{
    dest: { id: string; name: string; icon: string };
    folderName: string;
    files: File[];
  } | null>(null);

  // Store hooks
  const { isFilterPanelOpen, toggleFilterPanel, filters } = useAssetViewStore();
  const { startDownload }   = useDownloadStore();
  const { addUploads }      = useUploadStore();
  const { folders: allFolders } = useFolderStore();
  const { currentFolderId } = usePortalNav();

  const currentFolder          = allFolders.find(f => f.id === currentFolderId);
  const currentFolderIsShared  = currentFolder?.icon === 'folder-read-only';
  const activeFilterCount      = (Object.keys(DEFAULT_FILTERS) as Array<keyof FilterValues>)
    .filter(k => k !== 'sortField' && k !== 'sortDirection' && filters[k] !== '').length;

  // View cycle
  const cycleView = useCallback(() => {
    setViewMode(prev => {
      const idx = VIEW_MODES.findIndex(m => m.id === prev);
      return VIEW_MODES[(idx + 1) % VIEW_MODES.length].id;
    });
  }, []);

  // Handlers
  const handleSyndicationToggle = useCallback((id: string) => {
    setSyndicationOverrides(prev => {
      const base    = inventoryVehicles.find(r => r.id === id)!.syndication;
      const current = prev.get(id) ?? base;
      const next    = new Map(prev);
      next.set(id, current === 'syndicated' ? 'not-syndicated' : 'syndicated');
      return next;
    });
    emitSnackbar('Syndication updated');
  }, [inventoryVehicles]);

  const handleAiGenerationToggle = useCallback((id: string) => {
    setAiGenerationOverrides(prev => {
      const base    = inventoryVehicles.find(r => r.id === id)!.aiGeneration;
      const current = prev.get(id) ?? base;
      const next    = new Map(prev);
      next.set(id, current === 'enabled' ? 'disabled' : 'enabled');
      try { localStorage.setItem(STORAGE_KEY_AI, JSON.stringify(Object.fromEntries(next))); } catch {}
      return next;
    });
    emitSnackbar('AI Generation updated');
  }, [inventoryVehicles]);

  const handleToggleRow = (id: string, checked: boolean) =>
    setSelected(prev => { const s = new Set(prev); checked ? s.add(id) : s.delete(id); return s; });

  const handleToggleAll = (checked: boolean) =>
    setSelected(checked ? new Set(records.map(r => r.id)) : new Set());

  const handleVinClick = useCallback((id: string) => {
    const r = inventoryVehicles.find(v => v.id === id);
    if (r) emitSnackbar(r.vin);
  }, [inventoryVehicles]);

  // Upload handlers
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []).filter(f => f.type.startsWith('image/'));
    if (files.length > 0) addUploads(files);
    e.target.value = '';
  };
  const handleFolderInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const zipFile = e.target.files?.[0];
    e.target.value = '';
    if (!zipFile) return;
    const { folderName, files } = await extractZip(zipFile);
    const dest = { id: currentFolderId, name: currentFolder?.name ?? title, icon: currentFolder?.icon ?? 'folder' };
    setPendingFolderUpload({ dest, folderName, files });
  };

  // Filtered + overridden records
  const records = useMemo(() => inventoryVehicles
    .filter(r => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        r.vin.toLowerCase().includes(q) || r.make.toLowerCase().includes(q) ||
        r.model.toLowerCase().includes(q) || r.trim.toLowerCase().includes(q) ||
        r.condition.toLowerCase().includes(q) || r.vehicleStatus.toLowerCase().includes(q) ||
        r.year.toString().includes(q) || r.price.toString().includes(q)
      );
    })
    .map(r => ({
      ...r,
      ...(syndicationOverrides.has(r.id)  && { syndication:  syndicationOverrides.get(r.id)!  }),
      ...(aiGenerationOverrides.has(r.id) && { aiGeneration: aiGenerationOverrides.get(r.id)! }),
    })),
    [inventoryVehicles, search, syndicationOverrides, aiGenerationOverrides]
  );

  const cur = VIEW_MODES.find(m => m.id === viewMode)!;

  const sharedProps = {
    records, selected,
    onToggleRow:         handleToggleRow,
    onVinClick:          handleVinClick,
    onSyndicationToggle: handleSyndicationToggle,
    onAiGenerationToggle: handleAiGenerationToggle,
  };

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>

      {/* Hidden file inputs */}
      <input ref={fileInputRef}   type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleFileInputChange} />
      <input ref={folderInputRef} type="file" accept=".zip"    style={{ display: 'none' }} onChange={handleFolderInputChange} />

      {/* ── Toolbar ─────────────────────────────────────────────────────────── */}
      <Box sx={{
        flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        px: '8px', py: '8px', borderBottom: '1px solid rgba(0,0,0,0.08)',
      }}>
        {/* Left controls */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>

          {/* Folder toggle */}
          <Tooltip title={folderTreeOpen ? 'Hide folders' : 'Browse folders'} placement="bottom">
            <IconButton size="small" onClick={onToggleFolderTree} aria-label="Toggle folders"
              sx={{ width: 30, height: 30, borderRadius: '100px', p: 0, color: 'rgba(17,16,20,0.56)', '&:hover': { bgcolor: 'rgba(17,16,20,0.04)' } }}>
              <IconFolder />
            </IconButton>
          </Tooltip>

          {/* Filter */}
          <Tooltip title={isFilterPanelOpen ? 'Close filters' : 'Show filters'} placement="bottom">
            <IconButton size="small" onClick={toggleFilterPanel} aria-label="Filters"
              sx={{
                width: 30, height: 30, borderRadius: '100px', p: 0, position: 'relative',
                color: isFilterPanelOpen ? PRIMARY : 'rgba(17,16,20,0.56)',
                bgcolor: isFilterPanelOpen ? `${PRIMARY}14` : 'transparent',
                '&:hover': { bgcolor: isFilterPanelOpen ? `${PRIMARY}1a` : 'rgba(17,16,20,0.04)' },
              }}>
              <FilterListIcon sx={{ fontSize: 16 }} />
              {activeFilterCount > 0 && (
                <Box sx={{ position: 'absolute', top: -2, right: -2, width: 14, height: 14, borderRadius: '50%', bgcolor: PRIMARY, color: '#fff', fontSize: 8, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>
                  {activeFilterCount}
                </Box>
              )}
            </IconButton>
          </Tooltip>

          {/* Title */}
          <Typography sx={{ fontFamily: "'Roboto',sans-serif", fontSize: 16, fontWeight: 500, color: '#1f1d25', letterSpacing: 0, lineHeight: 1, whiteSpace: 'nowrap', mx: '4px' }}>
            {title}
          </Typography>

          {/* New button */}
          <Button variant="contained" size="small" startIcon={<AddIcon sx={{ fontSize: '16px !important' }} />}
            onClick={e => setNewMenuAnchor(e.currentTarget)}
            sx={{ bgcolor: PRIMARY, borderRadius: '100px', textTransform: 'none', boxShadow: 'none', fontFamily: "'Roboto',sans-serif", fontWeight: 600, fontSize: 13, height: 30, px: 1.75, ml: '4px', '&:hover': { bgcolor: '#312e81', boxShadow: 'none' } }}>
            New
          </Button>
          <Menu anchorEl={newMenuAnchor} open={Boolean(newMenuAnchor)} onClose={() => setNewMenuAnchor(null)}
            transformOrigin={{ horizontal: 'left', vertical: 'top' }} anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
            PaperProps={{ sx: { mt: '6px', borderRadius: '12px', minWidth: 200, boxShadow: '0 8px 32px rgba(0,0,0,0.12)', '& .MuiMenuItem-root': { px: 2, py: '10px', gap: '12px', fontSize: 14, fontFamily: "'Roboto',sans-serif" } } }}>
            <MenuItem onClick={() => { setNewMenuAnchor(null); fileInputRef.current?.click(); }}>
              <ListItemIcon sx={{ minWidth: 0, color: 'rgba(17,16,20,0.56)' }}><UploadOutlinedIcon sx={{ fontSize: 20 }} /></ListItemIcon>
              <ListItemText primary="Upload" primaryTypographyProps={{ fontSize: 14 }} />
            </MenuItem>
            {currentFolderIsShared ? (
              <Tooltip title="Not available in shared folders" placement="right" arrow>
                <span>
                  <MenuItem disabled>
                    <ListItemIcon sx={{ minWidth: 0, color: 'rgba(17,16,20,0.26)' }}><UploadOutlinedIcon sx={{ fontSize: 20 }} /></ListItemIcon>
                    <ListItemText primary="Upload Folder" primaryTypographyProps={{ fontSize: 14 }} />
                  </MenuItem>
                </span>
              </Tooltip>
            ) : (
              <MenuItem onClick={() => { setNewMenuAnchor(null); if (folderInputRef.current) folderInputRef.current.value = ''; folderInputRef.current?.click(); }}>
                <ListItemIcon sx={{ minWidth: 0, color: 'rgba(17,16,20,0.56)' }}><UploadOutlinedIcon sx={{ fontSize: 20 }} /></ListItemIcon>
                <ListItemText primary="Upload Folder" primaryTypographyProps={{ fontSize: 14 }} />
              </MenuItem>
            )}
            <Divider sx={{ my: 0.5 }} />
            {[
              { label: 'Upload Lifestyle', Icon: PhotoFilterOutlinedIcon },
              { label: 'Template',         Icon: DashboardCustomizeOutlinedIcon },
              { label: 'Component',        Icon: WidgetsOutlinedIcon },
              { label: 'Text Snippet',     Icon: TextSnippetOutlinedIcon },
              { label: 'Ad Shell',         Icon: WebAssetOutlinedIcon },
            ].map(({ label, Icon }) => (
              <MenuItem key={label} disabled onClick={() => setNewMenuAnchor(null)}>
                <ListItemIcon sx={{ minWidth: 0, color: 'rgba(17,16,20,0.38)' }}><Icon sx={{ fontSize: 20 }} /></ListItemIcon>
                <ListItemText primary={label} primaryTypographyProps={{ fontSize: 14 }} />
              </MenuItem>
            ))}
            <Divider sx={{ my: 0.5 }} />
            <MenuItem disabled onClick={() => setNewMenuAnchor(null)}>
              <ListItemIcon sx={{ minWidth: 0, color: 'rgba(17,16,20,0.38)' }}><AutoAwesomeIcon sx={{ fontSize: 20 }} /></ListItemIcon>
              <ListItemText primary="Create with AI" primaryTypographyProps={{ fontSize: 14 }} />
            </MenuItem>
          </Menu>

          {/* More options */}
          <IconButton size="small" aria-label="More options" onClick={e => setMoreAnchor(e.currentTarget)}
            sx={{ width: 30, height: 30, borderRadius: '100px', p: 0, color: 'rgba(17,16,20,0.56)', '&:hover': { bgcolor: 'rgba(17,16,20,0.04)' } }}>
            <MoreVertIcon sx={{ fontSize: 18 }} />
          </IconButton>
          <Menu anchorEl={moreAnchor} open={Boolean(moreAnchor)} onClose={() => setMoreAnchor(null)}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }} anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            PaperProps={{ sx: { minWidth: 200, borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.12)', py: 0.5, '& .MuiMenuItem-root': { px: 2, py: '10px', gap: '12px', fontSize: 14, fontFamily: "'Roboto',sans-serif" } } }}>
            <MenuItem onClick={() => {
              setMoreAnchor(null);
              startDownload({ folderName: currentFolder?.name ?? 'Folder', assetCount: currentFolder?.count ?? 0 });
            }}>
              <ListItemIcon sx={{ minWidth: 0, color: 'rgba(17,16,20,0.56)' }}><FileDownloadOutlinedIcon sx={{ fontSize: 20 }} /></ListItemIcon>
              <ListItemText primary="Download Folder" primaryTypographyProps={{ fontSize: 14 }} />
            </MenuItem>
          </Menu>

          {/* Search */}
          <SearchInput
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            placeholder="Find below"
            sx={{ width: 200, ml: '4px', flexShrink: 0 }}
          />
        </Box>

        {/* Right: count + view cycle */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <Typography sx={{ fontFamily: "'Roboto',sans-serif", fontSize: 12, color: 'rgba(17,16,20,0.56)', letterSpacing: '0.3px', whiteSpace: 'nowrap', lineHeight: 1 }}>
            {records.length}&thinsp;Items
          </Typography>
          <Tooltip title={cur.label} placement="bottom">
            <IconButton size="small" aria-label="Change view" onClick={cycleView}
              sx={{ width: 30, height: 30, borderRadius: '100px', p: 0, color: PRIMARY, bgcolor: `${PRIMARY}14`, '&:hover': { bgcolor: `${PRIMARY}22` } }}>
              <Box sx={{ width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <cur.Icon />
              </Box>
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* ── View area — crossfade ────────────────────────────────────────────── */}
      <Box sx={{ flex: 1, minHeight: 0, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {ALL_VIEWS.map(mode => (
          <Box
            key={mode}
            sx={{
              position: 'absolute', inset: 0,
              display: 'flex', flexDirection: 'column',
              opacity: viewMode === mode ? 1 : 0,
              pointerEvents: viewMode === mode ? 'auto' : 'none',
              transition: 'opacity 400ms ease-out',
            }}
          >
            {mode === 'table-large'      && <VehicleInventoryGrid {...sharedProps} onToggleAll={handleToggleAll} />}
            {mode === 'vertical-cards'   && <VehicleCardGrid       {...sharedProps} />}
            {mode === 'horizontal-cards' && <VehicleCardList       {...sharedProps} />}
            {mode === 'table-small'      && <VehicleTableCondensed {...sharedProps} onToggleAll={handleToggleAll} />}
          </Box>
        ))}
      </Box>

      {/* Folder upload confirmation dialog */}
      <FolderUploadConfirmDialog
        open={Boolean(pendingFolderUpload)}
        folderName={pendingFolderUpload?.folderName ?? ''}
        files={pendingFolderUpload?.files ?? []}
        dest={pendingFolderUpload?.dest ?? { id: '', name: '', icon: 'folder' }}
        onClose={() => setPendingFolderUpload(null)}
      />
    </Box>
  );
}
