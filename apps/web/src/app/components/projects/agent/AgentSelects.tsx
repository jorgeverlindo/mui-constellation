"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Select,
  MenuItem,
  InputBase,
  Paper,
  Collapse,
  IconButton,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CheckIcon from "@mui/icons-material/Check";
import AddIcon from "@mui/icons-material/Add";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

// ─── Confirmed chip ────────────────────────────────────────────────────────────
export function ConfirmedChip({ label }: { label: string }) {
  return (
    <Box
      component="span"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        px: "10px",
        py: "4px",
        borderRadius: "999px",
        background: "rgba(35,150,90,0.08)",
        border: "1px solid rgba(35,150,90,0.28)",
        color: "#1e7a48",
      }}
    >
      <Box
        sx={{
          width: 16,
          height: 16,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          background: "#2e9c5e",
        }}
      >
        <CheckIcon sx={{ fontSize: 9, color: "white", strokeWidth: 3 }} />
      </Box>
      <Typography component="span" sx={{ fontSize: 12, fontWeight: 500, letterSpacing: "0.17px" }}>
        {label}
      </Typography>
    </Box>
  );
}

// ─── Shared custom select (replaces native <select>) ─────────────────────────

/** Standard select — shows current value, opens custom dropdown menu. */
export function AgentSelect({
  value, onChange, options, placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
}) {
  return (
    <Select
      value={value}
      onChange={e => onChange(e.target.value as string)}
      displayEmpty
      input={<InputBase />}
      renderValue={selected =>
        selected
          ? (options.find(o => o.value === selected)?.label ?? selected)
          : (placeholder ?? "Select")
      }
      sx={{
        width: "100%",
        "& .MuiInputBase-root": {
          width: "100%",
          display: "flex",
          alignItems: "center",
          px: "10px",
          py: "7px",
          borderRadius: "8px",
          fontSize: 12,
          border: "1px solid rgba(0,0,0,0.12)",
          background: "#fafafb",
          cursor: "pointer",
          transition: "all 0.15s",
          "&:hover": { borderColor: "#b0b0b5" },
          "&.Mui-focused": {
            borderColor: "var(--brand-accent)",
            boxShadow: "0 0 0 1px rgba(71,59,171,0.15)",
          },
        },
        "& .MuiSelect-icon": {
          color: "var(--ink-tertiary)",
          fontSize: 14,
        },
      }}
      MenuProps={{
        PaperProps: {
          sx: {
            mt: "4px",
            borderRadius: "12px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.14)",
            border: "1px solid rgba(0,0,0,0.1)",
            p: "4px",
          },
        },
      }}
    >
      {options.map(o => (
        <MenuItem
          key={o.value}
          value={o.value}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            px: "10px",
            py: "6px",
            borderRadius: "8px",
            fontSize: 12,
            color: "var(--ink)",
            "&:hover": { background: "#f5f4f8" },
            "&.Mui-selected": { background: "transparent" },
            "&.Mui-selected:hover": { background: "#f5f4f8" },
          }}
        >
          <Box sx={{ flex: 1 }}>{o.label}</Box>
          {o.value === value && (
            <CheckIcon sx={{ fontSize: 11, color: "var(--brand-accent)", flexShrink: 0 }} />
          )}
        </MenuItem>
      ))}
    </Select>
  );
}

