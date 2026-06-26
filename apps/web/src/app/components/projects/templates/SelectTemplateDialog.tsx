"use client";

import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import MuiDialog from "@mui/material/Dialog";
import InputBase from "@mui/material/InputBase";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { templateLibrary } from "../lib/mock-data";
import type { Template } from "../lib/mock-data";
import { TemplateCard } from "./TemplateCard";
import { CardViewVertical } from "../ui/CardViewVertical";

// ─── Folder types ─────────────────────────────────────────────────────────────

type ActiveFolder = "recents" | "templates" | null;

// ─── Template grouping ────────────────────────────────────────────────────────

const TEMPLATE_GROUPS = [
  {
    id: "single",
    label: "Single Product",
    filter: (t: Template) => t.products === 1,
  },
  {
    id: "multi",
    label: "Multi Product",
    filter: (t: Template) =>
      t.products > 1 && !t.name.toLowerCase().includes("key"),
  },
  {
    id: "keymessage",
    label: "Key Message",
    filter: (t: Template) =>
      t.products > 1 && t.name.toLowerCase().includes("key"),
  },
  {
    id: "pharma",
    label: "Pharma",
    filter: (t: Template) => t.products === 0,
  },
];

// ─── Props ────────────────────────────────────────────────────────────────────

interface SelectTemplateDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (templates: Template[]) => void;
  /** IDs already in the project — shown as pre-checked and visually distinct. */
  existingTemplateIds?: Set<string>;
}

// ─── Dialog ───────────────────────────────────────────────────────────────────

