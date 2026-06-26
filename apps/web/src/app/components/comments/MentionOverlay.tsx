// ─── MentionOverlay ──────────────────────────────────────────────────────────
// Floating dropdown for @mention autocomplete.
// No Tailwind — all styling via sx props.
import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { CommentUser } from './types';

interface MentionOverlayProps {
  query: string;
  users: CommentUser[];
  onSelect: (user: CommentUser) => void;
  onDismiss: () => void;
}

function UserRow({ user, isActive, onClick }: { user: CommentUser; isActive: boolean; onClick: () => void }) {
  return (
    <Box
      component="button"
      type="button"
      onMouseDown={(e: React.MouseEvent) => {
        e.preventDefault(); // don't blur the composer
        onClick();
      }}
      sx={{
        display: 'flex', alignItems: 'center', gap: '12px',
        width: '100%', px: '12px', py: '8px', textAlign: 'left', border: 'none',
        bgcolor: isActive ? 'rgba(71,59,171,0.08)' : 'transparent',
        cursor: 'pointer', transition: 'background 0.1s',
        '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' },
      }}
    >
      {/* Avatar */}
      <Box
        component="span"
        sx={{
          flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: 28, height: 28, borderRadius: '50%', bgcolor: user.color || '#bcbbc2',
          color: 'white', fontSize: '0.625rem', fontWeight: 500, userSelect: 'none',
        }}
        aria-hidden="true"
      >
        {user.initials}
      </Box>

      {/* Name + email */}
      <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Typography sx={{ fontSize: '0.8125rem', color: 'text.primary', fontWeight: 500, lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {user.name}
        </Typography>
        {user.email && (
          <Typography sx={{ fontSize: '0.6875rem', color: 'text.secondary', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user.email}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

export function MentionOverlay({ query, users, onSelect, onDismiss }: MentionOverlayProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const filtered = users.filter(
    u => u.name.toLowerCase().includes(query.toLowerCase()) ||
         u.email?.toLowerCase().includes(query.toLowerCase()),
  );

  useEffect(() => { setActiveIndex(0); }, [query]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (filtered.length === 0) return;
      if (e.key === "ArrowDown") { e.preventDefault(); setActiveIndex(i => (i + 1) % filtered.length); }
      else if (e.key === "ArrowUp") { e.preventDefault(); setActiveIndex(i => (i - 1 + filtered.length) % filtered.length); }
      else if (e.key === "Enter" || e.key === "Tab") { e.preventDefault(); onSelect(filtered[activeIndex]); }
      else if (e.key === "Escape") { onDismiss(); }
    };
    window.addEventListener("keydown", handleKey, { capture: true });
    return () => window.removeEventListener("keydown", handleKey, { capture: true });
  }, [filtered, activeIndex, onSelect, onDismiss]);

  if (filtered.length === 0) return null;

  return (
    <Box
      role="listbox"
      aria-label="Mention users"
      sx={{
        position: 'absolute', zIndex: 50, bottom: '100%', mb: '4px', left: 0, width: 256,
        bgcolor: 'white', borderRadius: '12px', overflow: 'hidden',
        boxShadow: '0px 3px 14px 2px rgba(0,0,0,0.12), 0px 8px 10px 1px rgba(0,0,0,0.14)',
        maxHeight: 192, overflowY: 'auto',
      }}
    >
      <Box sx={{ py: '4px' }}>
        {filtered.map((user, idx) => (
          <UserRow
            key={user.id}
            user={user}
            isActive={idx === activeIndex}
            onClick={() => onSelect(user)}
          />
        ))}
      </Box>
    </Box>
  );
}
