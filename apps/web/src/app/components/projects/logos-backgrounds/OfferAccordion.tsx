"use client";

import { useState, useRef, useEffect } from "react";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import RotateLeftIcon from "@mui/icons-material/RotateLeft";
import { SubsectionActions, TipButton } from "./SubsectionActions";
import { LogoPicker } from "./LogoPicker";
import { BackgroundCollection } from "./BackgroundCollectionCard";
import type { Template } from "../lib/mock-data";
import { brandKits } from "../lib/mock-data";
import { AdTemplate, resolveLogoSrc, resolveColors } from "../templates/AdTemplate";
import { TemplateWireframe } from "../templates/TemplateWireframe";
import { TemplateZoneEditor } from "../templates/TemplateZoneEditor";
import { useProjectStore } from "../lib/project-store";
import { thumbnailScale } from "../lib/thumbnail-scale";
import { getSquareThumbnail } from "../lib/bg-thumbnail";

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

interface OfferAccordionProps {
  offer: Offer;
  backgrounds: BackgroundCollection[];
  templates: Template[];
  open: boolean;
  onToggle: () => void;
  onDelete: (templateId: string) => void;
  onAddBackground: (templateId: string) => void;
  onAddAll: () => void;
  projectId: string;
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

// ─── OverrideColorPicker ──────────────────────────────────────────────────────

interface OverrideColorPickerProps {
  label: string;
  currentColor: string;
  hasOverride?: boolean;
  onChangeColor: (hex: string) => void;
  onRevert?: () => void;
  onClose: () => void;
}

function OverrideColorPicker({ label, currentColor, hasOverride, onChangeColor, onRevert, onClose }: OverrideColorPickerProps) {
  const [hexInput, setHexInput] = useState(currentColor.replace("#", ""));
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  function handleHex(raw: string) {
    setHexInput(raw);
    const clean = raw.replace(/[^0-9a-fA-F]/g, "").slice(0, 6);
    if (clean.length === 6) onChangeColor("#" + clean);
  }

  return (
    <Box
      ref={popoverRef}
      onClick={(e) => e.stopPropagation()}
      sx={{
        position: "absolute",
        zIndex: 50,
        top: "100%",
        mt: "4px",
        left: 0,
        bgcolor: "#fff",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
        p: 1.5,
        display: "flex",
        flexDirection: "column",
        gap: 1,
        minWidth: 160,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
        <Typography sx={{ fontSize: "10px", fontWeight: 600, color: "text.secondary", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          {label}
        </Typography>
        {hasOverride && onRevert && (
          <TipButton
            tip="Revert Overrides"
            onClick={() => { onRevert(); onClose(); }}
            style={{ width: 20, height: 20, color: "#9CA3AF" }}
          >
            <RotateLeftIcon sx={{ fontSize: 11 }} />
          </TipButton>
        )}
      </Box>
      <Box
        component="input"
        type="color"
        value={"#" + hexInput.replace(/[^0-9a-fA-F]/g, "").slice(0, 6).padEnd(6, "0")}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          const h = e.target.value.replace("#", "");
          setHexInput(h);
          onChangeColor(e.target.value);
        }}
        sx={{ width: "100%", height: 32, borderRadius: 1, cursor: "pointer", border: "1px solid", borderColor: "divider" }}
      />
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
        <Typography sx={{ fontSize: "0.75rem", color: "text.secondary" }}>#</Typography>
        <Box
          component="input"
          type="text"
          maxLength={6}
          value={hexInput}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleHex(e.target.value)}
          sx={{
            flex: 1,
            fontSize: "0.75rem",
            fontFamily: "monospace",
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 1,
            px: 1,
            py: 0.5,
            outline: "none",
            "&:focus": { borderColor: "rgba(71,59,171,0.6)" },
          }}
          placeholder="000000"
        />
      </Box>
    </Box>
  );
}

// ─── StyleOverrideButtons ─────────────────────────────────────────────────────

type OverrideScope = "offer" | "offerTemplate" | "template" | "backgroundMake";

interface StyleOverrideButtonsProps {
  make: string;
  offerId?: string;
  templateId?: string;
  bgId?: string;
  scope: OverrideScope;
  projectId: string;
  slotTypes: string[];
}

export function StyleOverrideButtons({ make, offerId = "", templateId, bgId, scope, projectId, slotTypes }: StyleOverrideButtonsProps) {
  const store = useProjectStore();
  const { activeBrandKitIds, activeLogoIds, activeColors } = store;

  const [effectiveTextColor, effectiveBtnColor] = (() => {
    if (offerId && templateId) {
      const ot = store.offerTemplateColors[projectId]?.[`${offerId}::${templateId}`]?.[make];
      if (ot) return ot;
    }
    if (offerId) {
      const o = store.offerColors[projectId]?.[offerId]?.[make];
      if (o) return o;
    }
    if (bgId) {
      const bg = store.backgroundMakeColors[projectId]?.[bgId]?.[make];
      if (bg) return bg;
    }
    if (templateId) {
      const t = store.templateColors[projectId]?.[templateId]?.[make];
      if (t) return t;
    }
    return resolveColors(make, activeColors, projectId);
  })();

  function getEffectiveLogo(slotType: string): string | undefined {
    if (offerId && templateId) {
      const ot = store.offerTemplateLogoIds[projectId]?.[`${offerId}::${templateId}`]?.[make]?.[slotType];
      if (ot) return ot;
    }
    if (offerId) {
      const o = store.offerLogoIds[projectId]?.[offerId]?.[make]?.[slotType];
      if (o) return o;
    }
    if (bgId) {
      const bg = store.backgroundMakeLogoIds[projectId]?.[bgId]?.[make]?.[slotType];
      if (bg) return bg;
    }
    if (templateId) {
      const t = store.templateLogoIds[projectId]?.[templateId]?.[make]?.[slotType];
      if (t) return t;
    }
    return resolveLogoSrc(make, slotType, activeBrandKitIds, activeLogoIds, projectId);
  }

  type OpenPicker = { type: "logo"; slotType: string } | { type: "color"; colorIdx: 0 | 1 } | null;
  const [openPicker, setOpenPicker] = useState<OpenPicker>(null);

  function applyLogoOverride(slotType: string, logoId: string) {
    if (scope === "offerTemplate" && offerId && templateId) {
      store.setOfferTemplateLogoId(projectId, offerId, templateId, make, slotType, logoId);
    } else if (scope === "template" && templateId) {
      store.setTemplateLogoId(projectId, templateId, make, slotType, logoId);
    } else if (scope === "backgroundMake" && bgId) {
      store.setBackgroundMakeLogoId(projectId, bgId, make, slotType, logoId);
    } else {
      store.setOfferLogoId(projectId, offerId, make, slotType, logoId);
    }
  }

  function applyColorOverride(idx: 0 | 1, color: string) {
    const otherIdx = (1 - idx) as 0 | 1;
    const otherColor = idx === 0 ? effectiveBtnColor : effectiveTextColor;
    if (scope === "offerTemplate" && offerId && templateId) {
      const key = `${offerId}::${templateId}`;
      if (!store.offerTemplateColors[projectId]?.[key]?.[make]) {
        store.setOfferTemplateColor(projectId, offerId, templateId, make, otherIdx, otherColor);
      }
      store.setOfferTemplateColor(projectId, offerId, templateId, make, idx, color);
    } else if (scope === "template" && templateId) {
      if (!store.templateColors[projectId]?.[templateId]?.[make]) {
        store.setTemplateColor(projectId, templateId, make, otherIdx, otherColor);
      }
      store.setTemplateColor(projectId, templateId, make, idx, color);
    } else if (scope === "backgroundMake" && bgId) {
      if (!store.backgroundMakeColors[projectId]?.[bgId]?.[make]) {
        store.setBackgroundMakeColor(projectId, bgId, make, otherIdx, otherColor);
      }
      store.setBackgroundMakeColor(projectId, bgId, make, idx, color);
    } else {
      if (!store.offerColors[projectId]?.[offerId]?.[make]) {
        store.setOfferColor(projectId, offerId, make, otherIdx, otherColor);
      }
      store.setOfferColor(projectId, offerId, make, idx, color);
    }
  }

  const hasColorOverride =
    scope === "offerTemplate" && offerId && templateId
      ? !!store.offerTemplateColors[projectId]?.[`${offerId}::${templateId}`]?.[make]
      : scope === "template" && templateId
        ? !!store.templateColors[projectId]?.[templateId]?.[make]
        : scope === "backgroundMake" && bgId
          ? !!store.backgroundMakeColors[projectId]?.[bgId]?.[make]
          : !!store.offerColors[projectId]?.[offerId]?.[make];

  function revertColorOverride() {
    if (scope === "offerTemplate" && offerId && templateId) {
      store.clearOfferTemplateColorOverrides(projectId, offerId, templateId, make);
    } else if (scope === "template" && templateId) {
      store.clearTemplateColorOverrides(projectId, templateId, make);
    } else if (scope === "backgroundMake" && bgId) {
      store.clearBackgroundMakeColorOverrides(projectId, bgId, make);
    } else {
      store.clearOfferColorOverrides(projectId, offerId, make);
    }
  }

  function getActiveLogoId(slotType: string): string | undefined {
    if (offerId && templateId) {
      const ot = store.offerTemplateLogoIds[projectId]?.[`${offerId}::${templateId}`]?.[make]?.[slotType];
      if (ot) return ot;
    }
    if (offerId) {
      const o = store.offerLogoIds[projectId]?.[offerId]?.[make]?.[slotType];
      if (o) return o;
    }
    if (bgId) {
      const bg = store.backgroundMakeLogoIds[projectId]?.[bgId]?.[make]?.[slotType];
      if (bg) return bg;
    }
    if (templateId) {
      const t = store.templateLogoIds[projectId]?.[templateId]?.[make]?.[slotType];
      if (t) return t;
    }
    return activeLogoIds[projectId]?.[make]?.[slotType];
  }

  return (
    <Box
      className="group/row"
      onClick={(e) => e.stopPropagation()}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 0.5,
        ml: 0.5,
        opacity: openPicker !== null ? 1 : 0,
        ".group\\/row:hover &": { opacity: 1 },
        transition: "opacity 0.2s",
      }}
    >
      {/* Logo buttons */}
      {slotTypes.map((slotType) => {
        const logoSrc = getEffectiveLogo(slotType);
        const isOpen = openPicker?.type === "logo" && openPicker.slotType === slotType;
        const label = slotType.startsWith("primary") ? "Swap logo for this group" : "Swap event logo for this group";
        return (
          <Box key={slotType} sx={{ position: "relative" }}>
            <TipButton
              tip={label}
              onClick={() => setOpenPicker(isOpen ? null : { type: "logo", slotType })}
              style={{
                border: "1px solid #E5E7EB",
                bgcolor: "#fff",
                "&:hover": { borderColor: "rgba(71,59,171,0.6)" },
              }}
            >
              {logoSrc
                ? <Box component="img" src={logoSrc} alt={slotType} sx={{ width: 20, height: 20, objectFit: "contain" }} />
                : <Typography sx={{ fontSize: "8px", color: "text.secondary" }}>?</Typography>
              }
            </TipButton>
            {isOpen && (
              <LogoPicker
                make={make}
                slotType={slotType}
                selectedLogoId={getActiveLogoId(slotType)}
                onSelectLogo={(logoId) => {
                  const kit = brandKits.find((k) => k.oem === make);
                  const logo = kit?.logos.find((l) => l.id === logoId);
                  applyLogoOverride(slotType, logo?.image ?? logoId);
                }}
                onUpload={(dataUrl) => applyLogoOverride(slotType, dataUrl)}
                onRevert={() => {
                  if (scope === "offerTemplate" && offerId && templateId) {
                    store.clearOfferTemplateLogoOverrides(projectId, offerId, templateId, make);
                  } else if (scope === "template" && templateId) {
                    store.clearTemplateLogoOverrides(projectId, templateId, make);
                  } else if (scope === "backgroundMake" && bgId) {
                    store.clearBackgroundMakeLogoOverrides(projectId, bgId, make);
                  } else {
                    store.clearOfferLogoOverrides(projectId, offerId, make);
                  }
                }}
                onClose={() => setOpenPicker(null)}
              />
            )}
          </Box>
        );
      })}

      {/* Text color swatch */}
      <Box sx={{ position: "relative" }}>
        <TipButton
          tip="Swap text color for this group"
          onClick={() => setOpenPicker(openPicker?.type === "color" && openPicker.colorIdx === 0 ? null : { type: "color", colorIdx: 0 })}
          style={{
            background: effectiveTextColor,
            border: "2px solid #fff",
            boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
            "&:hover": { transform: "scale(1.1)" },
          }}
        />
        {openPicker?.type === "color" && openPicker.colorIdx === 0 && (
          <OverrideColorPicker
            label="Text Color"
            currentColor={effectiveTextColor}
            hasOverride={hasColorOverride}
            onChangeColor={(hex) => applyColorOverride(0, hex)}
            onRevert={revertColorOverride}
            onClose={() => setOpenPicker(null)}
          />
        )}
      </Box>

      {/* Button color swatch */}
      <Box sx={{ position: "relative" }}>
        <TipButton
          tip="Swap button color for this group"
          onClick={() => setOpenPicker(openPicker?.type === "color" && openPicker.colorIdx === 1 ? null : { type: "color", colorIdx: 1 })}
          style={{
            background: effectiveBtnColor,
            border: "2px solid #fff",
            boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
            "&:hover": { transform: "scale(1.1)" },
          }}
        />
        {openPicker?.type === "color" && openPicker.colorIdx === 1 && (
          <OverrideColorPicker
            label="Button Color"
            currentColor={effectiveBtnColor}
            hasOverride={hasColorOverride}
            onChangeColor={(hex) => applyColorOverride(1, hex)}
            onRevert={revertColorOverride}
            onClose={() => setOpenPicker(null)}
          />
        )}
      </Box>
    </Box>
  );
}

