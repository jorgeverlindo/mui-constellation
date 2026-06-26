// ─── client-settings/Snackbar ────────────────────────────────────────────────
// Controlled snackbar used by ClientSettingsContent.
// Ported from Tailwind/motion to MUI Snackbar + CSS transition.
import Grow from '@mui/material/Grow';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';

interface SnackbarProps {
  open: boolean;
  onClose: () => void;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function Snackbar({
  open,
  onClose,
  message = "Pre-approval request created",
  actionLabel = "See It",
  onAction,
}: SnackbarProps) {
  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 24,
        left: 24,
        zIndex: 10000,
        pointerEvents: open ? 'auto' : 'none',
      }}
    >
      <Grow in={open} unmountOnExit>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            minWidth: 320,
            bgcolor: '#2C2C2C',
            color: 'white',
            px: '16px',
            py: '12px',
            borderRadius: '4px',
            boxShadow: '0px 4px 20px rgba(0,0,0,0.25)',
            gap: '16px',
          }}
        >
          <Typography sx={{ flex: 1, fontSize: '0.8125rem', fontWeight: 400, letterSpacing: '0.17px', color: 'white' }}>
            {message}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {actionLabel && (
              <Button
                onClick={onAction}
                sx={{ color: 'primary.light', fontSize: '0.8125rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.46px', minWidth: 0, p: 0, '&:hover': { color: 'rgba(172,171,255,0.8)', bgcolor: 'transparent' } }}
                disableRipple
              >
                {actionLabel}
              </Button>
            )}
            <IconButton onClick={onClose} size="small" sx={{ color: 'rgba(255,255,255,0.8)', '&:hover': { color: 'white' } }}>
              <CloseIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>
        </Box>
      </Grow>
    </Box>
  );
}
