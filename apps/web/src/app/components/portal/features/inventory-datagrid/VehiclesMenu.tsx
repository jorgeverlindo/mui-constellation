// ─── VehiclesMenu ─────────────────────────────────────────────────────────────
// MUI migration of source/inventory/VehiclesMenu.tsx
// createPortal + CSS keyframe → MUI Menu (auto-portal) + @keyframes on Paper sx

import React, { useEffect, useRef } from 'react';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import type { SyndicationStatus, AIGenerationStatus } from '../../../../../data/inventory/vehicleInventory';

const iconSignal  = 'https://res.cloudinary.com/dvq75cqna/image/upload/v1780071160/vw-funds/icons/Inventory_Table/Card___Row/live-full__signal.svg';
const iconCar     = 'https://res.cloudinary.com/dvq75cqna/image/upload/v1780071152/vw-funds/icons/Inventory_Table/Card___Row/car.svg';
const iconPlus    = 'https://res.cloudinary.com/dvq75cqna/image/upload/v1780071162/vw-funds/icons/Inventory_Table/Card___Row/plus-large__add_large.svg';
const iconPhotos  = 'https://res.cloudinary.com/dvq75cqna/image/upload/v1780071158/vw-funds/icons/Inventory_Table/Card___Row/images-2__photos__pictures__shot.svg';
const iconEye     = 'https://res.cloudinary.com/dvq75cqna/image/upload/v1780071156/vw-funds/icons/Inventory_Table/Card___Row/eye-open__show__see__reveal__look__visible.svg';
const iconPower   = 'https://res.cloudinary.com/dvq75cqna/image/upload/v1780071154/vw-funds/icons/Inventory_Table/Card___Row/esc__power.svg';
const iconTrash   = 'https://res.cloudinary.com/dvq75cqna/image/upload/v1780074746/vw-funds/icons/Inventory_Table/Card___Row/trash.svg';

export type VehiclesMenuAction =
  | 'syndicate' | 'vinDetails' | 'newAiConfig'
  | 'viewSourceImages' | 'goToVdp' | 'disableAiImage'
  | 'removeAiConfig' | 'attachComment';

export interface VehiclesMenuAnchor {
  top: number;
  right: number; // distance from right edge of viewport
}

interface VehiclesMenuProps {
  anchor: VehiclesMenuAnchor;
  syndicationStatus: SyndicationStatus;
  aiGenerationStatus: AIGenerationStatus;
  aiConfigApplied?: boolean;
  onAction: (action: VehiclesMenuAction) => void;
  onClose: () => void;
}

export function VehiclesMenu({
  anchor, syndicationStatus, aiGenerationStatus,
  aiConfigApplied = false, onAction, onClose,
}: VehiclesMenuProps) {
  // MUI Menu needs an anchor element — use a virtual anchor via anchorPosition
  const handle = (action: VehiclesMenuAction) => () => { onAction(action); onClose(); };

  const ITEM_SX = {
    height: 36, pl: 0, pr: 2,
    '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' },
    '&:active': { bgcolor: 'rgba(0,0,0,0.08)' },
  };
  const ICON_SX = { width: 36, minWidth: 36, justifyContent: 'center' };
  const TEXT_SX = { fontSize: 14, fontFamily: "'Roboto', sans-serif", fontWeight: 400, lineHeight: '21px', color: '#1f1d25' };

  return (
    <Menu
      open
      onClose={onClose}
      anchorReference="anchorPosition"
      anchorPosition={{ top: anchor.top, left: window.innerWidth - anchor.right }}
      transformOrigin={{ horizontal: 'right', vertical: 'top' }}
      PaperProps={{
        sx: {
          width: 220,
          borderRadius: '4px',
          boxShadow: '0 5px 5px -3px rgba(0,0,0,0.20), 0 8px 10px 1px rgba(0,0,0,0.14), 0 3px 14px 2px rgba(0,0,0,0.12)',
          '@keyframes vehiclesMenuIn': {
            from: { opacity: 0, transform: 'translateY(-8px)' },
            to:   { opacity: 1, transform: 'translateY(0px)' },
          },
          animation: 'vehiclesMenuIn 450ms ease-out forwards',
          py: 1,
          overflow: 'auto',
          maxHeight: 'calc(100vh - 16px)',
        },
      }}
    >
      <MenuItem onClick={handle('syndicate')} sx={ITEM_SX}>
        <ListItemIcon sx={ICON_SX}><img src={iconSignal} width={18} height={18} draggable={false} /></ListItemIcon>
        <ListItemText primaryTypographyProps={{ sx: TEXT_SX }}>
          {syndicationStatus === 'syndicated' ? 'Turn Syndicate Off' : 'Syndicate'}
        </ListItemText>
      </MenuItem>

      <MenuItem onClick={handle('vinDetails')} sx={ITEM_SX}>
        <ListItemIcon sx={ICON_SX}><img src={iconCar} width={18} height={18} draggable={false} /></ListItemIcon>
        <ListItemText primaryTypographyProps={{ sx: TEXT_SX }}>VIN Details</ListItemText>
      </MenuItem>

      <MenuItem onClick={handle('newAiConfig')} sx={ITEM_SX}>
        <ListItemIcon sx={ICON_SX}><img src={iconPlus} width={18} height={18} draggable={false} /></ListItemIcon>
        <ListItemText primaryTypographyProps={{ sx: TEXT_SX }}>New AI Config</ListItemText>
      </MenuItem>

      <Divider sx={{ my: 1 }} />

      <MenuItem onClick={handle('viewSourceImages')} sx={ITEM_SX}>
        <ListItemIcon sx={ICON_SX}><img src={iconPhotos} width={18} height={18} draggable={false} /></ListItemIcon>
        <ListItemText primaryTypographyProps={{ sx: TEXT_SX }}>View Source Images</ListItemText>
      </MenuItem>

      <MenuItem onClick={handle('goToVdp')} sx={ITEM_SX}>
        <ListItemIcon sx={ICON_SX}><img src={iconEye} width={18} height={18} draggable={false} /></ListItemIcon>
        <ListItemText primaryTypographyProps={{ sx: TEXT_SX }}>Go to VDP</ListItemText>
      </MenuItem>

      <MenuItem onClick={handle('disableAiImage')} sx={ITEM_SX}>
        <ListItemIcon sx={ICON_SX}><img src={iconPower} width={18} height={18} draggable={false} /></ListItemIcon>
        <ListItemText primaryTypographyProps={{ sx: TEXT_SX }}>
          {aiGenerationStatus === 'enabled' ? 'Disable AI Image' : 'Enable AI Image'}
        </ListItemText>
      </MenuItem>

      {aiConfigApplied && (
        <MenuItem onClick={handle('removeAiConfig')} sx={ITEM_SX}>
          <ListItemIcon sx={ICON_SX}><img src={iconTrash} width={18} height={18} draggable={false} /></ListItemIcon>
          <ListItemText primaryTypographyProps={{ sx: TEXT_SX }}>Remove AI Config</ListItemText>
        </MenuItem>
      )}

      <Divider sx={{ my: 1 }} />

      <MenuItem onClick={handle('attachComment')} sx={ITEM_SX}>
        <ListItemIcon sx={ICON_SX}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="rgba(17,16,20,0.56)">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
          </svg>
        </ListItemIcon>
        <ListItemText primaryTypographyProps={{ sx: TEXT_SX }}>Attach as a comment</ListItemText>
      </MenuItem>
    </Menu>
  );
}
