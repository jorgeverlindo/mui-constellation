import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import GridViewIcon from '@mui/icons-material/GridView';
import { ProjectsHeader } from './ProjectsHeader';
import { ProjectsPreApprovalDrawer } from './ProjectsPreApprovalDrawer';

interface PortalItem {
  id: string;
  title: string;
  type: string;
  dimensions: string;
  imageSrc: string;
}

const imgCardImage = 'https://res.cloudinary.com/dvq75cqna/image/upload/v1780071075/vw-funds/5b760d55d2388a38009c20fbc7474decb0d7b3fe.jpg';
const imgCardImage1 = 'https://res.cloudinary.com/dvq75cqna/image/upload/v1780071143/vw-funds/f925b175d9f45ba629bdedc9c27563c3216090ba.jpg';
const imgCardImage2 = 'https://res.cloudinary.com/dvq75cqna/image/upload/v1780071132/vw-funds/dcd4a062f63eda60d1f2ae0b47f935693f998f44.jpg';
const imgCardImage3 = 'https://res.cloudinary.com/dvq75cqna/image/upload/v1780071082/vw-funds/5eea4d176adc209f09fc2413a05a7c2e774e3435.png';
const imgCardImage4 = 'https://res.cloudinary.com/dvq75cqna/image/upload/v1780071094/vw-funds/96b55a391e69153cce3364990bde189c536e6e6a.png';
const imgCardImage5 = 'https://res.cloudinary.com/dvq75cqna/image/upload/v1780071134/vw-funds/e1a3a291c3dea7272c982b7cd90b97e9d310f2d2.png';
const imgCardImage6 = 'https://res.cloudinary.com/dvq75cqna/image/upload/v1780071136/vw-funds/e67775d65913cad5ff67c8c775bb9fcaee7b8d74.png';
const imgCardImage7 = 'https://res.cloudinary.com/dvq75cqna/image/upload/v1780071090/vw-funds/804a9d226f2fde3e441fc252051a11745dfbb986.png';

const PROJECT_ITEMS: PortalItem[] = [
  { id: '1', title: 'New 2026 VW Tiguan S',          type: 'PNG', dimensions: '1080 x 1080', imageSrc: imgCardImage  },
  { id: '2', title: 'New 2026 VW Tiguan S',          type: 'MP4', dimensions: '1280 x 720',  imageSrc: imgCardImage1 },
  { id: '3', title: 'New 2026 VW Tiguan S',          type: 'MP4', dimensions: '1280 x 720',  imageSrc: imgCardImage2 },
  { id: '4', title: 'New 2026 VW Tiguan S',          type: 'PNG', dimensions: '1080 x 1080', imageSrc: imgCardImage3 },
  { id: '5', title: 'Load up, Go Further',           type: 'PNG', dimensions: '1080 x 1080', imageSrc: imgCardImage4 },
  { id: '6', title: 'Defender in its Purest Form',   type: 'PNG', dimensions: '1080 x 1080', imageSrc: imgCardImage5 },
  { id: '7', title: 'The Most Versatile 7 Seat SUV', type: 'PNG', dimensions: '1080 x 1080', imageSrc: imgCardImage6 },
  { id: '8', title: 'Approved Certified Pre-Owned',  type: 'PNG', dimensions: '1080 x 1080', imageSrc: imgCardImage7 },
];

