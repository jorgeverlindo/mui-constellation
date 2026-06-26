import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Divider,
  Paper,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import SearchIcon from '@mui/icons-material/Search';
import { useAssetViewStore, DEFAULT_FILTERS } from '../../store/useAssetViewStore';
import type { FilterValues } from '../../store/useAssetViewStore';
import { ink, brand, surface as surfaceTokens, status as statusTokens } from '@jorgeverlindo/constellation-ux';

const BRAND    = brand.accent;
const TEXT_DIM = ink.secondary;
const TEXT_SUB = ink.tertiary;
const BG_INPUT = surfaceTokens.inputBackground;
const BG_MUTED = surfaceTokens.canvas;
const BORDER   = '#cac9cf';

function SectionLabel({ label }: { label: string }) {
  return (
    <Typography sx={{ px: 2, pt: 1.5, pb: '6px', fontSize: 10, fontWeight: 600, color: TEXT_SUB, letterSpacing: '0.8px', textTransform: 'uppercase', lineHeight: 1, display: 'block' }}>
      {label}
    </Typography>
  );
}

function PanelDivider() {
  return <Divider sx={{ mx: 2, my: '6px', borderColor: 'rgba(0,0,0,0.06)' }} />;
}

type SelectOption = { value: string; label: string };

function FilterSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: SelectOption[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const selectedLabel = options.find(o => o.value === value)?.label ?? '';
  const handleSelect  = (v: string) => { onChange(v); setOpen(false); };
  const handleClear   = (e: React.MouseEvent) => { e.stopPropagation(); onChange(''); setOpen(false); };

  return (
    <Box ref={ref} sx={{ mx: 2, mb: '10px', position: 'relative' }}>
      <Typography sx={{ mb: '4px', px: '2px', fontSize: 11, fontWeight: 400, color: TEXT_DIM, lineHeight: '12px', letterSpacing: '0.15px' }}>
        {label}
      </Typography>

      <Box
        role="button"
        tabIndex={0}
        onClick={() => setOpen(v => !v)}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setOpen(v => !v); }}
        sx={{
          position: 'relative', display: 'flex', alignItems: 'center', minHeight: 34,
          pl: '8px', pr: '4px', borderRadius: '6px',
          border: `1px solid ${open ? `${BRAND}99` : BORDER}`,
          bgcolor: BG_INPUT, userSelect: 'none', cursor: 'pointer',
          transition: 'border-color 0.15s',
        }}
      >
        <Box sx={{ display: 'flex', flex: 1, flexWrap: 'wrap', alignItems: 'center', gap: '6px', minWidth: 0, pr: '44px' }}>
          {value && (
            <Box sx={{ display: 'inline-flex', alignItems: 'center', bgcolor: BG_MUTED, minHeight: 22, px: '4px', py: '2px', borderRadius: '6px', gap: '2px', flexShrink: 0 }}>
              <Typography sx={{ px: '4px', fontSize: 11, fontWeight: 400, color: ink.primary, lineHeight: '18px', whiteSpace: 'nowrap' }}>
                {selectedLabel}
              </Typography>
              <Box role="button" onClick={handleClear} sx={{ flexShrink: 0, width: 14, height: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.3, cursor: 'pointer', '&:hover': { opacity: 0.7 } }}>
                <CloseIcon sx={{ fontSize: 10 }} />
              </Box>
            </Box>
          )}
        </Box>

        {value && (
          <Box
            role="button"
            onClick={handleClear}
            sx={{ position: 'absolute', right: 24, top: '50%', transform: 'translateY(-50%)', width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.26, cursor: 'pointer', '&:hover': { opacity: 0.6 } }}
          >
            <CloseIcon sx={{ fontSize: 12 }} />
          </Box>
        )}

        <KeyboardArrowDownIcon
          sx={{
            position: 'absolute', right: 2, top: '50%', transform: open ? 'translateY(-50%) rotate(180deg)' : 'translateY(-50%)',
            transition: 'transform 0.2s', pointerEvents: 'none', fontSize: 20, color: TEXT_DIM,
          }}
        />
      </Box>

      {open && options.length > 0 && (
        <Paper
          elevation={0}
          sx={{
            position: 'absolute', left: 0, right: 0, top: 'calc(100% + 2px)', zIndex: 50,
            border: `1px solid ${BORDER}`, borderRadius: '6px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.12)', overflow: 'hidden',
          }}
        >
          <Box
            role="button"
            onClick={() => handleSelect('')}
            sx={{ display: 'flex', alignItems: 'center', px: '12px', minHeight: 34, cursor: 'pointer', fontSize: 12, transition: 'background-color 0.1s', bgcolor: !value ? 'rgba(99,86,225,0.08)' : 'transparent', color: !value ? BRAND : TEXT_SUB, '&:hover': { bgcolor: !value ? 'rgba(99,86,225,0.08)' : BG_INPUT } }}
          >
            —
          </Box>
          {options.map(o => (
            <Box
              key={o.value}
              role="button"
              onClick={() => handleSelect(o.value)}
              sx={{ display: 'flex', alignItems: 'center', px: '12px', minHeight: 34, cursor: 'pointer', fontSize: 12, transition: 'background-color 0.1s', bgcolor: value === o.value ? 'rgba(99,86,225,0.08)' : 'transparent', color: value === o.value ? BRAND : ink.primary, fontWeight: value === o.value ? 500 : 400, '&:hover': { bgcolor: value === o.value ? 'rgba(99,86,225,0.08)' : BG_INPUT } }}
            >
              {o.label}
            </Box>
          ))}
        </Paper>
      )}
    </Box>
  );
}

