export type AssetAIStatus = 'analyzing' | 'suggested' | 'auto-tagged' | 'approved' | 'not-vehicle';

export interface VehicleSuggestion {
  year: string;
  yearConfidence: number;
  make: string;
  makeConfidence: number;
  model: string;
  modelConfidence: number;
  trim: string;
  trimConfidence: number;
  lifestyle: string;
  tags: string[];
  confidence: number;
}

export interface Asset {
  id: string;
  name: string;
  url: string;
  mimeType?: string;
  dimensions?: string;
  year?: string;
  make?: string;
  model?: string;
  trim?: string;
  lifestyle?: string;
  tags?: string[];
  aiStatus?: AssetAIStatus;
  aiSuggestion?: VehicleSuggestion;
  needsReview?: boolean;
  isNewUpload?: boolean;
  archivedAt?: string;
  brand?: string;
  expiryDate?: string;
  description?: string;
  notes?: string;
}

export type ModalMode = 'detect' | 'review' | 'view';

export function resolveModalMode(asset: Asset): ModalMode {
  if (asset.aiStatus === 'analyzing' || asset.aiStatus === 'suggested') return 'detect';
  if (asset.needsReview) return 'review';
  return 'view';
}
