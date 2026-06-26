// ─── VehicleCardGrid ──────────────────────────────────────────────────────────
// MUI migration of source/inventory/VehicleCardGrid.tsx
// Vertical card grid — 5 cols, square image, hover animations, kebab overlay.
// Drop: framer-motion layoutId | Keep: all visual styles + hover interactions

import React, { useState, useCallback } from 'react';
import Box from '@mui/material/Box';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CloseIcon from '@mui/icons-material/Close';
import type { VinInventoryRecord, AIGenerationStatus, SyndicationStatus } from '../../../../../data/inventory/vehicleInventory';
import { SparkleIcon } from './chips';
import { VehiclesMenu, type VehiclesMenuAnchor, type VehiclesMenuAction } from './VehiclesMenu';

const BODY2_SX = { fontFamily: "'Roboto',sans-serif", fontWeight: 500, fontSize: 12, lineHeight: 1.43, letterSpacing: '0.17px' };
const CAPTION_SX = { fontFamily: "'Roboto',sans-serif", fontWeight: 400, fontSize: 11, lineHeight: 1.66, letterSpacing: '0.4px' };

const iconEye = 'https://res.cloudinary.com/dvq75cqna/image/upload/v1780071156/vw-funds/icons/Inventory_Table/Card___Row/eye-open__show__see__reveal__look__visible.svg';

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

function VerticalCard({
  record, isSelected, onToggle, onClick, onKebabClick, isMenuOpen,
}: {
  record: VinInventoryRecord;
  isSelected: boolean;
  onToggle: (c: boolean) => void;
  onClick: () => void;
  onKebabClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  isMenuOpen: boolean;
}) {
  const aiEnabled = record.aiGeneration === 'enabled';
  const imgSrc = record.aiConfigApplied && record.vehicleGroup?.angles?.['34l']
    ? record.vehicleGroup.angles['34l'] as string
    : record.thumbnail;
  const isCover = !!(record.aiConfigApplied && record.vehicleGroup?.angles?.['34l']);

  return (
    <Box
      onClick={onClick}
      sx={{
        display: 'flex', flexDirection: 'column', cursor: 'pointer', userSelect: 'none',
        '&:hover .card-checkbox': { opacity: 1 },
        '&:hover .card-kebab': { opacity: 1 },
        '&:hover .card-eye': { opacity: 1 },
        '&:hover .card-img': { transform: 'scale(1.05)' },
      }}
    >
      {/* Image block */}
      <Box sx={{
        position: 'relative', width: '100%', overflow: 'hidden',
        borderRadius: '12px', border: '1px solid',
        borderColor: isSelected ? '#473bab' : '#e7e7e9',
        bgcolor: '#f0f2f4', flexShrink: 0,
        aspectRatio: '1 / 1',
        transition: 'border-color 150ms',
        '&:hover': { borderColor: '#473bab' },
        opacity: aiEnabled ? 1 : 0.6,
      }}>
        {imgSrc ? (
          <Box component="img"
            className="card-img"
            src={imgSrc}
            alt={`${record.make} ${record.model}`}
            sx={{
              width: '100%', height: '100%',
              objectFit: isCover ? 'cover' : 'contain',
              transition: 'transform 500ms ease',
            }}
          />
        ) : (
          <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(17,16,20,0.2)' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
            </svg>
          </Box>
        )}

        {/* Checkbox — visible on hover or when selected */}
        <Box
          className="card-checkbox"
          onClick={e => { e.stopPropagation(); onToggle(!isSelected); }}
          sx={{ position: 'absolute', top: 8, left: 8, zIndex: 10, opacity: isSelected ? 1 : 0, transition: 'opacity 200ms' }}
        >
          <Box sx={{
            width: 20, height: 20, borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '2px solid',
            bgcolor: isSelected ? '#473bab' : 'rgba(255,255,255,0.8)',
            borderColor: isSelected ? '#473bab' : 'white',
            transition: 'all 150ms',
          }}>
            {isSelected && (
              <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </Box>
        </Box>

        {/* Disabled badge */}
        {!aiEnabled && (
          <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 10, display: 'flex', alignItems: 'center', bgcolor: 'rgba(0,0,0,0.54)', backdropFilter: 'blur(4px)', borderRadius: '100px', px: '8px', height: 20 }}>
            <Box component="span" sx={{ color: 'white', fontFamily: "'Roboto'", fontWeight: 500, fontSize: 10 }}>Disabled</Box>
          </Box>
        )}

        {/* AI sparkle badge — bottom-left */}
        {aiEnabled && (
          <Box sx={{ position: 'absolute', bottom: 8, left: 8, zIndex: 10, width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'rgba(255,255,255,0.9)', borderRadius: '100px', boxShadow: '0px 0.8px 4px rgba(0,0,0,0.12), 0px 1.6px 1.6px rgba(0,0,0,0.14)' }}>
            <SparkleIcon />
          </Box>
        )}

        {/* Asset Details eye — bottom-right, on hover */}
        <Box
          className="card-eye"
          component="button"
          onClick={e => { e.stopPropagation(); onClick(); }}
          sx={{
            position: 'absolute', bottom: 9, right: 9, zIndex: 10,
            width: 30, height: 30, borderRadius: '100px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            bgcolor: '#473bab', border: 'none', cursor: 'pointer',
            opacity: 0, transition: 'opacity 150ms',
          }}
          title="Asset Details"
        >
          <Box component="img" src={iconEye} alt="Asset Details" sx={{ width: 16, height: 16, filter: 'brightness(0) invert(1)' }} />
        </Box>
      </Box>

      {/* Footer */}
      <Box sx={{ pt: '8px', pb: '12px' }}>
        <Box component="p" sx={{ ...BODY2_SX, color: '#1f1d25', m: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {record.vin}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '4px', mt: '2px' }}>
          <Box component="p" sx={{ ...CAPTION_SX, color: '#686576', flex: 1, minWidth: 0, lineHeight: 1.5, m: 0 }}>
            {record.condition} · {record.year} · {record.make} · {record.model} · {record.trim} · {record.exteriorColor}
          </Box>
          <Box
            className="card-kebab"
            component="button"
            onClick={onKebabClick}
            sx={{
              flexShrink: 0, p: '3px', borderRadius: '100px',
              '&:hover': { bgcolor: 'rgba(17,16,20,0.08)' },
              color: 'rgba(17,16,20,0.38)', border: 'none', bgcolor: 'transparent',
              cursor: 'pointer', opacity: 0, transition: 'opacity 150ms', mt: '1px',
            }}
          >
            {isMenuOpen ? <CloseIcon sx={{ fontSize: 13 }} /> : <MoreVertIcon sx={{ fontSize: 13 }} />}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export function VehicleCardGrid({
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
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', columnGap: '12px', rowGap: '20px' }}>
          {records.map(record => (
            <VerticalCard
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
