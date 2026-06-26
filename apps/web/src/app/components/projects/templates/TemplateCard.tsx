"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import MuiDialog from "@mui/material/Dialog";
import Chip from "@mui/material/Chip";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import CloseIcon from "@mui/icons-material/Close";
import { TemplateWireframe } from "./TemplateWireframe";
import { TemplateZoneEditor } from "./TemplateZoneEditor";
import { AssetCard } from "../ui/AssetCard";
import { useComments } from "../../comments";

interface Template {
  id: string;
  name: string;
  format: string;
  width: number;
  height: number;
  brand: string;
}

interface TemplateCardProps {
  template: Template;
  selected?: boolean;
  onSelect?: (id: string, checked: boolean) => void;
  onDelete?: () => void;
}

function TemplatePreview({
  templateId,
  width,
  height,
  onEdit,
}: {
  templateId: string;
  width: number;
  height: number;
  onEdit: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [side, setSide] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setSide(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const inset = 24;
  const available = Math.max(0, side - inset);
  const scale = available > 0 ? Math.min(available / width, available / height) : 0;

  return (
    <Box
      ref={containerRef}
      sx={{
        width: "100%",
        height: "100%",
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        "&:hover .preview-overlay": { opacity: 1 },
      }}
    >
      {scale > 0 && (
        <>
          <TemplateWireframe templateId={templateId} scale={scale} showText />
          {/* Edit overlay */}
          <Box
            className="preview-overlay"
            sx={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: 0,
              transition: "opacity 0.2s",
              bgcolor: "rgba(0,0,0,0.2)",
            }}
          >
            <Button
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                borderRadius: 1.5,
                bgcolor: "#fff",
                px: 1.5,
                py: 0.75,
                fontSize: "0.75rem",
                fontWeight: 600,
                color: "#1f2937",
                textTransform: "none",
                "&:hover": { bgcolor: "#f0f2f4" },
                boxShadow: 1,
              }}
            >
              <EditOutlinedIcon sx={{ fontSize: 13 }} />
              Edit zones
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
}

// ─── Template Preview Modal ────────────────────────────────────────────────────

function TemplatePreviewModal({
  template,
  onClose,
  onEditZones,
}: {
  template: Template;
  onClose: () => void;
  onEditZones: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      const { width, height } = el.getBoundingClientRect();
      const padding = 48;
      const s = Math.min(
        (width  - padding) / template.width,
        (height - padding) / template.height,
      );
      setScale(Math.max(0, s));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [template.width, template.height]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return createPortal(
    <Box sx={{ position: "fixed", inset: 0, zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center", p: 3 }}>
      {/* Backdrop */}
      <Box
        sx={{ position: "absolute", inset: 0, bgcolor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
        onClick={onClose}
      />

      {/* Card */}
      <Box sx={{
        position: "relative",
        bgcolor: "#fff",
        borderRadius: 2,
        boxShadow: 24,
        display: "flex",
        flexDirection: "column",
        width: "100%",
        maxWidth: 860,
        maxHeight: "90vh",
        overflow: "hidden",
      }}>

        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 3, py: 2, borderBottom: "1px solid #E8E6F0", flexShrink: 0 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
            <Box sx={{ width: 32, height: 32, borderRadius: 1, bgcolor: "#f0f2f4", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <VisibilityOutlinedIcon sx={{ fontSize: 14, color: "#686576" }} />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontSize: "0.875rem", fontWeight: 500, color: "#1f1d25", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {template.name}
              </Typography>
              <Typography sx={{ fontSize: "0.6875rem", color: "#9c99a9" }}>
                {template.format} · {template.width}×{template.height} · {template.brand}
              </Typography>
            </Box>
          </Box>
          <IconButton
            onClick={onClose}
            size="small"
            sx={{ ml: 2, flexShrink: 0, "&:hover": { bgcolor: "#F3F4F6" } }}
          >
            <CloseIcon sx={{ fontSize: 18, color: "#686576" }} />
          </IconButton>
        </Box>

        {/* Preview area */}
        <Box
          ref={containerRef}
          sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "#f0f2f4", overflow: "hidden", minHeight: 320 }}
        >
          {scale > 0 && (
            <TemplateWireframe templateId={template.id} scale={scale} showText />
          )}
        </Box>

        {/* Footer */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 1.5, px: 3, py: 2, borderTop: "1px solid #E8E6F0", flexShrink: 0, bgcolor: "#fff" }}>
          <Button
            onClick={onClose}
            sx={{
              px: 2,
              py: 0.875,
              borderRadius: 50,
              fontSize: "0.8125rem",
              fontWeight: 500,
              color: "#686576",
              textTransform: "none",
              "&:hover": { bgcolor: "#f0f2f4" },
            }}
          >
            Close
          </Button>
          <Button
            onClick={() => { onClose(); onEditZones(); }}
            startIcon={<EditOutlinedIcon sx={{ fontSize: 12 }} />}
            sx={{
              px: 2,
              py: 0.875,
              borderRadius: 50,
              fontSize: "0.8125rem",
              fontWeight: 500,
              bgcolor: "#473bab",
              color: "#fff",
              textTransform: "none",
              "&:hover": { bgcolor: "#392e8a" },
              boxShadow: 1,
            }}
          >
            Edit zones
          </Button>
        </Box>
      </Box>
    </Box>,
    document.body,
  );
}

// ─── Template Card ─────────────────────────────────────────────────────────────

export function TemplateCard({ template, selected = false, onSelect, onDelete }: TemplateCardProps) {
  const [editorOpen, setEditorOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const commentsCtx = useComments();

  const handleMenuOpen = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    setMenuAnchor(e.currentTarget);
  };
  const handleMenuClose = () => setMenuAnchor(null);

  return (
    <>
      <AssetCard
        selected={selected}
        onSelect={(checked) => onSelect?.(template.id, checked)}
        menuButton={
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            {commentsCtx && (
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  commentsCtx.openPanelForEntity({ id: template.id, label: template.name, type: "template" });
                }}
                title="Comment on this template"
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: 1,
                  bgcolor: "rgba(255,255,255,0.8)",
                  color: "#6b7280",
                  "&:hover": { bgcolor: "#fff", color: "#374151" },
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
              </IconButton>
            )}
            <IconButton
              size="small"
              onClick={handleMenuOpen}
              sx={{
                width: 24,
                height: 24,
                borderRadius: 1,
                bgcolor: "rgba(255,255,255,0.8)",
                color: "#6b7280",
                "&:hover": { bgcolor: "#fff", color: "#374151" },
              }}
            >
              <MoreHorizIcon sx={{ fontSize: 14 }} />
            </IconButton>
            <Menu
              anchorEl={menuAnchor}
              open={Boolean(menuAnchor)}
              onClose={handleMenuClose}
              onClick={(e) => e.stopPropagation()}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
              slotProps={{
                paper: {
                  sx: {
                    borderRadius: 2,
                    boxShadow: "0 10px 40px rgba(0,0,0,0.12)",
                    border: "1px solid rgba(0,0,0,0.08)",
                    p: 0.5,
                    minWidth: 180,
                  },
                },
              }}
            >
              <MenuItem
                onClick={(e) => { e.stopPropagation(); handleMenuClose(); setPreviewOpen(true); }}
                sx={{ borderRadius: 1.5, fontSize: "0.8125rem", color: "#1f1d25", gap: 1, "&:hover": { bgcolor: "#F9FAFB" } }}
              >
                <VisibilityOutlinedIcon sx={{ fontSize: 13, color: "#9ca3af" }} />
                Preview
              </MenuItem>
              <MenuItem
                onClick={(e) => { e.stopPropagation(); handleMenuClose(); setEditorOpen(true); }}
                sx={{ borderRadius: 1.5, fontSize: "0.8125rem", color: "#1f1d25", gap: 1, "&:hover": { bgcolor: "#F9FAFB" } }}
              >
                <EditOutlinedIcon sx={{ fontSize: 13, color: "#9ca3af" }} />
                Edit zones
              </MenuItem>
              {onDelete && (
                <MenuItem
                  onClick={(e) => { e.stopPropagation(); handleMenuClose(); onDelete(); }}
                  sx={{ borderRadius: 1.5, fontSize: "0.8125rem", color: "#D2323F", gap: 1, "&:hover": { bgcolor: "#FEF2F2" } }}
                >
                  <DeleteOutlineIcon sx={{ fontSize: 13, color: "#D2323F" }} />
                  Remove from project
                </MenuItem>
              )}
            </Menu>
          </Box>
        }
        preview={
          <TemplatePreview
            templateId={template.id}
            width={template.width}
            height={template.height}
            onEdit={() => setEditorOpen(true)}
          />
        }
        footer={
          <>
            <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 0.5, minWidth: 0 }}>
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontSize: "0.8125rem", fontWeight: 500, color: "#111827", lineHeight: 1.4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {template.name}
                </Typography>
                <Typography sx={{ fontSize: "0.6875rem", color: "#6b7280", mt: 0.25 }}>
                  {template.format} · {template.width}×{template.height}
                </Typography>
              </Box>
              <IconButton
                size="small"
                onClick={(e) => { e.stopPropagation(); setEditorOpen(true); }}
                title="Edit zone layout"
                sx={{ flexShrink: 0, mt: 0.25, color: "#d1d5db", "&:hover": { color: "var(--brand-accent, #473bab)" } }}
              >
                <EditOutlinedIcon sx={{ fontSize: 12 }} />
              </IconButton>
            </Box>
            <Box sx={{ mt: 1 }}>
              <Chip
                label={template.brand}
                size="small"
                sx={{ fontSize: "0.6875rem", color: "#4b5563", bgcolor: "#f0f2f4", height: 20, borderRadius: 0.5 }}
              />
            </Box>
          </>
        }
      />

      {previewOpen && (
        <TemplatePreviewModal
          template={template}
          onClose={() => setPreviewOpen(false)}
          onEditZones={() => setEditorOpen(true)}
        />
      )}

      {editorOpen && (
        <TemplateZoneEditor
          templateId={template.id}
          templateName={template.name}
          onClose={() => setEditorOpen(false)}
        />
      )}
    </>
  );
}