/** "Add another" variant — dashed border, Plus icon, searchable inline dropdown. */
export function AgentAddSelect({
  onAdd, options, placeholder,
}: {
  onAdd: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
}) {
  const [open, setOpen]   = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef     = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 0);
    else setQuery("");
  }, [open]);

  if (options.length === 0) return null;

  const q        = query.trim().toLowerCase();
  const filtered = q ? options.filter(o => o.label.toLowerCase().includes(q)) : options;

  return (
    <Box ref={containerRef} sx={{ position: "relative", mt: "2px" }}>
      <Box
        component="button"
        onClick={() => setOpen(v => !v)}
        sx={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          px: "10px",
          py: "6px",
          borderRadius: "8px",
          fontSize: 11,
          color: "var(--brand-accent)",
          border: "1px dashed rgba(71,59,171,0.35)",
          background: "transparent",
          cursor: "pointer",
          transition: "background 0.15s",
          "&:hover": { background: "rgba(71,59,171,0.04)" },
        }}
      >
        <AddIcon sx={{ fontSize: 10, flexShrink: 0 }} />
        <Box component="span" sx={{ flex: 1, textAlign: "left" }}>
          {placeholder ?? "Add another…"}
        </Box>
        <ExpandMoreIcon
          sx={{
            fontSize: 9,
            flexShrink: 0,
            opacity: 0.6,
            transition: "transform 0.15s",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </Box>

      <Collapse in={open}>
        <Paper
          elevation={0}
          sx={{
            position: "absolute",
            zIndex: 500,
            left: 0,
            right: 0,
            mt: "4px",
            borderRadius: "12px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.14)",
            border: "1px solid rgba(0,0,0,0.1)",
            overflow: "hidden",
          }}
        >
          <Box sx={{ p: "6px", borderBottom: "1px solid rgba(0,0,0,0.07)" }}>
            <InputBase
              inputRef={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search…"
              sx={{
                width: "100%",
                px: "8px",
                py: "5px",
                borderRadius: "6px",
                fontSize: 11.5,
                background: "#f5f4f8",
                color: "var(--ink)",
              }}
            />
          </Box>
          <Box sx={{ maxHeight: 200, overflowY: "auto", p: "4px" }}>
            {filtered.length === 0 ? (
              <Typography sx={{ px: "10px", py: "8px", fontSize: 11, color: "var(--ink-tertiary)" }}>
                No results
              </Typography>
            ) : filtered.map(o => (
              <Box
                key={o.value}
                component="button"
                onClick={() => { onAdd(o.value); setOpen(false); setQuery(""); }}
                sx={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  px: "10px",
                  py: "6px",
                  borderRadius: "8px",
                  fontSize: 11.5,
                  cursor: "pointer",
                  color: "var(--ink)",
                  textAlign: "left",
                  background: "transparent",
                  border: "none",
                  transition: "background 0.15s",
                  "&:hover": { background: "#f5f4f8" },
                }}
              >
                {o.label}
              </Box>
            ))}
          </Box>
        </Paper>
      </Collapse>
    </Box>
  );
}

// ─── "Why these?" expandable rationale box ────────────────────────────────────
function WhyTrigger({ open, onClick }: { open: boolean; onClick: () => void }) {
  return (
    <Box
      component="button"
      onClick={onClick}
      sx={{
        display: "flex",
        alignItems: "center",
        cursor: "pointer",
        gap: "8px",
        p: "4px 5px 0 16px",
        borderRadius: "100px",
        background: "none",
        border: "none",
        transition: "opacity 0.15s",
        "&:hover": { opacity: 0.75 },
      }}
    >
      {/* ⓘ circle-info icon */}
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ flexShrink: 0 }}>
        <circle cx="9" cy="9" r="7" stroke="#473BAB" strokeWidth="1.5"/>
        <path d="M9 8.5v4" stroke="#473BAB" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="9" cy="6.5" r="0.8" fill="#473BAB"/>
      </svg>
      <Typography
        component="span"
        sx={{ fontSize: 13, fontWeight: 500, color: "#473BAB", letterSpacing: "0.46px", lineHeight: "22px" }}
      >
        Why these?
      </Typography>
      {/* Chevron right — rotates to down when open */}
      <Box
        component="svg"
        width="18" height="18" viewBox="0 0 18 18" fill="none"
        sx={{
          transition: "transform 0.22s cubic-bezier(0.25,0.1,0.25,1)",
          transform: open ? "rotate(90deg)" : "rotate(0deg)",
        }}
      >
        <path d="M7 6.5l3.5 3-3.5 3" stroke="#473BAB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </Box>
    </Box>
  );
}

export function WhyThese({ content }: { content: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <Box sx={{ mt: "6px" }}>
      {/* Collapsed — just the trigger button */}
      {!open && <WhyTrigger open={false} onClick={() => setOpen(true)} />}

      {/* Expanded — card wrapping trigger + content */}
      <Collapse in={open}>
        <Box
          sx={{
            background: "rgb(250,250,255)",
            border: "1px solid #6356e1",
            borderRadius: "14px",
            pt: "8px",
            pr: "16px",
            pb: "16px",
            pl: 0,
          }}
        >
          <WhyTrigger open={true} onClick={() => setOpen(false)} />
          <Box
            sx={{
              pl: "17px",
              pt: "8px",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            {content}
          </Box>
        </Box>
      </Collapse>
    </Box>
  );
}
