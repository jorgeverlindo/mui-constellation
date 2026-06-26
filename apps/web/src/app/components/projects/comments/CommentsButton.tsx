// ─── CommentsButton ───────────────────────────────────────────────────────────
// Canonical comments-panel toggle button.
// Works in any subtree that has a <CommentsProvider> ancestor.
// Renders nothing if no provider is present (safe to place anywhere).

import React, {
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import IconButton from "@mui/material/IconButton";
import Fade from "@mui/material/Fade";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import { useComments } from "./CommentsContext";
import { ChatIcon } from "./CommentsSidePanel";

// ── Tooltip (private) ─────────────────────────────────────────────────────────

function CommentsTooltip({
  anchorRef,
  visible,
}: {
  anchorRef: React.RefObject<HTMLElement | null>;
  visible: boolean;
}) {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: -999, left: -999, arrowLeft: "50%" });

  useLayoutEffect(() => {
    if (!visible || !anchorRef.current || !tooltipRef.current) return;
    const r   = anchorRef.current.getBoundingClientRect();
    const cx  = r.left + r.width / 2;
    const top = r.bottom + 8;
    const tw  = tooltipRef.current.offsetWidth;
    const M   = 8;
    const raw = cx - tw / 2;
    const clamped = Math.max(M, Math.min(raw, window.innerWidth - tw - M));
    setPos({ top, left: clamped, arrowLeft: `${cx - clamped}px` });
  }, [visible, anchorRef]);

  return createPortal(
    <Fade in={visible} timeout={350}>
      <Box
        ref={tooltipRef}
        sx={{
          position: "fixed",
          top: pos.top,
          left: pos.left,
          fontSize: 11,
          letterSpacing: "0.17px",
          lineHeight: "1.43",
          zIndex: 9999,
          pointerEvents: "none",
          px: "8px",
          py: "5px",
          bgcolor: "#1f1d25",
          color: "white",
          borderRadius: "6px",
          whiteSpace: "nowrap",
          display: visible ? "block" : "none",
        }}
      >
        {/* Arrow — points up toward the button */}
        <Box
          sx={{
            position: "absolute",
            bottom: "100%",
            width: 0,
            height: 0,
            borderLeft: "4px solid transparent",
            borderRight: "4px solid transparent",
            borderBottom: "4px solid #1f1d25",
            left: pos.arrowLeft,
            transform: "translateX(-50%)",
          }}
        />
        <Box sx={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span>Comments</span>
          <Box
            component="span"
            sx={{
              fontSize: 10,
              color: "rgba(255,255,255,0.6)",
              fontWeight: 500,
              bgcolor: "rgba(255,255,255,0.1)",
              px: "4px",
              py: "1px",
              borderRadius: "3px",
              letterSpacing: "0.5px",
            }}
          >
            C
          </Box>
        </Box>
      </Box>
    </Fade>,
    document.body,
  );
}

// ── CommentsButton (public) ───────────────────────────────────────────────────

export function CommentsButton() {
  const ctx = useComments();
  const ref = useRef<HTMLButtonElement>(null);
  const [tip, setTip] = useState(false);

  if (!ctx) return null;

  return (
    <>
      <IconButton
        ref={ref}
        onClick={ctx.togglePanel}
        aria-label="Toggle comments panel"
        onMouseEnter={() => setTip(true)}
        onMouseLeave={() => setTip(false)}
        size="small"
        sx={{
          borderRadius: "50%",
          flexShrink: 0,
          ...(ctx.isPanelOpen
            ? { bgcolor: "rgba(71,59,171,0.12)", color: "#473bab" }
            : {
                color: "#686576",
                "&:hover": { bgcolor: "rgba(0,0,0,0.05)", color: "#1f1d25" },
              }),
        }}
      >
        <ChatIcon size={20} />
      </IconButton>
      <CommentsTooltip anchorRef={ref} visible={tip} />
    </>
  );
}
