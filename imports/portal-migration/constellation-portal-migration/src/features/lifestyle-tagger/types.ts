// ─── Lifestyle Tagger — shared types ─────────────────────────────────────────
// Extracted from LifestyleTaggerModal.tsx. All interfaces and types used across
// the modal's sub-components live here.

import { Asset, VehicleSuggestion, ModalMode } from '../../types/asset';
import { AssetUpdatePayload } from '../../hooks/useAssetUpdate';

// ─── Modal props ─────────────────────────────────────────────────────────────
export interface LifestyleTaggerModalProps {
  asset: Asset;
  open: boolean;
  onClose: () => void;
  onApproved: (assetId: string, payload: AssetUpdatePayload) => void;
  onDismissed: (assetId: string) => void;
  /** Modal mode: 'view' (read-only), 'review' (editable, no AI), 'detect' (AI scanning). */
  mode?: ModalMode;
  // ── Bulk-review queue ──────────────────────────────────────────────────────
  queueAssets?: Asset[];
  queueCurrentId?: string;
  onSkip?: () => void;
  onJump?: (assetId: string) => void;
}

// ─── Panel props ─────────────────────────────────────────────────────────────
export interface MetadataPanelProps {
  asset: Asset;
  onApproved: (assetId: string, payload: AssetUpdatePayload) => void;
  onClose: () => void;
}

export interface ReviewPanelProps {
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

// ─── Navigation props ────────────────────────────────────────────────────────
export interface BottomThumbnailStripProps {
  assets: Asset[];
  currentId: string;
  onSelect?: (assetId: string) => void;
}

export interface ThumbnailRailProps {
  assets: Asset[];
  currentId: string;
  onJump?: (assetId: string) => void;
}

// ─── Field types ─────────────────────────────────────────────────────────────
export type FieldFeedback = 'none' | 'like' | 'dislike';

export type ViewTabId = 'metadata' | 'history' | 'enhance' | 'resize' | 'approval' | 'download';
