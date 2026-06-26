// ─── VehicleInventoryGrid ─────────────────────────────────────────────────────
// MUI migration of source/inventory/VehicleInventoryGrid.tsx
// Table Large — 90px rows, drag-resize headers, sticky kebab overlay.
// Drop: framer-motion layoutId | Keep: all visual styles, interactions

import React, { useState, useCallback } from 'react';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CloseIcon from '@mui/icons-material/Close';
import type { VinInventoryRecord, AIGenerationStatus, SyndicationStatus } from '../../../../../data/inventory/vehicleInventory';
import { AIGenerationChip, SyndicationChip, PriceToMarketChip, PriorityScoreChip, AIConfigBadge } from './chips';
import { VehiclesMenu, type VehiclesMenuAnchor, type VehiclesMenuAction } from './VehiclesMenu';

// ─── Typography ───────────────────────────────────────────────────────────────
const BODY2_SX = { fontFamily: "'Roboto',sans-serif", fontWeight: 400, fontSize: 12, lineHeight: 1.43, letterSpacing: '0.17px' };
const HEADER_SX = { fontFamily: "'Roboto',sans-serif", fontWeight: 500, fontSize: 14, lineHeight: '24px', letterSpacing: '0.17px', color: '#1f1d25', whiteSpace: 'nowrap' as const };

// ─── Sort Icon (decorative) — exported so condensed table can reuse ───────────
export function ArrowDownIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="rgba(17,16,20,0.56)" style={{ flexShrink: 0 }}>
      <path d="M20 12l-1.41-1.41L13 16.17V4h-2v12.17l-5.58-5.59L4 12l8 8 8-8z" />
    </svg>
  );
}

// ─── HeaderDivider — drag-resize, absolutely positioned at cell left edge ──────
// Positioned absolute so it occupies 0 layout space — only 1px line is visible.
export function HeaderDivider({ prevWidth, onPrevWidthChange }: { prevWidth: number; onPrevWidthChange: (w: number) => void }) {
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    const startX = e.clientX;
    const startW = prevWidth;
    const onMove = (ev: MouseEvent) => onPrevWidthChange(Math.max(40, startW + (ev.clientX - startX)));
    const onUp = () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };
  return (
    <Box
      onMouseDown={handleMouseDown}
      sx={{
        position: 'absolute', left: -4, top: 0, bottom: 0, width: 8, zIndex: 2,
        cursor: 'col-resize', display: 'flex', alignItems: 'center', justifyContent: 'center',
        '&:hover .dv-line, &:active .dv-line': { bgcolor: '#6356e1' },
      }}
    >
      <Box className="dv-line" sx={{ width: '1px', height: 24, bgcolor: 'rgba(0,0,0,0.12)', transition: 'background-color 150ms' }} />
    </Box>
  );
}

