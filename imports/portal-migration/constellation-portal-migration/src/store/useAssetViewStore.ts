import { create } from 'zustand'

export type ViewMode = 'grid-large' | 'grid-horizontal' | 'grid-small' | 'table-compact' | 'table-spacious'

export interface FilterValues {
  sortField: string
  sortDirection: 'asc' | 'desc'
  // AI / Type
  aiStatus: string
  mimeType: string
  // Vehicle
  make: string
  model: string
  trim: string
  year: string
  lifestyle: string
  // Tags
  tags: string
  // Dimensions
  shape: string
  widthMin: string
  widthMax: string
  heightMin: string
  heightMax: string
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
}

interface AssetViewStore {
  viewMode: ViewMode
  setViewMode: (mode: ViewMode) => void
  cycleViewMode: () => void

  isFilterPanelOpen: boolean
  toggleFilterPanel: () => void
  closeFilterPanel: () => void

  filters: FilterValues
  setFilter: (key: keyof FilterValues, value: string) => void
  clearFilters: () => void
}

const VIEW_MODE_ORDER: ViewMode[] = [
  'grid-large',
  'grid-horizontal',
  'grid-small',
  'table-compact',
  'table-spacious',
]

export const useAssetViewStore = create<AssetViewStore>((set) => ({
  viewMode: 'grid-large',
  setViewMode: (mode) => set({ viewMode: mode }),
  cycleViewMode: () =>
    set((state) => {
      const idx = VIEW_MODE_ORDER.indexOf(state.viewMode)
      return { viewMode: VIEW_MODE_ORDER[(idx + 1) % VIEW_MODE_ORDER.length] }
    }),

  isFilterPanelOpen: false,
  toggleFilterPanel: () => set((state) => ({ isFilterPanelOpen: !state.isFilterPanelOpen })),
  closeFilterPanel: () => set({ isFilterPanelOpen: false }),

  filters: { ...DEFAULT_FILTERS },
  setFilter: (key, value) =>
    set((state) => ({ filters: { ...state.filters, [key]: value } })),
  clearFilters: () => set({ filters: { ...DEFAULT_FILTERS } }),
}))
