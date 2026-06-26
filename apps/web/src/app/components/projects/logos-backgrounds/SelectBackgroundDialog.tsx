"use client";

import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import ButtonBase from "@mui/material/ButtonBase";
import IconButton from "@mui/material/IconButton";
import Dialog from "@mui/material/Dialog";
import InputBase from "@mui/material/InputBase";
import Divider from "@mui/material/Divider";
import Chip from "@mui/material/Chip";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import FolderIcon from "@mui/icons-material/Folder";
import LayoutGridIcon from "@mui/icons-material/GridView";
import { backgroundCollections, templates } from "../lib/mock-data";
import { matchesLifestyle, matchesMultiLifestyle } from "../lib/lifestyle-data";
import { BackgroundCollectionCard, BackgroundCollection } from "./BackgroundCollectionCard";
import { CardViewVertical } from "../ui/CardViewVertical";

interface SelectBackgroundDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (collections: BackgroundCollection[]) => void;
  /** Which folder to open on. null = show all (offer/template context). */
  initialFolder?: "recents" | "background-collections" | null;
  /** Pre-select a size filter chip when the dialog opens. null = "All Sizes". */
  initialSizeFilter?: string | null;
  /** Single-offer context: model+trim string (e.g. "CR-V TrailSport AWD") */
  vehicleFilter?: string;
  /** Combo context: array of model+trim strings for each slot */
  vehicleFilters?: string[];
}

