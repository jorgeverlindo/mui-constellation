# DataGrid Architecture — MUI Migration Reference

> **Audience:** Claude Code in the Constellation MUI repository. This document describes the complete source-of-truth implementation in `vw-funds-2`. Every component, animation, data model, and interaction pattern is documented here in enough detail to reimplement them from scratch in MUI without referencing the original source.

---

## Table of Contents

1. [Overview](#1-overview)
2. [Component Tree](#2-component-tree)
3. [Data Models](#3-data-models)
4. [View Modes — Complete Specification](#4-view-modes--complete-specification)
5. [Animations — Exact Specification](#5-animations--exact-specification)
6. [DataGrid Component — Deep Dive](#6-datagrid-component--deep-dive)
7. [InventoryContent — Wiring](#7-inventorycontent--wiring)
8. [VIN Detail (VinDetailContent)](#8-vin-detail-vindetailcontent)
9. [AI Config Integration](#9-ai-config-integration)
10. [Key Patterns](#10-key-patterns)
11. [MUI Migration Notes](#11-mui-migration-notes)

---

## 1. Overview

The DataGrid system is the core UI for the **Inventory > Vehicles** tab of the RideNow Powersports dealer portal. It displays a paginated list of vehicle VINs (vehicle identification numbers) with associated metadata, AI-generation status, syndication status, pricing intelligence, and AI-generated image angles.

### What the System Does

- **Displays vehicle inventory**: Shows 61+ VIN records drawn from `VEHICLE_INVENTORY`, each with Year, Make, Model, Trim, Price, Exterior Color, Days on Lot (DOL), AI Generation status, and Syndication status.
- **View mode switching**: Four distinct view modes (Table Large, Card Vertical, Card Horizontal, Table Condensed) that cycle on a single toolbar button click.
- **Search filtering**: Free-text search across VIN, make, model, trim, color, condition, status, year, price, and DOL.
- **Row selection**: Multi-select via checkboxes; supports select-all.
- **Contextual menus**: Kebab (three-dot) menu per row with actions: Syndicate, VIN Details, New AI Config, View Source Images, Go to VDP, Disable AI Image, Remove AI Config, Attach as Comment.
- **AI image display**: When an AI config is applied to a VIN, the thumbnail shows the hero angle (3/4 L generated image) instead of the plain vehicle photo.
- **VIN Detail navigation**: Clicking a VIN opens a full detail page (`VinDetailContent`) with hero image, 6-angle thumbnail strip, and two-column data layout.
- **Source Images lightbox**: Opens `AnglePreviewModal` directly from the kebab menu with `defaultTab="source"`.
- **AI Config expansion (DataGrid)**: The separate DataGrid (for AI Config records, not VINs) has expandable rows that reveal vehicle groups with 6 angle thumbnails each.

### Entry Point

```
InventoryContent
  └── (activeTab === 'vehicles') → AnimatePresence wraps:
        ├── viewMode === 'table-large'      → VehicleInventoryGrid
        ├── viewMode === 'vertical-cards'   → VehicleCardGrid
        ├── viewMode === 'horizontal-cards' → VehicleCardList
        └── viewMode === 'table-small'      → VehicleTableCondensed
  └── (selectedVinId) → VinDetailContent (replaces entire content area)
  └── AnglePreviewModal (portal, source images lightbox)
```

There is a **second** DataGrid (`DataGrid.tsx`) that operates on `AIConfigRecord[]` rather than `VinInventoryRecord[]`. This is the AI Config management grid (not the vehicle inventory grid). Its expandable rows contain `YMMTCItems → VehicleRow → AnglesSource → AngleCard`.

### Role of Each View Mode

| Mode ID | Component | Purpose |
|---|---|---|
| `table-large` | `VehicleInventoryGrid` | Primary data table, 90px rows, 17 columns, drag-resize headers |
| `vertical-cards` | `VehicleCardGrid` | 5-column card grid, square aspect-ratio image top, footer below |
| `horizontal-cards` | `VehicleCardList` | Responsive card list (auto-fill min 320px), thumbnail left + info right |
| `table-small` | `VehicleTableCondensed` | Dense table, 52px rows, 38px thumbnails, all same columns |

---

## 2. Component Tree

### Full Hierarchy

```
InventoryContent                    (InventoryContent.tsx)
├── BreadcrumbBar                   (shared)
├── CommentsButton                  (shared/comments)
├── Tab bar (On-Brand Insights / Conquest Insights / Vehicles)
├── Toolbar
│   ├── ToolbarIconBtn (Filter)
│   ├── Ad Channels button
│   ├── ToolbarIconBtn (Kebab)
│   ├── Search input
│   ├── Channel icons (Meta, Google, VIN IQ, AI Enabled, Optymizr, Fluency)
│   ├── Item count
│   └── ToolbarIconBtn (view cycle, Columns2, Download, BarChart2)
├── AnimatePresence (view switching)
│   ├── VehicleInventoryGrid        (VehicleInventoryGrid.tsx)
│   │   ├── sticky thead
│   │   ├── tbody → tr per record
│   │   │   ├── ThumbnailImg
│   │   │   ├── AIConfigBadge (conditional)
│   │   │   ├── AIGenerationChip
│   │   │   ├── SyndicationChip
│   │   │   ├── PriceToMarketChip
│   │   │   ├── PriorityScoreChip
│   │   │   └── sticky kebab overlay
│   │   └── VehiclesMenu (portal)
│   ├── VehicleCardGrid             (VehicleCardGrid.tsx)
│   │   ├── 5-col CSS grid
│   │   └── VerticalCard × N
│   │       ├── motion.div (layoutId=thumb-{id})
│   │       ├── checkbox overlay
│   │       ├── Disabled badge
│   │       ├── AI sparkle badge
│   │       ├── Asset Details eye button
│   │       └── footer (VIN + subtitle + kebab)
│   ├── VehicleCardList             (VehicleCardList.tsx)
│   │   ├── auto-fill grid (min 320px)
│   │   └── HorizontalCard × N
│   │       ├── motion.div (layoutId=thumb-{id})
│   │       └── info pane (VIN, subtitle, price, chips)
│   └── VehicleTableCondensed       (VehicleTableCondensed.tsx)
│       ├── sticky thead (52px height)
│       └── motion.tr × N (animated entrance)
│           ├── motion.div (layoutId=thumb-{id})
│           └── all chip components
├── AnglePreviewModal               (AnglePreviewModal.tsx)  — source images lightbox
└── (selectedVinId) VinDetailContent (VinDetailContent.tsx)
    ├── BreadcrumbBar
    ├── CommentsButton
    ├── Tab bar (VIN Details / Generated Images / Source Images)
    ├── Hero image (4:3 aspect ratio)
    ├── Generated / Source toggle chips
    ├── AngleStripVin               (AngleStripVin.tsx)
    │   ├── AngleCardSm × 6 (64×64)
    │   └── AnglePreviewModal
    └── Two-column detail layout (DetailRow × many)

DataGrid (AI Config grid)           (DataGrid.tsx)
├── sticky thead (52px)
├── tbody
│   └── React.Fragment per record
│       ├── main tr (90px)
│       │   ├── Thumbnail (76×76)
│       │   ├── VinsChip / FilterGroupChip
│       │   ├── StatusChip
│       │   └── sticky kebab overlay
│       └── expansion tr (grid-template-rows animation)
│           └── YMMTCItems          (YMMTCItems.tsx)
│               └── VehicleRow × N  (VehicleRow.tsx)
│                   ├── collapsed row (56px, #f9fafa bg)
│                   └── AnglesSource (grid-template-rows animation) (AnglesSource.tsx)
│                       ├── AngleCard × 6 (90×90)  (AngleCard.tsx)
│                       └── AnglePreviewModal
└── GlobalAIConfigMenu (portal)     (GlobalAIConfigMenu.tsx)
```

### Component Reference Table

| Component | File | Purpose | Key Props |
|---|---|---|---|
| `InventoryContent` | `InventoryContent.tsx` | Top-level page, owns view mode state, search, selection, navigation | `isAgentPaneOpen?: boolean` |
| `VehicleInventoryGrid` | `VehicleInventoryGrid.tsx` | Table Large view, 17-column table with drag-resize headers | `records`, `selected`, `onToggleRow`, `onToggleAll`, `onVinClick`, `onSyndicationToggle`, `onAiGenerationToggle`, `onViewSourceImages`, `onAttachComment` |
| `VehicleCardGrid` | `VehicleCardGrid.tsx` | Card Vertical view, 5-col grid, square cards | same props minus `onToggleAll` |
| `VehicleCardList` | `VehicleCardList.tsx` | Card Horizontal view, auto-fill grid, landscape cards | same as VehicleCardGrid |
| `VehicleTableCondensed` | `VehicleTableCondensed.tsx` | Table Small view, 52px dense rows | same as VehicleInventoryGrid |
| `DataGrid` | `DataGrid.tsx` | AI Config management table (separate from inventory) | `records: AIConfigRecord[]`, `selected`, `onToggleRow`, `onToggleAll`, `onRowClick`, `onAngleReorder?`, `onRemoveConfig?` |
| `VinDetailContent` | `VinDetailContent.tsx` | VIN Detail page shown instead of inventory when a VIN is selected | `record: VinInventoryRecord`, `onBack`, `variant?: 'auto' | 'sport'` |
| `YMMTCItems` | `YMMTCItems.tsx` | Container for vehicle rows in AI Config accordion; single-expand accordion | `vehicleGroups: VehicleGroup[]`, `onAngleReorder?` |
| `VehicleRow` | `VehicleRow.tsx` | One vehicle/color variant row inside YMMTC expansion | `group: VehicleGroup`, `isExpanded`, `onToggle`, `onAngleReorder?` |
| `AnglesSource` | `AnglesSource.tsx` | 6 angle cards in DataGrid accordion; drag-to-reorder, modal | `angles`, `sourceAngles?`, `previousAngles?`, `vehicleName?`, `initialOrder?`, `onOrderChange?` |
| `AngleCard` | `AngleCard.tsx` | Single 90×90 angle card with hover actions (Eye, Pencil) | `label`, `src`, `defaultSrc`, `isHero?`, `isGhost?`, drag callbacks, `onPreview?` |
| `AngleStripVin` | `AngleStripVin.tsx` | 64×64 angle strip for VIN Detail page | `angles`, `sourceAngles?`, `previousAngles?`, `showSource?`, `activeKey?`, `onActiveChange?` |
| `AnglePreviewModal` | `AnglePreviewModal.tsx` | Lightbox modal for angle images; 3 tabs (Generated, Previous Version, Source) | `isOpen`, `onClose`, `angleLabel`, `vehicleName`, `generatedSrc`, `sourceSrc`, `previousSrc?`, `defaultSrc`, `defaultTab?`, `onPrev?`, `onNext?` |
| `AngleBar` | `AngleBar.tsx` | Angle selector for AI Config editor (not inventory grid) | `currentIndex`, `onSetAngle`, `multiAngleEnabled`, `onToggleMultiAngle`, `viewMode`, `onSetViewMode` |
| `Thumbnail` | `Thumbnail.tsx` | Simple thumbnail in DataGrid AI Config rows | `src?`, `alt?`, `width?=76`, `height?=76` |
| `VehiclesMenu` | `VehiclesMenu.tsx` | Kebab dropdown for vehicle rows (portal) | `anchor`, `syndicationStatus`, `aiGenerationStatus`, `aiConfigApplied?`, `onAction`, `onClose` |
| `GlobalAIConfigMenu` | `GlobalAIConfigMenu.tsx` | Kebab dropdown for AI Config rows (portal) | `anchor`, `onAction`, `onClose` |
| `PromptLibraryModal` | `PromptLibraryModal.tsx` | Modal with GenAI prompt library (sidebar categories + 4-col grid) | `open`, `onClose`, `onInsert` |

---

## 3. Data Models

### 3a. `VinInventoryRecord` (primary data shape for inventory views)

**File:** `data/vehicleInventory.ts`

```typescript
export interface VinInventoryRecord {
  id:              string;         // "vin-01" … "vin-61" — internal React key
  vin:             string;         // Vehicle Identification Number, e.g. "WBA8D9C50JK678112"
  condition:       'New' | 'Used'; // New vs pre-owned
  year:            number;         // e.g. 2026
  make:            string;         // e.g. "Yamaha"
  model:           string;         // e.g. "TW200T"
  trim:            string;         // e.g. "Base", "SE", "EPS XT-R"
  price:           number;         // integer USD, e.g. 4899
  aiGeneration:    AIGenerationStatus;  // 'enabled' | 'disabled'
  aiConfigApplied: boolean;        // true → show hero angle image + AI badge on thumbnail
  aiConfigId?:     string;         // links to AIConfigRecord.id in AI_CONFIGS
  vehicleGroup?:   VehicleGroup;   // when present, holds generated angle images
  syndication:     SyndicationStatus;   // 'syndicated' | 'not-syndicated'
  exteriorColor:   string;         // e.g. "Matte Light Gray Metallic"
  vehicleStatus:   'On the lot' | 'In Transit';
  dol:             number;         // Days on lot, integer
  priceToMarket:   PriceToMarket;  // 'well-above' | 'above' | 'close' | 'below' | 'well-below'
  priorityScore:   number;         // 1–7 (Maximize→Cease spending)
  thumbnail:       string;         // URL to plain vehicle image (jellybean/photo)
}
```

**Derived types (same file):**
```typescript
export type PriceToMarket    = 'well-above' | 'above' | 'close' | 'below' | 'well-below';
export type AIGenerationStatus = 'enabled' | 'disabled';
export type SyndicationStatus  = 'syndicated' | 'not-syndicated';
```

**Priority Score color mapping** (from `VehicleInventoryGrid.tsx`):
| Score | Label | Color |
|---|---|---|
| 1 | Maximize Spending | `#640808` (dark red) |
| 2 | Increase Spending | `#b52520` (red) |
| 3 | Boost Spending | `#e55e50` (orange-red) |
| 4 | Maintain Spending | `#616161` (gray) |
| 5 | Decrease Spending | `#109890` (teal) |
| 6 | Minimize Spending | `#065c56` (dark teal) |
| 7 | Cease Spending | `#02292c` (very dark teal) |

**Price to Market border colors** (outlined chip):
| Value | Border Color |
|---|---|
| `well-above` | `#02292c` |
| `above` | `#0a7870` |
| `close` | `#616161` |
| `below` | `#d43b2f` |
| `well-below` | `#640808` |

### 3b. `VehicleGroup`

**File:** `data/types.ts`

```typescript
export type AngleKey = '34l' | 'front' | '34r' | 'right' | 'rear' | 'left';

export interface VehicleGroup {
  id:              string;              // unique group id, e.g. "raptor-blue-1"
  year:            number;
  make:            string;
  model:           string;
  trim:            string;
  color:           string;
  vin:             string;
  source:          string;             // source dealer/system name
  thumbnail:       string;             // URL to vehicle thumbnail (jellybean)
  status:          'Active' | 'Inactive';
  angles:          Record<AngleKey, string | null>;    // AI-generated composite images
  sourceAngles?:   Record<AngleKey, string | null>;   // Source cutout images (no background)
  previousAngles?: Record<AngleKey, string | null>;   // Before last individual re-generation
  angleOrder?:     AngleKey[];                         // Custom display order; index 0 = Hero
}
```

**Angle key canonical order** (display/UI default): `'34l' | 'front' | '34r' | 'right' | 'rear' | 'left'`

**Labels per key:**
| AngleKey | Label |
|---|---|
| `34l` | 3/4 L |
| `front` | Front |
| `34r` | 3/4 R |
| `right` | Right |
| `rear` | Rear |
| `left` | Left |

The **Hero angle** is always `angles['34l']` (index 0 of canonical order unless `angleOrder` is set). The hero angle is shown as the thumbnail in table rows when `aiConfigApplied=true`.

### 3c. `VinFilters`

**File:** `data/types.ts`

```typescript
export interface VinFilters {
  // Multi-select (new, takes precedence when non-empty)
  years?:  (number | string)[];
  makes?:  string[];
  models?: string[];
  trims?:  string[];
  colors?: string[];
  // Legacy single-select (backward compat)
  year?:   number | string;
  make?:   string;
  model?:  string;
  trim?:   string;
  color?:  string;
}
```

### 3d. `AIConfigRecord`

**File:** `data/aiConfigs.ts`

```typescript
export interface AIConfigRecord {
  id:            string;
  name:          string;          // e.g. "January_05_final"
  thumbnail:     string;          // URL to background scene image
  dimensions:    string;          // e.g. "1600 × 1200"
  vinsApplied:   string;          // Human-readable filter string, e.g. "2024 · Yamaha · Raptor 700R · SE · Brown"
  vins:          number;          // Count of VINs this config applies to
  status:        'Active' | 'Paused';
  createdAt:     string;          // Relative time string, e.g. "30 minutes ago"
  model:         string;          // AI model name, e.g. "Flux", "Midjourney V8"
  vehicleGroups?: VehicleGroup[]; // Expandable YMMTC rows; first 4 configs have data
  formState?:    SavedFormState;  // Round-trip editing state
  filterGroups?: Array<{ filters: VinFilters }>; // When present, renders chips instead of vinsApplied text
}
```

### 3e. `SavedFormState`

**File:** `data/aiConfigs.ts`

```typescript
export interface SavedFormState {
  configName:      string;
  aiConfigActive:  boolean;
  aiModel:         string;
  seed:            string;
  prompt:          string;
  productPosition: { x: number; y: number; width: number };
  bgUrl:           string | null;
  overlayUrl:      string | null;
  vinsCount:       number;
  filterGroups?:   Array<{ filters: VinFilters }>;
  isStaticRecord?: boolean;       // true for pre-seeded records
  genAngles?:      Array<string | null>;    // ordered per ANGLES index
  sourceAngles?:   Array<string | null>;
  previousAngles?: Array<string | null>;
}
```

### 3f. `AIConfigState`

**File:** `data/types.ts` — Used by the AI Config editor, not directly by the inventory grid.

```typescript
export interface AIConfigState {
  configName:      string;
  backgroundFile:  File | null;
  backgroundUrl:   string | null;
  vinFilters:      VinFilters;
  selectedVin:     string | null;
  aiModel:         string;
  imageType:       string;
  prompt:          string;
  productPosition: { x: number; y: number; width: number };
  overlayEnabled:  boolean;
  currentAngleIndex: number;
  multiAngleEnabled: boolean;
  viewMode:        'single' | 'grid';
  autoRenderEnabled: boolean;
}
```

### 3g. `PromptEntry`

**File:** `data/types.ts`

```typescript
export interface PromptEntry {
  id:          string;
  category:    'outdoor' | 'oem' | 'racing' | 'adventure' | 'lifestyle' | 'fx';
  title:       string;
  description: string;
  prompt:      string;
}
```

---

## 4. View Modes — Complete Specification

### 4a. Grid View — `VehicleCardGrid` / `VerticalCard`

**File:** `VehicleCardGrid.tsx`

**Layout:**
```css
display: grid;
grid-template-columns: repeat(5, minmax(0, 1fr));
column-gap: 12px;
row-gap: 20px;
```
Container: `flex-1 overflow-y-auto min-h-0 p-[16px]`

**Card anatomy (VerticalCard):**

```
┌────────────────────────────────────┐
│  [checkbox — top-left, on hover]   │  absolute, 20×20, rounded, opacity-0 → opacity-100 on group-hover
│  [AI sparkle — bottom-left]        │  22×22 white circle, shadow, conditional on aiGeneration=enabled
│  [Disabled badge — top-right]      │  "Disabled" pill bg-black/54, shown when aiGeneration=disabled
│  [Asset Details eye — bottom-right]│  30×30 #473bab circle, opacity-0 → opacity-100 on hover, duration-150
│                                    │
│     vehicle image (1:1 aspect)     │  motion.div layoutId=`thumb-${id}`
│     object-cover (AI generated)    │  border border-[#e7e7e9] group-hover → border-[#473bab]
│     object-contain (jellybean)     │  rounded-[12px], transition-colors duration-150
│                                    │  image: transition-transform duration-500 group-hover:scale-105
│                                    │
└────────────────────────────────────┘
pt-[8px] pb-[12px]
  motion.p  layoutId=`vin-${id}`    font-medium 12px text-[#1f1d25] truncate
  motion.p  layoutId=`subtitle-${id}` caption 11px text-[#686576]
    "{condition} · {year} · {make} · {model} · {trim} · {exteriorColor}"
  [kebab button — top-right of footer, opacity-0 → opacity-100 on hover]
```

**Disabled state** (aiGeneration === 'disabled'):
- Image block: `opacity-60`
- Top-right badge: `bg-[rgba(0,0,0,0.54)] backdrop-blur-sm` pill with "Disabled" text (10px font-medium white)

**Selected state** (isSelected):
- Border: `border-[#473bab]`
- No fill on the card itself (selection indicated only by border)

**Hover image zoom:** `transition-transform duration-500 group-hover:scale-105` — 500ms duration, CSS `scale` transform

**Checkbox (overlay):**
- Default: `opacity-0 group-hover:opacity-100 transition-opacity duration-200`
- When selected: `opacity-100` always
- Visual: 20×20 rounded, selected → `bg-[#473bab] border-[#473bab]` with white check icon; unselected → `bg-white/80 border-white hover:border-[#473bab]`

**AI sparkle badge:**
- `size-[22px]` white/90 rounded-full, bottom-left of image at `bottom-[8px] left-[8px]`
- Shadow: `0px 0.8px 4px 0px rgba(0,0,0,0.12), 0px 1.6px 1.6px 0px rgba(0,0,0,0.14)`
- Icon: purple sparkle SVG `fill="#473BAB"`

**Kebab button** (in card footer, not image):
- `opacity-0 group-hover:opacity-100` — appears on card hover
- When open: shows `<X size={13} />` instead of `<MoreVertical size={13} />`

### 4b. List View — `VehicleCardList` / `HorizontalCard`

**File:** `VehicleCardList.tsx`

**Layout:**
```css
display: grid;
gap: 16px;
grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
```
Container: `flex-1 overflow-y-auto min-h-0 p-[16px]`

**Card anatomy (HorizontalCard):**

```
┌──────────────────┬──────────────────────────────────────┐
│  160×min120px    │  flex-1 p-[12px]                     │
│  thumbnail       │  ┌─ top row: VIN (purple, truncate) ─┐│
│  bg-[#f0f2f4]    │  │  subtitle (gray, truncate)        ││
│                  │  │  [kebab button — top-right]        ││
│  [checkbox TL]   │  └──────────────────────────────────┘│
│  [disabled badge TR] │  ─ bottom row:                   │
│  [AI sparkle BR] │     ${price} · PriceToMarketChip     │
│  [hover overlay] │     PriorityScoreChip                 │
└──────────────────┴──────────────────────────────────────┘
```

**Hover / shadow transition:**
```css
/* Default */
box-shadow: 0px 1px 3px 0px rgba(0,0,0,0.08);
/* Hover */
box-shadow: 0px 4px 14px 0px rgba(0,0,0,0.12);
transition: box-shadow 150ms;
```

**Selected border:** `border-[#473bab]`; default: `border-[rgba(0,0,0,0.10)]`

**Hover overlay on thumbnail:**
- `opacity: hovered ? 1 : 0`, `transition-opacity duration-150`
- `bg-gradient-to-t from-black/40 to-transparent`
- Contains "Asset Details" pill button: `bg-white/90 hover:bg-white text-[#473bab] px-[8px] h-[26px] rounded-full font-medium text-[11px]`

**VIN text:** `font-medium text-[13px] text-[#473bab] hover:underline`
**Subtitle:** `caption text-[rgba(17,16,20,0.56)] — "{condition} | {year} {make} {model}"`
**Price:** `font-normal text-[13px] text-[#1f1d25]`

**Disabled state:**
- Top-right badge on thumbnail: same as Grid View
- No opacity change on card body (differs from Grid View which dims the image block to 60%)

**Key difference from Grid View:**
- Landscape orientation (thumbnail left, info right) vs. square card (image top, footer below)
- VIN shown as medium-weight primary link
- Shows Price, PriceToMarketChip, PriorityScoreChip in info pane
- Subtitle is condensed: `{condition} | {year} {make} {model}` (no trim/color)
- Grid View subtitle shows all 6 fields separated by `·`

### 4c. Table / Large View — `VehicleInventoryGrid`

**File:** `VehicleInventoryGrid.tsx`

**Layout:** `<table>` with `tableLayout: fixed`, `width: max-content`, `minWidth: 100%`

**Row height:** 90px

**Header height:** 52px — sticky, `top-0 z-10 bg-white border-b border-[rgba(0,0,0,0.12)]`

**Column definitions (exact widths from Figma):**

| Column | Width | Content |
|---|---|---|
| Expand | 24px | Chevron icon (no children in VehicleInventoryGrid — always muted) |
| Checkbox | 42px | 14×14 checkbox, `accent-[#473bab]` |
| Thumbnail | 76px | `opacity: 0` in header; 76×76 image cell |
| VIN | 190px | Purple link text, `motion.button layoutId=vin-{id}` |
| Condition | 90px | New / Used, `motion.p layoutId=subtitle-{id}` |
| Year | 80px | Number |
| Make | 100px | String |
| Model | 110px | String |
| Trim | 120px | String |
| Price | 100px | `$${price.toLocaleString()}` |
| AI Generation | 140px | `AIGenerationChip` |
| Syndication | 145px | `SyndicationChip` |
| Exterior Color | 155px | String |
| Vehicle Status | 130px | String |
| DOL | 80px | Integer |
| Price to Market | 175px | `PriceToMarketChip` (center-aligned) |
| Priority Score | 130px | `PriorityScoreChip` |
| Sticky kebab | 0px | Zero-width sticky right td; houses absolute overlay |

**Header cells** have drag-resize dividers: 8px wide hotspot with 1px visible line (`bg-[rgba(0,0,0,0.12)]`), hover turns line purple (`#6356e1`). Each divider resizes the PREVIOUS column by tracking mousemove delta from `mousedown` x-position.

**Sort indicator:** Each header column (except expand, checkbox, thumbnail) shows `ArrowDownIcon` (18×18 SVG path `M20 12l-1.41-1.41L13 16.17V4h-2v12.17l-5.58-5.59L4 12l8 8 8-8z`) in `text-[rgba(17,16,20,0.56)]`. Clicking columns has no sort behavior in the source (UI-only decoration).

**Row states:**

| State | Background | Hover |
|---|---|---|
| Default | `bg-white` | `hover:bg-[rgba(31,29,37,0.04)]` |
| Selected | `bg-[rgba(99,86,225,0.08)]` | `hover:bg-[rgba(99,86,225,0.12)]` |
| Disabled (aiGeneration=disabled) | `bg-[rgba(31,29,37,0.04)]` | `hover:bg-[rgba(31,29,37,0.06)]` |

Row transition: `transition-colors` (CSS default 150ms)

**Disabled row treatment:**
- Most cells: `opacity-50` wrapper
- Status chips (AIGenerationChip, SyndicationChip): always full opacity (shows status)
- VIN text: `opacity-50` wrapper

**Sticky kebab overlay** (pattern identical in all 3 table/condensed views):
```
<td sticky right-0 z-[2] width:0 minWidth:0>
  <div invisible group-hover:visible absolute right-0 top-0 bottom-0 pointer-events-none>
    <!-- Gradient fade: 80px, transparent → hover bg color (linear-gradient to right) -->
    <!-- Solid bg slab: flex items-center pr-2 -->
    <!-- Kebab button: 32×32 rounded-[200px] white bg-white hover:bg-white/92 -->
  </div>
</td>
```
The kebab is `invisible group-hover:visible` — parent `<tr>` has `group` class. When menu is open, visibility is forced with `visible` class directly.

**Thumbnail behavior** in this view:
- Uses `ThumbnailImg` component (inline, not shared `Thumbnail.tsx`)
- `cover=true` when `aiConfigApplied && vehicleGroup?.angles?.['34l']` exists → full-bleed `object-cover`
- `cover=false` → gray `#f0f2f4` background, 8px padding, `object-contain`, auto-scaled
- Scale formula: `(Math.max(w, h) / Math.min(w, h)) * 0.80` applied as CSS `transform: scale()`
- Fallback: if AI image errors, switch to `fallbackSrc` (plain thumbnail) and use contain mode

**AI Config Badge** (overlays thumbnail when `aiGeneration === 'enabled'`):
- `absolute bottom-[-4px] right-[-8px] z-[1] size-[24px]`
- White circle with sparkle SVG icon (purple `#473BAB`)
- Shadow: `0px 0.8px 4px 0px rgba(0,0,0,0.12), 0px 1.6px 1.6px 0px rgba(0,0,0,0.14), 0px 2.4px 0.8px -2px rgba(0,0,0,0.20)`

**Layout morphing:** Thumbnail (`layoutId=thumb-{id}`), VIN button (`layoutId=vin-{id}`), Condition (`layoutId=subtitle-{id}`) are all `motion.*` elements with `LAYOUT_SPRING = { type: 'tween', ease: 'easeOut', duration: 0.4 }`. They morph position/size during view mode transitions.

### 4d. Condensed Table View — `VehicleTableCondensed`

**File:** `VehicleTableCondensed.tsx`

**Layout:** Same `<table>` structure as `VehicleInventoryGrid`

**Row height:** 52px (vs 90px in Table Large)

**Thumbnail size:** 38×38px (vs 76×76)

**Column definitions (exact widths from Figma node 3975-2248310):**

| Column | Width |
|---|---|
| Expand (spacer) | 24px |
| Checkbox | 42px |
| Thumbnail | 38px |
| VIN | 190px |
| Condition | 90px |
| Year | 124px |
| Make | 124px |
| Model | 124px |
| Trim | 80px |
| Price | 120px |
| AI Generation | 140px |
| Syndication | 136px |
| Exterior Color | 144px |
| Vehicle Status | 156px |
| DOL | 120px |
| Price to Market | 176px |
| Priority Score | 160px |
| Sticky kebab | 0px |

**Differences from Table Large:**
- Row height: 52px (not 90px)
- Thumbnail: 38×38 (not 76×76)
- No `ThumbnailImg` component; raw `<img>` with `object-contain`
- Header cells have NO drag-resize dividers (fixed widths)
- **Row entrance animation** (present here, absent in Table Large):
  ```
  motion.tr
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.12, delay: Math.min(index * 0.008, 0.25) }}
  ```
  — stagger: 8ms per row, capped at 250ms total delay; duration 120ms each
- Header has indeterminate checkbox support (`ref={el => { if (el) el.indeterminate = someSelected; }}`)
- No sort arrow icons in header (plain `HEADER_LABEL` only)
- All layout-morphing elements (`motion.div`, `motion.button`, `motion.span`) with `layoutId=thumb-{id}`, `vin-{id}`, `subtitle-{id}` — same spring as other views

### 4e. AI Config Table View — `DataGrid` (separate from vehicle inventory)

**File:** `DataGrid.tsx`

This is the AI Config management table, distinct from the vehicle inventory views.

**Row height:** 90px

**Header height:** 52px — sticky

**Column definitions (from `DEFAULT_WIDTHS`):**

| Column | Width | Content |
|---|---|---|
| Expand | 24px | Chevron, rotates 90° when expanded |
| Checkbox | 42px | 14×14 checkbox |
| Thumbnail | 76px | invisible in header; background scene image |
| Name | 200px | Config name, purple link |
| Model | 140px | AI model name (e.g. "Flux") |
| Dimensions | 140px | e.g. "1600 × 1200" |
| Filter applied | 380px | `FilterGroupChip` or `VinsChip` |
| VINs applied | 120px | Integer count |
| Status | 140px | `StatusChip` (check = Active, pause = Inactive) |
| Last Updated | 200px | Relative time string |
| Sticky kebab | 0px | Same pattern as vehicle grid |

**Expandable rows:**
- Parent row has chevron that rotates `rotate-90` when expanded (transition: `duration-300 ease-out`)
- Expansion animated via `gridTemplateRows: isExpanded ? '1fr' : '0fr'` + `transition: grid-template-rows 350ms ease-out`
- Child: `<div style={{ overflow: 'hidden' }}>` prevents height flash
- Content: `YMMTCItems`

---

## 5. Animations — Exact Specification

### 5a. View Mode Transition Animation

**Source:** `InventoryContent.tsx`, lines 565–651

All 4 view modes are wrapped in `<AnimatePresence mode="sync" initial={false}>` with `<LayoutGroup id="inventory-views">`.

Each mode is an `absolute inset-0 flex flex-col` `motion.div`:

```tsx
<motion.div
  key="table-large"           // unique key triggers AnimatePresence enter/exit
  className="absolute inset-0 flex flex-col"
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
  transition={{ duration: 0.4, ease: 'easeOut' }}
>
```

**Exact values:**
- Property animated: `opacity` only (no scale, no y/x translate, no blur)
- Initial: `opacity: 0`
- Animate: `opacity: 1`
- Exit: `opacity: 0`
- Duration: `0.4` seconds (400ms)
- Ease: `'easeOut'` (framer-motion named easing)
- Mode: `"sync"` — exit and enter run simultaneously (crossfade)
- `initial={false}` — no animation on first mount

**LayoutGroup:** Shared `id="inventory-views"` enables shared layout animations across view modes. Elements with matching `layoutId` props morph between views using `LayoutGroup`.

### 5b. Layout Morphing — Thumbnail, VIN, Subtitle

All three table views and both card views share `motion.*` elements with matching `layoutIds`, so when switching views these elements smoothly reposition themselves:

```
layoutId="thumb-{record.id}"   → thumbnail image
layoutId="vin-{record.id}"     → VIN string/button
layoutId="subtitle-{record.id}" → Condition / subtitle text
```

**Spring configuration** (constant `LAYOUT_SPRING` in `VehicleCardGrid.tsx` and `VehicleCardList.tsx`):
```typescript
const LAYOUT_SPRING = { type: 'tween', ease: 'easeOut', duration: 0.4 } as const;
```

Applied as: `<motion.div layoutId={...} transition={LAYOUT_SPRING}>`

In `VehicleInventoryGrid.tsx` and `VehicleTableCondensed.tsx`, the same values are inlined:
```tsx
transition={{ type: 'tween', ease: 'easeOut', duration: 0.4 }}
```

### 5c. Card Hover Animations

**Image hover zoom (VehicleCardGrid only):**
```css
/* Applied to <img> inside VerticalCard image block */
transition: transform 500ms;
transform: scale(1.05);  /* on group-hover */
```
- Property: `transform: scale()`
- Duration: `500ms` (CSS transition, not framer-motion)
- Easing: CSS default (`ease`)
- Trigger: parent div has `group` class; image has `group-hover:scale-105`

**Card border on hover (VehicleCardGrid):**
```css
border: 1px solid;
/* default: */ border-color: #e7e7e9;
/* hover: */   border-color: #473bab;
transition: border-color 150ms; /* via 'transition-colors duration-150' */
```

**Card shadow on hover (VehicleCardList / HorizontalCard):**
```css
box-shadow: 0px 1px 3px 0px rgba(0,0,0,0.08);        /* default */
box-shadow: 0px 4px 14px 0px rgba(0,0,0,0.12);       /* hover */
transition: box-shadow 150ms;                          /* via 'transition-shadow duration-150' */
```

**Checkbox reveal (VehicleCardGrid):**
```css
/* Checkbox wrapper on card image */
opacity: 0;
/* on group-hover or when isSelected: */
opacity: 1;
transition: opacity 200ms;  /* via 'transition-opacity duration-200' */
```

**Kebab reveal (footer, VehicleCardGrid):**
```css
opacity: 0;
/* on group-hover: */
opacity: 1;
/* No explicit transition class — defaults to CSS 'transition-colors' in class */
```

**Asset Details eye button (VehicleCardGrid):**
```css
opacity: 0;
/* on group-hover: */
opacity: 1;
transition: opacity 150ms;  /* via 'transition-opacity duration-150' */
```

**Asset Details overlay (VehicleCardList / HorizontalCard):**
```javascript
// Controlled by local state
style={{ opacity: hovered ? 1 : 0 }}
// transition applied via class: 'transition-opacity duration-150'
```

### 5d. Table Row Hover Animation

**Source:** All three table views

```css
/* <tr> has 'transition-colors' class */
/* Tailwind: applies transition to background-color, border-color, color, etc. */
/* Default duration: 150ms ease-in-out */
background-color: white;               /* default */
background-color: rgba(31,29,37,0.04); /* hover */
```

- Property: `background-color`
- Duration: `150ms` (Tailwind `transition-colors` default)
- Easing: `ease-in-out`

**Kebab overlay reveal on row hover:**
```css
/* kebab wrapper: initially invisible, group-hover: visible */
visibility: hidden;    /* default */
visibility: visible;   /* group-hover */
/* No transition on visibility — instant appear/disappear */
/* But the button itself has transition-colors for bg changes */
```

### 5e. Condensed Table Row Entrance Animation

**Source:** `VehicleTableCondensed.tsx`, lines 166–172

```tsx
<motion.tr
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.12, delay: Math.min(index * 0.008, 0.25) }}
>
```

- Initial: `opacity: 0`
- Animate: `opacity: 1`
- Duration: `0.12` seconds (120ms) per row
- Delay: `index * 8ms`, capped at `250ms`
  - Row 0: 0ms delay
  - Row 10: 80ms delay
  - Row 31+: 250ms delay (cap)
- Easing: framer-motion default (`easeOut`)

This creates a staggered fade-in waterfall when the condensed view first mounts.

### 5f. DataGrid Expand Row Animation

**Source:** `DataGrid.tsx`, lines 449–464 (expansion row for AI Config records)

```tsx
<div
  style={{
    display: 'grid',
    gridTemplateRows: isExpanded ? '1fr' : '0fr',
    transition: 'grid-template-rows 350ms ease-out',
  }}
>
  <div style={{ overflow: 'hidden' }}>
    <YMMTCItems ... />
  </div>
</div>
```

- Property: `grid-template-rows`
- Collapsed: `0fr` → Expanded: `1fr`
- Duration: `350ms`
- Easing: `ease-out`
- Inner div: `overflow: hidden` prevents content clipping

**VehicleRow AnglesSource expand:**

```tsx
<div
  style={{
    display: 'grid',
    gridTemplateRows: isExpanded ? '1fr' : '0fr',
    transition: 'grid-template-rows 300ms ease-out',
  }}
>
  <div style={{ overflow: 'hidden' }}>
    <AnglesSource ... />
  </div>
</div>
```

- Duration: `300ms` (vs 350ms for the parent row)
- Easing: `ease-out`

**Expand chevron rotation:**
```css
/* <svg> element on expand/collapse buttons */
transition: transform 300ms ease-out;   /* via 'transition-transform duration-300 ease-out' */
transform: rotate(0deg);    /* collapsed */
transform: rotate(90deg);   /* expanded */
```

### 5g. Angle Card Animations — AnglesSource / AngleCard

**Source:** `AnglesSource.tsx`, `AngleCard.tsx`

**Drag-to-reorder — CSS left transition:**
```javascript
// In AnglesSource, each card wrapper:
style={{
  position: 'absolute',
  left: livePos * CARD_STEP,    // CARD_STEP = 106px (90 card + 16 gap)
  top: 0,
  width: 90,
  transition: isBeingDragged ? 'none' : 'left 300ms ease',
  zIndex: isBeingDragged ? 20 : isHovered ? 10 : undefined,
}}
```

- Animated property: `left` (pixel position)
- Duration: `300ms`
- Easing: `ease`
- During drag: transition disabled (`none`) so dragged card snaps with mouse
- Other cards: smoothly slide to make room

**Ghost state (being dragged):**
```css
/* AngleCard wrapper when isGhost=true */
opacity: 0.40;
transform: scale(0.95);   /* via 'scale-95' */
transition: opacity 150ms; /* via 'transition-opacity duration-150' */
```

**Hover actions reveal:**
```css
/* Hover actions container inside AngleCard image area */
opacity: 0;
/* on group-hover/angle: */
opacity: 1;
transition: opacity 150ms;  /* via 'transition-opacity' class */
```

**Border + ring on hover (AngleCard):**
```css
border: 1px solid transparent;  /* default */
border: 1px solid rgba(0,0,0,0.12);  /* on group-hover/angle */
transition: border-color 150ms;  /* via 'transition-colors' */
```

**Drag-over highlight (AngleCard):**
```css
border: 1px solid #473bab;
box-shadow: 0 0 0 4px rgba(71,59,171,0.3);  /* ring-2 ring-[#473bab]/30 */
transform: scale(1.04);  /* scale-[1.04] */
```

**Tooltip on AngleCard label chip:**
```javascript
// Slide-up tooltip, controlled by hovered state
style={{
  transform: `translateX(-50%) translateY(${hovered ? '0px' : '8px'})`,
  opacity: hovered ? 1 : 0,
  transition: 'opacity 450ms ease, transform 450ms ease',
}}
```
- Duration: `450ms` (both opacity and transform)
- Easing: `ease`
- Transform: slides from `translateY(8px)` → `translateY(0px)`

**AngleStripVin (64×64) — same patterns but different geometry:**
- `CARD_W = 64`, `CARD_GAP = 16`, `CARD_STEP = 80`
- Uses flexbox `flex-wrap` with `order` property instead of absolute positioning
- Active ring: `border-[#473bab] ring-[2px] ring-[#473bab]/30` on `isActive`
- Hover actions: same Eye + Pencil buttons, smaller size (Eye/Pencil size={12})

**Active state on AngleCardSm:**
```css
border: 1px solid #473bab;
box-shadow: 0 0 0 2px rgba(71,59,171,0.3);  /* ring-[2px] ring-[#473bab]/30 */
```
Transition: `transition-all duration-150`

### 5h. AnglePreviewModal Animation

**Source:** `AnglePreviewModal.tsx`

The modal renders with **no enter/exit animation** — it mounts/unmounts conditionally via `if (!isOpen) return null`. There is no framer-motion or CSS transition on the modal container itself.

**Backdrop:** `fixed inset-0 z-[500] bg-black/40 backdrop-blur-[2px]` — no fade animation; appears/disappears instantly.

**Modal card:** `bg-white rounded-[12px] shadow-[0px_8px_32px_rgba(0,0,0,0.24)] w-[739px] max-w-[95vw]` — no animation.

**Image aspect ratio:** `style={{ aspectRatio: '739 / 480' }}`

**Tab switching:** Instant — no animation between tabs.

**Keyboard navigation:** `Escape` → close, `ArrowLeft` → prev angle, `ArrowRight` → next angle.

### 5i. PromptLibraryModal Animation

**Source:** `PromptLibraryModal.tsx`

Uses `<AnimatePresence>` from framer-motion with two layers:

**Backdrop:**
```tsx
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
  transition={{ duration: 0.2 }}
  className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[200]"
/>
```
- Duration: `0.2` seconds (200ms)
- Property: `opacity`

**Modal container:**
```tsx
<motion.div
  initial={{ opacity: 0, scale: 0.97 }}
  animate={{ opacity: 1, scale: 1 }}
  exit={{ opacity: 0, scale: 0.97 }}
  transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
  className="fixed inset-0 z-[201] flex items-center justify-center p-6 pointer-events-none"
>
```
- Duration: `0.25` seconds (250ms)
- Ease: `[0.4, 0, 0.2, 1]` — Material Design standard easing (cubic-bezier)
- Properties: `opacity` + `scale` simultaneously
- Scale: `0.97` → `1.00` on enter; `1.00` → `0.97` on exit

### 5j. VehiclesMenu / GlobalAIConfigMenu Slide-Down Animation

**Source:** `VehiclesMenu.tsx`, `GlobalAIConfigMenu.tsx`

Both menus use the same CSS keyframe animation injected via `<style>`:

```css
@keyframes vehiclesMenuIn {
  from { opacity: 0; transform: translateY(-8px); }
  to   { opacity: 1; transform: translateY(0px);  }
}
```

Applied to the menu container:
```javascript
animation: 'vehiclesMenuIn 450ms ease-out forwards'
```

- Duration: `450ms`
- Easing: `ease-out`
- Properties: `opacity` + `translateY(-8px → 0)`
- `forwards`: retains final state

Menu dimensions: `width: 220px`, `border-radius: 4px`, `z-index: 9999`
Box shadow (Material elevation 8):
```
0 5px 5px -3px rgba(0,0,0,0.20),
0 8px 10px  1px rgba(0,0,0,0.14),
0 3px 14px  2px rgba(0,0,0,0.12)
```

### 5k. Toolbar Tooltip Animation

**Source:** `InventoryContent.tsx` — `ToolbarIconBtn` component

```javascript
// Tooltip container (slide up)
style={{
  transform: `translateX(-50%) translateY(${hovered ? '0px' : '6px'})`,
  opacity: hovered ? 1 : 0,
  transition: 'opacity 200ms ease, transform 200ms ease',
}}
```
- Duration: `200ms` for both opacity and transform
- Easing: `ease`
- Transform: `translateY(6px)` → `translateY(0px)` on hover

### 5l. Header Divider Color Transition

```css
/* 1px vertical line inside HeaderDivider */
background: rgba(0,0,0,0.12);    /* default */
background: #6356e1;              /* group-hover */
transition: background-color;     /* via 'transition-colors' — 150ms */
```

---

## 6. DataGrid Component — Deep Dive

**File:** `DataGrid.tsx`

This is the **AI Config management table**, not the vehicle inventory table. It operates on `AIConfigRecord[]`.

### Props

```typescript
interface DataGridProps {
  records:     AIConfigRecord[];
  selected:    Set<string>;
  onToggleRow: (id: string, checked: boolean) => void;
  onToggleAll: (checked: boolean) => void;
  onRowClick:  (id: string) => void;
  onAngleReorder?: (recordId: string, groupId: string, order: AngleKey[]) => void;
}
// Additional prop merged at call site:
onRemoveConfig?: (configId: string) => void;
```

### Internal State

```typescript
const [widths, setWidths] = useState<ColWidths>(DEFAULT_WIDTHS);
const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
const [openMenu, setOpenMenu] = useState<{ recordId: string; anchor: GlobalAIConfigMenuAnchor } | null>(null);
```

- `widths`: Per-column pixel widths, controlled by drag-resize dividers
- `expandedRows`: Set of record IDs that have their YMMTC rows visible
- `openMenu`: Which row's kebab menu is open and at what viewport position

### Expansion Behavior

- `toggleExpand(id)` toggles the id in `expandedRows` Set
- **Only rows with `vehicleGroups?.length > 0` show a clickable chevron** (muted otherwise)
- Chevron icon color: `hasChildren ? 'rgba(17,16,20,0.56)' : 'rgba(17,16,20,0.18)'`
- Expansion animation: `gridTemplateRows 350ms ease-out` (see section 5f)

### Kebab Menu (GlobalAIConfigMenu)

Actions available:
1. **Download Background** — icon: download SVG outline
2. **Duplicate** — icon: `square-behind-square-3__copy.svg`
3. **Enable AI Config** — icon: `esc__power.svg`
4. **Edit** — icon: `pencil__edit__write.svg` → calls `onRowClick(recordId)`
5. (divider)
6. **Remove** — icon: `trash.svg` → calls `removeConfig(configId)` from `useInventory()`, emits snackbar "AI Config removed from inventory"

### Filter Group Chip vs. Vins Chip

```
if (record.filterGroups && record.filterGroups.length > 0)
  → render FilterGroupChip per group (stacked column, gap-[4px])
  → format: "{year} · {make} · {model} · {trim} · {color}" (omits empty fields)
else
  → render VinsChip with record.vinsApplied string
```

Both chips: `bg-[rgba(17,16,20,0.04)]`, `rounded-[8px]`, `h-[24px]`, `text-[11px] Roboto Regular #1f1d25`

---

## 7. InventoryContent — Wiring

**File:** `InventoryContent.tsx`

### State Owned by InventoryContent

```typescript
// View mode — cycle on single button click
type ViewMode = 'table-large' | 'vertical-cards' | 'horizontal-cards' | 'table-small';
const [viewMode, setViewMode] = useState<ViewMode>('table-large');

// Search text
const [search, setSearch] = useState('');

// Selected VIN ids
const [selected, setSelected] = useState<Set<string>>(new Set());

// Active tab
const [activeTab, setActiveTab] = useState<'insights' | 'conquest' | 'vehicles'>('vehicles');

// VIN detail — synced with URL params
const [selectedVinId, setSelectedVinId] = useState<string | null>(() => {
  // derived from vinSlug URL param on init
});

// Source Images lightbox
const [sourceImagesVinId, setSourceImagesVinId] = useState<string | null>(null);
const [sourceImagesAngleIdx, setSourceImagesAngleIdx] = useState(0);

// Overrides (client-side mutations)
const [syndicationOverrides, setSyndicationOverrides] = useState<Map<string, SyndicationStatus>>(new Map());
const [aiGenerationOverrides, setAiGenerationOverrides] = useState<Map<string, AIGenerationStatus>>(() => {
  // loaded from localStorage on init
});
```

**aiGenerationOverrides** are persisted to `localStorage` key `STORAGE_KEYS.AI_GENERATION_OVERRIDES`. Syndication overrides are session-only (reset on page reload).

### View Mode Cycle

```typescript
const VIEW_MODES = [
  { id: 'table-large',      label: 'Card Vertical',   NextIcon: IconCardVertical   },
  { id: 'vertical-cards',   label: 'Card Horizontal', NextIcon: IconCardHorizontal },
  { id: 'horizontal-cards', label: 'Table Small',     NextIcon: IconTableSmall     },
  { id: 'table-small',      label: 'Table Large',     NextIcon: IconTableLarge     },
];

const cycleView = () => {
  setViewMode(prev => {
    const idx = VIEW_MODES.findIndex(m => m.id === prev);
    return VIEW_MODES[(idx + 1) % VIEW_MODES.length].id;
  });
};
```

**The toolbar button shows the icon for the NEXT view** (where clicking will take you), not the current view. The tooltip label is the next view's human-readable name.

**Default view:** `'table-large'`

### Toolbar Layout

```
[Filter icon] [Ad Channels button] [Kebab icon] [Search 200px]
  ← flex-1 spacer →
[Channel icons row: bg-[#f4f5f6] rounded-[12px] px-[8px] py-[6px] gap-[12px]]
  ← flex-1 spacer →
[N Items caption] [Columns2 icon] [Download icon] [BarChart2 icon] [View cycle icon]
```

**Toolbar container:** `flex items-center gap-[8px] px-6 py-[10px] border-b border-[rgba(0,0,0,0.08)]`

**Channel icons** (6 total):
| ID | Label | Enabled | Has Error |
|---|---|---|---|
| `ai-gen` | AI Generation | true | false |
| `vin-iq` | VIN IQ | true | false |
| `meta` | Meta | true | true (red 8px dot badge) |
| `google-ads` | Google Ads | false | false |
| `optymizr` | Optymyzr | false | false |
| `fluency` | Fluency | true | false |

Disabled channels: `opacity: 0.4` on icon wrapper. Labels hidden when `hideChannelLabels` (side panel open) or below 1260px breakpoint (`hidden min-[1260px]:inline`).

**Error badge on Meta:** `absolute top-[-2px] right-[-2px] size-[8px] bg-[#d2323f] rounded-full z-[1]`

### Toolbar Icon Button (ToolbarIconBtn)

```
Default: text-[rgba(17,16,20,0.56)] hover:bg-[rgba(17,16,20,0.04)]
Active:  text-[#473bab] bg-[rgba(71,59,171,0.08)]
Size: p-[5px] rounded-[100px], inner span size-[20px]
```

### Search Filter Logic

Applied to `inventoryVehicles` array:
```typescript
const records = inventoryVehicles.filter(r => {
  if (!search) return true;
  const q = search.toLowerCase();
  const qNum = q.replace(/[.,]/g, '');  // strip thousand separators
  return (
    r.vin.toLowerCase().includes(q)    ||
    r.make.toLowerCase().includes(q)   ||
    r.model.toLowerCase().includes(q)  ||
    r.trim.toLowerCase().includes(q)   ||
    r.exteriorColor.toLowerCase().includes(q) ||
    r.condition.toLowerCase().includes(q)     ||
    r.vehicleStatus.toLowerCase().includes(q) ||
    r.year.toString().includes(qNum)   ||
    r.price.toString().includes(qNum)  ||
    r.dol.toString().includes(qNum)
  );
});
```

Search is client-side, instant, no debounce.

### VehiclesMenu Actions Handled in InventoryContent

- `vinDetails` → `handleVinClick(recordId)` → navigate to VIN URL
- `syndicate` → `handleSyndicationToggle(recordId)` + snackbar
- `disableAiImage` → `handleAiGenerationToggle(recordId)` + snackbar
- `viewSourceImages` → `handleViewSourceImages(recordId)` → opens AnglePreviewModal with `defaultTab="source"`
- `attachComment` → `handleAttachComment(recordId)` → opens comments panel

### VIN Navigation (URL Sync)

```typescript
// On VIN click:
const slug = buildVinSlug(record.make, record.model, record.trim, record.exteriorColor, record.vin);
setSelectedVinId(id);
navigate(`${baseInventoryPath}/${slug}`);

// On back:
setSelectedVinId(null);
navigate(baseInventoryPath);
```

When `selectedVinId` is set, `InventoryContent` renders `<VinDetailContent>` instead of the toolbar + view area.

### Page Header Structure

```
px-6 pt-4 pb-0
  [Breadcrumb] [CommentsButton]   ← justify-between
  [Icon + "RideNow Powersports Weatherford" h1]  ← 16px font-medium
  [Tab bar h-[41px]:
    "On-Brand Insights" | "Conquest Insights" | "Vehicles"
    Active: text-[#473bab] + 2px bottom underline #473bab rounded-full
    Inactive: text-[#686576] hover:text-[#1f1d25]
    Font: 14px font-medium tracking-[0.4px]
  ]
```

---

## 8. VIN Detail (VinDetailContent)

**File:** `VinDetailContent.tsx`

### Activation

Rendered when `selectedVinId` is set — replaces entire `InventoryContent` body.

```typescript
if (selectedVinId) {
  const record = inventoryVehicles.find(r => r.id === selectedVinId);
  if (record) {
    return <VinDetailContent record={record} onBack={handleVinBack} variant={...} />;
  }
}
```

Variant is `'sport'` for RideNow (sport powersports dealer), `'auto'` for standard dealers.

### Layout

Two variants share the same sticky header structure:

**Header:**
```
px-6 pt-4 pb-0
  [BreadcrumbBar with "Vehicles" as clickable item → onBack]  [CommentsButton]
  [LeftPaneIcon] ["{year} {make} {model} {trim}" h1]
    [AI Generation switch + label]
  [Tab bar: "VIN Details" | "Generated Images" | "Source Images"]
[h-px divider bg-[rgba(0,0,0,0.12)]]
```

**AI Generation switch (read-only display):**
- Track: `w-[28px] h-[16px] rounded-full`
- Active: `bg-[#473bab]`, thumb at `translate-x-[14px]`
- Inactive: `bg-[rgba(17,16,20,0.38)]`, thumb at `translate-x-[2px]`
- Thumb: `w-[12px] h-[12px] bg-white rounded-full shadow-sm transition-transform`

**Body (variant='auto', activeTab='details'):**
```
flex-wrap gap-[24px] p-[16px]
  Left column (flex 1 1 0% min-w-280):
    Hero image (4:3 aspect, rounded-[4px] bg-[#f0f2f4])
      Generated / Source toggle chips (absolute top-[9px] left-[8px])
    AngleStripVin (6× 64px thumbnails)
  Right block (flex 1 1 338px max-w-740):
    ColA (flex 1 1 338px min-338):
      DetailRow × 14 fields (VIN, Config Used, Stock#, Hash, VDP, Mileage, Condition,
                              Year, Make, Model, Trim, Drivetrain, Color, Fuel Type, Body Type)
    ColB (flex 1 1 338px min-338):
      DetailRow × 10 fields (State, City, Street, Zip, Dealer, Price, Days on Lot,
                              Days to Sell, Price to Market, Priority, Status)
```

**Responsive breakpoints (detected via `window.innerWidth`):**
- `narrow`: < 1200px → image and data at 50/50 split
- `mobile`: < 768px → fully stacked (each section `flex: 1 1 100%`)

**Hero image behavior:**
- `imageMode === 'generated'` → `vg.angles[activeAngle]` (AI composite) → `object-cover`
- `imageMode === 'source'` → `vg.sourceAngles[activeAngle]` → `object-contain`
- On image error (`onError={() => setHeroError(true)}`): if in generated mode and `vg.sourceAngles` exists, automatically switches to source mode
- No vehicleGroup: shows plain `record.thumbnail`

**Generated/Source toggle chips (absolute overlay on hero):**
- `h-[24px] px-[8px] rounded-[8px] text-[11px] Roboto Normal`
- Active: `bg-[#dddce0] text-[#1f1d25]`
- Inactive: `bg-[rgba(244,245,246,0.80)] text-[#9c99a9]`

**DetailRow anatomy:**
```
flex items-center gap-[8px] py-[8px]
border-b border-[rgba(0,0,0,0.12)]
  <span style={{width: 72, minWidth: 72}} caption text-[rgba(0,0,0,0.6)]>
    {label}
  </span>
  <div flex-1 min-w-0>
    {children}  ← value content
    [tooltip if truncated URL]
  </div>
  [copy button — absolute right, gradient overlay, opacity 0→1 on row hover]
```

Copy button: 28×28 rounded-full, shows clipboard icon SVG. On click: `navigator.clipboard.writeText()` + snackbar "Copied to Clipboard".

**Config Used row:**
- OEM users: clickable purple link + trash button (dispatches `constellation:open-config` custom event)
- Dealer users: plain text
- If config was deleted but `vehicleGroup` exists: shows "Config removed" italic + trash button

### AngleStripVin in VIN Detail

Uses `AngleStripVin` with `showSource={imageMode === 'source'}`. Clicking a card calls `onActiveChange(key)` which sets `activeAngle` state, which drives the hero image update. The active card shows `border-[#473bab] ring-[2px]` highlight.

---

## 9. AI Config Integration

### GlobalAIConfigMenu

**File:** `GlobalAIConfigMenu.tsx`

Dropdown menu for AI Config management rows. Actions:
1. Download Background
2. Duplicate
3. Enable AI Config
4. Edit (→ `onRowClick`)
5. Remove (→ `removeConfig` from `useInventory()`)

Portal-mounted to `document.body`, positioned via `fixed top/right` from `anchor` object `{top: rect.bottom + 4, right: window.innerWidth - rect.right}`.

Close behavior: click outside (pointer event capture) or Escape keydown.

### PromptLibraryModal

**File:** `PromptLibraryModal.tsx`

GenAI prompt library for the AI Config editor. 15 prompt entries across 5 active categories.

**Layout:** 1000px wide modal, max-h-[80vh]
- Left sidebar: 200px category filter (category buttons)
- Right main: search + 4-column card grid

**Categories** (from `data/prompts.ts`):
| ID | Label |
|---|---|
| `outdoor` | Outdoor Scenes |
| `oem` | OEM Studio |
| `racing` | Racing |
| `adventure` | Adventure |
| `lifestyle` | Lifestyle |
| `fx` | FX |

**Prompt entries** (15 total in `PROMPT_LIBRARY`):
- 5 outdoor scenes (desert dunes, alpine trail, muddy forest, red rock canyon, snowy pine)
- 3 racing (pit lane, track motion blur, night circuit)
- 4 adventure (desert dunes, forest trail, mountain summit, river crossing)
- 2 lifestyle (coastal highway, urban dusk)
- 1 FX (speed lines)

**Filter logic:**
- By category: exact match on `p.category`
- By search: `p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)`

**Selected card state:** `border-[#6356e1] bg-[#473bab]/[0.08] ring-2 ring-[#6356e1]/30`

**Insert Prompt:** Calls `onInsert(entry.prompt)` with the full prompt text. The AI Config editor receives this and populates the prompt field.

### AI Config ↔ VIN Relationship

```
AI_CONFIGS (AIConfigRecord[])
  └── vehicleGroups?: VehicleGroup[]   ← expandable YMMTC rows in DataGrid

VEHICLE_INVENTORY (VinInventoryRecord[])
  └── aiConfigId?: string              ← references AI_CONFIGS[x].id
  └── vehicleGroup?: VehicleGroup      ← copy of the specific group for this VIN
  └── aiConfigApplied: boolean         ← true when config is active for this VIN
```

When `aiConfigApplied=true`, the VIN row shows the hero angle (`angles['34l']`) as thumbnail instead of the plain vehicle photo.

---

## 10. Key Patterns

### 10a. View Mode Toggle

- **Owned by:** `InventoryContent` (`useState<ViewMode>`)
- **Stored in:** React component state (not URL, not localStorage)
- **Default:** `'table-large'`
- **Trigger:** Single button click on `ToolbarIconBtn` → `cycleView()` callback
- **Cycle order:** `table-large → vertical-cards → horizontal-cards → table-small → table-large`
- **Icon on button:** Shows `NextIcon` (icon for next destination, not current)

### 10b. Selection State

- Owned by `InventoryContent`
- `Set<string>` of record IDs
- `handleToggleRow(id, checked)`: adds/removes from set
- `handleToggleAll(checked)`: fills with all `records.map(r => r.id)` or clears
- Passed to all view components as `selected: Set<string>` prop

### 10c. Filter Composition

Current implementation: single search text box, no discrete filter chips. The search matches against 10 fields with OR logic (any field contains the query).

The `VinFilters` type exists for AI Config filtering, not for live inventory filtering. It supports both multi-select arrays and legacy single-select fields. Multi-select arrays take precedence when non-empty.

### 10d. Client-Side Sort

**No client-side sorting is implemented.** The `ArrowDownIcon` in table headers is a UI-only decoration. Data appears in `VEHICLE_INVENTORY` array order.

### 10e. Thumbnail Lazy Loading Pattern

`VehicleInventoryGrid` uses the `ThumbnailImg` inline component:
- No IntersectionObserver or lazy loading
- Images load immediately when rendered
- Error → fallback to `fallbackSrc` (plain vehicle image)
- Scale auto-computed on `onLoad` for non-AI images

`VehicleCardGrid` and `VehicleCardList` use raw `<img>` elements with no lazy loading.

### 10f. AngleBar Integration

`AngleBar` is for the **AI Config editor**, not the inventory grid. It controls:
- `currentIndex`: which of the 6 angles is selected for rendering
- `multiAngleEnabled`: whether multi-angle mode is on
- `viewMode`: 'single' | 'grid' (single preview vs. 6-up grid)

The angle strip in the inventory context is `AngleStripVin` (VIN Detail) and `AnglesSource` (DataGrid expansion).

### 10g. Drag-to-Reorder in AnglesSource / AngleStripVin

HTML5 drag API (`draggable`, `onDragStart`, `onDragOver`, `onDrop`, `onDragEnd`).

State pattern:
```typescript
const [orderedIndices, setOrderedIndices] = useState<number[]>([0,1,2,3,4,5]);
const [dragSrcDisplayIdx, setDragSrcDisplayIdx] = useState<number | null>(null);
const [insertAtIdx, setInsertAtIdx] = useState<number | null>(null);

// liveOrder: computed preview during drag using useMemo
const liveOrder = useMemo(() => {
  if (dragSrcDisplayIdx === null || insertAtIdx === null || dragSrcDisplayIdx === insertAtIdx)
    return orderedIndices;
  const next = [...orderedIndices];
  const [moved] = next.splice(dragSrcDisplayIdx, 1);
  const insertPos = insertAtIdx > dragSrcDisplayIdx ? insertAtIdx - 1 : insertAtIdx;
  next.splice(insertPos, 0, moved);
  return next;
}, [dragSrcDisplayIdx, insertAtIdx, orderedIndices]);
```

On drop: `setOrderedIndices(liveOrder)` commits the new order. `onOrderChange?.(liveOrder.map(i => ANGLE_CONFIGS[i].key))` fires with new `AngleKey[]`.

**First item in order is always Hero.** Other components check `liveOrder[0] === cfgIdx` to determine hero status.

---

## 11. MUI Migration Notes

### 11a. View Mode → MUI Components

#### Table Large (`VehicleInventoryGrid`) → MUI Table or DataGrid

**Option A: MUI `Table` (recommended for design fidelity):**
```tsx
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableContainer from '@mui/material/TableContainer';
```

Map directly: `<table>` → `<Table>`, `<thead>` → `<TableHead>`, `<tbody>` → `<TableBody>`, `<tr>` → `<TableRow>`, `<td>` → `<TableCell>`.

**Sticky header:**
```tsx
<TableContainer sx={{ maxHeight: '100%', overflow: 'auto' }}>
  <Table stickyHeader>
```

**Row heights:** Set via `sx={{ height: 90 }}` on `TableRow` (Table Large) or `sx={{ height: 52 }}` (Table Condensed).

**Drag-resize columns:** Not built into MUI Table. Implement with the same `mousedown/mousemove/mouseup` listener pattern used in the source.

**Option B: `@mui/x-data-grid`:**
- Built-in resize, sorting, selection — but requires overriding many defaults for pixel-perfect match
- Not recommended if design fidelity is the priority

**Sort label:**
```tsx
import TableSortLabel from '@mui/material/TableSortLabel';
// In header cell:
<TableSortLabel active={false} direction="asc">
  {label}
</TableSortLabel>
```
Note: source has no working sort, only the icon. Use `TableSortLabel` with `active={false}` to display the icon without sort behavior, or implement sort on top.

#### Card Vertical (`VehicleCardGrid`) → MUI Grid2

```tsx
import Grid from '@mui/material/Grid';
// or Grid2 in MUI v5+

<Grid container spacing={1.5} columns={5}>
  {records.map(r => (
    <Grid item xs={1} key={r.id}>
      <VerticalCard record={r} />
    </Grid>
  ))}
</Grid>
```

Column gap `12px` = `spacing={1.5}` (MUI spacing unit = 8px, 1.5×8=12). Row gap `20px` ≈ `rowSpacing={2.5}`.

**Image 1:1 aspect ratio:**
```tsx
<Box sx={{ aspectRatio: '1/1', overflow: 'hidden', borderRadius: '12px' }}>
  <img style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
</Box>
```

#### Card Horizontal (`VehicleCardList`) → MUI Grid2 auto-fill

```tsx
<Grid container spacing={2}>
  {records.map(r => (
    <Grid item key={r.id} xs={12} sm={6} md={4}>
      <HorizontalCard record={r} />
    </Grid>
  ))}
</Grid>
```
Or use CSS grid `repeat(auto-fill, minmax(320px, 1fr))` via `sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 2 }}`.

#### Condensed Table (`VehicleTableCondensed`) → same Table approach as Large

Same structure, different row height (52px) and thumbnail size (38px). Implement row entrance stagger animation via CSS `animation-delay` on rows (see section 11e).

### 11b. Checkbox and Selection → MUI Checkbox

```tsx
import Checkbox from '@mui/material/Checkbox';

// Standard row checkbox:
<Checkbox
  checked={isSelected}
  onChange={e => onToggleRow(record.id, e.target.checked)}
  sx={{ color: 'rgba(17,16,20,0.38)', '&.Mui-checked': { color: '#473bab' }, p: '9px' }}
  size="small"
/>

// Select-all with indeterminate:
<Checkbox
  checked={allSelected}
  indeterminate={someSelected}
  onChange={e => onToggleAll(e.target.checked)}
  sx={{ '&.MuiCheckbox-indeterminate': { color: '#473bab' } }}
  size="small"
/>
```

### 11c. Status Chips → MUI Chip

**AIGenerationChip:**
```tsx
import Chip from '@mui/material/Chip';

// Enabled:
<Chip
  icon={<CheckCircleOutlineIcon sx={{ color: '#4CAF50 !important', fontSize: 14 }} />}
  label="Enabled"
  size="small"
  sx={{ bgcolor: 'rgb(232,245,233)', color: '#1b5e20', height: 24, borderRadius: '8px',
        fontSize: 11, fontFamily: 'Roboto', letterSpacing: '0.4px' }}
/>

// Disabled:
<Chip
  icon={<PauseIcon sx={{ color: '#686576 !important', fontSize: 14 }} />}
  label="Disabled"
  size="small"
  sx={{ bgcolor: 'rgba(17,16,20,0.08)', color: '#686576', height: 24, borderRadius: '8px',
        fontSize: 11, fontFamily: 'Roboto', letterSpacing: '0.4px' }}
/>
```

**SyndicationChip (Syndicated):**
```tsx
<Chip
  icon={/* signal SVG */}
  label="Syndicated"
  size="small"
  sx={{ bgcolor: 'rgba(99,86,225,0.12)', color: '#6356e1', height: 24, borderRadius: '8px',
        fontSize: 11, fontFamily: 'Roboto' }}
/>
```

**PriceToMarketChip (outlined):**
```tsx
<Chip
  icon={/* chevron SVG based on value */}
  label={label}
  variant="outlined"
  size="small"
  sx={{ borderColor: borderColor, color: '#686576', height: 24, borderRadius: '8px',
        fontSize: 11, fontFamily: 'Roboto' }}
/>
```

**PriorityScoreChip:**
```tsx
<Box sx={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
           bgcolor: PRIORITY_COLORS[score], borderRadius: '8px', p: '2px' }}>
  <Typography sx={{ px: '6px', fontSize: 13, color: 'white', fontFamily: 'Roboto' }}>
    {score}
  </Typography>
</Box>
```

### 11d. View Mode Toggle → MUI ToggleButtonGroup

The source uses a single cycling button, not a toggle group. For MUI, use `ToggleButtonGroup` if you want all options visible:

```tsx
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ToggleButton from '@mui/material/ToggleButton';

<ToggleButtonGroup
  value={viewMode}
  exclusive
  onChange={(_, val) => val && setViewMode(val)}
  size="small"
>
  <ToggleButton value="table-large" sx={{ p: '5px', borderRadius: '100px' }}>
    <IconTableLarge />
  </ToggleButton>
  ...
</ToggleButtonGroup>
```

Or to preserve the single-button cycle behavior:
```tsx
<IconButton onClick={cycleView} title={cur.label} sx={{ p: '5px', borderRadius: '100px' }}>
  <cur.NextIcon />
</IconButton>
```

### 11e. Animations → MUI/CSS Replacements

#### View Mode Fade Transition

Replace `<AnimatePresence>` + `motion.div` with MUI `Fade`:

```tsx
import Fade from '@mui/material/Fade';

{viewMode === 'table-large' && (
  <Fade in={viewMode === 'table-large'} timeout={400} unmountOnExit>
    <Box sx={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
      <VehicleInventoryGrid ... />
    </Box>
  </Fade>
)}
```

Or use CSS transitions with `React.Transition` from `react-transition-group`:
```tsx
<CSSTransition in={viewMode === 'table-large'} timeout={400} classNames="fade" unmountOnExit>
```
```css
.fade-enter { opacity: 0; }
.fade-enter-active { opacity: 1; transition: opacity 400ms ease-out; }
.fade-exit { opacity: 1; }
.fade-exit-active { opacity: 0; transition: opacity 400ms ease-out; }
```

#### Layout Morphing (layoutId equivalents)

framer-motion `layoutId` has no direct MUI equivalent. Options:

1. **Drop layout morphing**: Simply fade between views without element morphing. This is the pragmatic MUI approach.

2. **CSS View Transitions API** (modern browsers):
```javascript
document.startViewTransition(() => setViewMode(newMode));
```
```css
.thumbnail { view-transition-name: thumb-vin01; }
```

3. **FLIP animation** (calculate positions before/after, animate the delta):
```javascript
// Record positions before transition
const rects = elements.map(el => el.getBoundingClientRect());
// Change state
setViewMode(newMode);
// After paint, compute delta and animate
requestAnimationFrame(() => {
  elements.forEach((el, i) => {
    const newRect = el.getBoundingClientRect();
    const dx = rects[i].left - newRect.left;
    const dy = rects[i].top - newRect.top;
    el.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'none' }], {
      duration: 400, easing: 'ease-out'
    });
  });
});
```

#### Row Entrance Stagger (Table Condensed)

Replace `motion.tr initial/animate/transition` with CSS `@keyframes` + `animation-delay`:

```css
@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}
.table-row {
  animation: fadeIn 120ms ease-out forwards;
  opacity: 0;
}
```

In MUI `sx`:
```tsx
<TableRow
  sx={{
    animation: 'fadeIn 120ms ease-out forwards',
    animationDelay: `${Math.min(index * 8, 250)}ms`,
    opacity: 0,
    '@keyframes fadeIn': { from: { opacity: 0 }, to: { opacity: 1 } },
  }}
>
```

#### Expand Row Animation (grid-template-rows)

```tsx
// Pure CSS approach — no framer-motion needed
<Box
  sx={{
    display: 'grid',
    gridTemplateRows: isExpanded ? '1fr' : '0fr',
    transition: 'grid-template-rows 350ms ease-out',
  }}
>
  <Box sx={{ overflow: 'hidden' }}>
    <YMMTCItems ... />
  </Box>
</Box>
```

Or use MUI `Collapse`:
```tsx
import Collapse from '@mui/material/Collapse';

<Collapse in={isExpanded} timeout={350}>
  <YMMTCItems ... />
</Collapse>
```
Note: MUI `Collapse` uses `height` transition, not `grid-template-rows`. Visual result is similar.

#### Dropdown Menu Slide-Down

Replace CSS keyframe animation with MUI `Menu` or `Popper` + `Grow`:
```tsx
import Menu from '@mui/material/Menu';
import Grow from '@mui/material/Grow';

<Menu
  open={!!openMenu}
  anchorEl={anchorEl}
  TransitionComponent={Grow}
  TransitionProps={{ timeout: 450, style: { transformOrigin: 'top right' } }}
  PaperProps={{
    sx: {
      width: 220,
      borderRadius: '4px',
      boxShadow: '0 5px 5px -3px rgba(0,0,0,0.20), 0 8px 10px 1px rgba(0,0,0,0.14), 0 3px 14px 2px rgba(0,0,0,0.12)',
    },
  }}
>
```

For exact `-8px translateY` slide-down, customize with `sx`:
```tsx
// Inside Paper sx:
'@keyframes menuSlide': {
  from: { opacity: 0, transform: 'translateY(-8px)' },
  to: { opacity: 1, transform: 'translateY(0px)' },
},
animation: 'menuSlide 450ms ease-out forwards',
```

#### Tooltip Slide-Up

Replace inline state-driven tooltip with MUI `Tooltip`:
```tsx
import Tooltip from '@mui/material/Tooltip';

<Tooltip
  title={label}
  placement="top"
  TransitionProps={{ timeout: 200 }}
  componentsProps={{
    tooltip: {
      sx: {
        bgcolor: 'rgba(31,29,37,0.90)',
        backdropFilter: 'blur(2px)',
        borderRadius: '6px',
        fontSize: 11,
        fontWeight: 500,
        letterSpacing: '0.15px',
        px: '10px',
        py: '5px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.28)',
      },
    },
    arrow: { sx: { color: 'rgba(31,29,37,0.90)' } },
  }}
  arrow
>
```

For the `angle chip tooltip` (450ms duration, translateY 8px → 0px), match MUI's default Fade with custom timing:
```tsx
<Tooltip TransitionProps={{ timeout: 450 }}>
```

#### PromptLibraryModal Animation

Replace `motion.div` with MUI `Dialog` + `Zoom` or `Grow`:
```tsx
import Dialog from '@mui/material/Dialog';
import Zoom from '@mui/material/Zoom';

<Dialog
  open={open}
  TransitionComponent={Zoom}
  TransitionProps={{ timeout: 250 }}
  maxWidth="lg"
  PaperProps={{
    sx: {
      width: 1000,
      maxHeight: '80vh',
      borderRadius: '12px',
    },
  }}
>
```

Backdrop:
```tsx
<Dialog
  slotProps={{
    backdrop: {
      sx: { bgcolor: 'rgba(0,0,0,0.40)', backdropFilter: 'blur(2px)' },
      TransitionProps: { timeout: 200 },
    },
  }}
>
```

#### AnglePreviewModal → MUI Dialog

```tsx
import Dialog from '@mui/material/Dialog';

<Dialog
  open={isOpen}
  onClose={onClose}
  maxWidth={false}
  PaperProps={{
    sx: {
      width: 739,
      maxWidth: '95vw',
      borderRadius: '12px',
      overflow: 'hidden',
      boxShadow: '0px 8px 32px rgba(0,0,0,0.24)',
    },
  }}
>
```

Note: Source has no animation on AnglePreviewModal. MUI Dialog has a default Fade in/out — keep it or disable with `TransitionComponent={NoTransition}`.

### 11f. Thumbnail → MUI Skeleton

```tsx
import Skeleton from '@mui/material/Skeleton';

// While image loads:
{!loaded && <Skeleton variant="rectangular" width={76} height={76} />}
<img
  src={src}
  onLoad={() => setLoaded(true)}
  style={{ display: loaded ? 'block' : 'none' }}
/>
```

For the gray fallback background (no skeleton, just static gray):
```tsx
<Box sx={{ width: 76, height: 76, bgcolor: '#f0f2f4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
  {src ? <img ... /> : <VehicleSilhouetteSvg />}
</Box>
```

### 11g. Kebab Menu → MUI Menu Portal

```tsx
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

<Menu
  open={!!openMenu}
  onClose={() => setOpenMenu(null)}
  anchorReference="anchorPosition"
  anchorPosition={openMenu ? { top: openMenu.anchor.top, left: window.innerWidth - openMenu.anchor.right } : undefined}
  PaperProps={{ sx: { width: 220, borderRadius: '4px' } }}
>
  <MenuItem onClick={() => handleAction('syndicate')} sx={{ height: 36, px: 0, pr: 2 }}>
    <ListItemIcon sx={{ width: 36, minWidth: 36, justifyContent: 'center' }}>
      <img src={iconSignal} width={18} height={18} />
    </ListItemIcon>
    <ListItemText primaryTypographyProps={{ sx: { fontSize: 14, fontFamily: 'Roboto' } }}>
      {syndicationStatus === 'syndicated' ? 'Turn Syndicate Off' : 'Syndicate'}
    </ListItemText>
  </MenuItem>
  ...
</Menu>
```

The source uses `createPortal` to mount menus at `document.body`. MUI `Menu` does this automatically via `Portal`.

### 11h. Angle Strip → MUI ImageList

```tsx
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';

// AnglesSource (90×90 cards):
<ImageList cols={6} rowHeight={90} gap={16} sx={{ width: 620, height: 118 }}>
  {orderedAngles.map(angle => (
    <ImageListItem key={angle.key}>
      <AngleCard ... />
    </ImageListItem>
  ))}
</ImageList>

// AngleStripVin (64×64 cards):
<ImageList cols={6} rowHeight={64} gap={16} sx={{ flexWrap: 'wrap' }}>
```

Or use plain `Box` with `display: flex` and `flexWrap: wrap` (as used in source for `AngleStripVin`).

### 11i. Filter Bar → MUI Chip with onDelete

```tsx
import Chip from '@mui/material/Chip';

// Filter applied chip:
<Chip
  label={formatFilterLabel(filters)}
  onDelete={() => removeFilter(i)}
  size="small"
  sx={{ bgcolor: 'rgba(17,16,20,0.04)', color: '#1f1d25', borderRadius: '8px',
        height: 24, fontSize: 11, fontFamily: 'Roboto', letterSpacing: '0.16px' }}
/>
```

### 11j. Sort Headers → MUI TableSortLabel

```tsx
import TableSortLabel from '@mui/material/TableSortLabel';

<TableSortLabel
  active={sortField === col.key}
  direction={sortDirection}
  onClick={() => handleSortClick(col.key)}
  sx={{
    '& .MuiTableSortLabel-icon': { color: 'rgba(17,16,20,0.56) !important', fontSize: 18 },
    fontFamily: 'Roboto',
    fontWeight: 500,
    fontSize: 14,
    color: '#1f1d25',
  }}
>
  {col.label}
</TableSortLabel>
```

### 11k. Theme — Color Token Mapping

Map source CSS literals to MUI `theme.palette`:

| Source Value | Usage | MUI Token Suggestion |
|---|---|---|
| `#473bab` | Primary brand purple (links, checkboxes, active states) | `theme.palette.primary.main` |
| `#6356e1` | Lighter brand purple (hover borders, divider hover) | `theme.palette.primary.light` |
| `#1f1d25` | Primary text color | `theme.palette.text.primary` |
| `rgba(17,16,20,0.56)` | Secondary text / muted icons | `theme.palette.text.secondary` |
| `rgba(17,16,20,0.38)` | Disabled / placeholder text | `theme.palette.text.disabled` |
| `#686576` | Caption / label text | Custom: `theme.palette.grey[600]` |
| `#f0f2f4` | Thumbnail background | Custom: `theme.palette.grey[100]` |
| `#f9fafa` | Subtle background (YMMTC row bg) | Custom: `theme.palette.grey[50]` |
| `rgba(0,0,0,0.12)` | Divider / border | `theme.palette.divider` |
| `#4CAF50` | AI Generation enabled green | `theme.palette.success.main` |
| `#1b5e20` | AI Generation enabled dark green text | `theme.palette.success.dark` |
| `rgb(232,245,233)` | AI Generation enabled bg | `theme.palette.success.light` (adjust) |
| `rgba(99,86,225,0.08)` | Selected row background | Custom: `alpha(primary.main, 0.08)` |
| `rgba(99,86,225,0.12)` | Selected row hover background | Custom: `alpha(primary.main, 0.12)` |
| `rgba(31,29,37,0.04)` | Row hover / subtle bg | `theme.palette.action.hover` |
| `#d2323f` | Error red (Meta badge) | `theme.palette.error.main` |

**MUI theme setup:**
```typescript
import { createTheme, alpha } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#473bab',
      light: '#6356e1',
    },
    text: {
      primary: '#1f1d25',
      secondary: 'rgba(17,16,20,0.56)',
      disabled: 'rgba(17,16,20,0.38)',
    },
    divider: 'rgba(0,0,0,0.12)',
    action: {
      hover: 'rgba(31,29,37,0.04)',
      selected: 'rgba(99,86,225,0.08)',
    },
  },
  typography: {
    fontFamily: "'Roboto', sans-serif",
  },
});
```

### 11l. Typography Scale Mapping

| Source Class | Font Size | Weight | Line Height | Tracking | MUI Variant |
|---|---|---|---|---|---|
| `HEADER_LABEL` | 14px | 500 (medium) | 24px | 0.17px | `subtitle2` (adjust) |
| `BODY2` | 12px | 400 (normal) | 1.43 | 0.17px | `body2` |
| `CAPTION` | 11px | 400 (normal) | 1.66 | 0.40px | `caption` (adjust font-size 12→11) |
| `BODY1` (VinDetail) | 14px | 400 (normal) | 1.5 | 0.15px | `body1` |
| `SUB2` (VinDetail) | 14px | 500 (medium) | 1.57 | 0.10px | `subtitle2` |
| H1 (page title) | 16px | 500 (medium) | 1.5 | 0.15px | `h6` |
| Tab labels | 14px | 500 (medium) | 24px | 0.40px | `button` |

MUI `caption` is 12px by default. Override to 11px:
```typescript
typography: {
  caption: { fontSize: '0.6875rem', letterSpacing: '0.4px', lineHeight: 1.66 },
}
```

### 11m. Hover States in MUI sx

Replace Tailwind `hover:` classes with MUI `sx` `'&:hover'`:

```tsx
// Row hover background:
<TableRow sx={{
  height: 90,
  bgcolor: isSelected ? 'rgba(99,86,225,0.08)' : 'white',
  '&:hover': {
    bgcolor: isSelected ? 'rgba(99,86,225,0.12)' : 'rgba(31,29,37,0.04)',
  },
  transition: 'background-color 150ms ease-in-out',
  cursor: 'pointer',
}}>

// Card border hover:
<Box sx={{
  border: '1px solid',
  borderColor: isSelected ? '#473bab' : '#e7e7e9',
  '&:hover': { borderColor: '#473bab' },
  transition: 'border-color 150ms',
}}>
```

### 11n. Sticky Kebab Column

The zero-width sticky column pattern:
```tsx
<TableCell
  sx={{
    position: 'sticky',
    right: 0,
    zIndex: 2,
    p: 0,
    width: 0,
    minWidth: 0,
    border: 0,
  }}
>
  <Box
    sx={{
      position: 'absolute',
      right: 0,
      top: 0,
      bottom: 0,
      display: 'flex',
      alignItems: 'center',
      visibility: 'hidden',
      '.group:hover &': { visibility: 'visible' },
      pointerEvents: 'none',
    }}
  >
    {/* 80px gradient fade */}
    <Box sx={{ height: '100%', width: 80, background: `linear-gradient(to right, transparent, ${hoverBg})` }} />
    {/* Solid slab + button */}
    <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', pr: '8px', bgcolor: hoverBg, pointerEvents: 'auto' }}>
      <IconButton size="small" onClick={openMenu} sx={{ bgcolor: 'white', width: 32, height: 32 }}>
        <MoreVertIcon fontSize="small" />
      </IconButton>
    </Box>
  </Box>
</TableCell>
```

Note: MUI doesn't have a `group-hover` selector. Use CSS custom data attributes or a custom class:
```tsx
<TableRow
  className="data-table-row"
  sx={{
    '&:hover .kebab-overlay': { visibility: 'visible' },
  }}
>
  ...
  <Box className="kebab-overlay" sx={{ visibility: 'hidden' }}>
```

### 11o. AnglePreviewModal Tabs → MUI Tabs

```tsx
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

<Tabs
  value={tab}
  onChange={(_, v) => setTab(v)}
  sx={{
    '& .MuiTab-root': {
      fontSize: 14, fontFamily: 'Roboto', letterSpacing: '0.15px',
      color: 'rgba(17,16,20,0.38)', minHeight: 52, px: '4px', mr: 2,
    },
    '& .Mui-selected': { color: '#473bab' },
    '& .MuiTabs-indicator': { bgcolor: '#473bab' },
  }}
>
  {visibleTabs.map(t => (
    <Tab key={t.id} value={t.id} label={t.label} disableRipple />
  ))}
</Tabs>
```

### 11p. VehiclesMenu Actions → MUI MenuItem with Icon

```tsx
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';

<Divider sx={{ my: 1 }} />

<MenuItem
  onClick={handleAction}
  sx={{
    height: 36,
    pl: 0,
    pr: 2,
    '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' },
    '&:active': { bgcolor: 'rgba(0,0,0,0.08)' },
  }}
>
  <ListItemIcon sx={{ width: 36, minWidth: 36, justifyContent: 'center' }}>
    <img src={iconSrc} width={18} height={18} />
  </ListItemIcon>
  <ListItemText
    primary={label}
    primaryTypographyProps={{
      sx: { fontSize: 14, fontFamily: 'Roboto', fontWeight: 400, lineHeight: '21px', color: '#1f1d25' }
    }}
  />
</MenuItem>
```

### 11q. PromptLibraryModal → MUI Dialog with Sidebar

```tsx
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

<Dialog open={open} onClose={onClose} maxWidth={false} PaperProps={{ sx: { width: 1000, maxHeight: '80vh', borderRadius: '12px' } }}>
  <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 2 }}>
    <Box sx={{ color: '#6356e1' }}>{GENAI_ICON}</Box>
    <Typography sx={{ flex: 1, fontSize: 16, fontWeight: 500, color: '#1f1d25' }}>GenAI Prompt Library</Typography>
    <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
  </DialogTitle>

  <DialogContent dividers sx={{ p: 0, display: 'flex' }}>
    {/* Sidebar 200px */}
    <Box sx={{ width: 200, borderRight: '1px solid', borderColor: 'divider', p: 1.5, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
      {/* Category buttons */}
    </Box>

    {/* Main */}
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
      {/* Search bar */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', p: '12px 20px', borderBottom: '1px solid', borderColor: 'divider' }}>
        ...
      </Box>
      {/* 4-col card grid */}
      <Box sx={{ flex: 1, overflow: 'auto', p: '20px' }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1.5 }}>
          {filtered.map(entry => <PromptCard key={entry.id} entry={entry} ... />)}
        </Box>
      </Box>
    </Box>
  </DialogContent>

  <DialogActions sx={{ px: 3, py: 2 }}>
    <Button variant="outlined" onClick={onClose} size="small">Cancel</Button>
    <Button variant="contained" disabled={!selectedId} onClick={handleInsert} size="small" sx={{ bgcolor: '#473bab', '&:hover': { bgcolor: '#3c3192' } }}>
      Insert Prompt
    </Button>
  </DialogActions>
</Dialog>
```

### 11r. Backdrop for Source Images Modal → MUI Backdrop

```tsx
import Backdrop from '@mui/material/Backdrop';

<Backdrop
  open={!!sourceImagesVinId}
  onClick={closeModal}
  sx={{ zIndex: 500, bgcolor: 'rgba(0,0,0,0.40)', backdropFilter: 'blur(2px)' }}
/>
```

### 11s. Search Input → MUI TextField

```tsx
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import SearchIcon from '@mui/icons-material/Search';

<TextField
  value={search}
  onChange={e => setSearch(e.target.value)}
  placeholder="Find below"
  size="small"
  InputProps={{
    startAdornment: (
      <InputAdornment position="start">
        <SearchIcon sx={{ fontSize: 14, color: 'rgba(17,16,20,0.38)' }} />
      </InputAdornment>
    ),
  }}
  sx={{
    width: 200,
    '& .MuiInputBase-root': {
      height: 34,
      bgcolor: '#f9fafa',
      borderRadius: '20px',
      fontSize: 12,
      fontFamily: 'Roboto',
    },
    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#cac9cf', borderRadius: '20px' },
    '& .Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#473bab' },
  }}
/>
```

### 11t. Page Tab Bar → MUI Tabs

```tsx
<Tabs
  value={activeTab}
  onChange={(_, v) => setActiveTab(v)}
  sx={{
    minHeight: 41,
    '& .MuiTab-root': {
      fontSize: 14,
      fontWeight: 500,
      fontFamily: 'Roboto',
      letterSpacing: '0.4px',
      textTransform: 'capitalize',
      color: '#686576',
      minHeight: 41,
      px: 2,
      '&.Mui-selected': { color: '#473bab' },
    },
    '& .MuiTabs-indicator': { height: 2, bgcolor: '#473bab', borderRadius: '2px' },
  }}
>
  <Tab value="insights" label="On-Brand Insights" />
  <Tab value="conquest" label="Conquest Insights" />
  <Tab value="vehicles" label="Vehicles" />
</Tabs>
```

### 11u. VIN Detail ColA/B Layout → MUI Grid2

```tsx
<Grid container spacing={3} sx={{ p: 2 }}>
  {/* Hero image */}
  <Grid item xs={12} md={mobile ? 12 : narrow ? 6 : undefined} sx={{ flex: mobile ? '1 1 100%' : '1 1 0%', minWidth: 280 }}>
    {/* hero + AngleStripVin */}
  </Grid>

  {/* Data columns */}
  <Grid item sx={{ flex: mobile ? '1 1 100%' : narrow ? '1 1 0%' : '1 1 338px', maxWidth: narrow ? undefined : 740 }}>
    <Grid container columnSpacing={3}>
      <Grid item sx={{ flex: '1 1 338px', minWidth: 338 }}>
        {/* ColA detail rows */}
      </Grid>
      <Grid item sx={{ flex: '1 1 338px', minWidth: 338 }}>
        {/* ColB detail rows */}
      </Grid>
    </Grid>
  </Grid>
</Grid>
```

### 11v. YMMTC Accordion → MUI Accordion

```tsx
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

<Accordion
  expanded={expandedId === group.id}
  onChange={() => handleToggle(group.id)}
  disableGutters
  elevation={0}
  sx={{
    borderTop: '1px solid rgba(0,0,0,0.08)',
    '&:before': { display: 'none' },
    bgcolor: '#f9fafa',
  }}
>
  <AccordionSummary
    expandIcon={<ExpandMoreIcon sx={{ color: 'rgba(17,16,20,0.56)', fontSize: 16 }} />}
    sx={{
      height: 56,
      pl: '40px',
      pr: 2,
      '&:hover': { bgcolor: 'rgba(17,16,20,0.04)' },
      '& .MuiAccordionSummary-expandIconWrapper': {
        transition: 'transform 300ms ease-out',
        '&.Mui-expanded': { transform: 'rotate(90deg)' },
      },
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%' }}>
      <img src={group.thumbnail} style={{ width: 60, height: 38, objectFit: 'contain' }} />
      <Typography sx={{ flex: 1, fontSize: 12, fontFamily: 'Roboto', color: '#1f1d25', noWrap: true }}>
        {label}
      </Typography>
      <Typography sx={{ width: 110, fontSize: 12, color: '#686576', fontFamily: 'Roboto' }}>
        {group.source}
      </Typography>
      <StatusBadge status={group.status} />
    </Box>
  </AccordionSummary>
  <AccordionDetails sx={{ p: 0 }}>
    <AnglesSource ... />
  </AccordionDetails>
</Accordion>
```

Note: MUI `Accordion` expansion animation uses `height` CSS property with `300ms`. The source uses `grid-template-rows 300ms ease-out`. Both look very similar — prefer MUI `Collapse` behavior for simplicity.

### 11w. Priority Colors in MUI Theme

Add custom palette entries for the 7 priority score colors:

```typescript
const theme = createTheme({
  palette: {
    // ... other palette
  },
  // Extend via module augmentation
});

// Usage in sx:
const PRIORITY_COLORS = {
  1: '#640808', 2: '#b52520', 3: '#e55e50', 4: '#616161',
  5: '#109890', 6: '#065c56', 7: '#02292c',
};
```

### 11x. Header Divider (drag-resize) in MUI

MUI Table does not have built-in column resize. Implement with the same pattern as source:

```tsx
function ResizeDivider({ prevWidth, onPrevWidthChange }) {
  const handleMouseDown = (e) => {
    const startX = e.clientX;
    const startW = prevWidth;
    const onMove = (ev) => onPrevWidthChange(Math.max(40, startW + (ev.clientX - startX)));
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  return (
    <Box
      onMouseDown={handleMouseDown}
      sx={{
        width: 8, height: '100%', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'col-resize',
        '&:hover .divider-line, &:active .divider-line': { bgcolor: '#6356e1' },
      }}
    >
      <Box className="divider-line" sx={{ width: 1, height: 24, bgcolor: 'rgba(0,0,0,0.12)', transition: 'background-color 150ms' }} />
    </Box>
  );
}
```

---

## Appendix A: Complete Angle Placeholder Image URLs

Default placeholder images for each angle (used when no generated/source image exists):

| Angle Key | Label | Cloudinary URL |
|---|---|---|
| `34l` | 3/4 L | `https://res.cloudinary.com/dvq75cqna/image/upload/v1780071184/vw-funds/inventory/angles/angle-34-l.png` |
| `front` | Front | `https://res.cloudinary.com/dvq75cqna/image/upload/v1780071191/vw-funds/inventory/angles/angle-right.png` |
| `34r` | 3/4 R | `https://res.cloudinary.com/dvq75cqna/image/upload/v1780071186/vw-funds/inventory/angles/angle-34-r.png` |
| `right` | Right | `https://res.cloudinary.com/dvq75cqna/image/upload/v1780071189/vw-funds/inventory/angles/angle-left.png` |
| `rear` | Rear | `https://res.cloudinary.com/dvq75cqna/image/upload/v1780071190/vw-funds/inventory/angles/angle-rear.png` |
| `left` | Left | `https://res.cloudinary.com/dvq75cqna/image/upload/v1780071187/vw-funds/inventory/angles/angle-34-rear.png` |

Note: file names do not match content (legacy naming). `angle-right.png` is actually the front-facing view, etc.

---

## Appendix B: Animation Timing Summary

| Animation | Duration | Easing | Properties | Source |
|---|---|---|---|---|
| View mode crossfade | 400ms | `easeOut` | opacity | `InventoryContent.tsx` AnimatePresence |
| Layout morph (thumb/vin/subtitle) | 400ms | `easeOut` (tween) | position, size (layout) | `LAYOUT_SPRING` in VehicleCardGrid/List |
| Card image hover zoom | 500ms | CSS `ease` | `transform: scale(1.05)` | `VehicleCardGrid.tsx` |
| Card border/shadow hover | 150ms | CSS default | border-color / box-shadow | Tailwind `transition-colors` |
| Checkbox reveal on hover | 200ms | CSS default | opacity | `duration-200` |
| Asset Details eye/overlay | 150ms | CSS default | opacity | `duration-150` |
| Row background hover | 150ms | `ease-in-out` | background-color | Tailwind `transition-colors` |
| Condensed table row entrance | 120ms each | `easeOut` | opacity | framer-motion, 8ms stagger |
| DataGrid row expand | 350ms | `ease-out` | grid-template-rows | CSS |
| VehicleRow AnglesSource expand | 300ms | `ease-out` | grid-template-rows | CSS |
| Expand chevron rotation | 300ms | `ease-out` | `transform: rotate()` | `duration-300 ease-out` |
| Angle card CSS slide (drag) | 300ms | `ease` | `left` (absolute position) | CSS on `AnglesSource` |
| Angle card ghost state | 150ms | CSS default | opacity, scale | `duration-150` |
| Angle card hover actions | 150ms | CSS default | opacity | `transition-opacity` |
| Angle tooltip slide-up | 450ms | `ease` | opacity, translateY | inline style |
| AngleStripVin active ring | 150ms | CSS default | border, box-shadow | `duration-150` |
| VehiclesMenu slide-down | 450ms | `ease-out` | opacity, translateY(-8px→0) | CSS keyframe |
| Toolbar tooltip slide-up | 200ms | `ease` | opacity, translateY(6px→0) | inline style |
| Header divider color | 150ms | CSS default | background-color | Tailwind `transition-colors` |
| PromptLibraryModal backdrop | 200ms | framer default | opacity | framer-motion |
| PromptLibraryModal dialog | 250ms | `cubic-bezier(0.4,0,0.2,1)` | opacity, scale(0.97→1) | framer-motion |
| AnglePreviewModal | none | — | — | instant mount/unmount |

---

## Appendix C: Source File Inventory

All files read for this document:

**Inventory components** (`source/inventory/`):
- `AngleBar.tsx` — angle selector for AI Config editor
- `AngleCard.tsx` — 90×90 angle card with hover actions
- `AnglePreviewModal.tsx` — lightbox modal for angle images
- `AngleStripVin.tsx` — 64×64 angle strip for VIN Detail
- `AnglesSource.tsx` — 6 angle cards in DataGrid accordion
- `DataGrid.tsx` — AI Config management table
- `GlobalAIConfigMenu.tsx` — kebab menu for AI Config rows
- `InventoryContent.tsx` — top-level page component
- `PromptLibraryModal.tsx` — GenAI prompt library modal
- `Thumbnail.tsx` — simple thumbnail for DataGrid rows
- `VehicleCardGrid.tsx` — vertical card grid view
- `VehicleCardList.tsx` — horizontal card list view
- `VehicleInventoryGrid.tsx` — table large view
- `VehicleRow.tsx` — vehicle row inside YMMTC accordion
- `VehicleTableCondensed.tsx` — table condensed view
- `VehiclesMenu.tsx` — kebab menu for vehicle rows
- `VinDetailContent.tsx` — VIN detail page
- `YMMTCItems.tsx` — YMMTC accordion container

**Data files** (`source/data/`):
- `aiConfigs.ts` — 19 AI Config records + `AIConfigRecord` + `SavedFormState` interfaces
- `blueVehicle.ts` — `BLUE_VEHICLE_GROUP` data (Raptor 700R blue AI images)
- `kodiakVehicle.ts` — `KODIAK_VEHICLE_GROUP` data
- `prompts.ts` — 15 prompt entries + 6 categories
- `types.ts` — core interfaces: `VehicleGroup`, `VinFilters`, `AIConfigState`, `PromptEntry`, `AngleKey`
- `vehicleGroups.ts` — `VEHICLE_GROUPS_1/2/3/4` data
- `vehicleInventory.ts` — 61 VIN records + `VinInventoryRecord` interface + derived types
- `vins.ts` — VIN records data
