import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import SlidersHorizontalIcon from "@mui/icons-material/Tune";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import DownloadIcon from "@mui/icons-material/Download";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import AddIcon from "@mui/icons-material/Add";
import ViewSidebarIcon from "@mui/icons-material/ViewSidebar";

import { useSidebar } from "./lib/sidebar-context";
import { SelectBackgroundDialog } from "./logos-backgrounds/SelectBackgroundDialog";
import type { BackgroundCollection } from "./logos-backgrounds/BackgroundCollectionCard";
import { createRoot } from "react-dom/client";
import { toPng } from "html-to-image";
import JSZip from "jszip";
import { AdTemplate } from "./templates/AdTemplate";
import { OfferSlotThumbnail, KeyMessageInlineInputs } from "./logos-backgrounds/CombinationAccordion";
import { getProjectOffers, getProjectTemplates, getProjectById, offerLibrary } from "./lib/mock-data";
import type { Offer } from "./lib/mock-data";
import { useProjectStore } from "./lib/project-store";
import { matchesLifestyle, matchesMultiLifestyle } from "./lib/lifestyle-data";
import { thumbnailScale } from "./lib/thumbnail-scale";
import { optimizeImageWithReplicate } from "./lib/api-client";

// ─── Utility: letterbox helpers (unchanged logic) ────────────────────────────

interface PadInfo {
  paddedUrl: string;
  origW: number;
  origH: number;
  padTop: number;
  padLeft: number;
  paddedW: number;
  paddedH: number;
}

function letterboxForAI(dataUrl: string): Promise<PadInfo> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => {
      const origW = img.naturalWidth || img.width;
      const origH = img.naturalHeight || img.height;
      const ratio = origW / origH;
      const MAX_RATIO = 16 / 9;
      const MIN_RATIO = 9 / 16;

      let paddedW = origW;
      let paddedH = origH;
      let padTop = 0;
      let padLeft = 0;

      if (ratio > MAX_RATIO) {
        paddedH = Math.round(origW / MAX_RATIO);
        padTop = Math.round((paddedH - origH) / 2);
      } else if (ratio < MIN_RATIO) {
        paddedW = Math.round(origH * MIN_RATIO);
        padLeft = Math.round((paddedW - origW) / 2);
      }

      const canvas = document.createElement("canvas");
      canvas.width = paddedW;
      canvas.height = paddedH;
      const ctx = canvas.getContext("2d")!;

      if (padTop > 0) {
        ctx.drawImage(img, 0, 0, origW, 1, 0, 0, paddedW, padTop);
        ctx.drawImage(img, 0, origH - 1, origW, 1, 0, padTop + origH, paddedW, paddedH - padTop - origH);
      } else if (padLeft > 0) {
        ctx.drawImage(img, 0, 0, 1, origH, 0, 0, padLeft, paddedH);
        ctx.drawImage(img, origW - 1, 0, 1, origH, padLeft + origW, 0, paddedW - padLeft - origW, paddedH);
      }

      ctx.drawImage(img, padLeft, padTop, origW, origH);

      resolve({
        paddedUrl: canvas.toDataURL("image/png"),
        origW, origH,
        padTop, padLeft,
        paddedW, paddedH,
      });
    };
    img.onerror = () => {
      resolve({ paddedUrl: dataUrl, origW: 1, origH: 1, padTop: 0, padLeft: 0, paddedW: 1, paddedH: 1 });
    };
    img.src = dataUrl;
  });
}