export function SelectBackgroundDialog({
  open,
  onClose,
  onAdd,
  initialFolder = null,
  initialSizeFilter = null,
  vehicleFilter,
  vehicleFilters,
}: SelectBackgroundDialogProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [activeFolder, setActiveFolder] = useState<"recents" | "background-collections" | null>(initialFolder ?? null);

  useEffect(() => {
    if (open) {
      setSelectedIds(new Set());
      setActiveFolder(initialFolder ?? null);
    }
  }, [open, initialFolder]);

  // ── Filtering ──────────────────────────────────────────────────────────────
  const allLifestyle = backgroundCollections.filter((c) => c.isLifestyle);
  const allRegular   = backgroundCollections.filter((c) => !c.isLifestyle);

  const isComboContext      = !!(vehicleFilters?.length);
  const isSingleOfferContext = vehicleFilter !== undefined;

  const lifestyleVisible = allLifestyle.filter((c) => {
    const isMultiVehicle = !!(c.vehicleTags?.length);
    if (isComboContext) {
      if (!isMultiVehicle) return false;
      return matchesMultiLifestyle(c, vehicleFilters!);
    }
    if (isSingleOfferContext) {
      if (isMultiVehicle) return false;
      return matchesLifestyle(c, vehicleFilter!);
    }
    return true;
  });
  const regularVisible = allRegular;
  const totalVisible   = lifestyleVisible.length + regularVisible.length;

  function toggleSelect(id: string, checked: boolean) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      checked ? next.add(id) : next.delete(id);
      return next;
    });
  }

  function handleAdd() {
    const selected = [...lifestyleVisible, ...regularVisible].filter((c) => selectedIds.has(c.id));
    onAdd(selected);
    onClose();
    setSelectedIds(new Set());
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen
      slotProps={{
        paper: {
          sx: {
            m: "50px",
            borderRadius: 3,
            height: "calc(100% - 100px)",
            width: "calc(100% - 100px)",
            maxWidth: "none",
            overflow: "hidden",
          },
        },
      }}
    >
      {/* ── Dialog header ── */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 3,
          py: 2,
        }}
      >
        <Typography sx={{ fontSize: "1rem", fontWeight: 600 }}>Select Background</Typography>
        <IconButton onClick={onClose} size="small" sx={{ color: "text.secondary" }}>
          <CloseIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>

      {/* ── Two-panel body ── */}
      <Box
        sx={{
          display: "flex",
          flex: 1,
          minHeight: 0,
          borderTop: "1px solid",
          borderColor: "divider",
        }}
      >
        {/* ── Left: Folder tree ── */}
        <Box
          sx={{
            width: 280,
            borderRight: "1px solid",
            borderColor: "divider",
            display: "flex",
            flexDirection: "column",
            flexShrink: 0,
          }}
        >
          {/* Panel header */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              px: 2,
              py: 1.5,
            }}
          >
            <Typography sx={{ fontSize: "0.875rem", fontWeight: 600, color: "#1F2937" }}>
              Folders
            </Typography>
            <IconButton size="small" sx={{ color: "text.secondary" }}>
              <CloseIcon sx={{ fontSize: 13 }} />
            </IconButton>
          </Box>

          {/* Search + Add */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, px: 1.5, pb: 1.5 }}>
            <Box
              sx={{
                position: "relative",
                flex: 1,
                bgcolor: "#F9FAFB",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: "9999px",
                display: "flex",
                alignItems: "center",
                pl: 1.5,
                pr: 1,
                py: 0.5,
              }}
            >
              <SearchIcon sx={{ fontSize: 12, color: "text.secondary", flexShrink: 0, mr: 0.5 }} />
              <InputBase placeholder="Find folder" sx={{ fontSize: "0.75rem", flex: 1 }} />
            </Box>
            <Box
              sx={{
                width: 28,
                height: 28,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "#473bab",
                color: "#fff",
                borderRadius: "50%",
                cursor: "pointer",
                flexShrink: 0,
                "&:hover": { bgcolor: 'primary.dark' },
              }}
            >
              <AddIcon sx={{ fontSize: 14 }} />
            </Box>
          </Box>

          {/* Folder list */}
          <Box sx={{ flex: 1, overflow: "auto", px: 1, py: 0.5 }}>
            <FolderItem
              icon={<ClockIcon />}
              label="Recents"
              active={activeFolder === "recents" || activeFolder === null}
              onClick={() => setActiveFolder("recents")}
            />
            <FolderItem
              icon={<FolderIcon sx={{ fontSize: 13, color: "rgba(71,59,171,0.6)" }} />}
              label="Background Collections"
              active={activeFolder === "background-collections"}
              onClick={() => setActiveFolder("background-collections")}
            />
            <FolderGroup label="Brand Kits" icon={<BrandKitIcon />} />

            <Divider sx={{ my: 0.5 }} />

            <FolderGroup label="Constellation Motors" count={506} expanded>
              <FolderItem icon={<FolderIcon sx={{ fontSize: 13, color: "rgba(71,59,171,0.6)" }} />} label="Assets" count={19} indent />
              <FolderItem icon={<FolderIcon sx={{ fontSize: 13, color: "rgba(71,59,171,0.6)" }} />} label="Components" count={271} indent />
              <FolderItem icon={<FolderIcon sx={{ fontSize: 13, color: "rgba(71,59,171,0.6)" }} />} label="Jellybeans" count={1229} indent />
              <FolderItem icon={<FolderIcon sx={{ fontSize: 13, color: "rgba(71,59,171,0.6)" }} />} label="Templates" count={2} indent />
            </FolderGroup>

            <FolderGroup label="Constellation Internal" count={506} expanded>
              <FolderItem icon={<FolderIcon sx={{ fontSize: 13, color: "rgba(71,59,171,0.6)" }} />} label="Backgrounds" count={55} indent />
              <FolderItem icon={<FolderIcon sx={{ fontSize: 13, color: "rgba(71,59,171,0.6)" }} />} label="Components" count={26} indent />
              <FolderItem icon={<FolderIcon sx={{ fontSize: 13, color: "rgba(71,59,171,0.6)" }} />} label="Templates" count={32} indent />
              <FolderItem icon={<FolderIcon sx={{ fontSize: 13, color: "rgba(71,59,171,0.6)" }} />} label="Uploads" count={56} indent />
            </FolderGroup>
          </Box>
        </Box>

        {/* ── Right: Content ── */}
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          {/* Breadcrumb */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, px: 2.5, pt: 1.5, pb: 0.5 }}>
            <Typography
              sx={{ fontSize: "0.75rem", color: "text.secondary", cursor: "pointer", "&:hover": { color: "text.primary" } }}
            >
              Portal
            </Typography>
            <ChevronRightIcon sx={{ fontSize: 11, color: "text.disabled" }} />
            <Typography sx={{ fontSize: "0.75rem", color: "text.primary", fontWeight: 500 }}>
              {activeFolder === "background-collections" ? "Background Collections" : "Recents"}
            </Typography>
          </Box>

          {/* Toolbar */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, px: 2.5, py: 1 }}>
            <IconButton size="small" sx={{ color: "text.secondary" }}>
              <FolderIcon sx={{ fontSize: 15 }} />
            </IconButton>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
              <Box
                sx={{
                  width: 16,
                  height: 16,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: "#473bab",
                  color: "#fff",
                  fontSize: "10px",
                  fontWeight: 600,
                  borderRadius: "50%",
                }}
              >
                1
              </Box>
              <Typography sx={{ fontSize: "0.875rem", fontWeight: 600 }}>
                {activeFolder === "background-collections" ? "Background Collections" : "Recents"}
              </Typography>
            </Box>
            <Button
              size="small"
              startIcon={<AddIcon sx={{ fontSize: 12 }} />}
              sx={{
                fontSize: "0.75rem",
                fontWeight: 600,
                bgcolor: "#473bab",
                color: "#fff",
                borderRadius: "9999px",
                px: 1.5,
                py: 0.75,
                ml: 0.5,
                "&:hover": { bgcolor: 'primary.dark' },
              }}
            >
              New
            </Button>
            <IconButton size="small" sx={{ color: "text.secondary" }}>
              <MoreHorizIcon sx={{ fontSize: 15 }} />
            </IconButton>
            <Box
              sx={{
                position: "relative",
                ml: "auto",
                bgcolor: "#F9FAFB",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: "9999px",
                display: "flex",
                alignItems: "center",
                pl: 1.5,
                pr: 1,
                py: 0.5,
                width: 208,
              }}
            >
              <SearchIcon sx={{ fontSize: 12, color: "text.secondary", flexShrink: 0, mr: 0.5 }} />
              <InputBase placeholder="Find below" sx={{ fontSize: "0.75rem", flex: 1 }} />
            </Box>
          </Box>

          {/* Filter bar */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              px: 2.5,
              py: 1,
              borderBottom: "1px solid",
              borderColor: "divider",
            }}
          >
            <Typography sx={{ fontSize: "0.75rem", color: "text.secondary" }}>Filtering by</Typography>
            <Chip
              label="background"
              size="small"
              onDelete={() => {}}
              deleteIcon={<CloseIcon sx={{ fontSize: 10 }} />}
              sx={{ fontSize: "0.75rem", height: 22 }}
            />
            <ButtonBase
              sx={{
                fontSize: "0.75rem",
                color: "#473bab",
                fontWeight: 600,
                "&:hover": { color: 'primary.dark' },
              }}
            >
              Clear Filters
            </ButtonBase>
            <Typography sx={{ ml: "auto", fontSize: "0.75rem", color: "text.secondary" }}>
              {totalVisible} / {backgroundCollections.length} Items
            </Typography>
            <IconButton size="small" sx={{ color: "text.secondary", ml: 0.5 }}>
              <LayoutGridIcon sx={{ fontSize: 14 }} />
            </IconButton>
          </Box>

          {/* Info bar — only in Recents */}
          {activeFolder !== "background-collections" && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                px: 2.5,
                py: 1,
                bgcolor: "#EFF6FF",
                borderBottom: "1px solid #BFDBFE",
              }}
            >
              <Box
                sx={{
                  width: 16,
                  height: 16,
                  borderRadius: "50%",
                  border: "1px solid #60A5FA",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Typography sx={{ fontSize: "9px", color: "#3B82F6", fontWeight: 700, lineHeight: 1 }}>
                  i
                </Typography>
              </Box>
              <Typography sx={{ fontSize: "0.75rem", color: "#1D4ED8" }}>
                You're viewing recent assets across all folders.
              </Typography>
              <ButtonBase
                sx={{
                  fontSize: "0.75rem",
                  color: "#1D4ED8",
                  fontWeight: 600,
                  ml: "2px",
                  "&:hover": { color: "#1E3A8A" },
                }}
              >
                Show folders
              </ButtonBase>
            </Box>
          )}

          {/* Grid */}
          <Box sx={{ flex: 1, overflow: "auto", p: 2.5 }}>
            {(() => {
              const showLifestyle = activeFolder !== "background-collections";
              const showRegular   = activeFolder !== "recents";
              const visibleItems  = [
                ...(showLifestyle ? lifestyleVisible : []),
                ...(showRegular   ? regularVisible   : []),
              ];

              if (visibleItems.length === 0) {
                return (
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      height: 160,
                      color: "text.secondary",
                    }}
                  >
                    <Typography sx={{ fontSize: "0.875rem", fontWeight: 500 }}>
                      No items in this folder
                    </Typography>
                  </Box>
                );
              }

              return (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  {/* Lifestyle Images */}
                  {showLifestyle && lifestyleVisible.length > 0 && (
                    <Box>
                      {showRegular && regularVisible.length > 0 && (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                          <Typography sx={{ fontSize: "0.75rem", fontWeight: 600, color: "#6D28D9" }}>
                            Lifestyle Images
                          </Typography>
                          {vehicleFilter && (
                            <Chip
                              label={vehicleFilter}
                              size="small"
                              sx={{ fontSize: "10px", height: 20, bgcolor: "#EDE9FE", color: "#7C3AED" }}
                            />
                          )}
                          {isComboContext && vehicleFilters!.map((vf, i) => (
                            <Chip
                              key={i}
                              label={vf}
                              size="small"
                              sx={{ fontSize: "10px", height: 20, bgcolor: "#EDE9FE", color: "#7C3AED" }}
                            />
                          ))}
                          <Box sx={{ flex: 1, height: "1px", bgcolor: "#EDE9FE" }} />
                        </Box>
                      )}
                      <CardViewVertical>
                        {lifestyleVisible.map((collection) => (
                          <BackgroundCollectionCard
                            key={collection.id}
                            collection={collection}
                            selected={selectedIds.has(collection.id)}
                            onSelect={toggleSelect}
                          />
                        ))}
                      </CardViewVertical>
                    </Box>
                  )}

                  {/* Background Collections */}
                  {showRegular && regularVisible.length > 0 && (
                    <Box>
                      {showLifestyle && lifestyleVisible.length > 0 && (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                          <Typography sx={{ fontSize: "0.75rem", fontWeight: 600, color: "text.secondary" }}>
                            Background Collections
                          </Typography>
                          <Box sx={{ flex: 1, height: "1px", bgcolor: "#F3F4F6" }} />
                        </Box>
                      )}
                      <CardViewVertical>
                        {regularVisible.map((collection) => (
                          <BackgroundCollectionCard
                            key={collection.id}
                            collection={collection}
                            selected={selectedIds.has(collection.id)}
                            onSelect={toggleSelect}
                          />
                        ))}
                      </CardViewVertical>
                    </Box>
                  )}
                </Box>
              );
            })()}
          </Box>

          {/* Footer */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: 1.5,
              px: 2.5,
              py: 2,
              borderTop: "1px solid",
              borderColor: "divider",
            }}
          >
            <Button
              onClick={onClose}
              variant="outlined"
              sx={{
                fontSize: "0.875rem",
                fontWeight: 500,
                color: "#374151",
                borderColor: "#D1D5DB",
                borderRadius: "9999px",
                px: 2.5,
                py: 1,
                "&:hover": { bgcolor: "#F9FAFB" },
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAdd}
              disabled={selectedIds.size === 0}
              variant="contained"
              sx={{
                fontSize: "0.875rem",
                fontWeight: 600,
                bgcolor: "#473bab",
                borderRadius: "9999px",
                px: 3,
                py: 1,
                "&:hover": { bgcolor: 'primary.dark' },
                "&:disabled": { opacity: 0.4, cursor: "not-allowed" },
              }}
            >
              Add
            </Button>
          </Box>
        </Box>
      </Box>
    </Dialog>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ClockIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(71,59,171,0.6)" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function FolderItem({
  icon,
  label,
  count,
  active = false,
  indent = false,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  count?: number;
  active?: boolean;
  indent?: boolean;
  onClick?: () => void;
}) {
  return (
    <ButtonBase
      onClick={onClick}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        px: 1,
        py: 0.75,
        borderRadius: 1.5,
        cursor: "pointer",
        width: "100%",
        justifyContent: "flex-start",
        transition: "background 0.15s",
        ...(active
          ? { bgcolor: "rgba(71,59,171,0.08)", color: "#473bab", fontWeight: 500 }
          : { color: "#4B5563", "&:hover": { bgcolor: "#F9FAFB" } }),
        ...(indent ? { pl: 3.5 } : {}),
      }}
    >
      <Box component="span" sx={{ flexShrink: 0, color: "rgba(71,59,171,0.6)" }}>
        {icon}
      </Box>
      <Typography
        component="span"
        sx={{
          flex: 1,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          fontSize: "11.5px",
        }}
      >
        {label}
      </Typography>
      {count !== undefined && (
        <Typography component="span" sx={{ fontSize: "10px", color: "text.secondary", flexShrink: 0 }}>
          ({count})
        </Typography>
      )}
    </ButtonBase>
  );
}