function FilterSearch({ label, placeholder, value, onChange }: { label: string; placeholder: string; value: string; onChange: (v: string) => void }) {
  return (
    <Box sx={{ mx: 2, mb: '10px' }}>
      <Typography sx={{ mb: '4px', px: '2px', fontSize: 11, fontWeight: 400, color: TEXT_DIM, lineHeight: '12px', letterSpacing: '0.15px' }}>
        {label}
      </Typography>
      <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <SearchIcon sx={{ position: 'absolute', left: 8, fontSize: 12, color: TEXT_SUB, pointerEvents: 'none', zIndex: 1 }} />
        <Box
          component="input"
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
          sx={{
            width: '100%', minHeight: 34, pl: '26px', pr: value ? '28px' : '8px',
            fontSize: 12, borderRadius: '6px', border: `1px solid ${BORDER}`,
            bgcolor: BG_INPUT, color: ink.primary,
            '&::placeholder': { color: TEXT_SUB }, outline: 'none',
            '&:focus': { borderColor: `${BRAND}99` }, transition: 'border-color 0.15s',
            boxSizing: 'border-box',
          }}
        />
        {value && (
          <IconButton
            size="small"
            onClick={() => onChange('')}
            sx={{ position: 'absolute', right: 4, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, p: 0, opacity: 0.3, '&:hover': { opacity: 0.6, bgcolor: 'transparent' } }}
          >
            <CloseIcon sx={{ fontSize: 11 }} />
          </IconButton>
        )}
      </Box>
    </Box>
  );
}

function DimInput({ label, placeholder, value, onChange }: { label?: string; placeholder: string; value: string; onChange: (v: string) => void }) {
  return (
    <Box>
      {label && (
        <Typography sx={{ mb: '4px', px: '2px', fontSize: 11, fontWeight: 400, color: TEXT_DIM, lineHeight: '12px', letterSpacing: '0.15px' }}>
          {label}
        </Typography>
      )}
      <Box sx={{ position: 'relative' }}>
        <Box
          component="input"
          type="number"
          min={0}
          placeholder={placeholder}
          value={value}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
          sx={{
            width: '100%', minHeight: 34, px: '8px', fontSize: 12,
            borderRadius: '6px', border: `1px solid ${BORDER}`,
            bgcolor: BG_INPUT, color: ink.primary,
            '&::placeholder': { color: TEXT_SUB }, outline: 'none',
            '&:focus': { borderColor: `${BRAND}99` }, transition: 'border-color 0.15s',
            boxSizing: 'border-box',
          }}
        />
        {value && (
          <IconButton
            size="small"
            onClick={() => onChange('')}
            sx={{ position: 'absolute', right: 4, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, p: 0, opacity: 0.26, '&:hover': { opacity: 0.6, bgcolor: 'transparent' } }}
          >
            <CloseIcon sx={{ fontSize: 10 }} />
          </IconButton>
        )}
      </Box>
    </Box>
  );
}

function SortSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <Box sx={{ position: 'relative', flex: 1 }}>
      <Box
        component="select"
        value={value}
        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onChange(e.target.value)}
        sx={{
          width: '100%', minHeight: 34, pl: '8px', pr: '28px',
          borderRadius: '6px', border: `1px solid ${BORDER}`,
          bgcolor: BG_INPUT, appearance: 'none', cursor: 'pointer',
          fontSize: 12, color: ink.primary,
          outline: 'none', '&:focus': { borderColor: `${BRAND}99` }, transition: 'border-color 0.15s',
          boxSizing: 'border-box',
        }}
      >
        <option value="name">Name</option>
        <option value="aiStatus">AI Status</option>
        <option value="make">Make</option>
        <option value="year">Year</option>
      </Box>
      <KeyboardArrowDownIcon sx={{ position: 'absolute', right: 2, top: '50%', transform: 'translateY(-50%)', fontSize: 18, color: TEXT_DIM, pointerEvents: 'none' }} />
    </Box>
  );
}

const AI_STATUS_OPTIONS: SelectOption[] = [
  { value: 'approved',    label: 'Approved' },
  { value: 'auto-tagged', label: 'Auto-tagged' },
  { value: 'suggested',   label: 'Needs Review' },
  { value: 'analyzing',   label: 'Analyzing' },
  { value: 'not-vehicle', label: 'Not a Vehicle' },
];
const MIME_OPTIONS: SelectOption[] = [
  { value: 'image/jpeg', label: 'JPEG' },
  { value: 'image/png',  label: 'PNG' },
  { value: 'image/gif',  label: 'GIF' },
  { value: 'image/webp', label: 'WebP' },
];
const MAKE_OPTIONS: SelectOption[] = [
  { value: 'BMW',         label: 'BMW' },
  { value: 'Porsche',     label: 'Porsche' },
  { value: 'Ferrari',     label: 'Ferrari' },
  { value: 'Lamborghini', label: 'Lamborghini' },
  { value: 'Land Rover',  label: 'Land Rover' },
  { value: 'Jeep',        label: 'Jeep' },
  { value: 'Tesla',       label: 'Tesla' },
  { value: 'Ford',        label: 'Ford' },
];
const MODEL_OPTIONS: SelectOption[] = [
  { value: 'M3',          label: 'M3' },
  { value: 'M5',          label: 'M5' },
  { value: '7 Series',    label: '7 Series' },
  { value: '911',         label: '911' },
  { value: 'Cayenne',     label: 'Cayenne' },
  { value: 'Panamera',    label: 'Panamera' },
  { value: '458 Italia',  label: '458 Italia' },
  { value: 'Purosangue',  label: 'Purosangue' },
  { value: 'Aventador',   label: 'Aventador' },
  { value: 'Range Rover', label: 'Range Rover' },
  { value: 'Wrangler',    label: 'Wrangler' },
  { value: 'Model 3',     label: 'Model 3' },
  { value: 'Mustang',     label: 'Mustang' },
];
const TRIM_OPTIONS: SelectOption[] = [
  { value: 'Competition',   label: 'Competition' },
  { value: 'M Sport',       label: 'M Sport' },
  { value: 'GT3 RS',        label: 'GT3 RS' },
  { value: 'Carrera S',     label: 'Carrera S' },
  { value: 'Turbo S',       label: 'Turbo S' },
  { value: 'GT3',           label: 'GT3' },
  { value: 'Rubicon',       label: 'Rubicon' },
  { value: 'Sport',         label: 'Sport' },
  { value: 'SVJ',           label: 'SVJ' },
  { value: 'V12',           label: 'V12' },
  { value: 'GT500',         label: 'GT500' },
  { value: 'Performance',   label: 'Performance' },
  { value: 'Autobiography', label: 'Autobiography' },
];
const YEAR_OPTIONS: SelectOption[] = ['2019','2020','2021','2022','2023','2024','2025'].map(y => ({ value: y, label: y }));
const LIFESTYLE_OPTIONS: SelectOption[] = [
  { value: 'Luxury',         label: 'Luxury' },
  { value: 'Performance',    label: 'Performance' },
  { value: 'Off-Road',       label: 'Off-Road' },
  { value: 'Adventure',      label: 'Adventure' },
  { value: 'Urban Commuter', label: 'Urban Commuter' },
];
const SHAPE_OPTIONS: SelectOption[] = [
  { value: 'landscape', label: 'Landscape' },
  { value: 'portrait',  label: 'Portrait' },
  { value: 'square',    label: 'Square' },
];

