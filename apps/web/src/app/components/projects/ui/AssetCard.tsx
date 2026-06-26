"use client";

import { ReactNode } from "react";
import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import IconButton from "@mui/material/IconButton";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";

interface AssetCardProps {
  /** Whether this card is currently selected */
  selected?: boolean;
  /** Called when the checkbox is toggled (receives new boolean value) */
  onSelect?: (checked: boolean) => void;
  /**
   * Content rendered inside the thumbnail shell.
   * The shell already provides: square aspect-ratio, bg-[#f0f2f4],
   * borderRadius, overflow-hidden, and the ring stroke.
   * Pass an element that fills the available space.
   */
  preview: ReactNode;
  /** Content rendered in the text area below the thumbnail */
  footer: ReactNode;
  /** Called when the card is clicked (checkbox / menu clicks are swallowed) */
  onClick?: () => void;
  /**
   * Replaces the default ⋯ button rendered on the thumbnail's top-right.
   * Pass `null` to hide it entirely.
   */
  menuButton?: ReactNode | null;
}

/**
 * Shared card shell — Card Vertical variant from the Constellation Design System.
 *
 * Anatomy (matches Figma "Card & Row / Card Vertical"):
 *
 *   ┌────────────────────────────────────────┐  ← borderRadius, gray bg
 *   │              thumbnail                 │    1 px inset ring (default)
 *   │   image / wireframe fills edge-to-edge │    2 px brand ring (selected)
 *   │                                        │
 *   │  [☑ checkbox TL]       [⋯ menu TR]    │
 *   └────────────────────────────────────────┘
 *   title                              [⋮ / edit]  ← pt-2 pb-3, zero horizontal pad
 *   subtitle
 *   [chip] [chip]
 *
 * The outer wrapper has NO background and NO stroke — the card shape is
 * defined entirely by the thumbnail shell.
 * The selection ring wraps the thumbnail ONLY (not the text section).
 */
export function AssetCard({
  selected = false,
  onSelect,
  preview,
  footer,
  onClick,
  menuButton,
}: AssetCardProps) {
  return (
    <Box
      onClick={onClick}
      sx={{
        cursor: "pointer",
        width: "100%",
        minWidth: 240,
        maxWidth: 300,
      }}
    >
      {/* ── Thumbnail shell ── */}
      <Box
        sx={{
          position: "relative",
          aspectRatio: "1 / 1",
          borderRadius: 3,
          overflow: "hidden",
          bgcolor: "#f0f2f4",
          border: selected
            ? "2px solid var(--brand-accent, #473bab)"
            : "1px solid rgba(0,0,0,0.07)",
          transition: "box-shadow 0.15s",
        }}
      >
        {/* Image / wireframe */}
        {preview}

        {/* Checkbox overlay — top-left */}
        <Box
          sx={{
            position: "absolute",
            top: 10,
            left: 10,
            zIndex: 10,
          }}
          onClick={(e) => {
            e.stopPropagation();
            onSelect?.(!selected);
          }}
        >
          <Checkbox
            size="small"
            checked={selected}
            onChange={(e) => {
              e.stopPropagation();
              onSelect?.(e.target.checked);
            }}
            onClick={(e) => e.stopPropagation()}
            sx={{
              padding: 0,
              width: 20,
              height: 20,
              bgcolor: selected ? "transparent" : "rgba(255,255,255,0.9)",
              borderRadius: "4px",
              color: selected ? "var(--brand-accent, #473bab)" : "rgba(0,0,0,0.3)",
              "&.Mui-checked": {
                color: "var(--brand-accent, #473bab)",
              },
            }}
          />
        </Box>

        {/* Menu button overlay — top-right */}
        {menuButton !== null && (
          <Box
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              zIndex: 10,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {menuButton ?? (
              <IconButton
                size="small"
                sx={{
                  width: 24,
                  height: 24,
                  bgcolor: "rgba(255,255,255,0.8)",
                  color: "text.secondary",
                  borderRadius: "6px",
                  "&:hover": {
                    bgcolor: "white",
                    color: "text.primary",
                  },
                }}
              >
                <MoreHorizIcon sx={{ fontSize: 14 }} />
              </IconButton>
            )}
          </Box>
        )}
      </Box>

      {/* ── Text area ──
          Figma spec: padding-top 8px, padding-bottom 12px, horizontal 0
          Text aligns flush with the thumbnail edges. */}
      <Box sx={{ pt: 1, pb: 1.5 }}>{footer}</Box>
    </Box>
  );
}