function compressForApi(dataUrl: string, maxDim = 1400, quality = 0.85): Promise<string> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => {
      let w = img.naturalWidth || img.width;
      let h = img.naturalHeight || img.height;
      if (Math.max(w, h) > maxDim) {
        const scale = maxDim / Math.max(w, h);
        w = Math.round(w * scale);
        h = Math.round(h * scale);
      }
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      canvas.getContext("2d")!.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

function cropAndResizeResult(
  dataUrl: string,
  pad: PadInfo,
  targetW: number,
  targetH: number,
): Promise<string> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => {
      const scaleX = img.naturalWidth / pad.paddedW;
      const scaleY = img.naturalHeight / pad.paddedH;
      const sx = pad.padLeft * scaleX;
      const sy = pad.padTop * scaleY;
      const sw = pad.origW * scaleX;
      const sh = pad.origH * scaleY;
      const canvas = document.createElement("canvas");
      canvas.width = targetW;
      canvas.height = targetH;
      canvas.getContext("2d")!.drawImage(img, sx, sy, sw, sh, 0, 0, targetW, targetH);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

function waitForImages(container: HTMLElement): Promise<void> {
  const imgs = Array.from(container.querySelectorAll("img"));
  return Promise.all(
    imgs.map((img) => new Promise<void>((resolve) => {
      if (img.complete) { resolve(); return; }
      img.onload = () => resolve();
      img.onerror = () => resolve();
    }))
  ).then(() => undefined);
}

// ─── Spinning SVG used in multiple places ────────────────────────────────────

function SpinnerSvg({ size = 14, color = "var(--brand-accent)" }: { size?: number; color?: string }) {
  return (
    <Box
      component="svg"
      viewBox="0 0 24 24"
      fill="none"
      sx={{
        width: size,
        height: size,
        flexShrink: 0,
        animation: "spin 1s linear infinite",
        "@keyframes spin": { "100%": { transform: "rotate(360deg)" } },
        color,
      }}
    >
      <circle opacity={0.25} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path opacity={0.75} fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
    </Box>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export function PreviewPage({ projectId, onNavigateTo }: { projectId: string; onNavigateTo: (page: string) => void }) {
  const id = projectId;
  const project = getProjectById(id);
  const { toggleSidebar, sidebarOpen } = useSidebar();
  const allOffers = getProjectOffers(id);
  const templates = getProjectTemplates(id);
  const singleTemplates = templates.filter((t) => t.products === 1);
  const multiTemplates = templates.filter((t) => t.products > 1);
  const [zoom, setZoom] = useState(1);
  const [exporting, setExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [optimizing, setOptimizing] = useState<Set<string>>(new Set());
  const [addBgOpen, setAddBgOpen] = useState(false);
  const {
    backgrounds,
    addBackgrounds,
    getBackgroundsForTemplate,
    getBackgroundsForOfferTemplate,
    excludeBackgroundFromOfferTemplate,
    clearExclusionsForBackground,
    aiResults,
    setAiResult,
    clearAiResult,
    combinations,
    setCombinationOfferAtSlot,
    reEvaluateMultiLifestyleForCombo,
    deletedOfferIds,
    addedOfferIds,
    customTemplateFields,
  } = useProjectStore();

  const extraOffers = (addedOfferIds[id] ?? [])
    .map((aid) => offerLibrary.find((o) => o.id === aid))
    .filter((o): o is Offer => !!o);
  const offers = [...allOffers, ...extraOffers].filter((o) => !deletedOfferIds.has(o.id));

  const [lightbox, setLightbox] = useState<{
    offer?: typeof offers[0];
    offers?: (typeof offers[0] | undefined)[];
    template: typeof templates[0];
    bg: BackgroundCollection;
    aiResult?: string;
  } | null>(null);

  function getComboSlotOffers(combo: { id: string; offerIds: string[] }) {
    const slotCount = multiTemplates[0]?.products ?? 3;
    return Array.from({ length: slotCount }, (_, i) => {
      const oid = combo.offerIds[i];
      if (oid === undefined) return offers[i];
      if (oid === "") return undefined;
      return offers.find((o) => o.id === oid);
    });
  }

  function handleAddBackgrounds(collections: BackgroundCollection[]) {
    addBackgrounds(collections);
    clearExclusionsForBackground(collections.map((c) => c.id));

    collections.filter((c) => c.isLifestyle && c.vehicleTag && !c.vehicleTags?.length).forEach((bg) => {
      offers.forEach((offer) => {
        if (!matchesLifestyle(bg, offer.model, offer.trim)) {
          templates.forEach((tpl) => {
            excludeBackgroundFromOfferTemplate(offer.id, tpl.id, bg.id);
          });
        }
      });
      combinations.forEach((combo) => {
        multiTemplates.forEach((tpl) => {
          excludeBackgroundFromOfferTemplate(combo.id, tpl.id, bg.id);
        });
      });
    });

    collections.filter((c) => c.isLifestyle && c.vehicleTags?.length).forEach((bg) => {
      offers.forEach((offer) => {
        singleTemplates.forEach((tpl) => {
          excludeBackgroundFromOfferTemplate(offer.id, tpl.id, bg.id);
        });
      });
      combinations.forEach((combo) => {
        const slotCount = multiTemplates[0]?.products ?? 3;
        const comboVehicleFilters = Array.from({ length: slotCount }, (_, i) => {
          const slotId = combo.offerIds[i] ?? offers[i]?.id;
          const offer = offers.find((o) => o.id === slotId);
          return offer ? `${offer.model} ${offer.trim}` : null;
        }).filter(Boolean) as string[];
        if (!matchesMultiLifestyle(bg, comboVehicleFilters)) {
          multiTemplates.forEach((tpl) => {
            excludeBackgroundFromOfferTemplate(combo.id, tpl.id, bg.id);
          });
        }
      });
    });

    setAddBgOpen(false);
  }

  function handleZoomIn() { setZoom((z) => Math.min(z + 0.25, 2)); }
  function handleZoomOut() { setZoom((z) => Math.max(z - 0.25, 0.25)); }

  async function handleOptimize(
    offerId: string,
    templateId: string,
    bgId: string,
    offer: typeof offers[0] | undefined,
    bg: ReturnType<typeof getBackgroundsForTemplate>[0],
    template: typeof templates[0],
  ) {
    const key = `${offerId}_${templateId}_${bgId}`;
    setOptimizing((prev) => new Set(prev).add(key));

    try {
      if (import.meta.env.DEV) console.log("[Optimize] Rendering off-screen for", key);
      const container = document.createElement("div");
      container.style.cssText = "position:fixed;left:0;top:0;z-index:9999;opacity:0.001;pointer-events:none;";
      document.body.appendChild(container);

      const root = createRoot(container);
      root.render(
        <div style={{ width: template.width, height: template.height, overflow: "hidden", position: "relative" }}>
          <AdTemplate
            templateId={template.id}
            offer={offer}
            background={bg}
            scale={1}
            forExport
            layerMode="bg-car"
          />
        </div>
      );

      await new Promise<void>((r) => setTimeout(r, 50));
      container.querySelectorAll("img").forEach((img) => {
        img.crossOrigin = "anonymous";
        if (img.getAttribute("loading") === "lazy") {
          img.setAttribute("loading", "eager");
          const src = img.src; img.src = ""; img.src = src;
        }
      });
      await waitForImages(container);
      await new Promise<void>((r) => setTimeout(r, 400));

      if (import.meta.env.DEV) console.log("[Optimize] Capturing PNG via toPng...");
      const el = container.firstElementChild as HTMLElement;
      const imageDataUrl = await toPng(el, { pixelRatio: 1, skipFonts: true, cacheBust: true });

      root.unmount();
      document.body.removeChild(container);

      const pad = await letterboxForAI(imageDataUrl);
      if (import.meta.env.DEV) console.log("[Optimize] Compressing for API...");
      const compressed = await compressForApi(pad.paddedUrl);

      if (import.meta.env.DEV) console.log("[Optimize] Sending to Replicate...");
      const result = await optimizeImageWithReplicate(compressed);

      const resized = await cropAndResizeResult(result, pad, template.width, template.height);
      setAiResult(key, resized);
      if (import.meta.env.DEV) console.log("[Optimize] Done!");
    } catch (err) {
      console.error("[Optimize] Failed:", err);
    } finally {
      setOptimizing((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    }
  }

  async function handleOptimizeAllOffer(offer: typeof offers[0]) {
    const jobs = singleTemplates.flatMap((template) =>
      getBackgroundsForOfferTemplate(offer.id, template.id).map((bg) => ({ template, bg }))
    );
    await Promise.all(
      jobs.map(({ template, bg }) =>
        handleOptimize(offer.id, template.id, bg.id, offer, bg, template)
      )
    );
  }

  async function handleOptimizeAll(combo: { id: string; offerIds: string[] }, slotOffers: (typeof offers[0] | undefined)[]) {
    const jobs = multiTemplates.flatMap((template) =>
      getBackgroundsForOfferTemplate(combo.id, template.id).map((bg) => ({ template, bg }))
    );
    await Promise.all(
      jobs.map(({ template, bg }) =>
        handleOptimize(combo.id, template.id, bg.id, slotOffers[0], bg, template)
      )
    );
  }

  async function exportAllAssets() {
    setExporting(true);
    setExportProgress(0);

    const jobs: Array<{
      offer?: typeof offers[0];
      offers?: (typeof offers[0] | undefined)[];
      template: typeof templates[0];
      bg: ReturnType<typeof getBackgroundsForTemplate>[0];
    }> = [];

    for (const offer of offers) {
      for (const template of singleTemplates) {
        for (const bg of getBackgroundsForOfferTemplate(offer.id, template.id)) {
          jobs.push({ offer, offers: [offer], template, bg });
        }
      }
    }
    for (const combo of combinations) {
      const slotOffers = getComboSlotOffers(combo);
      for (const template of multiTemplates) {
        for (const bg of getBackgroundsForOfferTemplate(combo.id, template.id)) {
          jobs.push({ offer: slotOffers[0], offers: slotOffers, template, bg });
        }
      }
    }

    if (jobs.length === 0) { setExporting(false); return; }

    const zip = new JSZip();
    const offscreen = document.createElement("div");
    offscreen.style.cssText = "position:fixed;left:0;top:0;z-index:9999;opacity:0.001;pointer-events:none;";
    document.body.appendChild(offscreen);

    try {
      for (let i = 0; i < jobs.length; i++) {
        const { offer, template, bg } = jobs[i];
        const container = document.createElement("div");
        offscreen.appendChild(container);

        const root = createRoot(container);
        const aiKey = `${offer?.id ?? ""}_${template.id}_${bg.id}`;
        const aiResult = aiResults.get(aiKey);

        if (aiResult) {
          root.render(
            <div style={{ position: "relative", width: template.width, height: template.height, overflow: "hidden" }}>
              <img
                src={aiResult}
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
              />
              <div style={{ position: "absolute", inset: 0 }}>
                <AdTemplate
                  templateId={template.id}
                  offer={offer}
                  offers={jobs[i].offers}
                  background={bg}
                  scale={1}
                  dealerName={project.dealerName}
                  cta={project.ctaText || "Shop Now"}
                  leaseLabel={project.leaseLabel || undefined}
                  finePrint={project.finePrint || undefined}
                  forExport
                  layerMode="ui"
                />
              </div>
            </div>
          );
        } else {
          root.render(
            <AdTemplate
              templateId={template.id}
              offer={offer}
              offers={jobs[i].offers}
              background={bg}
              scale={1}
              dealerName={project.dealerName}
              cta={project.ctaText || "Shop Now"}
              leaseLabel={project.leaseLabel || undefined}
              finePrint={project.finePrint || undefined}
              forExport
            />
          );
        }

        await new Promise<void>((r) => setTimeout(r, 50));

        container.querySelectorAll("img").forEach((img) => {
          if (img.getAttribute("loading") === "lazy") {
            img.setAttribute("loading", "eager");
            const src = img.src;
            img.src = "";
            img.src = src;
          }
        });

        await waitForImages(container);
        await new Promise<void>((r) => setTimeout(r, 400));

        const el = container.firstElementChild as HTMLElement;
        let png: string;
        try {
          png = await Promise.race([
            toPng(el, { pixelRatio: 1, skipFonts: true, cacheBust: true }),
            new Promise<never>((_, reject) => setTimeout(() => reject(new Error("toPng timeout")), 15000)),
          ]);
        } catch (err) {
          if (import.meta.env.DEV) console.warn(`Export failed for job ${i}:`, err);
          root.unmount();
          offscreen.removeChild(container);
          setExportProgress(Math.round(((i + 1) / jobs.length) * 100));
          continue;
        }

        const folder = offer
          ? `${offer.year}_${offer.make}_${offer.model}_${offer.trim}`.replace(/\s+/g, "_")
          : "Multiple_Offers";
        const file = `${template.id}_${(bg.name || bg.id).replace(/\s+/g, "_")}.png`;
        zip.file(`${folder}/${file}`, png.split(",")[1], { base64: true });

        root.unmount();
        offscreen.removeChild(container);
        setExportProgress(Math.round(((i + 1) / jobs.length) * 100));
      }

      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "assets.zip";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } finally {
      document.body.removeChild(offscreen);
      setExporting(false);
      setExportProgress(0);
    }
  }

  // ─── Shared pill-button sx ────────────────────────────────────────────────
  const brandPillSx = {
    display: "inline-flex",
    alignItems: "center",
    gap: 0.75,
    fontSize: "0.75rem",
    fontWeight: 600,
    color: "#fff",
    bgcolor: "var(--brand-accent)",
    borderRadius: "999px",
    px: 1.5,
    py: 0.75,
    border: "none",
    cursor: "pointer",
    transition: "background 0.2s",
    "&:hover": { bgcolor: "var(--brand-accent-hover)" },
  } as const;

  const optimizingPillSx = {
    display: "inline-flex",
    alignItems: "center",
    gap: 0.75,
    fontSize: "0.75rem",
    fontWeight: 500,
    color: "var(--brand-accent)",
    bgcolor: "rgba(var(--brand-accent-rgb, 71 59 171) / 0.08)",
    border: "1px solid rgba(var(--brand-accent-rgb, 71 59 171) / 0.2)",
    borderRadius: "999px",
    px: 1.5,
    py: 0.75,
  } as const;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Page header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, px: 3, py: 1.5, bgcolor: "#fff" }}>
        <Tooltip title={sidebarOpen ? "Close sidebar" : "Open sidebar"}>
          <IconButton
            onClick={toggleSidebar}
            size="small"
            sx={{
              width: 28,
              height: 28,
              borderRadius: 1,
              color: sidebarOpen ? "var(--brand-accent)" : "text.disabled",
              bgcolor: sidebarOpen ? "rgba(var(--brand-accent-rgb, 71 59 171) / 0.08)" : "transparent",
              "&:hover": { bgcolor: "#F3F4F6" },
            }}
          >
            <ViewSidebarIcon sx={{ fontSize: 15 }} />
          </IconButton>
        </Tooltip>

        <Typography sx={{ fontSize: "1.125rem", fontWeight: 600, color: "text.primary" }}>
          Preview
        </Typography>

        {/* Group by Offer pill */}
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 0.5,
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 1.5,
            px: 1.5,
            py: 0.75,
            fontSize: "0.75rem",
            color: "text.secondary",
            cursor: "pointer",
            ml: 1,
            "&:hover": { bgcolor: "#F9FAFB" },
          }}
        >
          Group by Offer
          <KeyboardArrowDownIcon sx={{ fontSize: 13, color: "text.disabled", ml: 0.5 }} />
        </Box>

        {/* Add Background */}
        <Box
          component="button"
          onClick={() => setAddBgOpen(true)}
          sx={{ ...brandPillSx, ml: "auto" }}
        >
          <AddIcon sx={{ fontSize: 13 }} />
          Add Background
        </Box>

        {/* Zoom controls + Export */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton
            onClick={handleZoomOut}
            size="small"
            sx={{
              width: 32,
              height: 32,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1.5,
              color: "text.secondary",
              "&:hover": { bgcolor: "#F9FAFB" },
            }}
          >
            <ZoomOutIcon sx={{ fontSize: 14 }} />
          </IconButton>

          <Typography sx={{ fontSize: "0.75rem", color: "text.secondary", width: 40, textAlign: "center" }}>
            {Math.round(zoom * 100)}%
          </Typography>

          <IconButton
            onClick={handleZoomIn}
            size="small"
            sx={{
              width: 32,
              height: 32,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1.5,
              color: "text.secondary",
              "&:hover": { bgcolor: "#F9FAFB" },
            }}
          >
            <ZoomInIcon sx={{ fontSize: 14 }} />
          </IconButton>

          <Box sx={{ width: "1px", height: 20, bgcolor: "divider", mx: 0.5 }} />

          <Box
            component="button"
            onClick={exportAllAssets}
            disabled={exporting || backgrounds.length === 0}
            sx={{
              ...brandPillSx,
              opacity: (exporting || backgrounds.length === 0) ? 0.5 : 1,
              cursor: (exporting || backgrounds.length === 0) ? "not-allowed" : "pointer",
            }}
          >
            <DownloadIcon sx={{ fontSize: 13 }} />
            {exporting ? `${exportProgress}%` : "Export"}
          </Box>
        </Box>
      </Box>

      {/* Canvas */}
      <Box sx={{ flex: 1, overflow: "auto", bgcolor: "#F3F4F6" }}>
        {backgrounds.length === 0 ? (
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 1.5, color: "text.disabled" }}>
            <Box
              component="svg"
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M3 7V5a2 2 0 012-2h2M17 3h2a2 2 0 012 2v2M21 17v2a2 2 0 01-2 2h-2M7 21H5a2 2 0 01-2-2v-2" />
            </Box>
            <Typography sx={{ fontSize: "0.875rem" }}>No backgrounds added yet.</Typography>
            <Box
              component="button"
              onClick={() => onNavigateTo("logos-backgrounds")}
              sx={{
                fontSize: "0.875rem",
                fontWeight: 500,
                color: "var(--brand-accent)",
                background: "none",
                border: "none",
                cursor: "pointer",
                "&:hover": { color: "var(--brand-accent-hover)" },
              }}
            >
              Go to Styles →
            </Box>
          </Box>
        ) : (
          <Box
            sx={{ px: 4, py: 3, transformOrigin: "top left" }}
            style={{
              transform: zoom !== 1 ? `scale(${zoom})` : undefined,
              transformOrigin: "top left",
              minWidth: "max-content",
            }}
          >
            {/* ── Single-product offers ── */}
            {singleTemplates.length > 0 && offers.map((offer) => {
              const hasAssets = singleTemplates.some(
                (t) => getBackgroundsForOfferTemplate(offer.id, t.id).length > 0
              );
              if (!hasAssets) return null;

              const offerAllKeys = singleTemplates.flatMap((t) =>
                getBackgroundsForOfferTemplate(offer.id, t.id).map((bg) => `${offer.id}_${t.id}_${bg.id}`)
              );
              const isOfferOptimizing = offerAllKeys.some((k) => optimizing.has(k));
              const offerHasAny = offerAllKeys.length > 0;
              const offerAllDone = offerAllKeys.every((k) => aiResults.has(k));

              return (
                <Box key={offer.id} sx={{ mb: 6 }}>
                  {/* Offer header */}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2.5 }}>
                    <Box component="input" type="checkbox" sx={{ width: 16, height: 16 }} />
                    <Box sx={{ position: "relative", width: 40, height: 28 }}>
                      <Box
                        component="img"
                        src={offer.image}
                        alt={offer.model}
                        sx={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain" }}
                      />
                    </Box>
                    <Typography sx={{ fontSize: "0.875rem", fontWeight: 600, color: "text.primary" }}>
                      {offer.year} {offer.make} {offer.model} {offer.trim}
                    </Typography>
                    <SlidersHorizontalIcon sx={{ fontSize: 14, color: "text.disabled" }} />

                    {offerHasAny && (
                      isOfferOptimizing ? (
                        <Box sx={{ ...optimizingPillSx, ml: 0.5 }}>
                          <SpinnerSvg size={14} />
                          Optimizing…
                        </Box>
                      ) : (
                        <Box
                          component="button"
                          onClick={() => handleOptimizeAllOffer(offer)}
                          sx={{
                            ...optimizingPillSx,
                            ml: 0.5,
                            cursor: "pointer",
                            fontWeight: 600,
                            "&:hover": { bgcolor: "rgba(var(--brand-accent-rgb, 71 59 171) / 0.1)" },
                          }}
                        >
                          <AutoAwesomeIcon sx={{ fontSize: 12 }} />
                          {offerAllDone ? "Re-optimize all" : "Optimize all"}
                        </Box>
                      )
                    )}
                  </Box>

                  {/* Templates */}
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                    {singleTemplates.map((template) => {
                      const bgs = getBackgroundsForOfferTemplate(offer.id, template.id);
                      if (bgs.length === 0) return null;
                      const scale = thumbnailScale(template.width, template.height);
                      const scaledW = Math.round(template.width * scale);
                      const scaledH = Math.round(template.height * scale);
                      const tplKeys = bgs.map((bg) => `${offer.id}_${template.id}_${bg.id}`);
                      const isTplOptimizing = tplKeys.some((k) => optimizing.has(k));
                      const tplAllDone = tplKeys.every((k) => aiResults.has(k));

                      return (
                        <Box
                          key={template.id}
                          sx={{
                            "&:hover .tpl-optimize-btn": { opacity: 1 },
                          }}
                        >
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                            <Typography sx={{ fontSize: "0.75rem", fontWeight: 500, color: "text.secondary" }}>
                              {template.name}
                            </Typography>
                            {isTplOptimizing ? (
                              <Box
                                className="tpl-optimize-btn"
                                sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, fontSize: "0.75rem", fontWeight: 500, color: "var(--brand-accent)", opacity: 0, transition: "opacity 0.2s" }}
                              >
                                <SpinnerSvg size={12} />
                                Optimizing…
                              </Box>
                            ) : (
                              <Box
                                component="button"
                                className="tpl-optimize-btn"
                                onClick={() => Promise.all(bgs.map((bg) => handleOptimize(offer.id, template.id, bg.id, offer, bg, template)))}
                                sx={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 0.5,
                                  fontSize: "0.75rem",
                                  fontWeight: 600,
                                  color: "var(--brand-accent)",
                                  background: "none",
                                  border: "none",
                                  cursor: "pointer",
                                  opacity: 0,
                                  transition: "opacity 0.2s",
                                  "&:hover": { color: "var(--brand-accent-hover)" },
                                }}
                              >
                                <AutoAwesomeIcon sx={{ fontSize: 11 }} />
                                {tplAllDone ? "Re-optimize all" : "Optimize all"}
                              </Box>
                            )}
                          </Box>

                          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
                            {bgs.map((bg) => {
                              const aiKey = `${offer.id}_${template.id}_${bg.id}`;
                              const aiResult = aiResults.get(aiKey);
                              const isOptimizing = optimizing.has(aiKey);

                              return (
                                <Box
                                  key={bg.id}
                                  sx={{
                                    position: "relative",
                                    flexShrink: 0,
                                    overflow: "hidden",
                                    "&:hover .card-overlay": { opacity: 1 },
                                  }}
                                >
                                  {aiResult ? (
                                    <Box style={{ width: scaledW, height: scaledH, position: "relative", overflow: "hidden" }}>
                                      <img src={aiResult} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                                      <div style={{ position: "absolute", inset: 0 }}>
                                        <AdTemplate projectId={id} templateId={template.id} offer={offer} background={bg} scale={scale} dealerName={project.dealerName} cta={project.ctaText || "Shop Now"} leaseLabel={project.leaseLabel || undefined} finePrint={project.finePrint || undefined} layerMode="ui" />
                                      </div>
                                    </Box>
                                  ) : (
                                    <AdTemplate projectId={id} templateId={template.id} offer={offer} background={bg} scale={scale} dealerName={project.dealerName} cta={project.ctaText || "Shop Now"} leaseLabel={project.leaseLabel || undefined} finePrint={project.finePrint || undefined} />
                                  )}

                                  {/* Hover overlay */}
                                  <Box
                                    className="card-overlay"
                                    sx={{
                                      position: "absolute",
                                      inset: 0,
                                      bgcolor: "rgba(0,0,0,0.4)",
                                      opacity: 0,
                                      transition: "opacity 0.2s",
                                      display: "flex",
                                      flexDirection: "column",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      gap: 1,
                                      zIndex: 10,
                                    }}
                                  >
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                      {[
                                        { Icon: VisibilityIcon, onClick: () => setLightbox({ offer, offers: [offer], template, bg, aiResult }) },
                                        { Icon: DeleteIcon, onClick: () => excludeBackgroundFromOfferTemplate(offer.id, template.id, bg.id) },
                                        { Icon: EditIcon, onClick: () => {} },
                                      ].map(({ Icon, onClick }, idx) => (
                                        <IconButton
                                          key={idx}
                                          onClick={onClick}
                                          size="small"
                                          sx={{ width: 32, height: 32, borderRadius: "50%", bgcolor: "#fff", color: "#374151", boxShadow: 1, "&:hover": { bgcolor: "#F3F4F6" } }}
                                        >
                                          <Icon sx={{ fontSize: 14 }} />
                                        </IconButton>
                                      ))}
                                    </Box>

                                    {isOptimizing ? (
                                      <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.75, bgcolor: "rgba(255,255,255,0.9)", borderRadius: "999px", px: 1.5, py: 0.75, fontSize: "0.75rem", fontWeight: 500, color: "text.primary" }}>
                                        <SpinnerSvg size={14} />
                                        Optimizing…
                                      </Box>
                                    ) : (
                                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                        <Box
                                          component="button"
                                          onClick={() => handleOptimize(offer.id, template.id, bg.id, offer, bg, template)}
                                          sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, bgcolor: "rgba(255,255,255,0.9)", borderRadius: "999px", px: 1.5, py: 0.75, fontSize: "0.75rem", fontWeight: 600, color: "var(--brand-accent)", border: "none", cursor: "pointer", boxShadow: 1, "&:hover": { bgcolor: "#fff" } }}
                                        >
                                          <AutoAwesomeIcon sx={{ fontSize: 12 }} />
                                          {aiResult ? "Re-optimize" : "Optimize"}
                                        </Box>
                                        {aiResult && (
                                          <Box
                                            component="button"
                                            onClick={() => clearAiResult(aiKey)}
                                            sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, bgcolor: "rgba(255,255,255,0.9)", borderRadius: "999px", px: 1.5, py: 0.75, fontSize: "0.75rem", fontWeight: 600, color: "text.secondary", border: "none", cursor: "pointer", boxShadow: 1, "&:hover": { bgcolor: "#fff" } }}
                                          >
                                            <RestartAltIcon sx={{ fontSize: 12 }} />
                                            Reset
                                          </Box>
                                        )}
                                      </Box>
                                    )}
                                  </Box>
                                </Box>
                              );
                            })}
                          </Box>
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              );
            })}

            {/* ── Multi-product combinations ── */}
            {multiTemplates.length > 0 && combinations.map((combo) => {
              const slotOffers = getComboSlotOffers(combo);
              const hasAssets = multiTemplates.some(
                (t) => getBackgroundsForOfferTemplate(combo.id, t.id).length > 0
              );
              if (!hasAssets) return null;

              const comboAllKeys = multiTemplates.flatMap((t) =>
                getBackgroundsForOfferTemplate(combo.id, t.id).map((bg) => `${combo.id}_${t.id}_${bg.id}`)
              );
              const isComboOptimizing = comboAllKeys.some((k) => optimizing.has(k));
              const comboHasAny = comboAllKeys.length > 0;
              const comboAllDone = comboAllKeys.every((k) => aiResults.has(k));

              return (
                <Box key={combo.id} sx={{ mb: 6 }}>
                  {/* Combination header */}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2.5 }}>
                    <Box component="input" type="checkbox" sx={{ width: 16, height: 16 }} />
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      {slotOffers.map((offer, i) => (
                        <OfferSlotThumbnail
                          key={i}
                          slotIndex={i}
                          offer={offer}
                          allOffers={offers}
                          onSelect={(offerId) => {
                            setCombinationOfferAtSlot(combo.id, i, offerId);
                            reEvaluateMultiLifestyleForCombo(
                              combo.id, i, offerId, offers,
                              multiTemplates.map((t) => t.id),
                              multiTemplates[0]?.products ?? 3
                            );
                          }}
                        />
                      ))}
                    </Box>
                    <Typography sx={{ fontSize: "0.875rem", fontWeight: 600, color: "text.primary" }}>
                      Multiple offers
                    </Typography>
                    <SlidersHorizontalIcon sx={{ fontSize: 14, color: "text.disabled" }} />

                    {comboHasAny && (
                      isComboOptimizing ? (
                        <Box sx={{ ...optimizingPillSx, ml: 0.5 }}>
                          <SpinnerSvg size={14} />
                          Optimizing…
                        </Box>
                      ) : (
                        <Box
                          component="button"
                          onClick={() => handleOptimizeAll(combo, slotOffers)}
                          sx={{
                            ...optimizingPillSx,
                            ml: 0.5,
                            cursor: "pointer",
                            fontWeight: 600,
                            "&:hover": { bgcolor: "rgba(var(--brand-accent-rgb, 71 59 171) / 0.1)" },
                          }}
                        >
                          <AutoAwesomeIcon sx={{ fontSize: 12 }} />
                          {comboAllDone ? "Re-optimize all" : "Optimize all"}
                        </Box>
                      )
                    )}
                  </Box>

                  {/* Templates */}
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                    {multiTemplates.map((template) => {
                      const bgs = getBackgroundsForOfferTemplate(combo.id, template.id);
                      if (bgs.length === 0) return null;
                      const scale = thumbnailScale(template.width, template.height);
                      const scaledW = Math.round(template.width * scale);
                      const scaledH = Math.round(template.height * scale);
                      const tplKeys = bgs.map((bg) => `${combo.id}_${template.id}_${bg.id}`);
                      const isTplOptimizing = tplKeys.some((k) => optimizing.has(k));
                      const tplAllDone = tplKeys.every((k) => aiResults.has(k));

                      return (
                        <Box
                          key={template.id}
                          sx={{ "&:hover .tpl-optimize-btn": { opacity: 1 } }}
                        >
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                            <Typography sx={{ fontSize: "0.75rem", fontWeight: 500, color: "text.secondary" }}>
                              {template.name}
                            </Typography>
                            {isTplOptimizing ? (
                              <Box className="tpl-optimize-btn" sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, fontSize: "0.75rem", fontWeight: 500, color: "var(--brand-accent)", opacity: 0, transition: "opacity 0.2s" }}>
                                <SpinnerSvg size={12} />
                                Optimizing…
                              </Box>
                            ) : (
                              <Box
                                component="button"
                                className="tpl-optimize-btn"
                                onClick={() => Promise.all(bgs.map((bg) => handleOptimize(combo.id, template.id, bg.id, slotOffers[0], bg, template)))}
                                sx={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 0.5,
                                  fontSize: "0.75rem",
                                  fontWeight: 600,
                                  color: "var(--brand-accent)",
                                  background: "none",
                                  border: "none",
                                  cursor: "pointer",
                                  opacity: 0,
                                  transition: "opacity 0.2s",
                                  "&:hover": { color: "var(--brand-accent-hover)" },
                                }}
                              >
                                <AutoAwesomeIcon sx={{ fontSize: 11 }} />
                                {tplAllDone ? "Re-optimize all" : "Optimize all"}
                              </Box>
                            )}
                          </Box>

                          <KeyMessageInlineInputs templateId={template.id} white />

                          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
                            {bgs.map((bg) => {
                              const aiKey = `${combo.id}_${template.id}_${bg.id}`;
                              const aiResult = aiResults.get(aiKey);
                              const isOptimizing = optimizing.has(aiKey);

                              return (
                                <Box
                                  key={bg.id}
                                  sx={{
                                    position: "relative",
                                    flexShrink: 0,
                                    overflow: "hidden",
                                    "&:hover .card-overlay": { opacity: 1 },
                                  }}
                                >
                                  {aiResult ? (
                                    <Box style={{ width: scaledW, height: scaledH, position: "relative", overflow: "hidden" }}>
                                      <img src={aiResult} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                                      <div style={{ position: "absolute", inset: 0 }}>
                                        <AdTemplate projectId={id} templateId={template.id} offer={slotOffers[0]} offers={slotOffers} background={bg} scale={scale} dealerName={project.dealerName} cta={project.ctaText || "Shop Now"} leaseLabel={project.leaseLabel || undefined} finePrint={project.finePrint || undefined} layerMode="ui" customFields={customTemplateFields[template.id]} />
                                      </div>
                                    </Box>
                                  ) : (
                                    <AdTemplate projectId={id} templateId={template.id} offer={slotOffers[0]} offers={slotOffers} background={bg} scale={scale} dealerName={project.dealerName} cta={project.ctaText || "Shop Now"} leaseLabel={project.leaseLabel || undefined} finePrint={project.finePrint || undefined} customFields={customTemplateFields[template.id]} />
                                  )}

                                  <Box
                                    className="card-overlay"
                                    sx={{
                                      position: "absolute",
                                      inset: 0,
                                      bgcolor: "rgba(0,0,0,0.4)",
                                      opacity: 0,
                                      transition: "opacity 0.2s",
                                      display: "flex",
                                      flexDirection: "column",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      gap: 1,
                                      zIndex: 10,
                                    }}
                                  >
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                      {[
                                        { Icon: VisibilityIcon, onClick: () => setLightbox({ offer: slotOffers[0], offers: slotOffers, template, bg, aiResult }) },
                                        { Icon: DeleteIcon, onClick: () => excludeBackgroundFromOfferTemplate(combo.id, template.id, bg.id) },
                                        { Icon: EditIcon, onClick: () => {} },
                                      ].map(({ Icon, onClick }, idx) => (
                                        <IconButton
                                          key={idx}
                                          onClick={onClick}
                                          size="small"
                                          sx={{ width: 32, height: 32, borderRadius: "50%", bgcolor: "#fff", color: "#374151", boxShadow: 1, "&:hover": { bgcolor: "#F3F4F6" } }}
                                        >
                                          <Icon sx={{ fontSize: 14 }} />
                                        </IconButton>
                                      ))}
                                    </Box>

                                    {isOptimizing ? (
                                      <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.75, bgcolor: "rgba(255,255,255,0.9)", borderRadius: "999px", px: 1.5, py: 0.75, fontSize: "0.75rem", fontWeight: 500, color: "text.primary" }}>
                                        <SpinnerSvg size={14} />
                                        Optimizing…
                                      </Box>
                                    ) : (
                                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                        <Box
                                          component="button"
                                          onClick={() => handleOptimize(combo.id, template.id, bg.id, slotOffers[0], bg, template)}
                                          sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, bgcolor: "rgba(255,255,255,0.9)", borderRadius: "999px", px: 1.5, py: 0.75, fontSize: "0.75rem", fontWeight: 600, color: "var(--brand-accent)", border: "none", cursor: "pointer", boxShadow: 1, "&:hover": { bgcolor: "#fff" } }}
                                        >
                                          <AutoAwesomeIcon sx={{ fontSize: 12 }} />
                                          {aiResult ? "Re-optimize" : "Optimize"}
                                        </Box>
                                        {aiResult && (
                                          <Box
                                            component="button"
                                            onClick={() => clearAiResult(aiKey)}
                                            sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, bgcolor: "rgba(255,255,255,0.9)", borderRadius: "999px", px: 1.5, py: 0.75, fontSize: "0.75rem", fontWeight: 600, color: "text.secondary", border: "none", cursor: "pointer", boxShadow: 1, "&:hover": { bgcolor: "#fff" } }}
                                          >
                                            <RestartAltIcon sx={{ fontSize: 12 }} />
                                            Reset
                                          </Box>
                                        )}
                                      </Box>
                                    )}
                                  </Box>
                                </Box>
                              );
                            })}
                          </Box>
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              );
            })}
          </Box>
        )}
      </Box>

      <SelectBackgroundDialog
        open={addBgOpen}
        onClose={() => setAddBgOpen(false)}
        onAdd={handleAddBackgrounds}
      />

      {/* Footer nav */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 3, py: 1.5, bgcolor: "#fff" }}>
        <Button
          onClick={() => onNavigateTo("logos-backgrounds")}
          startIcon={<ChevronLeftIcon sx={{ fontSize: 14 }} />}
          variant="outlined"
          size="small"
          sx={{
            fontSize: "0.875rem",
            fontWeight: 500,
            color: "var(--brand-accent)",
            borderColor: "rgba(var(--brand-accent-rgb, 71 59 171) / 0.3)",
            borderRadius: "999px",
            px: 2,
            py: 0.75,
            textTransform: "none",
            "&:hover": { bgcolor: "rgba(var(--brand-accent-rgb, 71 59 171) / 0.05)", borderColor: "var(--brand-accent)" },
          }}
        >
          Styles
        </Button>

        {(() => {
          const singleAssets = singleTemplates.reduce(
            (sum, t) => sum + offers.reduce((oSum, o) => oSum + getBackgroundsForOfferTemplate(o.id, t.id).length, 0),
            0
          );
          const multiAssets = multiTemplates.reduce(
            (sum, t) => sum + combinations.reduce((cSum, c) => cSum + getBackgroundsForOfferTemplate(c.id, t.id).length, 0),
            0
          );
          const totalAssets = singleAssets + multiAssets;

          return (
            <Button
              endIcon={<ChevronRightIcon sx={{ fontSize: 14 }} />}
              variant="contained"
              size="small"
              sx={{
                fontSize: "0.875rem",
                fontWeight: 600,
                color: "#fff",
                bgcolor: "var(--brand-accent)",
                borderRadius: "999px",
                px: 2.5,
                py: 1,
                textTransform: "none",
                boxShadow: "none",
                "&:hover": { bgcolor: "var(--brand-accent-hover)", boxShadow: "none" },
              }}
            >
              Generate Assets
              {totalAssets > 0 && (
                <Box
                  component="span"
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: "#fff",
                    color: "var(--brand-accent)",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    borderRadius: "50%",
                    minWidth: 20,
                    height: 20,
                    px: 0.75,
                    ml: 0.5,
                  }}
                >
                  {totalAssets}
                </Box>
              )}
            </Button>
          );
        })()}
      </Box>

      {/* Lightbox */}
      {lightbox && (() => {
        const { offer, offers: lbOffers, template, bg, aiResult: lbAiResult } = lightbox;
        const maxW = 1200, maxH = 720;
        const scale = Math.min(maxW / template.width, maxH / template.height);
        const scaledW = Math.round(template.width * scale);
        const scaledH = Math.round(template.height * scale);

        return (
          <Box
            sx={{
              position: "fixed",
              inset: 0,
              bgcolor: "rgba(0,0,0,0.7)",
              zIndex: 50,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              p: 4,
            }}
            onClick={() => setLightbox(null)}
          >
            <Box
              onClick={(e) => e.stopPropagation()}
              style={{ width: scaledW, height: scaledH, position: "relative", overflow: "hidden" }}
            >
              {lbAiResult ? (
                <>
                  <img src={lbAiResult} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                  <div style={{ position: "absolute", inset: 0 }}>
                    <AdTemplate projectId={id} templateId={template.id} offer={offer} offers={lbOffers} background={bg} scale={scale} dealerName={project.dealerName} cta={project.ctaText || "Shop Now"} leaseLabel={project.leaseLabel || undefined} finePrint={project.finePrint || undefined} layerMode="ui" />
                  </div>
                </>
              ) : (
                <AdTemplate projectId={id} templateId={template.id} offer={offer} offers={lbOffers} background={bg} scale={scale} dealerName={project.dealerName} cta={project.ctaText || "Shop Now"} leaseLabel={project.leaseLabel || undefined} finePrint={project.finePrint || undefined} />
              )}
            </Box>
          </Box>
        );
      })()}
    </Box>
  );
}