function FolderGroup({
  label,
  count,
  expanded = false,
  indent = false,
  icon,
  children,
}: {
  label: string;
  count?: number;
  expanded?: boolean;
  indent?: boolean;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          px: 1,
          py: 0.75,
          color: "#4B5563",
          cursor: "pointer",
          borderRadius: 1.5,
          transition: "background 0.15s",
          "&:hover": { bgcolor: "#F9FAFB" },
          ...(indent ? { pl: 3.5 } : {}),
        }}
      >
        {expanded
          ? <ExpandMoreIcon sx={{ fontSize: 12, color: "text.secondary", flexShrink: 0 }} />
          : <ChevronRightIcon sx={{ fontSize: 12, color: "text.secondary", flexShrink: 0 }} />}
        <Box component="span" sx={{ flexShrink: 0, color: "text.secondary" }}>
          {icon ?? <FolderIcon sx={{ fontSize: 13, color: "rgba(71,59,171,0.6)" }} />}
        </Box>
        <Typography sx={{ flex: 1, fontSize: "11.5px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {label}
        </Typography>
        {count !== undefined && (
          <Typography sx={{ fontSize: "10px", color: "text.secondary", flexShrink: 0 }}>
            ({count})
          </Typography>
        )}
      </Box>
      {expanded && children && <Box>{children}</Box>}
    </Box>
  );
}

function BrandKitIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.07 4.93a10 10 0 010 14.14M4.93 4.93a10 10 0 000 14.14" />
    </svg>
  );
}