// ─── ThumbnailImg ─────────────────────────────────────────────────────────────
function ThumbnailImg({ src, alt, cover, fallbackSrc }: { src: string; alt: string; cover?: boolean; fallbackSrc?: string }) {
  const [scale,      setScale]      = useState(1);
  const [imgSrc,     setImgSrc]     = useState(src);
  const [isFallback, setIsFallback] = useState(false);

  React.useEffect(() => { setImgSrc(src); setIsFallback(false); }, [src]);

  const handleLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    if (cover && !isFallback) return;
    const { naturalWidth: w, naturalHeight: h } = e.currentTarget;
    if (!w || !h) return;
    setScale((Math.max(w, h) / Math.min(w, h)) * 0.80);
  }, [cover, isFallback]);

  const handleError = useCallback(() => {
    if (fallbackSrc && imgSrc !== fallbackSrc) { setImgSrc(fallbackSrc); setIsFallback(true); }
  }, [fallbackSrc, imgSrc]);

  if (cover && !isFallback) {
    return (
      <Box sx={{ width: 76, height: 76, overflow: 'hidden' }}>
        <Box component="img" src={imgSrc} alt={alt} onError={handleError} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </Box>
    );
  }
  return (
    <Box sx={{ width: 76, height: 76, bgcolor: '#f0f2f4', display: 'flex', alignItems: 'center', justifyContent: 'center', p: '8px' }}>
      <Box sx={{ width: 60, height: 60, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box component="img" src={imgSrc} alt={alt} onLoad={handleLoad} onError={handleError}
          sx={{ width: '100%', height: '100%', objectFit: 'contain', transform: `scale(${scale})` }} />
      </Box>
    </Box>
  );
}

// ─── ColWidths — exported so VehicleTableCondensed can share the type ─────────
export interface ColWidths {
  expand: number; checkbox: number; thumbnail: number; vin: number;
  condition: number; year: number; make: number; model: number;
  trim: number; price: number; aiGeneration: number; syndication: number;
  exteriorColor: number; vehicleStatus: number; dol: number;
  priceToMarket: number; priorityScore: number;
}
const DEFAULT_WIDTHS: ColWidths = {
  expand: 24, checkbox: 42, thumbnail: 76, vin: 190, condition: 90,
  year: 80, make: 100, model: 110, trim: 120, price: 100,
  aiGeneration: 140, syndication: 145, exteriorColor: 155,
  vehicleStatus: 130, dol: 80, priceToMarket: 175, priorityScore: 130,
};

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
  records: VinInventoryRecord[];
  selected: Set<string>;
  onToggleRow: (id: string, checked: boolean) => void;
  onToggleAll: (checked: boolean) => void;
  onVinClick?: (id: string) => void;
  onSyndicationToggle?: (id: string) => void;
  onAiGenerationToggle?: (id: string) => void;
  onViewSourceImages?: (id: string) => void;
  onAttachComment?: (id: string) => void;
}

