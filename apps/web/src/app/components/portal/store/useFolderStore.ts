import { create } from 'zustand';

export type FolderIconType = 'folder' | 'folder-read-only' | 'folder-shared' | 'folder-account' | 'brand-kits' | 'star' | 'clock' | 'trash' | 'archive';

export interface Folder {
  id: string;
  name: string;
  parentId?: string | null;
  icon: FolderIconType;
  count?: number;
  isReadOnly?: boolean;
}

export const FOLDERS: Folder[] = [
  { id: 'constellation-motors', name: 'Constellation Motors', parentId: null, icon: 'folder', count: 248 },
  { id: 'const-internal', name: 'Internal', parentId: 'constellation-motors', icon: 'folder', count: 142 },
  { id: 'const-lifestyle', name: 'Lifestyle', parentId: 'const-internal', icon: 'folder', count: 64 },
  { id: 'const-lifestyle-luxury', name: 'Luxury', parentId: 'const-lifestyle', icon: 'folder', count: 28 },
  { id: 'const-lifestyle-adventure', name: 'Adventure', parentId: 'const-lifestyle', icon: 'folder', count: 36 },
  { id: 'const-product', name: 'Product', parentId: 'const-internal', icon: 'folder', count: 78 },
  { id: 'const-product-2024', name: '2024 Models', parentId: 'const-product', icon: 'folder', count: 45 },
  { id: 'const-product-2025', name: '2025 Models', parentId: 'const-product', icon: 'folder', count: 33 },
  { id: 'const-brand', name: 'Brand Assets', parentId: 'constellation-motors', icon: 'brand-kits', count: 106 },
  { id: 'const-shared', name: 'Shared with Dealers', parentId: 'constellation-motors', icon: 'folder-shared', count: 89, isReadOnly: false },
  { id: 'dealer-vw-lancaster', name: 'Jack Daniels VW', parentId: null, icon: 'folder-account', count: 76 },
  { id: 'vw-lancaster-jan', name: 'January Specials', parentId: 'dealer-vw-lancaster', icon: 'folder', count: 24 },
  { id: 'vw-lancaster-feb', name: 'February Offers', parentId: 'dealer-vw-lancaster', icon: 'folder', count: 18 },
  { id: 'vw-lancaster-tig', name: 'Tiguan Campaign', parentId: 'dealer-vw-lancaster', icon: 'folder', count: 34 },
  { id: 'dealer-bmw-beverly', name: 'Beverly Hills BMW', parentId: null, icon: 'folder-account', count: 112 },
  { id: 'bmw-bh-m-series', name: 'M Series', parentId: 'dealer-bmw-beverly', icon: 'folder', count: 58 },
  { id: 'bmw-bh-suv', name: 'SUV Line', parentId: 'dealer-bmw-beverly', icon: 'folder', count: 54 },
  { id: 'dealer-porsche-west', name: 'West Coast Porsche', parentId: null, icon: 'folder-account', count: 93 },
  { id: 'porsche-west-911', name: '911 Collection', parentId: 'dealer-porsche-west', icon: 'folder', count: 41 },
  { id: 'porsche-west-cayenne', name: 'Cayenne Series', parentId: 'dealer-porsche-west', icon: 'folder', count: 52 },
  { id: 'dealer-land-rover-na', name: 'North America Land Rover', parentId: null, icon: 'folder-account', count: 87 },
  { id: 'lr-na-defender', name: 'Defender Lineup', parentId: 'dealer-land-rover-na', icon: 'folder', count: 45 },
  { id: 'lr-na-range', name: 'Range Rover', parentId: 'dealer-land-rover-na', icon: 'folder', count: 42 },
  { id: 'shared-campaigns', name: 'Shared Campaigns', parentId: null, icon: 'folder-shared', count: 156 },
  { id: 'shared-q1', name: 'Q1 2025', parentId: 'shared-campaigns', icon: 'folder', count: 67 },
  { id: 'shared-q2', name: 'Q2 2025', parentId: 'shared-campaigns', icon: 'folder', count: 89 },
  { id: 'brand-kits', name: 'Brand Kits', parentId: null, icon: 'brand-kits', count: 44 },
  { id: 'starred', name: 'Starred', parentId: null, icon: 'star', count: 12 },
  { id: 'recent', name: 'Recent', parentId: null, icon: 'clock', count: 28 },
  { id: 'archived', name: 'Archived', parentId: null, icon: 'archive', count: 0 },
  { id: 'trash', name: 'Trash', parentId: null, icon: 'trash', count: 5 },
];

interface FolderState {
  folders: Folder[];
  expandedIds: string[];
  archivedIds: string[];
  toggleExpand: (id: string) => void;
  moveFolder: (folderId: string, newParentId: string | null) => void;
  renameFolder: (folderId: string, newName: string) => void;
  archiveFolder: (folderId: string) => void;
  unarchiveFolder: (folderId: string) => void;
  deleteFolder: (folderId: string) => void;
  addFolder: (folder: Folder) => void;
}

export function deriveFolderTree(folders: Folder[], parentId: string | null = null): Folder[] {
  return folders.filter(f => (f.parentId ?? null) === parentId);
}

export function getDescendantIds(folderId: string, folders: Folder[]): string[] {
  const children = folders.filter(f => f.parentId === folderId);
  return children.flatMap(c => [c.id, ...getDescendantIds(c.id, folders)]);
}

export function getFolderBreadcrumb(folderId: string, folders: Folder[]): Folder[] {
  const map = new Map(folders.map(f => [f.id, f]));
  const crumbs: Folder[] = [];
  let cur = map.get(folderId);
  while (cur) {
    crumbs.unshift(cur);
    cur = cur.parentId ? map.get(cur.parentId) : undefined;
  }
  return crumbs;
}

export function getFolderChildren(folderId: string | null, folders: Folder[]): Folder[] {
  return folders.filter(f => (f.parentId ?? null) === folderId);
}

export const useFolderStore = create<FolderState>((set) => ({
  folders: FOLDERS,
  expandedIds: ['constellation-motors', 'const-internal'],
  archivedIds: [],

  toggleExpand: (id) => set(state => ({
    expandedIds: state.expandedIds.includes(id)
      ? state.expandedIds.filter(x => x !== id)
      : [...state.expandedIds, id],
  })),

  moveFolder: (folderId, newParentId) => set(state => ({
    folders: state.folders.map(f =>
      f.id === folderId ? { ...f, parentId: newParentId } : f
    ),
  })),

  renameFolder: (folderId, newName) => set(state => ({
    folders: state.folders.map(f =>
      f.id === folderId ? { ...f, name: newName } : f
    ),
  })),

  archiveFolder: (folderId) => set(state => ({
    archivedIds: [...state.archivedIds, folderId],
  })),

  unarchiveFolder: (folderId) => set(state => ({
    archivedIds: state.archivedIds.filter(id => id !== folderId),
  })),

  deleteFolder: (folderId) => set(state => {
    const toDelete = new Set([folderId, ...getDescendantIds(folderId, state.folders)]);
    return {
      folders: state.folders.filter(f => !toDelete.has(f.id)),
      archivedIds: state.archivedIds.filter(id => !toDelete.has(id)),
    };
  }),

  addFolder: (folder) => set(state => ({
    folders: [...state.folders, folder],
  })),
}));
