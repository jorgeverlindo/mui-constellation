import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Dialog, Box, Typography, IconButton, TextField,
  Autocomplete, Chip, Divider, Button, Checkbox,
  InputAdornment, Tooltip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { Asset } from '../../types/asset';
import { Select } from './index';
import { getYears, getMakes, getModels, getTrims } from '../../utils/vehicleDatabase';
import { LifestyleTaggerModal } from '../../features/lifestyle-tagger/LifestyleTaggerModal';

// ─── Tokens ───────────────────────────────────────────────────────────────────
const BRAND    = '#473bab';
const TEXT_DIM = 'rgba(17,16,20,0.56)';
const BORDER   = 'rgba(0,0,0,0.10)';
const MIXED_PH = 'mixed';

const inputSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px', fontSize: 13, fontFamily: 'Roboto, sans-serif',
    '&.Mui-focused fieldset': { borderColor: BRAND },
  },
};
const chipSx = { height: 22, borderRadius: '100px', fontSize: 12, fontFamily: 'Roboto, sans-serif' };

// ─── Helpers ──────────────────────────────────────────────────────────────────
/** Returns the single shared value across assets for `field`, or null if mixed. */
function sharedValue<T>(assets: Asset[], field: keyof Asset): T | null {
  if (assets.length === 0) return null;
  const values = assets.map(a => a[field] ?? '');
  const first  = values[0];
  return values.every(v => v === first) ? (first as unknown as T) : null;
}

// ─── Field label ──────────────────────────────────────────────────────────────
function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <Typography sx={{ fontSize: 11, fontWeight: 600, fontFamily: 'Roboto, sans-serif', color: TEXT_DIM, letterSpacing: '0.6px', textTransform: 'uppercase', mb: 0.75 }}>
      {children}{required && <span style={{ color: '#ef4444', marginLeft: 2 }}>*</span>}
    </Typography>
  );
}

// ─── Info row ─────────────────────────────────────────────────────────────────
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.875, borderBottom: '1px solid', borderColor: 'divider', '&:last-child': { borderBottom: 'none' } }}>
      <Typography variant="caption" color="text.secondary" sx={{ fontSize: 12 }}>{label}</Typography>
      <Typography variant="caption" sx={{ fontSize: 12, fontWeight: 500, color: 'text.primary', maxWidth: 160, textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {value}
      </Typography>
    </Box>
  );
}

// ─── Asset table row ──────────────────────────────────────────────────────────
type SortField = 'name' | 'mimeType' | 'dimensions';

