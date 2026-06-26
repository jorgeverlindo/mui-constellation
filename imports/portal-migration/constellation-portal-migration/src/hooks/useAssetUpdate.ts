import { useState, useCallback } from 'react';

// Point this at your real API base URL or proxy in production.
const ASSETS_API_BASE = '/api/assets';

export interface AssetUpdatePayload {
  name: string;
  year: string;
  make: string;
  model: string;
  trim: string;
  lifestyle: string;
  tags: string[];
  /**
   * Written by the analysis pipeline when confidence is low or YMMT is incomplete.
   * Cleared (false) when the user approves or dismisses via the review modal.
   */
  needsReview?: boolean;
}

export interface UseAssetUpdateReturn {
  saving: boolean;
  saveError: string | null;
  /** Returns true on success, false on failure. Caller handles toasts. */
  save: (assetId: string, payload: AssetUpdatePayload) => Promise<boolean>;
}

export function useAssetUpdate(): UseAssetUpdateReturn {
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const save = useCallback(async (assetId: string, payload: AssetUpdatePayload): Promise<boolean> => {
    setSaving(true);
    setSaveError(null);

    try {
      const response = await fetch(`${ASSETS_API_BASE}/${assetId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body?.message ?? `Save failed: ${response.status}`);
      }

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setSaveError(message);
      return false;
    } finally {
      setSaving(false);
    }
  }, []);

  return { saving, saveError, save };
}
