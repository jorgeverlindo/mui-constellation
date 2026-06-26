import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';

const imgAvatarMaite = 'https://res.cloudinary.com/dvq75cqna/image/upload/v1780071098/vw-funds/9d29793ede36f16f96173ad4142b4b20f0ce143c.png';

interface ProjectsHeaderProps {
  selectionCount: number;
  onClearSelection: () => void;
  onPreApproval: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function ProjectsHeader({
  selectionCount,
  onClearSelection,
  onPreApproval,
  searchQuery,
  onSearchChange,
}: ProjectsHeaderProps) {
  const hasSelection = selectionCount > 0;

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 2, pb: 2 }}>
      {/* Left section */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1 }}>
        {/* Filter icon with badge */}
        <Box sx={{ position: 'relative' }}>
          <IconButton size="small" sx={{ color: 'rgba(0,0,0,0.5)' }}>
            <FilterListIcon fontSize="small" />
          </IconButton>
          <Box sx={{
            position: 'absolute', top: -1, right: -4,
            bgcolor: 'primary.main', color: 'white', fontSize: 10, fontWeight: 600,
            px: '5px', minWidth: 16, height: 16, borderRadius: '100px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>1</Box>
        </Box>

        {/* Page title */}
        <Typography sx={{ fontSize: 16, fontWeight: 500, color: 'text.primary', letterSpacing: '0.15px', px: 1 }}>
          Assets
        </Typography>

        {/* Action buttons area */}
        {hasSelection ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Selection count pill */}
            <Box sx={{
              display: 'flex', alignItems: 'center', gap: 0.5,
              bgcolor: 'surface.canvas', borderRadius: '100px',
              pl: 0.5, pr: 1.5, py: 0.5, height: 34,
            }}>
              <IconButton size="small" onClick={onClearSelection} sx={{ width: 28, height: 28 }}>
                <CloseIcon sx={{ fontSize: 18, color: 'rgba(0,0,0,0.5)' }} />
              </IconButton>
              <Typography sx={{ fontSize: 11, color: 'text.primary', letterSpacing: '0.4px' }}>
                {selectionCount} selected
              </Typography>
            </Box>

            {/* Pre-Approval button */}
            <Box
              component="button"
              onClick={onPreApproval}
              sx={{
                display: 'flex', alignItems: 'center', gap: 1,
                px: 1.5, height: 34, borderRadius: '100px',
                border: '1px solid rgba(99,86,225,0.5)', bgcolor: 'white', cursor: 'pointer',
                '&:hover': { bgcolor: 'surface.canvas' },
              }}
            >
              <AddIcon sx={{ fontSize: 16, color: 'primary.main' }} />
              <Typography sx={{ fontSize: 13, fontWeight: 500, color: 'primary.main', letterSpacing: '0.46px' }}>
                Pre-Approval
              </Typography>
            </Box>

            {/* Delete */}
            <IconButton size="small" sx={{ color: 'rgba(0,0,0,0.5)' }}>
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              component="button"
              sx={{
                display: 'flex', alignItems: 'center', gap: 1,
                px: 1.5, py: 0.75, borderRadius: '100px',
                border: '1px solid #473bab', color: 'primary.main', cursor: 'pointer', bgcolor: 'transparent',
                '&:hover': { bgcolor: 'rgba(71,59,171,0.05)' },
              }}
            >
              <AddIcon sx={{ fontSize: 16 }} />
              <Typography sx={{ fontSize: 13, fontWeight: 500 }}>Enhance Images</Typography>
            </Box>
          </Box>
        )}

        <IconButton size="small" sx={{ color: 'rgba(0,0,0,0.5)' }}>
          <MoreVertIcon fontSize="small" />
        </IconButton>

        {/* Search */}
        <Box sx={{
          display: 'flex', alignItems: 'center', gap: 1,
          bgcolor: 'surface.inputBackground', borderRadius: '20px', height: 34, width: 200,
          border: '1px solid rgba(0,0,0,0.12)', px: 1,
        }}>
          <SearchIcon sx={{ fontSize: 22, color: 'rgba(0,0,0,0.5)' }} />
          <InputBase
            placeholder="Find below"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            sx={{ fontSize: 14, flex: 1, '& input': { p: 0 } }}
          />
        </Box>
      </Box>

      {/* Right section */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography sx={{ fontSize: 11, color: 'text.primary', letterSpacing: '0.4px' }}>
          Dec 1, 2025 - Dec 31, 2025
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{ width: 24, height: 24, borderRadius: '50%', overflow: 'hidden' }}>
            <Box component="img" src={imgAvatarMaite} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </Box>
          <Typography sx={{ fontSize: 11, color: 'text.secondary', letterSpacing: '0.4px' }}>Maite Espino</Typography>
        </Box>

        <Box sx={{
          display: 'flex', alignItems: 'center', gap: 0.5,
          px: 1, py: 0.5, bgcolor: 'rgba(2,136,209,0.08)', borderRadius: 1.5,
        }}>
          <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#03A9F4' }} />
          <Typography sx={{ fontSize: 11, color: '#014361', letterSpacing: '0.4px' }}>In Progress</Typography>
        </Box>
      </Box>
    </Box>
  );
}
