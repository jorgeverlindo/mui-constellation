import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  InputBase,
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
import SearchIcon from '@mui/icons-material/Search';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import UploadOutlinedIcon from '@mui/icons-material/UploadOutlined';
import PhotoFilterOutlinedIcon from '@mui/icons-material/PhotoFilterOutlined';
import DashboardCustomizeOutlinedIcon from '@mui/icons-material/DashboardCustomizeOutlined';
import WidgetsOutlinedIcon from '@mui/icons-material/WidgetsOutlined';
import TextSnippetOutlinedIcon from '@mui/icons-material/TextSnippetOutlined';
import WebAssetOutlinedIcon from '@mui/icons-material/WebAssetOutlined';
import { LayoutGrid, Rows3, Grid3X3, AlignJustify, Table, ListFilter } from 'lucide-react';
import { Asset, VehicleSuggestion, ModalMode, resolveModalMode } from '../../types/asset';
import { SelectionActionBar } from './SelectionActionBar';
import { useAssetViewStore, type ViewMode, type FilterValues, DEFAULT_FILTERS } from '../../store/useAssetViewStore';
import { useDownloadStore } from '../../store/useDownloadStore';

// ─── Figma-exact SVG icons ────────────────────────────────────────────────────
const IconFolder = () => (
  <SvgIcon viewBox="0 0 30 30" sx={{ fontSize: 30 }}>
    <path d="M7.2915 8.95833V20.2083C7.2915 20.6686 7.6646 21.0417 8.12484 21.0417H21.8748C22.3351 21.0417 22.7082 20.6686 22.7082 20.2083V11.4583C22.7082 10.9981 22.3351 10.625 21.8748 10.625H15.4458C15.1672 10.625 14.907 10.4857 14.7524 10.2539L13.5806 8.49608C13.426 8.26425 13.1658 8.125 12.8872 8.125H8.12484C7.6646 8.125 7.2915 8.4981 7.2915 8.95833Z" stroke="currentColor" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </SvgIcon>
);

// ─── View mode icons ──────────────────────────────────────────────────────────
const VIEW_MODE_ICONS: Record<ViewMode, React.ReactNode> = {
  'grid-large':      <LayoutGrid size={15} strokeWidth={1.5} />,
  'grid-horizontal': <Rows3 size={15} strokeWidth={1.5} />,
  'grid-small':      <Grid3X3 size={15} strokeWidth={1.5} />,
  'table-compact':   <AlignJustify size={15} strokeWidth={1.5} />,
  'table-spacious':  <Table size={15} strokeWidth={1.5} />,
};

const VIEW_MODE_LABELS: Record<ViewMode, string> = {
  'grid-large':      'Large grid',
  'grid-horizontal': 'Horizontal grid',
  'grid-small':      'Small grid',
  'table-compact':   'Compact table',
  'table-spacious':  'Spacious table',
};

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

