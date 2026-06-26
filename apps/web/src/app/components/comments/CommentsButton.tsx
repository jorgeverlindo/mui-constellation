// ─── CommentsButton ───────────────────────────────────────────────────────────
// Canonical comments-panel toggle button.
// Ported from Tailwind/motion to MUI sx props + MUI Tooltip.
import { useRef, useState } from 'react';
import Box from '@mui/material/Box';
import MuiTooltip from '@mui/material/Tooltip';
import { useComments } from './CommentsContext';
import { ChatIcon } from './CommentsSidePanel';

export function CommentsButton() {
  const ctx = useComments();

  if (!ctx) return null;

  return (
    <MuiTooltip title="Comments" placement="bottom" arrow>
      <Box
        component="button"
        type="button"
        onClick={ctx.togglePanel}
        aria-label="Toggle comments panel"
        sx={{
          p: '6px',
          borderRadius: '100px',
          border: 'none',
          cursor: 'pointer',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background 0.15s, color 0.15s',
          ...(ctx.isPanelOpen
            ? { bgcolor: 'rgba(71,59,171,0.12)', color: 'primary.main' }
            : { bgcolor: 'transparent', color: 'text.secondary', '&:hover': { bgcolor: 'rgba(0,0,0,0.05)', color: 'text.primary' } }
          ),
        }}
      >
        <ChatIcon size={20} />
      </Box>
    </MuiTooltip>
  );
}
