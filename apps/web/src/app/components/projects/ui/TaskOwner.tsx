/**
 * TaskOwner — Per-section task owner avatar.
 * Hover shows tooltip. Click opens owner-picker dropdown.
 *
 * Both the tooltip and the dropdown escape any parent overflow:hidden
 * (e.g. the accordion wrapper) via MUI Popper/Portal.
 */

import { useState, useRef, useCallback, useEffect } from "react";
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import Popper from "@mui/material/Popper";
import Portal from "@mui/material/Portal";
import Fade from "@mui/material/Fade";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import MenuList from "@mui/material/MenuList";
import MenuItem from "@mui/material/MenuItem";
import CheckIcon from "@mui/icons-material/Check";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";

// ─── Inline owner list (matches source CreateProjectDialog.tsx) ───────────────
export const PROJECT_OWNERS = [
  { id: "jorge-verlindo",  name: "Jorge Verlindo",  initials: "JV", color: "#473bab", avatar: null },
  { id: "luke-theobald",   name: "Luke Theobald",   initials: "LT", color: "#2563eb", avatar: null },
  { id: "jenny-park",      name: "Jenny Park",      initials: "JP", color: "#7c3aed", avatar: null },
  { id: "sonya-koh",       name: "Sonya Koh",       initials: "SK", color: "#db2777", avatar: null },
  { id: "zak-flaten",      name: "Zak Flaten",      initials: "ZF", color: "#059669", avatar: null },
  { id: "rachel-hui",      name: "Rachel Hui",      initials: "RH", color: "#d97706", avatar: null },
  { id: "mike-henderson",  name: "Mike Henderson",  initials: "MH", color: "#dc2626", avatar: null },
  { id: "sarah-collins",   name: "Sarah Collins",   initials: "SC", color: "#0891b2", avatar: null },
  { id: "james-whitaker",  name: "James Whitaker",  initials: "JW", color: "#65a30d", avatar: null },
  { id: "ashley-morgan",   name: "Ashley Morgan",   initials: "AM", color: "#ea580c", avatar: null },
  { id: "jenny-eckhart",   name: "Jenny Eckhart",   initials: "JE", color: "#0e7490", avatar: null },
  { id: "mallory-manning", name: "Mallory Manning", initials: "MM", color: "#b45309", avatar: null },
  { id: "katelyn-gray",    name: "Katelyn Gray",    initials: "KG", color: "#0369a1", avatar: null },
] as const;

export type ProjectOwner = typeof PROJECT_OWNERS[number];

// ─── Component ────────────────────────────────────────────────────────────────

export function TaskOwner({
  ownerId,
  onChange,
}: {
  ownerId?: string;
  onChange: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);

  const owner = PROJECT_OWNERS.find((o) => o.id === ownerId) as ProjectOwner | undefined;

  const handleMouseEnter = useCallback(() => setHovered(true), []);
  const handleMouseLeave = useCallback(() => setHovered(false), []);
  const handleClick = useCallback(() => {
    setOpen((v) => !v);
    setHovered(false);
  }, []);

  // Close on scroll/resize
  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [open]);

  return (
    <Box sx={{ position: "relative" }}>
      {/* Avatar button */}
      <Box
        component="button"
        ref={btnRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        aria-label="Change task owner"
        sx={{
          width: 24,
          height: 24,
          borderRadius: "50%",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          cursor: "pointer",
          border: "none",
          p: 0,
          background: "none",
          transition: "box-shadow 0.15s",
          "&:hover": {
            boxShadow: "0 0 0 2px white, 0 0 0 4px var(--brand-accent, #473bab)",
          },
        }}
      >
        {owner ? (
          owner.avatar ? (
            <Box
              component="img"
              src={owner.avatar}
              alt={owner.name}
              sx={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <Avatar
              sx={{
                width: 24,
                height: 24,
                bgcolor: owner.color,
                fontSize: "9px",
                fontWeight: 600,
                letterSpacing: "0.02em",
              }}
            >
              {owner.initials}
            </Avatar>
          )
        ) : (
          <Avatar
            sx={{
              width: 24,
              height: 24,
              bgcolor: "#E8E7EF",
              color: "#9C99A9",
            }}
          >
            <PersonOutlineIcon sx={{ fontSize: 14 }} />
          </Avatar>
        )}
      </Box>

      {/* ── Tooltip — portalled, shown on hover when dropdown is closed ── */}
      <Popper
        open={hovered && !open}
        anchorEl={btnRef.current}
        placement="top-end"
        transition
        style={{ zIndex: 9999 }}
        modifiers={[{ name: "offset", options: { offset: [0, 6] } }]}
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={150}>
            <Box
              sx={{
                whiteSpace: "nowrap",
                fontSize: "11px",
                fontWeight: 500,
                color: "white",
                bgcolor: "#1f1d25",
                borderRadius: "8px",
                px: 1.25,
                py: 0.75,
                pointerEvents: "none",
                boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                position: "relative",
                "&::after": {
                  content: '""',
                  position: "absolute",
                  bottom: -7,
                  right: 6,
                  borderWidth: 4,
                  borderStyle: "solid",
                  borderColor: "#1f1d25 transparent transparent transparent",
                },
              }}
            >
              Click to change task owner
            </Box>
          </Fade>
        )}
      </Popper>

      {/* ── Dropdown — portalled ──────────────────────────────────────── */}
      {open && (
        <Portal>
          {/* Backdrop */}
          <Box
            sx={{
              position: "fixed",
              inset: 0,
              zIndex: 9998,
            }}
            onClick={() => setOpen(false)}
          />
        </Portal>
      )}
      <Popper
        open={open}
        anchorEl={btnRef.current}
        placement="bottom-end"
        transition
        style={{ zIndex: 9999 }}
        modifiers={[{ name: "offset", options: { offset: [0, 6] } }]}
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={150}>
            <Paper
              elevation={8}
              sx={{
                borderRadius: "12px",
                border: "1px solid rgba(0,0,0,0.1)",
                minWidth: 192,
                py: 0.5,
                overflow: "hidden",
              }}
            >
              <Typography
                sx={{
                  px: 1.5,
                  pt: 0.75,
                  pb: 0.5,
                  fontSize: "11px",
                  fontWeight: 500,
                  color: "#9C99A9",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                Task Owner
              </Typography>
              <MenuList dense disablePadding>
                {PROJECT_OWNERS.map((o) => (
                  <MenuItem
                    key={o.id}
                    onClick={() => { onChange(o.id); setOpen(false); }}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.25,
                      px: 1.5,
                      py: 1,
                      fontSize: "13px",
                      color: "#1f1d25",
                      "&:hover": { bgcolor: "#F4F5F6" },
                    }}
                  >
                    {o.avatar ? (
                      <Box
                        component="img"
                        src={o.avatar}
                        alt={o.name}
                        sx={{ width: 20, height: 20, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
                      />
                    ) : (
                      <Avatar
                        sx={{
                          width: 20,
                          height: 20,
                          bgcolor: o.color,
                          fontSize: "8px",
                          fontWeight: 600,
                          flexShrink: 0,
                        }}
                      >
                        {o.initials}
                      </Avatar>
                    )}
                    <Box component="span" sx={{ flex: 1, textAlign: "left" }}>
                      {o.name}
                    </Box>
                    {o.id === ownerId && (
                      <CheckIcon
                        sx={{
                          fontSize: 13,
                          color: "var(--brand-accent, #473bab)",
                          flexShrink: 0,
                        }}
                      />
                    )}
                  </MenuItem>
                ))}
              </MenuList>
            </Paper>
          </Fade>
        )}
      </Popper>
    </Box>
  );
}
