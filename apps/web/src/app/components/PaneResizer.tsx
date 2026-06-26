import React, { useState, useEffect, useRef, useCallback } from 'react';
import Box from '@mui/material/Box';

// ── usePaneResize ─────────────────────────────────────────────────────────────
// side: 'left'  → handle on right edge of pane (dragging right grows pane)
// side: 'right' → handle on left edge of pane  (dragging left grows pane)

export function usePaneResize({
  initialWidth,
  min = 200,
  max = 800,
  side = 'left',
}: {
  initialWidth: number;
  min?: number;
  max?: number;
  side?: 'left' | 'right';
}) {
  const [width, setWidth] = useState(initialWidth);
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startWidth: number } | null>(null);

  const handleResizeStart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      dragRef.current = { startX: e.clientX, startWidth: width };
      setIsDragging(true);
    },
    [width],
  );

  useEffect(() => {
    if (!isDragging) return;
    const onMove = (e: MouseEvent) => {
      if (!dragRef.current) return;
      const rawDelta = e.clientX - dragRef.current.startX;
      const delta = side === 'right' ? -rawDelta : rawDelta;
      setWidth(Math.max(min, Math.min(max, dragRef.current.startWidth + delta)));
    };
    const onUp = () => setIsDragging(false);
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'col-resize';
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    return () => {
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
  }, [isDragging, min, max, side]);

  return { width, isDragging, handleResizeStart };
}

// ── PaneResizer ───────────────────────────────────────────────────────────────
// 16px strip with a 3×40px pill. Hover/drag lights the pill up in primary.

export function PaneResizer({
  onMouseDown,
  isDragging,
}: {
  onMouseDown: (e: React.MouseEvent) => void;
  isDragging: boolean;
}) {
  return (
    <Box
      onMouseDown={onMouseDown}
      sx={{
        width: 16,
        flexShrink: 0,
        height: '100%',
        cursor: 'col-resize',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        '&:hover .pr-pill': { bgcolor: 'primary.main' },
      }}
    >
      <Box
        className="pr-pill"
        sx={{
          width: 3,
          height: 40,
          borderRadius: '2px',
          bgcolor: isDragging ? 'primary.main' : 'divider',
          transition: isDragging ? 'none' : 'background-color 150ms',
        }}
      />
    </Box>
  );
}