export function VehicleInventoryGrid({
  records, selected, onToggleRow, onToggleAll,
  onVinClick, onSyndicationToggle, onAiGenerationToggle,
  onViewSourceImages, onAttachComment,
}: Props) {
  const allSelected = records.length > 0 && records.every(r => selected.has(r.id));
  const [widths, setWidths] = useState<ColWidths>(DEFAULT_WIDTHS);
  const [openMenu, setOpenMenu] = useState<{
    recordId: string; anchor: VehiclesMenuAnchor;
    syndicationStatus: SyndicationStatus; aiGenerationStatus: AIGenerationStatus;
    aiConfigApplied: boolean;
  } | null>(null);

  const handleMenuAction = useCallback((action: VehiclesMenuAction) => {
    if (!openMenu) return;
    const { recordId, syndicationStatus, aiGenerationStatus } = openMenu;
    if (action === 'vinDetails')        onVinClick?.(recordId);
    if (action === 'syndicate')         onSyndicationToggle?.(recordId);
    if (action === 'disableAiImage')    onAiGenerationToggle?.(recordId);
    if (action === 'viewSourceImages')  onViewSourceImages?.(recordId);
    if (action === 'attachComment')     onAttachComment?.(recordId);
    setOpenMenu(null);
  }, [openMenu, onVinClick, onSyndicationToggle, onAiGenerationToggle, onViewSourceImages, onAttachComment]);

  const setW = (key: keyof ColWidths) => (val: number) => setWidths(prev => ({ ...prev, [key]: val }));
  const w = (key: keyof ColWidths) => ({ width: widths[key], minWidth: widths[key] });

  // Header cell — position:relative so HeaderDivider can be absolutely positioned at left edge
  const Th = ({ label, colKey, prevKey }: { label: string; colKey: keyof ColWidths; prevKey: keyof ColWidths }) => (
    <TableCell sx={{ p: 0, textAlign: 'left', height: 52, position: 'relative', overflow: 'visible', ...w(colKey) }}>
      <HeaderDivider prevWidth={widths[prevKey]} onPrevWidthChange={setW(prevKey)} />
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pl: '8px', pr: '16px', py: '16px', height: '100%' }}>
        <Box component="span" sx={HEADER_SX}>{label}</Box>
        <ArrowDownIcon />
      </Box>
    </TableCell>
  );

  return (
    <>
      <TableContainer sx={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
        <Table sx={{ borderCollapse: 'collapse', tableLayout: 'fixed', width: 'max-content', minWidth: '100%' }}>
          {/* Sticky header */}
          <TableHead sx={{ position: 'sticky', top: 0, zIndex: 10, bgcolor: 'white' }}>
            <TableRow sx={{ height: 52, borderBottom: '1px solid rgba(0,0,0,0.12)' }}>
              {/* Expand */}
              <TableCell sx={{ p: 0, pl: '8px', ...w('expand'), border: 0 }} />
              {/* Checkbox */}
              <TableCell sx={{ p: '0 4px', ...w('checkbox'), border: 0 }}>
                <Box sx={{ p: '9px' }}>
                  <input type="checkbox" checked={allSelected} onChange={e => onToggleAll(e.target.checked)}
                    style={{ width: 14, height: 14, accentColor: '#473bab', cursor: 'pointer' }} />
                </Box>
              </TableCell>
              {/* Thumbnail — invisible */}
              <TableCell sx={{ ...w('thumbnail'), opacity: 0, border: 0 }} />
              {/* Columns */}
              <Th label="VIN"            colKey="vin"           prevKey="thumbnail" />
              <Th label="Condition"      colKey="condition"     prevKey="vin" />
              <Th label="Year"           colKey="year"          prevKey="condition" />
              <Th label="Make"           colKey="make"          prevKey="year" />
              <Th label="Model"          colKey="model"         prevKey="make" />
              <Th label="Trim"           colKey="trim"          prevKey="model" />
              <Th label="Price"          colKey="price"         prevKey="trim" />
              <Th label="AI Generation"  colKey="aiGeneration"  prevKey="price" />
              <Th label="Syndication"    colKey="syndication"   prevKey="aiGeneration" />
              <Th label="Exterior Color" colKey="exteriorColor" prevKey="syndication" />
              <Th label="Vehicle Status" colKey="vehicleStatus" prevKey="exteriorColor" />
              <Th label="DOL"            colKey="dol"           prevKey="vehicleStatus" />
              {/* Price to Market — centered */}
              <TableCell sx={{ p: 0, ...w('priceToMarket'), border: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                  <HeaderDivider prevWidth={widths.dol} onPrevWidthChange={setW('dol')} />
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pr: '16px', py: '16px', flex: 1, justifyContent: 'center' }}>
                    <Box component="span" sx={HEADER_SX}>Price to Market</Box>
                    <ArrowDownIcon />
                  </Box>
                </Box>
              </TableCell>
              {/* Priority Score — with info icon */}
              <TableCell sx={{ p: 0, ...w('priorityScore'), border: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                  <HeaderDivider prevWidth={widths.priceToMarket} onPrevWidthChange={setW('priceToMarket')} />
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pr: '16px', py: '16px', flex: 1, minWidth: 0 }}>
                    <Box component="span" sx={HEADER_SX}>Priority Score</Box>
                    <ArrowDownIcon />
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(17,16,20,0.38)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                      <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
                    </svg>
                  </Box>
                </Box>
              </TableCell>
              {/* Sticky kebab header — zero width */}
              <TableCell sx={{ position: 'sticky', right: 0, zIndex: 11, bgcolor: 'white', p: 0, width: 0, minWidth: 0, border: 0 }} />
            </TableRow>
          </TableHead>

          {/* Body */}
          <TableBody>
            {records.map(record => {
              const isSelected = selected.has(record.id);
              const isDisabled = record.aiGeneration === 'disabled';
              const hoverBg = isSelected ? 'rgba(99,86,225,0.12)' : isDisabled ? 'rgba(31,29,37,0.06)' : 'rgba(31,29,37,0.04)';
              const rowBg   = isDisabled && !isSelected ? 'rgba(31,29,37,0.04)' : isSelected ? 'rgba(99,86,225,0.08)' : 'white';

              return (
                <TableRow
                  key={record.id}
                  sx={{
                    height: 90,
                    bgcolor: rowBg,
                    borderBottom: '1px solid rgba(0,0,0,0.12)',
                    transition: 'background-color 150ms ease-in-out',
                    cursor: 'pointer',
                    '&:hover': { bgcolor: hoverBg },
                    '&:hover .inv-kebab': { visibility: 'visible' },
                  }}
                >
                  {/* Expand chevron */}
                  <TableCell sx={{ pl: '8px', pr: 0, ...w('expand'), border: 0 }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(17,16,20,0.56)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                      style={{ transition: 'transform 300ms ease-out', opacity: isDisabled ? 0.5 : 1 }}>
                      <path d="M9 18l6-6-6-6"/>
                    </svg>
                  </TableCell>

                  {/* Checkbox */}
                  <TableCell sx={{ px: '4px', ...w('checkbox'), border: 0 }}>
                    <Box sx={{ p: '9px' }}>
                      <input type="checkbox" checked={isSelected}
                        onChange={e => { e.stopPropagation(); onToggleRow(record.id, e.target.checked); }}
                        style={{ width: 14, height: 14, accentColor: '#473bab', cursor: 'pointer' }} />
                    </Box>
                  </TableCell>

                  {/* Thumbnail */}
                  <TableCell sx={{ p: 0, ...w('thumbnail'), border: 0 }}>
                    <Box sx={{ position: 'relative', width: 76, height: 76, opacity: isDisabled ? 0.5 : 1 }}>
                      <ThumbnailImg
                        src={record.aiConfigApplied && record.vehicleGroup?.angles?.['34l']
                          ? record.vehicleGroup.angles['34l'] as string
                          : record.thumbnail}
                        alt={`${record.make} ${record.model}`}
                        cover={!!(record.aiConfigApplied && record.vehicleGroup?.angles?.['34l'])}
                        fallbackSrc={record.thumbnail}
                      />
                      {record.aiGeneration === 'enabled' && <AIConfigBadge />}
                    </Box>
                  </TableCell>

                  {/* VIN */}
                  <TableCell sx={{ px: '16px', ...w('vin'), border: 0 }}>
                    <Box sx={{ opacity: isDisabled ? 0.5 : 1 }}>
                      <Box component="button" onClick={() => onVinClick?.(record.id)}
                        sx={{ ...BODY2_SX, color: '#473bab', textDecoration: 'none', '&:hover': { textDecoration: 'underline' },
                          cursor: 'pointer', bgcolor: 'transparent', border: 'none', p: 0, textAlign: 'left',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>
                        {record.vin}
                      </Box>
                    </Box>
                  </TableCell>

                  {/* Condition */}
                  <TableCell sx={{ px: '16px', ...w('condition'), border: 0 }}>
                    <Box component="p" sx={{ ...BODY2_SX, color: '#1f1d25', whiteSpace: 'nowrap', m: 0, opacity: isDisabled ? 0.5 : 1 }}>{record.condition}</Box>
                  </TableCell>

                  {/* Year */}
                  <TableCell sx={{ px: '16px', ...w('year'), border: 0 }}>
                    <Box component="p" sx={{ ...BODY2_SX, color: '#1f1d25', m: 0, opacity: isDisabled ? 0.5 : 1 }}>{record.year}</Box>
                  </TableCell>

                  {/* Make */}
                  <TableCell sx={{ px: '16px', ...w('make'), border: 0 }}>
                    <Box component="p" sx={{ ...BODY2_SX, color: '#1f1d25', whiteSpace: 'nowrap', m: 0, opacity: isDisabled ? 0.5 : 1 }}>{record.make}</Box>
                  </TableCell>

                  {/* Model */}
                  <TableCell sx={{ px: '16px', ...w('model'), border: 0 }}>
                    <Box component="p" sx={{ ...BODY2_SX, color: '#1f1d25', whiteSpace: 'nowrap', m: 0, opacity: isDisabled ? 0.5 : 1 }}>{record.model}</Box>
                  </TableCell>

                  {/* Trim */}
                  <TableCell sx={{ px: '16px', ...w('trim'), border: 0 }}>
                    <Box component="p" sx={{ ...BODY2_SX, color: '#1f1d25', whiteSpace: 'nowrap', m: 0, opacity: isDisabled ? 0.5 : 1 }}>{record.trim}</Box>
                  </TableCell>

                  {/* Price */}
                  <TableCell sx={{ px: '16px', ...w('price'), border: 0 }}>
                    <Box component="p" sx={{ ...BODY2_SX, color: '#1f1d25', whiteSpace: 'nowrap', m: 0, opacity: isDisabled ? 0.5 : 1 }}>
                      ${record.price.toLocaleString()}
                    </Box>
                  </TableCell>

                  {/* AI Generation */}
                  <TableCell sx={{ px: '16px', ...w('aiGeneration'), border: 0 }}>
                    <AIGenerationChip status={record.aiGeneration} />
                  </TableCell>

                  {/* Syndication */}
                  <TableCell sx={{ px: '16px', ...w('syndication'), border: 0 }}>
                    <SyndicationChip status={record.syndication} />
                  </TableCell>

                  {/* Exterior Color */}
                  <TableCell sx={{ px: '16px', ...w('exteriorColor'), border: 0 }}>
                    <Box component="p" sx={{ ...BODY2_SX, color: '#1f1d25', whiteSpace: 'nowrap', m: 0, opacity: isDisabled ? 0.5 : 1 }}>{record.exteriorColor}</Box>
                  </TableCell>

                  {/* Vehicle Status */}
                  <TableCell sx={{ px: '16px', ...w('vehicleStatus'), border: 0 }}>
                    <Box component="p" sx={{ ...BODY2_SX, color: '#1f1d25', whiteSpace: 'nowrap', m: 0, opacity: isDisabled ? 0.5 : 1 }}>{record.vehicleStatus}</Box>
                  </TableCell>

                  {/* DOL */}
                  <TableCell sx={{ px: '16px', ...w('dol'), border: 0 }}>
                    <Box component="p" sx={{ ...BODY2_SX, color: '#1f1d25', m: 0, opacity: isDisabled ? 0.5 : 1 }}>{record.dol}</Box>
                  </TableCell>

                  {/* Price to Market */}
                  <TableCell sx={{ px: '16px', ...w('priceToMarket'), border: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: isDisabled ? 0.5 : 1 }}>
                      <PriceToMarketChip value={record.priceToMarket} />
                    </Box>
                  </TableCell>

                  {/* Priority Score */}
                  <TableCell sx={{ px: '16px', ...w('priorityScore'), border: 0 }}>
                    <Box sx={{ opacity: isDisabled ? 0.5 : 1 }}>
                      <PriorityScoreChip score={record.priorityScore} />
                    </Box>
                  </TableCell>

                  {/* Sticky kebab overlay */}
                  <TableCell sx={{ position: 'sticky', right: 0, zIndex: 2, p: 0, width: 0, minWidth: 0, border: 0 }}>
                    <Box className="inv-kebab" sx={{
                      visibility: 'hidden',
                      position: 'absolute', right: 0, top: 0, bottom: 0,
                      display: 'flex', alignItems: 'center', pointerEvents: 'none',
                    }}>
                      <Box sx={{ height: '100%', width: 80, flexShrink: 0, background: `linear-gradient(to right, transparent, ${hoverBg})` }} />
                      <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', pr: '8px', bgcolor: hoverBg, flexShrink: 0, pointerEvents: 'auto' }}>
                        <Box component="button"
                          onClick={e => {
                            e.stopPropagation();
                            const rect = (e.currentTarget as HTMLButtonElement).getBoundingClientRect();
                            setOpenMenu({
                              recordId: record.id,
                              syndicationStatus: record.syndication,
                              aiGenerationStatus: record.aiGeneration,
                              aiConfigApplied: !!(record.aiConfigApplied || record.vehicleGroup),
                              anchor: { top: rect.bottom + 4, right: window.innerWidth - rect.right },
                            });
                          }}
                          sx={{
                            width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'rgba(17,16,20,0.56)', bgcolor: 'white', borderRadius: '200px',
                            border: 'none', cursor: 'pointer',
                            '&:hover': { bgcolor: 'rgba(255,255,255,0.92)' },
                            '&:active': { bgcolor: 'rgba(255,255,255,0.90)' },
                            transition: 'background-color 150ms',
                          }}
                        >
                          {openMenu?.recordId === record.id
                            ? <CloseIcon sx={{ fontSize: 16 }} />
                            : <MoreVertIcon sx={{ fontSize: 16 }} />}
                        </Box>
                      </Box>
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {openMenu && (
        <VehiclesMenu
          anchor={openMenu.anchor}
          syndicationStatus={openMenu.syndicationStatus}
          aiGenerationStatus={openMenu.aiGenerationStatus}
          aiConfigApplied={openMenu.aiConfigApplied}
          onAction={handleMenuAction}
          onClose={() => setOpenMenu(null)}
        />
      )}
    </>
  );
}
