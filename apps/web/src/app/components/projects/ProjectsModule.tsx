/**
 * ProjectsModule — Full Projects experience (MUI port).
 */

import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { STORAGE_KEYS } from "../../constants/storageKeys";
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Chip from '@mui/material/Chip';
import Collapse from '@mui/material/Collapse';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import TextField from '@mui/material/TextField';
import Checkbox from '@mui/material/Checkbox';
import Avatar from '@mui/material/Avatar';
import LinearProgress from '@mui/material/LinearProgress';
import Fade from '@mui/material/Fade';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CheckIcon from '@mui/icons-material/Check';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import PaletteIcon from '@mui/icons-material/Palette';
import ImageIcon from '@mui/icons-material/Image';
import LayersIcon from '@mui/icons-material/Layers';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import ArchiveOutlinedIcon from '@mui/icons-material/ArchiveOutlined';
import SyncIcon from '@mui/icons-material/Sync';
import CreateOutlinedIcon from '@mui/icons-material/CreateOutlined';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import FilterListIcon from '@mui/icons-material/FilterList';
import GridViewIcon from '@mui/icons-material/GridView';

import { jbResolve as resolveJellybean } from "./agent/jellybean";
import { OffersPage } from "./OffersPage";
import { TemplatesPage } from "./TemplatesPage";
import { PreviewPage } from "./PreviewPage";
import { AdShellsPage } from "./AdShellsPage";
import { CampaignsPage } from "./CampaignsPage";
import { ProjectAccordionSection } from "./ui/ProjectAccordionSection";
import { BreadcrumbBar } from "../BreadcrumbBar";
import { ICFilters, ICViewGrid, LCOffers, LCTemplates, LCStyles, LCPreview, type IconProps } from "./ui/icons";
import { ProjectStoreProvider, useProjectStore } from "./lib/project-store";
import { RightPanelProvider } from "./lib/right-panel-context";
import { SidebarProvider } from "./lib/sidebar-context";
import { OfferCard } from "./offers/OfferCard";
import { TemplateCard } from "./templates/TemplateCard";
import {
  projects, getProjectById, getProjectLogoUrl,
  getProjectOffers, getProjectTemplates, offerLibrary, templateLibrary, brandKits,
  backgroundCollections,
} from "./lib/mock-data";
import type { Offer, Template, BrandKit, ProjectStatus } from "./lib/mock-data";
import {
  CreateProjectDialog,
  PROJECT_OWNERS,
  PLATFORM_OPTIONS,
  type NewProjectInput,
} from "./CreateProjectDialog";
import { emitSnackbar } from "../Snackbar";
import { TaskOwner } from "./ui/TaskOwner";
import { CommentsButton } from "../comments/CommentsButton";
import { useComments } from "../comments/CommentsContext";
import { getZoneConfig, isSingleProductTextLayout, isPharmaZoneConfig, type TemplateZoneConfig } from "./lib/template-zone-configs";
import { EditBackgroundModal } from "./EditBackgroundModal";
import { LogosBackgroundsPage } from "./LogosBackgroundsPage";

function persistProjectState(projectId: string, state: Record<string, unknown>) {
  try {
    const key = `PROJECT_STATE_${projectId}`;
    const existing = JSON.parse(localStorage.getItem(key) ?? '{}');
    localStorage.setItem(key, JSON.stringify({ ...existing, ...state }));
  } catch { /* ignore */ }
}

// ─── Event constants ──────────────────────────────────────────────────────────
export const PROJECT_CONTEXT_EVENT         = "project-context-update";
export const PROJECT_AGENT_ACTION_EVENT    = "project-agent-action";
export const AGENT_SCROLL_TO_SECTION_EVENT = "agent-scroll-to-section";
export const AGENT_GENERATE_ASSETS_EVENT   = "agent-generate-assets";
export const AGENT_ASSETS_GENERATED_EVENT  = "agent-assets-generated";
export const AGENT_OPEN_CAMPAIGNS_EVENT    = "agent-open-campaigns";

// ─── Local types (not exported from dest ProjectAgentPane) ────────────────────
interface ProjectContextPayload {
  projectId: string;
  projectName: string;
  oem: string;
  startDate?: string;
  endDate?: string;
  owner?: string;
  dealerName?: string;
  ctaText?: string;
  leaseLabel?: string;
  finePrint?: string;
  currentOfferIds: string[];
  currentTemplateIds: string[];
  currentBackgroundIds?: string[];
  activeBrandOem?: string;
  generatedAssetPreviews?: object[];
  taskOwners?: Record<string, string>;
  availableOffers: object[];
  availableTemplates: object[];
}
type AgentActionPayload = { action: string; [key: string]: unknown };
interface CustomOffer {
  id: string; year: string; make: string; model: string; trim: string;
  image?: string; offerType: string; monthlyPayment: string; term: string;
  dueAtSigning: string; exteriorColor?: string;
}

// ─── Minimal adaptive color stub ─────────────────────────────────────────────
type AdaptiveColorSet = { primary: string; secondary: string; tertiary: string };
function computeSampleFromData(_data: Uint8ClampedArray): unknown { return null; }
function deriveAdaptiveColors(_sample: unknown): AdaptiveColorSet {
  return { primary: 'rgba(255,255,255,0.92)', secondary: 'rgba(255,255,255,0.70)', tertiary: 'rgba(255,255,255,0.45)' };
}

// ─── Left-pane toggle icon ───────────────────────────────────────────────────
function LeftPaneIcon() {
  return (
    <svg width="16" height="13" viewBox="6 8 18 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M7.29175 9.79171C7.29175 9.33147 7.66484 8.95837 8.12508 8.95837H21.8751C22.3353 8.95837 22.7084 9.33147 22.7084 9.79171V20.2084C22.7084 20.6686 22.3353 21.0417 21.8751 21.0417H8.12508C7.66484 21.0417 7.29175 20.6686 7.29175 20.2084V9.79171Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M11.875 9.16663V15V20.8333" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
  );
}

// ─── StoredOffer interface ────────────────────────────────────────────────────
interface StoredOffer {
  id: string; year: string; make: string; model: string; trim: string;
  image: string; stock: number; offerType: string; tags: string[];
  pvi: number; aging: number; sales: number; inventory: number;
  monthlyPayment: number; term: number; totalDueAtSigning: number;
  exteriorColor?: string;
}

function loadCustomOfferLibrary(): StoredOffer[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CUSTOM_OFFER_LIBRARY);
    return raw ? (JSON.parse(raw) as StoredOffer[]) : [];
  } catch { return []; }
}

function saveCustomOfferLibrary(offers: StoredOffer[]) {
  try { localStorage.setItem(STORAGE_KEYS.CUSTOM_OFFER_LIBRARY, JSON.stringify(offers)); } catch {}
}

// ─── Custom background library ────────────────────────────────────────────────
interface CustomBackground {
  id: string;
  name: string;
  thumbnail: string;
  images: Record<string, string>;
  composites?: Record<string, Record<string, string>>;
  groundFraction?: number;
  carWidthFraction?: number;
}

function loadCustomBackgroundLibrary(projectId: string): CustomBackground[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CUSTOM_BACKGROUND_LIBRARY);
    const all: Record<string, CustomBackground[]> = raw ? JSON.parse(raw) : {};
    return (all[projectId] ?? []).map(bg => {
      const badThumb = !bg.thumbnail || bg.thumbnail.startsWith('blob:') || bg.thumbnail.startsWith('data:');
      if (badThumb && bg.images) {
        const fallback = Object.values(bg.images).find(u => typeof u === 'string' && u.startsWith('http'));
        if (fallback) return { ...bg, thumbnail: fallback };
      }
      return bg;
    });
  } catch { return []; }
}

function saveCustomBackgroundLibrary(projectId: string, bgs: CustomBackground[]): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CUSTOM_BACKGROUND_LIBRARY);
    const all: Record<string, CustomBackground[]> = raw ? JSON.parse(raw) : {};
    const slim = bgs.map(bg => {
      const stripped = Object.fromEntries(
        Object.entries(bg as unknown as Record<string, unknown>)
          .filter(([k, v]) => !k.startsWith('_') &&
            !(typeof v === 'string' && v.startsWith('blob:')) &&
            !(typeof v === 'string' && v.startsWith('data:') && v.length > 50_000))
      ) as Record<string, unknown>;
      if (!stripped.thumbnail && bg.images) {
        const fallback = Object.values(bg.images).find(u => typeof u === 'string' && u.startsWith('http'));
        if (fallback) stripped.thumbnail = fallback;
      }
      return stripped;
    }) as unknown as CustomBackground[];
    all[projectId] = slim;
    localStorage.setItem(STORAGE_KEYS.CUSTOM_BACKGROUND_LIBRARY, JSON.stringify(all));
  } catch (e) {
    console.error('[saveCustomBackgroundLibrary] persist failed:', e);
  }
}

function customOfferToStored(co: CustomOffer): StoredOffer {
  return {
    id: co.id,
    year: co.year,
    make: co.make,
    model: co.model,
    trim: co.trim,
    image: co.image ?? "",
    stock: 1,
    offerType: co.offerType,
    tags: ["Custom"],
    pvi: 0,
    aging: 0,
    sales: 0,
    inventory: 1,
    monthlyPayment: parseFloat(co.monthlyPayment) || 0,
    term: parseInt(co.term) || 36,
    totalDueAtSigning: parseFloat(co.dueAtSigning) || 0,
    exteriorColor: co.exteriorColor,
  };
}

// ─── localStorage helpers ─────────────────────────────────────────────────────
function loadProjectState(projectId: string) {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROJECT_STATE(projectId));
    if (!raw) return null;
    return JSON.parse(raw) as {
      addedOfferIds?: string[];
      addedTemplateIds?: string[];
      removedOfferIds?: string[];
      removedTemplateIds?: string[];
      bgId?: string | null;
      agentAddedBgIds?: string[];
      activatedOem?: string | null;
      activatedOems?: string[];
      taskOwners?: Record<string, string>;
      generatedAssetIds?: Array<{ offerId: string; templateId: string; bgId: string | null }>;
      offerPatches?: Record<string, Partial<StoredOffer>>;
      jellyBeanPatches?: Record<string, Partial<StoredOffer>>;
    };
  } catch { return null; }
}

// ─── makeUniqueName ───────────────────────────────────────────────────────────
function makeUniqueName(desired: string, existing: string[]): string {
  const norm = (s: string) => s.trim().toLowerCase();
  const set = new Set(existing.map(norm));
  if (!set.has(norm(desired))) return desired;
  let i = 1;
  while (set.has(norm(`${desired} ${i}`))) i++;
  return `${desired} ${i}`;
}

// ─── Local project type ───────────────────────────────────────────────────────
type LocalProject = (typeof projects[0]) & {
  tags?: string[];
  createdAt?: string;
  account?: string;
  owner?: string;
  platforms?: string[];
};

type ProjectPage = "offers" | "templates" | "logos-backgrounds" | "preview";

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<ProjectStatus, {
  chipBg: string; chipText: string; icon: React.ReactNode; label: string;
}> = {
  "Template":          { chipBg: "#E0F7FA",               chipText: "#006064",              icon: <DescriptionOutlinedIcon sx={{ fontSize: 11, color: "#006064" }} />,          label: "Template" },
  "In Progress":       { chipBg: "#E3F2FD",               chipText: "#0d47a1",              icon: <SyncIcon              sx={{ fontSize: 11, color: "#0d47a1" }} />,          label: "In Progress" },
  "Awaiting Approval": { chipBg: "rgba(225,118,19,0.08)", chipText: "#613f02",              icon: <HourglassEmptyIcon    sx={{ fontSize: 11, color: "#613f02" }} />,          label: "Awaiting Approval" },
  "Needs Edits":       { chipBg: "rgba(210,50,63,0.08)",  chipText: "#be0e1c",              icon: <CreateOutlinedIcon    sx={{ fontSize: 11, color: "#be0e1c" }} />,          label: "Needs Edits" },
  "Approved":          { chipBg: "#E8F5E9",               chipText: "#1b5e20",              icon: <CheckCircleOutlineIcon sx={{ fontSize: 11, color: "#1b5e20" }} />,         label: "Approved" },
  "Assets Created":    { chipBg: "#EDE7F6",               chipText: "#4527A0",              icon: <LayersIcon            sx={{ fontSize: 11, color: "#4527A0" }} />,          label: "Assets Created" },
  "Changes Made":      { chipBg: "rgba(225,118,19,0.08)", chipText: "#613f02",              icon: <WarningAmberIcon      sx={{ fontSize: 11, color: "#613f02" }} />,          label: "Changes Made" },
  "Done":              { chipBg: "#E8F5E9",               chipText: "#1b5e20",              icon: <CheckIcon             sx={{ fontSize: 11, color: "#1b5e20" }} />,          label: "Done" },
  "Expired":           { chipBg: "#F3F4F6",               chipText: "#686576",              icon: <HighlightOffIcon      sx={{ fontSize: 11, color: "#686576" }} />,          label: "Expired" },
  "Archived":          { chipBg: "#F3F4F6",               chipText: "#686576",              icon: <ArchiveOutlinedIcon   sx={{ fontSize: 11, color: "#686576" }} />,          label: "Archived" },
};

const PROJECT_STATUSES = Object.keys(STATUS_CONFIG) as ProjectStatus[];

const KANBAN_COLUMNS: ProjectStatus[] = [
  "In Progress", "Assets Created", "Awaiting Approval", "Approved",
];

const CURRENT_USER = {
  name: "Jorge Verlindo",
  email: "jorge.verlindo@helloconstellation.com",
  initials: "JV",
};

const ACCOUNTS = [
  "Honda of Anywhere",
  "BMW Seattle",
  "Spiriva Pharma",
  "Multiple Brands Inc.",
  "Honda City",
];

// ─── Project status chip ──────────────────────────────────────────────────────
export function ProjectStatusChip({ status }: { status: ProjectStatus }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG["In Progress"];
  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex', alignItems: 'center', gap: 0.5,
        fontSize: '11px', fontWeight: 400, fontFamily: 'inherit',
        letterSpacing: '0.4px', px: 1, py: 0.5, borderRadius: '8px',
        userSelect: 'none', whiteSpace: 'nowrap', lineHeight: 1.3,
        bgcolor: cfg.chipBg, color: cfg.chipText,
      }}
    >
      {cfg.icon}
      {cfg.label}
    </Box>
  );
}

// ─── Gray tag chip ────────────────────────────────────────────────────────────
function TagChip({ label }: { label: string }) {
  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex', alignItems: 'center', gap: 0.5,
        bgcolor: '#F3F4F6', color: 'text.secondary',
        fontSize: '11px', fontFamily: 'inherit', letterSpacing: '0.4px',
        px: 1, py: 0.25, borderRadius: '8px',
        userSelect: 'none', whiteSpace: 'nowrap', lineHeight: 1.3,
      }}
    >
      {label}
    </Box>
  );
}

// ─── Stat badge ───────────────────────────────────────────────────────────────
function StatBadge({ icon, count }: { icon: React.ReactNode; count: number }) {
  return (
    <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontSize: '11px', color: 'text.secondary' }}>
      {icon}
      {count}
    </Box>
  );
}

// ─── Brand colors ─────────────────────────────────────────────────────────────
const BRAND_COLORS_MAP: Record<string, string> = {
  Honda: "#CC0000", BMW: "#0066B1", Volkswagen: "#001E50",
  Audi: "#B30000", Toyota: "#EB0A1E", Ford: "#003478",
  Hyundai: "#002C5F", Kia: "#05141F", Chevrolet: "#D1A600",
};

// ─── getLogoForSlot ───────────────────────────────────────────────────────────
function getLogoForSlot(kit: BrandKit | undefined, baseSlot: string, hasBg: boolean): string | undefined {
  if (!kit) return undefined;
  const preferred = hasBg ? "negative" : "positive";
  const fallback  = hasBg ? "positive" : "negative";
  return (
    kit.logos.find(l => l.id === `${baseSlot}-${preferred}`)?.image ??
    kit.logos.find(l => l.id === `${baseSlot}-${fallback}`)?.image ??
    kit.logos.find(l => l.id.startsWith(baseSlot))?.image
  );
}

// ─── getBgImage ───────────────────────────────────────────────────────────────
function getBgImage(
  bg: any,
  template: { id: string; width: number; height: number }
): string | undefined {
  if (!bg) return undefined;
  const images = (bg.images ?? {}) as Record<string, string>;
  if (images[template.id]) return images[template.id];
  const KNOWN_SIZES: Record<string, [number, number]> = {
    "website-2000x500":  [2000, 500],
    "display-970x250":   [970, 250],
    "display-300x250":   [300, 250],
    "social-1080x1080":  [1080, 1080],
    "website-600x450":   [600, 450],
    "website-600x1067":  [600, 1067],
  };
  const targetAr = template.width / template.height;
  let bestKey: string | null = null;
  let bestDiff = Infinity;
  for (const [key, [w, h]] of Object.entries(KNOWN_SIZES)) {
    if (!images[key]) continue;
    const diff = Math.abs(targetAr - w / h);
    if (diff < bestDiff) { bestDiff = diff; bestKey = key; }
  }
  if (!bestKey) {
    const anyKey = Object.keys(images).find(k => !!images[k]);
    if (anyKey) return images[anyKey];
    return undefined;
  }
  return images[bestKey];
}

// ─── dealerCarPlacement ───────────────────────────────────────────────────────
interface DealerPlacement { ground?: number; carWidth?: number; anchorX?: number }

function dealerCarPlacement(bg: any, template: Template): DealerPlacement {
  if (!bg?.id?.startsWith("dealer-bg-")) return { ground: bg?.groundFraction };
  const ar = template.width / template.height;
  if (ar > 2.0) return { ground: 0.86, carWidth: 0.40, anchorX: 0.62 };
  if (ar < 0.7) return { ground: 0.76, carWidth: 0.70, anchorX: 0.5 };
  if (ar >= 1.1) return { ground: 0.78, carWidth: 0.62, anchorX: 0.5 };
  return { ground: 0.71, carWidth: 0.70, anchorX: 0.5 };
}

// ─── templateKey ─────────────────────────────────────────────────────────────
function templateKey(width: number, height: number): string {
  const KNOWN: Record<string, [number, number]> = {
    "website-2000x500": [2000, 500], "display-970x250": [970, 250],
    "display-300x250": [300, 250],   "social-1080x1080": [1080, 1080],
    "website-600x450": [600, 450],   "website-600x1067": [600, 1067],
  };
  const ar = width / height;
  return Object.entries(KNOWN).reduce((best, [k, [w, h]]) => {
    const diff = Math.abs(ar - w / h);
    return diff < best.diff ? { k, diff } : best;
  }, { k: "display-300x250", diff: Infinity }).k;
}

