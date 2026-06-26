"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { SubsectionActions } from "./SubsectionActions";
import type { BackgroundCollection } from "./BackgroundCollectionCard";
import type { Template } from "../lib/mock-data";
import type { DataRow } from "../lib/project-store";
import { useProjectStore } from "../lib/project-store";
import { PharmaAdTemplate } from "../templates/AdTemplate";
import { thumbnailScale } from "../lib/thumbnail-scale";
import { getSquareThumbnail } from "../lib/bg-thumbnail";

interface DataRowAccordionProps {
  row: DataRow;
  rowIndex: number;
  backgrounds: BackgroundCollection[];
  templates: Template[];
  open: boolean;
  onToggle: () => void;
  onAddBackground: (templateId: string) => void;
  onAddAll: () => void;
  /** Project ID — forwarded to PharmaAdTemplate for logo resolution */
  projectId: string;
  /** OEM / make key used to resolve the brand kit (e.g. "Spiriva") */
  make: string;
}

export function DataRowAccordion({
  row,
  rowIndex,
  backgrounds,
  templates,
  open,
  onToggle,
  onAddBackground,
  onAddAll,
  projectId,
  make,
}: DataRowAccordionProps) {
  const {
    getBackgroundsForOfferTemplate,
    excludeBackgroundFromOfferTemplate,
    includeBackgroundForOfferTemplate,
  } = useProjectStore();

  // Label: first non-empty data value, fallback to "Row N"
  const firstValue = Object.values(row.data).find((v) => v.trim() !== "");
  const label = firstValue ?? `Row ${rowIndex + 1}`;

  // All backgrounds assigned to this row across all templates (deduplicated)
  const activeBgs = [
    ...new Map(
      templates.flatMap((t) => getBackgroundsForOfferTemplate(row.id, t.id)).map((bg) => [bg.id, bg])
    ).values(),
  ];

  const total = templates.reduce(
    (sum, t) => sum + getBackgroundsForOfferTemplate(row.id, t.id).length,
    0
  );

  function deleteAll() {
    templates.forEach((t) =>
      getBackgroundsForOfferTemplate(row.id, t.id).forEach((bg) =>
        excludeBackgroundFromOfferTemplate(row.id, t.id, bg.id)
      )
    );
  }

  return (
    <Box sx={{ borderRadius: 1.5, bgcolor: "#fff" }}>
      {/* ── Header ── */}
      <Box
        role="button"
        tabIndex={0}
        onClick={onToggle}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onToggle()}
        className="group/row"
        sx={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          px: 2,
          py: 1.5,
          cursor: "pointer",
          borderRadius: 1.5,
          transition: "background 0.15s",
          "&:hover": { bgcolor: "#F9FAFB" },
        }}
      >
        {open
          ? <ExpandMoreIcon sx={{ fontSize: 15, color: "text.secondary", flexShrink: 0 }} />
          : <ChevronRightIcon sx={{ fontSize: 15, color: "text.secondary", flexShrink: 0 }} />}

        {/* Row number badge */}
        <Box
          sx={{
            width: 40,
            height: 40,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "rgba(71,59,171,0.08)",
            borderRadius: 1.5,
          }}
        >
          <Typography sx={{ fontSize: "0.875rem", fontWeight: 700, color: "#473bab" }}>
            {rowIndex + 1}
          </Typography>
        </Box>

        {/* Title + subtitle */}
        <Box sx={{ flex: 1, minWidth: 0, textAlign: "left" }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Typography
              sx={{
                fontSize: "0.875rem",
                fontWeight: 600,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {label}
            </Typography>
            <SubsectionActions
              onDelete={deleteAll}
              onAddBackground={onAddAll}
              deleteTip="Delete all backgrounds for this row"
              editTip="Edit all assets for this row"
            />
          </Box>
          <Typography sx={{ fontSize: "0.75rem", color: "text.secondary" }}>
            Row {rowIndex + 1} · {templates.length} template{templates.length !== 1 ? "s" : ""} · {total} asset{total !== 1 ? "s" : ""}
          </Typography>
        </Box>

        {/* Background thumbnails strip */}
        {!open && activeBgs.length > 0 && (
          <Box sx={{ position: "relative", display: "flex", alignItems: "center", flexShrink: 0 }}>
            <Box
              sx={{
                position: "absolute",
                top: -8,
                right: -4,
                zIndex: 10,
                width: 20,
                height: 20,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "#473bab",
                color: "#fff",
                fontSize: "10px",
                fontWeight: 700,
                borderRadius: "50%",
              }}
            >
              {activeBgs.length}
            </Box>
            <Box sx={{ display: "flex", gap: "2px" }}>
              {activeBgs.slice(0, 4).map((bg) => (
                <Box
                  key={bg.id}
                  sx={{
                    width: 38,
                    height: 26,
                    borderRadius: "4px",
                    border: "1px solid",
                    borderColor: "divider",
                    flexShrink: 0,
                    overflow: "hidden",
                    position: "relative",
                  }}
                >
                  <Box
                    component="img"
                    src={getSquareThumbnail(bg)}
                    alt={bg.name}
                    sx={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </Box>

      {/* ── Body ── */}
      {open && (
        <Box sx={{ borderTop: "1px solid", borderColor: "divider" }}>
          {templates.map((template, ti) => {
            const bgs = getBackgroundsForOfferTemplate(row.id, template.id);
            const scale = thumbnailScale(template.width, template.height);

            return (
              <Box
                key={template.id}
                className="group/row"
                sx={{
                  px: 2,
                  py: 1.5,
                  ...(ti < templates.length - 1 ? { borderBottom: "1px solid #FAFAFA" } : {}),
                }}
              >
                {/* Sub-row header */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                  {/* Template mini-preview */}
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden",
                    }}
                  >
                    <PharmaAdTemplate
                      templateId={template.id}
                      background={{ id: "__placeholder__", name: "", type: "", sizes: 0, folder: "", color: "#ddd", thumbnail: "", images: {} }}
                      scale={Math.min(32 / template.width, 32 / template.height)}
                      projectId={projectId}
                      make={make}
                    />
                  </Box>
                  <Typography sx={{ fontSize: "0.75rem", fontWeight: 500, color: "text.primary" }}>
                    {template.name}
                  </Typography>
                  <Typography sx={{ fontSize: "10px", color: "text.secondary" }}>
                    {template.width}×{template.height}
                  </Typography>
                  <SubsectionActions
                    onDelete={() =>
                      bgs.forEach((bg) => excludeBackgroundFromOfferTemplate(row.id, template.id, bg.id))
                    }
                    onAddBackground={() => onAddBackground(template.id)}
                    deleteTip="Remove all backgrounds for this row × template"
                    editTip="Edit assets for this row × template"
                    onRestore={
                      bgs.length < backgrounds.length
                        ? () =>
                            backgrounds.forEach((bg) =>
                              includeBackgroundForOfferTemplate(row.id, template.id, bg.id)
                            )
                        : undefined
                    }
                    restoreTip="Restore removed backgrounds"
                  />
                </Box>

                {/* Backgrounds grid */}
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {bgs.map((bg) => (
                    <Box
                      key={bg.id}
                      className="group/thumb"
                      sx={{ position: "relative", flexShrink: 0, borderRadius: "4px", overflow: "hidden" }}
                    >
                      <PharmaAdTemplate
                        templateId={template.id}
                        background={bg}
                        scale={scale}
                        projectId={projectId}
                        make={make}
                        dataFields={row.data}
                      />
                      <Box
                        sx={{
                          position: "absolute",
                          inset: 0,
                          bgcolor: "rgba(0,0,0,0.4)",
                          opacity: 0,
                          ".group\\/thumb:hover &": { opacity: 1 },
                          transition: "opacity 0.2s",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 0.75,
                          zIndex: 10,
                          borderRadius: "4px",
                        }}
                      >
                        <IconButton
                          size="small"
                          onClick={() => excludeBackgroundFromOfferTemplate(row.id, template.id, bg.id)}
                          sx={{
                            width: 32,
                            height: 32,
                            borderRadius: "50%",
                            bgcolor: "#fff",
                            "&:hover": { bgcolor: "#F3F4F6" },
                            boxShadow: 1,
                          }}
                        >
                          <DeleteOutlineIcon sx={{ fontSize: 14, color: "#374151" }} />
                        </IconButton>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );
}
