import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { keyframes } from '@emotion/react';
import {
  Dialog,
  Box,
  Typography,
  IconButton,
  Divider,
  Button,
  Chip,
  Tooltip,
  TextField,
  LinearProgress,
  CircularProgress,
  Autocomplete,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import RefreshIcon from '@mui/icons-material/Refresh';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { Select } from '../../ui/Select';
import { ConfidenceBadge, toConfidenceLevel } from '../../ui/ConfidenceBadge';
import { Spinner } from '../../ui/Spinner';
import { VerticalTabStrip } from '../../ui/VerticalTabStrip';
import { getMakes, getModels, getTrims, getYears } from '../../utils/vehicleDatabase';
import { Asset, VehicleSuggestion, ModalMode } from '../../types/asset';
import { AssetUpdatePayload } from '../../hooks/useAssetUpdate';
import { analyzeVehicle, VehicleAnalysisResult } from './useVehicleAnalysis';
import { ink, brand, surface as surfaceTokens, status as statusTokens } from '@jorgeverlindo/constellation-ux';

const BRAND         = brand.accent;
const BRAND_HOVER   = brand.accentHover;
const WARN          = '#EF9F27';
const CANVAS        = surfaceTokens.canvas;
const PANEL_WIDTH   = 356;
const RAIL_WIDTH    = 156;
const STRIP_HEIGHT  = 64;
const STRIP_THUMB_W = 56;
const STRIP_THUMB_H = 40;

// ─── Bulk upload queue item ─────────────────────────────────────────────────
export interface TaggingQueueItem {
  id: string;
  file: File;
  previewUrl: string;
  status: 'pending' | 'analyzing' | 'needs-review' | 'approved';
  result?: VehicleAnalysisResult;
  error?: string;
}

const ZOOM_STEP = 0.25;
const ZOOM_MIN  = 0.25;
const ZOOM_MAX  = 3;

const scanLineAnim = keyframes`
  0%   { top: 0%; }
  50%  { top: calc(100% - 2px); }
  100% { top: 0%; }
`;

const gridFadeIn = keyframes`
  from { opacity: 0; }
  to   { opacity: 1; }
`;

const calloutFadeIn = keyframes`
  from { opacity: 0; transform: translateY(4px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const REDETECT_SUGGESTIONS: VehicleSuggestion[] = [
  {
    year: '2024', yearConfidence: 0.91,
    make: 'Land Rover', makeConfidence: 0.96,
    model: 'Defender', modelConfidence: 0.93,
    trim: '110 X', trimConfidence: 0.72,
    lifestyle: 'Off-Road',
    tags: ['4x4', 'Trail Ready', 'Adventure', 'Rugged', 'Mud Terrain'],
    confidence: 0.94,
  },
  {
    year: '2024', yearConfidence: 0.93,
    make: 'Porsche', makeConfidence: 0.95,
    model: 'Cayenne', modelConfidence: 0.87,
    trim: 'GTS', trimConfidence: 0.68,
    lifestyle: 'Performance',
    tags: ['Track Day', 'Sport', 'Aerodynamic', 'High-Output', 'Low-Profile'],
    confidence: 0.91,
  },
  {
    year: '2025', yearConfidence: 0.85,
    make: 'Land Rover', makeConfidence: 0.97,
    model: 'Range Rover', modelConfidence: 0.89,
    trim: 'Autobiography', trimConfidence: 0.61,
    lifestyle: 'Luxury',
    tags: ['Premium', 'Executive', 'Comfort', 'Sport', 'Prestige'],
    confidence: 0.88,
  },
  {
    year: '2023', yearConfidence: 0.76,
    make: 'Ford', makeConfidence: 0.88,
    model: 'Bronco', modelConfidence: 0.81,
    trim: 'Wildtrak', trimConfidence: 0.44,
    lifestyle: 'Adventure',
    tags: ['Expedition', 'Overlanding', 'Tow Ready', 'Family', 'Versatile'],
    confidence: 0.79,
  },
];

let redetectIndex = 0;
function getNextRedetectSuggestion(currentMake?: string): VehicleSuggestion {
  for (let i = 0; i < REDETECT_SUGGESTIONS.length; i++) {
    const candidate = REDETECT_SUGGESTIONS[(redetectIndex + i) % REDETECT_SUGGESTIONS.length];
    if (candidate.make !== currentMake) {
      redetectIndex = (redetectIndex + i + 1) % REDETECT_SUGGESTIONS.length;
      return candidate;
    }
  }
  const r = REDETECT_SUGGESTIONS[redetectIndex % REDETECT_SUGGESTIONS.length];
  redetectIndex++;
  return r;
}

function getConfidenceColor(_score: number): string {
  return BRAND;
}

const IcoMetadata = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M10.25 9L7.95711 11.2929C7.56658 11.6834 7.56658 12.3166 7.95711 12.7071L10.25 15M13.75 9L16.0429 11.2929C16.4334 11.6834 16.4334 12.3166 16.0429 12.7071L13.75 15M4.75 20.25H19.25C19.8023 20.25 20.25 19.8023 20.25 19.25V4.75C20.25 4.19772 19.8023 3.75 19.25 3.75H4.75C4.19772 3.75 3.75 4.19772 3.75 4.75V19.25C3.75 19.8023 4.19772 20.25 4.75 20.25Z" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IcoHistory = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M12 7.75V12L15.5 15.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M2.75 4.75V8.75H6.75" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M3.25 15.0833C4.52169 18.676 7.95303 21.25 11.9864 21.25C17.1026 21.25 21.25 17.1086 21.25 12C21.25 6.89137 17.1026 2.75 11.9864 2.75C8.14808 2.75 4.85497 5.08106 3.44947 8.40278" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IcoEnhance = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M8.71906 3.56014C8.6845 3.62926 8.62846 3.6853 8.55934 3.71986L7.63803 4.18052C7.3748 4.31213 7.3748 4.68778 7.63803 4.81939L8.55934 5.28005C8.62846 5.31461 8.6845 5.37065 8.71906 5.43977L9.17972 6.36108C9.31133 6.62431 9.68698 6.62431 9.81859 6.36108L10.2792 5.43977C10.3138 5.37065 10.3698 5.31461 10.439 5.28005L11.3603 4.81939C11.6235 4.68778 11.6235 4.31213 11.3603 4.18051L10.439 3.71986C10.3698 3.6853 10.3138 3.62926 10.2792 3.56014L9.81859 2.63883C9.68698 2.3756 9.31133 2.3756 9.17972 2.63883L8.71906 3.56014Z" fill="currentColor"/>
    <path d="M4.40702 7.18422C4.35864 7.28098 4.28018 7.35944 4.18342 7.40782L2.89358 8.05274C2.52506 8.237 2.52506 8.7629 2.89358 8.94717L4.18342 9.59209C4.28018 9.64047 4.35864 9.71893 4.40702 9.81569L5.05194 11.1055C5.2362 11.4741 5.7621 11.4741 5.94637 11.1055L6.59128 9.81569C6.63967 9.71893 6.71813 9.64047 6.81489 9.59209L8.10473 8.94717C8.47325 8.7629 8.47325 8.237 8.10473 8.05274L6.81489 7.40782C6.71813 7.35944 6.63967 7.28098 6.59128 7.18422L5.94637 5.89438C5.7621 5.52586 5.2362 5.52586 5.05194 5.89438L4.40702 7.18422Z" fill="currentColor"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M20.6919 3.63073C20.0404 2.97927 18.9954 2.94447 18.302 3.55116L7.50391 12.9995L7.5 12.9995C5.01472 12.9995 3 15.0142 3 17.4995V21.2495C3 21.6637 3.33579 21.9995 3.75 21.9995H7.5C9.98528 21.9995 12 19.9848 12 17.4995L12 17.4956L21.4484 6.69748C22.0551 6.00412 22.0203 4.95913 21.3688 4.30766L20.6919 3.63073ZM11.6097 15.6638C11.1581 14.6541 10.3454 13.8415 9.33572 13.3898L19.2898 4.68003C19.3889 4.59336 19.5381 4.59833 19.6312 4.69139L20.3081 5.36832C20.4012 5.46139 20.4062 5.61067 20.3195 5.70972L11.6097 15.6638ZM4.5 17.4995C4.5 15.8427 5.84315 14.4995 7.5 14.4995C7.57422 14.4995 7.64768 14.5022 7.72031 14.5075C9.20109 14.6146 10.385 15.7984 10.4921 17.2792C10.4973 17.3518 10.5 17.4253 10.5 17.4995C10.5 19.1564 9.15685 20.4995 7.5 20.4995H4.5V17.4995Z" fill="currentColor"/>
  </svg>
);
const IcoResize = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M13.75 3.75H20.25V10.25M13.75 10.25L19.4766 4.52344M10.25 13.75L4.52344 19.4766M3.75 13.75V20.25H10.25" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IcoApproval = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M11.8523 13.2513C8.13261 13.3158 5.42399 15.8176 4.67155 19.1657C4.54235 19.7406 5.00917 20.25 5.59842 20.25H11.5M11.8523 13.2513C11.9014 13.2504 11.9506 13.25 12 13.25C12.3521 13.25 12.6954 13.2717 13.029 13.3138M11.8523 13.2513C11.2022 13.2626 10.5834 13.3483 10.0001 13.5M13.029 13.3138C13.3627 13.3559 13.6867 13.4184 14.0004 13.5M13.029 13.3138C13.7309 13.4024 14.3904 13.5812 15 13.838M14.75 18.6L16.95 20.25L20.25 14.75M15.75 6.5C15.75 8.57107 14.0711 10.25 12 10.25C9.92894 10.25 8.25 8.57107 8.25 6.5C8.25 4.42893 9.92894 2.75 12 2.75C14.0711 2.75 15.75 4.42893 15.75 6.5Z" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IcoDownload = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M20.25 14.75V19.25C20.25 19.8023 19.8023 20.25 19.25 20.25H4.75C4.19772 20.25 3.75 19.8023 3.75 19.25V14.75M12 15V3.75M12 15L8.5 11.5M12 15L15.5 11.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IcoCopy = () => (
  <svg width="15" height="15" viewBox="0 0 20 20" fill="none">
    <path d="M6.45833 6.45833V3.95833C6.45833 3.4981 6.83143 3.125 7.29167 3.125H16.0417C16.5019 3.125 16.875 3.4981 16.875 3.95833V12.7167C16.875 13.1769 16.5019 13.55 16.0417 13.55H13.5417M3.125 7.29167V16.0417C3.125 16.5019 3.4981 16.875 3.95833 16.875H12.7083C13.1686 16.875 13.5417 16.5019 13.5417 16.0417V7.29167C13.5417 6.83143 13.1686 6.45833 12.7083 6.45833H3.95833C3.4981 6.45833 3.125 6.83143 3.125 7.29167Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IcoCalendar = () => (
  <svg width="15" height="15" viewBox="0 0 20 20" fill="none">
    <path d="M3.125 8.12496H16.875M6.45833 3.95829V2.29163M13.5417 3.95829V2.29163M3.95833 16.875H16.0417C16.5019 16.875 16.875 16.5019 16.875 16.0416V4.79163C16.875 4.33139 16.5019 3.95829 16.0417 3.95829H3.95833C3.4981 3.95829 3.125 4.33139 3.125 4.79163V16.0416C3.125 16.5019 3.4981 16.875 3.95833 16.875Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

type ViewTabId = 'metadata' | 'history' | 'enhance' | 'resize' | 'approval' | 'download';
const VIEW_TABS: { id: ViewTabId; label: string; Icon: React.FC }[] = [
  { id: 'metadata', label: 'Metadata', Icon: IcoMetadata },
  { id: 'history',  label: 'History',  Icon: IcoHistory  },
  { id: 'enhance',  label: 'Enhance',  Icon: IcoEnhance  },
  { id: 'resize',   label: 'Resize',   Icon: IcoResize   },
  { id: 'approval', label: 'Approval', Icon: IcoApproval },
  { id: 'download', label: 'Download', Icon: IcoDownload },
];

const inputSx = {
  '& .MuiOutlinedInput-root': { borderRadius: '6px', fontSize: 13 },
  '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: BRAND },
};
const chipSx = { height: 22, borderRadius: '100px', fontSize: 12 };

function VFieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <Typography sx={{ fontSize: 11, fontWeight: 500, color: 'text.secondary', mb: '4px', display: 'flex', gap: '2px' }}>
      {required && <Box component="span" sx={{ color: 'error.main' }}>*</Box>}
      {children}
    </Typography>
  );
}
function VCopyBtn() {
  return (
    <IconButton size="small" sx={{ p: '2px', color: 'text.disabled', flexShrink: 0, '&:hover': { color: 'text.primary', bgcolor: 'transparent' } }}>
      <IcoCopy />
    </IconButton>
  );
}
function VInfoRow({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.875, borderBottom: '1px solid', borderColor: 'divider', '&:last-child': { borderBottom: 'none' } }}>
      <Typography variant="caption" color="text.secondary" sx={{ fontSize: 12 }}>{label}</Typography>
      <Typography variant="caption" sx={{ fontWeight: 500, fontSize: 12, color: 'text.primary', maxWidth: 160, textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</Typography>
    </Box>
  );
}

const FIELD_REASONS = {
  year: ['Year badge on vehicle body', 'Headlight design evolution', 'Front fascia generation pattern'],
  make: ['Brand emblem recognition', 'Front grille signature shape', 'Logo placement & proportions'],
  model: ['Body silhouette profile', 'Rear design language', 'Wheel arch proportions'],
  trim: ['Trim-level badging visible', 'Wheel design variation', 'Exterior package features'],
} as const;

const SCAN_CALLOUTS = [
  { label: 'Front Grille', top: '52%', left: '36%', delay: '0.8s' },
  { label: 'Year Badge',   top: '28%', left: '62%', delay: '1.8s' },
  { label: 'Headlights',  top: '60%', left: '18%', delay: '3.0s' },
];

export interface LifestyleTaggerModalProps {
  asset: Asset;
  open: boolean;
  onClose: () => void;
  onApproved: (assetId: string, payload: AssetUpdatePayload) => void;
  onDismissed: (assetId: string) => void;
  mode?: ModalMode;
  queueAssets?: Asset[];
  queueCurrentId?: string;
  onSkip?: () => void;
  onJump?: (assetId: string) => void;
  uploadFiles?: File[];
  onBulkSave?: (items: TaggingQueueItem[]) => void;
}

export function LifestyleTaggerModal({
  asset,
  open,
  onClose,
  onApproved,
  onDismissed,
  mode = 'view',
  queueAssets,
  queueCurrentId,
  onSkip,
  onJump,
  uploadFiles,
  onBulkSave,
}: LifestyleTaggerModalProps) {
  const [zoom, setZoom] = useState(1);
  const [isScanning, setIsScanning] = useState(false);
  const [liveSuggestion, setLiveSuggestion] = useState<VehicleSuggestion | null>(null);
  const awaitingRealAnalysis = useRef(false);

  const SCAN_DURATION = 4800;
  const isDetect = mode === 'detect';
  const isMulti  = (queueAssets?.length ?? 0) > 1;

  const [bulkQueue, setBulkQueue] = useState<TaggingQueueItem[]>([]);
  const [bulkActiveId, setBulkActiveId] = useState<string | null>(null);
  const bulkInitRef = useRef<File[] | null>(null);

  const isBulkMode = bulkQueue.length >= 2;
  const bulkActiveItem = bulkQueue.find(q => q.id === bulkActiveId) ?? null;

  useEffect(() => {
    if (!uploadFiles || uploadFiles.length === 0) return;
    if (bulkInitRef.current === uploadFiles) return;
    bulkInitRef.current = uploadFiles;

    const items: TaggingQueueItem[] = uploadFiles.map((file, i) => ({
      id: `upload-${Date.now()}-${i}`,
      file,
      previewUrl: URL.createObjectURL(file),
      status: 'pending' as const,
    }));

    setBulkQueue(items);
    setBulkActiveId(items[0].id);

    const promises = items.map(item => {
      setBulkQueue(prev => prev.map(q =>
        q.id === item.id ? { ...q, status: 'analyzing' as const } : q
      ));
      return analyzeVehicle(item.file)
        .then(result => {
          setBulkQueue(prev => prev.map(q =>
            q.id === item.id ? { ...q, status: 'needs-review' as const, result } : q
          ));
        })
        .catch(err => {
          setBulkQueue(prev => prev.map(q =>
            q.id === item.id
              ? { ...q, status: 'needs-review' as const, error: err instanceof Error ? err.message : 'Unknown error' }
              : q
          ));
        });
    });
    Promise.allSettled(promises);
  }, [uploadFiles]);

  useEffect(() => {
    return () => {
      bulkQueue.forEach(item => URL.revokeObjectURL(item.previewUrl));
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleBulkApprove = useCallback((itemId: string) => {
    setBulkQueue(prev => prev.map(q =>
      q.id === itemId ? { ...q, status: 'approved' as const } : q
    ));
  }, []);

  const handleBulkApproveAll = useCallback(() => {
    setBulkQueue(prev => prev.map(q =>
      (q.status === 'needs-review' && q.result) ? { ...q, status: 'approved' as const } : q
    ));
  }, []);

  const handleBulkSave = useCallback(() => {
    if (!onBulkSave) return;
    const saveable = bulkQueue.filter(q => q.status === 'approved' && q.result);
    onBulkSave(saveable);
  }, [bulkQueue, onBulkSave]);

  const bulkCompletedCount = bulkQueue.filter(q =>
    (q.status === 'needs-review' || q.status === 'approved') && q.result
  ).length;

  useEffect(() => {
    setZoom(1);
    if (!isDetect) {
      setIsScanning(false);
      setLiveSuggestion(asset.aiSuggestion ?? null);
      awaitingRealAnalysis.current = false;
      return;
    }
    setIsScanning(true);
    setLiveSuggestion(null);
    if (asset.aiStatus === 'analyzing') {
      awaitingRealAnalysis.current = true;
      return;
    }
    awaitingRealAnalysis.current = false;
    const timer = setTimeout(() => {
      setLiveSuggestion(asset.aiSuggestion ?? null);
      setIsScanning(false);
    }, SCAN_DURATION);
    return () => clearTimeout(timer);
  }, [asset.id, isDetect]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!awaitingRealAnalysis.current) return;
    if (asset.aiStatus !== 'suggested') return;
    awaitingRealAnalysis.current = false;
    setLiveSuggestion(asset.aiSuggestion ?? null);
    setIsScanning(false);
  }, [asset.aiStatus, asset.aiSuggestion]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleClose = () => { setZoom(1); onClose(); };
  const zoomIn    = () => setZoom(z => Math.min(+(z + ZOOM_STEP).toFixed(2), ZOOM_MAX));
  const zoomOut   = () => setZoom(z => Math.max(+(z - ZOOM_STEP).toFixed(2), ZOOM_MIN));
  const zoomReset = () => setZoom(1);

  const handleRedetect = async () => {
    const currentMake = liveSuggestion?.make;
    setIsScanning(true);
    setLiveSuggestion(null);
    await new Promise(r => setTimeout(r, 4500 + Math.random() * 1000));
    const newSuggestion = getNextRedetectSuggestion(currentMake);
    setLiveSuggestion(newSuggestion);
    setIsScanning(false);
  };

  const queueTotal    = queueAssets?.length ?? 0;
  const queuePosition = isMulti ? (queueAssets!.findIndex(a => a.id === asset.id) + 1) : 1;
  const pendingCount  = queueAssets?.filter(a => a.aiStatus === 'suggested').length ?? 0;

  const handlePrev = () => {
    if (!queueAssets || !onJump) return;
    const idx = queueAssets.findIndex(a => a.id === asset.id);
    const prev = queueAssets[(idx - 1 + queueAssets.length) % queueAssets.length];
    onJump(prev.id);
  };
  const handleNext = () => {
    if (!queueAssets || !onJump) return;
    const idx = queueAssets.findIndex(a => a.id === asset.id);
    const next = queueAssets[(idx + 1) % queueAssets.length];
    onJump(next.id);
  };

  const titleContent = (() => {
    if (isBulkMode) {
      const activeFile = bulkActiveItem?.file;
      return (
        <Typography variant="subtitle2" noWrap sx={{ flex: 1, fontWeight: 600 }}>
          {activeFile?.name ?? 'Uploading…'}
        </Typography>
      );
    }
    if (isMulti && isDetect) {
      return (
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: BRAND, whiteSpace: 'nowrap' }}>
            {queuePosition} / {queueTotal}
          </Typography>
          <Typography variant="subtitle2" noWrap sx={{ fontWeight: 600, color: 'text.secondary' }}>—</Typography>
          <Typography variant="subtitle2" noWrap sx={{ fontWeight: 600, flex: 1 }}>
            {asset.name}
          </Typography>
        </Box>
      );
    }
    if (isMulti) {
      return (
        <Typography variant="subtitle2" noWrap sx={{ flex: 1, fontWeight: 600 }}>
          {queueTotal} assets selected — {asset.name}
        </Typography>
      );
    }
    if (isDetect) {
      return (
        <Typography variant="subtitle2" noWrap sx={{ flex: 1, fontWeight: 600 }}>
          AI Review — {asset.name}
        </Typography>
      );
    }
    if (mode === 'review') {
      return (
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
          <WarningAmberIcon sx={{ fontSize: 16, color: '#EF9F27' }} />
          <Typography variant="subtitle2" noWrap sx={{ fontWeight: 600 }}>
            Needs review — {asset.name}
          </Typography>
        </Box>
      );
    }
    const titleParts = [asset.make, asset.model].filter(Boolean);
    const title = titleParts.length > 0
      ? `${titleParts.join(' ')}${asset.lifestyle ? ` — ${asset.lifestyle}` : ''}`
      : asset.name;
    return (
      <Typography variant="subtitle2" noWrap sx={{ flex: 1, fontWeight: 600 }}>
        {title}
      </Typography>
    );
  })();

  const showLeftRail    = isDetect && isMulti && queueAssets;
  const showBottomStrip = !isDetect && isMulti && queueAssets;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth={false}
      PaperProps={{
        sx: {
          width: 'calc(100vw - 32px)',
          maxWidth: 'calc(100vw - 32px)',
          height: 'calc(100vh - 32px)',
          borderRadius: '16px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          m: 0,
        },
      }}
    >
      {/* Title bar */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 3, py: 1.5, flexShrink: 0 }}>
        {isDetect && <AutoAwesomeIcon sx={{ fontSize: 18, color: BRAND }} />}

        {titleContent}

        {isDetect && isMulti && pendingCount > 0 && (
          <Chip
            label={`${pendingCount} pending`}
            size="small"
            sx={{ bgcolor: `${BRAND}14`, color: BRAND, fontWeight: 600, fontSize: 11, height: 22, borderRadius: '100px' }}
          />
        )}

        {isScanning && (
          <Chip
            icon={<CircularProgress size={10} sx={{ color: `${BRAND} !important`, ml: '6px !important' }} />}
            label={awaitingRealAnalysis.current ? 'Analyzing…' : 'Re-analyzing…'}
            size="small"
            sx={{ bgcolor: `${BRAND}14`, color: BRAND, fontWeight: 600, fontSize: 11, height: 22, borderRadius: '100px' }}
          />
        )}

        <IconButton size="small" onClick={handleClose} aria-label="Close dialog">
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>
      <Divider />

      {/* Content row */}
      {isBulkMode ? (
        <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Left thumbnail rail (bulk) */}
          <BulkThumbnailRail
            queue={bulkQueue}
            activeId={bulkActiveId}
            onSelect={setBulkActiveId}
          />

          {/* Center canvas */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', bgcolor: CANVAS, overflow: 'hidden', position: 'relative' }}>
            <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'auto', p: 4, position: 'relative' }}>
              {bulkActiveItem && (
                <img
                  src={bulkActiveItem.previewUrl}
                  alt={bulkActiveItem.file.name}
                  style={{
                    maxWidth: '100%', maxHeight: '100%', objectFit: 'contain',
                    transform: `scale(${zoom})`, transformOrigin: 'center',
                    transition: 'transform 0.15s ease', borderRadius: 8, display: 'block',
                  }}
                />
              )}
            </Box>
            <Box sx={{ px: 2, pb: 2, display: 'flex', gap: 0.5 }}>
              {([
                { symbol: '−', action: zoomOut,   label: 'Zoom out',   disabled: zoom <= ZOOM_MIN },
                { symbol: '↺', action: zoomReset, label: 'Reset zoom', disabled: zoom === 1 },
                { symbol: '+', action: zoomIn,    label: 'Zoom in',    disabled: zoom >= ZOOM_MAX },
              ] as const).map(({ symbol, action, label, disabled }) => (
                <Tooltip key={label} title={label}>
                  <span>
                    <IconButton size="small" onClick={action} disabled={disabled} aria-label={label}
                      sx={{ width: 32, height: 32, border: '1px solid', borderColor: 'divider', borderRadius: '8px', bgcolor: 'background.paper', fontSize: 14 }}>
                      {symbol}
                    </IconButton>
                  </span>
                </Tooltip>
              ))}
            </Box>
          </Box>

          {/* Right panel (bulk) */}
          <Box sx={{ width: PANEL_WIDTH, flexShrink: 0, display: 'flex', flexDirection: 'column', borderLeft: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
            <BulkMetadataPanel
              activeItem={bulkActiveItem}
              queue={bulkQueue}
              onApproveItem={handleBulkApprove}
              onApproveAll={handleBulkApproveAll}
              onSave={handleBulkSave}
              onClose={handleClose}
              completedCount={bulkCompletedCount}
            />
          </Box>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Thumbnail rail (detect mode bulk queue) */}
          {showLeftRail && (
            <ThumbnailRail
              assets={queueAssets}
              currentId={queueCurrentId ?? asset.id}
              onJump={onJump}
            />
          )}

          {/* Image canvas */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', bgcolor: CANVAS, overflow: 'hidden', position: 'relative' }}>
            <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'auto', p: 4, position: 'relative' }}>
              <img
                src={asset.url}
                alt={asset.name}
                style={{
                  maxWidth: '100%', maxHeight: '100%', objectFit: 'contain',
                  transform: `scale(${zoom})`, transformOrigin: 'center',
                  transition: 'transform 0.15s ease', borderRadius: 8, display: 'block',
                  filter: isScanning ? 'brightness(0.82)' : 'none',
                }}
              />
              {isScanning && <ScanOverlay />}
              {showBottomStrip && (
                <>
                  <IconButton onClick={handlePrev} sx={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', bgcolor: 'rgba(255,255,255,0.85)', boxShadow: '0 2px 8px rgba(0,0,0,0.12)', '&:hover': { bgcolor: '#fff' }, width: 36, height: 36 }}>
                    <ChevronLeftIcon />
                  </IconButton>
                  <IconButton onClick={handleNext} sx={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', bgcolor: 'rgba(255,255,255,0.85)', boxShadow: '0 2px 8px rgba(0,0,0,0.12)', '&:hover': { bgcolor: '#fff' }, width: 36, height: 36 }}>
                    <ChevronRightIcon />
                  </IconButton>
                </>
              )}
            </Box>

            {showBottomStrip && (
              <BottomThumbnailStrip
                assets={queueAssets}
                currentId={queueCurrentId ?? asset.id}
                onSelect={onJump}
              />
            )}

            <Box sx={{ px: 2, pb: 2, display: 'flex', gap: 0.5 }}>
              {([
                { symbol: '−', action: zoomOut,   label: 'Zoom out',   disabled: zoom <= ZOOM_MIN },
                { symbol: '↺', action: zoomReset, label: 'Reset zoom', disabled: zoom === 1 },
                { symbol: '+', action: zoomIn,    label: 'Zoom in',    disabled: zoom >= ZOOM_MAX },
              ] as const).map(({ symbol, action, label, disabled }) => (
                <Tooltip key={label} title={label}>
                  <span>
                    <IconButton size="small" onClick={action} disabled={disabled} aria-label={label}
                      sx={{ width: 32, height: 32, border: '1px solid', borderColor: 'divider', borderRadius: '8px', bgcolor: 'background.paper', fontSize: 14 }}>
                      {symbol}
                    </IconButton>
                  </span>
                </Tooltip>
              ))}
            </Box>
          </Box>

          {/* Right panel — mode-driven */}
          <Box sx={{ width: PANEL_WIDTH, flexShrink: 0, display: 'flex', flexDirection: 'column', borderLeft: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
            {mode === 'view' ? (
              <MetadataPanel asset={asset} onApproved={onApproved} onClose={handleClose} />
            ) : mode === 'review' ? (
              <ReviewPanel
                asset={asset}
                suggestion={liveSuggestion ?? asset.aiSuggestion ?? null}
                isScanning={isScanning}
                mode="review"
                onApproved={onApproved}
                onDismissed={onDismissed}
                onRedetect={handleRedetect}
                onSkip={onSkip}
                hasMoreInQueue={isMulti && pendingCount > 1}
              />
            ) : (
              <ReviewPanel
                asset={asset}
                suggestion={liveSuggestion}
                isScanning={isScanning}
                mode="detect"
                onApproved={onApproved}
                onDismissed={onDismissed}
                onRedetect={handleRedetect}
                onSkip={onSkip}
                hasMoreInQueue={isMulti && pendingCount > 1}
              />
            )}
          </Box>
        </Box>
      )}
    </Dialog>
  );
}

// ─── Metadata Panel (View mode) ───────────────────────────────────────────────
interface MetadataPanelProps {
  asset: Asset;
  onApproved: (assetId: string, payload: AssetUpdatePayload) => void;
  onClose: () => void;
}

function MetadataPanel({ asset, onApproved, onClose }: MetadataPanelProps) {
  const [activeTab,    setActiveTab]   = useState<ViewTabId>('metadata');
  const [saving,       setSaving]      = useState(false);
  const [year,        setYear]        = useState(asset.year  ?? '');
  const [make,        setMake]        = useState(asset.make  ?? '');
  const [model,       setModel]       = useState(asset.model ?? '');
  const [trim,        setTrim]        = useState(asset.trim  ?? '');
  const [tags,        setTags]        = useState<string[]>(asset.tags ?? []);
  const [assetName,   setAssetName]   = useState(asset.name);
  const [brands,      setBrands]      = useState<string[]>(asset.make ? [asset.make] : []);
  const [expiryDate,  setExpiryDate]  = useState('');
  const [description, setDescription] = useState('');
  const [notes,       setNotes]       = useState('');

  const hasLifestyle   = tags.includes('Lifestyle');
  const ymmtTouched    = Boolean(year || make || model || trim);
  const ymmtIncomplete = hasLifestyle && ymmtTouched && !(year && make && model);

  useEffect(() => {
    setYear(asset.year ?? '');
    setMake(asset.make ?? '');
    setModel(asset.model ?? '');
    setTrim(asset.trim ?? '');
    setTags(asset.tags ?? []);
    setAssetName(asset.name);
    setBrands(asset.make ? [asset.make] : []);
    setExpiryDate('');
    setDescription('');
    setNotes('');
    setActiveTab('metadata');
    setSaving(false);
  }, [asset.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const years  = useMemo(() => getYears(),            []);
  const makes  = useMemo(() => getMakes(),            []);
  const models = useMemo(() => getModels(make),       [make]);
  const trims  = useMemo(() => getTrims(make, model), [make, model]);

  const handleMakeChange  = (v: string) => { setMake(v); setModel(''); setTrim(''); };
  const handleModelChange = (v: string) => { setModel(v); setTrim(''); };

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 600));
    setSaving(false);
    const payload: AssetUpdatePayload = {
      name: assetName,
      year:  hasLifestyle ? year  : '',
      make:  hasLifestyle ? make  : (brands[0] ?? ''),
      model: hasLifestyle ? model : '',
      trim:  hasLifestyle ? trim  : '',
      lifestyle: hasLifestyle ? 'Lifestyle' : '',
      tags,
      needsReview: false,
    };
    onApproved(asset.id, payload);
  };

  return (
    <Box sx={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      <VerticalTabStrip tabs={VIEW_TABS} activeId={activeTab} onChange={(id) => setActiveTab(id as ViewTabId)} />
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        <Box sx={{ px: 2.5, py: 1.75, flexShrink: 0 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: 18 }}>Metadata</Typography>
        </Box>
        <Divider />

        <Box sx={{ flex: 1, overflowY: 'auto', px: 2.5, py: 2, '&::-webkit-scrollbar': { width: 4 }, '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(0,0,0,0.15)', borderRadius: 2 } }}>
          {activeTab !== 'metadata' ? (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
              <Typography sx={{ color: 'text.disabled', fontSize: 13 }}>Coming soon</Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ mb: 2 }}>
                <VFieldLabel required>Name</VFieldLabel>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <TextField size="small" fullWidth value={assetName} onChange={e => setAssetName(e.target.value)} sx={inputSx} />
                  <VCopyBtn />
                </Box>
              </Box>

              <Box sx={{ mb: 2 }}>
                <VFieldLabel>Brand</VFieldLabel>
                <Autocomplete
                  multiple freeSolo size="small" options={[]} value={brands}
                  onChange={(_, v) => setBrands(v as string[])}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => {
                      const { key, ...rest } = getTagProps({ index });
                      return <Chip key={key} label={option} size="small" {...rest} sx={chipSx} />;
                    })
                  }
                  renderInput={(params) => (
                    <TextField {...params} size="small" placeholder={brands.length === 0 ? 'Add brand…' : ''} sx={inputSx} />
                  )}
                />
              </Box>

              <Box sx={{ mb: 2 }}>
                <VFieldLabel>Tags</VFieldLabel>
                <Autocomplete
                  multiple freeSolo size="small" options={['Lifestyle']} value={tags}
                  filterOptions={(options) => options.filter(o => !tags.includes(o))}
                  onChange={(_, v) => setTags(v as string[])}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => {
                      const { key, ...rest } = getTagProps({ index });
                      return <Chip key={key} label={option} size="small" {...rest} sx={chipSx} />;
                    })
                  }
                  renderInput={(params) => (
                    <TextField {...params} size="small" placeholder={tags.length === 0 ? 'Add tag…' : ''} sx={inputSx} />
                  )}
                />
              </Box>

              {hasLifestyle && (
                <Box sx={{ mb: 2, p: 1.5, borderRadius: '10px', bgcolor: 'rgba(0,0,0,0.03)', border: `1px solid ${ymmtIncomplete ? '#fca5a5' : 'rgba(0,0,0,0.08)'}`, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Typography sx={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.6px', textTransform: 'uppercase', color: 'text.secondary' }}>
                    Vehicle Info
                  </Typography>
                  <Select id="vm-year"  label="Year"  value={year}  onChange={setYear}          options={years}  placeholder="Select year"                                              showCheckIcon={false} />
                  <Select id="vm-make"  label="Make"  value={make}  onChange={handleMakeChange} options={makes}  placeholder="Select make"                                              showCheckIcon={false} />
                  <Select id="vm-model" label="Model" value={model} onChange={handleModelChange} options={models} placeholder={make ? 'Select model' : 'Select a make first'}            disabled={!make}  showCheckIcon={false} />
                  <Select id="vm-trim"  label="Trim"  value={trim}  onChange={setTrim}          options={trims}  placeholder={model ? 'Select trim (optional)' : 'Select a model first'} disabled={!model} showCheckIcon={false} />
                  {ymmtIncomplete && (
                    <Typography sx={{ fontSize: 12, color: '#b91c1c' }}>
                      If adding vehicle info, Year, Make and Model must all be filled.
                    </Typography>
                  )}
                </Box>
              )}

              <Box sx={{ mb: 2 }}>
                <VFieldLabel>Expiration Date</VFieldLabel>
                <TextField
                  size="small" fullWidth value={expiryDate}
                  onChange={e => setExpiryDate(e.target.value)}
                  placeholder="MM/DD/YYYY HH:MM AM"
                  InputProps={{ endAdornment: <Box sx={{ color: 'text.disabled', display: 'flex', ml: '4px' }}><IcoCalendar /></Box> }}
                  sx={inputSx}
                />
              </Box>

              <Box sx={{ mb: 2 }}>
                <VFieldLabel>Description</VFieldLabel>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: '4px' }}>
                  <TextField size="small" fullWidth multiline minRows={2} value={description} onChange={e => setDescription(e.target.value)} sx={inputSx} />
                  <VCopyBtn />
                </Box>
              </Box>

              <Box sx={{ mb: 2 }}>
                <VFieldLabel>Notes</VFieldLabel>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: '4px' }}>
                  <TextField size="small" fullWidth multiline minRows={2} value={notes} onChange={e => setNotes(e.target.value)} sx={inputSx} />
                  <VCopyBtn />
                </Box>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Button
                  startIcon={<AddIcon sx={{ fontSize: 15 }} />} size="small"
                  sx={{ textTransform: 'none', color: BRAND, fontSize: 13, fontWeight: 500, p: 0, minWidth: 0, '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' } }}
                >
                  New Field
                </Button>
              </Box>

              <Divider sx={{ mb: 2 }} />
              <VInfoRow label="Asset ID"      value={asset.id.length > 14 ? asset.id.slice(0, 14) + '…' : asset.id} />
              <VInfoRow label="File Type"     value={asset.mimeType?.split('/')[1]?.toUpperCase() ?? '—'} />
              <VInfoRow label="File Size"     value="—" />
              <VInfoRow label="Dimensions"    value={asset.dimensions ?? '—'} />
              <VInfoRow label="Duration"      value="—" />
              <VInfoRow label="Artboards"     value="—" />
              <VInfoRow label="Date Uploaded" value="—" />
            </Box>
          )}
        </Box>

        <Box sx={{ flexShrink: 0, borderTop: '1px solid', borderColor: 'divider', px: 2.5, py: 1.5, display: 'flex', justifyContent: 'flex-end', gap: 1, bgcolor: 'background.paper' }}>
          {activeTab === 'metadata' ? (
            <Button
              variant="contained" size="small"
              disabled={saving || ymmtIncomplete} onClick={handleSave}
              startIcon={saving ? <Spinner size="sm" color="inherit" /> : undefined}
              sx={{ bgcolor: BRAND, borderRadius: '100px', textTransform: 'none', boxShadow: 'none', fontWeight: 600, '&:hover': { bgcolor: '#312e81', boxShadow: 'none' }, '&.Mui-disabled': { bgcolor: `${BRAND}40`, color: '#fff' } }}
            >
              {saving ? 'Saving…' : 'Save'}
            </Button>
          ) : (
            <Button size="small" onClick={onClose} sx={{ textTransform: 'none', color: 'text.secondary' }}>
              Close
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );
}

// ─── Scan overlay ─────────────────────────────────────────────────────────────
function ScanOverlay() {
  return (
    <Box sx={{ position: 'absolute', inset: 0, borderRadius: '8px', overflow: 'hidden', pointerEvents: 'none', zIndex: 2 }}>
      <Box sx={{
        position: 'absolute', inset: 0,
        backgroundImage: [
          `linear-gradient(rgba(99,87,225,0.12) 1px, transparent 1px)`,
          `linear-gradient(90deg, rgba(99,87,225,0.12) 1px, transparent 1px)`,
        ].join(', '),
        backgroundSize: '44px 44px',
        animation: `${gridFadeIn} 0.6s ease forwards`,
      }} />
      <Box sx={{
        position: 'absolute', left: 0, right: 0, height: '2px',
        background: 'linear-gradient(90deg, transparent 0%, rgba(99,87,225,0.5) 20%, #a78bfa 50%, rgba(99,87,225,0.5) 80%, transparent 100%)',
        boxShadow: '0 0 18px 8px rgba(99,87,225,0.45)',
        animation: `${scanLineAnim} 3.5s ease-in-out infinite`,
      }} />

      <Box sx={{ position: 'absolute', top: 20, left: 20, width: 22, height: 22, borderTop: `3px solid ${BRAND}`, borderLeft: `3px solid ${BRAND}`, borderRadius: '2px 0 0 0' }} />
      <Box sx={{ position: 'absolute', top: 20, right: 20, width: 22, height: 22, borderTop: `3px solid ${BRAND}`, borderRight: `3px solid ${BRAND}`, borderRadius: '0 2px 0 0' }} />
      <Box sx={{ position: 'absolute', bottom: 20, left: 20, width: 22, height: 22, borderBottom: `3px solid ${BRAND}`, borderLeft: `3px solid ${BRAND}`, borderRadius: '0 0 0 2px' }} />
      <Box sx={{ position: 'absolute', bottom: 20, right: 20, width: 22, height: 22, borderBottom: `3px solid ${BRAND}`, borderRight: `3px solid ${BRAND}`, borderRadius: '0 0 2px 0' }} />

      {SCAN_CALLOUTS.map(({ label, top, left, delay }) => (
        <Box key={label} sx={{ position: 'absolute', top, left, display: 'flex', alignItems: 'center', gap: 0.75, animation: `${calloutFadeIn} 0.55s ease forwards`, animationDelay: delay, opacity: 0 }}>
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: BRAND, boxShadow: `0 0 0 3px ${BRAND}40`, flexShrink: 0 }} />
          <Box sx={{ px: 1, py: 0.375, bgcolor: BRAND, borderRadius: '100px', backdropFilter: 'blur(4px)' }}>
            <Typography sx={{ fontSize: 11, fontWeight: 600, color: '#fff', lineHeight: 1.2, whiteSpace: 'nowrap' }}>
              {label}
            </Typography>
          </Box>
        </Box>
      ))}

      <Box sx={{ position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: 1, px: 1.5, py: 0.75, bgcolor: 'rgba(15,15,30,0.72)', backdropFilter: 'blur(8px)', borderRadius: '100px', border: `1px solid rgba(99,87,225,0.3)` }}>
        <CircularProgress size={11} sx={{ color: '#a78bfa' }} />
        <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#fff', whiteSpace: 'nowrap' }}>
          Analyzing Vehicle…
        </Typography>
      </Box>
    </Box>
  );
}

// ─── Bottom thumbnail strip ───────────────────────────────────────────────────
interface BottomThumbnailStripProps {
  assets: Asset[];
  currentId: string;
  onSelect?: (assetId: string) => void;
}

function BottomThumbnailStrip({ assets, currentId, onSelect }: BottomThumbnailStripProps) {
  const stripRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = stripRef.current?.querySelector<HTMLElement>('[data-active="true"]');
    if (el) el.scrollIntoView({ inline: 'center', behavior: 'smooth' });
  }, [currentId]);

  return (
    <Box
      ref={stripRef}
      sx={{
        height: STRIP_HEIGHT, flexShrink: 0, display: 'flex', alignItems: 'center',
        gap: '8px', px: 2, overflowX: 'auto', bgcolor: '#F0EFF8',
        borderTop: '1px solid', borderColor: 'divider',
        '&::-webkit-scrollbar': { height: 4 },
        '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(0,0,0,0.15)', borderRadius: 2 },
      }}
    >
      {assets.map(a => {
        const isActive = a.id === currentId;
        return (
          <Box
            key={a.id}
            data-active={isActive ? 'true' : undefined}
            onClick={() => !isActive && onSelect?.(a.id)}
            sx={{
              width: STRIP_THUMB_W, height: STRIP_THUMB_H, flexShrink: 0,
              borderRadius: '6px', overflow: 'hidden',
              border: isActive ? '2px solid #7F77DD' : '1px solid transparent',
              opacity: isActive ? 1 : 0.7,
              cursor: isActive ? 'default' : 'pointer',
              transition: 'opacity 0.15s, border-color 0.15s',
              '&:hover': { opacity: 1 },
            }}
          >
            <Box component="img" src={a.url} alt={a.name} sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          </Box>
        );
      })}
    </Box>
  );
}

// ─── Thumbnail rail (left, detect mode) ──────────────────────────────────────
interface ThumbnailRailProps {
  assets: Asset[];
  currentId: string;
  onJump?: (assetId: string) => void;
}

function ThumbnailRail({ assets, currentId, onJump }: ThumbnailRailProps) {
  const railRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    const currentEl = rail.querySelector<HTMLElement>('[data-current="true"]');
    if (currentEl) currentEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [currentId]);

  const approvedCount  = assets.filter(a => a.aiStatus === 'approved').length;
  const dismissedCount = assets.filter(a => a.aiStatus === 'not-vehicle').length;
  const pendingCount   = assets.filter(a => a.aiStatus === 'suggested').length;

  return (
    <Box sx={{ width: RAIL_WIDTH, flexShrink: 0, display: 'flex', flexDirection: 'column', borderRight: '1px solid', borderColor: 'divider', bgcolor: '#F7F8FA' }}>
      <Box sx={{ px: 1.5, pt: 1.5, pb: 1, flexShrink: 0 }}>
        <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', fontSize: 10, letterSpacing: 0.6, display: 'block', mb: 0.5 }}>
          Queue ({assets.length})
        </Typography>
        <Box sx={{ display: 'flex', gap: 0.375, mt: 0.5 }}>
          {assets.map((a) => (
            <Box
              key={a.id}
              sx={{
                flex: 1, height: 3, borderRadius: '2px',
                bgcolor: a.aiStatus === 'approved' ? brand.accentHover : a.aiStatus === 'not-vehicle' ? '#6B7280' : a.id === currentId ? BRAND : `${BRAND}30`,
                transition: 'background-color 0.2s',
              }}
            />
          ))}
        </Box>
        <Box sx={{ display: 'flex', gap: 1, mt: 0.75 }}>
          {approvedCount  > 0 && <Typography variant="caption" sx={{ fontSize: 10, color: brand.accentHover, fontWeight: 600 }}>{approvedCount} ✓</Typography>}
          {dismissedCount > 0 && <Typography variant="caption" sx={{ fontSize: 10, color: '#6B7280', fontWeight: 600 }}>{dismissedCount} ✗</Typography>}
          {pendingCount   > 0 && <Typography variant="caption" sx={{ fontSize: 10, color: 'text.disabled' }}>{pendingCount} left</Typography>}
        </Box>
      </Box>
      <Divider />
      <Box ref={railRef} sx={{ flex: 1, overflowY: 'auto', py: 0.5 }}>
        {assets.map((a, idx) => {
          const isCurrent   = a.id === currentId;
          const isApproved  = a.aiStatus === 'approved';
          const isDismissed = a.aiStatus === 'not-vehicle';
          const isPending   = a.aiStatus === 'suggested';
          return (
            <Box
              key={a.id}
              data-current={isCurrent ? 'true' : undefined}
              onClick={() => isPending && !isCurrent && onJump?.(a.id)}
              sx={{
                px: 1.25, py: 0.875,
                cursor: isPending && !isCurrent ? 'pointer' : 'default',
                bgcolor: isCurrent ? `${BRAND}0F` : 'transparent',
                borderLeft: isCurrent ? `3px solid ${BRAND}` : '3px solid transparent',
                transition: 'background-color 0.12s',
                '&:hover': isPending && !isCurrent ? { bgcolor: `${BRAND}0A` } : {},
              }}
            >
              <Box sx={{ position: 'relative', borderRadius: '6px', overflow: 'hidden', mb: 0.625, border: isCurrent ? `1.5px solid ${BRAND}` : '1.5px solid transparent' }}>
                <Box component="img" src={a.url} alt={a.name} sx={{ width: '100%', height: 72, objectFit: 'cover', display: 'block', opacity: isApproved || isDismissed ? 0.45 : 1, transition: 'opacity 0.2s' }} />
                {!isApproved && !isDismissed && (
                  <Box sx={{ position: 'absolute', top: 4, left: 4, width: 18, height: 18, borderRadius: '50%', bgcolor: isCurrent ? BRAND : 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography sx={{ fontSize: 9, fontWeight: 700, color: '#fff', lineHeight: 1 }}>{idx + 1}</Typography>
                  </Box>
                )}
                {isApproved && (
                  <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'rgba(0,0,0,0.25)' }}>
                    <CheckCircleIcon sx={{ color: '#22C55E', fontSize: 22 }} />
                  </Box>
                )}
                {isDismissed && (
                  <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'rgba(0,0,0,0.25)' }}>
                    <CancelIcon sx={{ color: '#EF4444', fontSize: 22 }} />
                  </Box>
                )}
              </Box>
              <Typography variant="caption" noWrap sx={{ display: 'block', fontSize: 10.5, lineHeight: 1.3, color: isCurrent ? BRAND : isApproved || isDismissed ? 'text.disabled' : 'text.secondary', fontWeight: isCurrent ? 600 : 400 }}>
                {a.name}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

// ─── Bulk thumbnail rail (left, bulk upload) ──────────────────────────────────
interface BulkThumbnailRailProps {
  queue: TaggingQueueItem[];
  activeId: string | null;
  onSelect: (id: string) => void;
}

function BulkThumbnailRail({ queue, activeId, onSelect }: BulkThumbnailRailProps) {
  const railRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    const el = rail.querySelector<HTMLElement>('[data-active="true"]');
    if (el) el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [activeId]);

  return (
    <Box
      ref={railRef}
      sx={{
        width: 220, flexShrink: 0, overflowY: 'auto', bgcolor: CANVAS,
        borderRight: '1px solid', borderColor: 'divider',
        display: 'flex', flexDirection: 'column', gap: '8px', p: '16px',
        '&::-webkit-scrollbar': { width: 4 },
        '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(0,0,0,0.15)', borderRadius: 2 },
      }}
    >
      {queue.map(item => {
        const isActive = item.id === activeId;
        return (
          <Box
            key={item.id}
            data-active={isActive ? 'true' : undefined}
            onClick={() => onSelect(item.id)}
            sx={{
              position: 'relative', borderRadius: '8px', overflow: 'hidden',
              cursor: 'pointer',
              bgcolor: isActive ? `${BRAND}1A` : 'transparent',
              opacity: isActive ? 1 : 0.75,
              transition: 'opacity 0.15s, background-color 0.15s',
              '&:hover': { opacity: 1 }, p: 0,
            }}
          >
            <Box
              component="img"
              src={item.previewUrl}
              alt={item.file.name}
              sx={{ width: '100%', aspectRatio: '3 / 2', objectFit: 'cover', display: 'block', borderRadius: '8px' }}
            />
            {item.status === 'analyzing' && (
              <Box sx={{ position: 'absolute', top: 6, right: 6, width: 20, height: 20, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CircularProgress size={12} sx={{ color: BRAND }} />
              </Box>
            )}
            {item.status === 'approved' && (
              <Box sx={{ position: 'absolute', top: 6, right: 6, width: 20, height: 20, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircleIcon sx={{ fontSize: 14, color: BRAND }} />
              </Box>
            )}
            {item.status === 'needs-review' && (
              <Box sx={{ position: 'absolute', top: 6, right: 6, width: 12, height: 12, borderRadius: '50%', bgcolor: WARN, border: '2px solid rgba(255,255,255,0.9)' }} />
            )}
          </Box>
        );
      })}
    </Box>
  );
}

// ─── Bulk metadata panel ──────────────────────────────────────────────────────
type BulkTabId = 'metadata' | 'enhance' | 'download';
const BULK_TABS: { id: BulkTabId; label: string; Icon: React.FC }[] = [
  { id: 'metadata', label: 'Metadata', Icon: IcoMetadata },
  { id: 'enhance',  label: 'Enhance',  Icon: IcoEnhance  },
  { id: 'download', label: 'Download', Icon: IcoDownload },
];

interface BulkMetadataPanelProps {
  activeItem: TaggingQueueItem | null;
  queue: TaggingQueueItem[];
  onApproveItem: (id: string) => void;
  onApproveAll: () => void;
  onSave: () => void;
  onClose: () => void;
  completedCount: number;
}

function BulkMetadataPanel({
  activeItem,
  queue: _queue,
  onApproveItem,
  onApproveAll,
  onSave,
  onClose,
  completedCount,
}: BulkMetadataPanelProps) {
  const [activeTab, setActiveTab] = useState<BulkTabId>('metadata');
  const [saving, setSaving] = useState(false);
  const [year,  setYear]  = useState('');
  const [make,  setMake]  = useState('');
  const [model, setModel] = useState('');
  const [trim,  setTrim]  = useState('');
  const [tags,  setTags]  = useState<string[]>([]);

  const result = activeItem?.result ?? null;
  const isAnalyzing = activeItem?.status === 'analyzing' || activeItem?.status === 'pending';

  useEffect(() => {
    if (!result) { setYear(''); setMake(''); setModel(''); setTrim(''); setTags([]); return; }
    setYear(result.vehicle.year.value);
    setMake(result.vehicle.make.value);
    setModel(result.vehicle.model.value);
    setTrim(result.vehicle.trim.value);
    setTags(result.tags);
  }, [activeItem?.id, result]); // eslint-disable-line react-hooks/exhaustive-deps

  const years  = useMemo(() => getYears(),            []);
  const makes  = useMemo(() => getMakes(),            []);
  const models = useMemo(() => getModels(make),       [make]);
  const trims  = useMemo(() => getTrims(make, model), [make, model]);

  const handleMakeChange  = (v: string) => { setMake(v); setModel(''); setTrim(''); };
  const handleModelChange = (v: string) => { setModel(v); setTrim(''); };

  const canApprove = Boolean(year && make && model) && !saving && !isAnalyzing;

  const handleApprove = async () => {
    if (!activeItem) return;
    setSaving(true);
    await new Promise(r => setTimeout(r, 600));
    setSaving(false);
    onApproveItem(activeItem.id);
  };

  const handleApproveAllAndSave = async () => {
    onApproveAll();
    setSaving(true);
    await new Promise(r => setTimeout(r, 600));
    setSaving(false);
    onSave();
  };

  const makeBadge = (field: 'year' | 'make' | 'model' | 'trim') => {
    if (!result) return undefined;
    const conf = result.vehicle[field].confidence;
    return <ConfidenceBadge level={toConfidenceLevel(conf)} score={conf} />;
  };

  return (
    <Box sx={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      <VerticalTabStrip tabs={BULK_TABS} activeId={activeTab} onChange={(id) => setActiveTab(id as BulkTabId)} />
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        <Box sx={{ px: 2.5, py: 1.75, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: 18 }}>
            Metadata
          </Typography>
          <IconButton size="small" onClick={onClose} sx={{ p: 0.5 }}>
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>
        <Divider />

        <Box sx={{ flex: 1, overflowY: 'auto', px: 2.5, py: 2, '&::-webkit-scrollbar': { width: 4 }, '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(0,0,0,0.15)', borderRadius: 2 } }}>
          {activeTab !== 'metadata' ? (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
              <Typography sx={{ color: 'text.disabled', fontSize: 13 }}>Coming soon</Typography>
            </Box>
          ) : isAnalyzing ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1.5, py: 1.25, bgcolor: `${BRAND}12`, borderRadius: '8px' }}>
                <AutoAwesomeIcon sx={{ fontSize: 16, color: BRAND }} />
                <Typography sx={{ fontSize: 13, fontWeight: 600, color: BRAND, lineHeight: 1.3 }}>
                  Auto-detecting vehicle YMMT information
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5, py: 4 }}>
                <CircularProgress size={28} sx={{ color: BRAND }} />
                <Typography sx={{ fontSize: 13, color: ink.secondary }}>
                  Auto-detecting Year..
                </Typography>
              </Box>
            </Box>
          ) : result ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Select id="bk-year"  label="Year"  value={year}  onChange={setYear}          options={years}  placeholder="Select year"                                              badge={makeBadge('year')}  showCheckIcon={false} />
              <Select id="bk-make"  label="Make"  value={make}  onChange={handleMakeChange} options={makes}  placeholder="Select make"                                              badge={makeBadge('make')}  showCheckIcon={false} />
              <Select id="bk-model" label="Model" value={model} onChange={handleModelChange} options={models} placeholder={make ? 'Select model' : 'Select a make first'}           disabled={!make}   badge={makeBadge('model')} showCheckIcon={false} />
              <Select id="bk-trim"  label="Trim"  value={trim}  onChange={setTrim}          options={trims}  placeholder={model ? 'Select trim (optional)' : 'Select a model first'} disabled={!model}  badge={makeBadge('trim')}  showCheckIcon={false} />
              <Box>
                <VFieldLabel>Tags</VFieldLabel>
                <Autocomplete
                  multiple freeSolo size="small" options={[]} value={tags}
                  onChange={(_, v) => setTags(v as string[])}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => {
                      const { key, ...rest } = getTagProps({ index });
                      return <Chip key={key} label={option} size="small" {...rest} sx={chipSx} />;
                    })
                  }
                  renderInput={(params) => (
                    <TextField {...params} size="small" placeholder={tags.length === 0 ? 'Add tag…' : ''} sx={inputSx} />
                  )}
                />
              </Box>
              <Divider />
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.6, fontSize: 10, display: 'block', mb: 1.25 }}>
                  File Info
                </Typography>
                {[
                  { label: 'File Name', value: activeItem?.file.name ?? '—' },
                  { label: 'File Type', value: activeItem?.file.type?.replace('image/', '').toUpperCase() ?? '—' },
                  { label: 'File Size', value: activeItem ? `${(activeItem.file.size / 1024).toFixed(0)} KB` : '—' },
                ].map(({ label, value }) => (
                  <VInfoRow key={label} label={label} value={value} />
                ))}
              </Box>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
              <Typography sx={{ color: 'text.disabled', fontSize: 13 }}>No image selected</Typography>
            </Box>
          )}
        </Box>

        <Box sx={{ flexShrink: 0, borderTop: '1px solid', borderColor: 'divider', px: 2.5, py: 1.5, display: 'flex', alignItems: 'center', gap: 1, bgcolor: 'background.paper' }}>
          <Button
            variant="contained" size="small"
            disabled={!canApprove} onClick={handleApprove}
            startIcon={saving && !completedCount ? <Spinner size="sm" color="inherit" /> : undefined}
            sx={{ bgcolor: BRAND, borderRadius: '100px', textTransform: 'none', boxShadow: 'none', fontWeight: 600, whiteSpace: 'nowrap', '&:hover': { bgcolor: BRAND_HOVER, boxShadow: 'none' }, '&.Mui-disabled': { bgcolor: `${BRAND}40`, color: '#fff' } }}
          >
            Approve &amp; save
          </Button>
          <Button
            variant="contained" size="small"
            disabled={completedCount === 0} onClick={handleApproveAllAndSave}
            startIcon={saving && completedCount > 0 ? <Spinner size="sm" color="inherit" /> : undefined}
            sx={{ bgcolor: BRAND, borderRadius: '100px', textTransform: 'none', boxShadow: 'none', fontWeight: 600, whiteSpace: 'nowrap', '&:hover': { bgcolor: BRAND_HOVER, boxShadow: 'none' }, '&.Mui-disabled': { bgcolor: `${BRAND}40`, color: '#fff' } }}
          >
            {`Approve all & save (${completedCount})`}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

// ─── Review panel (detect & review modes) ────────────────────────────────────
interface ReviewPanelProps {
  asset: Asset;
  suggestion: VehicleSuggestion | null;
  isScanning: boolean;
  mode: 'detect' | 'review';
  onApproved: (assetId: string, payload: AssetUpdatePayload) => void;
  onDismissed: (assetId: string) => void;
  onRedetect: () => void;
  onSkip?: () => void;
  hasMoreInQueue?: boolean;
}

const FIELD_DELAYS = { year: 0, make: 800, model: 1600, trim: 2400 };

function ReviewPanel({
  asset,
  suggestion,
  isScanning,
  mode,
  onApproved,
  onDismissed,
  onRedetect,
  onSkip,
  hasMoreInQueue,
}: ReviewPanelProps) {
  const s = suggestion;
  const isDetect = mode === 'detect';
  const [reviewTab, setReviewTab] = useState<ViewTabId>('metadata');
  const [year,      setYear]      = useState('');
  const [make,      setMake]      = useState('');
  const [model,     setModel]     = useState('');
  const [trim,      setTrim]      = useState('');
  const [tags,      setTags]      = useState<string[]>(s?.tags ?? asset.tags ?? []);
  const [assetName, setAssetName] = useState(asset.name);
  const [saving,    setSaving]    = useState(false);

  const [yearRevealed,  setYearRevealed]  = useState(false);
  const [makeRevealed,  setMakeRevealed]  = useState(false);
  const [modelRevealed, setModelRevealed] = useState(false);
  const [trimRevealed,  setTrimRevealed]  = useState(false);

  useEffect(() => {
    setSaving(false);
    if (mode === 'review') {
      if (isScanning) {
        setYear(''); setMake(''); setModel(''); setTrim(''); setTags([]);
        setYearRevealed(false); setMakeRevealed(false); setModelRevealed(false); setTrimRevealed(false);
        return;
      }
      if (suggestion && !yearRevealed) {
        const ss = suggestion;
        setTags(ss.tags ?? []);
        const t1 = setTimeout(() => { setYear(ss.year   ?? ''); setYearRevealed(true);  }, FIELD_DELAYS.year);
        const t2 = setTimeout(() => { setMake(ss.make   ?? ''); setMakeRevealed(true);  }, FIELD_DELAYS.make);
        const t3 = setTimeout(() => { setModel(ss.model ?? ''); setModelRevealed(true); }, FIELD_DELAYS.model);
        const t4 = setTimeout(() => { setTrim(ss.trim   ?? ''); setTrimRevealed(true);  }, FIELD_DELAYS.trim);
        return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
      }
      const src = suggestion ?? { year: asset.year ?? '', make: asset.make ?? '', model: asset.model ?? '', trim: asset.trim ?? '' };
      setYear(('year' in src ? src.year : '') ?? '');
      setMake(('make' in src ? src.make : '') ?? '');
      setModel(('model' in src ? src.model : '') ?? '');
      setTrim(('trim' in src ? src.trim : '') ?? '');
      setTags(suggestion?.tags ?? asset.tags ?? []);
      setYearRevealed(true); setMakeRevealed(true); setModelRevealed(true); setTrimRevealed(true);
      return;
    }
    setYear(''); setMake(''); setModel(''); setTrim(''); setTags([]);
    setYearRevealed(false); setMakeRevealed(false); setModelRevealed(false); setTrimRevealed(false);
    if (!suggestion) return;
    const ss = suggestion;
    setTags(ss.tags ?? []);
    const t1 = setTimeout(() => { setYear(ss.year   ?? ''); setYearRevealed(true);  }, FIELD_DELAYS.year);
    const t2 = setTimeout(() => { setMake(ss.make   ?? ''); setMakeRevealed(true);  }, FIELD_DELAYS.make);
    const t3 = setTimeout(() => { setModel(ss.model ?? ''); setModelRevealed(true); }, FIELD_DELAYS.model);
    const t4 = setTimeout(() => { setTrim(ss.trim   ?? ''); setTrimRevealed(true);  }, FIELD_DELAYS.trim);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [suggestion, mode, isScanning]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { setAssetName(asset.name); }, [asset.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleMakeChange  = (v: string) => { setMake(v); setModel(''); setTrim(''); };
  const handleModelChange = (v: string) => { setModel(v); setTrim(''); };

  const years  = useMemo(() => getYears(),            []);
  const makes  = useMemo(() => getMakes(),            []);
  const models = useMemo(() => getModels(make),       [make]);
  const trims  = useMemo(() => getTrims(make, model), [make, model]);

  const canApprove = Boolean(year && make && model) && !saving && !isScanning;

  const hasCorrected = Boolean(s) && (
    (yearRevealed  && year  !== '' && year  !== s!.year)  ||
    (makeRevealed  && make  !== '' && make  !== s!.make)  ||
    (modelRevealed && model !== '' && model !== s!.model) ||
    (trimRevealed  && trim  !== '' && trim  !== s!.trim)
  );

  const handleApprove = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 700));
    setSaving(false);
    const payload: AssetUpdatePayload = {
      name: assetName, year, make, model, trim,
      lifestyle: s?.lifestyle ?? asset.lifestyle ?? '',
      tags, needsReview: false,
    };
    onApproved(asset.id, payload);
  };

  const handleDismiss = () => onDismissed(asset.id);

  const makeBadgeNode = (field: 'year' | 'make' | 'model' | 'trim', revealed: boolean, confidence: number) => {
    if (!s || !revealed) return undefined;
    const reasons = FIELD_REASONS[field];
    const tooltipContent = (
      <Box sx={{ maxWidth: 196, p: 0.25 }}>
        <Typography sx={{ fontSize: 11, fontWeight: 700, mb: 0.625, lineHeight: 1.3 }}>
          {field.charAt(0).toUpperCase() + field.slice(1)} detection
        </Typography>
        {reasons.map((r: string) => (
          <Box key={r} sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.75, mb: 0.375 }}>
            <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: '#a78bfa', flexShrink: 0, mt: '4px' }} />
            <Typography sx={{ fontSize: 10.5, lineHeight: 1.4, color: 'rgba(255,255,255,0.88)' }}>{r}</Typography>
          </Box>
        ))}
      </Box>
    );
    return <ConfidenceBadge level={toConfidenceLevel(confidence)} score={confidence} tooltipContent={tooltipContent} />;
  };

  const yearBadgeN  = makeBadgeNode('year',  yearRevealed,  s?.yearConfidence  ?? 0);
  const makeBadgeN  = makeBadgeNode('make',  makeRevealed,  s?.makeConfidence  ?? 0);
  const modelBadgeN = makeBadgeNode('model', modelRevealed, s?.modelConfidence ?? 0);
  const trimBadgeN  = makeBadgeNode('trim',  trimRevealed,  s?.trimConfidence  ?? 0);

  const overallPct   = isScanning ? 0 : Math.round((s?.confidence ?? 0) * 100);
  const overallColor = isScanning ? BRAND : getConfidenceColor(s?.confidence ?? 0);

  return (
    <Box sx={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      <VerticalTabStrip tabs={VIEW_TABS} activeId={reviewTab} onChange={(id) => setReviewTab(id as ViewTabId)} />
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

        <Box sx={{ px: 2.5, py: 1.75, flexShrink: 0 }}>
          {mode === 'review' ? (
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: 18 }}>Metadata</Typography>
          ) : (
            <>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckCircleOutlineIcon sx={{ fontSize: 16, color: '#22C55E' }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Vehicle Detected</Typography>
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                Review and confirm the suggested tags before saving.
              </Typography>
            </>
          )}
        </Box>
        <Divider />

        {(isDetect || s) && (
          <Box sx={{ px: 2.5, pt: 2, pb: 1.75, bgcolor: `${BRAND}07`, borderBottom: '1px solid', borderColor: `${BRAND}18`, flexShrink: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.25 }}>
              <Box>
                {isScanning ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                    <CircularProgress size={22} sx={{ color: BRAND }} />
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: BRAND, lineHeight: 1.2 }}>Scanning…</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10.5 }}>Analyzing vehicle features</Typography>
                    </Box>
                  </Box>
                ) : (
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: overallColor, lineHeight: 1, fontSize: 32 }}>
                      {overallPct}
                      <Typography component="span" sx={{ fontSize: 18, fontWeight: 700, color: overallColor }}>%</Typography>
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.25, display: 'block', fontSize: 11 }}>
                      Overall detection confidence
                    </Typography>
                  </Box>
                )}
              </Box>
              <Button
                size="small" variant="outlined" onClick={onRedetect} disabled={isScanning}
                startIcon={<RefreshIcon sx={{ fontSize: 15 }} />}
                sx={{ textTransform: 'none', borderRadius: '100px', fontSize: 12, fontWeight: 600, color: BRAND, borderColor: `${BRAND}50`, '&:hover': { borderColor: BRAND, bgcolor: `${BRAND}0A` }, '&.Mui-disabled': { opacity: 0.4 }, whiteSpace: 'nowrap' }}
              >
                Re-detect
              </Button>
            </Box>
            <LinearProgress
              variant={isScanning ? 'indeterminate' : 'determinate'}
              value={isScanning ? undefined : overallPct}
              sx={{
                height: 6, borderRadius: '3px',
                bgcolor: isScanning ? `${BRAND}20` : `${overallColor}20`,
                '& .MuiLinearProgress-bar': { bgcolor: isScanning ? BRAND : overallColor, borderRadius: '3px', transition: 'transform 1s ease' },
              }}
            />
          </Box>
        )}

        {reviewTab !== 'metadata' && (
          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="body2" color="text.disabled">Coming soon</Typography>
          </Box>
        )}

        {reviewTab === 'metadata' && (
          <Box sx={{ flex: 1, overflowY: 'auto', px: 2.5, py: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box>
              <VFieldLabel required>Name</VFieldLabel>
              <TextField size="small" fullWidth value={assetName} onChange={e => setAssetName(e.target.value)} sx={inputSx} />
            </Box>

            <Select id="rv-year"  label="Year"  value={year}  onChange={setYear}          options={years}  placeholder="Select year"                                              disabled={isScanning}            badge={yearBadgeN}  showCheckIcon={false} />
            <Select id="rv-make"  label="Make"  value={make}  onChange={handleMakeChange} options={makes}  placeholder="Select make"                                              disabled={isScanning}            badge={makeBadgeN}  showCheckIcon={false} />
            <Select id="rv-model" label="Model" value={model} onChange={handleModelChange} options={models} placeholder={make ? 'Select model' : 'Select a make first'}           disabled={isScanning || !make}   badge={modelBadgeN} showCheckIcon={false} />
            <Select id="rv-trim"  label="Trim"  value={trim}  onChange={setTrim}          options={trims}  placeholder={model ? 'Select trim (optional)' : 'Select a model first'} disabled={isScanning || !model}  badge={trimBadgeN}  showCheckIcon={false} />

            {!isScanning && (
              <Box>
                <VFieldLabel>Tags</VFieldLabel>
                <Autocomplete
                  multiple freeSolo size="small" options={[]} value={tags}
                  onChange={(_, v) => setTags(v as string[])}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => {
                      const { key, ...rest } = getTagProps({ index });
                      return <Chip key={key} label={option} size="small" {...rest} sx={chipSx} />;
                    })
                  }
                  renderInput={(params) => (
                    <TextField {...params} size="small" placeholder={tags.length === 0 ? 'Add tag…' : ''} sx={inputSx} />
                  )}
                />
              </Box>
            )}

            {!isScanning && (
              <>
                <Divider />
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.6, fontSize: 10, display: 'block', mb: 1.25 }}>
                    File Info
                  </Typography>
                  {[
                    { label: 'File Type',  value: asset.mimeType?.replace('image/', '').toUpperCase() ?? '—' },
                    { label: 'Dimensions', value: asset.dimensions ?? '—' },
                    { label: 'Date Added', value: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) },
                    { label: 'Asset ID',   value: asset.id.length > 12 ? asset.id.slice(0, 12) + '…' : asset.id },
                  ].map(({ label, value }) => (
                    <Box key={label} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.875, borderBottom: '1px solid', borderColor: 'divider', '&:last-child': { borderBottom: 'none' } }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: 12 }}>{label}</Typography>
                      <Typography variant="caption" sx={{ fontWeight: 500, fontSize: 12, color: 'text.primary', maxWidth: 160, textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</Typography>
                    </Box>
                  ))}
                </Box>
              </>
            )}
          </Box>
        )}

        {hasCorrected && !isScanning && (
          <Box sx={{ flexShrink: 0, px: 2.5, py: 0.875, bgcolor: `${BRAND}0A`, borderTop: `1px solid ${BRAND}22`, display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <CheckCircleOutlineIcon sx={{ fontSize: 14, color: '#22C55E' }} />
            <Typography variant="caption" sx={{ fontSize: 11, color: BRAND, lineHeight: 1.4 }}>
              Correction noted — your changes help improve future detections.
            </Typography>
          </Box>
        )}

        <Box sx={{ flexShrink: 0, borderTop: '1px solid', borderColor: 'divider', px: 2.5, py: 1.75, display: 'flex', alignItems: 'center', gap: 1, bgcolor: 'background.paper' }}>
          <Button size="small" onClick={handleDismiss} disabled={isScanning} sx={{ textTransform: 'none', color: 'text.secondary', '&:hover': { bgcolor: 'action.hover' } }}>
            Dismiss
          </Button>
          <Box sx={{ flex: 1 }} />
          {onSkip && (
            <Tooltip title="Save for later and review next">
              <Button size="small" onClick={onSkip} disabled={isScanning} endIcon={<SkipNextIcon sx={{ fontSize: 15 }} />} sx={{ textTransform: 'none', color: 'text.secondary', fontWeight: 500, '&:hover': { bgcolor: 'action.hover' } }}>
                Skip
              </Button>
            </Tooltip>
          )}
          <Button
            variant="contained" size="small"
            disabled={!canApprove} onClick={handleApprove}
            startIcon={saving ? <Spinner size="sm" color="inherit" /> : undefined}
            sx={{ bgcolor: BRAND, borderRadius: '100px', textTransform: 'none', boxShadow: 'none', fontWeight: 600, whiteSpace: 'nowrap', '&:hover': { bgcolor: '#312e81', boxShadow: 'none' }, '&.Mui-disabled': { bgcolor: `${BRAND}40`, color: '#fff' } }}
          >
            {saving ? 'Saving…' : hasMoreInQueue ? 'Approve & next →' : 'Approve & save'}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
