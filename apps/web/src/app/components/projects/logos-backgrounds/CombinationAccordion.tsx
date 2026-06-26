"use client";

import { useState, useRef, useEffect } from "react";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import InputBase from "@mui/material/InputBase";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import { AdTemplate, resolveLogoSrc } from "../templates/AdTemplate";
import { TemplateWireframe } from "../templates/TemplateWireframe";
import { TemplateZoneEditor } from "../templates/TemplateZoneEditor";
import { SubsectionActions } from "./SubsectionActions";
import { BackgroundCollection } from "./BackgroundCollectionCard";
import { useProjectStore } from "../lib/project-store";
import { thumbnailScale } from "../lib/thumbnail-scale";
import { getSquareThumbnail } from "../lib/bg-thumbnail";
import { zoneConfigs, isKeyMessageTextLayout, isPharmaZoneConfig } from "../lib/template-zone-configs";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Offer {
  id: string;
  year: string;
  make: string;
  model: string;
  trim: string;
  image: string;
  monthlyPayment: number;
  term: number;
  totalDueAtSigning: number;
}

interface Template {
  id: string;
  name: string;
  format: string;
  width: number;
  height: number;
  brand: string;
  products: number;
}

interface CombinationAccordionProps {
  combinationId: string;
  templates: Template[];
  allOffers: Offer[];
  slotOfferIds: string[];
  onSetSlotOffer: (slotIndex: number, offerId: string) => void;
  open: boolean;
  onToggle: () => void;
  onAddBackground: (templateId: string) => void;
  onAddAll: () => void;
  onDelete?: () => void;
  projectId: string;
}

export const COMBINATION_ID = "__combination__";

// ─── SlotPicker ───────────────────────────────────────────────────────────────