// ─── TemplateThumbnailRow ─────────────────────────────────────────────────────

function TemplateThumbnailRow({ templateId, templateWidth, templateHeight, templateName, offer, projectId }: {
  templateId: string;
  templateWidth: number;
  templateHeight: number;
  templateName: string;
  offer: Offer;
  projectId: string;
}) {
  const { getBackgroundsForOfferTemplate, excludeBackgroundFromOfferTemplate } = useProjectStore();
  const [lightbox, setLightbox] = useState<BackgroundCollection | null>(null);
  const [editorBg, setEditorBg] = useState<BackgroundCollection | null>(null);
  const scale = thumbnailScale(templateWidth, templateHeight);
  const bgs = getBackgroundsForOfferTemplate(offer.id, templateId);

  return (
    <>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
        {bgs.map((bg) => (
          <Box key={bg.id} className="group" sx={{ position: "relative", flexShrink: 0 }}>
            <Box sx={{ overflow: "hidden", isolation: "isolate" }}>
              <AdTemplate projectId={projectId} templateId={templateId} offer={offer} background={bg} scale={scale} />
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
              <IconButton size="small" onClick={() => excludeBackgroundFromOfferTemplate(offer.id, templateId, bg.id)} sx={{ width: 32, height: 32, bgcolor: "#fff", "&:hover": { bgcolor: "#F3F4F6" }, boxShadow: 1 }}>
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
              offer={offer}
              background={lightbox}
              scale={Math.min(1200 / templateWidth, 720 / templateHeight)}
            />
          </Box>
        </Box>
      )}

      {/* Zone editor */}
      {editorBg && (
        <TemplateZoneEditor
          templateId={templateId}
          templateName={templateName}
          previewOffer={offer}
          previewBackground={editorBg}
          onClose={() => setEditorBg(null)}
        />
      )}
    </>
  );
}

// ─── OfferAccordion ───────────────────────────────────────────────────────────

export function OfferAccordion({ offer, backgrounds, templates, open, onToggle, onDelete, onAddBackground, onAddAll, projectId }: OfferAccordionProps) {
  const {
    getBackgroundsForOfferTemplate,
    getBackgroundsForTemplate,
    includeBackgroundForOfferTemplate,
    excludeBackgroundFromOfferTemplate,
  } = useProjectStore();

  const activeBackgrounds = [...new Map(
    templates.flatMap((t) => getBackgroundsForOfferTemplate(offer.id, t.id)).map((bg) => [bg.id, bg])
  ).values()];

  function hasRemovedBackgrounds(templateId: string): boolean {
    return getBackgroundsForOfferTemplate(offer.id, templateId).length < getBackgroundsForTemplate(templateId).length;
  }

  function restoreTemplate(templateId: string) {
    getBackgroundsForTemplate(templateId).forEach((bg) => {
      includeBackgroundForOfferTemplate(offer.id, templateId, bg.id);
    });
  }

  function hasAnyRemovedBackgrounds(): boolean {
    return templates.some((t) => hasRemovedBackgrounds(t.id));
  }

  function deleteAllForOffer() {
    templates.forEach((t) => {
      getBackgroundsForOfferTemplate(offer.id, t.id).forEach((bg) => {
        excludeBackgroundFromOfferTemplate(offer.id, t.id, bg.id);
      });
    });
  }

  function restoreAllForOffer() {
    templates.forEach((t) => {
      getBackgroundsForTemplate(t.id).forEach((bg) => {
        includeBackgroundForOfferTemplate(offer.id, t.id, bg.id);
      });
    });
  }

  const fullName = `${offer.year} ${offer.make} ${offer.model} ${offer.trim}`;
  const totalAssets = templates.reduce((sum, t) => sum + getBackgroundsForOfferTemplate(offer.id, t.id).length, 0);
  const slotTypes = [...new Set(templates.flatMap((t) => (t as Template & { logoSlots?: string[] }).logoSlots ?? []))];

  return (
    <Box sx={{ borderRadius: 1.5, bgcolor: "#fff" }}>
      {/* Header */}
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

        {/* Car image */}
        <Box sx={{ position: "relative", width: 56, height: 40, flexShrink: 0 }}>
          <Box
            component="img"
            src={offer.image}
            alt={fullName}
            sx={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain" }}
          />
        </Box>

        {/* Name + stats */}
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
              {fullName}
            </Typography>
            <SubsectionActions
              onDelete={deleteAllForOffer}
              onAddBackground={onAddAll}
              deleteTip="Delete all assets under this Offer"
              editTip="Edit all assets under this Offer"
              onRestore={hasAnyRemovedBackgrounds() ? restoreAllForOffer : undefined}
              restoreTip="Use all backgrounds added for this Offer"
            />
            {slotTypes.length > 0 && (
              <StyleOverrideButtons
                make={offer.make}
                offerId={offer.id}
                scope="offer"
                projectId={projectId}
                slotTypes={slotTypes}
              />
            )}
          </Box>
          <Typography sx={{ fontSize: "0.75rem", color: "text.secondary" }}>
            {templates.length} templates · {totalAssets} asset{totalAssets !== 1 ? "s" : ""}
          </Typography>
        </Box>

        {/* Right: thumbnails + logos */}
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

          {slotTypes.map((slotType) => {
            const [title, subtitle] = slotType.split("-").map((s) => s.charAt(0).toUpperCase() + s.slice(1));
            return (
              <Box key={slotType} sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                <BrandLogoMini make={offer.make} slotType={slotType} projectId={projectId} />
                {open && (
                  <Box>
                    <Typography sx={{ fontSize: "9px", fontWeight: 500, lineHeight: 1.2 }}>{title}</Typography>
                    <Typography sx={{ fontSize: "9px", color: "text.secondary", lineHeight: 1.2 }}>{subtitle}</Typography>
                  </Box>
                )}
              </Box>
            );
          })}
        </Box>
      </Box>

      {/* Expanded content */}
      {open && (
        <Box sx={{ borderTop: "1px solid", borderColor: "divider", borderBottomLeftRadius: 6, borderBottomRightRadius: 6, overflow: "visible" }}>
          {templates.map((template, idx) => (
            <Box
              key={template.id}
              className="group/row"
              sx={{
                px: 2,
                py: 1.5,
                borderBottomLeftRadius: 6,
                borderBottomRightRadius: 6,
                transition: "background 0.15s",
                "&:hover": { bgcolor: "#F9FAFB" },
                ...(idx < templates.length - 1 ? { borderBottom: "1px solid #FAFAFA" } : {}),
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                  }}
                >
                  <TemplateWireframe
                    templateId={template.id}
                    scale={Math.min(40 / template.width, 40 / template.height)}
                  />
                </Box>
                <Typography sx={{ fontSize: "0.75rem", fontWeight: 500, color: "text.primary" }}>
                  {template.name}
                </Typography>
                <SubsectionActions
                  onDelete={() => onDelete(template.id)}
                  onAddBackground={() => onAddBackground(template.id)}
                  onRestore={hasRemovedBackgrounds(template.id) ? () => restoreTemplate(template.id) : undefined}
                  restoreTip="Add back removed backgrounds"
                />
                {slotTypes.length > 0 && (
                  <StyleOverrideButtons
                    make={offer.make}
                    offerId={offer.id}
                    templateId={template.id}
                    scope="offerTemplate"
                    projectId={projectId}
                    slotTypes={slotTypes}
                  />
                )}
              </Box>
              <TemplateThumbnailRow
                templateId={template.id}
                templateWidth={template.width}
                templateHeight={template.height}
                templateName={template.name}
                offer={offer}
                projectId={projectId}
              />
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}
