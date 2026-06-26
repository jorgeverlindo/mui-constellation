import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CheckIcon from '@mui/icons-material/Check';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { ImageWithFallback } from '../figma/ImageWithFallback';

export interface PortalItem {
  id: string;
  title: string;
  type: string;
  dimensions: string;
  imageSrc: string;
}

interface PortalCardProps {
  item: PortalItem;
  selected: boolean;
  onSelect: () => void;
}

export function PortalCard({ item, selected, onSelect }: PortalCardProps) {
  return (
    <Box
      onClick={onSelect}
      sx={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper',
        borderRadius: '12px',
        border: '1.5px solid',
        borderColor: selected ? 'brand.accent' : 'transparent',
        boxShadow: selected ? '0 0 0 1px #473BAB' : 'none',
        cursor: 'pointer',
        overflow: 'hidden',
        transition: 'border-color 200ms, box-shadow 200ms',
        '&:hover': {
          borderColor: selected ? 'brand.accent' : 'divider',
          boxShadow: selected ? '0 0 0 1px #473BAB' : '0 1px 4px rgba(0,0,0,0.08)',
          '& .card-overlay': { opacity: 1 },
          '& .card-more': { opacity: 1 },
          '& .card-checkbox': { opacity: 1 },
        },
      }}
    >
      {/* Image */}
      <Box sx={{ aspectRatio: '1/1', position: 'relative', bgcolor: 'grey.100', overflow: 'hidden' }}>
        <ImageWithFallback
          src={item.imageSrc}
          alt={item.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <Box
          className="card-overlay"
          sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(0,0,0,0)', transition: 'background-color 200ms', opacity: 0, '&.card-overlay': { bgcolor: 'rgba(0,0,0,0.04)' } }}
        />

        {/* Checkbox */}
        <Box
          className="card-checkbox"
          onClick={(e) => { e.stopPropagation(); onSelect(); }}
          sx={{
            position: 'absolute', top: 10, left: 10, zIndex: 2,
            opacity: selected ? 1 : 0, transition: 'opacity 150ms',
          }}
        >
          <Box sx={{
            width: 20, height: 20, borderRadius: '4px', display: 'flex',
            alignItems: 'center', justifyContent: 'center', border: '1.5px solid',
            bgcolor: selected ? 'brand.accent' : 'rgba(255,255,255,0.85)',
            borderColor: selected ? 'brand.accent' : 'rgba(150,150,150,0.8)',
            transition: 'all 150ms',
          }}>
            {selected && <CheckIcon sx={{ fontSize: 13, color: '#fff', strokeWidth: 3 }} />}
          </Box>
        </Box>
      </Box>

      {/* Footer */}
      <Box sx={{ p: '10px 12px', display: 'flex', alignItems: 'flex-start', gap: 1 }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, color: 'text.primary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: '1.3', mb: '2px' }} title={item.title}>
            {item.title}
          </Typography>
          <Typography sx={{ fontSize: '0.6875rem', color: 'text.secondary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {item.type} | {item.dimensions}
          </Typography>
        </Box>
        <Box
          className="card-more"
          onClick={(e) => e.stopPropagation()}
          sx={{ opacity: 0, transition: 'opacity 150ms', color: 'text.disabled', '&:hover': { color: 'text.secondary' }, p: '2px', borderRadius: '50%', cursor: 'pointer' }}
        >
          <MoreVertIcon sx={{ fontSize: 18 }} />
        </Box>
      </Box>
    </Box>
  );
}