export function SlotPicker({ slotIndex, offer, allOffers, onSelect }: {
  slotIndex: number;
  offer: Offer;
  allOffers: Offer[];
  onSelect: (offerId: string) => void;
}) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  return (
    <Box sx={{ position: "relative", zIndex: open ? 50 : 10 - slotIndex }}>
      <Box
        component="button"
        onClick={(e: React.MouseEvent) => { e.stopPropagation(); setAnchorEl(e.currentTarget as HTMLElement); }}
        title={`Product ${slotIndex + 1}: ${offer.year} ${offer.make} ${offer.model}`}
        sx={{
          position: "relative",
          width: 56,
          height: 40,
          borderRadius: 1.5,
          border: "2px solid #fff",
          bgcolor: "#fff",
          boxShadow: 1,
          overflow: "hidden",
          cursor: "pointer",
          transition: "border-color 0.2s",
          "&:hover": { borderColor: "rgba(71,59,171,0.6)" },
        }}
      >
        <Box
          component="img"
          src={offer.image}
          alt={offer.model}
          sx={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain" }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            textAlign: "center",
            fontSize: "8px",
            fontWeight: 700,
            color: "#fff",
            bgcolor: "#473bab",
            lineHeight: 1.2,
            py: "2px",
          }}
        >
          P{slotIndex + 1}
        </Box>
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        onClick={(e) => e.stopPropagation()}
        slotProps={{
          paper: { sx: { borderRadius: 2, border: "1px solid", borderColor: "divider", boxShadow: "0 8px 24px rgba(0,0,0,0.12)", width: 256 } },
        }}
      >
        {allOffers.map((o) => (
          <MenuItem
            key={o.id}
            onClick={(e) => { e.stopPropagation(); onSelect(o.id); setAnchorEl(null); }}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              bgcolor: o.id === offer.id ? "rgba(71,59,171,0.08)" : "transparent",
            }}
          >
            <Box sx={{ position: "relative", width: 40, height: 28, flexShrink: 0 }}>
              <Box
                component="img"
                src={o.image}
                alt={o.model}
                sx={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain" }}
              />
            </Box>
            <Typography
              sx={{
                fontSize: "0.75rem",
                fontWeight: 500,
                color: "#1F2937",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {o.year} {o.make} {o.model} {o.trim}
            </Typography>
            {o.id === offer.id && (
              <Box sx={{ ml: "auto", width: 6, height: 6, borderRadius: "50%", bgcolor: "#473bab", flexShrink: 0 }} />
            )}
          </MenuItem>
        ))}
        <Box sx={{ borderTop: "1px solid", borderColor: "divider", mt: 0.5, pt: 0.5 }}>
          <MenuItem
            onClick={(e) => { e.stopPropagation(); onSelect(allOffers[slotIndex]?.id ?? allOffers[0].id); setAnchorEl(null); }}
            sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
          >
            <Box sx={{ width: 40, height: 28, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CloseIcon sx={{ fontSize: 14, color: "text.secondary" }} />
            </Box>
            <Typography sx={{ fontSize: "0.75rem", fontWeight: 500, color: "text.secondary" }}>Clear</Typography>
          </MenuItem>
        </Box>
      </Menu>
    </Box>
  );
}

// ─── KeyMessageInlineInputs ──────────────────────────────────────────────────

export function KeyMessageInlineInputs({ templateId, white }: { templateId: string; white?: boolean }) {
  const { customTemplateFields, setCustomTemplateField, fineTune } = useProjectStore();
  const cfg = zoneConfigs[templateId];
  if (!cfg || isPharmaZoneConfig(cfg) || !isKeyMessageTextLayout(cfg.textLayout)) return null;

  const fields = customTemplateFields[templateId] ?? {};
  const bgColor = white || !fineTune ? "#fff" : "#F3F4F6";

  return (
    <Box
      onClick={(e) => e.stopPropagation()}
      sx={{
        display: "inline-flex",
        flexWrap: "wrap",
        gap: 1.5,
        mb: 1,
        p: 2,
        borderRadius: 1.5,
        bgcolor: bgColor,
      }}
    >
      <Box component="label" sx={{ display: "flex", flexDirection: "column", gap: "2px", width: 200 }}>
        <Typography sx={{ fontSize: "10px", fontWeight: 500, color: "text.secondary", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          Key Message
        </Typography>
        <InputBase
          value={fields.keyMessage ?? ""}
          onChange={(e) => setCustomTemplateField(templateId, "keyMessage", e.target.value)}
          placeholder="e.g. Honda Spring Event"
          onClick={(e) => e.stopPropagation()}
          sx={{
            fontSize: "0.75rem",
            color: "#111827",
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 1,
            px: 1,
            py: 0.75,
            bgcolor: "#fff",
            "&:focus-within": { borderColor: "rgba(71,59,171,0.6)" },
          }}
        />
      </Box>
      <Box component="label" sx={{ display: "flex", flexDirection: "column", gap: "2px", width: 200 }}>
        <Typography sx={{ fontSize: "10px", fontWeight: 500, color: "text.secondary", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          Year
        </Typography>
        <InputBase
          value={fields.year ?? ""}
          onChange={(e) => setCustomTemplateField(templateId, "year", e.target.value)}
          placeholder="e.g. 2026"
          onClick={(e) => e.stopPropagation()}
          sx={{
            fontSize: "0.75rem",
            color: "#111827",
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 1,
            px: 1,
            py: 0.75,
            bgcolor: "#fff",
            "&:focus-within": { borderColor: "rgba(71,59,171,0.6)" },
          }}
        />
      </Box>
    </Box>
  );
}

// ─── OfferSlotThumbnail ───────────────────────────────────────────────────────

export function OfferSlotThumbnail({ slotIndex, offer, allOffers, onSelect }: {
  slotIndex: number;
  offer: Offer | undefined;
  allOffers: Offer[];
  onSelect: (offerId: string) => void;
}) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  return (
    <Box sx={{ position: "relative", zIndex: open ? 50 : 10 - slotIndex }}>
      <Box
        component="button"
        onClick={(e: React.MouseEvent) => { e.stopPropagation(); setAnchorEl(e.currentTarget as HTMLElement); }}
        title={offer ? `Offer ${slotIndex + 1}: ${offer.year} ${offer.make} ${offer.model}` : `Offer ${slotIndex + 1}: empty`}
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "2px",
          cursor: "pointer",
          background: "none",
          border: "none",
          p: 0,
          "&:hover": { opacity: 0.8 },
          transition: "opacity 0.2s",
        }}
      >
        {offer ? (
          <Box sx={{ position: "relative", width: 56, height: 36 }}>
            <Box
              component="img"
              src={offer.image}
              alt={offer.model}
              sx={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain" }}
            />
          </Box>
        ) : (
          <Box
            sx={{
              width: 56,
              height: 36,
              borderRadius: 1,
              border: "2px dashed #D1D5DB",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "#F9FAFB",
            }}
          >
            <AddIcon sx={{ fontSize: 13, color: "text.secondary" }} />
          </Box>
        )}
        <Box
          component="span"
          sx={{
            px: 0.75,
            py: "2px",
            borderRadius: "9999px",
            fontSize: "9px",
            fontWeight: 700,
            lineHeight: 1,
            whiteSpace: "nowrap",
            ...(offer
              ? { bgcolor: "#473bab", color: "#fff" }
              : { bgcolor: "#E5E7EB", color: "#6B7280" }),
          }}
        >
          Offer {slotIndex + 1}
        </Box>
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        onClick={(e) => e.stopPropagation()}
        slotProps={{
          paper: { sx: { borderRadius: 2, border: "1px solid", borderColor: "divider", boxShadow: "0 8px 24px rgba(0,0,0,0.12)", width: 256 } },
        }}
      >
        {allOffers.map((o) => (
          <MenuItem
            key={o.id}
            onClick={(e) => { e.stopPropagation(); onSelect(o.id); setAnchorEl(null); }}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              bgcolor: o.id === offer?.id ? "rgba(71,59,171,0.08)" : "transparent",
            }}
          >
            <Box sx={{ position: "relative", width: 40, height: 28, flexShrink: 0 }}>
              <Box
                component="img"
                src={o.image}
                alt={o.model}
                sx={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain" }}
              />
            </Box>
            <Typography
              sx={{
                fontSize: "0.75rem",
                fontWeight: 500,
                color: "#1F2937",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {o.year} {o.make} {o.model} {o.trim}
            </Typography>
            {o.id === offer?.id && (
              <Box sx={{ ml: "auto", width: 6, height: 6, borderRadius: "50%", bgcolor: "#473bab", flexShrink: 0 }} />
            )}
          </MenuItem>
        ))}
        {offer && (
          <Box sx={{ borderTop: "1px solid", borderColor: "divider", mt: 0.5, pt: 0.5 }}>
            <MenuItem
              onClick={(e) => { e.stopPropagation(); onSelect(""); setAnchorEl(null); }}
              sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
            >
              <Box sx={{ width: 40, height: 28, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <CloseIcon sx={{ fontSize: 14, color: "text.secondary" }} />
              </Box>
              <Typography sx={{ fontSize: "0.75rem", fontWeight: 500, color: "text.secondary" }}>Leave empty</Typography>
            </MenuItem>
          </Box>
        )}
      </Menu>
    </Box>
  );
}

// ─── BrandLogoMini ────────────────────────────────────────────────────────────

function BrandLogoMini({ make, slotType, projectId }: { make: string; slotType: string; projectId: string }) {
  const { activeBrandKitIds, activeLogoIds } = useProjectStore();
  const src = resolveLogoSrc(make, slotType, activeBrandKitIds, activeLogoIds, projectId);
  if (!src) return <Box sx={{ width: 32, height: 32 }} />;
  return (
    <Box
      sx={{
        width: 32,
        height: 32,
        borderRadius: 1.5,
        bgcolor: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <Box
        component="img"
        src={src}
        alt={slotType}
        style={{ width: "100%", height: "100%", objectFit: "contain", padding: "2px" }}
      />
    </Box>
  );
}

// ─── CombinationThumbnailRow ──────────────────────────────────────────────────

function CombinationThumbnailRow({ combinationId, templateId, templateName, templateWidth, templateHeight, slotOffers, projectId }: {
  combinationId: string;
  templateId: string;
  templateName: string;
  templateWidth: number;
  templateHeight: number;
  slotOffers: (Offer | undefined)[];
  projectId: string;
}) {
  const { getBackgroundsForOfferTemplate, excludeBackgroundFromOfferTemplate, customTemplateFields } = useProjectStore();
  const [lightbox, setLightbox] = useState<BackgroundCollection | null>(null);
  const [editorBg, setEditorBg] = useState<BackgroundCollection | null>(null);
  const scale = thumbnailScale(templateWidth, templateHeight);
  const bgs = getBackgroundsForOfferTemplate(combinationId, templateId);
  const primaryOffer = slotOffers.find(Boolean);
  const customFields = customTemplateFields[templateId];

  return (
    <>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
        {bgs.map((bg) => (
          <Box key={bg.id} className="group" sx={{ position: "relative", flexShrink: 0 }}>
            <Box sx={{ overflow: "hidden", isolation: "isolate" }}>
              <AdTemplate
                projectId={projectId}
                templateId={templateId}
                offer={primaryOffer}
                offers={slotOffers}
                background={bg}
                scale={scale}
                customFields={customFields}
              />
            </Box>
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                bgcolor: "rgba(0,0,0,0.4)",
                opacity: 0,
                ".group:hover &": { opacity: 1 },
                transition: "opacity 0.2s",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 1,
                zIndex: 10,
              }}
            >
              <IconButton size="small" onClick={() => setLightbox(bg)} sx={{ width: 32, height: 32, bgcolor: "#fff", "&:hover": { bgcolor: "#F3F4F6" }, boxShadow: 1 }}>
                <VisibilityOutlinedIcon sx={{ fontSize: 14, color: "#374151" }} />
              </IconButton>
              <IconButton size="small" onClick={() => excludeBackgroundFromOfferTemplate(combinationId, templateId, bg.id)} sx={{ width: 32, height: 32, bgcolor: "#fff", "&:hover": { bgcolor: "#F3F4F6" }, boxShadow: 1 }}>
                <DeleteOutlineIcon sx={{ fontSize: 14, color: "#374151" }} />
              </IconButton>
              <IconButton size="small" onClick={() => setEditorBg(bg)} sx={{ width: 32, height: 32, bgcolor: "#fff", "&:hover": { bgcolor: "#F3F4F6" }, boxShadow: 1 }}>
                <EditOutlinedIcon sx={{ fontSize: 14, color: "#374151" }} />
              </IconButton>
            </Box>
          </Box>
        ))}
      </Box>

      {/* Lightbox */}
      {lightbox && (
        <Box
          sx={{ position: "fixed", inset: 0, bgcolor: "rgba(0,0,0,0.7)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", p: 4 }}
          onClick={() => setLightbox(null)}
        >
          <Box onClick={(e) => e.stopPropagation()}>
            <AdTemplate
              projectId={projectId}
              templateId={templateId}
              offer={primaryOffer}
              offers={slotOffers}
              background={lightbox}
              scale={Math.min(1200 / templateWidth, 720 / templateHeight)}
              customFields={customFields}
            />
          </Box>
        </Box>
      )}

      {/* Zone editor */}
      {editorBg && (
        <TemplateZoneEditor
          templateId={templateId}
          templateName={templateName}
          previewOffer={primaryOffer}
          previewBackground={editorBg}
          onClose={() => setEditorBg(null)}
        />
      )}
    </>
  );
}

// ─── CombinationAccordion ─────────────────────────────────────────────────────

export function CombinationAccordion({
  combinationId,
  templates,
  allOffers,
  slotOfferIds,
  onSetSlotOffer,
  open,
  onToggle,
  onAddBackground,
  onAddAll,
  onDelete,
  projectId,
}: CombinationAccordionProps) {
  const { getBackgroundsForOfferTemplate, excludeBackgroundFromOfferTemplate, includeBackgroundForOfferTemplate, getBackgroundsForTemplate } = useProjectStore();
  const slotCount = templates[0]?.products ?? 3;

  const activeBackgrounds = [...new Map(
    templates.flatMap((t) => getBackgroundsForOfferTemplate(combinationId, t.id)).map((bg) => [bg.id, bg])
  ).values()];

  const effectiveOfferIds = Array.from({ length: slotCount }, (_, i) => {
    const id = slotOfferIds[i];
    return id !== undefined ? id : (allOffers[i]?.id ?? "");
  });

  const effectiveOffers: (Offer | undefined)[] = effectiveOfferIds.map((id) =>
    id ? allOffers.find((o) => o.id === id) : undefined
  );

  const totalAssets = templates.reduce(
    (sum, t) => sum + getBackgroundsForOfferTemplate(combinationId, t.id).length,
    0
  );

  return (
    <Box sx={{ borderRadius: 1.5, bgcolor: "#fff" }}>
      {/* Header */}
      <Box
        role="button"
        onClick={onToggle}
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
          ? <ExpandMoreIcon sx={{ fontSize: 15, flexShrink: 0 }} />
          : <ChevronRightIcon sx={{ fontSize: 15, flexShrink: 0 }} />}

        {/* Slot thumbnails */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          {effectiveOffers.map((offer, i) => (
            <OfferSlotThumbnail
              key={i}
              slotIndex={i}
              offer={offer}
              allOffers={allOffers}
              onSelect={(offerId) => onSetSlotOffer(i, offerId)}
            />
          ))}
        </Box>

        {/* Label */}
        <Box sx={{ flex: 1, minWidth: 0, textAlign: "left" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Typography sx={{ fontSize: "0.875rem", fontWeight: 600 }}>Multiple offers</Typography>
            {onDelete && (
              <SubsectionActions
                onDelete={onDelete}
                deleteTip="Remove this combination"
              />
            )}
          </Box>
          <Typography sx={{ fontSize: "0.75rem", color: "text.secondary" }}>
            {templates.length} template{templates.length !== 1 ? "s" : ""} · {totalAssets} asset{totalAssets !== 1 ? "s" : ""}
          </Typography>
        </Box>

        {/* Right */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexShrink: 0 }}>
          {!open && activeBackgrounds.length > 0 && (
            <Box sx={{ position: "relative", display: "flex", alignItems: "center" }}>
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
                {activeBackgrounds.length}
              </Box>
              <Box sx={{ display: "flex", gap: "2px" }}>
                {activeBackgrounds.slice(0, 4).map((bg) => (
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
          {[...new Set(templates.flatMap((t) => (t as Template & { logoSlots?: string[] }).logoSlots ?? []))].map((slotType) => {
            const make = effectiveOffers.find(Boolean)?.make ?? "";
            return <BrandLogoMini key={slotType} make={make} slotType={slotType} projectId={projectId} />;
          })}
        </Box>
      </Box>

      {/* Expanded content */}
      {open && (
        <Box sx={{ borderTop: "1px solid", borderColor: "divider", borderBottomLeftRadius: 6, borderBottomRightRadius: 6, overflow: "visible" }}>
          {templates.map((template, idx) => {
            const templateBgs = getBackgroundsForOfferTemplate(combinationId, template.id);
            const allTemplateBgs = getBackgroundsForTemplate(template.id);
            const hasRemoved = templateBgs.length < allTemplateBgs.length;
            return (
              <Box
                key={template.id}
                className="group/row"
                sx={{
                  px: 2,
                  py: 1.5,
                  ...(idx < templates.length - 1 ? { borderBottom: "1px solid #FAFAFA" } : {}),
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                  <Box sx={{ width: 40, height: 40, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                    <TemplateWireframe
                      templateId={template.id}
                      scale={Math.min(40 / template.width, 40 / template.height)}
                    />
                  </Box>
                  <Typography sx={{ fontSize: "0.75rem", fontWeight: 500, color: "text.primary" }}>
                    {template.name}
                  </Typography>
                  <SubsectionActions
                    onDelete={() =>
                      templateBgs.forEach((bg) =>
                        excludeBackgroundFromOfferTemplate(combinationId, template.id, bg.id)
                      )
                    }
                    deleteTip="Remove all backgrounds for this template"
                    onAddBackground={() => onAddBackground(template.id)}
                    onRestore={hasRemoved ? () =>
                      allTemplateBgs.forEach((bg) =>
                        includeBackgroundForOfferTemplate(combinationId, template.id, bg.id)
                      ) : undefined}
                    restoreTip="Restore removed backgrounds"
                  />
                </Box>
                <KeyMessageInlineInputs templateId={template.id} />
                <CombinationThumbnailRow
                  combinationId={combinationId}
                  templateId={template.id}
                  templateName={template.name}
                  templateWidth={template.width}
                  templateHeight={template.height}
                  slotOffers={effectiveOffers}
                  projectId={projectId}
                />
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );
}