// ─── JellyBeanCard ───────────────────────────────────────────────────────────
function JellyBeanCard({
  offer, template, fixedHeight = 160, bgImage, brandKit,
  groundFraction, carWidthFraction, carAnchorX, compositeUrl, isGenerating,
  bgExactFormat = true,
  dealerName, ctaText, leaseLabel, finePrint,
}: {
  offer: Offer & { image?: string };
  template: Template;
  fixedHeight?: number;
  bgImage?: string;
  brandKit?: BrandKit;
  groundFraction?: number;
  carWidthFraction?: number;
  carAnchorX?: number;
  bgExactFormat?: boolean;
  isGenerating?: boolean;
  compositeUrl?: string;
  dealerName?: string;
  ctaText?: string;
  leaseLabel?: string;
  finePrint?: string;
}) {
  const ar = template.width / template.height;
  const wUnclamped = Math.round(fixedHeight * ar);
  const _cfgForSize = getZoneConfig(template.id);
  const _cfgSingle = (_cfgForSize && !isPharmaZoneConfig(_cfgForSize) && isSingleProductTextLayout((_cfgForSize as TemplateZoneConfig).textLayout))
    ? (_cfgForSize as TemplateZoneConfig) : null;
  const wMinScale = _cfgSingle ? Math.min(540, Math.ceil(_cfgSingle.canvasW * 0.25)) : 0;
  const wEffective = Math.max(wUnclamped, wMinScale);
  const w = Math.min(wEffective, 540);
  const h = wUnclamped > 540 ? Math.round(w / ar) : (w > wUnclamped ? Math.round(w / ar) : fixedHeight);
  const isWide = ar > 2.0;

  const [compositeImage, setCompositeImage] = useState<string | null>(null);
  const [carBottom,      setCarBottom]      = useState<number | null>(null);
  const [adaptiveColors, setAdaptiveColors] = useState<AdaptiveColorSet | null>(null);
  const [composing, setComposing] = useState<boolean>(
    () => !!(groundFraction && offer.image && bgImage && !compositeUrl)
  );

  const awaitingBg = !!isGenerating && !bgExactFormat;

  useEffect(() => {
    if (awaitingBg || compositeUrl || !groundFraction || !offer.image || !bgImage) {
      setCompositeImage(null); setCarBottom(null); setComposing(false); return;
    }

    let cancelled = false;
    setComposing(true);

    const loadImg = async (src: string): Promise<HTMLImageElement> => {
      const res  = await fetch(src);
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      return new Promise((resolve, reject) => {
        const el = new Image();
        el.onload  = () => { URL.revokeObjectURL(url); resolve(el); };
        el.onerror = () => { URL.revokeObjectURL(url); reject(); };
        el.src = url;
      });
    };

    (async () => {
      try {
        const carImg = await loadImg(offer.image!);
        if (cancelled) return;

        const sW = Math.min(carImg.naturalWidth, 128);
        const sH = Math.min(carImg.naturalHeight, 128);
        const offC = document.createElement('canvas');
        offC.width = sW; offC.height = sH;
        const offCtx = offC.getContext('2d')!;
        offCtx.drawImage(carImg, 0, 0, sW, sH);
        const { data } = offCtx.getImageData(0, 0, sW, sH);
        let tireFraction = 0.95;
        outer: for (let y = sH - 1; y >= 0; y--) {
          for (let x = 0; x < sW; x++) {
            if (data[(y * sW + x) * 4 + 3] > 20) { tireFraction = y / sH; break outer; }
          }
        }

        let bgImg: HTMLImageElement | null = null;
        try { bgImg = await loadImg(bgImage); } catch (e) {
          console.warn('[JellyBeanCard] bg fetch failed — expired replicate URL? Falling back to precise CSS overlay.', e);
        }
        if (cancelled) return;

        if (!bgImg) {
          const carArCss  = carImg.naturalWidth / carImg.naturalHeight;
          const ground    = groundFraction ?? (isWide ? 0.78 : 0.65);
          const tiresFromBottom = Math.round(h * (1 - ground));
          const boxH = isWide ? h * (ground - 0.08) : h * 0.52;
          const boxW = (carWidthFraction ?? (isWide ? 0.55 : 0.88)) * w;
          const renderedH = Math.min(boxH, boxW / carArCss);
          const cssBottom = Math.max(0, Math.round(tiresFromBottom - renderedH * (1 - tireFraction)));
          setCompositeImage(null);
          setCarBottom(cssBottom);
          setComposing(false);
          return;
        }

        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext('2d')!;

        const bgAr   = bgImg.naturalWidth / bgImg.naturalHeight;
        const cardAr = w / h;
        let bx = 0, by = 0, bw = w, bh = h;
        if (bgAr > cardAr) { bw = Math.round(h * bgAr); bx = -Math.round((bw - w) / 2); }
        else                { bh = Math.round(w / bgAr); by = -Math.round((bh - h) / 2); }
        ctx.drawImage(bgImg, bx, by, bw, bh);

        const detectGroundStart = (): number | null => {
          try {
            const bandX = Math.round(w * 0.25);
            const bandW = Math.max(8, Math.round(w * 0.5));
            const px = ctx.getImageData(bandX, 0, bandW, h).data;
            const rowMean: number[] = new Array(h);
            for (let y = 0; y < h; y++) {
              let s = 0;
              for (let x = 0; x < bandW; x++) {
                const i = (y * bandW + x) * 4;
                s += px[i] + px[i + 1] + px[i + 2];
              }
              rowMean[y] = s / (bandW * 3);
            }
            const refStart = Math.round(h * 0.93);
            let ref = 0;
            for (let y = refStart; y < h; y++) ref += rowMean[y];
            ref /= (h - refStart);
            let groundY = refStart;
            for (let y = refStart; y >= Math.round(h * 0.30); y--) {
              const localJump = Math.abs(rowMean[y] - rowMean[Math.min(h - 1, y + 2)]);
              if (Math.abs(rowMean[y] - ref) > 32 || localJump > 15) { groundY = y + 2; break; }
              groundY = y;
            }
            const gf = groundY / h;
            return (gf > 0.30 && gf < 0.92) ? gf : null;
          } catch { return null; }
        };

        let groundStart = detectGroundStart();

        const targetStart = isWide ? 0.55 : 0.62;
        if (groundStart !== null && groundStart > targetStart + 0.03) {
          const f = Math.min(1.3, (1 - targetStart) / (1 - groundStart));
          if (f > 1.01) {
            const nx = w / 2 + (bx - w / 2) * f;
            const ny = h + (by - h) * f;
            ctx.clearRect(0, 0, w, h);
            ctx.drawImage(bgImg, nx, ny, bw * f, bh * f);
            groundStart = 1 - (1 - groundStart) * f;
          }
        }

        try {
          const sampleY = Math.round(h * 0.70);
          const sampleH = h - sampleY;
          const { data: sampleData } = ctx.getImageData(0, sampleY, w, sampleH);
          if (!cancelled) setAdaptiveColors(deriveAdaptiveColors(computeSampleFromData(sampleData)));
        } catch {}

        const detectedGround = groundStart !== null
          ? groundStart + 0.45 * (1 - groundStart)
          : null;

        const textZoneH = isWide ? 0 : Math.round(h * 0.20) + 27;
        const tireTarget = (detectedGround ?? groundFraction) !== undefined
          ? (isWide ? Math.round(h * 0.03) : Math.round(textZoneH * 0.35))
          : textZoneH + Math.round(h * 0.03);
        const trustedDetection =
          detectedGround !== null && groundFraction !== undefined &&
          detectedGround >= groundFraction - 0.05
            ? Math.min(detectedGround, 0.90)
            : null;
        const effectiveGround = trustedDetection ?? groundFraction ?? (isWide ? 0.78 : 0.65);
        const groundFromBot   = Math.round(h * (1 - effectiveGround));

        const carAr  = carImg.naturalWidth / carImg.naturalHeight;
        const availW = carWidthFraction !== undefined
          ? Math.round(w * carWidthFraction)
          : isWide ? Math.round(w * 0.55) : Math.round(w * 0.75);
        const availH = isWide
          ? Math.max(20, Math.round(h * (effectiveGround - 0.08)))
          : Math.round(h * 0.55);
        let rendW = availH * carAr;
        let rendH = availH;
        if (rendW > availW) { rendW = availW; rendH = availW / carAr; }
        rendW = Math.round(rendW); rendH = Math.round(rendH);

        const belowTires    = rendH * (1 - tireFraction);
        const rawBottom     = Math.max(0, Math.round(groundFromBot - belowTires));
        const bottom        = Math.max(rawBottom, tireTarget);

        const carX = carAnchorX !== undefined
          ? Math.max(0, Math.min(w - rendW, Math.round(w * carAnchorX - rendW / 2)))
          : isWide
            ? Math.round(w - rendW)
            : Math.round((w - rendW) / 2);

        const carY = h - bottom - rendH;

        const tireLineY = carY + rendH * tireFraction;
        const shadowCx  = carX + rendW / 2;
        const shadowRx  = rendW * 0.46;
        const shadowRy  = Math.max(3, rendW * 0.05);
        const shadowGrad = ctx.createRadialGradient(shadowCx, tireLineY, 0, shadowCx, tireLineY, shadowRx);
        shadowGrad.addColorStop(0,   'rgba(0,0,0,0.38)');
        shadowGrad.addColorStop(0.6, 'rgba(0,0,0,0.18)');
        shadowGrad.addColorStop(1,   'rgba(0,0,0,0)');
        ctx.save();
        ctx.translate(shadowCx, tireLineY);
        ctx.scale(1, shadowRy / shadowRx);
        ctx.translate(-shadowCx, -tireLineY);
        ctx.fillStyle = shadowGrad;
        ctx.beginPath();
        ctx.arc(shadowCx, tireLineY, shadowRx, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        ctx.drawImage(carImg, carX, carY, rendW, rendH);

        if (!cancelled) {
          setCompositeImage(canvas.toDataURL('image/jpeg', 0.92));
          setCarBottom(bottom);
          setComposing(false);
        }
      } catch {
        if (!cancelled) { setCompositeImage(null); setCarBottom(null); setComposing(false); }
      }
    })();

    return () => { cancelled = true; };
  }, [offer.image, bgImage, groundFraction, carWidthFraction, carAnchorX, h, w, isWide]);

  const chipFontSize = 9.5;
  const priceFontSize = Math.round(h * 0.14);
  const labelFontSize = 9;
  const barPadV = Math.round(h * 0.045);
  const barPadH = isWide ? 10 : Math.round(w * 0.05);

  const hasBg = !!bgImage;
  const _cfgForDark = getZoneConfig(template.id);
  const darkText = !!(_cfgForDark && !isPharmaZoneConfig(_cfgForDark) && (_cfgForDark as TemplateZoneConfig).darkText);

  const slots = (template as any).logoSlots as string[] | undefined ?? [];
  const _logoBgMode = hasBg && !darkText;
  const primaryLogoSrc     = getLogoForSlot(brandKit, "primary-square", _logoBgMode);
  const eventHorizLogoSrc  = getLogoForSlot(brandKit, "event-horizontal", _logoBgMode);
  const eventSquareLogoSrc = getLogoForSlot(brandKit, "event-square", _logoBgMode);
  const eventLogoSrc = slots.includes("event-horizontal") ? eventHorizLogoSrc
    : slots.includes("event-square") ? eventSquareLogoSrc
    : undefined;

  const primaryLogoH = Math.round(h * 0.174);
  const eventLogoH   = Math.round(h * 0.126);

  const dealerColor = hasBg ? (darkText ? "rgba(31,29,37,0.92)"  : (adaptiveColors?.primary   ?? "rgba(255,255,255,0.92)")) : "var(--ink)";
  const makeColor   = hasBg ? (darkText ? "rgba(31,29,37,0.55)"  : (adaptiveColors?.tertiary  ?? "rgba(255,255,255,0.55)")) : "var(--ink-tertiary)";
  const labelColor  = hasBg ? (darkText ? "rgba(74,73,79,0.90)"  : (adaptiveColors?.secondary ?? "rgba(255,255,255,0.70)")) : "var(--ink-secondary)";
  const priceColor  = hasBg ? (darkText ? "#1f1d25"              : (adaptiveColors?.primary   ?? "white"))                  : "var(--ink)";
  const moColor     = hasBg ? (darkText ? "rgba(31,29,37,0.60)"  : (adaptiveColors?.secondary ?? "rgba(255,255,255,0.60)")) : "var(--ink-secondary)";
  const termColor   = hasBg ? (darkText ? "rgba(74,73,79,0.85)"  : (adaptiveColors?.tertiary  ?? "rgba(255,255,255,0.45)")) : "var(--ink-tertiary)";

  if (composing) {
    return (
      <Box sx={{ position: 'relative', borderRadius: '10px', overflow: 'hidden', userSelect: 'none', flexShrink: 0, width: w, height: h, background: '#ececf2' }}>
        <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(110deg, #ececf2 30%, #f8f8fc 50%, #ececf2 70%)' }} />
        <Box sx={{ position: 'absolute', borderRadius: '4px', top: Math.round(h * 0.12), left: Math.round(w * 0.04), background: 'rgba(71,59,171,0.5)', px: '5px', py: '2px' }}>
          <span style={{ fontSize: chipFontSize, fontWeight: 600, color: 'white', letterSpacing: '0.3px' }}>{template.width}×{template.height}</span>
        </Box>
        <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Box sx={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid rgba(71,59,171,0.35)', borderTopColor: 'rgba(71,59,171,0.9)', animation: 'spin 0.8s linear infinite', '@keyframes spin': { to: { transform: 'rotate(360deg)' } } }} />
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{ position: 'relative', borderRadius: '10px', overflow: 'hidden', userSelect: 'none', flexShrink: 0, cursor: 'pointer', width: w, height: h, background: '#e2e2e2', '&:hover': { boxShadow: 4 }, transition: 'box-shadow 0.2s' }}
    >
      {!awaitingBg && (compositeUrl ?? compositeImage ?? bgImage) && (
        <img
          src={compositeUrl ?? compositeImage ?? bgImage!}
          alt="background"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
          draggable={false}
        />
      )}

      {isGenerating && !compositeUrl && (
        <Box sx={{ position: 'absolute', inset: 0, zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1, background: 'rgba(0,0,0,0.38)', backdropFilter: 'blur(3px)' }}>
          <Box sx={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid white', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite', '@keyframes spin': { to: { transform: 'rotate(360deg)' } } }} />
          <span style={{ fontSize: 9, fontWeight: 600, color: 'rgba(255,255,255,0.80)', letterSpacing: '0.4px', textTransform: 'uppercase' }}>Generating</span>
        </Box>
      )}

      {(() => {
        const cfgRaw = getZoneConfig(template.id);
        const cfg = (cfgRaw && !isPharmaZoneConfig(cfgRaw)) ? cfgRaw : null;
        const tl = (cfg && isSingleProductTextLayout(cfg.textLayout)) ? cfg.textLayout : null;
        const scale = cfg ? w / cfg.canvasW : null;
        const s = (v: number) => scale !== null ? Math.round(v * scale) : 0;

        if (!tl || !cfg) {
          return isWide ? (
            <>
              {!compositeUrl && !compositeImage && offer.image && (
                <img src={offer.image} style={{ position: 'absolute', right: 0, bottom: carBottom ?? (groundFraction !== undefined ? Math.round(h * (1 - groundFraction)) : 0), height: groundFraction !== undefined ? `${Math.round((groundFraction - 0.08) * 100)}%` : "90%", width: carWidthFraction !== undefined ? `${Math.round(carWidthFraction * 100)}%` : "55%", objectFit: 'cover', objectPosition: "center bottom", filter: hasBg ? "drop-shadow(0px 6px 12px rgba(0,0,0,0.45)) drop-shadow(0px 2px 4px rgba(0,0,0,0.3))" : undefined }} draggable={false} />
              )}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: `${barPadV}px ${barPadH}px` }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: dealerColor, whiteSpace: 'nowrap' }}>{offer.make} Dealer</span>
                {primaryLogoSrc ? <img src={primaryLogoSrc} draggable={false} style={{ height: primaryLogoH, width: 'auto', objectFit: 'contain' }} /> : <span style={{ fontSize: 10, fontWeight: 700, color: makeColor, textTransform: 'uppercase' }}>{offer.make}</span>}
              </div>
              <div style={{ position: 'absolute', borderRadius: 4, top: Math.round(h * 0.13), left: barPadH, background: 'rgba(71,59,171,0.82)', padding: '2px 5px' }}><span style={{ fontSize: chipFontSize, fontWeight: 600, color: 'white', letterSpacing: '0.3px' }}>{template.width}×{template.height}</span></div>
              <div style={{ position: 'absolute', display: 'flex', alignItems: 'center', gap: 3, borderRadius: 999, top: Math.round(h * 0.13), right: barPadH, background: 'rgba(255,255,255,0.88)', padding: '2px 6px' }}><div style={{ borderRadius: '50%', width: 5, height: 5, background: 'var(--ink-tertiary)' }} /><span style={{ fontSize: chipFontSize, fontWeight: 600, color: 'var(--ink-secondary)' }}>Draft</span></div>
              <div style={{ position: 'absolute', bottom: 0, left: 0, width: '48%', padding: `${Math.round(h * 0.06)}px ${barPadH}px ${Math.round(h * 0.07)}px` }}>
                <p style={{ fontSize: labelFontSize, fontWeight: 500, color: labelColor, textTransform: 'uppercase', marginBottom: 1 }}>{offer.offerType} · {offer.year} {offer.make}</p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}><span style={{ fontSize: priceFontSize, fontWeight: 700, color: priceColor, lineHeight: 1 }}>${offer.monthlyPayment}</span><span style={{ fontSize: 11, color: moColor }}>/mo</span></div>
                <p style={{ fontSize: labelFontSize, color: termColor, marginTop: 1 }}>{offer.term}mo · {offer.trim}</p>
              </div>
              {eventLogoSrc && <div style={{ position: 'absolute', bottom: 0, right: 0, padding: `${Math.round(h * 0.06)}px ${barPadH}px ${Math.round(h * 0.07)}px` }}><img src={eventLogoSrc} draggable={false} style={{ height: eventLogoH, width: 'auto' }} /></div>}
            </>
          ) : (
            <>
              {!compositeUrl && !compositeImage && offer.image && (
                <img src={offer.image} style={{ position: 'absolute', bottom: carBottom ?? (groundFraction !== undefined ? Math.max(Math.round(h * (1 - groundFraction)), Math.round(h * 0.20) + 27) : Math.round(h * 0.26)), left: 0, right: 0, width: '100%', height: Math.round(h * 0.52), objectFit: 'cover', objectPosition: 'center bottom', filter: hasBg ? "drop-shadow(0px 6px 14px rgba(0,0,0,0.50)) drop-shadow(0px 2px 5px rgba(0,0,0,0.30))" : undefined }} draggable={false} />
              )}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: `${barPadV}px ${barPadH}px` }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: dealerColor, whiteSpace: 'nowrap' }}>{offer.make} Dealer</span>
                {primaryLogoSrc ? <img src={primaryLogoSrc} draggable={false} style={{ height: primaryLogoH, width: 'auto', objectFit: 'contain' }} /> : <span style={{ fontSize: 10, fontWeight: 700, color: makeColor, textTransform: 'uppercase' }}>{offer.make}</span>}
              </div>
              <div style={{ position: 'absolute', display: 'flex', alignItems: 'center', gap: 3, borderRadius: 999, top: Math.round(h * 0.12), right: Math.round(w * 0.04), background: 'rgba(255,255,255,0.88)', padding: '2px 6px' }}><div style={{ borderRadius: '50%', width: 5, height: 5, background: 'var(--ink-tertiary)' }} /><span style={{ fontSize: chipFontSize, fontWeight: 600, color: 'var(--ink-secondary)' }}>Draft</span></div>
              <div style={{ position: 'absolute', borderRadius: 4, top: Math.round(h * 0.12), left: Math.round(w * 0.04), background: 'rgba(71,59,171,0.82)', padding: '2px 5px' }}><span style={{ fontSize: chipFontSize, fontWeight: 600, color: 'white', letterSpacing: '0.3px' }}>{template.width}×{template.height}</span></div>
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: `${Math.round(h * 0.04)}px ${barPadH}px ${Math.round(h * 0.06)}px` }}>
                {eventLogoSrc && <img src={eventLogoSrc} draggable={false} style={{ position: 'absolute', top: 0, right: 0, height: eventLogoH, width: 'auto', margin: `${Math.round(h * 0.04)}px ${barPadH}px 0 0` }} />}
                <p style={{ fontSize: labelFontSize, fontWeight: 500, color: labelColor, textTransform: 'uppercase', marginBottom: 1 }}>{offer.offerType} · {offer.year} {offer.make} {offer.model}</p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}><span style={{ fontSize: priceFontSize, fontWeight: 700, color: priceColor, lineHeight: 1 }}>${offer.monthlyPayment}</span><span style={{ fontSize: 11, color: moColor }}>/mo</span></div>
                <p style={{ fontSize: labelFontSize, color: termColor, marginTop: 1 }}>{offer.term}mo · {offer.trim}</p>
              </div>
            </>
          );
        }

        const slot = cfg.productSlots[0];
        const lP = cfg.logoP;
        const lE = cfg.logoE;

        return (
          <>
            {!compositeUrl && !compositeImage && offer.image && (
              <img src={offer.image} alt={`${offer.year} ${offer.make} ${offer.model}`}
                style={{ position: 'absolute', left: s(slot.l), top: s(slot.top), width: s(slot.w), height: s(slot.h), objectFit: 'cover', objectPosition: 'center bottom', filter: hasBg ? "drop-shadow(0px 6px 12px rgba(0,0,0,0.45)) drop-shadow(0px 2px 4px rgba(0,0,0,0.3))" : undefined }}
                draggable={false} />
            )}
            {primaryLogoSrc && lP.size > 0 && lP.l >= 0 && (
              <img src={primaryLogoSrc} alt={offer.make} draggable={false}
                style={{ position: 'absolute', left: s(lP.l), top: s(lP.top), height: s(lP.size), width: 'auto', objectFit: 'contain' }} />
            )}
            {eventLogoSrc && lE.size > 0 && lE.l >= 0 && (
              <img src={eventLogoSrc} alt="event" draggable={false}
                style={{ position: 'absolute', left: s(lE.l), top: s(lE.top), height: s(lE.size), width: 'auto', objectFit: 'contain' }} />
            )}
            {tl.dealerName && (
              <span style={{ position: 'absolute', left: s(tl.dealerName.l), top: s(tl.dealerName.top), fontSize: s(tl.dealerName.fontSize), fontWeight: 600, color: dealerColor, whiteSpace: 'nowrap', fontFamily: 'system-ui, sans-serif' }}>
                {dealerName || `${offer.make} Dealer`}
              </span>
            )}
            {tl.title && (
              <span style={{ position: 'absolute', left: s(tl.title.l), top: s(tl.title.top), fontSize: s(tl.title.fontSize), fontWeight: 400, color: labelColor }}>
                {offer.year} {offer.make} {offer.model} {offer.trim}
              </span>
            )}
            <span style={{ position: 'absolute', left: s(tl.leaseLabel.l), top: s(tl.leaseLabel.top), fontSize: s(tl.leaseLabel.fontSize), fontWeight: 500, color: labelColor, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              {leaseLabel || offer.offerType}
            </span>
            <div style={{ position: 'absolute', left: s(tl.price.l), top: s(tl.price.top), display: 'flex', alignItems: 'baseline', gap: 1 }}>
              <span style={{ fontSize: s(tl.price.fontSize), fontWeight: 700, color: priceColor, lineHeight: 1 }}>${offer.monthlyPayment}</span>
              <span style={{ fontSize: Math.max(8, Math.round(s(tl.price.fontSize) * 0.28)), color: moColor }}>/mo.</span>
            </div>
            {tl.finePrint && (
              <span style={{ position: 'absolute', left: s(tl.finePrint.l), top: s(tl.finePrint.top), fontSize: s(tl.finePrint.fontSize), color: termColor, maxWidth: tl.finePrint.w ? s(tl.finePrint.w) : undefined, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {finePrint || `${offer.term} months  |  $${(offer as any).totalDueAtSigning ?? ""} due at signing`}
              </span>
            )}
            {tl.termLabel && (
              <span style={{ position: 'absolute', left: s(tl.termLabel.l), top: s(tl.termLabel.top), fontSize: s(tl.termLabel.fontSize), color: termColor }}>
                for {offer.term} months.
              </span>
            )}
            {tl.dueLabel && (
              <span style={{ position: 'absolute', left: s(tl.dueLabel.l), top: s(tl.dueLabel.top), fontSize: s(tl.dueLabel.fontSize), color: termColor }}>
                ${(offer as any).totalDueAtSigning ?? ""} due at signing
              </span>
            )}
            {tl.cta.w !== undefined && tl.cta.h !== undefined && (
              <div style={{ position: 'absolute', left: s(tl.cta.l), top: s(tl.cta.top), minWidth: s(tl.cta.w), height: s(tl.cta.h), paddingLeft: s(tl.cta.w ? tl.cta.w * 0.15 : 8), paddingRight: s(tl.cta.w ? tl.cta.w * 0.15 : 8), display: 'flex', alignItems: 'center', justifyContent: 'center', whiteSpace: 'nowrap', fontSize: s(tl.cta.fontSize), fontWeight: 700, backgroundColor: '#111014', color: 'white', borderRadius: Math.max(2, s(4)) }}>
                {ctaText || "Shop Now"}
              </div>
            )}
            {tl.disclaimer && (
              <span style={{ position: 'absolute', left: s(tl.disclaimer.l), top: s(tl.disclaimer.top), fontSize: Math.max(6, s(tl.disclaimer.fontSize)), color: hasBg ? (darkText ? 'rgba(31,29,37,0.45)' : 'rgba(255,255,255,0.50)') : 'var(--ink-tertiary)', maxWidth: tl.disclaimer.w ? s(tl.disclaimer.w) : undefined, textAlign: tl.disclaimer.textAlign }}>
                Photos for illustration purposes only.
              </span>
            )}
            <div style={{ position: 'absolute', borderRadius: 4, top: Math.round(h * 0.06), left: Math.round(w * 0.03), background: 'rgba(71,59,171,0.82)', padding: '2px 5px', zIndex: 20 }}>
              <span style={{ fontSize: chipFontSize, fontWeight: 600, color: 'white', letterSpacing: '0.3px' }}>{template.width}×{template.height}</span>
            </div>
            <div style={{ position: 'absolute', display: 'flex', alignItems: 'center', gap: 3, borderRadius: 999, top: Math.round(h * 0.06), right: Math.round(w * 0.03), background: 'rgba(255,255,255,0.88)', padding: '2px 6px', zIndex: 20 }}>
              <div style={{ borderRadius: '50%', width: 5, height: 5, background: 'var(--ink-tertiary)' }} />
              <span style={{ fontSize: chipFontSize, fontWeight: 600, color: 'var(--ink-secondary)' }}>Draft</span>
            </div>
          </>
        );
      })()}
    </Box>
  );
}

