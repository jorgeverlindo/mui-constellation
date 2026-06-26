import { create } from 'zustand';

export type ViewMode = 'grid-large' | 'grid-horizontal' | 'grid-small' | 'table-compact' | 'table-spacious';

export interface FilterValues {
  sortField: string;
  sortDirection: 'asc' | 'desc';
  aiStatus: string;
  mimeType: string;
  make: string;
  model: string;
  trim: string;
  year: string;
  lifestyle: string;
  tags: string;
  shape: string;
  widthMin: string;
  widthMax: string;
  heightMin: string;
  heightMax: string;
}

export const DEFAULT_FILTERS: FilterValues = {
  sortField: 'name',
  sortDirection: 'asc',
  aiStatus: '',
  mimeType: '',
  make: '',
  model: '',
  trim: '',
  year: '',
  lifestyle: '',
  tags: '',
  shape: '',
  widthMin: '',
  widthMax: '',
  heightMin: '',
  heightMax: '',
};

const VIEW_MODE_CYCLE: ViewMode[] = ['grid-large', 'grid-horizontal', 'grid-small', 'table-compact', 'table-spacious'];

interface AssetViewState {
  viewMode: ViewMode;
  isFilterPanelOpen: boolean;
  filters: FilterValues;
  setViewMode: (mode: ViewMode) => void;
  cycleViewMode: () => void;
  toggleFilterPanel: () => void;
  closeFilterPanel: () => void;
  setFilter: (key: keyof FilterValues, value: string) => void;
  clearFilters: () => void;
}

export const useAssetViewStore = create<AssetViewState>((set) => ({
  viewMode: 'grid-large',
  isFilterPanelOpen: false,
  filters: DEFAULT_FILTERS,

  setViewMode: (mode) => set({ viewMode: mode }),

  cycleViewMode: () => set(state => {
    const idx = VIEW_MODE_CYCLE.indexOf(state.viewMode);
    return { viewMode: VIEW_MODE_CYCLE[(idx + 1) % VIEW_MODE_CYCLE.length] };
  }),

  toggleFilterPanel: () => set(state => ({ isFilterPanelOpen: !state.isFilterPanelOpen })),
  closeFilterPanel: () => set({ isFilterPanelOpen: false }),

  setFilter: (key, value) => set(state => ({
    filters: { ...state.filters, [key]: value },
  })),

  clearFilters: () => set({ filters: DEFAULT_FILTERS }),
}));
