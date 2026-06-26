"use client";

import React, { useState } from "react";
import Dialog from "@mui/material/Dialog";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import InputBase from "@mui/material/InputBase";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";

import { TemplateCard } from "../templates/TemplateCard";
import { BackgroundCollectionCard } from "../logos-backgrounds/BackgroundCollectionCard";
import { OfferCard } from "../offers/OfferCard";
import { AssetCard } from "./AssetCard";
import { CardViewVertical } from "./CardViewVertical";
import { TemplateWireframe } from "../templates/TemplateWireframe";
import { StatusChip } from "../../StatusChip";
import { templates, backgroundCollections, offerLibrary } from "../lib/mock-data";

// ── Icons (inline SVG — Lucide equivalents) ───────────────────────────────────

function SearchIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  );
}
function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  );
}
function ChevronRightIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  );
}
function ChevronDownIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  );
}
function LayersIcon() { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>; }
function LayoutGridIcon() { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>; }
function BoxIcon({ size = 13 }: { size?: number }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>; }
function PuzzleIcon() { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 11V9a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v2"/><path d="M5 11V9a2 2 0 0 1 2-2"/><path d="M19 13v2a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2v-2"/><path d="M5 13v2a2 2 0 0 0 2 2"/><path d="M9 11h6"/><path d="M12 8v6"/></svg>; }
function ImageIcon() { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>; }
function TagIcon() { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>; }
function FileTextIcon() { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>; }
function PanelLeftIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/></svg>; }
function MoreHorizontalIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>; }

// ─── Data ─────────────────────────────────────────────────────────────────────

interface ComponentEntry {
  name: string;
  description: string;
  path: string;
  tags: string[];
  isBase?: boolean;
}

interface ComponentCategory {
  id: string;
  label: string;
  icon: React.ReactNode;
  components: ComponentEntry[];
}

const CATEGORIES: ComponentCategory[] = [
  {
    id: "ui",
    label: "UI — Design System",
    icon: <LayersIcon />,
    components: [
      { name: "AssetCard", description: "Standard card shell. Square thumbnail with gray background, checkbox and menu overlay, text area below. Accepts preview and footer as render slots.", path: "components/ui/AssetCard.tsx", tags: ["base", "card", "slot"], isBase: true },
      { name: "CardViewVertical", description: "Standard responsive grid. Cards inside resize fluidly between 240–300 px via auto-fill.", path: "components/ui/CardViewVertical.tsx", tags: ["grid", "layout", "responsive"], isBase: true },
      { name: "Button", description: "Base button — MUI.", path: "components/ui/button.tsx", tags: ["mui", "primitive"] },
      { name: "Badge", description: "Base badge/chip — MUI Chip.", path: "components/ui/badge.tsx", tags: ["mui", "primitive"] },
      { name: "Checkbox", description: "Base checkbox — MUI.", path: "components/ui/checkbox.tsx", tags: ["mui", "primitive"] },
      { name: "Dialog", description: "Base dialog — MUI.", path: "components/ui/dialog.tsx", tags: ["mui", "primitive"] },
      { name: "ScrollArea", description: "Custom scroll area — MUI Box.", path: "components/ui/scroll-area.tsx", tags: ["mui", "primitive"] },
      { name: "Select", description: "Base select — MUI.", path: "components/ui/select.tsx", tags: ["mui", "primitive"] },
      { name: "Separator", description: "Horizontal or vertical visual separator — MUI Divider.", path: "components/ui/separator.tsx", tags: ["mui", "primitive"] },
    ],
  },
  {
    id: "cards",
    label: "Cards",
    icon: <BoxIcon />,
    components: [
      { name: "TemplateCard", description: "Template card. Displays a scaled wireframe in the thumbnail, name, format, dimensions and brand chip. Hover reveals the 'Edit zones' button.", path: "components/templates/TemplateCard.tsx", tags: ["card", "template", "AssetCard"] },
      { name: "BackgroundCollectionCard", description: "Background/lifestyle card. Image in object-contain, name, dimensions, tag chips and folder path.", path: "components/logos-backgrounds/BackgroundCollectionCard.tsx", tags: ["card", "background", "AssetCard"] },
      { name: "OfferCard", description: "Offer card with vehicle metrics, offer type and financial details.", path: "components/offers/OfferCard.tsx", tags: ["card", "offer"] },
    ],
  },
  {
    id: "layout",
    label: "Layout",
    icon: <LayoutGridIcon />,
    components: [
      { name: "ProjectContentLayout", description: "Main layout for project pages. Manages the sidebar, main content area and right panel.", path: "components/layout/ProjectContentLayout.tsx", tags: ["layout", "shell"] },
      { name: "TopBar", description: "Global top navigation bar: logo, search, action icons and user avatar.", path: "components/layout/TopBar.tsx", tags: ["layout", "nav"] },
      { name: "GlobalNav", description: "Global side navigation.", path: "components/layout/GlobalNav.tsx", tags: ["layout", "nav"] },
      { name: "PageMeta", description: "Breadcrumbs and metadata for the current page.", path: "components/layout/PageMeta.tsx", tags: ["layout", "breadcrumb"] },
      { name: "SidebarToggleButton", description: "Button to open/close the sidebar.", path: "components/layout/SidebarToggleButton.tsx", tags: ["layout", "sidebar"] },
      { name: "StatusChip", description: "Status chip — e.g. Draft, Active, Published.", path: "components/layout/StatusChip.tsx", tags: ["layout", "chip", "status"] },
      { name: "TasksSidebar", description: "Project tasks sidebar.", path: "components/layout/TasksSidebar.tsx", tags: ["layout", "sidebar"] },
    ],
  },
  {
    id: "templates",
    label: "Templates",
    icon: <FileTextIcon />,
    components: [
      { name: "TemplateWireframe", description: "Renders a template's visual wireframe at a given scale. Accepts templateId and scale.", path: "components/templates/TemplateWireframe.tsx", tags: ["template", "wireframe", "preview"] },
      { name: "TemplateZoneEditor", description: "Template zone editor. Opens as a modal overlay on the page.", path: "components/templates/TemplateZoneEditor.tsx", tags: ["template", "editor", "modal"] },
      { name: "VariableMappingPane", description: "Right-panel variable mapper between single, multi and keyMessage templates.", path: "components/templates/VariableMappingPane.tsx", tags: ["template", "panel", "variables"] },
      { name: "AdTemplate", description: "Rendered ad preview component using real offer data.", path: "components/templates/AdTemplate.tsx", tags: ["template", "ad", "preview"] },
    ],
  },
  {
    id: "logos-backgrounds",
    label: "Logos & Backgrounds",
    icon: <ImageIcon />,
    components: [
      { name: "SelectBackgroundDialog", description: "Fullscreen dialog (50 px margin) for selecting backgrounds and lifestyle images. Two panels: folder tree on the left, card grid on the right.", path: "components/logos-backgrounds/SelectBackgroundDialog.tsx", tags: ["dialog", "background", "fullscreen"] },
      { name: "LifestyleTaggingDialog", description: "Dialog for tagging lifestyle images.", path: "components/logos-backgrounds/LifestyleTaggingDialog.tsx", tags: ["dialog", "lifestyle", "tagging"] },
      { name: "LogoPicker", description: "Logo selector for the project.", path: "components/logos-backgrounds/LogoPicker.tsx", tags: ["picker", "logo"] },
      { name: "CombinationAccordion", description: "Accordion for offer + background combinations.", path: "components/logos-backgrounds/CombinationAccordion.tsx", tags: ["accordion", "combination"] },
      { name: "OfferAccordion", description: "Offer accordion within the logos & backgrounds screen.", path: "components/logos-backgrounds/OfferAccordion.tsx", tags: ["accordion", "offer"] },
      { name: "SubsectionActions", description: "Subsection action bar (add, bulk actions, etc.).", path: "components/logos-backgrounds/SubsectionActions.tsx", tags: ["actions", "toolbar"] },
    ],
  },
  {
    id: "offers",
    label: "Offers",
    icon: <TagIcon />,
    components: [
      { name: "BrowseOffersDialog", description: "Dialog for browsing and selecting offers from the portal.", path: "components/offers/BrowseOffersDialog.tsx", tags: ["dialog", "offer", "browse"] },
    ],
  },
];