// ─── LightboxItem type ────────────────────────────────────────────────────────
type LightboxItem = {
  key: string;
  offer: Offer;
  template: Template;
  bgImage: string | undefined;
  groundFraction: number | undefined;
  carWidthFraction: number | undefined;
  carAnchorX: number | undefined;
  isGenerating: boolean;
  bgExactFormat: boolean;
};

// ─── PreviewLightbox ──────────────────────────────────────────────────────────
function PreviewLightbox({
  items, index, onClose, onNav, brandKit, dealerName, ctaText, leaseLabel, finePrint,
}: {
  items: LightboxItem[];
  index: number;
  onClose: () => void;
  onNav: (i: number) => void;
  brandKit: BrandKit | null | undefined;
  dealerName?: string;
  ctaText?: string;
  leaseLabel?: string;
  finePrint?: string;
}) {
  const item = items[index];
  if (!item) return null;

  const aspectRatio = item.template.width / item.template.height;
  const wUncFromMaxH = Math.round(380 * aspectRatio);
  const cardW = Math.min(wUncFromMaxH, 860);
  const fixedH = Math.max(100, wUncFromMaxH > 860 ? Math.round(860 / aspectRatio) : 380);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && index > 0) onNav(index - 1);
      if (e.key === "ArrowRight" && index < items.length - 1) onNav(index + 1);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [index, items.length, onClose, onNav]);

  return (
    <Box
      sx={{ position: 'fixed', inset: 0, zIndex: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'rgba(0,0,0,0.40)', backdropFilter: 'blur(2px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <Box
        sx={{ bgcolor: 'background.paper', borderRadius: '12px', overflow: 'hidden', display: 'flex', flexDirection: 'column', width: Math.min(cardW + 2, window.innerWidth * 0.92), maxWidth: '92vw', boxShadow: '0 8px 32px rgba(0,0,0,0.24)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <Box sx={{ flexShrink: 0, display: 'flex', alignItems: 'center', height: 52, px: 2, borderBottom: '1px solid rgba(0,0,0,0.10)' }}>
          <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', height: 24, px: 1, borderRadius: '8px', bgcolor: 'rgba(71,59,171,0.08)', mr: 1.25, flexShrink: 0 }}>
            <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--brand-accent)', letterSpacing: '0.2px' }}>{item.template.width}×{item.template.height}</span>
          </Box>
          <Box component="span" sx={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{item.template.name}</Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, ml: 1.25, flexShrink: 0 }}>
            <span style={{ fontSize: 12, color: 'var(--ink-tertiary)', fontVariantNumeric: 'tabular-nums' }}>{index + 1} / {items.length}</span>
            <IconButton size="small" onClick={onClose} sx={{ width: 30, height: 30, borderRadius: '50%', color: 'rgba(17,16,20,0.56)', '&:hover': { bgcolor: 'rgba(17,16,20,0.06)' } }}>
              <CloseIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>
        </Box>

        {/* Image area */}
        <Box sx={{ position: 'relative', bgcolor: '#f7f7fb', height: fixedH }}>
          <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            <JellyBeanCard
              offer={item.offer as any}
              template={item.template}
              fixedHeight={fixedH}
              bgImage={item.bgImage}
              brandKit={brandKit ?? undefined}
              groundFraction={item.groundFraction}
              carWidthFraction={item.carWidthFraction}
              carAnchorX={item.carAnchorX}
              isGenerating={item.isGenerating}
              bgExactFormat={item.bgExactFormat}
              dealerName={dealerName}
              ctaText={ctaText}
              leaseLabel={leaseLabel}
              finePrint={finePrint}
            />
          </Box>
          {index > 0 && (
            <button
              onClick={() => onNav(index - 1)}
              aria-label="Previous"
              style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.80)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(17,16,20,0.72)', boxShadow: '0px 2px 8px rgba(0,0,0,0.16)', cursor: 'pointer', backdropFilter: 'blur(2px)' }}
            >
              <ChevronLeftIcon sx={{ fontSize: 20 }} />
            </button>
          )}
          {index < items.length - 1 && (
            <button
              onClick={() => onNav(index + 1)}
              aria-label="Next"
              style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.80)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(17,16,20,0.72)', boxShadow: '0px 2px 8px rgba(0,0,0,0.16)', cursor: 'pointer', backdropFilter: 'blur(2px)' }}
            >
              <ChevronRightIcon sx={{ fontSize: 20 }} />
            </button>
          )}
        </Box>

        {/* Footer */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 1.25, borderTop: '1px solid rgba(0,0,0,0.06)' }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink)' }}>{item.offer.year} {item.offer.make} {item.offer.model} {item.offer.trim}</span>
          <span style={{ color: 'rgba(0,0,0,0.2)' }}>·</span>
          <span style={{ fontSize: 12, color: 'var(--ink-secondary)' }}>{item.offer.offerType}</span>
          <span style={{ color: 'rgba(0,0,0,0.2)' }}>·</span>
          <span style={{ fontSize: 12, color: 'var(--ink-secondary)' }}>${item.offer.monthlyPayment}/mo</span>
          <Box sx={{ ml: 'auto' }}><span style={{ fontSize: 11, color: 'var(--ink-tertiary)' }}>{item.template.format}</span></Box>
        </Box>
      </Box>
    </Box>
  );
}

// ─── Section/asset types ──────────────────────────────────────────────────────
const SECTION_IDS = ["offers", "templates", "platforms", "backgrounds", "theme", "preview", "assets", "adshells", "campaigns"] as const;
type SectionId = typeof SECTION_IDS[number];
type GeneratedAsset = { key: string; offer: Offer; template: Template; bgId: string | null };