export function SelectTemplateDialog({
  open,
  onClose,
  onAdd,
  existingTemplateIds = new Set(),
}: SelectTemplateDialogProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [activeFolder, setActiveFolder] = useState<ActiveFolder>("templates");
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (open) {
      setSelectedIds(new Set());
      setActiveFolder("templates");
      setQuery("");
    }
  }, [open]);

  // ── Filtering ──────────────────────────────────────────────────────────────

  const visibleTemplates = templateLibrary.filter((t) => {
    if ((t as any).hidden) return false;
    const matchesQuery =
      !query.trim() ||
      t.name.toLowerCase().includes(query.toLowerCase()) ||
      t.format.toLowerCase().includes(query.toLowerCase()) ||
      t.brand.toLowerCase().includes(query.toLowerCase());
    return matchesQuery;
  });

  function toggleSelect(id: string, checked: boolean) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      checked ? next.add(id) : next.delete(id);
      return next;
    });
  }

  function handleAdd() {
    const selected = templateLibrary.filter(
      (t) => selectedIds.has(t.id) && !existingTemplateIds.has(t.id)
    );
    onAdd(selected);
    onClose();
    setSelectedIds(new Set());
  }

  const newCount = [...selectedIds].filter((id) => !existingTemplateIds.has(id)).length;

  return (
    <MuiDialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      PaperProps={{
        sx: {
          borderRadius: 3,
          width: "calc(100vw - 100px)",
          height: "calc(100vh - 100px)",
          maxWidth: "none",
          maxHeight: "none",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        },
      }}
    >
      {/* ── Dialog header ── */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 3, py: 2 }}>
        <Typography sx={{ fontSize: "1rem", fontWeight: 600, color: "#111827" }}>Select Template</Typography>
        <IconButton size="small" onClick={onClose} sx={{ color: "#9ca3af", "&:hover": { color: "#4b5563" } }}>
          <CloseIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>

      {/* ── Two-panel body ── */}
      <Box sx={{ display: "flex", flex: 1, minHeight: 0, borderTop: "1px solid #F3F4F6" }}>

        {/* ── Left: Folder tree ── */}
        <Box sx={{ width: 280, borderRight: "1px solid #F3F4F6", display: "flex", flexDirection: "column", flexShrink: 0 }}>

          {/* Panel header */}
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 2, py: 1.5 }}>
            <Typography sx={{ fontSize: "0.875rem", fontWeight: 600, color: "#1f2937" }}>Folders</Typography>
            <IconButton size="small" sx={{ color: "#9ca3af", "&:hover": { color: "#4b5563" } }}>
              <CloseIcon sx={{ fontSize: 13 }} />
            </IconButton>
          </Box>

          {/* Search + Add */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, px: 1.5, pb: 1.5 }}>
            <Box sx={{ position: "relative", flex: 1 }}>
              <SearchIcon sx={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", fontSize: 12, color: "#9ca3af" }} />
              <InputBase
                placeholder="Find folder"
                inputProps={{ style: { paddingLeft: 28, paddingRight: 12, paddingTop: 6, paddingBottom: 6, fontSize: "0.75rem" } }}
                sx={{
                  width: "100%",
                  bgcolor: "#F9FAFB",
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 50,
                  fontSize: "0.75rem",
                }}
              />
            </Box>
            <IconButton
              size="small"
              sx={{
                width: 28,
                height: 28,
                bgcolor: "var(--brand-accent, #473bab)",
                color: "#fff",
                borderRadius: 50,
                flexShrink: 0,
                "&:hover": { bgcolor: "var(--brand-accent-hover, #392e8a)" },
              }}
            >
              <AddIcon sx={{ fontSize: 14 }} />
            </IconButton>
          </Box>

          {/* Folder list */}
          <Box sx={{ flex: 1, overflow: "auto", px: 1, py: 0.5 }}>
            <FolderItem
              icon={<ClockIcon />}
              label="Recents"
              active={activeFolder === "recents"}
              onClick={() => setActiveFolder("recents")}
            />
            <FolderItem
              icon={<FolderIcon />}
              label="Background Collections"
              active={false}
              onClick={() => {}}
            />
            <FolderItem
              icon={<BrandKitIcon />}
              label="Brand Kits"
              active={false}
              onClick={() => {}}
            />
            <FolderItem
              icon={<TemplatesIcon />}
              label="Templates"
              count={templateLibrary.length}
              active={activeFolder === "templates" || activeFolder === null}
              onClick={() => setActiveFolder("templates")}
            />

            <Box sx={{ my: 0.5, borderTop: "1px solid #F3F4F6" }} />

            <FolderGroup label="Constellation Motors" count={506} expanded>
              <FolderItem icon={<SubFolderIcon />} label="Assets"      count={19}   indent />
              <FolderItem icon={<SubFolderIcon />} label="Components"  count={271}  indent />
              <FolderItem icon={<SubFolderIcon />} label="Jellybeans"  count={1229} indent />
              <FolderItem icon={<SubFolderIcon />} label="Templates"   count={2}    indent />
            </FolderGroup>

            <FolderGroup label="Constellation Internal" count={506} expanded>
              <FolderItem icon={<SubFolderIcon />} label="Backgrounds"          count={55}  indent />
              <FolderItem icon={<SubFolderIcon />} label="Components"           count={26}  indent />
              <FolderItem icon={<SubFolderIcon />} label="Templates"            count={32}  indent />
              <FolderItem icon={<SubFolderIcon />} label="Uploads"              count={56}  indent />
              <FolderItem icon={<FolderIcon />} label="Copy of Components"       count={271} indent />
              <FolderItem icon={<FolderIcon />} label="Easter special"           count={45}  indent />
              <FolderItem icon={<SubFolderIcon />} label="Autobahn Motorcars"   count={45}  indent />
              <FolderItem icon={<SubFolderIcon />} label="Budds' Imported Cars" count={154} indent />
              <FolderItem icon={<SubFolderIcon />} label="Cole European"        count={45}  indent />
            </FolderGroup>
          </Box>
        </Box>

        {/* ── Right: Content ── */}
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>

          {/* Breadcrumb */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, px: 2.5, pt: 1.5, pb: 0.5 }}>
            <Typography
              sx={{ fontSize: "0.75rem", color: "#9ca3af", cursor: "pointer", "&:hover": { color: "#4b5563" } }}
            >
              Portal
            </Typography>
            <ChevronRightIcon sx={{ fontSize: 11, color: "#d1d5db" }} />
            <Typography sx={{ fontSize: "0.75rem", color: "#4b5563", fontWeight: 500 }}>
              {activeFolder === "recents" ? "Recents" : "Templates"}
            </Typography>
          </Box>

          {/* Toolbar */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, px: 2.5, py: 1 }}>
            <IconButton size="small" sx={{ color: "#9ca3af", "&:hover": { color: "#4b5563" } }}>
              <FolderSvgIcon />
            </IconButton>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
              <Box sx={{
                width: 16,
                height: 16,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "var(--brand-accent, #473bab)",
                color: "#fff",
                fontSize: "0.625rem",
                fontWeight: 600,
                borderRadius: 50,
              }}>
                {activeFolder === "recents" ? "↺" : "4"}
              </Box>
              <Typography sx={{ fontSize: "0.875rem", fontWeight: 600, color: "#111827" }}>
                {activeFolder === "recents" ? "Recents" : "Templates"}
              </Typography>
            </Box>
            <Button
              size="small"
              startIcon={<AddIcon sx={{ fontSize: 12 }} />}
              sx={{
                fontSize: "0.75rem",
                fontWeight: 600,
                color: "#fff",
                bgcolor: "var(--brand-accent, #473bab)",
                borderRadius: 50,
                px: 1.5,
                py: 0.75,
                textTransform: "none",
                ml: 0.5,
                "&:hover": { bgcolor: "var(--brand-accent-hover, #392e8a)" },
              }}
            >
              New
            </Button>
            <IconButton size="small" sx={{ color: "#9ca3af", "&:hover": { color: "#4b5563" } }}>
              <MoreHorizIcon sx={{ fontSize: 15 }} />
            </IconButton>
            <Box sx={{ position: "relative", ml: "auto" }}>
              <SearchIcon sx={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", fontSize: 12, color: "#9ca3af" }} />
              <InputBase
                placeholder="Find below"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                inputProps={{ style: { paddingLeft: 28, paddingRight: 12, paddingTop: 6, paddingBottom: 6, fontSize: "0.75rem", width: 180 } }}
                sx={{
                  bgcolor: "#F9FAFB",
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 50,
                  fontSize: "0.75rem",
                }}
              />
            </Box>
          </Box>

          {/* Filter bar */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, px: 2.5, py: 1, borderBottom: "1px solid #F3F4F6" }}>
            <Typography sx={{ fontSize: "0.75rem", color: "#6b7280" }}>Filtering by</Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, fontSize: "0.75rem", color: "#374151", bgcolor: "#fff", border: "1px solid", borderColor: "divider", borderRadius: 50, px: 1.25, py: 0.25 }}>
              template
              <IconButton size="small" sx={{ ml: 0.25, p: 0, color: "#9ca3af", "&:hover": { color: "#4b5563" } }}>
                <CloseIcon sx={{ fontSize: 10 }} />
              </IconButton>
            </Box>
            <Button
              size="small"
              sx={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--brand-accent, #473bab)", textTransform: "none", p: 0, minWidth: 0, "&:hover": { color: "var(--brand-accent-hover, #392e8a)", bgcolor: "transparent" } }}
            >
              Clear Filters
            </Button>
            <Typography sx={{ ml: "auto", fontSize: "0.75rem", color: "#9ca3af" }}>
              {visibleTemplates.length} / {templateLibrary.length} Items
            </Typography>
            <IconButton size="small" sx={{ ml: 0.5, color: "#9ca3af", "&:hover": { color: "#4b5563" } }}>
              <GridIcon />
            </IconButton>
          </Box>

          {/* Grid — grouped by template type */}
          <Box sx={{ flex: 1, overflow: "auto", p: 2.5 }}>
            {visibleTemplates.length === 0 ? (
              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 160, color: "#9ca3af" }}>
                <Typography sx={{ fontSize: "0.875rem", fontWeight: 500 }}>No templates found</Typography>
              </Box>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {TEMPLATE_GROUPS.map((group) => {
                  const groupTemplates = visibleTemplates.filter(group.filter);
                  if (groupTemplates.length === 0) return null;
                  return (
                    <Box key={group.id}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                        <Typography sx={{ fontSize: "0.75rem", fontWeight: 600, color: "#6b7280" }}>{group.label}</Typography>
                        <Box sx={{ flex: 1, height: 1, bgcolor: "#F3F4F6" }} />
                        <Typography sx={{ fontSize: "0.75rem", color: "#9ca3af" }}>{groupTemplates.length}</Typography>
                      </Box>
                      <CardViewVertical>
                        {groupTemplates.map((template) => (
                          <Box key={template.id} sx={{ position: "relative" }}>
                            {existingTemplateIds.has(template.id) && (
                              <Box sx={{
                                position: "absolute",
                                top: 8,
                                right: 8,
                                zIndex: 10,
                                bgcolor: "var(--brand-accent, #473bab)",
                                color: "#fff",
                                fontSize: "0.625rem",
                                fontWeight: 600,
                                px: 0.75,
                                py: 0.25,
                                borderRadius: 0.5,
                                lineHeight: 1,
                              }}>
                                Added
                              </Box>
                            )}
                            <TemplateCard
                              template={template}
                              selected={selectedIds.has(template.id) || existingTemplateIds.has(template.id)}
                              onSelect={(id, checked) => {
                                if (existingTemplateIds.has(id)) return;
                                toggleSelect(id, checked);
                              }}
                            />
                          </Box>
                        ))}
                      </CardViewVertical>
                    </Box>
                  );
                })}
              </Box>
            )}
          </Box>

          {/* Footer */}
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 1.5, px: 2.5, py: 2, borderTop: "1px solid #F3F4F6", flexShrink: 0 }}>
            {selectedIds.size > 0 && (
              <Typography sx={{ fontSize: "0.75rem", color: "#6b7280", mr: "auto" }}>
                {newCount} template{newCount !== 1 ? "s" : ""} selected
              </Typography>
            )}
            <Button
              onClick={onClose}
              variant="outlined"
              sx={{
                fontSize: "0.875rem",
                fontWeight: 500,
                color: "#374151",
                borderColor: "#d1d5db",
                borderRadius: 50,
                px: 2.5,
                py: 1,
                textTransform: "none",
                "&:hover": { bgcolor: "#F9FAFB" },
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAdd}
              disabled={newCount === 0}
              sx={{
                fontSize: "0.875rem",
                fontWeight: 600,
                color: "#fff",
                bgcolor: "var(--brand-accent, #473bab)",
                borderRadius: 50,
                px: 2.5,
                py: 1,
                textTransform: "none",
                "&:hover": { bgcolor: "var(--brand-accent-hover, #392e8a)" },
                "&.Mui-disabled": { opacity: 0.4, color: "#fff" },
              }}
            >
              {newCount > 0 ? `Add ${newCount} Template${newCount !== 1 ? "s" : ""}` : "Add"}
            </Button>
          </Box>
        </Box>
      </Box>
    </MuiDialog>
  );
}