function PortalCard({ item, selected, onSelect }: { item: PortalItem; selected: boolean; onSelect: () => void }) {
  return (
    <Box
      onClick={onSelect}
      sx={{
        position: 'relative', borderRadius: 2, overflow: 'hidden', cursor: 'pointer',
        border: selected ? '2px solid #473bab' : '2px solid transparent',
        boxShadow: selected ? '0 0 0 2px rgba(71,59,171,0.2)' : '0 1px 4px rgba(0,0,0,0.08)',
        transition: 'border-color 0.15s, box-shadow 0.15s',
        '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.12)' },
      }}
    >
      {/* Image */}
      <Box sx={{ aspectRatio: '1/1', bgcolor: 'surface.canvas' }}>
        <Box component="img" src={item.imageSrc} alt={item.title} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </Box>

      {/* Selection checkbox */}
      <Box sx={{ position: 'absolute', top: 8, left: 8 }}>
        <Checkbox
          checked={selected}
          onChange={onSelect}
          onClick={(e) => e.stopPropagation()}
          size="small"
          sx={{
            p: 0.25, bgcolor: 'rgba(255,255,255,0.85)', borderRadius: 0.5,
            color: '#ccc', '&.Mui-checked': { color: 'primary.main' },
          }}
        />
      </Box>

      {/* Type badge */}
      <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
        <Box sx={{ px: 1, py: 0.25, bgcolor: 'rgba(0,0,0,0.55)', borderRadius: 1 }}>
          <Typography sx={{ fontSize: 10, fontWeight: 600, color: 'white', letterSpacing: '0.4px' }}>
            {item.type}
          </Typography>
        </Box>
      </Box>

      {/* Footer */}
      <Box sx={{ px: 1.5, py: 1.25, bgcolor: 'white' }}>
        <Typography sx={{ fontSize: 12, fontWeight: 500, color: 'text.primary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {item.title}
        </Typography>
        <Typography sx={{ fontSize: 11, color: 'text.secondary', letterSpacing: '0.4px', mt: 0.25 }}>
          {item.dimensions}
        </Typography>
      </Box>
    </Box>
  );
}

export function ProjectsScreen() {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const toggleSelection = (id: string) => {
    const next = new Set(selectedIds);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelectedIds(next);
  };

  const clearSelection = () => setSelectedIds(new Set());

  const filteredItems = PROJECT_ITEMS.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedAssets = PROJECT_ITEMS
    .filter(item => selectedIds.has(item.id))
    .map(item => item.imageSrc);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: 'white', position: 'relative' }}>
      {/* Breadcrumbs */}
      <Box sx={{ flexShrink: 0, px: 3, pt: 2, pb: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
          {[
            { label: 'Projects', active: false },
            { label: 'January Offers - Specials', active: false },
            { label: 'Assets', active: true },
          ].map((crumb, i, arr) => (
            <Box key={crumb.label} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Typography sx={{ fontSize: 11, color: crumb.active ? '#1f1d25' : '#686576', fontWeight: crumb.active ? 500 : 400, letterSpacing: '0.4px' }}>
                {crumb.label}
              </Typography>
              {i < arr.length - 1 && (
                <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>{'›'}</Typography>
              )}
            </Box>
          ))}
        </Box>
      </Box>

      <Box sx={{ px: 3 }}>
        <ProjectsHeader
          selectionCount={selectedIds.size}
          onClearSelection={clearSelection}
          onPreApproval={() => setIsDrawerOpen(true)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Filter chips row */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 1.5, flexWrap: 'wrap' }}>
          <Typography sx={{ fontSize: 11, color: 'text.secondary', letterSpacing: '0.4px' }}>Filtering by</Typography>
          <Chip
            icon={<AddIcon sx={{ fontSize: 12 }} />}
            label="Dimension"
            size="small"
            sx={{ fontSize: 11, height: 24, bgcolor: 'surface.canvas', border: 'none' }}
          />
          <Chip
            label="January Offers - Specials"
            size="small"
            onDelete={() => {}}
            deleteIcon={<CloseIcon sx={{ fontSize: 12 }} />}
            sx={{ fontSize: 11, height: 24, bgcolor: 'surface.canvas', border: 'none' }}
          />
          <Button sx={{ fontSize: 11, color: 'primary.main', fontWeight: 500, p: 0, minWidth: 0, textTransform: 'none' }}>
            Clear Filters
          </Button>

          <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography sx={{ fontSize: 11, color: 'text.secondary', letterSpacing: '0.4px' }}>{filteredItems.length} Items</Typography>
            <GridViewIcon sx={{ fontSize: 18, color: 'text.primary' }} />
          </Box>
        </Box>
      </Box>

      {/* Asset grid */}
      <Box sx={{ flex: 1, overflowY: 'auto', px: 3 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 3, pb: 5 }}>
          {filteredItems.map((item) => (
            <PortalCard
              key={item.id}
              item={item}
              selected={selectedIds.has(item.id)}
              onSelect={() => toggleSelection(item.id)}
            />
          ))}
        </Box>
      </Box>

      <ProjectsPreApprovalDrawer
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        assets={selectedAssets}
      />
    </Box>
  );
}