// ─── ProjectCard ──────────────────────────────────────────────────────────────
function ProjectCard({
  project, onClick, onDelete, onDragStart, onDragEnd, isDragging,
}: {
  project: LocalProject;
  onClick: () => void;
  onDelete: () => void;
  onDragStart: () => void;
  onDragEnd: () => void;
  isDragging: boolean;
}) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const logoUrl = getProjectLogoUrl(project.id);

  const { offersCount, templatesCount, bgCount } = (() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEYS.PROJECT_STATE(project.id)) ?? 'null');
      const addedOffers    = (saved?.addedOfferIds    as string[] | undefined) ?? [];
      const addedTemplates = (saved?.addedTemplateIds as string[] | undefined) ?? [];
      const removedOffers  = new Set<string>((saved?.removedOfferIds  as string[] | undefined) ?? []);
      const removedTpls    = new Set<string>((saved?.removedTemplateIds as string[] | undefined) ?? []);
      const agentBgs       = (saved?.agentAddedBgIds  as string[] | undefined) ?? [];
      const allOffers = [...new Set([...(project.offerIds ?? []), ...addedOffers])].filter(id => !removedOffers.has(id));
      const allTpls   = [...new Set([...(project.templateIds ?? []), ...addedTemplates])].filter(id => !removedTpls.has(id));
      const bgs       = agentBgs.length > 0 ? agentBgs.length : (saved?.bgId ? 1 : 0);
      return { offersCount: allOffers.length, templatesCount: allTpls.length, bgCount: bgs };
    } catch {
      return { offersCount: (project.offerIds ?? []).length, templatesCount: (project.templateIds ?? []).length, bgCount: 0 };
    }
  })();
  const assetsCount = offersCount * templatesCount;
  const status = project.status as ProjectStatus;
  const isDark = status === "Assets Created";

  return (
    <Box
      draggable
      onDragStart={(e) => { e.stopPropagation(); onDragStart(); }}
      onDragEnd={onDragEnd}
      onClick={onClick}
      sx={{
        width: '100%', textAlign: 'left', bgcolor: 'background.paper',
        border: '1px solid #e8e7ef', borderRadius: 3, overflow: 'hidden',
        display: 'flex', boxShadow: 1, cursor: 'pointer',
        opacity: isDragging ? 0.4 : 1,
        transform: isDragging ? 'scale(0.98)' : undefined,
        transition: 'box-shadow 0.15s, border-color 0.15s',
        '&:hover': { boxShadow: 2, borderColor: '#ccc9da' },
      }}
    >
      {/* Left thumbnail */}
      <Box
        sx={{ position: 'relative', width: 85, flexShrink: 0, alignSelf: 'stretch', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', cursor: 'grab', bgcolor: isDark ? '#1a1a2e' : '#f3f4f6' }}
      >
        <input type="checkbox" onClick={(e) => e.stopPropagation()} style={{ position: 'absolute', top: 8, left: 8, width: 14, height: 14, borderRadius: 3, cursor: 'pointer' }} />
        <img src={logoUrl} alt={project.dealerName} style={{ width: 48, height: 48, objectFit: 'contain', padding: 4, ...(isDark ? { filter: 'brightness(0) invert(1)' } : {}) }} />
      </Box>

      {/* Right content */}
      <Box sx={{ flex: 1, minWidth: 0, px: 1.5, py: 1.25, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
          <ProjectStatusChip status={status} />
          <IconButton size="small" onClick={(e) => { e.stopPropagation(); setAnchorEl(e.currentTarget); }} sx={{ color: '#d1d5db', '&:hover': { color: '#6b7280' }, flexShrink: 0, p: 0.25 }}>
            <MoreVertIcon sx={{ fontSize: 14 }} />
          </IconButton>
          <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={() => setAnchorEl(null)} onClick={(e) => e.stopPropagation()}>
            <MenuItem onClick={(e) => { e.stopPropagation(); setAnchorEl(null); onClick(); }}>
              <EditIcon sx={{ fontSize: 13, mr: 1, color: 'text.secondary' }} /> Edit Project
            </MenuItem>
            <MenuItem onClick={(e) => { e.stopPropagation(); setAnchorEl(null); onDelete(); }} sx={{ color: 'error.main' }}>
              <DeleteIcon sx={{ fontSize: 13, mr: 1 }} /> Delete Project
            </MenuItem>
          </Menu>
        </Box>

        {(() => {
          const displayTitle = project.name && !project.name.startsWith("WF") && !project.name.match(/^[A-Z]{2}\d/)
            ? project.name : project.dealerName;
          return <Typography sx={{ fontSize: '13px', fontWeight: 600, color: 'text.primary', lineHeight: 'tight', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{displayTitle}</Typography>;
        })()}

        <Typography sx={{ fontSize: '11px', color: 'text.secondary', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {"code" in project ? (project as any).code : ((project as any).name ?? "").startsWith("WF") ? (project as any).name : ((project as any).dateRange ?? "")}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 0.25 }}>
          <StatBadge icon={<DescriptionOutlinedIcon sx={{ fontSize: 16 }} />} count={offersCount} />
          <StatBadge icon={<PaletteIcon sx={{ fontSize: 16 }} />}     count={templatesCount} />
          <StatBadge icon={<ImageIcon sx={{ fontSize: 16 }} />}        count={bgCount} />
          <StatBadge icon={<LayersIcon sx={{ fontSize: 16 }} />}       count={assetsCount} />
        </Box>
      </Box>
    </Box>
  );
}

// ─── ProjectsListView ─────────────────────────────────────────────────────────
function ProjectsListView({
  allProjects, localProjectIds, onAddProject, onSelectProject, onMoveProject, onDeleteProject,
}: {
  allProjects: LocalProject[];
  localProjectIds: Set<string>;
  onAddProject: (p: LocalProject) => void;
  onSelectProject: (id: string) => void;
  onMoveProject: (id: string, status: ProjectStatus) => void;
  onDeleteProject: (id: string) => void;
}) {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "mine">("all");
  const [showNewProject, setShowNewProject] = useState(false);
  const [collapsedColumns, setCollapsedColumns] = useState<Set<ProjectStatus>>(new Set());
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<ProjectStatus | null>(null);

  const toggleColumn = (col: ProjectStatus) =>
    setCollapsedColumns((prev) => {
      const next = new Set(prev);
      next.has(col) ? next.delete(col) : next.add(col);
      return next;
    });

  const mineCount = allProjects.filter(p => localProjectIds.has(p.id)).length;

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return allProjects.filter((p) => {
      if (activeTab === "mine" && !localProjectIds.has(p.id)) return false;
      return !q || p.name.toLowerCase().includes(q) || p.dealerName.toLowerCase().includes(q);
    });
  }, [search, allProjects, activeTab, localProjectIds]);

  const byStatus = useMemo(() => {
    const map: Record<string, LocalProject[]> = {};
    for (const col of KANBAN_COLUMNS) map[col] = [];
    for (const p of filtered) {
      const key = p.status as string;
      if (map[key]) map[key].push(p);
      else map[key] = [p];
    }
    return map;
  }, [filtered]);

  return (
    <>
      <CreateProjectDialog
        open={showNewProject}
        onOpenChange={(v) => { if (!v) setShowNewProject(false); }}
        brandOptions={brandKits.map(k => ({ id: k.id, name: k.name }))}
        existingNames={allProjects.map(p => p.name || ("dealerName" in p ? (p as any).dealerName : "") || "")}
        onSave={(data: NewProjectInput) => {
          const fmt  = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
          const id   = `project-${Date.now()}`;
          const abbr = (data.account || data.brand || "GEN").slice(0, 6).toUpperCase().replace(/\s/g, "");
          const mon  = new Date().toLocaleDateString("en-US", { month: "short", year: "2-digit" }).replace(" ", "");
          const code = `WF${String(Math.floor(Math.random() * 90000 + 10000))}_${abbr}_${data.name.replace(/\s+/g, "")}_${mon}`;
          const kit  = brandKits.find((k) => k.name === data.brand);
          const ownerObj = PROJECT_OWNERS.find(o => o.id === data.ownerId);
          const ownerName = ownerObj?.name ?? "Jorge Verlindo";
          const proj: LocalProject = {
            id, dealerName: data.account || "My Account", ctaText: "Shop Now", leaseLabel: "", finePrint: "",
            name: data.name, code, status: "In Progress" as ProjectStatus,
            dateRange: `${fmt(data.startDate)} - ${fmt(data.endDate)}`,
            assignee: { name: ownerName, avatar: "" },
            oem: kit?.oem ?? data.brand ?? data.account ?? "General",
            templateIds: [], offerIds: [], tags: data.tags, owner: ownerName,
            platforms: data.platforms, createdAt: fmt(new Date()),
          };
          onAddProject(proj);
          setShowNewProject(false);
          onSelectProject(proj.id);
        }}
      />

      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', bgcolor: 'background.paper' }}>
        {/* Title + tabs */}
        <Box sx={{ px: 3, pt: 2, pb: 0, flexShrink: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
            <Typography sx={{ fontSize: '1rem', fontWeight: 600, color: 'text.primary' }}>Projects</Typography>
            <CommentsButton />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, borderBottom: '1px solid', borderColor: 'grey.100' }}>
            {(["all", "mine"] as const).map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                style={{ paddingBottom: 10, fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer', border: 'none', background: 'none', borderBottom: activeTab === tab ? '2px solid var(--brand-accent)' : '2px solid transparent', color: activeTab === tab ? 'var(--brand-accent)' : '#9ca3af', marginBottom: -1, transition: 'color 0.15s' }}>
                {tab === "all" ? `All (${allProjects.length})` : `Created By Me${mineCount > 0 ? ` (${mineCount})` : ""}`}
              </button>
            ))}
          </Box>
        </Box>

        {/* Action bar */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 3, py: 1, flexShrink: 0 }}>
          <IconButton size="small" sx={{ width: 28, height: 28, color: 'text.secondary', '&:hover': { bgcolor: 'grey.100' } }}>
            <FilterListIcon sx={{ fontSize: 20 }} />
          </IconButton>
          <Button
            size="small"
            onClick={() => setShowNewProject(true)}
            startIcon={<AddIcon sx={{ fontSize: 13 }} />}
            sx={{ borderRadius: 99, fontSize: '0.75rem', fontWeight: 600, px: 1.5, py: 0.75, bgcolor: 'var(--brand-accent)', color: 'white', '&:hover': { bgcolor: 'var(--brand-accent-hover)' }, textTransform: 'none' }}
          >
            New Project
          </Button>
          <IconButton size="small" sx={{ width: 28, height: 28, color: 'text.secondary' }}>
            <MoreVertIcon sx={{ fontSize: 15 }} />
          </IconButton>
          <Box sx={{ position: 'relative' }}>
            <SearchIcon sx={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: 'text.secondary' }} />
            <input
              type="text"
              placeholder="Find below"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: 32, paddingRight: 16, paddingTop: 6, paddingBottom: 6, fontSize: '0.75rem', backgroundColor: '#f9fafb', border: '1px solid #f3f4f6', borderRadius: 999, color: '#374151', outline: 'none', width: 176 }}
            />
          </Box>
          <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>{filtered.length} Projects</Typography>
            <IconButton size="small" sx={{ width: 28, height: 28, color: 'text.secondary' }}>
              <GridViewIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Box>
        </Box>

        {/* Kanban board */}
        <Box sx={{ flex: 1, overflow: 'auto', px: 3, pb: 3, pt: 1 }}>
          <Box
            sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start', minWidth: 'max-content' }}
            onDragOver={(e) => e.preventDefault()}
          >
            {KANBAN_COLUMNS.map((colStatus) => {
              const cards = byStatus[colStatus] ?? [];
              const isCollapsed = collapsedColumns.has(colStatus);
              const isDragTarget = dragOverCol === colStatus;

              return (
                <Box
                  key={colStatus}
                  sx={{ width: 345, flexShrink: 0, display: 'flex', flexDirection: 'column', borderRadius: 3, overflow: 'hidden', transition: 'background-color 0.15s', bgcolor: isDragTarget ? '#f0eef8' : '#F4F5F6', outline: isDragTarget ? '2px solid var(--brand-accent)' : 'none', outlineOffset: 1 }}
                  onDragOver={(e) => { e.preventDefault(); setDragOverCol(colStatus); }}
                  onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOverCol(null); }}
                  onDrop={(e) => { e.preventDefault(); if (draggedId) onMoveProject(draggedId, colStatus); setDraggedId(null); setDragOverCol(null); }}
                >
                  <button
                    onClick={() => toggleColumn(colStatus)}
                    style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', userSelect: 'none' }}
                  >
                    {isCollapsed ? <ChevronRightIcon sx={{ fontSize: 14, color: 'text.secondary', flexShrink: 0 }} /> : <ExpandMoreIcon sx={{ fontSize: 14, color: 'text.secondary', flexShrink: 0 }} />}
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#111827' }}>{colStatus}</span>
                    <span style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 400 }}>({cards.length})</span>
                  </button>

                  <Collapse in={!isCollapsed}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25, pt: 0.5, px: 2, pb: 2 }}>
                      {cards.map((p) => (
                        <ProjectCard
                          key={p.id}
                          project={p}
                          onClick={() => onSelectProject(p.id)}
                          onDelete={() => onDeleteProject(p.id)}
                          onDragStart={() => setDraggedId(p.id)}
                          onDragEnd={() => { setDraggedId(null); setDragOverCol(null); }}
                          isDragging={draggedId === p.id}
                        />
                      ))}
                      {cards.length === 0 && (
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', py: 4, borderRadius: 2, border: '1px dashed', borderColor: isDragTarget ? 'var(--brand-accent)' : 'grey.200', color: isDragTarget ? 'var(--brand-accent)' : 'grey.300', transition: 'all 0.15s' }}>
                          {isDragTarget ? "Drop here" : "No projects"}
                        </Box>
                      )}
                    </Box>
                  </Collapse>
                </Box>
              );
            })}
          </Box>
        </Box>
      </Box>
    </>
  );
}

