import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Tooltip,
  SvgIcon,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider as MuiDivider,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { SearchInput, Chip, ink, brand, surface as surfaceTokens, status as statusTokens } from '@jorgeverlindo/constellation-ux';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import UploadOutlinedIcon from '@mui/icons-material/UploadOutlined';
import PhotoFilterOutlinedIcon from '@mui/icons-material/PhotoFilterOutlined';
import DashboardCustomizeOutlinedIcon from '@mui/icons-material/DashboardCustomizeOutlined';
import WidgetsOutlinedIcon from '@mui/icons-material/WidgetsOutlined';
import TextSnippetOutlinedIcon from '@mui/icons-material/TextSnippetOutlined';
import WebAssetOutlinedIcon from '@mui/icons-material/WebAssetOutlined';
import GridViewOutlinedIcon from '@mui/icons-material/GridViewOutlined';
import TableRowsOutlinedIcon from '@mui/icons-material/TableRowsOutlined';
import ViewModuleOutlinedIcon from '@mui/icons-material/ViewModuleOutlined';
import FormatAlignJustifyIcon from '@mui/icons-material/FormatAlignJustify';
import TableChartOutlinedIcon from '@mui/icons-material/TableChartOutlined';
import FilterListIcon from '@mui/icons-material/FilterList';
import { Asset, VehicleSuggestion, ModalMode, resolveModalMode } from '../../types/asset';
import { SelectionActionBar } from './SelectionActionBar';
import { useAssetViewStore, type ViewMode, type FilterValues, DEFAULT_FILTERS } from '../../store/useAssetViewStore';
import { useDownloadStore } from '../../store/useDownloadStore';
import { AssetUpdatePayload } from '../../hooks/useAssetUpdate';
import { LifestyleTaggerModal } from '../lifestyle-tagger/LifestyleTaggerModal';
import { AssetCard } from '../asset-card/AssetCard';
import { useArchivedStore } from '../../store/useArchivedStore';
import { useUploadStore } from '../../store/useUploadStore';
import { useFolderStore } from '../../store/useFolderStore';
import { usePortalNav } from '../../PortalNavContext';
import { FolderUploadConfirmDialog } from '../../ui/FolderUploadConfirmDialog';
import { ReviewMetadataModal } from '../../ui/ReviewMetadataModal';
import { extractZip } from '../../utils/extractZip';

// ─── Figma-exact SVG folder icon ─────────────────────────────────────────────
const IconFolder = () => (
  <SvgIcon viewBox="0 0 30 30" sx={{ fontSize: 30 }}>
    <path d="M7.2915 8.95833V20.2083C7.2915 20.6686 7.6646 21.0417 8.12484 21.0417H21.8748C22.3351 21.0417 22.7082 20.6686 22.7082 20.2083V11.4583C22.7082 10.9981 22.3351 10.625 21.8748 10.625H15.4458C15.1672 10.625 14.907 10.4857 14.7524 10.2539L13.5806 8.49608C13.426 8.26425 13.1658 8.125 12.8872 8.125H8.12484C7.6646 8.125 7.2915 8.4981 7.2915 8.95833Z" stroke="currentColor" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </SvgIcon>
);

// ─── Token ────────────────────────────────────────────────────────────────────
const PRIMARY = brand.accent;

// ─── View mode icons / labels ─────────────────────────────────────────────────
const VIEW_MODE_ICONS: Record<ViewMode, React.ReactNode> = {
  'grid-large':      <GridViewOutlinedIcon sx={{ fontSize: 15 }} />,
  'grid-horizontal': <TableRowsOutlinedIcon sx={{ fontSize: 15 }} />,
  'grid-small':      <ViewModuleOutlinedIcon sx={{ fontSize: 15 }} />,
  'table-compact':   <FormatAlignJustifyIcon sx={{ fontSize: 15 }} />,
  'table-spacious':  <TableChartOutlinedIcon sx={{ fontSize: 15 }} />,
};

const VIEW_MODE_LABELS: Record<ViewMode, string> = {
  'grid-large':      'Large grid',
  'grid-horizontal': 'Horizontal grid',
  'grid-small':      'Small grid',
  'table-compact':   'Compact table',
  'table-spacious':  'Spacious table',
};

// ─── AI status helpers ────────────────────────────────────────────────────────
const AI_STATUS_LABEL: Record<string, string> = {
  'approved':    'Approved',
  'auto-tagged': 'Auto-tagged',
  'suggested':   'Needs Review',
  'analyzing':   'Analyzing…',
  'not-vehicle': 'Not a Vehicle',
};

const AI_STATUS_VARIANT: Record<string, 'neutral' | 'success' | 'warning' | 'info'> = {
  'approved':    'success',
  'auto-tagged': 'info',
  'suggested':   'warning',
  'analyzing':   'neutral',
  'not-vehicle': 'neutral',
};

const CHECKBOX_SX = (active: boolean) => ({
  width: 16, height: 16, borderRadius: '3px', border: '1px solid',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  transition: 'all 0.15s', flexShrink: 0,
  bgcolor: active ? PRIMARY : '#fff',
  borderColor: active ? PRIMARY : 'rgba(0,0,0,0.25)',
});

