// ─── VehicleTableCondensed ────────────────────────────────────────────────────
// MUI migration of source/inventory/VehicleTableCondensed.tsx
// Table Small — 52px rows, 38px thumbnail, stagger entrance, drag-resize headers.

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
import { AIGenerationChip, SyndicationChip, PriceToMarketChip, PriorityScoreChip } from './chips';
import { VehiclesMenu, type VehiclesMenuAnchor, type VehiclesMenuAction } from './VehiclesMenu';
import { HeaderDivider, ArrowDownIcon, type ColWidths } from './VehicleInventoryGrid';

const HEADER_SX = { fontFamily: "'Roboto',sans-serif", fontWeight: 500, fontSize: 14, lineHeight: '24px', letterSpacing: '0.17px', color: '#1f1d25', whiteSpace: 'nowrap' as const };
const CELL_SX   = { fontFamily: "'Roboto',sans-serif", fontWeight: 400, fontSize: 12, lineHeight: 1.43, letterSpacing: '0.17px', color: '#1f1d25' };
const VIN_SX    = { fontFamily: "'Roboto',sans-serif", fontWeight: 400, fontSize: 12, lineHeight: 1.43, letterSpacing: '0.17px', color: '#473bab', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } };

const ROW_H = 52;
const THUMB = 38;

// ─── Condensed-table column defaults (thumbnail 38px, tighter widths) ─────────
const DEFAULT_WIDTHS: ColWidths = {
  expand: 24, checkbox: 42, thumbnail: THUMB, vin: 190, condition: 90,
  year: 80, make: 100, model: 110, trim: 80, price: 100,
  aiGeneration: 140, syndication: 136, exteriorColor: 144,
  vehicleStatus: 130, dol: 80, priceToMarket: 170, priorityScore: 130,
};

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
  records: VinInventoryRecord[];
  selected: Set<string>;
  onToggleRow: (id: string, checked: boolean) => void;
  onToggleAll: (checked: boolean) => void;
  onVinClick: (id: string) => void;
  onSyndicationToggle?: (id: string) => void;
  onAiGenerationToggle?: (id: string) => void;
  onViewSourceImages?: (id: string) => void;
  onAttachComment?: (id: string) => void;
}

