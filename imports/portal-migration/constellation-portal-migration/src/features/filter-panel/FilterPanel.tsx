import { useState, useRef, useEffect } from 'react'
import { X, ArrowDown, ArrowUp, ChevronDown, Search } from 'lucide-react'
import { useAssetViewStore, DEFAULT_FILTERS } from '../../store/useAssetViewStore'
import { cn } from '../../utils/cn'
import type { FilterValues } from '../../store/useAssetViewStore'

// ── Section label ─────────────────────────────────────────────────
function SectionLabel({ label }: { label: string }) {
  return (
    <p className="px-4 pt-3 pb-[6px] text-[10px] font-semibold text-[#9c99a9] tracking-[0.8px] uppercase leading-none">
      {label}
    </p>
  )
}

function Divider() {
  return <div className="mx-4 my-[6px] h-px bg-black/[0.06]" />
}

// ── Custom dropdown ───────────────────────────────────────────────
type SelectOption = { value: string; label: string }

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: SelectOption[]
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const selectedLabel = options.find((o) => o.value === value)?.label ?? ''
  const handleSelect = (v: string) => { onChange(v); setOpen(false) }
  const handleClear = (e: React.MouseEvent) => { e.stopPropagation(); onChange(''); setOpen(false) }

  return (
    <div ref={ref} className="mx-4 mb-[10px] relative">
      <p className="mb-[4px] px-[2px] text-[11px] font-normal text-[#686576] leading-[12px] tracking-[0.15px]">
        {label}
      </p>
      <div
        role="button"
        tabIndex={0}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setOpen((v) => !v) }}
        className={cn(
          'relative flex items-center min-h-[34px] pl-[8px] pr-[4px] rounded-[6px] border cursor-pointer',
          'bg-[#f9fafa] select-none transition-colors',
          open ? 'border-[#473bab]/60' : 'border-[#cac9cf]',
        )}
      >
        <div className="flex flex-1 flex-wrap items-center gap-[6px] min-w-0 pr-[44px]">
          {value ? (
            <div className="inline-flex items-center bg-[#f0f2f4] min-h-[22px] px-[4px] py-[2px] rounded-[6px] gap-[2px] shrink-0">
              <span className="px-[4px] text-[11px] font-normal text-[#1f1d25] leading-[18px] whitespace-nowrap">
                {selectedLabel}
              </span>
              <div
                role="button"
                onClick={handleClear}
                className="shrink-0 size-[14px] flex items-center justify-center opacity-[0.30] hover:opacity-70 cursor-pointer"
              >
                <X size={10} strokeWidth={2} />
              </div>
            </div>
          ) : null}
        </div>
        {value && (
          <div
            role="button"
            onClick={handleClear}
            className="absolute right-[24px] top-1/2 -translate-y-1/2 size-[18px] flex items-center justify-center opacity-[0.26] hover:opacity-60 cursor-pointer"
          >
            <X size={12} strokeWidth={2} />
          </div>
        )}
        <ChevronDown
          size={20}
          strokeWidth={1.5}
          className={cn(
            'absolute right-[2px] top-1/2 -translate-y-1/2 pointer-events-none transition-transform text-[#686576]',
            open && 'rotate-180',
          )}
        />
      </div>
      {open && options.length > 0 && (
        <div className="absolute left-0 right-0 top-[calc(100%+2px)] z-50 bg-white border border-[#cac9cf] rounded-[6px] shadow-[0_4px_16px_rgba(0,0,0,0.12)] overflow-hidden">
          <div
            role="button"
            onClick={() => handleSelect('')}
            className={cn(
              'flex items-center px-[12px] min-h-[34px] cursor-pointer transition-colors text-[12px]',
              !value ? 'bg-[rgba(99,86,225,0.08)] text-[#473bab]' : 'text-[#9c99a9] hover:bg-[#f9fafa]',
            )}
          >
            —
          </div>
          {options.map((o) => (
            <div
              key={o.value}
              role="button"
              onClick={() => handleSelect(o.value)}
              className={cn(
                'flex items-center px-[12px] min-h-[34px] cursor-pointer transition-colors text-[12px]',
                value === o.value
                  ? 'bg-[rgba(99,86,225,0.08)] text-[#473bab] font-medium'
                  : 'text-[#1f1d25] hover:bg-[#f9fafa]',
              )}
            >
              {o.label}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Text search field ─────────────────────────────────────────────
function FilterSearch({
  label,
  placeholder,
  value,
  onChange,
}: {
  label: string
  placeholder: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="mx-4 mb-[10px]">
      <p className="mb-[4px] px-[2px] text-[11px] font-normal text-[#686576] leading-[12px] tracking-[0.15px]">
        {label}
      </p>
      <div className="relative flex items-center">
        <Search size={12} className="absolute left-[8px] text-[#9c99a9] pointer-events-none" strokeWidth={1.5} />
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            'w-full min-h-[34px] pl-[26px] pr-[28px] text-[12px] rounded-[6px] border border-[#cac9cf]',
            'bg-[#f9fafa] text-[#1f1d25] placeholder:text-[#9c99a9]',
            'focus:outline-none focus:border-[#473bab]/60 transition-colors',
          )}
        />
        {value && (
          <button
            onClick={() => onChange('')}
            className="absolute right-[8px] top-1/2 -translate-y-1/2 size-[16px] flex items-center justify-center opacity-[0.30] hover:opacity-60"
          >
            <X size={11} strokeWidth={2} />
          </button>
        )}
      </div>
    </div>
  )
}

// ── Dimension number input ────────────────────────────────────────
function DimInput({
  label,
  placeholder,
  value,
  onChange,
}: {
  label?: string
  placeholder: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div>
      {label && (
        <p className="mb-[4px] px-[2px] text-[11px] font-normal text-[#686576] leading-[12px] tracking-[0.15px]">
          {label}
        </p>
      )}
      <div className="relative">
        <input
          type="number"
          min={0}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            'w-full min-h-[34px] px-[8px] text-[12px] rounded-[6px] border border-[#cac9cf]',
            'bg-[#f9fafa] text-[#1f1d25] placeholder:text-[#9c99a9]',
            'focus:outline-none focus:border-[#473bab]/60 transition-colors',
          )}
        />
        {value && (
          <button
            onClick={() => onChange('')}
            className="absolute right-[8px] top-1/2 -translate-y-1/2 size-[14px] flex items-center justify-center opacity-[0.26] hover:opacity-60"
          >
            <X size={10} strokeWidth={2} />
          </button>
        )}
      </div>
    </div>
  )
}

// ── Sort select ───────────────────────────────────────────────────
function SortSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="relative flex-1">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          'w-full min-h-[34px] pl-[8px] pr-[28px] rounded-[6px] border border-[#cac9cf]',
          'bg-[#f9fafa] appearance-none cursor-pointer text-[12px] text-[#1f1d25]',
          'focus:outline-none focus:border-[#473bab]/60 transition-colors',
        )}
      >
        <option value="name">Name</option>
        <option value="aiStatus">AI Status</option>
        <option value="make">Make</option>
        <option value="year">Year</option>
      </select>
      <ChevronDown size={18} strokeWidth={1.5} className="absolute right-[2px] top-1/2 -translate-y-1/2 text-[#686576] pointer-events-none" />
    </div>
  )
}

