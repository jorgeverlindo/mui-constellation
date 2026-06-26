import { Snackbar, Box, Typography, IconButton, Button } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const BRAND = '#473bab';

interface AppSnackbarProps {
  open: boolean;
  message: string;
  onClose: () => void;
  /** Optional action button (e.g. "Undo") */
  action?: { label: string; onClick: () => void };
  autoHideDuration?: number;
}

export function AppSnackbar({
  open,
  message,
  onClose,
  action,
  autoHideDuration = 4000,
}: AppSnackbarProps) {
  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={(_, reason) => { if (reason !== 'clickaway') onClose(); }}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      sx={{ bottom: { xs: 16 }, left: { xs: 16 } }}
    >
      <Box sx={{
        display: 'flex', alignItems: 'center', gap: '4px',
        px: '16px', py: '12px', borderRadius: '4px',
        bgcolor: '#323232',
        boxShadow: '0 3px 10px rgba(0,0,0,0.28)',
        minWidth: 288, maxWidth: 560,
      }}>
        <Typography sx={{
          flex: 1, fontSize: 14, fontFamily: 'Roboto, sans-serif',
          fontWeight: 400, color: '#fff', lineHeight: 1.43,
        }}>
          {message}
        </Typography>

        {action && (
          <Button
            size="small"
            onClick={() => { action.onClick(); onClose(); }}
            sx={{
              ml: '8px', px: '8px', minWidth: 0, flexShrink: 0,
              textTransform: 'uppercase', fontSize: 13, fontWeight: 500,
              fontFamily: 'Roboto, sans-serif', letterSpacing: '0.4px',
              color: `${BRAND}CC`,
              '&:hover': { bgcolor: 'rgba(255,255,255,0.08)', color: '#a599f5' },
            }}
          >
            {action.label}
          </Button>
        )}

        <IconButton
          size="small"
          onClick={onClose}
          sx={{
            ml: action ? '0' : '8px', flexShrink: 0,
            color: 'rgba(255,255,255,0.7)',
            '&:hover': { color: '#fff', bgcolor: 'rgba(255,255,255,0.08)' },
          }}
        >
          <CloseIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>
    </Snackbar>
  );
}