// ─── Folder item ──────────────────────────────────────────────────────────────

function FolderItem({
  icon, label, count, active = false, indent = false, onClick,
}: {
  icon: React.ReactNode; label: string; count?: number;
  active?: boolean; indent?: boolean; onClick?: () => void;
}) {
  return (
    <Box
      onClick={onClick}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        px: indent ? 3.5 : 1,
        py: 0.75,
        borderRadius: 1.5,
        cursor: "pointer",
        userSelect: "none",
        transition: "background-color 0.15s",
        bgcolor: active ? "rgba(71,59,171,0.08)" : "transparent",
        color: active ? "var(--brand-accent, #473bab)" : "#4b5563",
        fontWeight: active ? 500 : 400,
        "&:hover": { bgcolor: active ? "rgba(71,59,171,0.08)" : "#F9FAFB" },
      }}
    >
      <Box component="span" sx={{ flexShrink: 0, color: "rgba(71,59,171,0.6)" }}>{icon}</Box>
      <Typography sx={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: "0.71875rem", color: "inherit", fontWeight: "inherit" }}>
        {label}
      </Typography>
      {count !== undefined && (
        <Typography sx={{ fontSize: "0.625rem", color: "#9ca3af", flexShrink: 0 }}>({count})</Typography>
      )}
    </Box>
  );
}