// ── Option sets ───────────────────────────────────────────────────
const AI_STATUS_OPTIONS: SelectOption[] = [
  { value: 'approved',    label: 'Approved' },
  { value: 'auto-tagged', label: 'Auto-tagged' },
  { value: 'suggested',   label: 'Needs Review' },
  { value: 'analyzing',   label: 'Analyzing' },
  { value: 'not-vehicle', label: 'Not a Vehicle' },
]
const MIME_OPTIONS: SelectOption[] = [
  { value: 'image/jpeg', label: 'JPEG' },
  { value: 'image/png',  label: 'PNG' },
  { value: 'image/gif',  label: 'GIF' },
  { value: 'image/webp', label: 'WebP' },
]
const MAKE_OPTIONS: SelectOption[] = [
  { value: 'BMW',         label: 'BMW' },
  { value: 'Porsche',     label: 'Porsche' },
  { value: 'Ferrari',     label: 'Ferrari' },
  { value: 'Lamborghini', label: 'Lamborghini' },
  { value: 'Land Rover',  label: 'Land Rover' },
  { value: 'Jeep',        label: 'Jeep' },
  { value: 'Tesla',       label: 'Tesla' },
  { value: 'Ford',        label: 'Ford' },
]
const MODEL_OPTIONS: SelectOption[] = [
  { value: 'M3',         label: 'M3' },
  { value: 'M5',         label: 'M5' },
  { value: '7 Series',   label: '7 Series' },
  { value: '911',        label: '911' },
  { value: 'Cayenne',    label: 'Cayenne' },
  { value: 'Panamera',   label: 'Panamera' },
  { value: '458 Italia', label: '458 Italia' },
  { value: 'Purosangue', label: 'Purosangue' },
  { value: 'Aventador',  label: 'Aventador' },
  { value: 'Range Rover',label: 'Range Rover' },
  { value: 'Wrangler',   label: 'Wrangler' },
  { value: 'Model 3',    label: 'Model 3' },
  { value: 'Mustang',    label: 'Mustang' },
]
const TRIM_OPTIONS: SelectOption[] = [
  { value: 'Competition',    label: 'Competition' },
  { value: 'M Sport',        label: 'M Sport' },
  { value: 'GT3 RS',         label: 'GT3 RS' },
  { value: 'Carrera S',      label: 'Carrera S' },
  { value: 'Turbo S',        label: 'Turbo S' },
  { value: 'GT3',            label: 'GT3' },
  { value: 'Rubicon',        label: 'Rubicon' },
  { value: 'Sport',          label: 'Sport' },
  { value: 'SVJ',            label: 'SVJ' },
  { value: 'V12',            label: 'V12' },
  { value: 'GT500',          label: 'GT500' },
  { value: 'Performance',    label: 'Performance' },
  { value: 'Autobiography',  label: 'Autobiography' },
]
const YEAR_OPTIONS: SelectOption[] = ['2019','2020','2021','2022','2023','2024','2025'].map(y => ({ value: y, label: y }))
const LIFESTYLE_OPTIONS: SelectOption[] = [
  { value: 'Luxury',         label: 'Luxury' },
  { value: 'Performance',    label: 'Performance' },
  { value: 'Off-Road',       label: 'Off-Road' },
  { value: 'Adventure',      label: 'Adventure' },
  { value: 'Urban Commuter', label: 'Urban Commuter' },
]
const SHAPE_OPTIONS: SelectOption[] = [
  { value: 'landscape', label: 'Landscape' },
  { value: 'portrait',  label: 'Portrait' },
  { value: 'square',    label: 'Square' },
]

