/**
 * AI pipeline states for an asset:
 *   analyzing    — image was just uploaded; background analysis is running
 *   suggested    — AI detected a vehicle but confidence is below 85%; awaiting user review
 *   auto-tagged  — AI detected a vehicle with ≥85% confidence on all fields; auto-approved
 *   approved     — user reviewed and confirmed the YMMT tags
 *   not-vehicle  — AI did not detect a vehicle (or user dismissed the suggestion)
 */
export type AssetAIStatus = 'analyzing' | 'suggested' | 'auto-tagged' | 'approved' | 'not-vehicle';

/** Flat AI vehicle detection result, stored on the asset until the user reviews it. */
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
  /** Overall vehicle detection confidence (0–1). */
  confidence: number;
}

export interface Asset {
  id: string;
  /** Display name shown below the thumbnail */
  name: string;
  /** URL used for the card thumbnail */
  url: string;
  /** MIME type, e.g. "image/jpeg" */
  mimeType?: string;
  /** Human-readable dimensions, e.g. "1080 × 1080" */
  dimensions?: string;
  // Vehicle metadata — populated after the user approves an AI suggestion
  year?: string;
  make?: string;
  model?: string;
  trim?: string;
  lifestyle?: string;
  tags?: string[];
  // General metadata fields
  brand?: string;
  expiryDate?: string;
  description?: string;
  notes?: string;
  // AI pipeline
  aiStatus?: AssetAIStatus;
  aiSuggestion?: VehicleSuggestion;
  /**
   * Persisted flag written by the analysis pipeline via the asset update API.
   * true  → AI returned low-confidence fields or incomplete YMMT; card shows "Review" badge.
   * false → cleared when the user approves or dismisses the suggestion.
   */
  needsReview?: boolean;
  /**
   * Transient flag set to true when an image was just uploaded in this session.
   * Used to determine whether the modal should run AI auto-detection.
   * Cleared after analysis completes or the user approves/dismisses.
   */
  isNewUpload?: boolean;
  /** ISO timestamp set when the asset is archived. Undefined means active. */
  archivedAt?: string;
}

/** Modal mode determines the right-panel behavior and whether AI analysis runs. */
export type ModalMode = 'view' | 'review' | 'detect';

/** Resolves the correct modal mode for an asset. */
export function resolveModalMode(asset: Asset): ModalMode {
  if (asset.isNewUpload) return 'detect';
  if (asset.needsReview) return 'review';
  return 'view';
}
