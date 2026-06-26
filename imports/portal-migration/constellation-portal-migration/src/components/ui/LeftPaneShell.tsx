import { ReactNode } from 'react';
import { Box, Typography, IconButton, Tooltip } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

// Shared container + header for every left pane (Folders, Filters, etc.)
// Provides consistent typography, close button, border-bottom, and scrollbar.
interface LeftPaneShellProps {
  title: string;
  onClose: () => void;
  /** Optional badge or count chip rendered after the title */
  badge?: ReactNode;
  /** Optional actions rendered before the close button (e.g. "Clear all") */
  actions?: ReactNode;
  children: ReactNode;
}

const TEXT_MAIN = '#1f1d25';
const TEXT_DIM  = 'rgba(17,16,20,0.56)';

export function LeftPaneShell({ title, onClose, badge, actions, children }: LeftPaneShellProps) {
  return (
    <Box sx={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      bgcolor: '#ffffff',
      borderRadius: '16px',
      overflow: 'hidden',
    }}>
      {/* ── Shared header ──────────────────────────────────────────────────── */}
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        px: '12px',
        pt: '14px',
        pb: '10px',
        flexShrink: 0,
        borderBottom: '1px solid rgba(0,0,0,0.06)',
      }}>
        {/* Title + badge */}
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
          <Typography sx={{
            fontSize: 16,
            fontWeight: 500,
            color: TEXT_MAIN,
            fontFamily: 'Roboto, sans-serif',
            lineHeight: 1,
          }}>
            {title}
          </Typography>
          {badge}
        </Box>

        {/* Optional actions (e.g. "Clear all") */}
        {actions}

        {/* Close button */}
        <Tooltip title="Close panel" placement="bottom">
          <IconButton
            size="small"
            onClick={onClose}
            sx={{
              width: 28,
              height: 28,
              borderRadius: '8px',
              p: 0,
              ml: '4px',
              color: TEXT_DIM,
              '&:hover': { bgcolor: '#f0f2f4', color: TEXT_MAIN },
            }}
          >
            <CloseIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>
      </Box>

      {/* ── Scrollable body ─────────────────────────────────────────────────── */}
      <Box sx={{
        flex: 1,
        overflowY: 'auto',
        // Consistent thin scrollbar across both panes
        '&::-webkit-scrollbar': { width: '4px' },
        '&::-webkit-scrollbar-track': { background: 'transparent' },
        '&::-webkit-scrollbar-thumb': { background: 'rgba(0,0,0,0.12)', borderRadius: '4px' },
        '&::-webkit-scrollbar-thumb:hover': { background: 'rgba(0,0,0,0.22)' },
      }}>
        {children}
      </Box>
    </Box>
  );
}