// ─── ProjectDetailView (state container) ──────────────────────────────────────
function ProjectDetailView({
  project, onBack, onDelete, onUpdateProject,
}: {
  project: LocalProject;
  onBack: () => void;
  onDelete: () => void;
  onUpdateProject?: (id: string, patches: Partial<LocalProject>) => void;
}) {
  const logoUrl = getProjectLogoUrl(project.id);
  const offers    = (project.offerIds ?? []).map((id) => offerLibrary.find((o) => o.id === id)).filter((o): o is Offer => !!o);
  const templates = (project.templateIds ?? []).map((id) => templateLibrary.find((t) => t.id === id)).filter((t): t is Template => !!t);
  const status    = project.status as ProjectStatus;
  const offersCount   = offers.length    > 0 ? offers.length    : undefined;
  const templateCount = templates.length > 0 ? templates.length : undefined;
  const sceneBackgrounds = backgroundCollections.filter(bg => !(bg as any).isLifestyle);
  const saved = useMemo(() => loadProjectState(project.id), [project.id]);
  const { setActiveBrandKit, activeBrandKitIds } = useProjectStore();

  const [removedOfferIds, setRemovedOfferIds]       = useState<Set<string>>(new Set(saved?.removedOfferIds ?? []));
  const [removedTemplateIds, setRemovedTemplateIds] = useState<Set<string>>(new Set(saved?.removedTemplateIds ?? []));
  const [removedBgIds, setRemovedBgIds]             = useState<Set<string>>(new Set());
  const [confirmDelete, setConfirmDelete] = useState<{ type: "offer" | "template"; id: string; label: string } | null>(null);
  const [offerPatches, setOfferPatches] = useState<Record<string, Partial<StoredOffer>>>(
    ((saved?.offerPatches ?? saved?.jellyBeanPatches) as Record<string, Partial<StoredOffer>> | undefined) ?? {}
  );
  const [agentAddedOfferIds,    setAgentAddedOfferIds]    = useState<string[]>(saved?.addedOfferIds ?? []);
  const [agentEditedOfferIds,   setAgentEditedOfferIds]   = useState<Set<string>>(new Set());
  const [agentAddedTemplateIds, setAgentAddedTemplateIds] = useState<string[]>(saved?.addedTemplateIds ?? []);
  const [customOfferLibrary, setCustomOfferLibrary] = useState<StoredOffer[]>(() => loadCustomOfferLibrary());
  const [customTemplateLibrary, setCustomTemplateLibrary] = useState<Template[]>([]);
  const [customBackgroundLibrary, setCustomBackgroundLibrary] = useState<CustomBackground[]>(() => loadCustomBackgroundLibrary(project.id));
  const [agentAddedBgIds, setAgentAddedBgIds] = useState<string[]>(saved?.agentAddedBgIds ?? []);
  const [isDealerBgGenerating, setIsDealerBgGenerating] = useState(false);
  const [agentActivatedOems, setAgentActivatedOems] = useState<string[]>(
    saved?.activatedOems ?? (saved?.activatedOem ? [saved.activatedOem] : [])
  );

  const combinedOfferLibrary = useMemo(
    () => [...offerLibrary, ...customOfferLibrary].map(o =>
      offerPatches[o.id] ? { ...o, ...offerPatches[o.id] } : o
    ) as Offer[],
    [customOfferLibrary, offerPatches],
  );

  const isAgentCreated = project.id.startsWith("project-");
  const activeBrandKits: BrandKit[] = brandKits.filter(k =>
    agentActivatedOems.some(oem => k.oem === oem || k.name === oem)
  );
  const brandKit = activeBrandKits[0];

  const [expandedSections, setExpandedSections] = useState<Partial<Record<SectionId, boolean>>>({
    offers:    !!offersCount,
    templates: !!templateCount,
    preview:   !!offersCount && !!templateCount,
    theme:     agentActivatedOems.length > 0 && !isAgentCreated,
  });
  const [selectedBgId, setSelectedBgId] = useState<string | null>(saved?.bgId ?? null);
  const [showEditProject, setShowEditProject] = useState(false);
  const [taskOwners, setTaskOwners] = useState<Record<string, string>>(saved?.taskOwners ?? {});
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generatedAssets, setGeneratedAssets] = useState<GeneratedAsset[]>([]);

  // Auto-wire brand kit from project OEM
  useEffect(() => {
    const kit = brandKits.find(k =>
      k.oem.toLowerCase() === (project.oem ?? "").toLowerCase() ||
      k.name.toLowerCase() === (project.oem ?? "").toLowerCase()
    );
    if (!kit) return;
    if (!activeBrandKitIds[project.id]?.[kit.oem]) {
      setActiveBrandKit(project.id, kit.oem, kit.id);
    }
    setAgentActivatedOems(prev => prev.includes(kit.oem) ? prev : [...prev, kit.oem]);
  }, [project.id, project.oem]); // eslint-disable-line react-hooks/exhaustive-deps

  // Restore generated assets
  useEffect(() => {
    const savedIds = saved?.generatedAssetIds;
    if (!savedIds || savedIds.length === 0) return;
    const restored: GeneratedAsset[] = savedIds.flatMap(({ offerId, templateId, bgId }) => {
      const offer = combinedOfferLibrary.find(o => o.id === offerId);
      const template = templateLibrary.find(t => t.id === templateId);
      if (!offer || !template) return [];
      return [{ key: `${bgId ?? "none"}-${templateId}-${offerId}`, offer, template, bgId }];
    });
    if (restored.length > 0) {
      setGeneratedAssets(restored);
      setExpandedSections(prev => ({ ...prev, assets: true }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-expand Preview
  useEffect(() => {
    if (offers.length > 0 && templates.length > 0) {
      setExpandedSections(prev => ({ ...prev, preview: true }));
    }
  }, [offers.length, templates.length]);

  // Scroll-to-section handler
  useEffect(() => {
    const handler = (e: Event) => {
      const { section } = (e as CustomEvent<{ section: string }>).detail;
      setExpandedSections(prev => ({ ...prev, [section]: true }));
      setTimeout(() => {
        const el = document.querySelector(`[data-agent-section="${section}"]`);
        el?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 180);
    };
    window.addEventListener(AGENT_SCROLL_TO_SECTION_EVENT, handler);
    return () => window.removeEventListener(AGENT_SCROLL_TO_SECTION_EVENT, handler);
  }, []);

  // Open generate modal from agent
  useEffect(() => {
    const handler = () => setShowGenerateModal(true);
    window.addEventListener(AGENT_GENERATE_ASSETS_EVENT, handler);
    return () => window.removeEventListener(AGENT_GENERATE_ASSETS_EVENT, handler);
  }, []);

  // Autosave project state
  useEffect(() => {
    const state = {
      addedOfferIds: agentAddedOfferIds,
      addedTemplateIds: agentAddedTemplateIds,
      removedOfferIds: [...removedOfferIds],
      removedTemplateIds: [...removedTemplateIds],
      bgId: selectedBgId,
      agentAddedBgIds,
      activatedOems: agentActivatedOems,
      activatedOem: agentActivatedOems[0] ?? null,
      taskOwners,
      generatedAssetIds: generatedAssets.map(a => ({ offerId: a.offer.id, templateId: a.template.id, bgId: a.bgId })),
      offerPatches,
    };
    localStorage.setItem(STORAGE_KEYS.PROJECT_STATE(project.id), JSON.stringify(state));
  }, [agentAddedOfferIds, agentAddedTemplateIds, removedOfferIds, removedTemplateIds, selectedBgId, agentAddedBgIds, agentActivatedOems, project.id, taskOwners, generatedAssets, offerPatches]);

  const combinedOfferLibraryRef = useRef(combinedOfferLibrary);
  useEffect(() => { combinedOfferLibraryRef.current = combinedOfferLibrary; }, [combinedOfferLibrary]);

  // Agent action handler
  useEffect(() => {
    const handler = (e: Event) => {
      const { action, ...payload } = (e as CustomEvent<AgentActionPayload>).detail;
      if (action === "add_offers") {
        const { offerIds, editedOfferIds = [] } = payload as { offerIds: string[]; editedOfferIds?: string[] };
        if (editedOfferIds.length > 0) setAgentEditedOfferIds(prev => new Set([...prev, ...editedOfferIds]));
        setExpandedSections((prev) => ({ ...prev, offers: true }));
        setTimeout(() => setAgentAddedOfferIds((prev) => [...new Set([...prev, ...offerIds])]), 220);
      } else if (action === "remove_offers") {
        const { offerIds } = payload as { offerIds: string[] };
        setRemovedOfferIds((prev) => new Set([...prev, ...offerIds]));
      } else if (action === "add_templates") {
        const { templateIds } = payload as { templateIds: string[] };
        setExpandedSections((prev) => ({ ...prev, templates: true }));
        setTimeout(() => setAgentAddedTemplateIds((prev) => [...new Set([...prev, ...templateIds])]), 220);
      } else if (action === "remove_templates") {
        const { templateIds } = payload as { templateIds: string[] };
        setRemovedTemplateIds((prev) => new Set([...prev, ...templateIds]));
      } else if (action === "set_dealer_bg_generating") {
        const generating = (payload as { value: boolean }).value;
        setIsDealerBgGenerating(generating);
        if (generating) setExpandedSections((prev) => ({ ...prev, backgrounds: true }));
      } else if (action === "add_custom_background") {
        const bg = (payload as { background: CustomBackground }).background;
        setCustomBackgroundLibrary(prev => {
          const next = [...prev.filter(b => b.id !== bg.id), bg];
          saveCustomBackgroundLibrary(project.id, next);
          return next;
        });
        setSelectedBgId(bg.id);
      } else if (action === "add_backgrounds") {
        const { backgroundIds } = payload as { backgroundIds: string[] };
        setExpandedSections((prev) => ({ ...prev, backgrounds: true, preview: true }));
        setTimeout(() => {
          setAgentAddedBgIds((prev) => [...new Set([...prev, ...backgroundIds])]);
          if (backgroundIds.length > 0) setSelectedBgId(backgroundIds[0]);
        }, 220);
      } else if (action === "remove_backgrounds") {
        const { backgroundIds } = payload as { backgroundIds: string[] };
        setAgentAddedBgIds((prev) => prev.filter(id => !backgroundIds.includes(id)));
        setRemovedBgIds((prev) => new Set([...prev, ...backgroundIds]));
      } else if (action === "duplicate_template") {
        const { templateId, newName } = payload as { templateId: string; newName?: string };
        const combinedTpls = [...templateLibrary, ...customTemplateLibrary];
        const original = combinedTpls.find(t => t.id === templateId);
        if (original) {
          const copyId = `custom-tpl-${templateId}-${Date.now()}`;
          const copy: Template = { ...original, id: copyId, name: newName ?? `${original.name} (Copy)` };
          setCustomTemplateLibrary(prev => [...prev, copy]);
          setExpandedSections(prev => ({ ...prev, templates: true }));
          setTimeout(() => setAgentAddedTemplateIds(prev => [...new Set([...prev, copyId])]), 220);
        }
      } else if (action === "set_brand") {
        const { oem } = payload as { oem: string };
        setExpandedSections((prev) => ({ ...prev, theme: true }));
        setTimeout(() => {
          setAgentActivatedOems(prev => prev.includes(oem) ? prev : [...prev, oem]);
          const kit = brandKits.find(k => k.oem === oem || k.name === oem);
          if (kit) setActiveBrandKit(project.id, kit.oem, kit.id);
        }, 220);
      } else if (action === "add_custom_offers") {
        const { offers: customOffers } = payload as { offers: CustomOffer[] };
        const stored = customOffers.map(customOfferToStored);
        const newIds = stored.map((s) => s.id);
        setCustomOfferLibrary((prev) => {
          const merged = [...prev, ...stored.filter((s) => !prev.some((p) => p.id === s.id))];
          saveCustomOfferLibrary(merged);
          return merged;
        });
        setExpandedSections((prev) => ({ ...prev, offers: true }));
        setTimeout(() => setAgentAddedOfferIds((prev) => [...new Set([...prev, ...newIds])]), 220);
      } else if (action === "edit_offer") {
        const { offerId, patches } = payload as { offerId: string; patches: Partial<StoredOffer> };
        const COLOR_WORDS = ['white', 'black', 'red', 'blue', 'silver', 'gray', 'grey', 'green', 'orange', 'brown', 'branco', 'preto', 'vermelho', 'azul', 'prata'];
        const colorPatchStr = JSON.stringify({ trim: (patches as any).trim, model: (patches as any).model }).toLowerCase();
        const detectedColor = COLOR_WORDS.find(c => colorPatchStr.includes(c));
        if (detectedColor && ((patches as any).trim !== undefined || (patches as any).model !== undefined)) {
          const base = combinedOfferLibraryRef.current.find(o => o.id === offerId) as any;
          if (base) {
            const colorMap: Record<string, string> = { branco: 'white', preto: 'black', vermelho: 'red', azul: 'blue', prata: 'silver', grey: 'gray' };
            const colorFamily = colorMap[detectedColor] ?? detectedColor;
            const jbResult = resolveJellybean(base.model, colorFamily, base.year, base.trim);
            const jellybeanUrl = jbResult ? jbResult.url : null;
            if (jellybeanUrl) {
              setOfferPatches(prev => ({ ...prev, [offerId]: { ...prev[offerId], image: jellybeanUrl, exteriorColor: colorFamily } }));
              setGeneratedAssets(prev => prev.map(asset =>
                asset.offer.id === offerId
                  ? { ...asset, offer: { ...(asset.offer as any), image: jellybeanUrl, exteriorColor: colorFamily } }
                  : asset
              ));
              return;
            }
          }
        }
        if (offerId.startsWith("custom-")) {
          setCustomOfferLibrary((prev) => {
            const updated = prev.map((o) => o.id === offerId ? { ...o, ...patches } : o);
            saveCustomOfferLibrary(updated);
            return updated;
          });
          setGeneratedAssets((prev) => prev.map(asset =>
            asset.offer.id === offerId ? { ...asset, offer: { ...(asset.offer as any), ...patches } } : asset
          ));
        } else {
          setOfferPatches(prev => ({ ...prev, [offerId]: { ...prev[offerId], ...patches } }));
          setAgentEditedOfferIds(prev => new Set([...prev, offerId]));
          setGeneratedAssets((prev) => prev.map(asset =>
            asset.offer.id === offerId ? { ...asset, offer: { ...(asset.offer as any), ...patches } } : asset
          ));
        }
      } else if (action === "set_task_owners") {
        const ownerNames = (payload as any).owners as Record<string, string>;
        const newOwners: Record<string, string> = {};
        Object.entries(ownerNames).forEach(([section, name]) => {
          const owner = PROJECT_OWNERS.find(o => o.name === name);
          if (owner) newOwners[section] = owner.id;
        });
        setTaskOwners(prev => ({ ...prev, ...newOwners }));
      } else if (action === "set_project_name") {
        const { name } = payload as { name: string };
        onUpdateProject?.(project.id, { name });
      } else if (action === "update_project_display") {
        const { patches } = payload as { patches: { ctaText?: string; leaseLabel?: string; finePrint?: string; dealerName?: string } };
        onUpdateProject?.(project.id, patches);
      } else if (action === "swap_jellybean") {
        const { offerId, jellybeanUrl, colorFamily } = payload as { offerId: string; jellybeanUrl: string; jellybeanId: string; colorFamily: string };
        setOfferPatches(prev => ({ ...prev, [offerId]: { ...prev[offerId], image: jellybeanUrl, exteriorColor: colorFamily } }));
        setGeneratedAssets(prev => prev.map(asset => asset.offer.id === offerId
          ? { ...asset, offer: { ...(asset.offer as any), image: jellybeanUrl, exteriorColor: colorFamily } }
          : asset));
      }
    };
    window.addEventListener(PROJECT_AGENT_ACTION_EVENT, handler);
    return () => window.removeEventListener(PROJECT_AGENT_ACTION_EVENT, handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ProjectDetailViewInner
      project={project}
      onBack={onBack}
      onDelete={onDelete}
      onUpdateProject={onUpdateProject}
      offers={offers}
      templates={templates}
      status={status}
      offersCount={offersCount}
      templateCount={templateCount}
      sceneBackgrounds={sceneBackgrounds}
      saved={saved}
      removedOfferIds={removedOfferIds}
      setRemovedOfferIds={setRemovedOfferIds}
      removedTemplateIds={removedTemplateIds}
      setRemovedTemplateIds={setRemovedTemplateIds}
      removedBgIds={removedBgIds}
      setRemovedBgIds={setRemovedBgIds}
      confirmDelete={confirmDelete}
      setConfirmDelete={setConfirmDelete}
      agentAddedOfferIds={agentAddedOfferIds}
      setAgentAddedOfferIds={setAgentAddedOfferIds}
      agentEditedOfferIds={agentEditedOfferIds}
      setAgentEditedOfferIds={setAgentEditedOfferIds}
      agentAddedTemplateIds={agentAddedTemplateIds}
      setAgentAddedTemplateIds={setAgentAddedTemplateIds}
      customOfferLibrary={customOfferLibrary}
      setCustomOfferLibrary={setCustomOfferLibrary}
      customBackgroundLibrary={customBackgroundLibrary}
      setCustomBackgroundLibrary={setCustomBackgroundLibrary}
      agentAddedBgIds={agentAddedBgIds}
      setAgentAddedBgIds={setAgentAddedBgIds}
      isDealerBgGenerating={isDealerBgGenerating}
      agentActivatedOems={agentActivatedOems}
      setAgentActivatedOems={setAgentActivatedOems}
      combinedOfferLibrary={combinedOfferLibrary}
      isAgentCreated={isAgentCreated}
      activeBrandKits={activeBrandKits}
      brandKit={brandKit}
      expandedSections={expandedSections}
      setExpandedSections={setExpandedSections}
      selectedBgId={selectedBgId}
      setSelectedBgId={setSelectedBgId}
      showEditProject={showEditProject}
      setShowEditProject={setShowEditProject}
      taskOwners={taskOwners}
      setTaskOwners={setTaskOwners}
      showGenerateModal={showGenerateModal}
      setShowGenerateModal={setShowGenerateModal}
      generatedAssets={generatedAssets}
      setGeneratedAssets={setGeneratedAssets}
      logoUrl={logoUrl}
    />
  );
}

// ─── ProjectDetailViewInner ───────────────────────────────────────────────────
function ProjectDetailViewInner({
  project, onBack, onDelete, onUpdateProject,
  offers, templates, status, offersCount, templateCount,
  sceneBackgrounds, saved,
  removedOfferIds, setRemovedOfferIds,
  removedTemplateIds, setRemovedTemplateIds,
  removedBgIds, setRemovedBgIds,
  confirmDelete, setConfirmDelete,
  agentAddedOfferIds, setAgentAddedOfferIds,
  agentEditedOfferIds, setAgentEditedOfferIds,
  agentAddedTemplateIds, setAgentAddedTemplateIds,
  customOfferLibrary, setCustomOfferLibrary,
  customBackgroundLibrary, setCustomBackgroundLibrary,
  agentAddedBgIds, setAgentAddedBgIds,
  isDealerBgGenerating,
  agentActivatedOems, setAgentActivatedOems,
  combinedOfferLibrary, isAgentCreated,
  activeBrandKits, brandKit,
  expandedSections, setExpandedSections,
  selectedBgId, setSelectedBgId,
  showEditProject, setShowEditProject,
  taskOwners, setTaskOwners,
  showGenerateModal, setShowGenerateModal,
  generatedAssets, setGeneratedAssets,
  logoUrl,
}: {
  project: LocalProject;
  onBack: () => void;
  onDelete: () => void;
  onUpdateProject?: (id: string, patches: Partial<LocalProject>) => void;
  offers: Offer[];
  templates: Template[];
  status: ProjectStatus;
  offersCount: number | undefined;
  templateCount: number | undefined;
  sceneBackgrounds: typeof backgroundCollections;
  saved: ReturnType<typeof loadProjectState>;
  removedOfferIds: Set<string>;
  setRemovedOfferIds: React.Dispatch<React.SetStateAction<Set<string>>>;
  removedTemplateIds: Set<string>;
  setRemovedTemplateIds: React.Dispatch<React.SetStateAction<Set<string>>>;
  removedBgIds: Set<string>;
  setRemovedBgIds: React.Dispatch<React.SetStateAction<Set<string>>>;
  confirmDelete: { type: "offer" | "template"; id: string; label: string } | null;
  setConfirmDelete: React.Dispatch<React.SetStateAction<{ type: "offer" | "template"; id: string; label: string } | null>>;
  agentAddedOfferIds: string[];
  setAgentAddedOfferIds: React.Dispatch<React.SetStateAction<string[]>>;
  agentEditedOfferIds: Set<string>;
  setAgentEditedOfferIds: React.Dispatch<React.SetStateAction<Set<string>>>;
  agentAddedTemplateIds: string[];
  setAgentAddedTemplateIds: React.Dispatch<React.SetStateAction<string[]>>;
  customOfferLibrary: StoredOffer[];
  setCustomOfferLibrary: React.Dispatch<React.SetStateAction<StoredOffer[]>>;
  customBackgroundLibrary: CustomBackground[];
  setCustomBackgroundLibrary: React.Dispatch<React.SetStateAction<CustomBackground[]>>;
  agentAddedBgIds: string[];
  setAgentAddedBgIds: React.Dispatch<React.SetStateAction<string[]>>;
  isDealerBgGenerating: boolean;
  agentActivatedOems: string[];
  setAgentActivatedOems: React.Dispatch<React.SetStateAction<string[]>>;
  combinedOfferLibrary: Offer[];
  isAgentCreated: boolean;
  activeBrandKits: BrandKit[];
  brandKit: BrandKit | undefined;
  expandedSections: Partial<Record<SectionId, boolean>>;
  setExpandedSections: React.Dispatch<React.SetStateAction<Partial<Record<SectionId, boolean>>>>;
  selectedBgId: string | null;
  setSelectedBgId: React.Dispatch<React.SetStateAction<string | null>>;
  showEditProject: boolean;
  setShowEditProject: React.Dispatch<React.SetStateAction<boolean>>;
  taskOwners: Record<string, string>;
  setTaskOwners: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  showGenerateModal: boolean;
  setShowGenerateModal: React.Dispatch<React.SetStateAction<boolean>>;
  generatedAssets: GeneratedAsset[];
  setGeneratedAssets: React.Dispatch<React.SetStateAction<GeneratedAsset[]>>;
  logoUrl: string;
}) {
  const commentsCtx = useComments();
  const [detailPage, setDetailPage] = useState<string | null>(null);
  const [previewLightbox, setPreviewLightbox] = useState<{ items: LightboxItem[]; index: number } | null>(null);
  const [editingBg, setEditingBg] = useState<CustomBackground | null>(null);
  const [kebabAnchor, setKebabAnchor] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const handler = () => setDetailPage("campaigns");
    window.addEventListener(AGENT_OPEN_CAMPAIGNS_EVENT, handler);
    return () => window.removeEventListener(AGENT_OPEN_CAMPAIGNS_EVENT, handler);
  }, []);

  const setTaskOwner = (section: string, ownerId: string) =>
    setTaskOwners((prev) => ({ ...prev, [section]: ownerId }));

  const { setActiveBrandKit } = useProjectStore();

  const accountName = project.dealerName;
  const tags = (project as LocalProject).tags ?? [];
  const createdDateStr = (project.createdAt ?? (project.dateRange ?? "").split(" - ")[0]) || "—";
  const initials = (project.assignee?.name ?? "").split(" ").map((n: string) => n[0] ?? "").join("").toUpperCase().slice(0, 2);

  const allExpanded = SECTION_IDS.every((id) => expandedSections[id]);
  const toggleSection = (id: SectionId, v: boolean) => setExpandedSections((prev) => ({ ...prev, [id]: v }));
  const toggleExpandAll = () => {
    if (allExpanded) setExpandedSections({});
    else setExpandedSections(Object.fromEntries(SECTION_IDS.map((id) => [id, true])));
  };

  const visibleOffers = useMemo(() => {
    const combined = [...offers, ...agentAddedOfferIds.map((id) => combinedOfferLibrary.find((o) => o.id === id)).filter((o): o is Offer => !!o)];
    const seen = new Set<string>();
    return combined.filter((o) => { if (removedOfferIds.has(o.id) || seen.has(o.id)) return false; seen.add(o.id); return true; });
  }, [offers, agentAddedOfferIds, combinedOfferLibrary, removedOfferIds]);

  const combinedTemplateLibrary = useMemo(() => [...templateLibrary, ...[]/* customTemplateLibrary accessed via closure */], []);

  const visibleTemplates = useMemo(() => {
    const combined = [...templates, ...agentAddedTemplateIds.map((id) => templateLibrary.find((t) => t.id === id)).filter((t): t is Template => !!t)];
    const seen = new Set<string>();
    return combined.filter((t) => { if (removedTemplateIds.has(t.id) || seen.has(t.id)) return false; seen.add(t.id); return true; });
  }, [templates, agentAddedTemplateIds, removedTemplateIds]);

  const visibleBackgrounds = useMemo(() => {
    const catalogBgs = agentAddedBgIds.map((id) => backgroundCollections.find((b) => b.id === id)).filter((b): b is NonNullable<typeof b> => !!b).filter((b) => !removedBgIds.has(b.id));
    const customBgs = customBackgroundLibrary.filter(b => !removedBgIds.has(b.id));
    return [...catalogBgs, ...customBgs];
  }, [agentAddedBgIds, removedBgIds, customBackgroundLibrary]);

  const selectedBg = backgroundCollections.find(b => b.id === selectedBgId) ?? customBackgroundLibrary.find(b => b.id === selectedBgId) ?? null;

  const handleConfirmDelete = () => {
    if (!confirmDelete) return;
    if (confirmDelete.type === "offer") {
      setRemovedOfferIds((prev) => new Set([...prev, confirmDelete.id]));
    } else {
      setRemovedTemplateIds((prev) => new Set([...prev, confirmDelete.id]));
    }
    setConfirmDelete(null);
    persistProjectState(project.id, {
      removedOfferIds: [...removedOfferIds, confirmDelete.type === "offer" ? confirmDelete.id : ""].filter(Boolean),
      removedTemplateIds: [...removedTemplateIds, confirmDelete.type === "template" ? confirmDelete.id : ""].filter(Boolean),
      addedOfferIds: agentAddedOfferIds,
      addedTemplateIds: agentAddedTemplateIds,
      agentAddedBgIds,
      activatedOems: agentActivatedOems,
    });
    emitSnackbar(`${confirmDelete.type === "offer" ? "Offer" : "Template"} removed`);
  };

  const actnBtnSx = { display: 'flex', alignItems: 'center', gap: 0.5, fontSize: '12px', color: 'var(--brand-accent)', fontWeight: 500, cursor: 'pointer', '&:hover': { opacity: 0.75 }, transition: 'opacity 0.15s', background: 'none', border: 'none', p: 0 };

  return (
    <Box sx={{ position: 'relative', display: 'flex', flexDirection: 'row', height: '100%', bgcolor: 'background.paper', overflow: 'hidden' }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, overflow: 'hidden' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: 'background.paper', overflow: 'hidden' }}>

          {/* Header */}
          <Box sx={{ px: 2.5, pt: 1.75, pb: 0, flexShrink: 0 }}>
            <Box sx={{ mb: 1.25, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <BreadcrumbBar items={[{ label: "Projects", onClick: onBack }]} activeLabel={project.name} />
              <CommentsButton />
            </Box>

            {/* Title row */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1, minWidth: 0 }}>
              <IconButton size="small" sx={{ width: 28, height: 28, color: 'text.secondary', '&:hover': { bgcolor: 'grey.100' }, flexShrink: 0, borderRadius: 1 }}>
                <LeftPaneIcon />
              </IconButton>
              <Typography sx={{ fontSize: '18px', fontWeight: 700, color: 'var(--ink)', lineHeight: 'tight', minWidth: 0 }}>
                {project.name && !project.name.startsWith("WF") && !project.name.match(/^[A-Z]{2}\d/) ? project.name : project.dealerName}
              </Typography>
              <IconButton size="small" onClick={(e) => setKebabAnchor(e.currentTarget)} sx={{ width: 28, height: 28, color: 'text.secondary', '&:hover': { bgcolor: 'grey.100' }, flexShrink: 0, borderRadius: 1 }}>
                <MoreVertIcon sx={{ fontSize: 15 }} />
              </IconButton>
              <Menu anchorEl={kebabAnchor} open={!!kebabAnchor} onClose={() => setKebabAnchor(null)}>
                <MenuItem onClick={() => { setKebabAnchor(null); setShowEditProject(true); }}>
                  <EditIcon sx={{ fontSize: 13, mr: 1, color: 'text.secondary' }} /> Edit Project
                </MenuItem>
                <MenuItem onClick={() => { setKebabAnchor(null); onDelete(); }} sx={{ color: 'error.main' }}>
                  <DeleteIcon sx={{ fontSize: 13, mr: 1 }} /> Delete Project
                </MenuItem>
              </Menu>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, fontSize: '12px', color: 'text.secondary', flexShrink: 0 }}>
                <Box sx={{ width: 24, height: 24, borderRadius: 1, bgcolor: 'grey.50', border: '1px solid', borderColor: 'grey.100', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img src={logoUrl} alt={accountName} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 2 }} />
                </Box>
                <Box component="span" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 130 }}>{accountName}</Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, fontSize: '12px', color: 'text.secondary', flexShrink: 0 }}>
                <Box sx={{ width: 24, height: 24, borderRadius: '50%', bgcolor: 'var(--brand-accent)', color: 'white', fontSize: '9px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{initials}</Box>
                <Box component="span" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 110 }}>{project.assignee?.name ?? ""}</Box>
              </Box>
            </Box>

            {/* Metadata row */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '4px 8px', pb: 1.5, borderBottom: '1px solid #EAEAEC' }}>
              <ProjectStatusChip status={status} />
              <Typography sx={{ fontSize: '12px', color: 'text.secondary' }}>{project.dateRange}</Typography>
              <TagChip label={accountName} />
              {tags.map((t) => <TagChip key={t} label={t} />)}
              <Typography sx={{ fontSize: '11px' }}><Box component="span" sx={{ fontWeight: 500, color: 'var(--ink)' }}>Last Updated:</Box> <Box component="span" sx={{ color: 'text.secondary' }}>just now</Box></Typography>
              <Typography sx={{ fontSize: '11px' }}><Box component="span" sx={{ fontWeight: 500, color: 'var(--ink)' }}>Created:</Box> <Box component="span" sx={{ color: 'text.secondary' }}>{createdDateStr}</Box></Typography>
              <Typography sx={{ fontSize: '11px' }}><Box component="span" sx={{ fontWeight: 500, color: 'var(--ink)' }}>Creator:</Box> <Box component="span" sx={{ color: 'text.secondary' }}>{project.assignee?.name ?? ""}</Box></Typography>
              <Box component="button" onClick={toggleExpandAll} sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 0.5, fontSize: '12px', color: 'var(--brand-accent)', fontWeight: 500, cursor: 'pointer', background: 'none', border: 'none', '&:hover': { opacity: 0.75 } }}>
                <UnfoldMoreIcon sx={{ fontSize: 13 }} />
                {allExpanded ? "Collapse" : "Expand"}
              </Box>
            </Box>
          </Box>

          {/* Accordion sections */}
          <Box sx={{ flex: 1, overflowY: 'auto' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, px: 2, py: 1.5 }}>

              {/* Offers */}
              <Box data-agent-section="offers">
                <ProjectAccordionSection
                  title="Offers"
                  count={visibleOffers.length > 0 ? visibleOffers.length : undefined}
                  statusSlot={visibleOffers.length > 0 ? <ProjectStatusChip status="Done" /> : undefined}
                  onDetails={visibleOffers.length > 0 ? () => setDetailPage("offers") : undefined}
                  expanded={expandedSections["offers"]}
                  onExpandedChange={(v) => toggleSection("offers", v)}
                  ownerSlot={<TaskOwner ownerId={taskOwners["offers"]} onChange={(id) => setTaskOwner("offers", id)} />}
                  emptyContent={<Box component="button" sx={actnBtnSx}><AddIcon sx={{ fontSize: 12 }} />Add Offers</Box>}
                >
                  <Box sx={{ display: 'flex', gap: 1.5, overflowX: 'auto', pb: 0.5 }}>
                    {visibleOffers.map((o) => (
                      <Box key={o.id} sx={{ flexShrink: 0 }}>
                        <OfferCard
                          offer={o as any}
                          variant={agentEditedOfferIds.has(o.id) ? "regular" : undefined}
                          onDelete={() => setConfirmDelete({ type: "offer", id: o.id, label: `${(o as any).year} ${(o as any).make} ${(o as any).model} ${(o as any).trim}` })}
                        />
                      </Box>
                    ))}
                  </Box>
                </ProjectAccordionSection>
              </Box>

              {/* Templates */}
              <Box data-agent-section="templates">
                <ProjectAccordionSection
                  title="Templates"
                  count={visibleTemplates.length > 0 ? visibleTemplates.length : undefined}
                  statusSlot={visibleTemplates.length > 0 ? <ProjectStatusChip status="Done" /> : undefined}
                  onDetails={visibleTemplates.length > 0 ? () => setDetailPage("templates") : undefined}
                  expanded={expandedSections["templates"]}
                  onExpandedChange={(v) => toggleSection("templates", v)}
                  ownerSlot={<TaskOwner ownerId={taskOwners["templates"]} onChange={(id) => setTaskOwner("templates", id)} />}
                  emptyContent={<Box component="button" sx={actnBtnSx}><AddIcon sx={{ fontSize: 12 }} />Add Templates</Box>}
                >
                  <Box sx={{ display: 'flex', gap: 1.5, overflowX: 'auto', pb: 1 }}>
                    {visibleTemplates.map((t) => (
                      <Box key={t.id} sx={{ flexShrink: 0, width: 260 }}>
                        <TemplateCard
                          template={t}
                          onDelete={() => setConfirmDelete({ type: "template", id: t.id, label: t.name })}
                        />
                      </Box>
                    ))}
                  </Box>
                </ProjectAccordionSection>
              </Box>

              {/* Platforms */}
              <Box data-agent-section="platforms">
                <ProjectAccordionSection
                  title="Platforms"
                  count={(project.platforms?.length ?? 0) > 0 ? (project.platforms?.length ?? 0) : undefined}
                  statusSlot={(project.platforms?.length ?? 0) > 0 ? <ProjectStatusChip status="Done" /> : undefined}
                  ownerSlot={<TaskOwner ownerId={taskOwners["platforms"]} onChange={(id) => setTaskOwner("platforms", id)} />}
                  expanded={expandedSections["platforms"]}
                  onExpandedChange={(v) => toggleSection("platforms", v)}
                  emptyContent={<Box component="button" sx={actnBtnSx}><AddIcon sx={{ fontSize: 12 }} />Add Platforms</Box>}
                >
                  {(project.platforms?.length ?? 0) > 0 && (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                      {(project.platforms ?? []).map((p) => {
                        const opt = PLATFORM_OPTIONS.find(o => o.id === p || o.label === p);
                        const label = opt?.label ?? p;
                        return <Chip key={p} label={label} size="small" variant="outlined" sx={{ fontSize: '0.75rem' }} />;
                      })}
                    </Box>
                  )}
                </ProjectAccordionSection>
              </Box>

              {/* Backgrounds */}
              <Box data-agent-section="backgrounds">
                <ProjectAccordionSection
                  title="Backgrounds"
                  count={visibleBackgrounds.length > 0 ? visibleBackgrounds.length : undefined}
                  onDetails={visibleBackgrounds.length > 0 ? () => setDetailPage("logos-backgrounds") : undefined}
                  expanded={expandedSections["backgrounds"]}
                  onExpandedChange={(v) => toggleSection("backgrounds", v)}
                  ownerSlot={<TaskOwner ownerId={taskOwners["backgrounds"]} onChange={(id) => setTaskOwner("backgrounds", id)} />}
                  emptyContent={<Box component="button" sx={actnBtnSx}><AddIcon sx={{ fontSize: 12 }} />Add Backgrounds</Box>}
                >
                  {isDealerBgGenerating && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1 }}>
                      <Box sx={{ borderRadius: '8px', width: 88, height: 60, bgcolor: 'rgba(71,59,171,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, animation: 'pulse 1.5s ease-in-out infinite', '@keyframes pulse': { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.5 } } }}>
                        <VisibilityIcon sx={{ fontSize: 20, opacity: 0.4, color: 'primary.main' }} />
                      </Box>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                        <Box sx={{ height: 12, width: 128, borderRadius: 1, bgcolor: 'rgba(71,59,171,0.10)', animation: 'pulse 1.5s ease-in-out infinite', '@keyframes pulse': { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.5 } } }} />
                        <Box sx={{ height: 10, width: 96, borderRadius: 1, bgcolor: 'rgba(71,59,171,0.06)', animation: 'pulse 1.5s ease-in-out infinite', '@keyframes pulse': { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.5 } } }} />
                      </Box>
                    </Box>
                  )}
                  <Box sx={{ display: 'flex', gap: 1.5, overflowX: 'auto', pb: 1 }}>
                    {visibleBackgrounds.map((bg) => {
                      const [bgAnchor, setBgAnchor] = useState<HTMLElement | null>(null);
                      return (
                        <Box key={bg.id} sx={{ position: 'relative', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.75, cursor: 'pointer', width: 80, '&:hover .bg-kebab': { opacity: 1 } }}>
                          <Box className="bg-kebab" sx={{ position: 'absolute', top: 0, right: 0, zIndex: 10, opacity: 0, transition: 'opacity 0.15s' }}>
                            <IconButton size="small" sx={{ width: 18, height: 18, bgcolor: 'rgba(255,255,255,0.9)', boxShadow: 1, p: 0 }} onClick={(e) => { e.stopPropagation(); setBgAnchor(e.currentTarget); }}>
                              <MoreVertIcon sx={{ fontSize: 10, color: 'text.secondary' }} />
                            </IconButton>
                            <Menu anchorEl={bgAnchor} open={!!bgAnchor} onClose={() => setBgAnchor(null)}>
                              <MenuItem onClick={(e) => { e.stopPropagation(); setBgAnchor(null); setEditingBg({ id: bg.id, name: bg.name, thumbnail: bg.thumbnail, images: bg.images }); }}>Customize</MenuItem>
                              <MenuItem sx={{ color: 'error.main' }} onClick={(e) => { e.stopPropagation(); setBgAnchor(null); setRemovedBgIds(prev => new Set([...prev, bg.id])); if (selectedBgId === bg.id) setSelectedBgId(null); }}>Delete</MenuItem>
                            </Menu>
                          </Box>
                          <button onClick={() => setSelectedBgId(prev => prev === bg.id ? null : bg.id)} style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                            <Box sx={{ position: 'relative', width: 80, height: 60, borderRadius: 2, overflow: 'hidden', outline: selectedBgId === bg.id ? '2.5px solid var(--brand-accent)' : '2px solid transparent', outlineOffset: 1, boxShadow: selectedBgId === bg.id ? '0 0 0 4px rgba(71,59,171,0.15)' : 'none', transition: 'all 0.15s' }}>
                              <img src={bg.thumbnail} alt={bg.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                onError={(e) => { const fallback = Object.values(bg.images ?? {}).find(u => typeof u === 'string' && u.startsWith('http')); if (fallback && e.currentTarget.src !== fallback) e.currentTarget.src = fallback; }}
                              />
                              {selectedBgId === bg.id && (
                                <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'rgba(71,59,171,0.18)' }}>
                                  <CheckIcon sx={{ fontSize: 16, color: 'white', filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))' }} />
                                </Box>
                              )}
                            </Box>
                          </button>
                          <Typography sx={{ fontSize: '10px', color: 'text.secondary', textAlign: 'center', lineHeight: 1.3, fontWeight: 500 }}>{bg.name}</Typography>
                        </Box>
                      );
                    })}
                  </Box>
                </ProjectAccordionSection>
              </Box>

              {/* Theme & Logos */}
              <Box data-agent-section="theme">
                <ProjectAccordionSection
                  title="Theme & Logos"
                  count={activeBrandKits.length > 0 ? activeBrandKits.length : undefined}
                  statusSlot={activeBrandKits.length > 0 ? <ProjectStatusChip status="Done" /> : undefined}
                  onDetails={activeBrandKits.length > 0 ? () => setDetailPage("logos-backgrounds") : undefined}
                  expanded={expandedSections["theme"]}
                  onExpandedChange={(v) => toggleSection("theme", v)}
                  ownerSlot={<TaskOwner ownerId={taskOwners["brand"]} onChange={(id) => setTaskOwner("brand", id)} />}
                  emptyContent={<Box component="button" sx={actnBtnSx}><AddIcon sx={{ fontSize: 12 }} />Add Theme &amp; Logos</Box>}
                >
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {brandKits.map(k => {
                        const isActive = agentActivatedOems.some(oem => k.oem === oem || k.name === oem);
                        return (
                          <button key={k.id}
                            onClick={() => {
                              setAgentActivatedOems(prev => isActive ? prev.filter(o => o !== k.oem && o !== k.name) : [...prev, k.oem]);
                              if (!isActive) setActiveBrandKit(project.id, k.oem, k.id);
                            }}
                            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', borderRadius: 999, fontSize: 12, fontWeight: 500, border: `1px solid ${isActive ? 'rgba(99,86,225,0.3)' : 'rgba(0,0,0,0.12)'}`, backgroundColor: isActive ? 'rgba(99,86,225,0.08)' : 'white', color: isActive ? 'var(--brand-accent)' : 'var(--ink-secondary)', cursor: 'pointer', transition: 'all 0.15s' }}
                          >
                            <span style={{ width: 14, height: 14, borderRadius: 3, border: `1px solid ${isActive ? 'var(--brand-mid)' : 'rgba(0,0,0,0.3)'}`, backgroundColor: isActive ? 'var(--brand-mid)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s' }}>
                              {isActive && <svg width="9" height="9" viewBox="0 0 9 9" fill="none"><path d="M1.5 4.5L3.5 6.5L7.5 2.5" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                            </span>
                            {k.name}
                          </button>
                        );
                      })}
                    </Box>
                    {activeBrandKits.map(kit => (
                      <Box key={kit.id} sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Typography sx={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>{kit.name}</Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {kit.colors.map((color, i) => (
                              <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                <Box sx={{ width: 20, height: 20, borderRadius: '50%', border: '1px solid rgba(0,0,0,0.1)', flexShrink: 0, bgcolor: color }} />
                                <Typography sx={{ fontSize: '11px', color: 'text.secondary', fontFamily: 'monospace' }}>{color}</Typography>
                              </Box>
                            ))}
                          </Box>
                        </Box>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {kit.logos.map((logo) => (
                            <Box key={logo.id} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5, width: 88 }}>
                              <Box sx={{ width: 88, height: 66, borderRadius: 2, bgcolor: '#F4F5F6', border: '1px solid rgba(0,0,0,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 1 }}>
                                <img src={logo.image} alt={logo.label} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                              </Box>
                              <Typography sx={{ fontSize: '10px', color: 'text.secondary', textAlign: 'center', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{logo.label}</Typography>
                              <Typography sx={{ fontSize: '9px', color: 'var(--ink-tertiary)', textAlign: 'center' }}>{logo.sublabel}</Typography>
                            </Box>
                          ))}
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </ProjectAccordionSection>
              </Box>

              {/* Preview */}
              <ProjectAccordionSection
                title="Preview"
                count={visibleOffers.length > 0 && visibleTemplates.length > 0 ? visibleOffers.length * visibleTemplates.length : undefined}
                statusSlot={
                  visibleOffers.length > 0 && visibleTemplates.length > 0
                    ? <button onClick={() => setShowGenerateModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 999, fontSize: 11, fontWeight: 500, color: 'white', background: 'linear-gradient(99deg, var(--brand-accent) 0%, var(--brand-mid) 100%)', border: 'none', cursor: 'pointer' }}>
                        <AutoAwesomeIcon sx={{ fontSize: 11 }} /> Generate Assets
                      </button>
                    : undefined
                }
                expanded={expandedSections["preview"]}
                onExpandedChange={(v) => toggleSection("preview", v)}
                emptyContent={<Box component="button" sx={actnBtnSx}><VisibilityIcon sx={{ fontSize: 12 }} />Add Preview</Box>}
              >
                {visibleOffers.length > 0 && visibleTemplates.length > 0 && (() => {
                  const previewItems: LightboxItem[] = visibleTemplates.flatMap(template =>
                    visibleOffers.map(offer => ({
                      key: `${template.id}-${offer.id}`,
                      offer, template,
                      bgImage: getBgImage(selectedBg, template),
                      groundFraction: dealerCarPlacement(selectedBg as CustomBackground | null, template).ground,
                      carWidthFraction: dealerCarPlacement(selectedBg as CustomBackground | null, template).carWidth ?? (selectedBg as CustomBackground | null)?.carWidthFraction,
                      carAnchorX: dealerCarPlacement(selectedBg as CustomBackground | null, template).anchorX,
                      isGenerating: isDealerBgGenerating && !!(selectedBg as CustomBackground | null)?.images,
                      bgExactFormat: !!(selectedBg as CustomBackground | null)?.images?.[templateKey(template.width, template.height)],
                    }))
                  );
                  return (
                    <Box sx={{ display: 'flex', gap: 1.5, overflowX: 'auto', pb: 1 }}>
                      {previewItems.map((item, idx) => (
                        <Box key={item.key} sx={{ flexShrink: 0, position: 'relative' }}>
                          <JellyBeanCard
                            offer={item.offer as any} template={item.template} fixedHeight={160}
                            bgImage={item.bgImage} brandKit={brandKit}
                            groundFraction={item.groundFraction} carWidthFraction={item.carWidthFraction}
                            carAnchorX={item.carAnchorX} isGenerating={item.isGenerating}
                            bgExactFormat={item.bgExactFormat}
                            dealerName={project.dealerName} ctaText={project.ctaText}
                            leaseLabel={project.leaseLabel} finePrint={project.finePrint}
                          />
                          <IconButton size="small" onClick={() => setPreviewLightbox({ items: previewItems, index: idx })} sx={{ position: 'absolute', top: 6, right: 6, width: 28, height: 28, borderRadius: '50%', bgcolor: 'rgba(0,0,0,0.40)', color: 'white', '&:hover': { bgcolor: 'rgba(0,0,0,0.65)' } }} title="Full screen preview">
                            <VisibilityIcon sx={{ fontSize: 14 }} />
                          </IconButton>
                        </Box>
                      ))}
                    </Box>
                  );
                })()}
              </ProjectAccordionSection>

              {/* Assets */}
              <Box data-agent-section="assets">
                <ProjectAccordionSection
                  title="Assets"
                  count={generatedAssets.length > 0 ? generatedAssets.length : undefined}
                  expanded={expandedSections["assets"]}
                  onExpandedChange={(v) => toggleSection("assets", v)}
                  ownerSlot={<TaskOwner ownerId={taskOwners["assets"]} onChange={(id) => setTaskOwner("assets", id)} />}
                  emptyContent={
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'flex-start' }}>
                      <Box component="button" sx={actnBtnSx} onClick={() => visibleOffers.length > 0 && visibleTemplates.length > 0 ? setShowGenerateModal(true) : undefined}>
                        <AutoAwesomeIcon sx={{ fontSize: 12 }} />Add Assets
                      </Box>
                      <Typography sx={{ fontSize: '12px', color: 'text.secondary', lineHeight: 1.6 }}>Please click to Generate Assets in the Preview section.</Typography>
                    </Box>
                  }
                >
                  {generatedAssets.length > 0 && (() => {
                    const assetItems: LightboxItem[] = generatedAssets.map(({ key, offer, template, bgId }) => {
                      const bg = bgId ? (backgroundCollections.find(b => b.id === bgId) ?? customBackgroundLibrary.find(b => b.id === bgId) ?? null) : null;
                      return { key, offer, template, bgImage: getBgImage(bg, template), groundFraction: dealerCarPlacement(bg as CustomBackground | null, template).ground, carWidthFraction: dealerCarPlacement(bg as CustomBackground | null, template).carWidth ?? (bg as CustomBackground | null)?.carWidthFraction, carAnchorX: dealerCarPlacement(bg as CustomBackground | null, template).anchorX, isGenerating: isDealerBgGenerating && !!(bg as CustomBackground | null)?.images, bgExactFormat: !!(bg as CustomBackground | null)?.images?.[templateKey(template.width, template.height)] };
                    });
                    return (
                      <Box sx={{ display: 'flex', gap: 1.5, overflowX: 'auto', pb: 1 }}>
                        {assetItems.map((item, idx) => (
                          <Box key={item.key} sx={{ flexShrink: 0, position: 'relative' }}>
                            <JellyBeanCard
                              offer={item.offer as any} template={item.template} fixedHeight={160}
                              bgImage={item.bgImage} brandKit={brandKit}
                              groundFraction={item.groundFraction} carWidthFraction={item.carWidthFraction}
                              carAnchorX={item.carAnchorX} isGenerating={item.isGenerating}
                              bgExactFormat={item.bgExactFormat}
                              dealerName={project.dealerName} ctaText={project.ctaText}
                              leaseLabel={project.leaseLabel} finePrint={project.finePrint}
                            />
                            <IconButton size="small" onClick={() => setPreviewLightbox({ items: assetItems, index: idx })} sx={{ position: 'absolute', top: 6, right: 6, width: 28, height: 28, borderRadius: '50%', bgcolor: 'rgba(0,0,0,0.40)', color: 'white', '&:hover': { bgcolor: 'rgba(0,0,0,0.65)' } }}>
                              <VisibilityIcon sx={{ fontSize: 14 }} />
                            </IconButton>
                          </Box>
                        ))}
                      </Box>
                    );
                  })()}
                </ProjectAccordionSection>
              </Box>

              {/* Ad Shells */}
              <Box data-agent-section="adshells">
                <ProjectAccordionSection
                  title="Ad Shells"
                  count={generatedAssets.length > 0 ? generatedAssets.length : 0}
                  onDetails={() => setDetailPage("adshells")}
                  ownerSlot={<TaskOwner ownerId={taskOwners["adshells"]} onChange={(id) => setTaskOwner("adshells", id)} />}
                  expanded={expandedSections["adshells"]}
                  onExpandedChange={(v) => toggleSection("adshells", v)}
                  emptyContent={<Box component="button" sx={actnBtnSx}><AddIcon sx={{ fontSize: 12 }} />Create Ad Shells</Box>}
                />
              </Box>

              {/* Campaigns */}
              <ProjectAccordionSection
                title="Campaigns"
                count={0}
                onDetails={() => setDetailPage("campaigns")}
                ownerSlot={<TaskOwner ownerId={taskOwners["campaigns"]} onChange={(id) => setTaskOwner("campaigns", id)} />}
                expanded={expandedSections["campaigns"]}
                onExpandedChange={(v) => toggleSection("campaigns", v)}
                emptyContent={<Typography sx={{ fontSize: '12px', color: 'text.secondary', lineHeight: 1.6 }}>Please create Ad Shells first.</Typography>}
              />

            </Box>
          </Box>

          {/* Preview Lightbox */}
          {previewLightbox && createPortal(
            <PreviewLightbox
              items={previewLightbox.items}
              index={previewLightbox.index}
              onClose={() => setPreviewLightbox(null)}
              onNav={(i) => setPreviewLightbox(prev => prev ? { ...prev, index: i } : null)}
              brandKit={brandKit}
              dealerName={project.dealerName}
              ctaText={project.ctaText}
              leaseLabel={project.leaseLabel}
              finePrint={project.finePrint}
            />,
            document.body
          )}

          {/* Delete confirmation overlay */}
          {confirmDelete && (
            <Box sx={{ position: 'fixed', inset: 0, zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'rgba(0,0,0,0.30)', backdropFilter: 'blur(2px)' }} onClick={() => setConfirmDelete(null)}>
              <Box sx={{ bgcolor: 'background.paper', borderRadius: 4, boxShadow: 8, p: 3, width: 380, mx: 2 }} onClick={(e) => e.stopPropagation()}>
                <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                  <DeleteIcon sx={{ fontSize: 18, color: 'error.main' }} />
                </Box>
                <Typography sx={{ fontSize: '16px', fontWeight: 600, color: 'var(--ink)', mb: 0.75 }}>
                  Remove {confirmDelete.type === "offer" ? "Offer" : "Template"}
                </Typography>
                <Typography sx={{ fontSize: '13px', color: 'text.secondary', lineHeight: 1.6, mb: 3 }}>
                  Remove <Box component="span" sx={{ fontWeight: 500, color: 'var(--ink)' }}>{confirmDelete.label}</Box> from this project? This won't delete the {confirmDelete.type} permanently.
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                  <button onClick={() => setConfirmDelete(null)} style={{ padding: '8px 16px', borderRadius: 999, fontSize: 13, fontWeight: 500, color: 'var(--ink-secondary)', border: '1px solid #CAC9CF', background: 'white', cursor: 'pointer' }}>Cancel</button>
                  <button onClick={handleConfirmDelete} style={{ padding: '8px 16px', borderRadius: 999, fontSize: 13, fontWeight: 600, color: 'white', background: 'var(--danger)', border: 'none', cursor: 'pointer' }}>Remove</button>
                </Box>
              </Box>
            </Box>
          )}

          {/* Generate Assets modal */}
          {(() => {
            const bgCount   = visibleBackgrounds.length > 0 ? visibleBackgrounds.length : 1;
            const genTotal  = visibleOffers.length * visibleTemplates.length * bgCount;
            const genBreakdown = visibleBackgrounds.length > 0
              ? `${visibleBackgrounds.length} background${visibleBackgrounds.length > 1 ? "s" : ""} × ${visibleOffers.length} offer${visibleOffers.length > 1 ? "s" : ""} × ${visibleTemplates.length} template${visibleTemplates.length > 1 ? "s" : ""}`
              : `${visibleOffers.length} offer${visibleOffers.length > 1 ? "s" : ""} × ${visibleTemplates.length} template${visibleTemplates.length > 1 ? "s" : ""}`;

            const handleGenerate = () => {
              const allBgs = [...visibleBackgrounds, ...customBackgroundLibrary.filter(cb => !removedBgIds.has(cb.id) && !visibleBackgrounds.some(vb => vb.id === cb.id))];
              const bgsToUse = allBgs.length > 0 ? allBgs.map(b => b.id) : [null as null];
              const assets: GeneratedAsset[] = [];
              bgsToUse.forEach(bgId => {
                visibleTemplates.forEach(template => {
                  visibleOffers.forEach(offer => {
                    assets.push({ key: `${bgId ?? "none"}-${template.id}-${offer.id}`, offer, template, bgId });
                  });
                });
              });
              setGeneratedAssets(assets);
              setExpandedSections(prev => ({ ...prev, assets: true }));
              setShowGenerateModal(false);
              emitSnackbar(`${genTotal} asset${genTotal > 1 ? "s" : ""} created`);
              window.dispatchEvent(new CustomEvent("project-status-change", { detail: { projectId: project.id, status: "Assets Created" } }));
              window.dispatchEvent(new CustomEvent(AGENT_ASSETS_GENERATED_EVENT, { detail: { total: assets.length } }));
            };

            return showGenerateModal ? (
              <Box sx={{ position: 'fixed', inset: 0, zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'rgba(0,0,0,0.30)', backdropFilter: 'blur(2px)' }} onClick={() => setShowGenerateModal(false)}>
                <Box sx={{ bgcolor: 'background.paper', borderRadius: 4, boxShadow: 8, p: 3, width: 400, mx: 2 }} onClick={(e) => e.stopPropagation()}>
                  <Box sx={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #EDE9FF 0%, #D8D2FF 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                    <AutoAwesomeIcon sx={{ fontSize: 18, color: 'var(--brand-accent)' }} />
                  </Box>
                  <Typography sx={{ fontSize: '16px', fontWeight: 600, color: 'var(--ink)', mb: 0.75 }}>Generate Assets</Typography>
                  <Typography sx={{ fontSize: '13px', color: 'text.secondary', lineHeight: 1.6, mb: 1 }}>
                    You're about to generate <Box component="span" sx={{ fontWeight: 600, color: 'var(--ink)' }}>{genTotal} asset{genTotal > 1 ? "s" : ""}</Box> ({genBreakdown}).
                  </Typography>
                  <Typography sx={{ fontSize: '13px', color: 'text.secondary', lineHeight: 1.6, mb: 3 }}>
                    Total: <Box component="span" sx={{ fontWeight: 600, color: 'var(--ink)' }}>{genTotal}</Box>
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                    <button onClick={() => setShowGenerateModal(false)} style={{ padding: '8px 16px', borderRadius: 999, fontSize: 13, fontWeight: 500, color: 'var(--ink-secondary)', border: '1px solid #CAC9CF', background: 'white', cursor: 'pointer' }}>Cancel</button>
                    <button onClick={handleGenerate} style={{ padding: '8px 16px', borderRadius: 999, fontSize: 13, fontWeight: 600, color: 'white', background: 'linear-gradient(99deg, var(--brand-accent) 0%, var(--brand-mid) 100%)', border: 'none', cursor: 'pointer' }}>Generate {genTotal} Asset{genTotal > 1 ? "s" : ""}</button>
                  </Box>
                </Box>
              </Box>
            ) : null;
          })()}

          {/* Edit Background modal */}
          {editingBg && (
            <EditBackgroundModal
              background={editingBg}
              accountName={accountName}
              onSave={(newBg) => {
                const base = newBg.name.replace(/ edited(\s*\(\d+\))?$/i, "").trim();
                const targetBase = `${base} edited`;
                const existingNames = new Set([...visibleBackgrounds.map(b => b.name), ...customBackgroundLibrary.map(b => b.name)]);
                let finalName = targetBase;
                if (existingNames.has(targetBase)) {
                  let n = 2;
                  while (existingNames.has(`${targetBase} (${n})`)) n++;
                  finalName = `${targetBase} (${n})`;
                }
                const named = { ...newBg, name: finalName } as CustomBackground;
                setCustomBackgroundLibrary(prev => {
                  const next = [...prev.filter(b => b.id !== editingBg.id), named];
                  saveCustomBackgroundLibrary(project.id, next);
                  return next;
                });
                setSelectedBgId(named.id);
                setEditingBg(null);
                emitSnackbar("Background updated");
              }}
              onClose={() => setEditingBg(null)}
            />
          )}

          {/* Edit Project dialog */}
          <CreateProjectDialog
            open={showEditProject}
            onOpenChange={setShowEditProject}
            mode="edit"
            initialData={{
              name: project.name,
              account: project.dealerName,
              ownerId: PROJECT_OWNERS.find(o => o.name === project.assignee?.name)?.id ?? "jorge-verlindo",
              startDate: project.dateRange ? (() => { try { return new Date(project.dateRange.split(" - ")[0]); } catch { return undefined; } })() : undefined,
              endDate: project.dateRange ? (() => { try { return new Date(project.dateRange.split(" - ")[1]); } catch { return undefined; } })() : undefined,
              platforms: (project as any).platforms ?? [],
              tags: (project as any).tags ?? [],
            }}
            brandOptions={brandKits.map(k => ({ id: k.id, name: k.name }))}
            existingNames={[]}
            onSave={(data) => {
              const fmt = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
              const ownerObj = PROJECT_OWNERS.find(o => o.id === data.ownerId);
              onUpdateProject?.(project.id, {
                name: data.name, dealerName: data.account,
                dateRange: `${fmt(data.startDate)} - ${fmt(data.endDate)}`,
                platforms: data.platforms, tags: data.tags,
                assignee: { name: ownerObj?.name ?? project.assignee?.name ?? "", avatar: project.assignee?.avatar ?? "" },
              });
              setShowEditProject(false);
              emitSnackbar("Project updated");
            }}
          />

          {/* Detail page slide-over */}
          {detailPage && (
            <Box sx={{ position: 'absolute', inset: 0, zIndex: 200, bgcolor: 'background.paper', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <Box sx={{ px: 2.5, pt: 1.75, pb: 0, flexShrink: 0, bgcolor: 'background.paper' }}>
                <BreadcrumbBar
                  items={[{ label: "Projects", onClick: onBack }, { label: project.name, onClick: () => setDetailPage(null) }]}
                  activeLabel={
                    detailPage === "logos-backgrounds" ? "Styles & Backgrounds" :
                    detailPage === "adshells" ? "Ad Shells" :
                    detailPage === "offers" ? "Offers" :
                    detailPage === "templates" ? "Templates" :
                    detailPage === "preview" ? "Preview" :
                    detailPage === "campaigns" ? "Campaigns" :
                    detailPage.replace(/-/g, " ")
                  }
                />
              </Box>
              <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
                {detailPage === "offers" && <OffersPage projectId={project.id} onNavigateTo={setDetailPage} />}
                {detailPage === "templates" && <TemplatesPage projectId={project.id} onNavigateTo={setDetailPage} />}
                {detailPage === "logos-backgrounds" && <LogosBackgroundsPage projectId={project.id} onNavigateTo={setDetailPage} />}
                {detailPage === "preview" && <PreviewPage projectId={project.id} onNavigateTo={setDetailPage} />}
                {detailPage === "adshells" && (
                  <AdShellsPage
                    projectId={project.id}
                    projectName={project.name}
                    generatedAssets={generatedAssets as any}
                    onNavigateTo={setDetailPage}
                  />
                )}
                {detailPage === "campaigns" && (
                  <CampaignsPage
                    projectId={project.id}
                    projectName={project.name}
                    onNavigateTo={setDetailPage}
                  />
                )}
              </Box>
            </Box>
          )}

        </Box>
      </Box>
    </Box>
  );
}

// ─── TagChipInput ─────────────────────────────────────────────────────────────
function TagChipInput({ tags, onTagsChange }: { tags: string[]; onTagsChange: (t: string[]) => void }) {
  const [inputVal, setInputVal] = useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  const addTag = (raw: string) => {
    const val = raw.trim().replace(/,$/, "").trim();
    if (val && !tags.includes(val)) onTagsChange([...tags, val]);
    setInputVal("");
  };
  const removeTag = (i: number) => onTagsChange(tags.filter((_, idx) => idx !== i));

  return (
    <Box
      sx={{ minHeight: 40, width: '100%', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 0.5, border: '1px solid #CAC9CF', borderRadius: '4px', px: 1, py: 0.75, bgcolor: 'surface.inputBackground', cursor: 'text', '&:hover': { borderColor: '#B0B0B5' }, '&:focus-within': { borderColor: 'var(--brand-accent)', boxShadow: '0 0 0 1px var(--brand-accent)' }, transition: 'all 0.15s' }}
      onClick={() => inputRef.current?.focus()}
    >
      {tags.map((tag, i) => (
        <Box key={tag} component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, bgcolor: '#F3F4F6', color: 'text.secondary', fontSize: '11px', letterSpacing: '0.4px', px: 1, py: 0.25, borderRadius: '8px', userSelect: 'none' }}>
          {tag}
          <button type="button" onClick={(e) => { e.stopPropagation(); removeTag(i); }} style={{ color: 'var(--ink-tertiary)', border: 'none', background: 'none', cursor: 'pointer', lineHeight: 1, padding: 0, marginRight: -2 }}>×</button>
        </Box>
      ))}
      <input
        ref={inputRef}
        type="text"
        value={inputVal}
        placeholder={tags.length === 0 ? "Tags" : ""}
        onChange={(e) => { const v = e.target.value; if (v.endsWith(",")) { addTag(v); return; } setInputVal(v); }}
        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(inputVal); } if (e.key === "Backspace" && !inputVal && tags.length) removeTag(tags.length - 1); }}
        style={{ flex: 1, minWidth: 60, background: 'transparent', fontSize: 13, color: 'var(--ink)', border: 'none', outline: 'none', lineHeight: '1.2' }}
      />
    </Box>
  );
}

