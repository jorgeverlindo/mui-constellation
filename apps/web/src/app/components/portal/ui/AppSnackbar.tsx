import { Snackbar, Box, Typography, IconButton, Button } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { ink, brand, surface as surfaceTokens, status as statusTokens } from '@jorgeverlindo/constellation-ux';

export interface AppSnackbarProps {
  open: boolean;
  message: string;
  onClose: () => void;
  actionLabel?: string;
  onAction?: () => void;
  duration?: number;
}

export function AppSnackbar({ open, message, onClose, actionLabel, onAction, duration = 4000 }: AppSnackbarProps) {
  return (
    <Snackbar
      open={open}
      autoHideDuration={duration}
      onClose={(_, reason) => { if (reason !== 'clickaway') onClose(); }}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      sx={{ bottom: { xs: 90, sm: 90 } }}
    >
      <Box sx={{
        display: 'flex', alignItems: 'center', gap: 1,
        px: 2, py: 1.25, bgcolor: '#323232', borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.28)', minWidth: 280, maxWidth: 400,
      }}>
        <Typography sx={{ flex: 1, fontSize: 14, color: '#fff' }}>
          {message}
        </Typography>
        {actionLabel && onAction && (
          <Button
            size="small"
            onClick={() => { onAction(); onClose(); }}
            sx={{ color: '#a78bfa', textTransform: 'none', fontSize: 13, fontWeight: 600, p: 0, minWidth: 0, flexShrink: 0, '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' } }}
          >
            {actionLabel}
          </Button>
        )}
        <IconButton size="small" onClick={onClose} sx={{ p: '2px', color: 'rgba(255,255,255,0.6)', flexShrink: 0, '&:hover': { color: '#fff', bgcolor: 'rgba(255,255,255,0.1)' } }}>
          <CloseIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Box>
    </Snackbar>
  );
}