export function FilterPanelBadge() {
  const { filters } = useAssetViewStore();
  const count = (Object.keys(DEFAULT_FILTERS) as Array<keyof FilterValues>)
    .filter(k => k !== 'sortField' && k !== 'sortDirection' && filters[k] !== '').length;
  if (count === 0) return null;
  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 18, height: 18, borderRadius: '50%', bgcolor: BRAND, color: '#fff', fontSize: 10, fontWeight: 600, px: '4px', lineHeight: 1 }}>
      {count}
    </Box>
  );
}

export function FilterPanelClearAll() {
  const { filters, clearFilters } = useAssetViewStore();
  const hasActive = (Object.keys(DEFAULT_FILTERS) as Array<keyof FilterValues>)
    .some(k => k !== 'sortField' && k !== 'sortDirection' && filters[k] !== '');
  if (!hasActive) return null;
  return (
    <Box
      component="button"
      onClick={clearFilters}
      sx={{ fontSize: 12, fontWeight: 500, color: BRAND, bgcolor: 'transparent', border: 'none', cursor: 'pointer', mr: 1, p: 0, '&:hover': { textDecoration: 'underline' } }}
    >
      Clear all
    </Box>
  );
}

export function FilterPanel() {
  const { filters, setFilter } = useAssetViewStore();

  return (
    <Box sx={{ pb: 2 }}>
      {/* Sort By */}
      <Box sx={{ px: 2, pt: 1.5, mb: '4px' }}>
        <Typography sx={{ mb: '4px', px: '2px', fontSize: 11, fontWeight: 400, color: TEXT_DIM, lineHeight: '12px', letterSpacing: '0.15px' }}>
          Sort By
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <SortSelect value={filters.sortField} onChange={v => setFilter('sortField', v)} />
          <IconButton
            size="small"
            onClick={() => setFilter('sortDirection', filters.sortDirection === 'asc' ? 'desc' : 'asc')}
            sx={{ width: 34, height: 34, flexShrink: 0, borderRadius: '6px', border: `1px solid ${BORDER}`, bgcolor: BG_INPUT, color: TEXT_DIM, '&:hover': { bgcolor: BG_MUTED } }}
          >
            {filters.sortDirection === 'asc'
              ? <ArrowUpwardIcon sx={{ fontSize: 13 }} />
              : <ArrowDownwardIcon sx={{ fontSize: 13 }} />}
          </IconButton>
        </Box>
      </Box>

      <PanelDivider />

      <SectionLabel label="Status & Type" />
      <FilterSelect label="AI Status" value={filters.aiStatus} onChange={v => setFilter('aiStatus', v)} options={AI_STATUS_OPTIONS} />
      <FilterSelect label="File Type"  value={filters.mimeType} onChange={v => setFilter('mimeType', v)} options={MIME_OPTIONS} />

      <PanelDivider />

      <SectionLabel label="Vehicle" />
      <FilterSelect label="Make"      value={filters.make}      onChange={v => setFilter('make', v)}      options={MAKE_OPTIONS} />
      <FilterSelect label="Model"     value={filters.model}     onChange={v => setFilter('model', v)}     options={MODEL_OPTIONS} />
      <FilterSelect label="Trim"      value={filters.trim}      onChange={v => setFilter('trim', v)}      options={TRIM_OPTIONS} />
      <FilterSelect label="Year"      value={filters.year}      onChange={v => setFilter('year', v)}      options={YEAR_OPTIONS} />
      <FilterSelect label="Lifestyle" value={filters.lifestyle} onChange={v => setFilter('lifestyle', v)} options={LIFESTYLE_OPTIONS} />

      <PanelDivider />

      <SectionLabel label="Tags" />
      <FilterSearch label="Search tags" placeholder="e.g. BMW, Sport…" value={filters.tags} onChange={v => setFilter('tags', v)} />

      <PanelDivider />

      <SectionLabel label="Dimensions" />
      <FilterSelect label="Shape" value={filters.shape} onChange={v => setFilter('shape', v)} options={SHAPE_OPTIONS} />
      <Box sx={{ mx: 2, mb: '10px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        <DimInput label="Width min"  placeholder="px" value={filters.widthMin}  onChange={v => setFilter('widthMin', v)} />
        <DimInput label="Width max"  placeholder="px" value={filters.widthMax}  onChange={v => setFilter('widthMax', v)} />
      </Box>
      <Box sx={{ mx: 2, mb: '10px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        <DimInput label="Height min" placeholder="px" value={filters.heightMin} onChange={v => setFilter('heightMin', v)} />
        <DimInput label="Height max" placeholder="px" value={filters.heightMax} onChange={v => setFilter('heightMax', v)} />
      </Box>
    </Box>
  );
}
