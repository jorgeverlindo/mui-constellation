import { Box, Button, IconButton, Tooltip, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

const PRIMARY    = '#7F77DD';
const ICON_COLOR = '#6B6B80';

export interface SelectionActionBarProps {
  count: number;
  onClearSelection: () => void;
  onExport?: (ids: string[]) => void;
  onActions?: (ids: string[]) => void;
  onBulkEdit?: (ids: string[]) => void;
  onBulkAI?: (ids: string[]) => void;
  onDelete?: (ids: string[]) => void;
  selectedIds: string[];
}

const pillSx = {
  textTransform: 'none' as const,
  borderRadius: '100px',
  borderColor: PRIMARY,
  color: PRIMARY,
  fontWeight: 600,
  fontSize: 13,
  height: 30,
  px: 1.75,
  fontFamily: 'Roboto, sans-serif',
  '&:hover': { bgcolor: '#F3F2FD', borderColor: PRIMARY },
};

const iconBtnSx = {
  width: 32,
  height: 32,
  borderRadius: '8px',
  color: ICON_COLOR,
  '&:hover': { bgcolor: '#F3F2FD' },
};

export function SelectionActionBar({
  count,
  onClearSelection,
  onExport,
  onActions,
  onBulkEdit,
  onBulkAI,
  onDelete,
  selectedIds,
}: SelectionActionBarProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        width: '100%',
      }}
    >
      {/* ✕ N selected */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          border: `1.5px solid ${PRIMARY}`,
          borderRadius: '100px',
          height: 30,
          px: 1.25,
          cursor: 'pointer',
          transition: 'background-color 0.15s',
          '&:hover': { bgcolor: '#F3F2FD' },
        }}
        onClick={onClearSelection}
      >
        <CloseIcon sx={{ fontSize: 14, color: PRIMARY }} />
        <Typography
          sx={{
            fontSize: 13,
            fontWeight: 600,
            color: PRIMARY,
            fontFamily: 'Roboto, sans-serif',
            whiteSpace: 'nowrap',
            lineHeight: 1,
          }}
        >
          {count} selected
        </Typography>
      </Box>

      {/* Export pill */}
      <Button
        variant="outlined"
        size="small"
        startIcon={<FileDownloadOutlinedIcon sx={{ fontSize: '16px !important' }} />}
        onClick={() => onExport?.(selectedIds)}
        sx={pillSx}
      >
        Export
      </Button>

      {/* Actions pill */}
      <Button
        variant="outlined"
        size="small"
        startIcon={<SettingsOutlinedIcon sx={{ fontSize: '16px !important' }} />}
        onClick={() => onActions?.(selectedIds)}
        sx={pillSx}
      >
        Actions
      </Button>

      {/* Spacer */}
      <Box sx={{ flex: 1 }} />

      {/* Edit icon */}
      <Tooltip title="Bulk edit metadata" placement="bottom">
        <IconButton
          size="small"
          onClick={() => onBulkEdit?.(selectedIds)}
          sx={iconBtnSx}
        >
          <EditOutlinedIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Tooltip>

      {/* AI icon */}
      <Tooltip title="Re-analyze with AI" placement="bottom">
        <IconButton
          size="small"
          onClick={() => onBulkAI?.(selectedIds)}
          sx={iconBtnSx}
        >
          <AutoAwesomeIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Tooltip>

      {/* Delete icon */}
      <Tooltip title={`Delete ${count} assets`} placement="bottom">
        <IconButton
          size="small"
          onClick={() => onDelete?.(selectedIds)}
          sx={{ ...iconBtnSx, '&:hover': { bgcolor: '#FEE2E2', color: '#DC2626' } }}
        >
          <DeleteOutlineIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Tooltip>
    </Box>
  );
}
