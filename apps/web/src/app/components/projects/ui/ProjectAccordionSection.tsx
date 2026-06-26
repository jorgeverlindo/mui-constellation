/**
 * ProjectAccordionSection — Project detail accordion row.
 *
 * Mirrors the Figma component from ❖ AV3 - Projects Components.
 * Three states:
 *   • null   — count is undefined → no chevron, emptyContent always visible
 *   • closed — count defined, collapsed → ChevronRight, header only
 *   • open   — count defined, expanded  → ExpandMore, animated content
 */

import { useState } from "react";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Collapse from "@mui/material/Collapse";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

export interface ProjectAccordionSectionProps {
  /** Section label e.g. "Offers", "Templates" */
  title: string;
  /** Item count shown as "(N)". Omit to use the null/empty state (no chevron). */
  count?: number;
  /** Chips / action buttons placed in the header's right slot. */
  statusSlot?: React.ReactNode;
  /** Fires when "Details ↗" is clicked. Only rendered when count is defined. */
  onDetails?: () => void;
  /** Content rendered below the header when in null/empty state (always visible). */
  emptyContent?: React.ReactNode;
  /** Content revealed inside the open accordion (count must be defined). */
  children?: React.ReactNode;
  /** Start expanded (only relevant when count is defined). */
  defaultExpanded?: boolean;
  /** Avatar/button slot for the task owner, shown in the header's right area. */
  ownerSlot?: React.ReactNode;
  /** Controlled expanded state — when provided, overrides internal state. */
  expanded?: boolean;
  /** Called when the section is toggled (controlled mode). */
  onExpandedChange?: (v: boolean) => void;
}

export function ProjectAccordionSection({
  title,
  count,
  statusSlot,
  onDetails,
  emptyContent,
  children,
  defaultExpanded = false,
  expanded: controlledExpanded,
  onExpandedChange,
  ownerSlot,
}: ProjectAccordionSectionProps) {
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
  const isNullState = count === undefined;
  const isInteractive = !isNullState;

  // Controlled vs uncontrolled
  const expanded = controlledExpanded !== undefined ? controlledExpanded : internalExpanded;
  const toggle = () => {
    const next = !expanded;
    if (controlledExpanded === undefined) setInternalExpanded(next);
    onExpandedChange?.(next);
  };

  return (
    <Box sx={{ borderRadius: 3, bgcolor: "#F4F5F6", overflow: "hidden" }}>

      {/* ── Header row ──────────────────────────────────────────────────── */}
      <Box
        role={isInteractive ? "button" : undefined}
        tabIndex={isInteractive ? 0 : undefined}
        onClick={isInteractive ? toggle : undefined}
        onKeyDown={isInteractive
          ? (e) => { if (e.key === "Enter" || e.key === " ") toggle(); }
          : undefined
        }
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.25,
          px: 2.5,
          py: "11px",
          minHeight: 44,
          userSelect: "none",
          cursor: isInteractive ? "pointer" : "default",
          transition: "background-color 0.15s",
          "&:hover": isInteractive ? { bgcolor: "#ECEDF0" } : {},
          "&:active": isInteractive ? { bgcolor: "#E4E5E9" } : {},
        }}
      >
        {/* Chevron — only shown when not null state */}
        {isInteractive && (
          <Box
            sx={{
              flexShrink: 0,
              color: "text.secondary",
              display: "flex",
              alignItems: "center",
              transition: "transform 0.2s",
              transform: expanded ? "rotate(0deg)" : "rotate(-90deg)",
            }}
          >
            <ExpandMoreIcon sx={{ fontSize: 16 }} />
          </Box>
        )}

        {/* Title + count badge + inline status slot */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, flex: 1, minWidth: 0 }}>
          <Box
            component="span"
            sx={{
              fontSize: "14px",
              fontWeight: 600,
              color: "#1f1d25",
              lineHeight: 1.25,
            }}
          >
            {title}
          </Box>

          {isInteractive && count !== undefined && (
            <Box
              component="span"
              sx={{
                fontSize: "13px",
                color: "#9C99A9",
                fontWeight: 400,
              }}
            >
              ({count})
            </Box>
          )}

          {statusSlot && isInteractive && (
            <Box
              sx={{ display: "flex", alignItems: "center", flexShrink: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              {statusSlot}
            </Box>
          )}
        </Box>

        {/* Details link */}
        {onDetails && isInteractive && (
          <Box
            component="button"
            onClick={(e: React.MouseEvent) => { e.stopPropagation(); onDetails(); }}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              fontSize: "12px",
              color: "#686576",
              flexShrink: 0,
              cursor: "pointer",
              fontWeight: 400,
              background: "none",
              border: "none",
              p: 0,
              transition: "color 0.15s",
              "&:hover": { color: "#1f1d25" },
            }}
          >
            <OpenInNewIcon sx={{ fontSize: 13 }} />
            Details
          </Box>
        )}

        {/* Task owner avatar — always visible so users can assign even on empty sections */}
        {ownerSlot && (
          <Box sx={{ flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
            {ownerSlot}
          </Box>
        )}
      </Box>

      {/* ── Null/empty state content (always visible) ───────────────────── */}
      {isNullState && emptyContent && (
        <Box sx={{ px: 2.5, pb: 2, mt: -0.25 }}>
          {emptyContent}
        </Box>
      )}

      {/* ── Expandable content (animated) ───────────────────────────────── */}
      {isInteractive && (
        <Collapse in={expanded} timeout={200}>
          <Box sx={{ px: 2, pb: 2, pt: 0.5 }}>
            {children}
          </Box>
        </Collapse>
      )}
    </Box>
  );
}