// ─── Folder group ─────────────────────────────────────────────────────────────

function FolderGroup({
  label, count, expanded: defaultExpanded = false, indent = false, children,
}: {
  label: string; count?: number; expanded?: boolean; indent?: boolean; children?: React.ReactNode;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  return (
    <Box sx={{ pl: indent ? 2.5 : 0 }}>
      <Box
        onClick={() => setExpanded((v) => !v)}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          px: 1,
          py: 0.75,
          color: "#4b5563",
          cursor: "pointer",
          "&:hover": { bgcolor: "#F9FAFB" },
          borderRadius: 1.5,
          userSelect: "none",
          transition: "background-color 0.15s",
        }}
      >
        {expanded
          ? <ExpandMoreIcon sx={{ fontSize: 12, color: "#9ca3af", flexShrink: 0 }} />
          : <ChevronRightIcon sx={{ fontSize: 12, color: "#9ca3af", flexShrink: 0 }} />}
        <Typography sx={{ fontSize: "0.71875rem", fontWeight: 500, color: "#374151", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
          {label}
        </Typography>
        {count !== undefined && (
          <Typography sx={{ fontSize: "0.625rem", color: "#9ca3af", flexShrink: 0 }}>({count})</Typography>
        )}
      </Box>
      {expanded && <Box>{children}</Box>}
    </Box>
  );
}

// ─── Icons ───────────────────────────────────────────────────────────────────

function ClockIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M8 5v3l2 2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function FolderIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 4.5A1.5 1.5 0 013.5 3H6l1.5 2H13a1.5 1.5 0 011.5 1.5v6A1.5 1.5 0 0113 14H3.5A1.5 1.5 0 012 12.5v-8z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  );
}

function SubFolderIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 4.5A1.5 1.5 0 013.5 3H6l1.5 2H13a1.5 1.5 0 011.5 1.5v6A1.5 1.5 0 0113 14H3.5A1.5 1.5 0 012 12.5v-8z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" opacity="0.5" />
    </svg>
  );
}

function BrandKitIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="8" cy="8" r="2" fill="currentColor" />
    </svg>
  );
}

function TemplatesIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="12" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M2 5.5h12M6 5.5V14" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function FolderSvgIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 4.5A1.5 1.5 0 013.5 3H6l1.5 2H13a1.5 1.5 0 011.5 1.5v6A1.5 1.5 0 0113 14H3.5A1.5 1.5 0 012 12.5v-8z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  );
}

function GridIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3" />
      <rect x="9" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3" />
      <rect x="2" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3" />
      <rect x="9" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}
