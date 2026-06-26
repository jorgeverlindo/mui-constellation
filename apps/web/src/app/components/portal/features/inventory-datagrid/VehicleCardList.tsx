// ─── VehicleCardList ──────────────────────────────────────────────────────────
// MUI migration of source/inventory/VehicleCardList.tsx
// Horizontal cards — auto-fill 320px grid, thumbnail left, info right.
// Drop: framer-motion layoutId | Keep: all visual styles + shadow hover

import React, { useState, useCallback } from 'react';
import Box from '@mui/material/Box';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CloseIcon from '@mui/icons-material/Close';
import type { VinInventoryRecord, AIGenerationStatus, SyndicationStatus } from '../../../../../data/inventory/vehicleInventory';
import { PriceToMarketChip, PriorityScoreChip, SparkleIcon } from './chips';
import { VehiclesMenu, type VehiclesMenuAnchor, type VehiclesMenuAction } from './VehiclesMenu';

const BODY2_SX  = { fontFamily: "'Roboto',sans-serif", fontWeight: 500, fontSize: 13, lineHeight: 1.43, letterSpacing: '0.17px' };
const BODY1_SX  = { fontFamily: "'Roboto',sans-serif", fontWeight: 400, fontSize: 13, lineHeight: 1.43, letterSpacing: '0.17px' };
const CAPTION_SX = { fontFamily: "'Roboto',sans-serif", fontWeight: 400, fontSize: 11, lineHeight: 1.66, letterSpacing: '0.4px' };

interface Props {
  records: VinInventoryRecord[];
  selected: Set<string>;
  onToggleRow: (id: string, checked: boolean) => void;
  onVinClick: (id: string) => void;
  onSyndicationToggle?: (id: string) => void;
  onAiGenerationToggle?: (id: string) => void;
  onViewSourceImages?: (id: string) => void;
  onAttachComment?: (id: string) => void;
}