const ALL_CATEGORY: ComponentCategory = {
  id: "all",
  label: "All Components",
  icon: <PuzzleIcon />,
  components: CATEGORIES.flatMap((c) => c.components),
};

// ─── Preview registry ─────────────────────────────────────────────────────────

type PreviewDef = React.ReactNode;

function buildPreviews(): Record<string, PreviewDef> {
  const brand = "#473bab";
  const brandAlpha = "rgba(71,59,171,0.08)";

  return {
    AssetCard: (
      <div style={{ zoom: 0.52 }}>
        <div style={{ width: 240 }}>
          <AssetCard
            selected={false}
            preview={
              <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                  <rect width="48" height="48" rx="8" fill="#d1d5db" />
                  <rect x="14" y="14" width="20" height="20" rx="4" fill="#9ca3af" />
                </svg>
              </div>
            }
            footer={
              <div>
                <p style={{ fontSize: 13, fontWeight: 500, color: "#111827", margin: 0 }}>Asset Name</p>
                <p style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>PNG · 1920×1080</p>
                <div style={{ marginTop: 8 }}>
                  <span style={{ fontSize: 11, color: "#4b5563", background: "#f0f2f4", padding: "3px 8px", borderRadius: 4 }}>Honda</span>
                </div>
              </div>
            }
          />
        </div>
      </div>
    ),

    CardViewVertical: (
      <div style={{ width: "100%", padding: "0 16px" }}>
        <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(3, 1fr)" }}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ aspectRatio: "1", borderRadius: 8, background: "#d1d5db", boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.07)" }} />
              <div style={{ height: 8, background: "#d1d5db", borderRadius: 4, width: "80%" }} />
              <div style={{ height: 6, background: "#e5e7eb", borderRadius: 4, width: "60%" }} />
              <div style={{ height: 16, background: "#e5e7eb", borderRadius: 2, width: "40%", marginTop: 2 }} />
            </div>
          ))}
        </div>
      </div>
    ),

    Button: (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
        <button style={{ background: brand, color: "white", fontSize: 14, fontWeight: 600, padding: "8px 20px", borderRadius: 8, border: "none", cursor: "pointer" }}>Primary</button>
        <button style={{ background: "white", color: "#374151", fontSize: 14, fontWeight: 500, padding: "8px 20px", borderRadius: 8, border: "1px solid #e5e7eb", cursor: "pointer" }}>Secondary</button>
        <button style={{ color: brand, fontSize: 14, fontWeight: 500, padding: "8px 20px", borderRadius: 8, background: "transparent", border: "none", cursor: "pointer" }}>Ghost</button>
      </div>
    ),

    Badge: (
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, padding: "0 24px", justifyContent: "center" }}>
        <span style={{ fontSize: 11, color: "#4b5563", background: "#f0f2f4", padding: "4px 10px", borderRadius: 4 }}>Default</span>
        <span style={{ fontSize: 11, color: brand, background: brandAlpha, border: `1px solid rgba(71,59,171,0.2)`, padding: "4px 10px", borderRadius: 4 }}>Active</span>
        <span style={{ fontSize: 11, color: "#15803d", background: "#f0fdf4", padding: "4px 10px", borderRadius: 4 }}>Published</span>
        <span style={{ fontSize: 11, color: "#1d4ed8", background: "#eff6ff", padding: "4px 10px", borderRadius: 4 }}>Regional</span>
        <span style={{ fontSize: 11, color: "#b45309", background: "#fffbeb", padding: "4px 10px", borderRadius: 4 }}>Draft</span>
      </div>
    ),

    Checkbox: (
      <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <div style={{ width: 24, height: 24, borderRadius: 4, border: `2px solid ${brand}`, background: brand, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
          <span style={{ fontSize: 11, color: "#6b7280" }}>Checked</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <div style={{ width: 24, height: 24, borderRadius: 4, border: "2px solid #d1d5db", background: "white" }} />
          <span style={{ fontSize: 11, color: "#6b7280" }}>Unchecked</span>
        </div>
      </div>
    ),

    Dialog: (
      <div style={{ width: 220, borderRadius: 12, background: "white", boxShadow: "0 10px 25px rgba(0,0,0,0.15)", border: "1px solid #f3f4f6", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: "1px solid #f3f4f6" }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: "#1f2937" }}>Dialog Title</span>
          <div style={{ width: 16, height: 16, borderRadius: "50%", background: "#e5e7eb", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <CloseIcon />
          </div>
        </div>
        <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ height: 8, background: "#f3f4f6", borderRadius: 4, width: "100%" }} />
          <div style={{ height: 8, background: "#f3f4f6", borderRadius: 4, width: "80%" }} />
          <div style={{ height: 8, background: "#f3f4f6", borderRadius: 4, width: "100%" }} />
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, padding: "12px 16px", borderTop: "1px solid #f3f4f6" }}>
          <div style={{ height: 28, width: 64, borderRadius: 999, background: "#f3f4f6" }} />
          <div style={{ height: 28, width: 64, borderRadius: 999, background: brand }} />
        </div>
      </div>
    ),

    ScrollArea: (
      <div style={{ width: 180, height: 120, border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden", display: "flex", background: "white" }}>
        <div style={{ flex: 1, overflow: "hidden", padding: 10, display: "flex", flexDirection: "column", gap: 8 }}>
          {[90, 70, 80, 65, 75, 85].map((w, i) => (
            <div key={i} style={{ height: 8, background: "#f3f4f6", borderRadius: 4, width: `${w}%` }} />
          ))}
        </div>
        <div style={{ width: 8, background: "#f9fafb", borderLeft: "1px solid #f3f4f6", display: "flex", flexDirection: "column", padding: "6px 0" }}>
          <div style={{ margin: "0 auto", width: 6, height: 32, borderRadius: 999, background: "#d1d5db" }} />
        </div>
      </div>
    ),

    Select: (
      <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "center" }}>
        <div style={{ width: 200, borderRadius: 8, border: "1px solid #e5e7eb", background: "white", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
          <span style={{ fontSize: 14, color: "#6b7280" }}>Select option...</span>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3.5 5.25l3.5 3.5 3.5-3.5" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </div>
        <div style={{ width: 200, borderRadius: 8, border: "1px solid rgba(71,59,171,0.4)", background: "white", boxShadow: "0 4px 6px rgba(0,0,0,0.07)", overflow: "hidden" }}>
          {["Option A", "Option B", "Option C"].map((opt, i) => (
            <div key={i} style={{ padding: "6px 12px", fontSize: 14, cursor: "pointer", background: i === 1 ? brandAlpha : "transparent", color: i === 1 ? brand : "#374151", fontWeight: i === 1 ? 500 : 400 }}>{opt}</div>
          ))}
        </div>
      </div>
    ),

    Separator: (
      <div style={{ width: 200, display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ height: 1, background: "#e5e7eb", width: "100%" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ flex: 1, height: 1, background: "#e5e7eb" }} />
          <span style={{ fontSize: 12, color: "#9ca3af", fontWeight: 500 }}>or</span>
          <div style={{ flex: 1, height: 1, background: "#e5e7eb" }} />
        </div>
        <div style={{ height: 1, background: "#e5e7eb", width: "100%" }} />
      </div>
    ),

    TemplateCard: (
      <div style={{ zoom: 0.52 }}>
        <div style={{ width: 260 }}>
          <TemplateCard template={templates[0]} />
        </div>
      </div>
    ),

    BackgroundCollectionCard: (
      <div style={{ zoom: 0.52 }}>
        <div style={{ width: 260 }}>
          <BackgroundCollectionCard collection={backgroundCollections[0]} selected={false} onSelect={() => {}} />
        </div>
      </div>
    ),

    OfferCard: (
      <div style={{ zoom: 0.63 }}>
        <OfferCard offer={offerLibrary[0]} />
      </div>
    ),

    ProjectContentLayout: (
      <div style={{ width: 280, height: 150, display: "flex", borderRadius: 12, overflow: "hidden", border: "1px solid #e5e7eb", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
        <div style={{ width: 42, background: "#111827", display: "flex", flexDirection: "column", alignItems: "center", padding: "12px 0", gap: 10, flexShrink: 0 }}>
          <div style={{ width: 20, height: 20, borderRadius: 4, background: "rgba(71,59,171,0.5)" }} />
          <div style={{ flex: 1 }} />
          {[1, 2, 3, 4].map(i => <div key={i} style={{ width: 20, height: 20, borderRadius: 8, background: "#374151" }} />)}
          <div style={{ flex: 1 }} />
          <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#4b5563" }} />
        </div>
        <div style={{ width: 90, background: "#f9fafb", borderRight: "1px solid #e5e7eb", flexShrink: 0, padding: 8, display: "flex", flexDirection: "column", gap: 6 }}>
          {[85, 60, 75, 90, 55].map((w, i) => <div key={i} style={{ height: 8, background: "#e5e7eb", borderRadius: 4, width: `${w}%` }} />)}
        </div>
        <div style={{ flex: 1, background: "white", padding: 8, display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ height: 10, background: "#f3f4f6", borderRadius: 4, width: "100%" }} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginTop: 4 }}>
            {[1, 2, 3, 4].map(i => <div key={i} style={{ aspectRatio: "1", background: "#f3f4f6", borderRadius: 8 }} />)}
          </div>
        </div>
      </div>
    ),

    TopBar: (
      <div style={{ width: 300, height: 44, background: "white", border: "1px solid #e5e7eb", borderRadius: 12, display: "flex", alignItems: "center", padding: "0 12px", gap: 12, boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
        <div style={{ width: 80, height: 16, background: "rgba(71,59,171,0.25)", borderRadius: 4 }} />
        <div style={{ flex: 1, height: 24, background: "#f3f4f6", borderRadius: 999, display: "flex", alignItems: "center", padding: "0 10px", gap: 6 }}>
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#d1d5db" }} />
          <div style={{ flex: 1, height: 6, background: "#e5e7eb", borderRadius: 4 }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {[1, 2, 3, 4].map(i => <div key={i} style={{ width: 24, height: 24, borderRadius: 8, background: "#f3f4f6" }} />)}
          <div style={{ width: 24, height: 24, borderRadius: "50%", background: "rgba(71,59,171,0.25)", marginLeft: 2 }} />
        </div>
      </div>
    ),

    GlobalNav: (
      <div style={{ width: 48, height: 160, background: "#111827", borderRadius: 12, display: "flex", flexDirection: "column", alignItems: "center", padding: "12px 0", gap: 10, boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
        <div style={{ width: 24, height: 24, borderRadius: 8, background: "rgba(71,59,171,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: 12, height: 12, borderRadius: 2, background: "rgba(255,255,255,0.8)" }} />
        </div>
        <div style={{ flex: 1 }} />
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} style={{ width: 24, height: 24, borderRadius: 8, background: i === 2 ? brand : "#374151" }} />
        ))}
        <div style={{ flex: 1 }} />
        <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#6b7280" }} />
      </div>
    ),

    PageMeta: (
      <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "0 12px" }}>
        <span style={{ fontSize: 14, color: "#9ca3af", cursor: "pointer" }}>Projects</span>
        <ChevronRightIcon size={12} />
        <span style={{ fontSize: 14, color: "#6b7280" }}>Honda Demo</span>
        <ChevronRightIcon size={12} />
        <span style={{ fontSize: 14, fontWeight: 600, color: "#1f2937" }}>Templates</span>
      </div>
    ),

    SidebarToggleButton: (
      <button style={{ width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 8, cursor: "pointer" }}>
        <PanelLeftIcon />
      </button>
    ),

    StatusChip: (
      <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "center" }}>
        <StatusChip status="Draft" />
        <StatusChip status="In Review" />
        <StatusChip status="Published" />
      </div>
    ),

    TasksSidebar: (
      <div style={{ width: 200, background: "white", border: "1px solid #e5e7eb", borderRadius: 12, padding: 12, boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: "#374151", marginBottom: 10 }}>Project Tasks</div>
        {[
          { label: "Select Offers", done: true },
          { label: "Add Templates", done: true },
          { label: "Map Variables", done: false },
          { label: "Choose Styles", done: false },
        ].map((t, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0" }}>
            <div style={{ width: 16, height: 16, borderRadius: 4, border: `2px solid ${t.done ? brand : "#d1d5db"}`, background: t.done ? brand : "white", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {t.done && <svg width="8" height="6" viewBox="0 0 10 8" fill="none"><path d="M1 4l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>}
            </div>
            <span style={{ fontSize: 11, color: t.done ? "#9ca3af" : "#374151", textDecoration: t.done ? "line-through" : "none" }}>{t.label}</span>
          </div>
        ))}
      </div>
    ),

    TemplateWireframe: (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <TemplateWireframe templateId={templates[0].id} scale={0.38} showText />
      </div>
    ),

    TemplateZoneEditor: (
      <div style={{ width: 240, height: 155, background: "white", border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
        <div style={{ background: "#1f2937", padding: "8px 12px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <span style={{ fontSize: 11, color: "white", fontWeight: 600 }}>Zone Editor — CR-V</span>
          <div style={{ width: 16, height: 16, borderRadius: "50%", background: "#4b5563", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <CloseIcon />
          </div>
        </div>
        <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
          <div style={{ flex: 1, background: "#f9fafb", display: "flex", alignItems: "center", justifyContent: "center", padding: 8 }}>
            <div style={{ width: 90, height: 90, border: "2px dashed #4ade80", borderRadius: 4, position: "relative" }}>
              <div style={{ position: "absolute", top: 4, left: 4, right: 4, height: 32, background: "#dbeafe", border: "1px dashed #93c5fd", borderRadius: 2, fontSize: 7, color: "#3b82f6", display: "flex", alignItems: "center", justifyContent: "center" }}>Product</div>
              <div style={{ position: "absolute", bottom: 4, left: 4, right: 4, height: 14, background: "#f3e8ff", border: "1px dashed #c084fc", borderRadius: 2, fontSize: 7, color: "#a855f7", display: "flex", alignItems: "center", justifyContent: "center" }}>Logo</div>
            </div>
          </div>
          <div style={{ width: 72, background: "white", borderLeft: "1px solid #f3f4f6", padding: 8, display: "flex", flexDirection: "column", gap: 6 }}>
            {["Background", "Product", "Logo", "Text"].map((z, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, flexShrink: 0, background: ["#4ade80", "#60a5fa", "#c084fc", "#d1d5db"][i] }} />
                <span style={{ fontSize: 9, color: "#4b5563", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{z}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),

    VariableMappingPane: (
      <div style={{ width: 220, background: "white", border: "1px solid #e5e7eb", borderRadius: 12, padding: 12, boxShadow: "0 1px 2px rgba(0,0,0,0.05)", display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: "#1f2937", marginBottom: 4 }}>Map Variables</div>
        {["Headline", "Subheadline", "Price", "CTA", "Disclaimer"].map((v, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 10, color: "#4b5563", width: 70, flexShrink: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v}</span>
            <div style={{ flex: 1, height: 0, borderTop: "1px dashed #d1d5db" }} />
            <div style={{ height: 20, width: 60, background: brandAlpha, border: "1px solid rgba(71,59,171,0.2)", borderRadius: 4, fontSize: 9, color: brand, display: "flex", alignItems: "center", padding: "0 6px", flexShrink: 0 }}>
              {`{var_${i + 1}}`}
            </div>
          </div>
        ))}
      </div>
    ),

    AdTemplate: (
      <div style={{ width: 150, height: 150, borderRadius: 12, overflow: "hidden", position: "relative", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, #1f2937, #473bab)" }} />
        <div style={{ position: "absolute", left: 12, top: 12, right: 12, height: 70, border: "1px dashed rgba(74,222,128,0.6)", borderRadius: 4, fontSize: 8, color: "#4ade80", display: "flex", alignItems: "center", justifyContent: "center" }}>Background</div>
        <div style={{ position: "absolute", bottom: 12, left: 12, right: 12, display: "flex", flexDirection: "column", gap: 4 }}>
          <div style={{ height: 6, background: "rgba(255,255,255,0.7)", borderRadius: 4, width: "80%" }} />
          <div style={{ height: 6, background: "rgba(255,255,255,0.5)", borderRadius: 4, width: "60%" }} />
          <div style={{ height: 20, background: "rgba(71,59,171,0.8)", borderRadius: 999, fontSize: 8, color: "white", display: "flex", alignItems: "center", justifyContent: "center", marginTop: 4 }}>Lease from $529/mo</div>
        </div>
      </div>
    ),

    SelectBackgroundDialog: (
      <div style={{ width: 260, height: 160, background: "white", border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", borderBottom: "1px solid #f3f4f6", flexShrink: 0 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: "#1f2937" }}>Select Background</span>
          <CloseIcon />
        </div>
        <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
          <div style={{ width: 80, borderRight: "1px solid #f3f4f6", padding: 8, display: "flex", flexDirection: "column", gap: 4, flexShrink: 0 }}>
            {["Recents", "Collections", "Brand Kits"].map((l, i) => (
              <div key={i} style={{ fontSize: 9, borderRadius: 4, padding: "4px 6px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", background: i === 0 ? brandAlpha : "transparent", color: i === 0 ? brand : "#6b7280", fontWeight: i === 0 ? 500 : 400 }}>{l}</div>
            ))}
          </div>
          <div style={{ flex: 1, padding: 8 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 4 }}>
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} style={{ aspectRatio: "1", borderRadius: 6, background: i === 2 ? "#c7d2fe" : "#f3f4f6", outline: i === 2 ? `2px solid ${brand}` : "none" }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    ),

    LifestyleTaggingDialog: (
      <div style={{ width: 230, height: 145, background: "white", border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
        <div style={{ padding: "8px 12px", borderBottom: "1px solid #f3f4f6", display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: "#1f2937" }}>Lifestyle Tagging</span>
        </div>
        <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
          <div style={{ flex: 1, background: "#f3f4f6", margin: 8, borderRadius: 8 }} />
          <div style={{ width: 80, padding: 8, display: "flex", flexDirection: "column", gap: 4, flexShrink: 0 }}>
            <div style={{ fontSize: 9, color: "#6b7280", marginBottom: 6 }}>Tags</div>
            {["CR-V", "Lifestyle", "Outdoor"].map(t => (
              <div key={t} style={{ height: 20, background: brandAlpha, border: "1px solid rgba(71,59,171,0.2)", borderRadius: 4, fontSize: 9, color: brand, display: "flex", alignItems: "center", padding: "0 6px" }}>{t}</div>
            ))}
          </div>
        </div>
      </div>
    ),

    LogoPicker: (
      <div style={{ width: 200, background: "white", border: "1px solid #e5e7eb", borderRadius: 12, padding: 12, boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: "#374151", marginBottom: 8 }}>Choose Logo</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
          {[true, false, false, false, false, false].map((sel, i) => (
            <div key={i} style={{ aspectRatio: "1", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", border: sel ? `2px solid ${brand}` : "1px solid #f3f4f6", background: sel ? brandAlpha : "#f9fafb" }}>
              <div style={{ width: 24, height: 24, borderRadius: 4, background: "#d1d5db" }} />
            </div>
          ))}
        </div>
      </div>
    ),

    CombinationAccordion: (
      <div style={{ width: 240, display: "flex", flexDirection: "column", gap: 6 }}>
        {[{ label: "CR-V TrailSport AWD", open: true }, { label: "HR-V Sport 2WD", open: false }].map((item, i) => (
          <div key={i} style={{ border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: "#f9fafb" }}>
              <span style={{ color: "#9ca3af", transform: item.open ? "rotate(90deg)" : "none", transition: "transform 0.2s", display: "flex" }}><ChevronRightIcon /></span>
              <span style={{ fontSize: 11, fontWeight: 500, color: "#374151", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.label}</span>
              <span style={{ fontSize: 10, color: "#9ca3af" }}>3</span>
            </div>
            {item.open && (
              <div style={{ padding: "8px 12px", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
                {[1, 2, 3].map(j => <div key={j} style={{ aspectRatio: "1", background: "#f3f4f6", borderRadius: 8 }} />)}
              </div>
            )}
          </div>
        ))}
      </div>
    ),

    OfferAccordion: (
      <div style={{ width: 240, display: "flex", flexDirection: "column", gap: 6 }}>
        {["2026 CR-V TrailSport", "2026 Odyssey EX-L"].map((label, i) => (
          <div key={i} style={{ border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: "#f9fafb" }}>
              <span style={{ color: "#9ca3af", transform: i === 0 ? "rotate(90deg)" : "none", display: "flex" }}><ChevronRightIcon /></span>
              <span style={{ fontSize: 11, fontWeight: 500, color: "#374151", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label}</span>
              <span style={{ fontSize: 10, background: brandAlpha, color: brand, padding: "2px 6px", borderRadius: 4 }}>Lease</span>
            </div>
            {i === 0 && (
              <div style={{ padding: "8px 12px", fontSize: 10, color: "#6b7280", display: "flex", flexDirection: "column", gap: 4 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}><span>Monthly</span><span style={{ fontWeight: 600, color: "#1f2937" }}>$529/mo</span></div>
                <div style={{ display: "flex", justifyContent: "space-between" }}><span>Term</span><span style={{ fontWeight: 600, color: "#1f2937" }}>36 mo</span></div>
              </div>
            )}
          </div>
        ))}
      </div>
    ),

    SubsectionActions: (
      <div style={{ display: "flex", alignItems: "center", gap: 8, width: 260, padding: "10px 12px", background: "white", border: "1px solid #e5e7eb", borderRadius: 12, boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
        <button style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 600, color: "white", background: brand, padding: "6px 12px", borderRadius: 8, border: "none", cursor: "pointer" }}>
          <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> Add
        </button>
        <button style={{ fontSize: 11, color: "#4b5563", border: "1px solid #e5e7eb", padding: "6px 10px", borderRadius: 8, background: "white", cursor: "pointer" }}>From Portal</button>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 11, color: "#9ca3af" }}>3 items</span>
        <button style={{ color: "#9ca3af", background: "none", border: "none", cursor: "pointer", display: "flex" }}><MoreHorizontalIcon /></button>
      </div>
    ),

    BrowseOffersDialog: (
      <div style={{ width: 260, height: 160, background: "white", border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
        <div style={{ padding: "8px 12px", borderBottom: "1px solid #f3f4f6", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: "#1f2937" }}>Browse Offers</span>
          <CloseIcon />
        </div>
        <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
          <div style={{ width: 70, borderRight: "1px solid #f3f4f6", padding: 8, display: "flex", flexDirection: "column", gap: 2, flexShrink: 0 }}>
            {["All", "Lease", "Finance", "Cash"].map((l, i) => (
              <div key={l} style={{ fontSize: 9, padding: "4px 6px", borderRadius: 4, cursor: "pointer", background: i === 0 ? brandAlpha : "transparent", color: i === 0 ? brand : "#6b7280", fontWeight: i === 0 ? 500 : 400 }}>{l}</div>
            ))}
          </div>
          <div style={{ flex: 1, padding: 8, display: "flex", flexDirection: "column", gap: 6, overflow: "hidden" }}>
            {[{ name: "CR-V TrailSport", price: "$529/mo" }, { name: "HR-V Sport", price: "$699/mo" }, { name: "Odyssey EX-L", price: "$999/mo" }].map((o, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, padding: 6, borderRadius: 8, background: "#f9fafb" }}>
                <div style={{ width: 28, height: 28, borderRadius: 6, background: "#e5e7eb", flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}>
                  <div style={{ fontSize: 9, fontWeight: 500, color: "#374151", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{o.name}</div>
                  <div style={{ fontSize: 9, color: brand }}>{o.price}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
  };
}

const PREVIEW_REGISTRY = buildPreviews();

// ─── Dialog ───────────────────────────────────────────────────────────────────

interface ComponentLibraryDialogProps {
  open: boolean;
  onClose: () => void;
}

export function ComponentLibraryDialog({ open, onClose }: ComponentLibraryDialogProps) {
  const [activeCategoryId, setActiveCategoryId] = useState<string>("all");
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(["components"]));
  const [query, setQuery] = useState("");

  const activeCategory =
    activeCategoryId === "all"
      ? ALL_CATEGORY
      : CATEGORIES.find((c) => c.id === activeCategoryId) ?? ALL_CATEGORY;

  const filtered = activeCategory.components.filter((comp) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      comp.name.toLowerCase().includes(q) ||
      comp.description.toLowerCase().includes(q) ||
      comp.path.toLowerCase().includes(q) ||
      comp.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  function toggleGroup(id: string) {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      PaperProps={{
        sx: {
          width: "calc(100vw - 100px)",
          height: "calc(100vh - 100px)",
          borderRadius: 4,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      {/* ── Header ── */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 3, py: 2, flexShrink: 0 }}>
        <Box>
          <Typography sx={{ fontSize: 16, fontWeight: 600, color: "#111827" }}>Component Library</Typography>
          <Typography sx={{ fontSize: 12, color: "#9ca3af", mt: 0.25 }}>
            {ALL_CATEGORY.components.length} components · consistent design across all implementations
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: "#9ca3af", "&:hover": { color: "#4b5563" } }}>
          <CloseIcon />
        </IconButton>
      </Box>

      {/* ── Two-panel body ── */}
      <Box sx={{ display: "flex", flex: 1, minHeight: 0, borderTop: "1px solid #f3f4f6" }}>

        {/* ── Left: Category tree ── */}
        <Box sx={{ width: 280, borderRight: "1px solid #f3f4f6", display: "flex", flexDirection: "column", flexShrink: 0 }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 2, py: 1.5 }}>
            <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#1f2937" }}>Categories</Typography>
          </Box>

          <Box sx={{ px: 1.5, pb: 1.5 }}>
            <Box sx={{ position: "relative" }}>
              <Box sx={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9ca3af", display: "flex" }}>
                <SearchIcon />
              </Box>
              <InputBase
                placeholder="Find component"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                sx={{
                  width: "100%",
                  pl: "28px",
                  pr: 1.5,
                  py: 0.75,
                  fontSize: 12,
                  bgcolor: "#f9fafb",
                  border: "1px solid #e5e7eb",
                  borderRadius: "999px",
                  "&.Mui-focused": { borderColor: "#473bab" },
                }}
              />
            </Box>
          </Box>

          <Box sx={{ flex: 1, overflowY: "auto", px: 1, py: 0.5, display: "flex", flexDirection: "column", gap: 0.25 }}>
            <CategoryItem
              icon={<PuzzleIcon />}
              label="All Components"
              count={ALL_CATEGORY.components.length}
              active={activeCategoryId === "all"}
              onClick={() => setActiveCategoryId("all")}
            />

            <Divider sx={{ my: 0.5, borderColor: "#f3f4f6" }} />

            <CategoryGroup
              label="Constellation Design System"
              expanded={expandedGroups.has("components")}
              onToggle={() => toggleGroup("components")}
            >
              {CATEGORIES.map((cat) => (
                <CategoryItem
                  key={cat.id}
                  icon={cat.icon}
                  label={cat.label}
                  count={cat.components.length}
                  active={activeCategoryId === cat.id}
                  onClick={() => setActiveCategoryId(cat.id)}
                  indent
                />
              ))}
            </CategoryGroup>
          </Box>
        </Box>

        {/* ── Right: Component grid ── */}
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>

          {/* Breadcrumb */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, px: 2.5, pt: 1.5, pb: 0.5, flexShrink: 0 }}>
            <Typography sx={{ fontSize: 12, color: "#9ca3af" }}>Library</Typography>
            <Box sx={{ color: "#d1d5db", display: "flex" }}><ChevronRightIcon size={11} /></Box>
            <Typography sx={{ fontSize: 12, color: "#4b5563", fontWeight: 500 }}>{activeCategory.label}</Typography>
          </Box>

          {/* Toolbar */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, px: 2.5, py: 1, borderBottom: "1px solid #f3f4f6", flexShrink: 0 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
              <Box sx={{ width: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "#473bab", color: "white", fontSize: 10, fontWeight: 600, borderRadius: "50%" }}>
                {activeCategoryId === "all" ? "∗" : CATEGORIES.findIndex((c) => c.id === activeCategoryId) + 1}
              </Box>
              <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>{activeCategory.label}</Typography>
            </Box>
            <Typography sx={{ ml: "auto", fontSize: 12, color: "#9ca3af" }}>{filtered.length} / {activeCategory.components.length} Items</Typography>
          </Box>

          {/* Grid */}
          <Box sx={{ flex: 1, overflowY: "auto", p: 2.5 }}>
            {filtered.length === 0 ? (
              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 160, color: "#9ca3af" }}>
                <Typography sx={{ fontSize: 14, fontWeight: 500 }}>No components found</Typography>
              </Box>
            ) : (
              <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 2 }}>
                {filtered.map((comp) => (
                  <ComponentCard key={comp.path} comp={comp} />
                ))}
              </Box>
            )}
          </Box>

          {/* Footer */}
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 1.5, px: 2.5, py: 2, borderTop: "1px solid #f3f4f6", flexShrink: 0 }}>
            <Button
              onClick={onClose}
              variant="outlined"
              sx={{ fontSize: 14, fontWeight: 500, color: "#374151", borderColor: "#d1d5db", borderRadius: "999px", px: 2.5, py: 1, textTransform: "none", "&:hover": { bgcolor: "#f9fafb", borderColor: "#d1d5db" } }}
            >
              Close
            </Button>
          </Box>
        </Box>
      </Box>
    </Dialog>
  );
}

// ─── ComponentCard ────────────────────────────────────────────────────────────

function ComponentCard({ comp }: { comp: ComponentEntry }) {
  const preview = PREVIEW_REGISTRY[comp.name];

  return (
    <Box
      sx={{
        borderRadius: 3,
        border: "1px solid #f3f4f6",
        overflow: "hidden",
        transition: "border-color 0.15s, box-shadow 0.15s",
        "&:hover": { borderColor: "rgba(71,59,171,0.2)", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" },
      }}
    >
      {/* Preview area */}
      <Box sx={{ height: 200, bgcolor: "#f0f2f4", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", position: "relative" }}>
        {preview ?? <DefaultPreview name={comp.name} />}
      </Box>

      {/* Info */}
      <Box sx={{ p: 2, bgcolor: "background.paper" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, flexWrap: "wrap" }}>
          <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{comp.name}</Typography>
          {comp.isBase && (
            <Typography component="span" sx={{ fontSize: 10, fontWeight: 600, color: "#473bab", bgcolor: "rgba(71,59,171,0.08)", border: "1px solid rgba(71,59,171,0.2)", px: 0.75, py: "2px", borderRadius: 1, lineHeight: 1 }}>base</Typography>
          )}
        </Box>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mt: 0.75 }}>
          {comp.tags.map((tag) => (
            <Typography key={tag} component="span" sx={{ fontSize: 10, color: "#6b7280", bgcolor: "#f0f2f4", px: 0.75, py: "2px", borderRadius: 1, lineHeight: 1 }}>{tag}</Typography>
          ))}
        </Box>
        <Typography sx={{ fontSize: 12, color: "#6b7280", mt: 1, lineHeight: 1.6, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{comp.description}</Typography>
        <Typography component="code" sx={{ fontSize: 11, color: "#9ca3af", mt: 1, display: "block", fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{comp.path}</Typography>
      </Box>
    </Box>
  );
}

function DefaultPreview({ name }: { name: string }) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1, color: "#9ca3af" }}>
      <BoxIcon size={28} />
      <Typography sx={{ fontSize: 11, fontWeight: 500 }}>{name}</Typography>
    </Box>
  );
}

// ─── CategoryItem ─────────────────────────────────────────────────────────────

function CategoryItem({
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
        px: 1,
        py: 0.75,
        ...(indent ? { pl: 3.5 } : {}),
        borderRadius: 2,
        cursor: "pointer",
        transition: "background-color 0.1s",
        bgcolor: active ? "rgba(71,59,171,0.08)" : "transparent",
        color: active ? "#473bab" : "#4b5563",
        fontWeight: active ? 500 : 400,
        "&:hover": { bgcolor: active ? "rgba(71,59,171,0.08)" : "#f9fafb" },
      }}
    >
      <Box component="span" sx={{ flexShrink: 0, opacity: 0.6, color: "#473bab", display: "flex" }}>{icon}</Box>
      <Typography component="span" sx={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: 11.5, color: "inherit", fontWeight: "inherit" }}>{label}</Typography>
      {count !== undefined && <Typography component="span" sx={{ fontSize: 10, color: "#9ca3af", flexShrink: 0 }}>({count})</Typography>}
    </Box>
  );
}

// ─── CategoryGroup ────────────────────────────────────────────────────────────

function CategoryGroup({
  label, expanded, onToggle, children,
}: {
  label: string; expanded: boolean; onToggle: () => void; children: React.ReactNode;
}) {
  return (
    <Box>
      <Box
        onClick={onToggle}
        sx={{ display: "flex", alignItems: "center", gap: 1, px: 1, py: 0.75, color: "#4b5563", cursor: "pointer", borderRadius: 2, transition: "background-color 0.1s", "&:hover": { bgcolor: "#f9fafb" } }}
      >
        <Box sx={{ color: "#9ca3af", flexShrink: 0, display: "flex" }}>
          {expanded ? <ChevronDownIcon size={12} /> : <ChevronRightIcon size={12} />}
        </Box>
        <Typography sx={{ fontSize: 11.5, fontWeight: 500, color: "#374151", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{label}</Typography>
      </Box>
      {expanded && <Box>{children}</Box>}
    </Box>
  );
}