function AssetRow({
  asset, selected, active, onToggle, onActivate,
}: {
  asset: Asset;
  selected: boolean;
  active: boolean;
  onToggle: (id: string) => void;
  onActivate: (id: string) => void;
}) {
  return (
    <Box
      onClick={() => onActivate(asset.id)}
      sx={{
        display: 'flex', alignItems: 'center', gap: '12px',
        px: '16px', py: '10px', cursor: 'pointer',
        bgcolor: selected ? `${BRAND}08` : 'transparent',
        borderBottom: `1px solid ${BORDER}`,
        '&:hover': { bgcolor: selected ? `${BRAND}10` : 'rgba(0,0,0,0.02)' },
        transition: 'background 0.1s',
      }}
    >
      <Checkbox
        size="small"
        checked={selected}
        onClick={e => { e.stopPropagation(); onToggle(asset.id); }}
        sx={{ p: 0, color: BORDER, '&.Mui-checked': { color: BRAND }, flexShrink: 0 }}
      />
      <Box sx={{ width: 76, height: 76, borderRadius: '6px', overflow: 'hidden', bgcolor: '#f0f2f4', flexShrink: 0 }}>
        <Box component="img" src={asset.url} alt={asset.name} sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      </Box>
      <Box sx={{ flex: 2, minWidth: 0 }}>
        <Typography sx={{ fontSize: 13, fontFamily: 'Roboto, sans-serif', fontWeight: active ? 600 : 400, color: '#1f1d25', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {asset.name}
        </Typography>
      </Box>
      <Box sx={{ width: 56, flexShrink: 0 }}>
        <Typography sx={{ fontSize: 12, color: TEXT_DIM, fontFamily: 'Roboto, sans-serif' }}>
          {asset.mimeType?.split('/')[1]?.toUpperCase() ?? '—'}
        </Typography>
      </Box>
      <Box sx={{ width: 96, flexShrink: 0 }}>
        <Typography sx={{ fontSize: 12, color: TEXT_DIM, fontFamily: 'Roboto, sans-serif' }}>
          {asset.dimensions ?? '—'}
        </Typography>
      </Box>
      <Box sx={{ flex: 1, minWidth: 0, display: 'flex', gap: '4px', overflow: 'hidden' }}>
        {(asset.tags ?? []).slice(0, 2).map(t => (
          <Chip key={t} label={t} size="small" sx={{ ...chipSx, bgcolor: '#f0f2f4', color: '#1f1d25', height: 20 }} />
        ))}
        {(asset.tags?.length ?? 0) > 2 && (
          <Typography sx={{ fontSize: 11, color: TEXT_DIM, alignSelf: 'center' }}>+{(asset.tags?.length ?? 0) - 2}</Typography>
        )}
      </Box>
    </Box>
  );
}

// ─── Metadata panel ───────────────────────────────────────────────────────────
interface MetadataPanelProps {
  selectedAssets: Asset[];
  activeAsset: Asset | null;
  edits: Partial<Asset>;
  onChange: (field: keyof Asset, value: string | string[]) => void;
  isDirty: boolean;
  ymmtError: boolean;
  ymmtClearedNotice: boolean;
  onClearYmmt: () => void;
}

function MetadataPanel({ selectedAssets, activeAsset, edits, onChange, isDirty, ymmtError, ymmtClearedNotice, onClearYmmt }: MetadataPanelProps) {
  const count = selectedAssets.length;

  const years  = useMemo(() => getYears(), []);
  const makes  = useMemo(() => getMakes(), []);

  const getField = (field: keyof Asset): string => {
    if (field in edits) return edits[field] as string ?? '';
    if (count === 1 && activeAsset) return activeAsset[field] as string ?? '';
    const sv = sharedValue<string>(selectedAssets, field);
    return sv ?? '';
  };

  const isMixed = (field: keyof Asset): boolean => {
    if (field in edits) return false;
    if (count <= 1) return false;
    return sharedValue(selectedAssets, field) === null;
  };

  const year  = getField('year');
  const make  = getField('make');
  const model = getField('model');
  const trim  = getField('trim');
  const name  = getField('name');

  const models = useMemo(() => getModels(make), [make]);
  const trims  = useMemo(() => getTrims(make, model), [make, model]);

  const tagsForDisplay = useMemo<string[]>(() => {
    if ('tags' in edits) return edits.tags as string[] ?? [];
    if (count === 1 && activeAsset) return activeAsset.tags ?? [];
    const allSame = selectedAssets.every(a => JSON.stringify(a.tags ?? []) === JSON.stringify(selectedAssets[0]?.tags ?? []));
    return allSame ? (selectedAssets[0]?.tags ?? []) : [];
  }, [edits, count, activeAsset, selectedAssets]);

  const hasLifestyle = 'tags' in edits
    ? (edits.tags as string[] ?? []).includes('Lifestyle')
    : selectedAssets.some(a => (a.tags ?? []).includes('Lifestyle'));

  // ── Empty state ──────────────────────────────────────────────────────────
  if (count === 0) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', alignItems: 'center', justifyContent: 'center', px: 3, gap: 1 }}>
        <Typography sx={{ fontSize: 14, color: TEXT_DIM, fontFamily: 'Roboto, sans-serif', textAlign: 'center' }}>
          Select an asset to view its metadata
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Panel header */}
      <Box sx={{ px: 3, py: 2, flexShrink: 0, borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography sx={{ fontSize: 15, fontWeight: 700, fontFamily: 'Roboto, sans-serif' }}>Metadata</Typography>
        {count > 1 && (
          <Box sx={{ px: '8px', py: '2px', borderRadius: '100px', bgcolor: `${BRAND}12` }}>
            <Typography sx={{ fontSize: 11, fontWeight: 600, color: BRAND, fontFamily: 'Roboto, sans-serif' }}>
              {count} selected
            </Typography>
          </Box>
        )}
      </Box>

      <Box sx={{
        flex: 1, overflowY: 'auto', px: 3, py: 2,
        '&::-webkit-scrollbar': { width: 4 },
        '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(0,0,0,0.15)', borderRadius: 2 },
      }}>
        {/* Name — only shown in single-select mode */}
        {count === 1 && (
          <Box sx={{ mb: 2 }}>
            <FieldLabel required>Name</FieldLabel>
            <TextField size="small" fullWidth value={name} onChange={e => onChange('name', e.target.value)} sx={inputSx} />
          </Box>
        )}

        {/* Tags */}
        <Box sx={{ mb: 2.5 }}>
          <FieldLabel>Tags</FieldLabel>
          {isMixed('tags') && !('tags' in edits) ? (
            <Box
              onClick={() => onChange('tags', [])}
              sx={{ px: 1.5, py: 1, borderRadius: '8px', border: `1px solid ${BORDER}`, cursor: 'text', color: TEXT_DIM, fontSize: 13, fontFamily: 'Roboto, sans-serif', fontStyle: 'italic', bgcolor: '#fafafa' }}
            >
              {MIXED_PH}
            </Box>
          ) : (
            <Autocomplete
              multiple freeSolo size="small" options={['Lifestyle']} value={tagsForDisplay}
              filterOptions={(options) => options.filter(o => !tagsForDisplay.includes(o))}
              onChange={(_, v) => onChange('tags', v as string[])}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => {
                  const { key, ...rest } = getTagProps({ index });
                  return <Chip key={key} label={option} size="small" {...rest} sx={chipSx} />;
                })
              }
              renderInput={params => (
                <TextField {...params} size="small" placeholder={tagsForDisplay.length === 0 ? 'Add tag…' : ''} sx={inputSx} />
              )}
            />
          )}
        </Box>

        {/* YMMT — only for Lifestyle assets */}
        {hasLifestyle && (
          <>
            {/* Section header + Clear button */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
              <Typography sx={{ fontSize: 11, fontWeight: 600, color: TEXT_DIM, letterSpacing: '0.6px', textTransform: 'uppercase', fontFamily: 'Roboto, sans-serif' }}>
                Vehicle Info
              </Typography>
              {(year || make || model || trim) && (
                <Typography
                  onClick={onClearYmmt}
                  sx={{ fontSize: 11, color: BRAND, cursor: 'pointer', fontFamily: 'Roboto, sans-serif', '&:hover': { textDecoration: 'underline' } }}
                >
                  Clear
                </Typography>
              )}
            </Box>

            {/* Cleared notice */}
            {ymmtClearedNotice && (
              <Box sx={{ mb: 1.5, px: 1.5, py: 1, borderRadius: '8px', bgcolor: '#fffbeb', border: '1px solid #fcd34d' }}>
                <Typography sx={{ fontSize: 12, color: '#92400e', fontFamily: 'Roboto, sans-serif' }}>
                  Vehicle info was cleared.
                </Typography>
              </Box>
            )}

            {/* Grouped YMMT box */}
            <Box sx={{ mb: 2, p: 1.5, borderRadius: '10px', bgcolor: 'rgba(0,0,0,0.03)', border: `1px solid ${ymmtError ? '#fca5a5' : 'rgba(0,0,0,0.08)'}`, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box>
                <FieldLabel>Year</FieldLabel>
                <Select id="rm-year" label="" value={year} onChange={v => onChange('year', v)} options={years}
                  placeholder={isMixed('year') ? MIXED_PH : 'Select year'} showCheckIcon={false} />
              </Box>
              <Box>
                <FieldLabel>Make</FieldLabel>
                <Select id="rm-make" label="" value={make}
                  onChange={v => { onChange('make', v); onChange('model', ''); onChange('trim', ''); }}
                  options={makes} placeholder={isMixed('make') ? MIXED_PH : 'Select make'} showCheckIcon={false} />
              </Box>
              <Box>
                <FieldLabel>Model</FieldLabel>
                <Select id="rm-model" label="" value={model}
                  onChange={v => { onChange('model', v); onChange('trim', ''); }}
                  options={models} placeholder={isMixed('model') ? MIXED_PH : make ? 'Select model' : 'Select a make first'}
                  disabled={!make && !isMixed('make')} showCheckIcon={false} />
              </Box>
              <Box>
                <FieldLabel>Trim</FieldLabel>
                <Select id="rm-trim" label="" value={trim} onChange={v => onChange('trim', v)}
                  options={trims} placeholder={isMixed('trim') ? MIXED_PH : model ? 'Select trim' : 'Select a model first'}
                  disabled={!model && !isMixed('model')} showCheckIcon={false} />
              </Box>
              {ymmtError && (
                <Typography sx={{ fontSize: 12, color: '#b91c1c', fontFamily: 'Roboto, sans-serif' }}>
                  If adding vehicle info, Year, Make and Model must all be filled.
                </Typography>
              )}
            </Box>
          </>
        )}

        {/* Brand */}
        <Box sx={{ mb: 2 }}>
          <FieldLabel>Brand</FieldLabel>
          <TextField size="small" fullWidth
            value={getField('brand')}
            onChange={e => onChange('brand', e.target.value)}
            placeholder="Add brand…"
            sx={inputSx}
          />
        </Box>

        {/* Expiration Date */}
        <Box sx={{ mb: 2 }}>
          <FieldLabel>Expiration Date</FieldLabel>
          <TextField size="small" fullWidth
            value={getField('expiryDate')}
            onChange={e => onChange('expiryDate', e.target.value)}
            placeholder="MM/DD/YYYY"
            sx={inputSx}
          />
        </Box>

        {/* Description */}
        <Box sx={{ mb: 2 }}>
          <FieldLabel>Description</FieldLabel>
          <TextField size="small" fullWidth multiline minRows={2}
            value={getField('description')}
            onChange={e => onChange('description', e.target.value)}
            sx={inputSx}
          />
        </Box>

        {/* Notes */}
        <Box sx={{ mb: 2 }}>
          <FieldLabel>Notes</FieldLabel>
          <TextField size="small" fullWidth multiline minRows={2}
            value={getField('notes')}
            onChange={e => onChange('notes', e.target.value)}
            sx={inputSx}
          />
        </Box>

        {/* File info — single asset only */}
        {count === 1 && activeAsset && (
          <>
            <Divider sx={{ mb: 2 }} />
            <InfoRow label="Asset ID"      value={activeAsset.id.slice(0, 18) + '…'} />
            <InfoRow label="File Type"     value={activeAsset.mimeType?.split('/')[1]?.toUpperCase() ?? '—'} />
            <InfoRow label="Dimensions"    value={activeAsset.dimensions ?? '—'} />
            <InfoRow label="Date Uploaded" value={new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })} />
          </>
        )}
        {count > 1 && isDirty && (
          <Box sx={{ px: 1.5, py: 1, borderRadius: '8px', bgcolor: `${BRAND}06`, border: `1px solid ${BRAND}20` }}>
            <Typography sx={{ fontSize: 12, color: BRAND, fontFamily: 'Roboto, sans-serif', fontStyle: 'italic' }}>
              Edits will apply to all {count} selected assets.
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}

// ─── Delete confirmation ──────────────────────────────────────────────────────
function DeleteConfirmDialog({
  open, count, onConfirm, onCancel,
}: {
  open: boolean; count: number; onConfirm: () => void; onCancel: () => void;
}) {
  return (
    <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: '16px' } }}>
      <Box sx={{ p: 3 }}>
        <Typography sx={{ fontSize: 17, fontWeight: 700, fontFamily: 'Roboto, sans-serif', mb: 1 }}>
          Delete {count} asset{count !== 1 ? 's' : ''}?
        </Typography>
        <Typography sx={{ fontSize: 14, color: TEXT_DIM, fontFamily: 'Roboto, sans-serif', mb: 3 }}>
          This action cannot be undone. The selected asset{count !== 1 ? 's' : ''} will be permanently removed.
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Button onClick={onCancel} size="small" sx={{ textTransform: 'none', color: TEXT_DIM, borderRadius: '100px', fontFamily: 'Roboto, sans-serif' }}>
            Cancel
          </Button>
          <Button onClick={onConfirm} variant="contained" size="small"
            sx={{ textTransform: 'none', borderRadius: '100px', bgcolor: '#d32f2f', boxShadow: 'none', fontFamily: 'Roboto, sans-serif', fontWeight: 600, '&:hover': { bgcolor: '#b71c1c', boxShadow: 'none' } }}>
            Delete
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
}

// ─── Sort header cell ─────────────────────────────────────────────────────────
function SortHeader({ label, field, active, dir, onClick }: {
  label: string; field: SortField; active: boolean; dir: 'asc' | 'desc'; onClick: (f: SortField) => void;
}) {
  return (
    <Box onClick={() => onClick(field)} sx={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', userSelect: 'none', '&:hover': { color: BRAND } }}>
      <Typography sx={{ fontSize: 11, fontWeight: 600, fontFamily: 'Roboto, sans-serif', letterSpacing: '0.4px', color: active ? BRAND : TEXT_DIM }}>
        {label}
      </Typography>
      {active && (dir === 'asc'
        ? <ArrowUpwardIcon sx={{ fontSize: 12, color: BRAND }} />
        : <ArrowDownwardIcon sx={{ fontSize: 12, color: BRAND }} />)}
    </Box>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface ReviewMetadataModalProps {
  open: boolean;
  assets: Asset[];
  onClose: () => void;
  onSave?: (updatedAssets: Asset[]) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────
export function ReviewMetadataModal({ open, assets: initialAssets, onClose, onSave }: ReviewMetadataModalProps) {
  const [localAssets,  setLocalAssets]  = useState<Asset[]>(initialAssets);
  const [selectedIds,  setSelectedIds]  = useState<Set<string>>(() => new Set(initialAssets.map(a => a.id)));
  const [activeId,     setActiveId]     = useState<string | null>(initialAssets[0]?.id ?? null);
  const [edits,        setEdits]        = useState<Partial<Asset>>({});
  const [search,       setSearch]       = useState('');
  const [sortField,    setSortField]    = useState<SortField | null>(null);
  const [sortDir,      setSortDir]      = useState<'asc' | 'desc'>('asc');
  const [deleteOpen,        setDeleteOpen]        = useState(false);
  const [viewAssetId,       setViewAssetId]       = useState<string | null>(null);
  const [ymmtClearedNotice, setYmmtClearedNotice] = useState(false);

  // Reset when opened
  useEffect(() => {
    if (open) {
      setLocalAssets(initialAssets);
      setSelectedIds(new Set(initialAssets.map(a => a.id)));
      setActiveId(initialAssets[0]?.id ?? null);
      setEdits({});
      setSearch('');
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Filter + sort ─────────────────────────────────────────────────────────
  const displayed = useMemo(() => {
    let list = search.trim()
      ? localAssets.filter(a => a.name.toLowerCase().includes(search.toLowerCase()))
      : localAssets;
    if (sortField) {
      list = [...list].sort((a, b) => {
        const av = (a[sortField] as string) ?? '';
        const bv = (b[sortField] as string) ?? '';
        return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
      });
    }
    return list;
  }, [localAssets, search, sortField, sortDir]);

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  // ── Selection ─────────────────────────────────────────────────────────────
  const selectedCount = selectedIds.size;
  const allSelected   = selectedCount === displayed.length && displayed.length > 0;

  const toggleAll = useCallback(() => {
    if (allSelected) { setSelectedIds(new Set()); }
    else { setSelectedIds(new Set(displayed.map(a => a.id))); }
  }, [allSelected, displayed]);

  const toggleOne = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const handleActivate = useCallback((id: string) => {
    setActiveId(id);
    setEdits({});
    setYmmtClearedNotice(false);
  }, []);

  const clearSelection = () => { setSelectedIds(new Set()); setEdits({}); };

  // ── Derived ───────────────────────────────────────────────────────────────
  const selectedAssets = localAssets.filter(a => selectedIds.has(a.id));
  const activeAsset    = localAssets.find(a => a.id === activeId) ?? null;
  const panelAssets    = selectedCount > 0 ? selectedAssets : (activeAsset ? [activeAsset] : []);
  const isDirty        = Object.keys(edits).length > 0;

  // ── YMMT validation ───────────────────────────────────────────────────────
  const _panelHasLifestyle = 'tags' in edits
    ? (edits.tags as string[] ?? []).includes('Lifestyle')
    : panelAssets.some(a => (a.tags ?? []).includes('Lifestyle'));
  const _getEditedField = (field: keyof Asset) =>
    field in edits ? edits[field] as string ?? '' : (panelAssets[0]?.[field] as string ?? '');
  const _year  = _getEditedField('year');
  const _make  = _getEditedField('make');
  const _model = _getEditedField('model');
  const _trim  = _getEditedField('trim');
  const ymmtTouched   = Boolean(_year || _make || _model || _trim);
  const ymmtIncomplete = _panelHasLifestyle && ymmtTouched && !(_year && _make && _model);

  // ── Edit handler ──────────────────────────────────────────────────────────
  const handleEditField = useCallback((field: keyof Asset, value: string | string[]) => {
    setEdits(prev => {
      const next: Partial<Asset> = { ...prev, [field]: value };
      // UC-5: removing "Lifestyle" tag when YMMT is set → auto-clear YMMT
      if (field === 'tags') {
        const newTags = value as string[];
        const hadLifestyle = 'tags' in prev
          ? (prev.tags as string[] ?? []).includes('Lifestyle')
          : panelAssets.some(a => (a.tags ?? []).includes('Lifestyle'));
        const hasYmmt = Boolean(
          prev.year || prev.make || prev.model || prev.trim ||
          panelAssets.some(a => a.year || a.make || a.model || a.trim)
        );
        if (hadLifestyle && !newTags.includes('Lifestyle') && hasYmmt) {
          // Only clear fields that were explicitly edited — untouched fields stay
          // out of `edits` so mixed state is preserved for multi-selection.
          if ('year'  in prev) next.year  = '';
          if ('make'  in prev) next.make  = '';
          if ('model' in prev) next.model = '';
          if ('trim'  in prev) next.trim  = '';
          setYmmtClearedNotice(true);
        }
      }
      return next;
    });
  }, [panelAssets]);

  // ── Clear YMMT (UC-6) ─────────────────────────────────────────────────────
  const handleClearYmmt = useCallback(() => {
    setEdits(prev => ({ ...prev, year: '', make: '', model: '', trim: '' }));
    setYmmtClearedNotice(false);
  }, []);

  // ── Delete ────────────────────────────────────────────────────────────────
  const idsToDelete = selectedCount > 0 ? Array.from(selectedIds) : (activeId ? [activeId] : []);

  const handleDeleteConfirm = () => {
    const deletedSet = new Set(idsToDelete);
    const remaining  = localAssets.filter(a => !deletedSet.has(a.id));
    setLocalAssets(remaining);
    setSelectedIds(new Set());
    setEdits({});
    // Set active to first remaining
    setActiveId(remaining[0]?.id ?? null);
    setDeleteOpen(false);
  };

  // ── View ──────────────────────────────────────────────────────────────────
  const handleView = () => {
    const id = selectedCount === 1 ? Array.from(selectedIds)[0] : activeId;
    if (id) setViewAssetId(id);
  };

  const viewAsset = localAssets.find(a => a.id === viewAssetId) ?? null;

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSave = () => {
    if (!isDirty) { onClose(); return; }
    const targetIds = new Set(panelAssets.map(a => a.id));
    const updated = localAssets.map(a => targetIds.has(a.id) ? { ...a, ...edits } : a);
    setLocalAssets(updated);
    setEdits({});
    onSave?.(updated);
    onClose();
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth={false}
        fullWidth
        PaperProps={{
          sx: {
            width: '92vw', maxWidth: 1280, height: '88vh',
            borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column',
          },
        }}
      >
        {/* ── Dialog header ─────────────────────────────────────────────────── */}
        <Box sx={{ display: 'flex', alignItems: 'center', px: 3, py: 1.75, borderBottom: `1px solid ${BORDER}`, flexShrink: 0, gap: 2 }}>
          <Typography sx={{ fontSize: 17, fontWeight: 700, fontFamily: 'Roboto, sans-serif', flex: 1 }}>
            Review Metadata
          </Typography>
          <IconButton size="small" onClick={onClose} sx={{ color: TEXT_DIM }}>
            <CloseIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Box>

        {/* ── Body ──────────────────────────────────────────────────────────── */}
        <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

          {/* Left — asset list */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', borderRight: `1px solid ${BORDER}` }}>

            {/* Toolbar */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px', px: 2, py: '10px', borderBottom: `1px solid ${BORDER}`, flexShrink: 0 }}>
              {/* Left group: selection pill + action icons */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0, bgcolor: 'rgba(0,0,0,0.04)', border: `1px solid ${BORDER}`, borderRadius: '100px', px: '10px', py: '5px' }}>
                {selectedCount > 0 ? (
                  <>
                    <IconButton size="small" onClick={clearSelection} sx={{ p: 0, width: 14, height: 14, color: '#444' }}>
                      <CloseIcon sx={{ fontSize: 12 }} />
                    </IconButton>
                    <Typography sx={{ fontSize: 13, fontWeight: 500, color: '#1f1d25', fontFamily: 'Roboto, sans-serif', whiteSpace: 'nowrap', mr: '2px' }}>
                      {selectedCount} selected
                    </Typography>
                  </>
                ) : (
                  <Typography sx={{ fontSize: 13, color: TEXT_DIM, fontFamily: 'Roboto, sans-serif', px: '2px' }}>
                    0 selected
                  </Typography>
                )}

                <Tooltip title="View asset">
                  <span>
                    <IconButton size="small" onClick={handleView} disabled={idsToDelete.length === 0}
                      sx={{ color: TEXT_DIM, '&:hover': { color: BRAND }, '&.Mui-disabled': { opacity: 0.3 } }}>
                      <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  </span>
                </Tooltip>

                <Tooltip title={`Delete ${idsToDelete.length > 0 ? idsToDelete.length : ''} asset${idsToDelete.length !== 1 ? 's' : ''}`}>
                  <span>
                    <IconButton size="small" onClick={() => setDeleteOpen(true)} disabled={idsToDelete.length === 0}
                      sx={{ color: TEXT_DIM, '&:hover': { color: '#d32f2f' }, '&.Mui-disabled': { opacity: 0.3 } }}>
                      <DeleteOutlineIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  </span>
                </Tooltip>

                <IconButton size="small" sx={{ color: TEXT_DIM }}>
                  <MoreHorizIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Box>

              {/* Search — fixed width, not full-width */}
              <TextField
                size="small"
                placeholder="Find below"
                value={search}
                onChange={e => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 16, color: TEXT_DIM }} /></InputAdornment>,
                }}
                sx={{
                  width: 200,
                  '& .MuiOutlinedInput-root': { borderRadius: '100px', fontSize: 13, height: 32, fontFamily: 'Roboto, sans-serif' },
                  '& .MuiOutlinedInput-root.Mui-focused fieldset': { borderColor: BRAND },
                }}
              />

              {/* Spacer */}
              <Box sx={{ flex: 1 }} />

              {/* Right: Select All + item count */}
              <Typography
                onClick={allSelected ? () => setSelectedIds(new Set()) : () => setSelectedIds(new Set(displayed.map(a => a.id)))}
                sx={{ fontSize: 13, color: BRAND, fontFamily: 'Roboto, sans-serif', cursor: 'pointer', whiteSpace: 'nowrap', '&:hover': { textDecoration: 'underline' } }}
              >
                {allSelected ? 'Deselect All' : 'Select All'}
              </Typography>
              <Typography sx={{ fontSize: 13, color: TEXT_DIM, fontFamily: 'Roboto, sans-serif', whiteSpace: 'nowrap' }}>
                {displayed.length} Item{displayed.length !== 1 ? 's' : ''}
              </Typography>
            </Box>

            {/* Table header */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px', px: '16px', py: '8px', bgcolor: '#f9fafa', borderBottom: `1px solid ${BORDER}`, flexShrink: 0 }}>
              <Checkbox size="small" checked={allSelected} indeterminate={selectedCount > 0 && !allSelected} onChange={toggleAll}
                sx={{ p: 0, color: BORDER, '&.Mui-checked, &.MuiCheckbox-indeterminate': { color: BRAND }, flexShrink: 0 }} />
              <Box sx={{ width: 76, flexShrink: 0 }} />
              <Box sx={{ flex: 2, minWidth: 0 }}>
                <SortHeader label="NAME" field="name" active={sortField === 'name'} dir={sortDir} onClick={handleSort} />
              </Box>
              <Box sx={{ width: 56, flexShrink: 0 }}>
                <SortHeader label="FORMAT" field="mimeType" active={sortField === 'mimeType'} dir={sortDir} onClick={handleSort} />
              </Box>
              <Box sx={{ width: 96, flexShrink: 0 }}>
                <SortHeader label="DIMENSIONS" field="dimensions" active={sortField === 'dimensions'} dir={sortDir} onClick={handleSort} />
              </Box>
              <Typography sx={{ flex: 1, fontSize: 11, fontWeight: 600, color: TEXT_DIM, fontFamily: 'Roboto, sans-serif', letterSpacing: '0.4px' }}>
                TAGS
              </Typography>
            </Box>

            {/* Asset rows */}
            <Box sx={{ flex: 1, overflowY: 'auto', '&::-webkit-scrollbar': { width: 4 }, '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(0,0,0,0.15)', borderRadius: 2 } }}>
              {displayed.length === 0 ? (
                <Box sx={{ py: 6, textAlign: 'center' }}>
                  <Typography sx={{ fontSize: 13, color: TEXT_DIM, fontFamily: 'Roboto, sans-serif' }}>No assets found</Typography>
                </Box>
              ) : displayed.map(asset => (
                <AssetRow
                  key={asset.id}
                  asset={asset}
                  selected={selectedIds.has(asset.id)}
                  active={asset.id === activeId}
                  onToggle={toggleOne}
                  onActivate={handleActivate}
                />
              ))}
            </Box>
          </Box>

          {/* Right — metadata panel */}
          <Box sx={{ width: 320, flexShrink: 0, overflow: 'hidden' }}>
            <MetadataPanel
              selectedAssets={panelAssets}
              activeAsset={activeAsset}
              edits={edits}
              onChange={handleEditField}
              isDirty={isDirty}
              ymmtError={ymmtIncomplete}
              ymmtClearedNotice={ymmtClearedNotice}
              onClearYmmt={handleClearYmmt}
            />
          </Box>
        </Box>

        {/* ── Footer ──────────────────────────────────────────────────────────── */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, px: 3, py: 1.75, borderTop: `1px solid ${BORDER}`, flexShrink: 0 }}>
          <Button onClick={onClose} size="small" sx={{ textTransform: 'none', color: TEXT_DIM, borderRadius: '100px', fontFamily: 'Roboto, sans-serif', px: 2 }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            size="small"
            onClick={handleSave}
            disabled={!isDirty || ymmtIncomplete}
            sx={{
              textTransform: 'none', borderRadius: '100px', bgcolor: BRAND,
              boxShadow: 'none', fontFamily: 'Roboto, sans-serif', fontWeight: 600, px: 2.5,
              '&:hover': { bgcolor: '#3730a3', boxShadow: 'none' },
              '&.Mui-disabled': { bgcolor: `${BRAND}30`, color: '#fff' },
            }}
          >
            Save
          </Button>
        </Box>
      </Dialog>

      {/* Delete confirmation */}
      <DeleteConfirmDialog
        open={deleteOpen}
        count={idsToDelete.length}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteOpen(false)}
      />

      {/* View asset */}
      {viewAsset && (
        <LifestyleTaggerModal
          open={Boolean(viewAssetId)}
          asset={viewAsset}
          onClose={() => setViewAssetId(null)}
          onApproved={() => setViewAssetId(null)}
          onDismissed={() => setViewAssetId(null)}
          mode="view"
        />
      )}
    </>
  );
}