const CHECKMARK = (
  <svg width="8" height="7" viewBox="0 0 8 7" fill="none">
    <path d="M1 3.5L3 5.5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ─── Filter helpers ───────────────────────────────────────────────────────────
function parseDims(dimensions?: string): { w: number; h: number } | null {
  if (!dimensions) return null;
  const match = dimensions.match(/(\d+)\s*[x×]\s*(\d+)/i);
  if (!match) return null;
  return { w: parseInt(match[1]), h: parseInt(match[2]) };
}

function applyFilters(assets: Asset[], filters: FilterValues): Asset[] {
  let result = [...assets];

  if (filters.aiStatus)  result = result.filter(a => a.aiStatus === filters.aiStatus);
  if (filters.mimeType)  result = result.filter(a => a.mimeType === filters.mimeType);
  if (filters.make)      result = result.filter(a => a.make?.toLowerCase() === filters.make.toLowerCase());
  if (filters.model)     result = result.filter(a => a.model?.toLowerCase() === filters.model.toLowerCase());
  if (filters.trim)      result = result.filter(a => a.trim?.toLowerCase() === filters.trim.toLowerCase());
  if (filters.year)      result = result.filter(a => a.year === filters.year);
  if (filters.lifestyle) result = result.filter(a => a.lifestyle === filters.lifestyle);
  if (filters.tags) {
    const q = filters.tags.toLowerCase();
    result = result.filter(a => a.tags?.some(t => t.toLowerCase().includes(q)));
  }
  if (filters.shape) {
    result = result.filter(a => {
      const d = parseDims(a.dimensions);
      if (!d) return false;
      const s = d.w > d.h ? 'landscape' : d.h > d.w ? 'portrait' : 'square';
      return s === filters.shape;
    });
  }
  if (filters.widthMin) {
    const min = parseInt(filters.widthMin);
    result = result.filter(a => { const d = parseDims(a.dimensions); return d ? d.w >= min : true; });
  }
  if (filters.widthMax) {
    const max = parseInt(filters.widthMax);
    result = result.filter(a => { const d = parseDims(a.dimensions); return d ? d.w <= max : true; });
  }
  if (filters.heightMin) {
    const min = parseInt(filters.heightMin);
    result = result.filter(a => { const d = parseDims(a.dimensions); return d ? d.h >= min : true; });
  }
  if (filters.heightMax) {
    const max = parseInt(filters.heightMax);
    result = result.filter(a => { const d = parseDims(a.dimensions); return d ? d.h <= max : true; });
  }

  result = [...result].sort((a, b) => {
    let cmp = 0;
    if (filters.sortField === 'name')     cmp = a.name.localeCompare(b.name);
    if (filters.sortField === 'make')     cmp = (a.make ?? '').localeCompare(b.make ?? '');
    if (filters.sortField === 'year')     cmp = (a.year ?? '').localeCompare(b.year ?? '');
    if (filters.sortField === 'aiStatus') cmp = (a.aiStatus ?? '').localeCompare(b.aiStatus ?? '');
    return filters.sortDirection === 'asc' ? cmp : -cmp;
  });

  return result;
}

// ─── Table row ────────────────────────────────────────────────────────────────
function AssetTableRow({ asset, selected, onToggle, compact }: { asset: Asset; selected: boolean; onToggle: () => void; compact: boolean }) {
  const thumbSize = compact ? 40 : 80;
  const rowHeight = compact ? 48 : 96;

  return (
    <Box
      onClick={onToggle}
      sx={{
        display: 'flex', alignItems: 'center', gap: '12px', px: '12px',
        height: rowHeight, cursor: 'pointer',
        borderBottom: '1px solid rgba(0,0,0,0.06)',
        transition: 'background-color 0.12s',
        bgcolor: selected ? 'rgba(71,59,171,0.04)' : 'transparent',
        '&:hover': { bgcolor: selected ? 'rgba(71,59,171,0.04)' : surfaceTokens.inputBackground },
      }}
    >
      <Box sx={CHECKBOX_SX(selected)}>{selected && CHECKMARK}</Box>

      <Box sx={{ flexShrink: 0, borderRadius: '6px', overflow: 'hidden', bgcolor: surfaceTokens.canvas, width: thumbSize, height: thumbSize }}>
        <Box component="img" src={asset.url} alt={asset.name} loading="lazy" sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      </Box>

      <Box sx={{ flex: 2, minWidth: 0 }}>
        <Typography sx={{ fontSize: 13, fontWeight: 500, color: ink.primary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {asset.name}
        </Typography>
        {!compact && asset.make && (
          <Typography sx={{ fontSize: 11, color: ink.secondary, mt: '2px' }}>
            {[asset.year, asset.make, asset.model, asset.trim].filter(Boolean).join(' · ')}
          </Typography>
        )}
      </Box>

      <Box sx={{ width: 110, flexShrink: 0 }}>
        <Typography sx={{ fontSize: 12, color: ink.secondary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {asset.dimensions ?? '—'}
        </Typography>
      </Box>

      <Box sx={{ width: 80, flexShrink: 0 }}>
        <Typography sx={{ fontSize: 12, color: ink.secondary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {asset.mimeType?.split('/')[1]?.toUpperCase() ?? '—'}
        </Typography>
      </Box>

      <Box sx={{ width: 140, flexShrink: 0 }}>
        <Chip variant={AI_STATUS_VARIANT[asset.aiStatus as string] ?? 'neutral'} label={AI_STATUS_LABEL[asset.aiStatus as string] ?? asset.aiStatus} />
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px', flex: 1, minWidth: 0, justifyContent: 'flex-end' }}>
        {(asset.tags ?? []).slice(0, compact ? 2 : 3).map(tag => (
          <Box key={tag} component="span" sx={{ display: 'inline-flex', alignItems: 'center', px: '6px', py: '2px', borderRadius: '6px', fontSize: 10, fontWeight: 500, bgcolor: surfaceTokens.canvas, color: ink.secondary, whiteSpace: 'nowrap' }}>
            {tag}
          </Box>
        ))}
      </Box>
    </Box>
  );
}

// ─── Table header ─────────────────────────────────────────────────────────────
function TableHeader({ onSelectAll, allSelected }: { onSelectAll: () => void; allSelected: boolean }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px', px: '12px', height: 36, borderBottom: '1px solid rgba(0,0,0,0.10)', bgcolor: surfaceTokens.inputBackground, flexShrink: 0 }}>
      <Box sx={{ flexShrink: 0, width: 16, cursor: 'pointer' }} onClick={onSelectAll}>
        <Box sx={CHECKBOX_SX(allSelected)}>{allSelected && CHECKMARK}</Box>
      </Box>
      <Box sx={{ flexShrink: 0, width: 40 }} />
      <Typography sx={{ flex: 2, minWidth: 0, fontSize: 11, fontWeight: 500, color: ink.secondary }}>Name</Typography>
      <Typography sx={{ width: 110, flexShrink: 0, fontSize: 11, fontWeight: 500, color: ink.secondary }}>Dimensions</Typography>
      <Typography sx={{ width: 80, flexShrink: 0, fontSize: 11, fontWeight: 500, color: ink.secondary }}>Type</Typography>
      <Typography sx={{ width: 140, flexShrink: 0, fontSize: 11, fontWeight: 500, color: ink.secondary }}>AI Status</Typography>
      <Typography sx={{ flex: 1, textAlign: 'right', fontSize: 11, fontWeight: 500, color: ink.secondary }}>Tags</Typography>
    </Box>
  );
}

// ─── Horizontal card ──────────────────────────────────────────────────────────
function HorizontalAssetCard({ asset, selected, onToggle }: { asset: Asset; selected: boolean; onToggle: (id: string, val: boolean) => void }) {
  const vehicle = [asset.year, asset.make, asset.model, asset.trim].filter(Boolean).join(' · ');

  return (
    <Box
      onClick={() => onToggle(asset.id, !selected)}
      sx={{
        display: 'flex', alignItems: 'stretch', borderRadius: '12px',
        bgcolor: '#fff', overflow: 'hidden', cursor: 'pointer', minHeight: 120,
        border: '1px solid',
        borderColor: selected ? PRIMARY : 'rgba(0,0,0,0.10)',
        boxShadow: selected
          ? '0 0 0 2px rgba(71,59,171,0.20)'
          : '0 1px 3px rgba(0,0,0,0.08)',
        transition: 'border-color 0.15s, box-shadow 0.15s',
        '&:hover': { borderColor: selected ? PRIMARY : 'rgba(0,0,0,0.18)' },
      }}
    >
      <Box sx={{ position: 'relative', flexShrink: 0, bgcolor: surfaceTokens.canvas, overflow: 'hidden', width: 140, height: 120 }}>
        <Box component="img" src={asset.url} alt={asset.name} loading="lazy" sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        <Box
          sx={{ position: 'absolute', top: 8, left: 8, zIndex: 10 }}
          onClick={(e: React.MouseEvent) => { e.stopPropagation(); onToggle(asset.id, !selected); }}
        >
          <Box sx={{ ...CHECKBOX_SX(selected), bgcolor: selected ? PRIMARY : 'rgba(255,255,255,0.9)', borderColor: selected ? PRIMARY : 'rgba(0,0,0,0.3)' }}>
            {selected && CHECKMARK}
          </Box>
        </Box>
      </Box>

      <Box sx={{ flex: 1, minWidth: 0, px: '12px', py: '10px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <Box>
          <Typography sx={{ fontSize: 12, fontWeight: 500, color: ink.primary, lineHeight: 'tight', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', mb: '2px' }}>
            {asset.name}
          </Typography>
          {vehicle && (
            <Typography sx={{ fontSize: 11, color: ink.secondary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {vehicle}
            </Typography>
          )}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', mt: '4px' }}>
          {asset.aiStatus && (
            <Chip variant={AI_STATUS_VARIANT[asset.aiStatus as string] ?? 'neutral'} label={AI_STATUS_LABEL[asset.aiStatus as string] ?? asset.aiStatus} />
          )}
          {(asset.tags ?? []).slice(0, 2).map(tag => (
            <Box key={tag} component="span" sx={{ display: 'inline-flex', alignItems: 'center', px: '6px', py: '2px', borderRadius: '6px', fontSize: 10, fontWeight: 500, bgcolor: surfaceTokens.canvas, color: ink.secondary, whiteSpace: 'nowrap' }}>
              {tag}
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}

// ─── Mock AI results ──────────────────────────────────────────────────────────
interface MockResult {
  lifestyle: string;
  tags: string[];
  confidence: number;
  vehicle: {
    year:  { value: string; confidence: number };
    make:  { value: string; confidence: number };
    model: { value: string; confidence: number };
    trim:  { value: string; confidence: number };
  };
}

const HIGH_CONF_THRESHOLD = 0.85;

function allHighConfidence(s: VehicleSuggestion): boolean {
  return (
    s.yearConfidence  >= HIGH_CONF_THRESHOLD &&
    s.makeConfidence  >= HIGH_CONF_THRESHOLD &&
    s.modelConfidence >= HIGH_CONF_THRESHOLD &&
    s.trimConfidence  >= HIGH_CONF_THRESHOLD
  );
}

const MOCK_RESULTS: MockResult[] = [
  { lifestyle: 'Off-Road', tags: ['4x4', 'Trail Ready', 'Adventure', 'Rugged', 'Mud Terrain'], confidence: 0.94,
    vehicle: { year: { value: '2024', confidence: 0.91 }, make: { value: 'Land Rover', confidence: 0.96 }, model: { value: 'Defender', confidence: 0.93 }, trim: { value: '110 X', confidence: 0.72 } } },
  { lifestyle: 'Luxury', tags: ['Premium', 'Executive', 'Comfort', 'Sport', 'Prestige'], confidence: 0.88,
    vehicle: { year: { value: '2025', confidence: 0.85 }, make: { value: 'Land Rover', confidence: 0.97 }, model: { value: 'Range Rover', confidence: 0.89 }, trim: { value: 'Autobiography', confidence: 0.61 } } },
  { lifestyle: 'Adventure', tags: ['Expedition', 'Overlanding', 'Tow Ready', 'Family', 'Versatile'], confidence: 0.79,
    vehicle: { year: { value: '2023', confidence: 0.76 }, make: { value: 'Ford', confidence: 0.88 }, model: { value: 'Bronco', confidence: 0.81 }, trim: { value: 'Wildtrak', confidence: 0.44 } } },
  { lifestyle: 'Performance', tags: ['Track Day', 'Sport', 'Aerodynamic', 'High-Output', 'Low-Profile'], confidence: 0.91,
    vehicle: { year: { value: '2024', confidence: 0.93 }, make: { value: 'Porsche', confidence: 0.95 }, model: { value: 'Cayenne', confidence: 0.87 }, trim: { value: 'GTS', confidence: 0.68 } } },
  { lifestyle: 'Performance', tags: ['Track Day', 'Sport', 'Precision', 'High-Output', 'Competition'], confidence: 0.97,
    vehicle: { year: { value: '2024', confidence: 0.96 }, make: { value: 'BMW', confidence: 0.98 }, model: { value: 'M3', confidence: 0.95 }, trim: { value: 'Competition', confidence: 0.91 } } },
];

let mockResultIndex = 0;
function getNextMockResult(): MockResult {
  const r = MOCK_RESULTS[mockResultIndex % MOCK_RESULTS.length];
  mockResultIndex += 1;
  return r;
}

function mockResultToSuggestion(r: MockResult): VehicleSuggestion {
  return {
    year: r.vehicle.year.value, yearConfidence: r.vehicle.year.confidence,
    make: r.vehicle.make.value, makeConfidence: r.vehicle.make.confidence,
    model: r.vehicle.model.value, modelConfidence: r.vehicle.model.confidence,
    trim: r.vehicle.trim.value, trimConfidence: r.vehicle.trim.confidence,
    lifestyle: r.lifestyle, tags: r.tags, confidence: r.confidence,
  };
}

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
function isImageFile(file: File) { return ACCEPTED_IMAGE_TYPES.includes(file.type); }

// ─── Props ────────────────────────────────────────────────────────────────────
export interface AssetGridProps {
  title?: string;
  initialAssets?: Asset[];
  onToggleFolderTree?: () => void;
  folderTreeOpen?: boolean;
  showArchived?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────
export function AssetGrid({ title = 'Assets', initialAssets = [], onToggleFolderTree, folderTreeOpen, showArchived = false }: AssetGridProps) {
  const [assets,    setAssets]    = useState<Asset[]>(initialAssets);
  const { archivedAssets } = useArchivedStore();
  const { addUploads, jobs: uploadJobs, addFolderUpload } = useUploadStore();
  const { addFolder, folders: allFolders } = useFolderStore();
  const { currentFolderId } = usePortalNav();
  const currentFolder         = allFolders.find(f => f.id === currentFolderId);
  const currentFolderIsShared = currentFolder?.icon === 'folder-read-only';
  const { startDownload } = useDownloadStore();
  const [moreAnchor, setMoreAnchor] = useState<HTMLElement | null>(null);
  const [pendingFolderUpload, setPendingFolderUpload] = useState<{
    dest: { id: string; name: string; icon: string };
    folderName: string;
    files: File[];
  } | null>(null);

  const archivedIdSet   = new Set(archivedAssets.map(a => a.id));
  const uploadedAssets  = uploadJobs.filter(j => j.status === 'done' && j.asset).map(j => j.asset!);

  const [selected,   setSelected]   = useState<Set<string>>(new Set());
  const [query,      setQuery]      = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const [reviewSessionIds, setReviewSessionIds] = useState<string[]>([]);
  const [reviewPendingIds, setReviewPendingIds] = useState<string[]>([]);
  const [modalMode,        setModalMode]        = useState<ModalMode>('view');

  const currentReviewId    = reviewPendingIds[0] ?? null;
  const reviewingAsset     = currentReviewId ? (assets.find(a => a.id === currentReviewId) ?? null) : null;
  const isReviewOpen       = reviewPendingIds.length > 0 && reviewingAsset !== null;
  const reviewSessionAssets = reviewSessionIds.map(id => assets.find(a => a.id === id)).filter(Boolean) as Asset[];

  const fileInputRef   = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const [newMenuAnchor, setNewMenuAnchor] = useState<HTMLElement | null>(null);

  const [bulkEditOpen,   setBulkEditOpen]   = useState(false);
  const [bulkEditAssets, setBulkEditAssets] = useState<Asset[]>([]);
  const [bulkUploadFiles, setBulkUploadFiles] = useState<File[] | undefined>(undefined);
  const isBulkUploadOpen = Boolean(bulkUploadFiles && bulkUploadFiles.length >= 2);

  const handleBulkEdit = useCallback((ids: string[]) => {
    const targets = assets.filter(a => ids.includes(a.id));
    if (targets.length === 0) return;
    setBulkEditAssets(targets);
    setBulkEditOpen(true);
  }, [assets]);

  const handleBulkSave = useCallback((updatedAssets: Asset[]) => {
    const updatedMap = new Map(updatedAssets.map(a => [a.id, a]));
    setAssets(prev => prev.map(a => updatedMap.has(a.id) ? updatedMap.get(a.id)! : a));
  }, []);

  // ── Background analysis ───────────────────────────────────────────────────
  const analyzeAsset = useCallback(async (assetId: string) => {
    const delay = 1800 + Math.random() * 1000;
    await new Promise(r => setTimeout(r, delay));
    const suggestion = mockResultToSuggestion(getNextMockResult());
    const hasValidYMMT = Boolean(suggestion.year && suggestion.make && suggestion.model);

    if (hasValidYMMT && allHighConfidence(suggestion)) {
      setAssets(prev => prev.map(a =>
        a.id === assetId ? {
          ...a, aiStatus: 'auto-tagged' as const, aiSuggestion: undefined, needsReview: false, isNewUpload: false,
          year: suggestion.year, make: suggestion.make, model: suggestion.model, trim: suggestion.trim,
          tags: [suggestion.year, suggestion.make, suggestion.model, suggestion.trim, ...suggestion.tags].filter(Boolean),
        } : a
      ));
      setReviewPendingIds(prev => prev.filter(id => id !== assetId));
      setReviewSessionIds(prev => prev.filter(id => id !== assetId));
    } else {
      setAssets(prev => prev.map(a =>
        a.id === assetId ? { ...a, aiStatus: 'suggested' as const, aiSuggestion: suggestion, needsReview: true } : a
      ));
      fetch(`/api/assets/${assetId}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ needsReview: true, year: suggestion.year, make: suggestion.make, model: suggestion.model, trim: suggestion.trim, lifestyle: suggestion.lifestyle, tags: suggestion.tags }),
      }).catch(() => {});
    }
  }, []);

  // ── Upload handler ────────────────────────────────────────────────────────
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const validFiles = Array.from(files).filter(isImageFile);
    if (validFiles.length > 0) addUploads(validFiles);
    e.target.value = '';
  };

  const handleNewClick    = (e: React.MouseEvent<HTMLElement>) => setNewMenuAnchor(e.currentTarget);
  const closeNewMenu      = () => setNewMenuAnchor(null);
  const handleUploadFiles = () => { closeNewMenu(); fileInputRef.current?.click(); };
  const handleUploadFolder = () => {
    closeNewMenu();
    if (folderInputRef.current) folderInputRef.current.value = '';
    folderInputRef.current?.click();
  };

  const handleFolderInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const zipFile = e.target.files?.[0];
    e.target.value = '';
    if (!zipFile) return;
    const { folderName, files } = await extractZip(zipFile);
    const dest = { id: currentFolderId, name: currentFolder?.name ?? title, icon: currentFolder?.icon ?? 'folder' };
    setPendingFolderUpload({ dest, folderName, files });
  };

  // ── Drag-and-drop ─────────────────────────────────────────────────────────
  const handleDragOver  = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsDragging(false); };
  const handleDrop      = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    const validFiles = Array.from(e.dataTransfer.files).filter(isImageFile);
    if (validFiles.length > 0) addUploads(validFiles);
  };

  // ── Review session management ─────────────────────────────────────────────
  const openReviewSession = useCallback((startAssetId?: string) => {
    setAssets(currentAssets => {
      const suggested = currentAssets.filter(a => a.aiStatus === 'suggested');
      if (suggested.length === 0) return currentAssets;
      const ids     = suggested.map(a => a.id);
      const ordered = startAssetId ? [startAssetId, ...ids.filter(id => id !== startAssetId)] : ids;
      setReviewSessionIds(ordered);
      setReviewPendingIds(ordered);
      return currentAssets;
    });
  }, []);

  const handleOpenReview = (asset: Asset) => {
    setAssets(prev => prev.map(a => a.id === asset.id ? { ...a, aiStatus: 'analyzing' as const, isNewUpload: true } : a));
    setModalMode('detect');
    setReviewSessionIds([asset.id]);
    setReviewPendingIds([asset.id]);
    analyzeAsset(asset.id);
  };

  const advancePending = () => setReviewPendingIds(prev => prev.slice(1));

  const handleSkip = () => {
    setReviewPendingIds(prev => prev.length > 1 ? [...prev.slice(1), prev[0]] : prev);
  };

  const handleJump = (assetId: string) => {
    setReviewPendingIds(prev => {
      if (!prev.includes(assetId)) return prev;
      if (prev[0] === assetId) return prev;
      return [assetId, ...prev.filter(id => id !== assetId)];
    });
  };

  const handleApproved = (assetId: string, payload: AssetUpdatePayload) => {
    setAssets(prev => prev.map(a =>
      a.id === assetId ? {
        ...a, aiStatus: 'approved' as const, aiSuggestion: undefined, needsReview: false, isNewUpload: false,
        ...payload,
        tags: [...(payload.year ? [payload.year] : []), ...(payload.make ? [payload.make] : []), ...(payload.model ? [payload.model] : []), ...(payload.trim ? [payload.trim] : []), ...(payload.tags ?? [])],
      } : a
    ));
    advancePending();
  };

  const handleDismissed = (assetId: string) => {
    setAssets(prev => prev.map(a =>
      a.id === assetId ? { ...a, aiStatus: 'not-vehicle' as const, aiSuggestion: undefined, needsReview: false, isNewUpload: false } : a
    ));
    advancePending();
  };

  const handleReviewClose = () => {
    setAssets(prev => prev.map(a => a.isNewUpload ? { ...a, isNewUpload: false } : a));
    setReviewSessionIds([]);
    setReviewPendingIds([]);
  };

  // ── Selection ─────────────────────────────────────────────────────────────
  const handleSelect    = (id: string, value: boolean) => {
    setSelected(prev => { const next = new Set(prev); value ? next.add(id) : next.delete(id); return next; });
  };
  const clearSelection  = () => setSelected(new Set());
  const handleCardClick = (asset: Asset) => { setModalMode('view'); setReviewSessionIds([asset.id]); setReviewPendingIds([asset.id]); };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape' && !isReviewOpen && selected.size > 0) clearSelection(); };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isReviewOpen, selected.size]);

  // ── View mode & filter store ──────────────────────────────────────────────
  const { viewMode, cycleViewMode, isFilterPanelOpen, toggleFilterPanel, filters } = useAssetViewStore();
  const activeFilterCount = (Object.keys(DEFAULT_FILTERS) as Array<keyof FilterValues>)
    .filter(k => k !== 'sortField' && k !== 'sortDirection' && filters[k] !== '').length;
  const isTableMode = viewMode === 'table-compact' || viewMode === 'table-spacious';

  // ── Derived ───────────────────────────────────────────────────────────────
  const sourceAssets = showArchived
    ? archivedAssets
    : [
        ...assets.filter(a => !archivedIdSet.has(a.id)),
        ...uploadedAssets.filter(a => !archivedIdSet.has(a.id) && !assets.some(b => b.id === a.id)),
      ];

  const searchFiltered = query.trim()
    ? sourceAssets.filter(a => a.name.toLowerCase().includes(query.toLowerCase()) || a.tags?.some(t => t.toLowerCase().includes(query.toLowerCase())))
    : sourceAssets;
  const filteredAssets = applyFilters(searchFiltered, filters);

  const gridCols = ({
    'grid-large':      'repeat(auto-fill, minmax(200px, 1fr))',
    'grid-horizontal': 'repeat(auto-fill, minmax(380px, 1fr))',
    'grid-small':      'repeat(auto-fill, minmax(260px, 1fr))',
  } as Record<string, string>)[viewMode] ?? 'repeat(4, 1fr)';

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <Box
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      sx={{
        display: 'flex', flexDirection: 'column', height: '100%', position: 'relative',
        outline: isDragging ? `2px dashed ${PRIMARY}` : '2px dashed transparent',
        outlineOffset: -4, borderRadius: '12px', transition: 'outline-color 0.15s',
      }}
    >
      <input ref={fileInputRef}   type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleFileInputChange} />
      <input ref={folderInputRef} type="file" accept=".zip"    style={{ display: 'none' }} onChange={handleFolderInputChange} />

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', px: 0, pt: '8px', pb: '16px', flexShrink: 0, position: 'relative', minHeight: 34 }}>

        {/* Selection bar */}
        <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', px: 2, opacity: selected.size >= 2 ? 1 : 0, pointerEvents: selected.size >= 2 ? 'auto' : 'none', transition: 'opacity 150ms ease', zIndex: 2, bgcolor: '#fff' }}>
          {selected.size >= 2 && (
            <SelectionActionBar count={selected.size} selectedIds={Array.from(selected)} onClearSelection={clearSelection} onBulkEdit={handleBulkEdit} />
          )}
        </Box>

        {/* Default toolbar */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', opacity: selected.size >= 2 ? 0 : 1, pointerEvents: selected.size >= 2 ? 'none' : 'auto', transition: 'opacity 150ms ease' }}>
          {/* Left */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>

            <Tooltip title={folderTreeOpen ? 'Hide folders' : 'Browse folders'} placement="bottom">
              <IconButton size="small" aria-label="Toggle folders" onClick={onToggleFolderTree}
                sx={{ width: 30, height: 30, borderRadius: '100px', p: 0, color: 'rgba(17,16,20,0.56)', '&:hover': { bgcolor: surfaceTokens.canvas } }}>
                <IconFolder />
              </IconButton>
            </Tooltip>

            <Tooltip title={isFilterPanelOpen ? 'Close filters' : 'Show filters'} placement="bottom">
              <IconButton size="small" aria-label="Filters" onClick={toggleFilterPanel}
                sx={{ width: 30, height: 30, borderRadius: '100px', p: 0, position: 'relative', color: isFilterPanelOpen ? PRIMARY : 'rgba(17,16,20,0.56)', bgcolor: isFilterPanelOpen ? `${PRIMARY}14` : 'transparent', '&:hover': { bgcolor: isFilterPanelOpen ? `${PRIMARY}1a` : surfaceTokens.canvas } }}>
                <FilterListIcon sx={{ fontSize: 16 }} />
                {activeFilterCount > 0 && (
                  <Box sx={{ position: 'absolute', top: -2, right: -2, width: 14, height: 14, borderRadius: '50%', bgcolor: PRIMARY, color: '#fff', fontSize: 8, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>
                    {activeFilterCount}
                  </Box>
                )}
              </IconButton>
            </Tooltip>

            <Typography sx={{ fontSize: 16, fontWeight: 500, color: ink.primary, letterSpacing: 0, lineHeight: 1, whiteSpace: 'nowrap' }}>
              {title}
            </Typography>

            <Button variant="contained" size="small" startIcon={<AddIcon sx={{ fontSize: '16px !important' }} />} onClick={handleNewClick}
              sx={{ bgcolor: PRIMARY, borderRadius: '100px', textTransform: 'none', boxShadow: 'none', fontWeight: 600, fontSize: 13, height: 30, px: 1.75, ml: '6px', '&:hover': { bgcolor: '#312e81', boxShadow: 'none' } }}>
              New
            </Button>

            <Menu anchorEl={newMenuAnchor} open={Boolean(newMenuAnchor)} onClose={closeNewMenu}
              transformOrigin={{ horizontal: 'left', vertical: 'top' }} anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
              PaperProps={{ sx: { mt: '6px', borderRadius: '12px', minWidth: 200, boxShadow: '0 8px 32px rgba(0,0,0,0.12)', '& .MuiMenuItem-root': { px: 2, py: '10px', gap: '12px', fontSize: 14 } } }}>
              <MenuItem onClick={handleUploadFiles}>
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
                <MenuItem onClick={handleUploadFolder}>
                  <ListItemIcon sx={{ minWidth: 0, color: 'rgba(17,16,20,0.56)' }}><UploadOutlinedIcon sx={{ fontSize: 20 }} /></ListItemIcon>
                  <ListItemText primary="Upload Folder" primaryTypographyProps={{ fontSize: 14 }} />
                </MenuItem>
              )}
              <MuiDivider sx={{ my: 0.5 }} />
              {[
                { label: 'Upload Lifestyle', Icon: PhotoFilterOutlinedIcon },
                { label: 'Template',         Icon: DashboardCustomizeOutlinedIcon },
                { label: 'Component',        Icon: WidgetsOutlinedIcon },
                { label: 'Text Snippet',     Icon: TextSnippetOutlinedIcon },
                { label: 'Ad Shell',         Icon: WebAssetOutlinedIcon },
              ].map(({ label, Icon }) => (
                <MenuItem key={label} onClick={closeNewMenu} disabled>
                  <ListItemIcon sx={{ minWidth: 0, color: 'rgba(17,16,20,0.38)' }}><Icon sx={{ fontSize: 20 }} /></ListItemIcon>
                  <ListItemText primary={label} primaryTypographyProps={{ fontSize: 14 }} />
                </MenuItem>
              ))}
              <MuiDivider sx={{ my: 0.5 }} />
              <MenuItem onClick={closeNewMenu} disabled>
                <ListItemIcon sx={{ minWidth: 0, color: 'rgba(17,16,20,0.38)' }}><AutoAwesomeIcon sx={{ fontSize: 20 }} /></ListItemIcon>
                <ListItemText primary="Create with AI" primaryTypographyProps={{ fontSize: 14 }} />
              </MenuItem>
            </Menu>

            <IconButton size="small" aria-label="More options" onClick={e => setMoreAnchor(e.currentTarget)}
              sx={{ width: 30, height: 30, borderRadius: '100px', p: 0, color: 'rgba(17,16,20,0.56)', '&:hover': { bgcolor: surfaceTokens.canvas } }}>
              <MoreVertIcon sx={{ fontSize: 18 }} />
            </IconButton>
            <Menu anchorEl={moreAnchor} open={Boolean(moreAnchor)} onClose={() => setMoreAnchor(null)}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }} anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              PaperProps={{ sx: { minWidth: 200, borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.12)', py: 0.5, '& .MuiMenuItem-root': { px: 2, py: '10px', gap: '12px', fontSize: 14 } } }}>
              <MenuItem onClick={() => { setMoreAnchor(null); startDownload({ folderName: currentFolder?.name ?? 'Folder', assetCount: currentFolder?.count ?? 0 }); }}>
                <ListItemIcon sx={{ minWidth: 0, color: 'rgba(17,16,20,0.56)' }}><FileDownloadOutlinedIcon sx={{ fontSize: 20 }} /></ListItemIcon>
                <ListItemText primary="Download Folder" primaryTypographyProps={{ fontSize: 14 }} />
              </MenuItem>
            </Menu>

            <SearchInput value={query} onChange={e => setQuery((e.target as HTMLInputElement).value)} placeholder="Find below" sx={{ width: 200, ml: '2px', flexShrink: 0 }} />
          </Box>

          {/* Right */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Typography sx={{ fontSize: 12, color: ink.secondary, letterSpacing: '0.3px', whiteSpace: 'nowrap', lineHeight: 1 }}>
              {filteredAssets.length}&thinsp;Items
            </Typography>
            <Tooltip title={VIEW_MODE_LABELS[viewMode]} placement="bottom">
              <IconButton size="small" aria-label="Change view" onClick={cycleViewMode}
                sx={{ width: 30, height: 30, borderRadius: '100px', p: 0, color: PRIMARY, bgcolor: `${PRIMARY}14`, '&:hover': { bgcolor: `${PRIMARY}22` } }}>
                {VIEW_MODE_ICONS[viewMode]}
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Box>

      {/* ── Drop overlay ─────────────────────────────────────────────────────── */}
      {isDragging && (
        <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: `${PRIMARY}0A`, borderRadius: '12px', zIndex: 10, pointerEvents: 'none' }}>
          <Box sx={{ textAlign: 'center' }}>
            <AutoAwesomeIcon sx={{ fontSize: 40, color: PRIMARY, mb: 1, display: 'block', mx: 'auto' }} />
            <Typography variant="h6" sx={{ color: PRIMARY, fontWeight: 600 }}>Drop to upload & analyze</Typography>
            <Typography variant="body2" color="text.secondary">AI will detect vehicle tags automatically</Typography>
          </Box>
        </Box>
      )}

      {/* ── Main area ──────────────────────────────────────────────────────────── */}
      <Box sx={{ flex: 1, display: 'flex', gap: '12px', overflow: 'hidden', minHeight: 0 }}>
        <Box
          onClick={(e: React.MouseEvent) => { if (e.target === e.currentTarget && selected.size > 0) clearSelection(); }}
          sx={{ flex: 1, overflowY: 'auto', pb: 3, minWidth: 0 }}
        >
          {filteredAssets.length === 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 300, gap: 1.5, border: '2px dashed', borderColor: 'divider', borderRadius: '12px', color: 'text.disabled', cursor: 'pointer', mt: 1, mx: 2 }} onClick={handleNewClick}>
              <AddIcon sx={{ fontSize: 36 }} />
              <Typography variant="body2">{query ? 'No assets match your search' : 'Drop an image here or click New to upload'}</Typography>
            </Box>
          ) : isTableMode ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
              <TableHeader
                onSelectAll={() => {
                  const allSel = filteredAssets.every(a => selected.has(a.id));
                  if (allSel) clearSelection();
                  else setSelected(new Set(filteredAssets.map(a => a.id)));
                }}
                allSelected={filteredAssets.length > 0 && filteredAssets.every(a => selected.has(a.id))}
              />
              <Box key={viewMode} sx={{ flex: 1, overflowY: 'auto' }}>
                {filteredAssets.map(asset => (
                  <AssetTableRow key={asset.id} asset={asset} selected={selected.has(asset.id)} onToggle={() => handleSelect(asset.id, !selected.has(asset.id))} compact={viewMode === 'table-compact'} />
                ))}
              </Box>
            </Box>
          ) : (
            <Box key={viewMode} sx={{ display: 'grid', gap: '12px', pt: 1, px: 2, gridTemplateColumns: gridCols }}>
              {filteredAssets.map(asset =>
                viewMode === 'grid-horizontal' ? (
                  <HorizontalAssetCard key={asset.id} asset={asset} selected={selected.has(asset.id)} onToggle={handleSelect} />
                ) : (
                  <AssetCard key={asset.id} asset={asset} selected={selected.has(asset.id)} onSelect={handleSelect} onCardClick={handleCardClick} />
                )
              )}
            </Box>
          )}
        </Box>
      </Box>

      {/* ── Modals ────────────────────────────────────────────────────────────── */}
      {isReviewOpen && reviewingAsset && (
        <LifestyleTaggerModal
          asset={reviewingAsset} open={isReviewOpen} onClose={handleReviewClose}
          onApproved={handleApproved} onDismissed={handleDismissed} mode={modalMode}
          queueAssets={reviewSessionAssets.length > 1 ? reviewSessionAssets : undefined}
          queueCurrentId={currentReviewId ?? undefined}
          onSkip={reviewPendingIds.length > 1 ? handleSkip : undefined}
          onJump={handleJump}
        />
      )}

      {isBulkUploadOpen && bulkUploadFiles && (
        <LifestyleTaggerModal
          asset={{ id: 'bulk-placeholder', name: bulkUploadFiles[0].name, url: '', aiStatus: 'analyzing' } as Asset}
          open={isBulkUploadOpen} onClose={() => setBulkUploadFiles(undefined)}
          onApproved={handleApproved} onDismissed={() => {}} mode="detect"
          uploadFiles={bulkUploadFiles} onBulkSave={() => setBulkUploadFiles(undefined)}
        />
      )}

      <FolderUploadConfirmDialog
        open={Boolean(pendingFolderUpload)}
        folderName={pendingFolderUpload?.folderName ?? ''}
        files={pendingFolderUpload?.files ?? []}
        dest={pendingFolderUpload?.dest ?? { id: '', name: '', icon: 'folder' }}
        onClose={() => setPendingFolderUpload(null)}
      />

      <ReviewMetadataModal
        open={bulkEditOpen} assets={bulkEditAssets}
        onClose={() => setBulkEditOpen(false)} onSave={handleBulkSave}
      />
    </Box>
  );
}