// ── Badge and actions — exported for use in LeftPaneShell ─────────
// App.tsx passes these as props to LeftPaneShell so the header stays shared.
export function FilterPanelBadge() {
  const { filters } = useAssetViewStore()
  const count = (Object.keys(DEFAULT_FILTERS) as Array<keyof FilterValues>)
    .filter((k) => k !== 'sortField' && k !== 'sortDirection' && filters[k] !== '').length
  if (count === 0) return null
  return (
    <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] rounded-full bg-[#473bab] text-white text-[10px] font-semibold px-1 leading-none">
      {count}
    </span>
  )
}

export function FilterPanelClearAll() {
  const { filters, clearFilters } = useAssetViewStore()
  const hasActive = (Object.keys(DEFAULT_FILTERS) as Array<keyof FilterValues>)
    .some((k) => k !== 'sortField' && k !== 'sortDirection' && filters[k] !== '')
  if (!hasActive) return null
  return (
    <button onClick={clearFilters} className="text-[12px] font-medium text-[#473bab] hover:underline mr-1">
      Clear all
    </button>
  )
}

// ── Main component — just the filter form content, no header/container ────────
export function FilterPanel() {
  const { filters, setFilter } = useAssetViewStore()

  return (
    <div className="pb-4">

        {/* Sort By */}
        <div className="px-4 pt-3 mb-[4px]">
          <p className="mb-[4px] px-[2px] text-[11px] font-normal text-[#686576] leading-[12px] tracking-[0.15px]">
            Sort By
          </p>
          <div className="flex items-center gap-[8px]">
            <SortSelect value={filters.sortField} onChange={(v) => setFilter('sortField', v)} />
            <button
              onClick={() => setFilter('sortDirection', filters.sortDirection === 'asc' ? 'desc' : 'asc')}
              className="w-[34px] h-[34px] flex items-center justify-center rounded-[6px] border border-[#cac9cf] bg-[#f9fafa] text-[#686576] hover:bg-[#f0f2f4] transition-colors shrink-0"
            >
              {filters.sortDirection === 'asc'
                ? <ArrowUp size={13} strokeWidth={1.5} />
                : <ArrowDown size={13} strokeWidth={1.5} />}
            </button>
          </div>
        </div>

        <Divider />

        {/* AI STATUS & TYPE */}
        <SectionLabel label="Status & Type" />
        <FilterSelect label="AI Status" value={filters.aiStatus} onChange={(v) => setFilter('aiStatus', v)} options={AI_STATUS_OPTIONS} />
        <FilterSelect label="File Type"  value={filters.mimeType} onChange={(v) => setFilter('mimeType', v)} options={MIME_OPTIONS} />

        <Divider />

        {/* VEHICLE */}
        <SectionLabel label="Vehicle" />
        <FilterSelect label="Make"      value={filters.make}      onChange={(v) => setFilter('make', v)}      options={MAKE_OPTIONS} />
        <FilterSelect label="Model"     value={filters.model}     onChange={(v) => setFilter('model', v)}     options={MODEL_OPTIONS} />
        <FilterSelect label="Trim"      value={filters.trim}      onChange={(v) => setFilter('trim', v)}      options={TRIM_OPTIONS} />
        <FilterSelect label="Year"      value={filters.year}      onChange={(v) => setFilter('year', v)}      options={YEAR_OPTIONS} />
        <FilterSelect label="Lifestyle" value={filters.lifestyle} onChange={(v) => setFilter('lifestyle', v)} options={LIFESTYLE_OPTIONS} />

        <Divider />

        {/* TAGS */}
        <SectionLabel label="Tags" />
        <FilterSearch label="Search tags" placeholder="e.g. BMW, Sport…" value={filters.tags} onChange={(v) => setFilter('tags', v)} />

        <Divider />

        {/* DIMENSIONS */}
        <SectionLabel label="Dimensions" />
        <FilterSelect label="Shape" value={filters.shape} onChange={(v) => setFilter('shape', v)} options={SHAPE_OPTIONS} />
        <div className="mx-4 mb-[10px] grid grid-cols-2 gap-[8px]">
          <DimInput label="Width min"  placeholder="px" value={filters.widthMin}  onChange={(v) => setFilter('widthMin', v)} />
          <DimInput label="Width max"  placeholder="px" value={filters.widthMax}  onChange={(v) => setFilter('widthMax', v)} />
        </div>
        <div className="mx-4 mb-[10px] grid grid-cols-2 gap-[8px]">
          <DimInput label="Height min" placeholder="px" value={filters.heightMin} onChange={(v) => setFilter('heightMin', v)} />
          <DimInput label="Height max" placeholder="px" value={filters.heightMax} onChange={(v) => setFilter('heightMax', v)} />
        </div>
      </div>
  )
}
