import React from 'react';
import { Box, Typography, IconButton, Divider } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { ink, brand, surface as surfaceTokens, status as statusTokens } from '@jorgeverlindo/constellation-ux';

interface LeftPaneShellProps {
  title: string;
  onClose?: () => void;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

export function LeftPaneShell({ title, onClose, badge, actions, children }: LeftPaneShellProps) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: '#fff', borderRadius: '16px', overflow: 'hidden' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', px: 2, height: 52, flexShrink: 0, gap: 1 }}>
        <Typography sx={{ fontWeight: 700, fontSize: 14, flex: 1, color: ink.primary }}>
          {title}
        </Typography>
        {badge}
        {actions}
        {onClose && (
          <IconButton size="small" onClick={onClose} sx={{ p: '4px', color: 'rgba(17,16,20,0.56)', '&:hover': { bgcolor: 'rgba(0,0,0,0.06)' } }}>
            <CloseIcon sx={{ fontSize: 16 }} />
          </IconButton>
        )}
      </Box>
      <Divider />
      {/* Scrollable body */}
      <Box sx={{
        flex: 1,
        overflowY: 'auto',
        '&::-webkit-scrollbar': { width: 4 },
        '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(0,0,0,0.15)', borderRadius: 2 },
      }}>
        {children}
      </Box>
    </Box>
  );
}