function HorizontalCard({
  record, isSelected, onToggle, onClick, onKebabClick, isMenuOpen,
}: {
  record: VinInventoryRecord;
  isSelected: boolean;
  onToggle: (c: boolean) => void;
  onClick: () => void;
  onKebabClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  isMenuOpen: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const aiEnabled = record.aiGeneration === 'enabled';
  const imgSrc = record.aiConfigApplied && record.vehicleGroup?.angles?.['34l']
    ? record.vehicleGroup.angles['34l'] as string
    : record.thumbnail;
  const isCover = !!(record.aiConfigApplied && record.vehicleGroup?.angles?.['34l']);

  return (
    <Box
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      sx={{
        display: 'flex', borderRadius: '12px', border: '1px solid',
        borderColor: isSelected ? '#473bab' : 'rgba(0,0,0,0.10)',
        bgcolor: 'white', overflow: 'hidden', cursor: 'pointer', userSelect: 'none',
        boxShadow: hovered
          ? '0px 4px 14px 0px rgba(0,0,0,0.12)'
          : '0px 1px 3px 0px rgba(0,0,0,0.08)',
        transition: 'box-shadow 150ms, border-color 150ms',
      }}
    >
      {/* Left: thumbnail */}
      <Box sx={{ position: 'relative', flexShrink: 0, bgcolor: '#f0f2f4', width: 160, minHeight: 120 }}>
        {imgSrc ? (
          <Box component="img" src={imgSrc} alt={`${record.make} ${record.model}`}
            sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: isCover ? 'cover' : 'contain' }} />
        ) : (
          <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(17,16,20,0.2)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
            </svg>
          </Box>
        )}

        {/* Checkbox */}
        <Box
          onClick={e => { e.stopPropagation(); onToggle(!isSelected); }}
          sx={{ position: 'absolute', top: 8, left: 8, zIndex: 10 }}
        >
          <input type="checkbox" checked={isSelected} onChange={e => onToggle(e.target.checked)}
            style={{ width: 16, height: 16, borderRadius: 4, accentColor: '#473bab', cursor: 'pointer' }} />
        </Box>

        {/* Disabled badge */}
        {!aiEnabled && (
          <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 10, display: 'flex', alignItems: 'center', bgcolor: 'rgba(0,0,0,0.54)', backdropFilter: 'blur(4px)', borderRadius: '100px', px: '8px', height: 20 }}>
            <Box component="span" sx={{ color: 'white', fontFamily: "'Roboto'", fontWeight: 500, fontSize: 10 }}>Disabled</Box>
          </Box>
        )}

        {/* AI sparkle badge — bottom-right */}
        {aiEnabled && (
          <Box sx={{ position: 'absolute', bottom: 8, right: 8, zIndex: 10, width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'rgba(255,255,255,0.9)', borderRadius: '100px', boxShadow: '0px 0.8px 4px rgba(0,0,0,0.12), 0px 1.6px 1.6px rgba(0,0,0,0.14)' }}>
            <SparkleIcon />
          </Box>
        )}

        {/* Asset Details hover overlay */}
        <Box sx={{
          position: 'absolute', inset: 0, display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-start',
          p: '8px', background: 'linear-gradient(to top, rgba(0,0,0,0.40), transparent)',
          opacity: hovered ? 1 : 0, transition: 'opacity 150ms',
        }}>
          <Box
            component="button"
            onClick={e => { e.stopPropagation(); onClick(); }}
            sx={{
              display: 'flex', alignItems: 'center', gap: '5px',
              bgcolor: 'rgba(255,255,255,0.9)', '&:hover': { bgcolor: 'white' },
              color: '#473bab', px: '8px', height: 26, borderRadius: '100px',
              fontFamily: "'Roboto'", fontWeight: 500, fontSize: 11,
              border: 'none', cursor: 'pointer', flexShrink: 0,
              boxShadow: '0 1px 3px rgba(0,0,0,0.12)', transition: 'background-color 150ms',
            }}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3"/>
              <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
            </svg>
            Asset Details
          </Box>
        </Box>
      </Box>

      {/* Right: info */}
      <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', p: '12px', gap: '6px' }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '6px' }}>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Box component="p"
              sx={{ ...BODY2_SX, color: '#473bab', m: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', '&:hover': { textDecoration: 'underline' } }}
              onClick={e => { e.stopPropagation(); onClick(); }}>
              {record.vin}
            </Box>
            <Box component="p" sx={{ ...CAPTION_SX, color: 'rgba(17,16,20,0.56)', m: 0, mt: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {record.condition} | {record.year} {record.make} {record.model}
            </Box>
          </Box>
          <Box component="button" onClick={onKebabClick}
            sx={{ flexShrink: 0, p: '2px', borderRadius: '100px', '&:hover': { bgcolor: 'rgba(17,16,20,0.08)' }, color: 'rgba(17,16,20,0.38)', border: 'none', bgcolor: 'transparent', cursor: 'pointer', transition: 'background-color 150ms' }}>
            {isMenuOpen ? <CloseIcon sx={{ fontSize: 14 }} /> : <MoreVertIcon sx={{ fontSize: 14 }} />}
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <Box component="span" sx={{ ...BODY1_SX, color: '#1f1d25', flexShrink: 0 }}>
            ${record.price.toLocaleString()}
          </Box>
          <Box component="span" sx={{ color: 'rgba(0,0,0,0.2)', flexShrink: 0 }}>·</Box>
          <PriceToMarketChip value={record.priceToMarket} />
          <PriorityScoreChip score={record.priorityScore} />
        </Box>
      </Box>
    </Box>
  );
}

export function VehicleCardList({
  records, selected, onToggleRow, onVinClick,
  onSyndicationToggle, onAiGenerationToggle, onViewSourceImages, onAttachComment,
}: Props) {
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

  return (
    <>
      <Box sx={{ flex: 1, overflowY: 'auto', minHeight: 0, p: '16px' }}>
        <Box sx={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
          {records.map(record => (
            <HorizontalCard
              key={record.id}
              record={record}
              isSelected={selected.has(record.id)}
              onToggle={checked => onToggleRow(record.id, checked)}
              onClick={() => onVinClick(record.id)}
              isMenuOpen={openMenu?.recordId === record.id}
              onKebabClick={e => {
                e.stopPropagation();
                const rect = e.currentTarget.getBoundingClientRect();
                setOpenMenu(prev => prev?.recordId === record.id ? null : {
                  recordId: record.id,
                  syndicationStatus: record.syndication,
                  aiGenerationStatus: record.aiGeneration,
                  anchor: { top: rect.bottom + 8, right: window.innerWidth - rect.right },
                });
              }}
            />
          ))}
        </Box>
      </Box>

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
