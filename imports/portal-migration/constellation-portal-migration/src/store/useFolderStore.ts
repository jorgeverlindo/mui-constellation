import { create } from 'zustand';

// ─── Folder data model ────────────────────────────────────────────────────────
export type FolderIconType = 'folder' | 'folder-read-only' | 'folder-shared' | 'folder-account';

export interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  icon: FolderIconType;
  count?: number;
}

// ─── Flat folder list (mirrors FolderTree TREE_ITEMS, adds parentId) ──────────
// parentId null = root level
export const FOLDERS: Folder[] = [
  // ── Root level ────────────────────────────────────────────────────────────────
  { id: 'constellation-motors', name: 'Constellation Motors',       parentId: null, icon: 'folder-read-only', count: 506 },
  { id: 'const-internal',       name: 'Constellation Internal',     parentId: null, icon: 'folder',           count: 506 },

  // account folders — full visibility restrictions apply
  { id: 'autobahn',   name: 'Autobahn Motorcars',           parentId: null, icon: 'folder-account', count: 45  },
  { id: 'lr-atlanta', name: 'Land Rover South Atlanta',     parentId: null, icon: 'folder-account', count: 813 },
  { id: 'manhattan',  name: 'Manhattan Motor Cars',         parentId: null, icon: 'folder-account', count: 210 },

  // read-only folders — shared WITH the current user (upload not allowed)
  { id: 'shared-lr-campaign',    name: 'LR 2026 Campaign Assets',  parentId: null, icon: 'folder-read-only', count: 87  },
  { id: 'shared-jag-templates',  name: 'Jaguar Brand Templates',   parentId: null, icon: 'folder-read-only', count: 42  },

  // shared folders — collaborative access (user owns these)
  { id: 'budds',       name: "Budds' Imported Cars",        parentId: null, icon: 'folder-shared', count: 154 },
  { id: 'coventry-lane', name: 'Coventry Lane Land Rover',  parentId: null, icon: 'folder-shared', count: 53  },
  { id: 'lr-fairfield',  name: 'Land Rover Fairfield',      parentId: null, icon: 'folder-shared', count: 245 },
  { id: 'hendrick',      name: 'Hendrick Jaguar Charlotte', parentId: null, icon: 'folder-shared', count: 143 },

  // standard folders
  { id: 'cole',         name: 'Cole European',                      parentId: null, icon: 'folder', count: 45  },
  { id: 'coventry-nth', name: 'Coventry North Land Rover',          parentId: null, icon: 'folder', count: 123 },
  { id: 'decarie',      name: 'Decarie Motors',                     parentId: null, icon: 'folder', count: 98  },
  { id: 'denooyer',     name: 'DeNooyer Jaguar',                    parentId: null, icon: 'folder', count: 121 },
  { id: 'imperial',     name: 'Imperial Motors Jaguar',             parentId: null, icon: 'folder', count: 74  },
  { id: 'jag-akron',    name: 'Jaguar Akron',                       parentId: null, icon: 'folder', count: 2   },
  { id: 'jag-dallas',   name: 'Jaguar Dallas',                      parentId: null, icon: 'folder', count: 3   },
  { id: 'lr-houston',   name: 'Land Rover Houston North',           parentId: null, icon: 'folder', count: 114 },
  { id: 'paretti',      name: 'Paretti Jaguar',                     parentId: null, icon: 'folder', count: 32  },
  { id: 'royal',        name: 'Royal Land Rover Tucson',            parentId: null, icon: 'folder', count: 12  },
  { id: 'royal-nth',    name: 'Royal Land Rover Tucson North',      parentId: null, icon: 'folder', count: 87  },
  { id: 'sterling',     name: 'Sterling McCall Land Rover',         parentId: null, icon: 'folder', count: 67  },
  { id: 'park-ave',     name: 'Park Avenue BMW',                    parentId: null, icon: 'folder', count: 88  },
  { id: 'classic',      name: 'Classic Land Rover',                 parentId: null, icon: 'folder', count: 39  },
  { id: 'peninsula',    name: 'Peninsula Imports',                  parentId: null, icon: 'folder', count: 55  },

  // ── Constellation Motors children ─────────────────────────────────────────────
  { id: 'assets',     name: 'Assets',     parentId: 'constellation-motors', icon: 'folder', count: 19   },
  { id: 'components', name: 'Components', parentId: 'constellation-motors', icon: 'folder', count: 271  },
  { id: 'jellybeans', name: 'Jellybeans', parentId: 'constellation-motors', icon: 'folder', count: 1229 },
  { id: 'templates',  name: 'Templates',  parentId: 'constellation-motors', icon: 'folder', count: 2    },

  // ── Constellation Internal children ───────────────────────────────────────────
  { id: 'ci-backgrounds',   name: 'Backgrounds',                parentId: 'const-internal', icon: 'folder-shared', count: 55  },
  { id: 'ci-components',    name: 'Components',                 parentId: 'const-internal', icon: 'folder-shared', count: 26  },
  { id: 'ci-templates',     name: 'Templates',                  parentId: 'const-internal', icon: 'folder-shared', count: 32  },
  { id: 'ci-uploads',       name: 'Uploads',                    parentId: 'const-internal', icon: 'folder-shared', count: 56  },
  { id: 'ci-copy-comps',    name: 'Copy of Components',         parentId: 'const-internal', icon: 'folder',        count: 271 },
  { id: 'ci-easter',        name: 'Easter special backgrounds', parentId: 'const-internal', icon: 'folder',        count: 45  },
  { id: 'ci-lifestyle',     name: 'Lifestyle images Audi',      parentId: 'const-internal', icon: 'folder',        count: 53  },
  { id: 'ci-coventry-lane', name: 'Coventry Lane Land Rover',   parentId: 'const-internal', icon: 'folder',        count: 53  },
];

