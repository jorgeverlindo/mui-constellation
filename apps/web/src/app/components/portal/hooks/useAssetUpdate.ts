import { useState, useCallback } from 'react';

const ASSETS_API_BASE = '/api/assets';

export interface AssetUpdatePayload {
  name: string;
  year: string;
  make: string;
  model: string;
  trim: string;
  lifestyle: string;
  tags: string[];
  needsReview?: boolean;
}

export interface UseAssetUpdateReturn {
  saving: boolean;
  saveError: string | null;
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
        throw new Error((body as { message?: string })?.message ?? `Save failed: ${response.status}`);
      }
      return true;
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Unknown error');
      return false;
    } finally {
      setSaving(false);
    }
  }, []);

  return { saving, saveError, save };
}
