import React, { useState } from 'react';
import {
  Box, Typography, Chip, IconButton,
  Menu, MenuItem, ListItemIcon, ListItemText,
  CircularProgress, Button,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import RateReviewOutlinedIcon from '@mui/icons-material/RateReviewOutlined';
import ArchiveOutlinedIcon from '@mui/icons-material/ArchiveOutlined';
import UnarchiveOutlinedIcon from '@mui/icons-material/UnarchiveOutlined';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { Asset } from '../../types/asset';
import { useArchivedStore } from '../../store/useArchivedStore';
import { ink, brand, surface as surfaceTokens, status as statusTokens } from '@jorgeverlindo/constellation-ux';

const PRIMARY        = brand.accent;
const PRIMARY_HOVER = brand.accentHover;
const SURFACE        = '#ffffff';
const SURFACE_MUTED  = surfaceTokens.canvas;
const TEXT_PRIMARY   = ink.primary;
const TEXT_SECONDARY = ink.secondary;
const RADIUS_CARD    = 12;
const RADIUS_CHIP    = 100;

export interface AssetCardProps {
  asset: Asset;
  selected?: boolean;
  onSelect?: (id: string, selected: boolean) => void;
  onCardClick?: (asset: Asset) => void;
}

export function AssetCard({ asset, selected = false, onSelect, onCardClick }: AssetCardProps) {
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [hovered,    setHovered]    = useState(false);
  const { archiveAsset, unarchiveAsset } = useArchivedStore();

  const isArchived  = Boolean(asset.archivedAt);
  const isAnalyzing = asset.aiStatus === 'analyzing';

  const openMenu  = (e: React.MouseEvent<HTMLElement>) => { e.stopPropagation(); setMenuAnchor(e.currentTarget); };
  const closeMenu = () => setMenuAnchor(null);

  const handleArchiveToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    closeMenu();
    if (isArchived) unarchiveAsset(asset.id);
    else archiveAsset(asset);
  };

  const handleCheckbox = (e: React.MouseEvent) => { e.stopPropagation(); onSelect?.(asset.id, !selected); };
  const handleCardClick = () => onCardClick?.(asset);
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onCardClick?.(asset); }
  };

  const visibleTags = asset.tags?.slice(0, 4) ?? [];
  const extraCount  = (asset.tags?.length ?? 0) - visibleTags.length;

  return (
    <Box
      role="button"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      sx={{
        bgcolor: SURFACE,
        borderRadius: `${RADIUS_CARD}px`,
        display: 'flex', flexDirection: 'column',
        transition: 'box-shadow 0.15s',
        boxShadow: hovered ? '0 4px 16px rgba(0,0,0,0.10)' : '0 1px 2px rgba(0,0,0,0.06)',
        cursor: 'pointer', outline: 'none',
      }}
    >
      {/* Thumbnail */}
      <Box sx={{ position: 'relative', bgcolor: SURFACE_MUTED, flexShrink: 0, borderRadius: `${RADIUS_CARD}px`, overflow: 'hidden' }}>
        <Box
          component="img"
          src={asset.url}
          alt={asset.name}
          sx={{ width: '100%', aspectRatio: '1 / 1', objectFit: 'cover', display: 'block', opacity: isAnalyzing ? 0.7 : 1, transition: 'opacity 0.3s' }}
        />

        {!isAnalyzing && (
          <Box
            onClick={handleCheckbox}
            sx={{
              position: 'absolute', top: 8, left: 8,
              width: 20, height: 20, borderRadius: '3px',
              bgcolor: SURFACE, display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', zIndex: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.18)',
            }}
          >
            {selected
              ? <CheckBoxIcon sx={{ fontSize: 20, color: PRIMARY }} />
              : <CheckBoxOutlineBlankIcon sx={{ fontSize: 24, color: 'rgba(0,0,0,0.28)' }} />}
          </Box>
        )}

        {isAnalyzing && (
          <Box sx={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            px: 1.5, py: 0.875, display: 'flex', alignItems: 'center', gap: 1,
            bgcolor: 'rgba(15,15,30,0.78)', backdropFilter: 'blur(6px)',
          }}>
            <CircularProgress size={11} sx={{ color: 'rgba(255,255,255,0.8)', flexShrink: 0 }} />
            <Typography sx={{ color: 'rgba(255,255,255,0.9)', fontSize: 11, fontWeight: 500 }}>
              Analyzing image…
            </Typography>
          </Box>
        )}

        {(hovered || selected) && (
          <Box sx={{
            position: 'absolute', inset: 0,
            border: `2px solid ${PRIMARY}`,
            borderRadius: `${RADIUS_CARD}px`,
            pointerEvents: 'none', zIndex: 4,
          }} />
        )}

        {hovered && !isAnalyzing && (
          <Box sx={{ position: 'absolute', bottom: 10, right: 10, zIndex: 5 }}>
            <Button
              variant="contained"
              size="small"
              startIcon={<VisibilityOutlinedIcon sx={{ fontSize: 16 }} />}
              onClick={(e) => { e.stopPropagation(); onCardClick?.(asset); }}
              sx={{
                textTransform: 'none', borderRadius: '100px',
                bgcolor: PRIMARY, fontSize: 13, fontWeight: 500,
                px: '14px', py: '6px',
                boxShadow: 'none', '&:hover': { bgcolor: PRIMARY_HOVER, boxShadow: 'none' },
              }}
            >
              Asset details
            </Button>
          </Box>
        )}
      </Box>

      {/* Card body */}
      <Box sx={{ px: 0, pt: 1, pb: 1.5, display: 'flex', flexDirection: 'column', gap: 0.5, flex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5 }}>
          <Typography sx={{
            flex: 1, fontSize: 12, fontWeight: 400,
            color: TEXT_PRIMARY, letterSpacing: '0.17px', lineHeight: 1.43,
            overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          }}>
            {asset.name}
          </Typography>
          <IconButton
            size="small"
            onClick={openMenu}
            aria-label="Asset options"
            sx={{
              flexShrink: 0, mt: -0.25, color: 'rgba(0,0,0,0.36)',
              opacity: hovered ? 1 : 0.6, transition: 'opacity 0.15s',
              '&:hover': { color: TEXT_PRIMARY, bgcolor: 'transparent' },
            }}
          >
            <MoreVertIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>

        {(asset.mimeType || asset.dimensions) && (
          <Typography sx={{ fontSize: 11, fontWeight: 400, color: TEXT_SECONDARY, letterSpacing: '0.40px' }}>
            {[asset.mimeType?.replace('image/', '').toUpperCase(), asset.dimensions].filter(Boolean).join(' | ')}
          </Typography>
        )}

        {visibleTags.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '4px', pt: '8px' }}>
            {visibleTags.map(tag => (
              <Chip key={tag} label={tag} size="small" sx={{
                height: 22, fontSize: 11, fontWeight: 400,
                letterSpacing: '0.16px', borderRadius: `${RADIUS_CHIP}px`,
                bgcolor: SURFACE_MUTED, color: TEXT_PRIMARY, border: 'none',
                '& .MuiChip-label': { px: '6px' },
              }} />
            ))}
            {extraCount > 0 && (
              <Chip label={`+${extraCount}`} size="small" sx={{
                height: 22, fontSize: 11, fontWeight: 400,
                letterSpacing: '0.16px', borderRadius: `${RADIUS_CHIP}px`,
                bgcolor: SURFACE_MUTED, color: TEXT_PRIMARY, border: 'none',
                '& .MuiChip-label': { px: '6px' },
              }} />
            )}
          </Box>
        )}
      </Box>

      {/* Context menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={closeMenu}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          sx: {
            minWidth: 180, borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.12)', py: 0.5,
            '& .MuiMenuItem-root': { px: 2, py: '10px', gap: '12px', fontSize: 14 },
          },
        }}
      >
        <MenuItem onClick={(e) => { e.stopPropagation(); closeMenu(); onCardClick?.(asset); }}>
          <ListItemIcon sx={{ minWidth: 0, color: 'rgba(17,16,20,0.56)' }}><RateReviewOutlinedIcon sx={{ fontSize: 20 }} /></ListItemIcon>
          <ListItemText primary="View details" primaryTypographyProps={{ fontSize: 14 }} />
        </MenuItem>
        <MenuItem onClick={handleArchiveToggle}>
          <ListItemIcon sx={{ minWidth: 0, color: 'rgba(17,16,20,0.56)' }}>
            {isArchived ? <UnarchiveOutlinedIcon sx={{ fontSize: 20 }} /> : <ArchiveOutlinedIcon sx={{ fontSize: 20 }} />}
          </ListItemIcon>
          <ListItemText primary={isArchived ? 'Unarchive' : 'Archive'} primaryTypographyProps={{ fontSize: 14 }} />
        </MenuItem>
      </Menu>
    </Box>
  );
}