// ─── Lookup helpers ───────────────────────────────────────────────────────────
const FOLDER_MAP = new Map(FOLDERS.map(f => [f.id, f]));

export function getFolder(id: string): Folder | undefined {
  return FOLDER_MAP.get(id);
}

/** Returns breadcrumb segments from root → given folder. */
export function getFolderBreadcrumb(folderId: string): Folder[] {
  const crumbs: Folder[] = [];
  let current = FOLDER_MAP.get(folderId);
  while (current) {
    crumbs.unshift(current);
    current = current.parentId ? FOLDER_MAP.get(current.parentId) : undefined;
  }
  return crumbs;
}

/** Returns direct children of a folder (or root folders if parentId is null). */
export function getFolderChildren(parentId: string | null): Folder[] {
  return FOLDERS.filter(f => f.parentId === parentId);
}

// ─── Store ────────────────────────────────────────────────────────────────────
// Folders expanded by default in the initial tree view
const DEFAULT_EXPANDED = ['constellation-motors', 'const-internal'];

interface FolderStore {
  folders: Folder[];
  expandedIds: string[];
  archivedIds: string[];
  moveFolder:   (folderId: string, newParentId: string | null) => void;
  renameFolder: (folderId: string, newName: string) => void;
  toggleExpand: (folderId: string) => void;
  archiveFolder: (folderId: string) => void;
  unarchiveFolder: (folderId: string) => void;
  deleteFolder: (folderId: string) => void;
  addFolder:    (folder: Folder) => void;
}

export const useFolderStore = create<FolderStore>((set) => ({
  folders:     FOLDERS,
  expandedIds: DEFAULT_EXPANDED,
  archivedIds: [],

  toggleExpand: (folderId) =>
    set(state => ({
      expandedIds: state.expandedIds.includes(folderId)
        ? state.expandedIds.filter(id => id !== folderId)
        : [...state.expandedIds, folderId],
    })),

  moveFolder: (folderId, newParentId) =>
    set(state => ({
      folders: state.folders.map(f =>
        f.id === folderId ? { ...f, parentId: newParentId } : f
      ),
    })),

  renameFolder: (folderId, newName) =>
    set(state => ({
      folders: state.folders.map(f =>
        f.id === folderId ? { ...f, name: newName } : f
      ),
    })),

  archiveFolder: (folderId) =>
    set(state => ({ archivedIds: [...state.archivedIds, folderId] })),

  unarchiveFolder: (folderId) =>
    set(state => ({ archivedIds: state.archivedIds.filter(id => id !== folderId) })),

  deleteFolder: (folderId) =>
    set(state => ({
      folders:     state.folders.filter(f => f.id !== folderId),
      expandedIds: state.expandedIds.filter(id => id !== folderId),
      archivedIds: state.archivedIds.filter(id => id !== folderId),
    })),

  addFolder: (folder) =>
    set(state => ({ folders: [...state.folders, folder] })),
}));

// ─── Tree derivation helper ───────────────────────────────────────────────────
/** Converts a flat folder list with parentIds into a sorted, level-annotated list for rendering. */
export function deriveFolderTree(
  folders: Folder[],
  expandedIds: string[],
  archivedIds: string[],
): Array<Folder & { level: number; expandable: boolean; expanded: boolean }> {
  const visible = folders.filter(f => !archivedIds.includes(f.id));
  const expandedSet = new Set(expandedIds);

  // Build children map
  const childMap = new Map<string | null, Folder[]>();
  for (const f of visible) {
    const key = f.parentId ?? null;
    if (!childMap.has(key)) childMap.set(key, []);
    childMap.get(key)!.push(f);
  }

  const result: Array<Folder & { level: number; expandable: boolean; expanded: boolean }> = [];

  function visit(parentId: string | null, level: number) {
    const children = (childMap.get(parentId) ?? [])
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name));
    for (const f of children) {
      const hasChildren = (childMap.get(f.id)?.length ?? 0) > 0;
      const expanded = hasChildren && expandedSet.has(f.id);
      result.push({ ...f, label: f.name, level, expandable: hasChildren, expanded });
      if (expanded) visit(f.id, level + 1);
    }
  }

  visit(null, 0);
  return result;
}

/** Returns all descendant IDs of a folder (to exclude from move targets). */
export function getDescendantIds(folderId: string, folders: Folder[]): string[] {
  const ids: string[] = [];
  const queue = [folderId];
  while (queue.length > 0) {
    const current = queue.shift()!;
    const children = folders.filter(f => f.parentId === current);
    for (const child of children) {
      ids.push(child.id);
      queue.push(child.id);
    }
  }
  return ids;
}
