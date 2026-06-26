
import { useState, useEffect, useMemo } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import InputBase from "@mui/material/InputBase";
import AddIcon from "@mui/icons-material/Add";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import SearchIcon from "@mui/icons-material/Search";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { TemplateCard } from "./templates/TemplateCard";
import { SelectTemplateDialog } from "./templates/SelectTemplateDialog";
import { CardViewVertical } from "./ui/CardViewVertical";
import { VariableMappingPane } from "./templates/VariableMappingPane";
import { useRightPanel } from "./lib/right-panel-context";
import { getProjectTemplates, getProjectById, templateLibrary } from "./lib/mock-data";
import type { Template } from "./lib/mock-data";
import { useProjectStore } from "./lib/project-store";

// GitMerge icon SVG (not in MUI icons-material)
function GitMergeIcon({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="18" r="3" />
      <circle cx="6" cy="6" r="3" />
      <path d="M6 21V9a9 9 0 0 0 9 9" />
    </svg>
  );
}

export function TemplatesPage({ projectId, onNavigateTo }: { projectId: string; onNavigateTo: (page: string) => void }) {
  const id = projectId;
  const project = getProjectById(id);
  const baseTemplates = getProjectTemplates(id);

  const { addedTemplateIds, addTemplates } = useProjectStore();
  const extraTemplates = useMemo(() => {
    const projectAddedIds = addedTemplateIds[id] ?? [];
    return projectAddedIds
      .map((tid) => templateLibrary.find((t) => t.id === tid))
      .filter((t): t is Template => !!t);
  }, [addedTemplateIds, id]);

  const templates = useMemo(
    () => [...baseTemplates, ...extraTemplates],
    [baseTemplates, extraTemplates]
  );
  const existingTemplateIds = useMemo(() => new Set(templates.map((t) => t.id)), [templates]);

  const [selected, setSelected] = useState<Set<string>>(new Set(templates.map((t) => t.id)));
  const [browseOpen, setBrowseOpen] = useState(false);
  const [mapVarsOpen, setMapVarsOpen] = useState(false);
  const { setRightPanel } = useRightPanel();

  function handleAddFromDialog(newTemplates: Template[]) {
    addTemplates(id, newTemplates.map((t) => t.id));
  }

  function handleSelect(templateId: string, checked: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      checked ? next.add(templateId) : next.delete(templateId);
      return next;
    });
  }

  // Determine which template types are present in this project
  const hasSingle     = templates.some((t) => t.products === 1);
  const hasMulti      = templates.some((t) => t.products > 1 && !t.name.toLowerCase().includes("keymessage") && !t.name.toLowerCase().includes("key_message") && !t.name.toLowerCase().includes("keymsg"));
  const hasKeyMessage = templates.some((t) => t.products > 1 && t.name.toLowerCase().includes("key"));
  const activeTypes = [
    ...(hasSingle     ? ["single"     as const] : []),
    ...(hasMulti      ? ["multi"      as const] : []),
    ...(hasKeyMessage ? ["keyMessage" as const] : []),
  ];

  // Register / unregister the right panel via context
  useEffect(() => {
    if (mapVarsOpen) {
      setRightPanel(
        <VariableMappingPane
          activeTypes={activeTypes}
          onClose={() => setMapVarsOpen(false)}
        />
      );
    } else {
      setRightPanel(null);
    }
    return () => setRightPanel(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapVarsOpen]);

  return (
    <>
      <SelectTemplateDialog
        open={browseOpen}
        onClose={() => setBrowseOpen(false)}
        onAdd={handleAddFromDialog}
        existingTemplateIds={existingTemplateIds}
      />

      <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
        {/* Page header */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, px: 3, py: 1.5, bgcolor: "#fff" }}>
          <Typography sx={{ fontSize: "1.125rem", fontWeight: 600, color: "#111827" }}>Templates</Typography>

          <Button
            size="small"
            onClick={() => setBrowseOpen(true)}
            startIcon={<AddIcon sx={{ fontSize: 13 }} />}
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
            Add
          </Button>

          <Button
            size="small"
            onClick={() => setMapVarsOpen((v) => !v)}
            startIcon={<GitMergeIcon size={13} />}
            sx={{
              fontSize: "0.75rem",
              fontWeight: 600,
              px: 1.5,
              py: 0.75,
              borderRadius: 50,
              border: "1px solid",
              textTransform: "none",
              ...(mapVarsOpen
                ? {
                    bgcolor: "var(--brand-accent, #473bab)",
                    color: "#fff",
                    borderColor: "var(--brand-accent, #473bab)",
                    "&:hover": { bgcolor: "var(--brand-accent-hover, #392e8a)" },
                  }
                : {
                    bgcolor: "#fff",
                    color: "#374151",
                    borderColor: "#e5e7eb",
                    "&:hover": { bgcolor: "#F9FAFB", borderColor: "#d1d5db" },
                  }),
            }}
          >
            Map Variables
          </Button>

          <IconButton size="small" sx={{ ml: 0.5, color: "#9ca3af", "&:hover": { color: "#4b5563" } }}>
            <MoreVertIcon sx={{ fontSize: 16 }} />
          </IconButton>

          {/* Search */}
          <Box sx={{ position: "relative", ml: "auto" }}>
            <SearchIcon sx={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: "#9ca3af" }} />
            <InputBase
              type="text"
              placeholder="Find below"
              inputProps={{ style: { paddingLeft: 28, paddingRight: 12, paddingTop: 6, paddingBottom: 6, fontSize: "0.75rem" } }}
              sx={{
                bgcolor: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: 50,
                color: "#374151",
                fontSize: "0.75rem",
              }}
            />
          </Box>

          {/* Item count */}
          <Typography sx={{ fontSize: "0.75rem", color: "#9ca3af", flexShrink: 0 }}>{templates.length} Items</Typography>
        </Box>

        {/* Grid */}
        <Box sx={{ flex: 1, px: 3, py: 2.5, overflow: "auto" }}>
          <CardViewVertical>
            {templates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                selected={selected.has(template.id)}
                onSelect={handleSelect}
              />
            ))}
          </CardViewVertical>
        </Box>

        {/* Footer nav */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 3, py: 1.5, bgcolor: "#fff", borderTop: "1px solid #F3F4F6" }}>
          <Button
            size="small"
            onClick={() => onNavigateTo("offers")}
            startIcon={<ChevronLeftIcon sx={{ fontSize: 14 }} />}
            sx={{
              fontSize: "0.875rem",
              fontWeight: 500,
              color: "var(--brand-accent, #473bab)",
              border: "1px solid rgba(71,59,171,0.3)",
              borderRadius: 50,
              px: 2,
              py: 0.75,
              textTransform: "none",
              "&:hover": { bgcolor: "rgba(71,59,171,0.05)" },
            }}
          >
            Offers
          </Button>
          <Button
            size="small"
            onClick={() => onNavigateTo("logos-backgrounds")}
            endIcon={<ChevronRightIcon sx={{ fontSize: 14 }} />}
            sx={{
              fontSize: "0.875rem",
              fontWeight: 500,
              color: "var(--brand-accent, #473bab)",
              border: "1px solid rgba(71,59,171,0.3)",
              borderRadius: 50,
              px: 2,
              py: 0.75,
              textTransform: "none",
              "&:hover": { bgcolor: "rgba(71,59,171,0.05)" },
            }}
          >
            Styles
          </Button>
        </Box>
      </Box>
    </>
  );
}
