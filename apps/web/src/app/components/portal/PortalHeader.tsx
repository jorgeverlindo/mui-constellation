import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';
import Tooltip from '@mui/material/Tooltip';
import Button from '@mui/material/Button';
import FolderOpenOutlinedIcon from '@mui/icons-material/FolderOpenOutlined';
import FilterListIcon from '@mui/icons-material/FilterList';
import SearchIcon from '@mui/icons-material/Search';
import GridViewOutlinedIcon from '@mui/icons-material/GridViewOutlined';
import ViewListOutlinedIcon from '@mui/icons-material/ViewListOutlined';
import CloseIcon from '@mui/icons-material/Close';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';
import AutoFixHighOutlinedIcon from '@mui/icons-material/AutoFixHighOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { CommentsButton } from '../comments';

interface PortalHeaderProps {
  selectionCount: number;
  onClearSelection: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  folderName?: string;
  onPreApproval: () => void;
}

export function PortalHeader({
  selectionCount,
  onClearSelection,
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
  folderName = 'Jack Daniels Volkswagen — January Offers Specials',
  onPreApproval,
}: PortalHeaderProps) {
  const selecting = selectionCount > 0;

  return (
    <Box sx={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      px: 3, height: 72, flexShrink: 0,
      borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.paper',
    }}>
      {/* Left */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1, minWidth: 0 }}>
        <IconButton size="small" sx={{ color: 'text.secondary' }}>
          <FolderOpenOutlinedIcon fontSize="small" />
        </IconButton>
        <IconButton size="small" sx={{ color: 'text.secondary' }}>
          <FilterListIcon fontSize="small" />
        </IconButton>
        <Typography sx={{ fontSize: '1rem', fontWeight: 500, color: 'text.primary', flexShrink: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 320 }}>
          {folderName}
        </Typography>

        {/* Selection pill */}
        {selecting && (
          <Box sx={{
            display: 'flex', alignItems: 'center', bgcolor: '#F0F2F4',
            borderRadius: 999, pl: 0.5, pr: 1, py: '3px', gap: 1.5, ml: 1,
            animation: 'fadeIn 150ms ease', flexShrink: 0,
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <IconButton size="small" onClick={onClearSelection} sx={{ color: 'text.secondary', p: '3px' }}>
                <CloseIcon fontSize="small" />
              </IconButton>
              <Typography sx={{ fontSize: '0.6875rem', color: 'text.primary', userSelect: 'none', px: 0.5, whiteSpace: 'nowrap' }}>
                {selectionCount} selected
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SelectionButton icon={<DownloadOutlinedIcon sx={{ fontSize: 17 }} />} label="Download" />
              <SelectionButton icon={<AssignmentTurnedInOutlinedIcon sx={{ fontSize: 17 }} />} label="Pre-approval" onClick={onPreApproval} />
              <SelectionIcon icon={<AutoFixHighOutlinedIcon />} tooltip="AI Enhance" />
              <SelectionIcon icon={<EditOutlinedIcon />} tooltip="Edit" />
              <SelectionIcon icon={<ContentCopyOutlinedIcon />} tooltip="Duplicate" />
              <SelectionIcon icon={<DeleteOutlineIcon />} tooltip="Delete" />
            </Box>
          </Box>
        )}

        {/* Search */}
        <Box sx={{
          ml: 1, display: 'flex', alignItems: 'center', gap: 0.75,
          bgcolor: 'surface.filled', borderRadius: 999, px: 1.5, height: 34,
          border: '1px solid', borderColor: 'divider', minWidth: 180,
        }}>
          <SearchIcon sx={{ fontSize: 18, color: 'text.disabled', flexShrink: 0 }} />
          <InputBase
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Find below"
            sx={{ fontSize: '0.875rem', color: 'text.secondary', flex: 1 }}
          />
        </Box>
      </Box>

      {/* Right */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0, ml: 2 }}>
        <CommentsButton />
        <Tooltip title={viewMode === 'grid' ? 'List view' : 'Grid view'}>
          <IconButton size="small" onClick={() => onViewModeChange(viewMode === 'grid' ? 'list' : 'grid')} sx={{ color: 'text.secondary' }}>
            {viewMode === 'grid' ? <ViewListOutlinedIcon fontSize="small" /> : <GridViewOutlinedIcon fontSize="small" />}
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
}

function SelectionButton({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick?: () => void }) {
  return (
    <Button
      size="small"
      startIcon={icon}
      onClick={onClick}
      sx={{
        borderRadius: 999, border: '1px solid rgba(99,86,225,0.5)',
        color: 'brand.accent', fontSize: '0.8125rem', fontWeight: 500,
        px: 1.5, py: 0.5, lineHeight: '22px',
        '&:hover': { bgcolor: 'rgba(71,59,171,0.06)' },
        textTransform: 'none', letterSpacing: '0.46px', whiteSpace: 'nowrap',
      }}
    >
      {label}
    </Button>
  );
}

function SelectionIcon({ icon, tooltip }: { icon: React.ReactNode; tooltip: string }) {
  return (
    <Tooltip title={tooltip}>
      <IconButton size="small" sx={{ color: 'text.secondary', p: '5px' }}>
        {icon}
      </IconButton>
    </Tooltip>
  );
}