export function VehicleTableCondensed({
  records, selected, onToggleRow, onToggleAll, onVinClick,
  onSyndicationToggle, onAiGenerationToggle, onViewSourceImages, onAttachComment,
}: Props) {
  const allSelected  = records.length > 0 && records.every(r => selected.has(r.id));
  const someSelected = !allSelected && records.some(r => selected.has(r.id));

  const [widths, setWidths] = useState<ColWidths>(DEFAULT_WIDTHS);
  const setW = (key: keyof ColWidths) => (val: number) => setWidths(prev => ({ ...prev, [key]: val }));
  const w    = (key: keyof ColWidths) => ({ width: widths[key], minWidth: widths[key] });

  const [openMenu, setOpenMenu] = useState<{
    recordId: string; anchor: VehiclesMenuAnchor;
    syndicationStatus: SyndicationStatus; aiGenerationStatus: AIGenerationStatus;
  } | null>(null);

  const handleMenuAction = useCallback((action: VehiclesMenuAction) => {
    if (!openMenu) return;
    const { recordId } = openMenu;
    if (action === 'vinDetails')       onVinClick(recordId);
    if (action === 'syndicate')        onSyndicationToggle?.(recordId);
    if (action === 'disableAiImage')   onAiGenerationToggle?.(recordId);
    if (action === 'viewSourceImages') onViewSourceImages?.(recordId);
    if (action === 'attachComment')    onAttachComment?.(recordId);
    setOpenMenu(null);
  }, [openMenu, onVinClick, onSyndicationToggle, onAiGenerationToggle, onViewSourceImages, onAttachComment]);

  const checkboxRef = useCallback((el: HTMLInputElement | null) => {
    if (el) el.indeterminate = someSelected;
  }, [someSelected]);

  // Header cell with drag-resize divider
  const Th = ({ label, colKey, prevKey }: { label: string; colKey: keyof ColWidths; prevKey: keyof ColWidths }) => (
    <TableCell sx={{ p: 0, textAlign: 'left', height: ROW_H, position: 'relative', overflow: 'visible', border: 0, ...w(colKey) }}>
      <HeaderDivider prevWidth={widths[prevKey]} onPrevWidthChange={setW(prevKey)} />
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px', pl: '8px', pr: '12px', height: '100%' }}>
        <Box component="span" sx={HEADER_SX}>{label}</Box>
        <ArrowDownIcon size={14} />
      </Box>
    </TableCell>
  );

  return (
    <>
      <TableContainer sx={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
        <Table sx={{ borderCollapse: 'collapse', tableLayout: 'fixed', width: 'max-content', minWidth: '100%' }}>

          {/* Sticky header */}
          <TableHead sx={{ position: 'sticky', top: 0, zIndex: 10, bgcolor: 'white' }}>
            <TableRow sx={{ height: ROW_H, borderBottom: '1px solid rgba(0,0,0,0.12)' }}>
              {/* Expand */}
              <TableCell sx={{ ...w('expand'), border: 0 }} />
              {/* Checkbox */}
              <TableCell sx={{ ...w('checkbox'), px: '1px', border: 0 }}>
                <Box sx={{ p: '9px' }}>
                  <input type="checkbox" ref={checkboxRef} checked={allSelected} onChange={e => onToggleAll(e.target.checked)}
                    style={{ width: 14, height: 14, accentColor: '#473bab', cursor: 'pointer' }} />
                </Box>
              </TableCell>
              {/* Thumbnail — invisible spacer */}
              <TableCell sx={{ ...w('thumbnail'), opacity: 0, border: 0 }} />
              {/* VIN */}
              <Th label="VIN" colKey="vin" prevKey="thumbnail" />
              {/* Condition */}
              <Th label="Condition" colKey="condition" prevKey="vin" />
              {/* Extra columns */}
              <Th label="Year"           colKey="year"          prevKey="condition"    />
              <Th label="Make"           colKey="make"          prevKey="year"         />
              <Th label="Model"          colKey="model"         prevKey="make"         />
              <Th label="Trim"           colKey="trim"          prevKey="model"        />
              <Th label="Price"          colKey="price"         prevKey="trim"         />
              <Th label="AI Generation" colKey="aiGeneration"  prevKey="price"        />
              <Th label="Syndication"    colKey="syndication"   prevKey="aiGeneration" />
              <Th label="Ext. Color"     colKey="exteriorColor" prevKey="syndication"  />
              <Th label="Status"         colKey="vehicleStatus" prevKey="exteriorColor"/>
              <Th label="DOL"            colKey="dol"           prevKey="vehicleStatus"/>
              <Th label="Price/Market"   colKey="priceToMarket" prevKey="dol"          />
              <Th label="Priority"       colKey="priorityScore" prevKey="priceToMarket"/>
              {/* Sticky kebab spacer */}
              <TableCell sx={{ position: 'sticky', right: 0, zIndex: 11, bgcolor: 'white', p: 0, width: 0, minWidth: 0, border: 0 }} />
            </TableRow>
          </TableHead>

          {/* Body — rows with stagger entrance */}
          <TableBody>
            {records.map((record, index) => {
              const isSelected = selected.has(record.id);
              const isDisabled = record.aiGeneration === 'disabled';
              const hoverBg = isSelected ? 'rgba(99,86,225,0.12)' : isDisabled ? 'rgba(31,29,37,0.06)' : 'rgba(31,29,37,0.04)';
              const rowBg   = isDisabled && !isSelected ? 'rgba(31,29,37,0.04)' : isSelected ? 'rgba(99,86,225,0.08)' : 'white';
              const opacity = isDisabled ? 0.5 : 1;

              return (
                <TableRow
                  key={record.id}
                  onClick={() => onVinClick(record.id)}
                  sx={{
                    height: ROW_H, bgcolor: rowBg,
                    borderBottom: '1px solid rgba(0,0,0,0.12)',
                    cursor: 'pointer',
                    transition: 'background-color 150ms ease-in-out',
                    '&:hover': { bgcolor: hoverBg },
                    '&:hover .inv-kebab-sm': { visibility: 'visible' },
                    '@keyframes fadeInRow': { from: { opacity: 0 }, to: { opacity: 1 } },
                    animation: 'fadeInRow 120ms ease-out forwards',
                    animationDelay: `${Math.min(index * 8, 250)}ms`,
                    opacity: 0,
                  }}
                >
                  <TableCell sx={{ ...w('expand'), border: 0 }} />

                  {/* Checkbox */}
                  <TableCell sx={{ ...w('checkbox'), px: '1px', border: 0 }} onClick={e => e.stopPropagation()}>
                    <Box sx={{ p: '9px' }}>
                      <input type="checkbox" checked={isSelected} onChange={e => onToggleRow(record.id, e.target.checked)}
                        style={{ width: 14, height: 14, accentColor: '#473bab', cursor: 'pointer' }} />
                    </Box>
                  </TableCell>

                  {/* Thumbnail */}
                  <TableCell sx={{ ...w('thumbnail'), p: 0, border: 0 }}>
                    <Box sx={{ width: THUMB, height: THUMB, overflow: 'hidden', bgcolor: '#f0f2f4', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity }}>
                      {record.thumbnail ? (
                        <Box component="img"
                          src={record.aiConfigApplied && record.vehicleGroup?.angles?.['34l'] ? record.vehicleGroup.angles['34l'] as string : record.thumbnail}
                          alt={`${record.make} ${record.model}`}
                          sx={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        />
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="rgba(17,16,20,0.2)">
                          <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                        </svg>
                      )}
                    </Box>
                  </TableCell>

                  {/* VIN */}
                  <TableCell sx={{ px: '8px', ...w('vin'), border: 0 }}>
                    <Box component="button" onClick={e => { e.stopPropagation(); onVinClick(record.id); }}
                      sx={{ ...VIN_SX, bgcolor: 'transparent', border: 'none', p: 0, textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%', display: 'block', opacity }}>
                      {record.vin}
                    </Box>
                  </TableCell>

                  {/* Condition */}
                  <TableCell sx={{ px: '8px', ...w('condition'), border: 0 }}>
                    <Box component="span" sx={{ ...CELL_SX, whiteSpace: 'nowrap', opacity }}>{record.condition}</Box>
                  </TableCell>

                  {/* Year */}
                  <TableCell sx={{ px: '8px', ...w('year'), border: 0 }}>
                    <Box component="span" sx={{ ...CELL_SX, opacity }}>{record.year}</Box>
                  </TableCell>
                  {/* Make */}
                  <TableCell sx={{ px: '8px', ...w('make'), border: 0 }}>
                    <Box component="span" sx={{ ...CELL_SX, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', opacity }}>{record.make}</Box>
                  </TableCell>
                  {/* Model */}
                  <TableCell sx={{ px: '8px', ...w('model'), border: 0 }}>
                    <Box component="span" sx={{ ...CELL_SX, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', opacity }}>{record.model}</Box>
                  </TableCell>
                  {/* Trim */}
                  <TableCell sx={{ px: '8px', ...w('trim'), border: 0 }}>
                    <Box component="span" sx={{ ...CELL_SX, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', opacity }}>{record.trim}</Box>
                  </TableCell>
                  {/* Price */}
                  <TableCell sx={{ px: '8px', ...w('price'), border: 0 }}>
                    <Box component="span" sx={{ ...CELL_SX, whiteSpace: 'nowrap', opacity }}>${record.price.toLocaleString()}</Box>
                  </TableCell>
                  {/* AI Generation */}
                  <TableCell sx={{ px: '8px', ...w('aiGeneration'), border: 0 }}>
                    <AIGenerationChip status={record.aiGeneration} />
                  </TableCell>
                  {/* Syndication */}
                  <TableCell sx={{ px: '8px', ...w('syndication'), border: 0 }}>
                    <SyndicationChip status={record.syndication} />
                  </TableCell>
                  {/* Exterior Color */}
                  <TableCell sx={{ px: '8px', ...w('exteriorColor'), border: 0 }}>
                    <Box component="span" sx={{ ...CELL_SX, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', opacity }}>{record.exteriorColor}</Box>
                  </TableCell>
                  {/* Vehicle Status */}
                  <TableCell sx={{ px: '8px', ...w('vehicleStatus'), border: 0 }}>
                    <Box component="span" sx={{ ...CELL_SX, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', opacity }}>{record.vehicleStatus}</Box>
                  </TableCell>
                  {/* DOL */}
                  <TableCell sx={{ px: '8px', ...w('dol'), border: 0 }}>
                    <Box component="span" sx={{ ...CELL_SX, opacity }}>{record.dol}</Box>
                  </TableCell>
                  {/* Price to Market */}
                  <TableCell sx={{ px: '8px', ...w('priceToMarket'), border: 0 }}>
                    <Box sx={{ opacity }}><PriceToMarketChip value={record.priceToMarket} /></Box>
                  </TableCell>
                  {/* Priority Score */}
                  <TableCell sx={{ px: '8px', ...w('priorityScore'), border: 0 }}>
                    <Box sx={{ opacity }}><PriorityScoreChip score={record.priorityScore} /></Box>
                  </TableCell>

                  {/* Sticky kebab overlay */}
                  <TableCell sx={{ position: 'sticky', right: 0, zIndex: 2, p: 0, width: 0, minWidth: 0, border: 0 }}>
                    <Box className="inv-kebab-sm" sx={{
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
                            setOpenMenu(prev => prev?.recordId === record.id ? null : {
                              recordId: record.id,
                              syndicationStatus: record.syndication,
                              aiGenerationStatus: record.aiGeneration,
                              anchor: { top: rect.bottom + 8, right: window.innerWidth - rect.right },
                            });
                          }}
                          sx={{
                            width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'rgba(17,16,20,0.56)', bgcolor: 'white', borderRadius: '200px',
                            border: 'none', cursor: 'pointer',
                            '&:hover': { bgcolor: 'rgba(255,255,255,0.92)' },
                            transition: 'background-color 150ms',
                          }}
                        >
                          {openMenu?.recordId === record.id ? <CloseIcon sx={{ fontSize: 16 }} /> : <MoreVertIcon sx={{ fontSize: 16 }} />}
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
          onAction={handleMenuAction}
          onClose={() => setOpenMenu(null)}
        />
      )}
    </>
  );
}