// ─── NewProjectForm ───────────────────────────────────────────────────────────
type NewProjectErrors = Partial<Record<"name" | "startDate" | "endDate", string>>;

function NewProjectForm({ onClose, onSave }: { onClose: () => void; onSave: (p: LocalProject) => void }) {
  const [name, setName]           = useState("");
  const [account, setAccount]     = useState("");
  const [brand, setBrand]         = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate]     = useState<Date | undefined>(undefined);
  const [tags, setTags]           = useState<string[]>([]);
  const [status, setStatus]       = useState<ProjectStatus>("In Progress");
  const [errors, setErrors]       = useState<NewProjectErrors>({});
  const [accountAnchor, setAccountAnchor] = useState<HTMLElement | null>(null);
  const [brandAnchor, setBrandAnchor] = useState<HTMLElement | null>(null);
  const [statusAnchor, setStatusAnchor] = useState<HTMLElement | null>(null);

  const validate = (): NewProjectErrors => {
    const e: NewProjectErrors = {};
    if (!name.trim())  e.name      = "Project name is required";
    if (!startDate)    e.startDate = "Start date is required";
    if (!endDate)      e.endDate   = "End date is required";
    if (startDate && endDate && endDate < startDate) e.endDate = "End date must be after start date";
    return e;
  };

  const handleSave = () => {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;
    const id   = `project-${Date.now()}`;
    const kit  = brandKits.find((k) => k.name === brand);
    const abbr = (account || "GEN").slice(0, 6).toUpperCase().replace(/\s/g, "");
    const mon  = new Date().toLocaleDateString("en-US", { month: "short", year: "2-digit" }).replace(" ", "");
    const code = `WF${String(Math.floor(Math.random() * 90000 + 10000))}_${abbr}_${name.replace(/\s+/g, "")}_${mon}`;
    const fmt  = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    onSave({
      id, dealerName: account || "My Account", name, code, status,
      dateRange: `${fmt(startDate!)} - ${fmt(endDate!)}`,
      assignee: { name: CURRENT_USER.name, avatar: "" },
      oem: kit?.oem ?? account ?? "General",
      templateIds: [], offerIds: [], tags,
      createdAt: fmt(new Date()),
    } as unknown as LocalProject);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: 'background.paper', overflowY: 'auto' }}>
      <Box sx={{ px: 3, pt: 2.5, pb: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* Row 1 */}
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, flex: 3 }}>
            <input
              type="text" autoFocus placeholder="Project Name" value={name}
              onChange={(e) => { setName(e.target.value); if (errors.name) setErrors(p => ({ ...p, name: undefined })); }}
              style={{ height: 40, width: '100%', borderRadius: 4, border: errors.name ? '1px solid var(--danger)' : '1px solid #CAC9CF', padding: '0 12px', fontSize: 13, color: 'var(--ink)', background: '#F9FAFA', outline: 'none' }}
            />
            {errors.name && <p style={{ fontSize: 11, color: 'var(--danger)', margin: 0 }}>{errors.name}</p>}
          </Box>

          <Box sx={{ flex: 2, minWidth: 0 }}>
            <button onClick={(e) => setAccountAnchor(e.currentTarget)} style={{ height: 40, width: '100%', display: 'flex', alignItems: 'center', gap: 8, border: '1px solid #CAC9CF', borderRadius: 4, padding: '0 12px', fontSize: 13, backgroundColor: '#F9FAFA', cursor: 'pointer', textAlign: 'left' }}>
              <span style={{ flex: 1, color: account ? 'var(--ink)' : 'rgba(17,16,20,0.4)' }}>{account || "Account"}</span>
              <ExpandMoreIcon sx={{ fontSize: 13, color: 'rgba(17,16,20,0.4)', flexShrink: 0 }} />
            </button>
            <Menu anchorEl={accountAnchor} open={!!accountAnchor} onClose={() => setAccountAnchor(null)}>
              {ACCOUNTS.map((a) => (
                <MenuItem key={a} onClick={() => { setAccount(a); setAccountAnchor(null); }} sx={{ fontSize: 13 }}>
                  <Box sx={{ flex: 1 }}>{a}</Box>
                  {account === a && <CheckIcon sx={{ fontSize: 13, color: 'var(--brand-accent)' }} />}
                </MenuItem>
              ))}
            </Menu>
          </Box>

          <Box sx={{ flex: 2, minWidth: 0 }}>
            <button onClick={(e) => setBrandAnchor(e.currentTarget)} style={{ height: 40, width: '100%', display: 'flex', alignItems: 'center', gap: 8, border: '1px solid #CAC9CF', borderRadius: 4, padding: '0 12px', fontSize: 13, backgroundColor: '#F9FAFA', cursor: 'pointer', textAlign: 'left' }}>
              <span style={{ flex: 1, color: brand ? 'var(--ink)' : 'rgba(17,16,20,0.4)' }}>{brand || "Brand"}</span>
              <ExpandMoreIcon sx={{ fontSize: 13, color: 'rgba(17,16,20,0.4)', flexShrink: 0 }} />
            </button>
            <Menu anchorEl={brandAnchor} open={!!brandAnchor} onClose={() => setBrandAnchor(null)}>
              {brandKits.map((k) => (
                <MenuItem key={k.id} onClick={() => { setBrand(k.name); setBrandAnchor(null); }} sx={{ fontSize: 13 }}>
                  <Box sx={{ flex: 1 }}>{k.name}</Box>
                  {brand === k.name && <CheckIcon sx={{ fontSize: 13, color: 'var(--brand-accent)' }} />}
                </MenuItem>
              ))}
            </Menu>
          </Box>

          <Box sx={{ flex: 2, minWidth: 0 }}>
            <Box sx={{ position: 'relative', height: 40, display: 'flex', alignItems: 'center', border: '1px solid #CAC9CF', borderRadius: '4px', bgcolor: 'surface.inputBackground', px: 1.5, gap: 1 }}>
              <Box component="span" sx={{ position: 'absolute', top: -9, left: 8, px: 0.5, bgcolor: 'white', fontSize: '10px', color: 'text.secondary', lineHeight: 1, userSelect: 'none' }}>Owner</Box>
              <Box sx={{ width: 18, height: 18, borderRadius: '50%', bgcolor: '#CAC9CF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: 8, color: 'white', fontWeight: 700, lineHeight: 1 }}>{CURRENT_USER.initials}</span>
              </Box>
              <Typography sx={{ fontSize: '13px', color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{CURRENT_USER.email}</Typography>
              <ExpandMoreIcon sx={{ fontSize: 13, color: 'rgba(17,16,20,0.4)', flexShrink: 0 }} />
            </Box>
          </Box>
        </Box>

        {/* Row 2 */}
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
          <Box sx={{ height: 40, display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            <button onClick={(e) => setStatusAnchor(e.currentTarget)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
              <ProjectStatusChip status={status} />
            </button>
            <Menu anchorEl={statusAnchor} open={!!statusAnchor} onClose={() => setStatusAnchor(null)}>
              {PROJECT_STATUSES.map((s) => (
                <MenuItem key={s} onClick={() => { setStatus(s); setStatusAnchor(null); }} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ProjectStatusChip status={s} />
                  {status === s && <CheckIcon sx={{ fontSize: 13, ml: 'auto', color: 'var(--brand-accent)' }} />}
                </MenuItem>
              ))}
            </Menu>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, flex: 1, minWidth: 140 }}>
            <input type="date" value={startDate ? startDate.toISOString().substring(0, 10) : ''}
              onChange={(e) => { setStartDate(e.target.value ? new Date(e.target.value) : undefined); if (errors.startDate) setErrors(p => ({ ...p, startDate: undefined })); }}
              style={{ height: 40, width: '100%', borderRadius: 4, border: errors.startDate ? '1px solid var(--danger)' : '1px solid #CAC9CF', padding: '0 12px', fontSize: 13, color: 'var(--ink)', background: '#F9FAFA', outline: 'none' }} />
            {errors.startDate && <p style={{ fontSize: 11, color: 'var(--danger)', margin: 0 }}>{errors.startDate}</p>}
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, flex: 1, minWidth: 140 }}>
            <input type="date" value={endDate ? endDate.toISOString().substring(0, 10) : ''}
              onChange={(e) => { setEndDate(e.target.value ? new Date(e.target.value) : undefined); if (errors.endDate) setErrors(p => ({ ...p, endDate: undefined })); }}
              style={{ height: 40, width: '100%', borderRadius: 4, border: errors.endDate ? '1px solid var(--danger)' : '1px solid #CAC9CF', padding: '0 12px', fontSize: 13, color: 'var(--ink)', background: '#F9FAFA', outline: 'none' }} />
            {errors.endDate && <p style={{ fontSize: 11, color: 'var(--danger)', margin: 0 }}>{errors.endDate}</p>}
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <TagChipInput tags={tags} onTagsChange={setTags} />
          </Box>
        </Box>

        {/* Row 3: Metadata */}
        <Typography sx={{ fontSize: '11px', color: 'var(--ink-tertiary)', lineHeight: 1.6 }}>
          <Box component="span" sx={{ fontWeight: 500, color: 'text.secondary' }}>Last Updated:</Box> just now
          <Box component="span" sx={{ mx: 1.5, color: '#E0E0E0' }}>|</Box>
          <Box component="span" sx={{ fontWeight: 500, color: 'text.secondary' }}>Created:</Box> just now
          <Box component="span" sx={{ mx: 1.5, color: '#E0E0E0' }}>|</Box>
          <Box component="span" sx={{ fontWeight: 500, color: 'text.secondary' }}>Creator:</Box> {CURRENT_USER.name}
        </Typography>

        {/* Row 4: Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pt: 0.5 }}>
          <button onClick={onClose} style={{ padding: '8px 16px', borderRadius: 999, fontSize: '0.875rem', fontWeight: 500, color: 'var(--ink-secondary)', border: '1px solid #CAC9CF', background: 'white', cursor: 'pointer' }}>Cancel</button>
          <button onClick={handleSave} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 999, fontSize: '0.875rem', fontWeight: 600, color: 'white', background: 'var(--brand-accent)', border: 'none', cursor: 'pointer' }}>
            <CheckIcon sx={{ fontSize: 14 }} /> Save
          </button>
        </Box>
      </Box>
    </Box>
  );
}

// ─── PAGE_NAV ─────────────────────────────────────────────────────────────────
const PAGE_NAV: {
  id: ProjectPage;
  label: string;
  Icon: React.ComponentType<IconProps>;
}[] = [
  { id: "offers",            label: "Offers",    Icon: LCOffers },
  { id: "templates",         label: "Templates", Icon: LCTemplates },
  { id: "logos-backgrounds", label: "Styles",    Icon: LCStyles },
  { id: "preview",           label: "Preview",   Icon: LCPreview },
];

// ─── Main module export ────────────────────────────────────────────────────────
export function ProjectsModule({ openProjectId, onProjectChange }: { openProjectId?: string | null; onProjectChange?: (id: string | null, name: string) => void }) {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(openProjectId ?? null);
  const prevOpenRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    if (openProjectId && openProjectId !== prevOpenRef.current) {
      setSelectedProjectId(openProjectId);
    }
    prevOpenRef.current = openProjectId;
  }, [openProjectId]);

  return (
    <ProjectStoreProvider>
      <RightPanelProvider>
        <SidebarProvider>
          <ProjectsModuleInner
            selectedProjectId={selectedProjectId}
            onSelectProject={setSelectedProjectId}
            onProjectChange={onProjectChange}
          />
        </SidebarProvider>
      </RightPanelProvider>
    </ProjectStoreProvider>
  );
}

// ─── Inner component ──────────────────────────────────────────────────────────
function ProjectsModuleInner({
  selectedProjectId, onSelectProject, onProjectChange,
}: {
  selectedProjectId: string | null;
  onSelectProject: (id: string | null) => void;
  onProjectChange?: (id: string | null, name: string) => void;
}) {
  const [currentPage, setCurrentPage] = useState<ProjectPage>("offers");

  const [localProjects, setLocalProjects] = useState<LocalProject[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.LOCAL_PROJECTS);
      if (!raw) return [];
      return JSON.parse(raw) as LocalProject[];
    } catch { return []; }
  });

  const [statusOverrides, setStatusOverrides] = useState<Record<string, ProjectStatus>>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.STATUS_OVERRIDES);
      return raw ? JSON.parse(raw) : {};
    } catch { return {}; }
  });

  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());

  const allProjects = useMemo(() => {
    const localIds = new Set(localProjects.map(p => p.id));
    return [
      ...(projects as LocalProject[]).filter(p => !localIds.has(p.id) && !deletedIds.has(p.id)),
      ...localProjects.filter(p => !deletedIds.has(p.id)).map(p => {
        const staticBase = (projects as LocalProject[]).find(s => s.id === p.id);
        if (!staticBase) return p;
        const existing = new Set(p.templateIds ?? []);
        const merged = [...(p.templateIds ?? []), ...(staticBase.templateIds ?? []).filter(id => !existing.has(id))];
        return { ...p, templateIds: merged };
      }),
    ].map(p => ({ ...p, status: (statusOverrides[p.id] ?? p.status) as ProjectStatus }));
  }, [localProjects, statusOverrides, deletedIds]);

  useEffect(() => {
    if (!onProjectChange) return;
    if (selectedProjectId) {
      const proj = allProjects.find(p => p.id === selectedProjectId);
      onProjectChange(selectedProjectId, proj?.name ?? proj?.dealerName ?? "Project");
    } else {
      onProjectChange(null, "");
    }
  }, [selectedProjectId, allProjects, onProjectChange]);

  const moveProject = (projectId: string, newStatus: ProjectStatus) => {
    if (localProjects.find((p) => p.id === projectId)) {
      setLocalProjects((prev) => prev.map((p) => (p.id === projectId ? { ...p, status: newStatus } : p)));
      setStatusOverrides((prev) => {
        if (!(projectId in prev)) return prev;
        const { [projectId]: _removed, ...rest } = prev;
        return rest;
      });
    } else {
      setStatusOverrides((prev) => ({ ...prev, [projectId]: newStatus }));
    }
  };

  const deleteProject = (projectId: string) => {
    if (localProjects.find((p) => p.id === projectId)) {
      setLocalProjects((prev) => prev.filter((p) => p.id !== projectId));
    } else {
      setDeletedIds((prev) => new Set([...prev, projectId]));
    }
    if (selectedProjectId === projectId) onSelectProject(null);
  };

  const updateProject = (id: string, patches: Partial<LocalProject>) => {
    if (localProjects.find(p => p.id === id)) {
      setLocalProjects(prev => prev.map(p => p.id === id ? { ...p, ...patches } : p));
    } else {
      const base = allProjects.find(p => p.id === id);
      if (!base) return;
      setLocalProjects(prev => [...prev, { ...base, ...patches }]);
    }
  };

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEYS.LOCAL_PROJECTS, JSON.stringify(localProjects)); }
    catch (e) { console.error('[ProjectsModule] failed to persist projects (quota?):', e); }
  }, [localProjects]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEYS.STATUS_OVERRIDES, JSON.stringify(statusOverrides)); }
    catch (e) { console.error('[ProjectsModule] failed to persist status overrides:', e); }
  }, [statusOverrides]);

  useEffect(() => {
    const handler = (e: Event) => {
      const { projectId, status } = (e as CustomEvent<{ projectId: string; status: ProjectStatus }>).detail;
      moveProject(projectId, status);
    };
    window.addEventListener("project-status-change", handler);
    return () => window.removeEventListener("project-status-change", handler);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<AgentActionPayload>).detail;
      if (detail.action !== "set_brand") return;
      const { oem } = detail;
      if (!selectedProjectId) return;
      setLocalProjects(prev => prev.map(p => p.id === selectedProjectId ? { ...p, oem: oem as string } : p));
    };
    window.addEventListener(PROJECT_AGENT_ACTION_EVENT, handler);
    return () => window.removeEventListener(PROJECT_AGENT_ACTION_EVENT, handler);
  }, [selectedProjectId]);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<AgentActionPayload>).detail;
      if (detail.action !== "create_project") return;
      const { name, account, oem, startDate, endDate } = detail;
      const id = `project-${Date.now()}`;
      const abbr = ((account || oem || "GEN") as string).slice(0, 6).toUpperCase().replace(/\s/g, "");
      const mon  = new Date().toLocaleDateString("en-US", { month: "short", year: "2-digit" }).replace(" ", "");
      const code = `WF${String(Math.floor(Math.random() * 90000 + 10000))}_${abbr}_${(name as string).replace(/\s+/g, "")}_${mon}`;
      const newProject: LocalProject = {
        id,
        dealerName:  (account as string) || "My Account",
        ctaText:     "Shop Now",
        leaseLabel:  "",
        finePrint:   "",
        name:        name as string,
        code,
        status:      "In Progress" as ProjectStatus,
        dateRange:   startDate && endDate ? `${startDate} - ${endDate}` : "",
        assignee:    { name: (detail as any).owner || "Jorge Verlindo", avatar: "" },
        oem:         (oem as string) || (account as string) || "General",
        templateIds: [],
        offerIds:    [],
        tags:        [],
        owner:       (detail as any).owner || "Jorge Verlindo",
        platforms:   (detail as any).platforms || [],
        createdAt:   new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      };
      setLocalProjects((prev) => [...prev, newProject]);
      onSelectProject(id);
    };
    window.addEventListener(PROJECT_AGENT_ACTION_EVENT, handler);
    return () => window.removeEventListener(PROJECT_AGENT_ACTION_EVENT, handler);
  }, [onSelectProject]);

  // Dispatch global context when list view is shown (no project open)
  useEffect(() => {
    if (selectedProjectId) return;
    const payload: ProjectContextPayload = {
      projectId:          "",
      projectName:        "(no project open)",
      oem:                "",
      currentOfferIds:    [],
      currentTemplateIds: [],
      availableOffers:    offerLibrary.map((o) => ({
        id: o.id, year: o.year, make: o.make, model: o.model, trim: o.trim,
        offerType: o.offerType, monthlyPayment: o.monthlyPayment,
        term: o.term, pvi: o.pvi, aging: o.aging, stock: o.stock,
      })),
      availableTemplates: templateLibrary.map((t) => ({
        id: t.id, name: t.name, format: t.format,
        width: t.width, height: t.height, brand: t.brand,
      })),
    };
    setTimeout(() => window.dispatchEvent(new CustomEvent(PROJECT_CONTEXT_EVENT, { detail: payload })), 0);
  }, [selectedProjectId]);

  if (!selectedProjectId) {
    return (
      <ProjectsListView
        allProjects={allProjects}
        localProjectIds={new Set(localProjects.map(p => p.id))}
        onAddProject={(proj) => setLocalProjects((prev) => [...prev, proj])}
        onSelectProject={(id) => { onSelectProject(id); setCurrentPage("offers"); }}
        onMoveProject={moveProject}
        onDeleteProject={deleteProject}
      />
    );
  }

  const selectedProject = allProjects.find((p) => p.id === selectedProjectId);
  if (!selectedProject) {
    return (
      <ProjectsListView
        allProjects={allProjects}
        localProjectIds={new Set(localProjects.map(p => p.id))}
        onAddProject={(proj) => setLocalProjects((prev) => [...prev, proj])}
        onSelectProject={(id) => { onSelectProject(id); setCurrentPage("offers"); }}
        onMoveProject={moveProject}
        onDeleteProject={deleteProject}
      />
    );
  }

  return (
    <ProjectDetailView
      key={selectedProject.id}
      project={selectedProject}
      onBack={() => onSelectProject(null)}
      onDelete={() => { deleteProject(selectedProject.id); onSelectProject(null); }}
      onUpdateProject={updateProject}
    />
  );
}
