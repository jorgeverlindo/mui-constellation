import { create } from 'zustand';
import { Asset } from '../types/asset';

interface ArchivedState {
  archivedAssets: Asset[];
  archiveAsset: (asset: Asset) => void;
  unarchiveAsset: (assetId: string) => void;
}

export const useArchivedStore = create<ArchivedState>((set) => ({
  archivedAssets: [],

  archiveAsset: (asset) => set(state => ({
    archivedAssets: [...state.archivedAssets, { ...asset, archivedAt: new Date().toISOString() }],
  })),

  unarchiveAsset: (assetId) => set(state => ({
    archivedAssets: state.archivedAssets.filter(a => a.id !== assetId),
  })),
}));