// ─── Table row component ──────────────────────────────────────────────────────
function AssetTableRow({
  asset,
  selected,
  onToggle,
  compact,
}: {
  asset: Asset;
  selected: boolean;
  onToggle: () => void;
  compact: boolean;
}) {
  const thumbSize = compact ? 40 : 80;
  const rowHeight = compact ? 48 : 96;
  const aiStatusLabel: Record<string, string> = {
    'approved':    'Approved',
    'auto-tagged': 'Auto-tagged',
    'suggested':   'Needs Review',
    'analyzing':   'Analyzing…',
    'not-vehicle': 'Not a Vehicle',
  };
  const aiStatusColor: Record<string, string> = {
    'approved':    'bg-green-100 text-green-700',
    'auto-tagged': 'bg-blue-100 text-blue-700',
    'suggested':   'bg-amber-100 text-amber-700',
    'analyzing':   'bg-gray-100 text-gray-500',
    'not-vehicle': 'bg-gray-100 text-gray-400',
  };

  return (
    <div
      className={`flex items-center gap-3 px-3 border-b border-black/[0.06] transition-colors cursor-pointer ${selected ? 'bg-[#473bab]/[0.04]' : 'hover:bg-[#f9fafa]'}`}
      style={{ height: rowHeight }}
      onClick={onToggle}
    >
      {/* Checkbox */}
      <div className="shrink-0 w-4 h-4 rounded border flex items-center justify-center transition-all" style={{ background: selected ? '#473bab' : 'white', borderColor: selected ? '#473bab' : 'rgba(0,0,0,0.25)' }}>
        {selected && (
          <svg width="8" height="7" viewBox="0 0 8 7" fill="none">
            <path d="M1 3.5L3 5.5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>

      {/* Thumbnail */}
      <div className="shrink-0 rounded-[6px] overflow-hidden bg-[#f0f2f4]" style={{ width: thumbSize, height: thumbSize }}>
        <img src={asset.url} alt={asset.name} className="w-full h-full object-cover" loading="lazy" />
      </div>

      {/* Name */}
      <div className="flex-[2] min-w-0">
        <p className="text-[13px] font-medium text-[#1f1d25] truncate">{asset.name}</p>
        {!compact && asset.make && (
          <p className="text-[11px] text-[#686576] mt-0.5">{[asset.year, asset.make, asset.model, asset.trim].filter(Boolean).join(' · ')}</p>
        )}
      </div>

      {/* Dimensions */}
      <div className="w-[110px] shrink-0">
        <p className="text-[12px] text-[#686576] truncate">{asset.dimensions ?? '—'}</p>
      </div>

      {/* MIME */}
      <div className="w-[80px] shrink-0">
        <p className="text-[12px] text-[#686576] truncate">{asset.mimeType?.split('/')[1]?.toUpperCase() ?? '—'}</p>
      </div>

      {/* AI Status */}
      <div className="w-[140px] shrink-0">
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${aiStatusColor[asset.aiStatus as string] ?? 'bg-gray-100 text-gray-400'}`}>
          {aiStatusLabel[asset.aiStatus as string] ?? asset.aiStatus}
        </span>
      </div>

      {/* Tags */}
      <div className="flex items-center gap-1 flex-1 min-w-0 justify-end">
        {(asset.tags ?? []).slice(0, compact ? 2 : 3).map((tag) => (
          <span key={tag} className="inline-flex items-center px-1.5 py-0.5 rounded-[6px] text-[10px] font-medium bg-[#f0f2f4] text-[#686576] whitespace-nowrap">
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Table header ─────────────────────────────────────────────────────────────
function TableHeader({ onSelectAll, allSelected }: { onSelectAll: () => void; allSelected: boolean }) {
  return (
    <div className="flex items-center gap-3 px-3 h-[36px] border-b border-black/[0.10] bg-[#f9fafa] shrink-0">
      <div className="shrink-0 w-4 cursor-pointer" onClick={onSelectAll}>
        <div className="w-4 h-4 rounded border flex items-center justify-center transition-all" style={{ background: allSelected ? '#473bab' : 'white', borderColor: allSelected ? '#473bab' : 'rgba(0,0,0,0.25)' }}>
          {allSelected && (
            <svg width="8" height="7" viewBox="0 0 8 7" fill="none">
              <path d="M1 3.5L3 5.5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>
      </div>
      <div className="shrink-0" style={{ width: 40 }} />
      <div className="flex-[2] min-w-0 text-[11px] font-medium text-[#686576]">Name</div>
      <div className="w-[110px] shrink-0 text-[11px] font-medium text-[#686576]">Dimensions</div>
      <div className="w-[80px] shrink-0 text-[11px] font-medium text-[#686576]">Type</div>
      <div className="w-[140px] shrink-0 text-[11px] font-medium text-[#686576]">AI Status</div>
      <div className="flex-1 text-right text-[11px] font-medium text-[#686576]">Tags</div>
    </div>
  );
}
import { AssetUpdatePayload } from '../../hooks/useAssetUpdate';
import { LifestyleTaggerModal } from '../lifestyle-tagger/LifestyleTaggerModal';
import { AssetCard } from '../asset-card/AssetCard';
import { useArchivedStore } from '../../store/useArchivedStore';
import { useUploadStore, ACCEPTED_TYPES } from '../../store/useUploadStore';
import { useFolderStore } from '../../store/useFolderStore';
import { useParams } from 'react-router-dom';
import { FolderUploadConfirmDialog } from '../../components/ui/FolderUploadConfirmDialog';
import { ReviewMetadataModal } from '../../components/ui/ReviewMetadataModal';
import { extractZip } from '../../utils/extractZip';

// ─── Horizontal card (grid-horizontal mode) ──────────────────────────────────
// Renders a 140×140 thumbnail on the left with asset info on the right.
// This is a NEW component — the existing MUI AssetCard is not modified.
function HorizontalAssetCard({
  asset,
  selected,
  onToggle,
}: {
  asset: Asset;
  selected: boolean;
  onToggle: (id: string, val: boolean) => void;
}) {
  const aiStatusLabel: Record<string, string> = {
    'approved':    'Approved',
    'auto-tagged': 'Auto-tagged',
    'suggested':   'Needs Review',
    'analyzing':   'Analyzing…',
    'not-vehicle': 'Not a Vehicle',
  };
  const aiStatusColor: Record<string, string> = {
    'approved':    'bg-green-100 text-green-700',
    'auto-tagged': 'bg-blue-100 text-blue-700',
    'suggested':   'bg-amber-100 text-amber-700',
    'analyzing':   'bg-gray-100 text-gray-500',
    'not-vehicle': 'bg-gray-100 text-gray-400',
  };
  const vehicle = [asset.year, asset.make, asset.model, asset.trim].filter(Boolean).join(' · ');

  return (
    <div
      onClick={() => onToggle(asset.id, !selected)}
      className={`group flex items-stretch rounded-[12px] bg-white border overflow-hidden cursor-pointer transition-all ${
        selected
          ? 'border-[#473bab] shadow-[0_0_0_2px_rgba(71,59,171,0.20)]'
          : 'border-black/[0.10] hover:border-black/[0.18]'
      }`}
      style={{ boxShadow: selected ? undefined : '0 1px 3px rgba(0,0,0,0.08)', minHeight: 120 }}
    >
      {/* Thumbnail */}
      <div className="relative shrink-0 bg-[#f0f2f4] overflow-hidden" style={{ width: 140, height: 120 }}>
        <img
          src={asset.url}
          alt={asset.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {/* Checkbox */}
        <div
          className="absolute top-2 left-2 z-10"
          onClick={(e) => { e.stopPropagation(); onToggle(asset.id, !selected); }}
        >
          <div
            className="w-4 h-4 rounded border flex items-center justify-center transition-all"
            style={{ background: selected ? '#473bab' : 'rgba(255,255,255,0.9)', borderColor: selected ? '#473bab' : 'rgba(0,0,0,0.3)' }}
          >
            {selected && (
              <svg width="8" height="7" viewBox="0 0 8 7" fill="none">
                <path d="M1 3.5L3 5.5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 px-3 py-2.5 flex flex-col justify-between">
        <div>
          <p className="text-[12px] font-medium text-[#1f1d25] leading-tight truncate mb-0.5">
            {asset.name}
          </p>
          {vehicle && (
            <p className="text-[11px] text-[#686576] truncate">{vehicle}</p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap mt-1">
          {asset.aiStatus && (
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${aiStatusColor[asset.aiStatus as string] ?? 'bg-gray-100 text-gray-400'}`}>
              {aiStatusLabel[asset.aiStatus as string] ?? asset.aiStatus}
            </span>
          )}
          {(asset.tags ?? []).slice(0, 2).map(tag => (
            <span key={tag} className="inline-flex items-center px-1.5 py-0.5 rounded-[6px] text-[10px] font-medium bg-[#f0f2f4] text-[#686576] whitespace-nowrap">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── AV3 tokens ──────────────────────────────────────────────────────────────
const PRIMARY = '#3730a3';

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

function isImageFile(file: File) {
  return ACCEPTED_IMAGE_TYPES.includes(file.type);
}

// ─── Mock AI results (rotated per analysis) ───────────────────────────────────
// In production, replace with a real Anthropic API call.
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

// Confidence threshold above which all four fields must score for auto-approval.
// Assets below this on ANY field are queued for human review.
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
  // Low trim confidence → needs review
  {
    lifestyle: 'Off-Road',
    tags: ['4x4', 'Trail Ready', 'Adventure', 'Rugged', 'Mud Terrain'],
    confidence: 0.94,
    vehicle: {
      year:  { value: '2024', confidence: 0.91 },
      make:  { value: 'Land Rover', confidence: 0.96 },
      model: { value: 'Defender', confidence: 0.93 },
      trim:  { value: '110 X', confidence: 0.72 },
    },
  },
  // Low trim confidence → needs review
  {
    lifestyle: 'Luxury',
    tags: ['Premium', 'Executive', 'Comfort', 'Sport', 'Prestige'],
    confidence: 0.88,
    vehicle: {
      year:  { value: '2025', confidence: 0.85 },
      make:  { value: 'Land Rover', confidence: 0.97 },
      model: { value: 'Range Rover', confidence: 0.89 },
      trim:  { value: 'Autobiography', confidence: 0.61 },
    },
  },
  // Multiple low-confidence fields → needs review
  {
    lifestyle: 'Adventure',
    tags: ['Expedition', 'Overlanding', 'Tow Ready', 'Family', 'Versatile'],
    confidence: 0.79,
    vehicle: {
      year:  { value: '2023', confidence: 0.76 },
      make:  { value: 'Ford', confidence: 0.88 },
      model: { value: 'Bronco', confidence: 0.81 },
      trim:  { value: 'Wildtrak', confidence: 0.44 },
    },
  },
  // Low trim confidence → needs review
  {
    lifestyle: 'Performance',
    tags: ['Track Day', 'Sport', 'Aerodynamic', 'High-Output', 'Low-Profile'],
    confidence: 0.91,
    vehicle: {
      year:  { value: '2024', confidence: 0.93 },
      make:  { value: 'Porsche', confidence: 0.95 },
      model: { value: 'Cayenne', confidence: 0.87 },
      trim:  { value: 'GTS', confidence: 0.68 },
    },
  },
  // All fields ≥ 85% → AUTO-APPROVED (no review needed)
  {
    lifestyle: 'Performance',
    tags: ['Track Day', 'Sport', 'Precision', 'High-Output', 'Competition'],
    confidence: 0.97,
    vehicle: {
      year:  { value: '2024', confidence: 0.96 },
      make:  { value: 'BMW',  confidence: 0.98 },
      model: { value: 'M3',   confidence: 0.95 },
      trim:  { value: 'Competition', confidence: 0.91 },
    },
  },
];

let mockResultIndex = 0;

function getNextMockResult(): MockResult {
  const r = MOCK_RESULTS[mockResultIndex % MOCK_RESULTS.length];
  mockResultIndex += 1;
  return r;
}

function mockResultToSuggestion(r: MockResult): VehicleSuggestion {
  return {
    year:            r.vehicle.year.value,
    yearConfidence:  r.vehicle.year.confidence,
    make:            r.vehicle.make.value,
    makeConfidence:  r.vehicle.make.confidence,
    model:           r.vehicle.model.value,
    modelConfidence: r.vehicle.model.confidence,
    trim:            r.vehicle.trim.value,
    trimConfidence:  r.vehicle.trim.confidence,
    lifestyle:       r.lifestyle,
    tags:            r.tags,
    confidence:      r.confidence,
  };
}

// ─── Props ────────────────────────────────────────────────────────────────────
export interface AssetGridProps {
  title?: string;
  initialAssets?: Asset[];
  onToggleFolderTree?: () => void;
  folderTreeOpen?: boolean;
  /** When true, shows archived assets instead of active ones */
  showArchived?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────
export function AssetGrid({ title = 'Assets', initialAssets = [], onToggleFolderTree, folderTreeOpen, showArchived = false }: AssetGridProps) {
  const [assets,    setAssets]    = useState<Asset[]>(initialAssets);
  const { archivedAssets } = useArchivedStore();
  const { addUploads, jobs: uploadJobs, addFolderUpload } = useUploadStore();
  const { addFolder, folders: allFolders } = useFolderStore();
  const { folderId: currentFolderId = 'const-internal' } = useParams<{ folderId: string }>();
  // Folder upload is not available in read-only folders (shared with you by another user)
  const currentFolder         = allFolders.find(f => f.id === currentFolderId);
  const currentFolderIsShared = currentFolder?.icon === 'folder-read-only';
  const { startDownload } = useDownloadStore();
  const [moreAnchor, setMoreAnchor] = useState<HTMLElement | null>(null);
  // Pending folder upload — shows confirmation dialog before upload starts
  const [pendingFolderUpload, setPendingFolderUpload] = useState<{
    dest: { id: string; name: string; icon: string };
    folderName: string;
    files: File[];
  } | null>(null);
  // IDs of archived assets — used to hide them from the active grid
  const archivedIdSet = new Set(archivedAssets.map(a => a.id));
  // Assets completed via the upload store (real-time additions)
  const uploadedAssets = uploadJobs
    .filter(j => j.status === 'done' && j.asset)
    .map(j => j.asset!);
  const [selected,  setSelected]  = useState<Set<string>>(new Set());
  const [query,     setQuery]     = useState('');
  const [isDragging, setIsDragging] = useState(false);

  // ── Bulk-review queue ─────────────────────────────────────────────────────
  // reviewSessionIds: snapshot of ALL assets in this review batch (for thumbnail rail)
  // reviewPendingIds: IDs still waiting to be reviewed — head is the current asset
  const [reviewSessionIds, setReviewSessionIds] = useState<string[]>([]);
  const [reviewPendingIds, setReviewPendingIds] = useState<string[]>([]);
  const [modalMode, setModalMode] = useState<ModalMode>('view');

  const currentReviewId   = reviewPendingIds[0] ?? null;
  const reviewingAsset    = currentReviewId
    ? (assets.find(a => a.id === currentReviewId) ?? null)
    : null;
  const isReviewOpen      = reviewPendingIds.length > 0 && reviewingAsset !== null;

  // Live-state view of every asset in the session (for thumbnail rail)
  const reviewSessionAssets = reviewSessionIds
    .map(id => assets.find(a => a.id === id))
    .filter(Boolean) as Asset[];

  const fileInputRef   = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const [newMenuAnchor, setNewMenuAnchor] = useState<HTMLElement | null>(null);

  // ── Bulk metadata edit ───────────────────────────────────────────────────
  const [bulkEditOpen, setBulkEditOpen] = useState(false);
  const [bulkEditAssets, setBulkEditAssets] = useState<Asset[]>([]);

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

  // ── Bulk upload (multi-file) ─────────────────────────────────────────────
  const [bulkUploadFiles, setBulkUploadFiles] = useState<File[] | undefined>(undefined);
  const isBulkUploadOpen = Boolean(bulkUploadFiles && bulkUploadFiles.length >= 2);

  // ── Background analysis ───────────────────────────────────────────────────
  const analyzeAsset = useCallback(async (assetId: string) => {
    const delay = 1800 + Math.random() * 1000;
    await new Promise(r => setTimeout(r, delay));

    const suggestion = mockResultToSuggestion(getNextMockResult());

    // YMMT is valid only when at least year + make + model are non-empty.
    const hasValidYMMT = Boolean(suggestion.year && suggestion.make && suggestion.model);

    if (hasValidYMMT && allHighConfidence(suggestion)) {
      // All fields ≥ 85% and YMMT complete — auto-approve, no needsReview flag.
      setAssets(prev =>
        prev.map(a =>
          a.id === assetId
            ? {
                ...a,
                aiStatus:     'auto-tagged' as const,
                aiSuggestion: undefined,
                needsReview:  false,
                isNewUpload:  false,
                year:  suggestion.year,
                make:  suggestion.make,
                model: suggestion.model,
                trim:  suggestion.trim,
                tags: [
                  suggestion.year, suggestion.make, suggestion.model, suggestion.trim,
                  ...suggestion.tags,
                ].filter(Boolean),
              }
            : a
        )
      );
      // Auto-approved — remove from review session so the modal closes.
      setReviewPendingIds(prev => prev.filter(id => id !== assetId));
      setReviewSessionIds(prev => prev.filter(id => id !== assetId));
    } else {
      // Low confidence on ≥1 field, or YMMT incomplete — flag for human review.
      setAssets(prev =>
        prev.map(a =>
          a.id === assetId
            ? { ...a, aiStatus: 'suggested' as const, aiSuggestion: suggestion, needsReview: true }
            : a
        )
      );
      // Persist the needsReview flag via the asset update API (fire-and-forget).
      fetch(`/api/assets/${assetId}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          needsReview: true,
          year:      suggestion.year,
          make:      suggestion.make,
          model:     suggestion.model,
          trim:      suggestion.trim,
          lifestyle: suggestion.lifestyle,
          tags:      suggestion.tags,
        }),
      }).catch(() => { /* no backend in dev — ignore network errors */ });
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

  const handleNewClick = (e: React.MouseEvent<HTMLElement>) => setNewMenuAnchor(e.currentTarget);
  const closeNewMenu  = () => setNewMenuAnchor(null);

  const handleUploadFiles  = () => { closeNewMenu(); fileInputRef.current?.click(); };
  const handleUploadFolder = () => {
    closeNewMenu();
    if (folderInputRef.current) folderInputRef.current.value = '';
    folderInputRef.current?.click();
  };

  // Folder input change — extracts ZIP then shows confirmation dialog
  const handleFolderInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const zipFile = e.target.files?.[0];
    e.target.value = '';
    if (!zipFile) return;
    const { folderName, files } = await extractZip(zipFile);
    const dest = {
      id:   currentFolderId,
      name: currentFolder?.name ?? title,
      icon: currentFolder?.icon ?? 'folder',
    };
    setPendingFolderUpload({ dest, folderName, files });
  };

  // ── Drag-and-drop ─────────────────────────────────────────────────────────
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const validFiles = Array.from(e.dataTransfer.files).filter(isImageFile);
    if (validFiles.length > 0) addUploads(validFiles);
  };

  // ── Review session management ─────────────────────────────────────────────
  /**
   * Opens the bulk-review modal for all currently-suggested assets.
   * If `startAssetId` is given, that asset goes to the front of the queue.
   */
  const openReviewSession = useCallback((startAssetId?: string) => {
    setAssets(currentAssets => {
      const suggested = currentAssets.filter(a => a.aiStatus === 'suggested');
      if (suggested.length === 0) return currentAssets;

      const ids = suggested.map(a => a.id);
      const ordered = startAssetId
        ? [startAssetId, ...ids.filter(id => id !== startAssetId)]
        : ids;

      setReviewSessionIds(ordered);
      setReviewPendingIds(ordered);
      return currentAssets; // no asset mutation, just reading
    });
  }, []);

  /** Called from the banner "Review now →" button */
  const _handleOpenBulkReview = () => { setModalMode('detect'); openReviewSession(); }; void _handleOpenBulkReview;

  /** Called from individual card "Auto-detect vehicle" button — triggers full detect flow */
  const handleOpenReview = (asset: Asset) => {
    // Set asset to analyzing state and open modal in detect mode
    setAssets(prev => prev.map(a =>
      a.id === asset.id ? { ...a, aiStatus: 'analyzing' as const, isNewUpload: true } : a
    ));
    setModalMode('detect');
    setReviewSessionIds([asset.id]);
    setReviewPendingIds([asset.id]);
    analyzeAsset(asset.id);
  };

  /** Advance the pending queue by one (removes current head) */
  const advancePending = () => {
    setReviewPendingIds(prev => prev.slice(1));
  };

  /** Skip current asset → move it to the end of the pending queue */
  const handleSkip = () => {
    setReviewPendingIds(prev =>
      prev.length > 1 ? [...prev.slice(1), prev[0]] : prev
    );
  };

  /** Jump directly to an asset by clicking its thumbnail in the rail */
  const handleJump = (assetId: string) => {
    setReviewPendingIds(prev => {
      if (!prev.includes(assetId)) return prev; // already processed — no-op
      if (prev[0] === assetId) return prev;
      return [assetId, ...prev.filter(id => id !== assetId)];
    });
  };

  const handleApproved = (assetId: string, payload: AssetUpdatePayload) => {
    setAssets(prev =>
      prev.map(a =>
        a.id === assetId
          ? {
              ...a,
              aiStatus:     'approved' as const,
              aiSuggestion: undefined,
              needsReview:  false,
              isNewUpload:  false,
              ...payload,
              tags: [
                ...(payload.year  ? [payload.year]  : []),
                ...(payload.make  ? [payload.make]  : []),
                ...(payload.model ? [payload.model] : []),
                ...(payload.trim  ? [payload.trim]  : []),
                ...(payload.tags  ?? []),
              ],
            }
          : a
      )
    );
    advancePending();
  };

  const handleDismissed = (assetId: string) => {
    setAssets(prev =>
      prev.map(a =>
        a.id === assetId
          ? { ...a, aiStatus: 'not-vehicle' as const, aiSuggestion: undefined, needsReview: false, isNewUpload: false }
          : a
      )
    );
    advancePending();
  };

  const handleReviewClose = () => {
    // Clear isNewUpload on any assets still in the session so they open in review mode next time
    setAssets(prev =>
      prev.map(a =>
        a.isNewUpload ? { ...a, isNewUpload: false } : a
      )
    );
    setReviewSessionIds([]);
    setReviewPendingIds([]);
  };

  // ── Selection ─────────────────────────────────────────────────────────────
  const handleSelect = (id: string, value: boolean) => {
    setSelected(prev => {
      const next = new Set(prev);
      value ? next.add(id) : next.delete(id);
      return next;
    });
  };

  const clearSelection = () => setSelected(new Set());

  // ── Card click → open modal in view mode ──────────────────────────────
  const handleCardClick = (asset: Asset) => {
    setModalMode('view');
    setReviewSessionIds([asset.id]);
    setReviewPendingIds([asset.id]);
  };

  // ── Escape key: clear selection (if modal isn't open) ───────────────────
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isReviewOpen && selected.size > 0) {
        clearSelection();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isReviewOpen, selected.size]);

  // ── View mode & filter store ─────────────────────────────────────────────
  const { viewMode, cycleViewMode, isFilterPanelOpen, toggleFilterPanel, filters } = useAssetViewStore();
  const activeFilterCount = (Object.keys(DEFAULT_FILTERS) as Array<keyof FilterValues>)
    .filter(k => k !== 'sortField' && k !== 'sortDirection' && filters[k] !== '').length;
  const isTableMode = viewMode === 'table-compact' || viewMode === 'table-spacious';

  // ── Derived ──────────────────────────────────────────────────────────────
  // Source: archived view uses store, active view merges base + uploaded assets
  const sourceAssets = showArchived
    ? archivedAssets
    : [
        ...assets.filter(a => !archivedIdSet.has(a.id)),
        // Real-time uploaded assets — appear as soon as each file completes
        ...uploadedAssets.filter(a => !archivedIdSet.has(a.id) && !assets.some(b => b.id === a.id)),
      ];

  const searchFiltered = query.trim()
    ? sourceAssets.filter(a =>
        a.name.toLowerCase().includes(query.toLowerCase()) ||
        a.tags?.some(t => t.toLowerCase().includes(query.toLowerCase()))
      )
    : sourceAssets;
  const filteredAssets = applyFilters(searchFiltered, filters);

  // Grid column config per mode
  const gridCols = {
    'grid-large':      'repeat(auto-fill, minmax(200px, 1fr))',
    'grid-horizontal': 'repeat(auto-fill, minmax(380px, 1fr))',
    'grid-small':      'repeat(auto-fill, minmax(260px, 1fr))',
  }[viewMode as string] ?? 'repeat(4, 1fr)';

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <Box
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        outline: isDragging ? `2px dashed ${PRIMARY}` : '2px dashed transparent',
        outlineOffset: -4,
        borderRadius: '12px',
        transition: 'outline-color 0.15s',
        position: 'relative',
      }}
    >
      {/* Hidden file input — individual image uploads */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: 'none' }}
        onChange={handleFileInputChange}
      />
      {/* Hidden ZIP picker — no browser alert, extracted client-side */}
      <input
        ref={folderInputRef}
        type="file"
        accept=".zip"
        style={{ display: 'none' }}
        onChange={handleFolderInputChange}
      />

      {/* ── Header — Figma node 6151:95282 "Left + Right Wrapper" ─────────── */}
      {/* Height: 34px, SPACE_BETWEEN, bottom-aligned (counterAxisAlignItems: MAX) */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          px: 0,
          pt: '8px',
          pb: '16px',
          flexShrink: 0,
          position: 'relative',
          minHeight: 34,
        }}
      >
        {/* ── Selection action bar (cross-fades in when 2+ selected) ─────── */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            px: 2,
            opacity: selected.size >= 2 ? 1 : 0,
            pointerEvents: selected.size >= 2 ? 'auto' : 'none',
            transition: 'opacity 150ms ease',
            zIndex: 2,
            bgcolor: '#ffffff',
          }}
        >
          {selected.size >= 2 && (
            <SelectionActionBar
              count={selected.size}
              selectedIds={Array.from(selected)}
              onClearSelection={clearSelection}
              onBulkEdit={handleBulkEdit}
            />
          )}
        </Box>

        {/* ── Default toolbar (fades out when 2+ selected) ───────────────── */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            opacity: selected.size >= 2 ? 0 : 1,
            pointerEvents: selected.size >= 2 ? 'none' : 'auto',
            transition: 'opacity 150ms ease',
          }}
        >
        {/* ── Left section ─────────────────────────────────────────────────── */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>

          {/* Folder icon — toggles FolderTree panel */}
          <Tooltip title={folderTreeOpen ? 'Hide folders' : 'Browse folders'} placement="bottom">
            <IconButton
              size="small"
              aria-label="Toggle folders"
              onClick={onToggleFolderTree}
              sx={{
                width: 30, height: 30, borderRadius: '100px', p: 0,
                color: 'rgba(17,16,20,0.56)',
                bgcolor: 'transparent',
                '&:hover': { bgcolor: '#f0f2f4' },
              }}
            >
              <IconFolder />
            </IconButton>
          </Tooltip>

          {/* Filter icon — toggles FilterPanel */}
          <Tooltip title={isFilterPanelOpen ? 'Close filters' : 'Show filters'} placement="bottom">
            <IconButton
              size="small"
              aria-label="Filters"
              onClick={toggleFilterPanel}
              sx={{
                width: 30, height: 30, borderRadius: '100px', p: 0, position: 'relative',
                color: isFilterPanelOpen ? PRIMARY : 'rgba(17,16,20,0.56)',
                bgcolor: isFilterPanelOpen ? `${PRIMARY}14` : 'transparent',
                '&:hover': { bgcolor: isFilterPanelOpen ? `${PRIMARY}1a` : '#f0f2f4' },
              }}
            >
              <ListFilter size={16} strokeWidth={1.5} />
              {activeFilterCount > 0 && (
                <Box sx={{
                  position: 'absolute', top: -2, right: -2,
                  width: 14, height: 14, borderRadius: '50%',
                  bgcolor: PRIMARY, color: 'white',
                  fontSize: 8, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  lineHeight: 1,
                }}>
                  {activeFilterCount}
                </Box>
              )}
            </IconButton>
          </Tooltip>

          {/* Page title */}
          <Typography sx={{
            fontSize: 16, fontWeight: 500, color: '#1f1d25',
            letterSpacing: '0px', lineHeight: 1, whiteSpace: 'nowrap',
            fontFamily: 'Roboto, sans-serif'
          }}>
            {title}
          </Typography>

          {/* + New button — opens dropdown */}
          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon sx={{ fontSize: '16px !important' }} />}
            onClick={handleNewClick}
            sx={{
              bgcolor: PRIMARY, borderRadius: '100px',
              textTransform: 'none', boxShadow: 'none',
              fontWeight: 600, fontSize: 13, height: 30, px: 1.75, ml: '6px',
              fontFamily: 'Roboto, sans-serif',
              '&:hover': { bgcolor: '#312e81', boxShadow: 'none' },
            }}
          >
            New
          </Button>

          {/* ── New dropdown menu ─────────────────────────────────────────── */}
          <Menu
            anchorEl={newMenuAnchor}
            open={Boolean(newMenuAnchor)}
            onClose={closeNewMenu}
            transformOrigin={{ horizontal: 'left', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
            PaperProps={{
              sx: {
                mt: '6px', borderRadius: '12px', minWidth: 200,
                boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                '& .MuiMenuItem-root': { px: 2, py: '10px', gap: '12px', fontSize: 14, fontFamily: 'Roboto, sans-serif' },
              },
            }}
          >
            {/* Upload — files */}
            <MenuItem onClick={handleUploadFiles}>
              <ListItemIcon sx={{ minWidth: 0, color: 'rgba(17,16,20,0.56)' }}><UploadOutlinedIcon sx={{ fontSize: 20 }} /></ListItemIcon>
              <ListItemText primary="Upload" primaryTypographyProps={{ fontSize: 14, fontFamily: 'Roboto, sans-serif' }} />
            </MenuItem>
            {/* Disabled with tooltip for shared folders */}
            {currentFolderIsShared ? (
              <Tooltip title="Not available in shared folders" placement="right" arrow>
                <span>
                  <MenuItem disabled>
                    <ListItemIcon sx={{ minWidth: 0, color: 'rgba(17,16,20,0.26)' }}><UploadOutlinedIcon sx={{ fontSize: 20 }} /></ListItemIcon>
                    <ListItemText primary="Upload Folder" primaryTypographyProps={{ fontSize: 14, fontFamily: 'Roboto, sans-serif' }} />
                  </MenuItem>
                </span>
              </Tooltip>
            ) : (
              <MenuItem onClick={handleUploadFolder}>
                <ListItemIcon sx={{ minWidth: 0, color: 'rgba(17,16,20,0.56)' }}><UploadOutlinedIcon sx={{ fontSize: 20 }} /></ListItemIcon>
                <ListItemText primary="Upload Folder" primaryTypographyProps={{ fontSize: 14, fontFamily: 'Roboto, sans-serif' }} />
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
                <ListItemText primary={label} primaryTypographyProps={{ fontSize: 14, fontFamily: 'Roboto, sans-serif' }} />
              </MenuItem>
            ))}
            <MuiDivider sx={{ my: 0.5 }} />
            <MenuItem onClick={closeNewMenu} disabled>
              <ListItemIcon sx={{ minWidth: 0, color: 'rgba(17,16,20,0.38)' }}><AutoAwesomeIcon sx={{ fontSize: 20 }} /></ListItemIcon>
              <ListItemText primary="Create with AI" primaryTypographyProps={{ fontSize: 14, fontFamily: 'Roboto, sans-serif' }} />
            </MenuItem>
          </Menu>

          {/* More options (⋮) */}
          <IconButton
            size="small"
            aria-label="More options"
            onClick={e => setMoreAnchor(e.currentTarget)}
            sx={{ width: 30, height: 30, borderRadius: '100px', p: 0, color: 'rgba(17,16,20,0.56)', '&:hover': { bgcolor: '#f0f2f4' } }}
          >
            <MoreVertIcon sx={{ fontSize: 18 }} />
          </IconButton>
          <Menu
            anchorEl={moreAnchor}
            open={Boolean(moreAnchor)}
            onClose={() => setMoreAnchor(null)}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            PaperProps={{ sx: { minWidth: 200, borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.12)', py: 0.5, '& .MuiMenuItem-root': { px: 2, py: '10px', gap: '12px', fontSize: 14, fontFamily: 'Roboto, sans-serif' } } }}
          >
            <MenuItem onClick={() => {
              setMoreAnchor(null);
              startDownload({ folderName: currentFolder?.name ?? 'Folder', assetCount: currentFolder?.count ?? 0 });
            }}>
              <ListItemIcon sx={{ minWidth: 0, color: 'rgba(17,16,20,0.56)' }}><FileDownloadOutlinedIcon sx={{ fontSize: 20 }} /></ListItemIcon>
              <ListItemText primary="Download Folder" primaryTypographyProps={{ fontSize: 14, fontFamily: 'Roboto, sans-serif' }} />
            </MenuItem>
          </Menu>

          {/* Search */}
          <Box sx={{
            display: 'flex', alignItems: 'center', gap: '8px',
            width: 200, height: 34, borderRadius: '100px',
            bgcolor: '#f9fafa', px: '8px', flexShrink: 0, ml: '2px',
            border: '1px solid #e7e7e9',
            transition: 'border-color 0.15s, box-shadow 0.15s',
            '&:focus-within': {
              borderColor: PRIMARY,
              boxShadow: `0 0 0 3px ${PRIMARY}14`,
            },
          }}>
            <SearchIcon sx={{ fontSize: 18, color: '#9c99a9', flexShrink: 0 }} />
            <InputBase
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Find below"
              inputProps={{ 'aria-label': 'Search assets' }}
              sx={{
                flex: 1, fontSize: 13, fontFamily: 'Roboto, sans-serif',
                color: '#1f1d25',
                '& input': { p: 0 },
                '& input::placeholder': {
                  color: '#9c99a9', opacity: 1,
                  fontSize: 13, fontFamily: 'Roboto, sans-serif',
                },
              }}
            />
          </Box>
        </Box>

        {/* ── Right section ─────────────────────────────────────────────────── */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px' }}>

          {/* Item count */}
          <Typography sx={{
            fontSize: 12, color: '#686576', letterSpacing: '0.3px',
            fontFamily: 'Roboto, sans-serif', whiteSpace: 'nowrap', lineHeight: 1,
          }}>
            {filteredAssets.length}&thinsp;Items
          </Typography>

          {/* View mode cycle button */}
          <Tooltip title={VIEW_MODE_LABELS[viewMode]} placement="bottom">
            <IconButton
              size="small"
              aria-label="Change view"
              onClick={cycleViewMode}
              sx={{
                width: 30, height: 30, borderRadius: '100px', p: 0,
                color: PRIMARY,
                bgcolor: `${PRIMARY}14`,
                '&:hover': { bgcolor: `${PRIMARY}22` },
              }}
            >
              {VIEW_MODE_ICONS[viewMode]}
            </IconButton>
          </Tooltip>
        </Box>
        </Box>
      </Box>

      {/* ── AI suggestions banner ─────────────────────────────────────────── */}
      {/* {(suggestedAssets.length > 0 || autoTaggedAssets.length > 0) && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            px: 2.5,
            py: 1.125,
            bgcolor: `${PRIMARY}0D`,
            borderTop: '1px solid',
            borderBottom: '1px solid',
            borderColor: `${PRIMARY}25`,
            flexShrink: 0,
          }}
        >
          <AutoAwesomeIcon sx={{ fontSize: 16, color: PRIMARY, flexShrink: 0 }} />
          <Typography variant="body2" sx={{ flex: 1, fontSize: 13 }}>
            {suggestedAssets.length > 0 && (
              <Box component="span" sx={{ fontWeight: 600, color: PRIMARY }}>
                {suggestedAssets.length} need review
              </Box>
            )}
            {suggestedAssets.length > 0 && autoTaggedAssets.length > 0 && (
              <Box component="span" color="text.secondary"> · </Box>
            )}
            {autoTaggedAssets.length > 0 && (
              <Box component="span" sx={{ fontWeight: 600, color: PRIMARY }}>
                {autoTaggedAssets.length} auto-tagged
              </Box>
            )}
            <Box component="span" color="text.secondary">
              {suggestedAssets.length > 0
                ? ' — low-confidence fields require your review.'
                : ' — all fields detected with high confidence.'}
            </Box>
          </Typography>
          {suggestedAssets.length > 0 && (
            <Button
              size="small"
              onClick={handleOpenBulkReview}
              sx={{
                textTransform: 'none',
                color: PRIMARY,
                fontWeight: 600,
                fontSize: 12,
                minWidth: 0,
                px: 1.25,
                '&:hover': { bgcolor: `${PRIMARY}14` },
              }}
            >
              Review all {suggestedAssets.length > 1 ? `(${suggestedAssets.length})` : ''} →
            </Button>
          )}
        </Box>
      )} */}

      {/* ── Drop overlay ──────────────────────────────────────────────────── */}
      {isDragging && (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: `${PRIMARY}0A`,
            borderRadius: '12px',
            zIndex: 10,
            pointerEvents: 'none',
          }}
        >
          <Box sx={{ textAlign: 'center' }}>
            <AutoAwesomeIcon sx={{ fontSize: 40, color: PRIMARY, mb: 1, display: 'block', mx: 'auto' }} />
            <Typography variant="h6" sx={{ color: PRIMARY, fontWeight: 600 }}>
              Drop to upload & analyze
            </Typography>
            <Typography variant="body2" color="text.secondary">
              AI will detect vehicle tags automatically
            </Typography>
          </Box>
        </Box>
      )}

      {/* ── Main area: grid/table + filter panel ─────────────────────────── */}
      <Box sx={{ flex: 1, display: 'flex', gap: '12px', overflow: 'hidden', minHeight: 0 }}>

        {/* ── Asset grid / table ─────────────────────────────────────────── */}
        <Box
          onClick={(e: React.MouseEvent) => {
            if (e.target === e.currentTarget && selected.size > 0) clearSelection();
          }}
          sx={{ flex: 1, overflowY: 'auto', pb: 3, minWidth: 0 }}
        >
          {filteredAssets.length === 0 ? (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: 300,
                gap: 1.5,
                border: '2px dashed',
                borderColor: 'divider',
                borderRadius: '12px',
                color: 'text.disabled',
                cursor: 'pointer',
                mt: 1,
                mx: 2,
              }}
              onClick={handleNewClick}
            >
              <AddIcon sx={{ fontSize: 36 }} />
              <Typography variant="body2">
                {query ? 'No assets match your search' : 'Drop an image here or click New to upload'}
              </Typography>
            </Box>
          ) : isTableMode ? (
            /* ── Table modes ── */
            <div className="flex flex-col h-full overflow-hidden">
              {/* Table header */}
              <TableHeader
                onSelectAll={() => {
                  const allSel = filteredAssets.every(a => selected.has(a.id));
                  if (allSel) clearSelection();
                  else setSelected(new Set(filteredAssets.map(a => a.id)));
                }}
                allSelected={filteredAssets.length > 0 && filteredAssets.every(a => selected.has(a.id))}
              />
              {/* Table rows */}
              <div key={viewMode} className="flex-1 overflow-y-auto animate-grid-in">
                {filteredAssets.map(asset => (
                  <AssetTableRow
                    key={asset.id}
                    asset={asset}
                    selected={selected.has(asset.id)}
                    onToggle={() => handleSelect(asset.id, !selected.has(asset.id))}
                    compact={viewMode === 'table-compact'}
                  />
                ))}
              </div>
            </div>
          ) : (
            /* ── Grid modes ── */
            <div
              key={viewMode}
              className="grid gap-3 animate-grid-in pt-1 px-2"
              style={{ gridTemplateColumns: gridCols }}
            >
              {filteredAssets.map(asset =>
                viewMode === 'grid-horizontal' ? (
                  <HorizontalAssetCard
                    key={asset.id}
                    asset={asset}
                    selected={selected.has(asset.id)}
                    onToggle={handleSelect}
                  />
                ) : (
                  <AssetCard
                    key={asset.id}
                    asset={asset}
                    selected={selected.has(asset.id)}
                    onSelect={handleSelect}
                    onCardClick={handleCardClick}
                  />
                )
              )}
            </div>
          )}
        </Box>

        {/* FilterPanel is rendered in the left pane (App.tsx), not here */}
      </Box>

      {/* ── Asset modal ───────────────────────────────────────────────────── */}
      {isReviewOpen && reviewingAsset && (
        <LifestyleTaggerModal
          asset={reviewingAsset}
          open={isReviewOpen}
          onClose={handleReviewClose}
          onApproved={handleApproved}
          onDismissed={handleDismissed}
          mode={modalMode}
          queueAssets={reviewSessionAssets.length > 1 ? reviewSessionAssets : undefined}
          queueCurrentId={currentReviewId ?? undefined}
          onSkip={reviewPendingIds.length > 1 ? handleSkip : undefined}
          onJump={handleJump}
        />
      )}

      {/* ── Bulk upload modal ─────────────────────────────────────────────── */}
      {isBulkUploadOpen && bulkUploadFiles && (
        <LifestyleTaggerModal
          asset={{ id: 'bulk-placeholder', name: bulkUploadFiles[0].name, url: '', aiStatus: 'analyzing' } as Asset}
          open={isBulkUploadOpen}
          onClose={() => setBulkUploadFiles(undefined)}
          onApproved={handleApproved}
          onDismissed={() => {}}
          mode="detect"
          uploadFiles={bulkUploadFiles}
          onBulkSave={() => setBulkUploadFiles(undefined)}
        />
      )}

      {/* Folder upload confirmation dialog — from "+ New" dropdown */}
      <FolderUploadConfirmDialog
        open={Boolean(pendingFolderUpload)}
        folderName={pendingFolderUpload?.folderName ?? ''}
        files={pendingFolderUpload?.files ?? []}
        dest={pendingFolderUpload?.dest ?? { id: '', name: '', icon: 'folder' }}
        onClose={() => setPendingFolderUpload(null)}
      />

      <ReviewMetadataModal
        open={bulkEditOpen}
        assets={bulkEditAssets}
        onClose={() => setBulkEditOpen(false)}
        onSave={handleBulkSave}
      />
    </Box>
  );
}
