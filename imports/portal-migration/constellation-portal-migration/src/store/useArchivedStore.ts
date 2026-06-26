import { create } from 'zustand';
import { Asset } from '../types/asset';

interface ArchivedStore {
  archivedAssets: Asset[];
  archiveAsset:   (asset: Asset) => void;
  unarchiveAsset: (assetId: string) => void;
}

export const useArchivedStore = create<ArchivedStore>((set) => ({
  archivedAssets: [],

  archiveAsset: (asset) =>
    set(state => ({
      archivedAssets: [
        ...state.archivedAssets.filter(a => a.id !== asset.id),
        { ...asset, archivedAt: new Date().toISOString() },
      ],
    })),

  unarchiveAsset: (assetId) =>
    set(state => ({
      archivedAssets: state.archivedAssets.filter(a => a.id !== assetId),
    })),
}));
