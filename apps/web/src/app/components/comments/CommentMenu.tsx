// ─── CommentMenu ─────────────────────────────────────────────────────────────
// Context menu triggered from the ⋯ button on a comment or reply.
// Ported from Tailwind to MUI sx props.
import React, { useEffect, useRef } from 'react';
import Box from '@mui/material/Box';

export type CommentMenuAction = "edit" | "delete" | "pin" | "unpin";

interface CommentMenuProps {
  isOpen: boolean;
  isPinned?: boolean;
  showPin?: boolean;
  isOwn?: boolean;
  onAction: (action: CommentMenuAction) => void;
  onClose: () => void;
}

function PencilIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
      <path d="M10 11v6"/><path d="M14 11v6"/>
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
    </svg>
  );
}

function PinIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="17" x2="12" y2="22"/>
      <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V17z"/>
    </svg>
  );
}

interface MenuItem {
  action: CommentMenuAction;
  label: string;
  icon: React.ReactNode;
  danger?: boolean;
}

export function CommentMenu({ isOpen, isPinned = false, showPin = true, isOwn = true, onAction, onClose }: CommentMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handleClick, true);
    return () => document.removeEventListener("mousedown", handleClick, true);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const items: MenuItem[] = [
    ...(isOwn ? [
      { action: "edit" as CommentMenuAction, label: "Edit", icon: <PencilIcon /> },
      { action: "delete" as CommentMenuAction, label: "Delete", icon: <TrashIcon />, danger: true },
    ] : []),
    ...(showPin ? [{
      action: (isPinned ? "unpin" : "pin") as CommentMenuAction,
      label: isPinned ? "Unpin" : "Pin",
      icon: <PinIcon />,
    }] : []),
  ];

  if (items.length === 0) return null;

  return (
    <Box
      ref={menuRef}
      role="menu"
      aria-label="Comment actions"
      sx={{
        position: 'absolute', right: 0, top: 24, zIndex: 50, minWidth: 140,
        bgcolor: 'white', borderRadius: '4px', overflow: 'hidden', py: '4px',
        boxShadow: '0px 3px 14px 2px rgba(0,0,0,0.12), 0px 8px 10px 1px rgba(0,0,0,0.14), 0px 5px 5px -3px rgba(0,0,0,0.2)',
      }}
    >
      {items.map(({ action, label, icon, danger }) => (
        <Box
          key={action}
          component="button"
          role="menuitem"
          type="button"
          onClick={() => { onAction(action); onClose(); }}
          sx={{
            display: 'flex', alignItems: 'center', gap: '12px',
            width: '100%', px: '16px', py: '8px', textAlign: 'left', border: 'none',
            fontSize: '0.875rem', cursor: 'pointer',
            color: danger ? '#c62828' : '#1f1d25',
            bgcolor: 'transparent',
            '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' },
            transition: 'background 0.1s',
          }}
        >
          <Box component="span" sx={{ opacity: 0.56, color: danger ? '#c62828' : 'rgba(17,16,20,0.56)', display: 'flex' }}>
            {icon}
          </Box>
          {label}
        </Box>
      ))}
    </Box>
  );
}
