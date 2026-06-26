# Projects Feature — Architecture & Migration Guide

**Target reader:** Claude Code in the MUI migration repository. This document is the single source of truth for reimplementing the Projects feature set from the vw-funds-2 React/Tailwind codebase in MUI. Read every section before writing a single line of code.

---

## 1. Overview

The Projects feature is a campaign asset-management workspace embedded inside the Constellation VW Funds app. It allows agency users (and dealers) to:

- **Create and manage ad campaigns** as "projects" with a Kanban status board.
- **Select offers** (vehicle lease/finance deals from the catalog) to feature in ads.
- **Select ad templates** (pre-defined banner dimensions and layouts) to apply offers to.
- **Select backgrounds** (scene photography or AI-generated dealer backgrounds) to composite behind vehicle images.
- **Preview and generate ad assets** via a canvas-based compositing engine (JellyBeanCard).
- **Use an AI agent** (Claude claude-sonnet-4-6 streaming via SSE) to do all of the above conversationally in a side pane.
- **Share projects for review** by sending emails or in-platform notifications to contacts.
- **Comment on any entity** (project, template, offer) via a rich-text side panel with @mentions and notifications.

### URL Routing

Projects live at the top-level section route, not a sub-tab:

```
/Volkswagen/dealership/Projects       (dealer)
/OEM/Projects                         (oem)
/Volkswagen/dealership-singular/Projects
```

Deep-linking to a specific project uses a query parameter:

```
/Volkswagen/dealership/Projects?project=<projectId>
```

`AppContent.tsx` reads `location.search` on mount, extracts `project=<id>`, sets `activeAppSection = 'projects'` and forwards `openProjectId` to `ProjectsModule`. When the user navigates into a project, `handleProjectChange(id, name)` calls `navigate(buildUrl(...) + '?project=' + id)` to keep the URL in sync. Closing a project removes the query param.

The `buildUrl(role, clientId, tabId)` utility in `routing.ts` maps role + client + tab to the correct pathname. `TAB_SLUGS` contains `'projects': 'Projects'`. `SLUG_TO_TAB` is the reverse map used when parsing the URL on load.

---

## 2. Component Tree

```
AppContent
└── CommentsProvider (contextId = project UUID or "projects-main")
    └── ProjectsModule (lazy-loaded)
        └── ProjectStoreProvider
            └── RightPanelProvider
                └── SidebarProvider
                    └── ProjectsModuleInner
                        ├── ProjectsListView          (when no project selected)
                        │   ├── CreateProjectDialog
                        │   └── ProjectCard × N       (Kanban board, 4 columns)
                        └── ProjectDetailView         (when project selected)
                            ├── ProjectsHeader
                            │   └── CommentsButton
                            ├── ProjectAccordionSection "offers"
                            │   ├── OffersPage
                            │   │   ├── OfferCard × N
                            │   │   └── BrowseOffersDialog
                            ├── ProjectAccordionSection "templates"
                            │   ├── TemplatesPage
                            │   │   ├── TemplateCard × N
                            │   │   │   ├── TemplatePreview (ResizeObserver-scaled wireframe)
                            │   │   │   └── TemplatePreviewModal (createPortal lightbox)
                            │   │   └── SelectTemplateDialog
                            ├── ProjectAccordionSection "backgrounds" / "logos-backgrounds"
                            │   └── LogosBackgroundsPage
                            │       ├── OfferAccordion × N
                            │       │   ├── StyleOverrideButtons (logo + color swatches)
                            │       │   └── TemplateThumbnailRow × N
                            │       ├── CombinationAccordion (multi-product)
                            │       ├── DataRowAccordion (pharma)
                            │       ├── BackgroundCollectionCard × N
                            │       ├── SelectBackgroundDialog
                            │       ├── LogoPicker (popover)
                            │       └── EditBackgroundModal (AI background editing)
                            ├── ProjectAccordionSection "preview"
                            │   └── PreviewPage
                            │       └── JellyBeanCard × N   (canvas composite)
                            ├── ProjectAccordionSection "assets" / "adshells"
                            │   └── AdShellsPage
                            └── ProjectAccordionSection "campaigns"
                                └── CampaignsPage

ProjectAgentPane (rendered in AppContent right pane, separate from ProjectsModule)
├── ConstellationArcMark (animated logo)
├── Thread history sidebar
├── AgentInput (text + file upload)
└── Message list
    ├── TextMessage (MarkdownContent renderer)
    ├── ToolChipMsg (tool-call pill)
    ├── SetupProjectCard
    ├── OffersProposalCard
    ├── TemplatesProposalCard
    ├── BrandProposalCard
    ├── BackgroundsProposalCard
    ├── GenerateAssetsSmartCard
    ├── ReviewerPickerCard
    ├── ShareChooserCard
    ├── TaskOwnersCard
    ├── NotifyOwnersCard
    ├── ParsedOffersCard (file extraction)
    ├── DealerBgProposalCard
    ├── CampaignCtaCard
    └── ProactiveWidgets (ProactiveAutoApplyBar, ProactiveQuestionsCard)

CommentsSidePanel (rendered in AppContent, same slot as agent pane)
├── ChatBubble × N
│   ├── RichTextRenderer
│   └── CommentMenu
├── CommentComposer
│   ├── FormattingToolbar
│   └── MentionOverlay
└── NotificationsTray
```

### Component Descriptions

| Component | File | Purpose |
|---|---|---|
| `ProjectsModule` | `ProjectsModule.tsx` | Entry point. Wraps providers, switches between list and detail view. |
| `ProjectsListView` | `ProjectsModule.tsx` | Kanban board with 4 columns. Drag-and-drop between status columns. "All / Created By Me" tabs. |
| `ProjectDetailView` | `ProjectsModule.tsx` | Full project editor. Houses all accordion sections and dispatches context to the AI agent. |
| `ProjectCard` | `ProjectsModule.tsx` | Compact card in the Kanban board. Shows logo, status chip, title, code, and stat badges (offers / templates / backgrounds / assets). |
| `JellyBeanCard` | `ProjectsModule.tsx` | Ad preview card. Composites a vehicle PNG over a background image using HTML Canvas. Handles ground detection, alpha tire detection, elliptical shadow. |
| `PreviewLightbox` | `ProjectsModule.tsx` | Fullscreen lightbox over a JellyBeanCard with prev/next navigation and keyboard support. |
| `ProjectAgentPane` | `ProjectAgentPane.tsx` | AI agent chat panel. Streams from `/api/agent/stream`. Renders all proposal cards. |
| `OffersPage` | `OffersPage.tsx` | Grid of OfferCard components. "Browse All" opens BrowseOffersDialog. |
| `TemplatesPage` | `TemplatesPage.tsx` | Grid of TemplateCard components. |
| `LogosBackgroundsPage` | `LogosBackgroundsPage.tsx` | The most complex page. Manages logo overrides, color overrides, background selection per offer/template combination. |
| `PreviewPage` | `PreviewPage.tsx` | Full preview grid of all offer × template × background combinations. |
| `AdShellsPage` | `AdShellsPage.tsx` | Grouped view of generated assets by background ("Ad Shell"). |
| `CampaignsPage` | `CampaignsPage.tsx` | Link to the Planner module; post-asset-generation CTA. |
| `CreateProjectDialog` | `CreateProjectDialog.tsx` | Multi-step dialog: name, account, brand, date range, platforms, owner. |
| `BrowseOffersDialog` | `offers/BrowseOffersDialog.tsx` | Two-panel fullscreen dialog: filter tree left, offer card grid right. |
| `SelectTemplateDialog` | `templates/SelectTemplateDialog.tsx` | Two-panel fullscreen dialog: folder tree left, template card grid right. |
| `SelectBackgroundDialog` | `logos-backgrounds/SelectBackgroundDialog.tsx` | Two-panel fullscreen dialog: lifestyle + scene background sections. |
| `EditBackgroundModal` | `EditBackgroundModal.tsx` | AI-powered background editor via Replicate Flux model. |
| `TemplateCard` | `templates/TemplateCard.tsx` | Wraps AssetCard with wireframe preview, lightbox, and dropdown menu. |
| `TemplateWireframe` | `templates/TemplateWireframe.tsx` | SVG/div wireframe rendering of template zones with color-coded dashed borders. |
| `TemplateZoneEditor` | `templates/TemplateZoneEditor.tsx` | Full-screen editor for adjusting zone positions and sizes. Live preview with active field highlighting. |
| `OfferCard` | `offers/OfferCard.tsx` | Compact card showing vehicle image, trim, offer type, price, inventory stats. |
| `OfferAccordion` | `logos-backgrounds/OfferAccordion.tsx` | Accordion row per offer in Logos & Backgrounds. Shows car image, style override buttons, and per-template thumbnail rows. |
| `CombinationAccordion` | `logos-backgrounds/CombinationAccordion.tsx` | Multi-product slot picker (P1/P2/P3) for multi-vehicle ad layouts. |
| `BackgroundCollectionCard` | `logos-backgrounds/BackgroundCollectionCard.tsx` | Thumbnail card for a background collection or lifestyle image set. |
| `AssetCard` | `ui/AssetCard.tsx` | Generic square thumbnail shell: selected ring, checkbox, menu button, footer. |
| `ProjectAccordionSection` | `ui/ProjectAccordionSection.tsx` | Animated accordion section header with count, expand/collapse, owner slot, status slot. |
| `TaskOwner` | `ui/TaskOwner.tsx` | Portal-based avatar/initials button with dropdown of project owners. |
| `LogoPicker` | `logos-backgrounds/LogoPicker.tsx` | Popover showing brand kit logos filtered by slot type, with upload option. |
| `CommentsButton` | `comments/CommentsButton.tsx` | Badge button. Opens CommentsProvider panel. |
| `CommentsSidePanel` | `comments/CommentsSidePanel.tsx` | Sliding side panel with comment thread. |

---

## 3. Data Models

### Project (LocalProject)

```typescript
type LocalProject = {
  id: string;               // "honda-demo" (mock) | "project-<timestamp>" (created)
  name: string;             // display name, e.g. "Honda Spring 2026"
  code: string;             // "WF12345_HONDA_HondaSpring_Jun26" — auto-generated
  dealerName: string;       // dealer / account name shown on banners
  status: ProjectStatus;    // see STATUS_CONFIG below
  dateRange: string;        // "Jun 1, 2026 - Jun 30, 2026"
  oem: string;              // brand e.g. "Honda", "BMW"
  assignee: { name: string; avatar: string };
  offerIds: string[];       // base offers (from mock-data)
  templateIds: string[];    // base templates (from mock-data)
  ctaText: string;          // default "Shop Now"
  leaseLabel: string;       // default ""
  finePrint: string;        // default ""
  // LocalProject extensions:
  tags?: string[];
  createdAt?: string;
  account?: string;
  owner?: string;           // owner display name
  platforms?: string[];     // ["Google PMax", "Meta", ...]
};

type ProjectStatus =
  | "Template" | "In Progress" | "Awaiting Approval" | "Needs Edits"
  | "Approved" | "Assets Created" | "Changes Made" | "Done"
  | "Expired" | "Archived";
```

### Offer

```typescript
interface Offer {
  id: string;               // "offer-1", "offer-2", ...
  year: string;             // "2026"
  make: string;             // "Honda"
  model: string;            // "CR-V"
  trim: string;             // "Sport 2WD" | "l36" | "apr60" (variant suffix)
  image: string;            // Cloudinary URL of vehicle jellybean PNG
  stock: number;
  offerType: string;        // "Lease" | "Finance" | "Purchase"
  tags: string[];
  pvi: number;              // Price-Value Index (0–100)
  aging: number;            // days on lot
  sales: number;
  inventory: number;
  monthlyPayment: number;
  term: number;             // months
  totalDueAtSigning: number;
  exteriorColor?: string;
}
```

### StoredOffer (localStorage)

Same as Offer but all 16 fields required. Used for custom offers extracted from uploaded files or agent-parsed offers.

### Template

```typescript
interface Template {
  id: string;               // "website-2000x500", "social-1080x1080-3prod"
  name: string;             // "Website Banner 2000×500"
  format: string;           // "Website Banner" | "Display" | "Social" | "Event"
  width: number;
  height: number;
  brand: string;            // "Honda" | "Multi-Brand" | "Pharma"
  hidden?: boolean;         // excluded from SelectTemplateDialog
  logoSlots?: string[];     // ["primary-square", "event-horizontal"]
}
```

### BackgroundCollection

```typescript
interface BackgroundCollection {
  id: string;               // "dirt-road", "dealer-bg-<timestamp>"
  name: string;
  type: string;             // "scene" | "lifestyle"
  sizes: string[];          // ["300x250", "1080x1080"]
  folder: string;
  color: string;            // hex accent color
  thumbnail: string;        // Cloudinary URL
  images: Record<string, string>;  // templateId → Cloudinary URL
  dimensions?: { width: number; height: number; url: string }[];
  isLifestyle?: boolean;
  vehicleTag?: string;      // single vehicle tag e.g. "CR-V"
  vehicleTags?: string[];   // multi-vehicle tags
}
```

### CustomBackground (dealer-uploaded)

```typescript
interface CustomBackground {
  id: string;               // "dealer-bg-<timestamp>"
  name: string;
  thumbnail: string;        // Cloudinary URL (not blob)
  images: Record<string, string>;           // templateKey → clean bg URL
  composites?: Record<string, Record<string, string>>; // offerId → templateKey → compositeUrl
  groundFraction?: number;  // tire-line Y fraction (0–1) of card height
  carWidthFraction?: number; // car width fraction of card width
}
```

### BrandKit

```typescript
interface BrandKit {
  id: string;           // "honda", "bmw", "spiriva"
  name: string;         // "Honda"
  oem: string;          // "Honda" — used to match project.oem
  logos: BrandKitLogo[];
  colors: string[];     // [textColor, buttonColor], e.g. ["#000000", "#CC0000"]
}

interface BrandKitLogo {
  id: string;           // "primary-square-positive", "event-horizontal-negative"
  slotType: string;     // "primary-square" | "event-horizontal" | "event-square"
  variant: string;      // "positive" (dark) | "negative" (white/light)
  image: string;        // Cloudinary URL
}
```

### TemplateZoneConfig

```typescript
interface TemplateZoneConfig {
  canvasW: number;
  canvasH: number;
  productSlots: Array<{ l: number; top: number; w: number; h: number }>;
  logoP: { l: number; top: number; size: number };   // primary logo
  logoE: { l: number; top: number; size: number };   // event logo
  textLayout: SingleProductTextLayout | MultiProductTextLayout | KeyMessageTextLayout;
  darkText?: boolean;  // if true, use dark ink on light background
}

interface SingleProductTextLayout {
  type: "single";
  dealerName?: TextElement;
  title?: TextElement;
  leaseLabel: TextElement;
  price: TextElement;
  finePrint?: TextElement;
  termLabel?: TextElement;
  dueLabel?: TextElement;
  cta: CtaElement;
  disclaimer?: TextElement;
}

interface TextElement { l: number; top: number; fontSize: number; w?: number; textAlign?: string }
interface CtaElement  { l: number; top: number; fontSize: number; w?: number; h?: number }
```

### Comments Data Model

```typescript
interface CommentData {
  id: string;
  projectId: string;        // context ID (project UUID or section slug)
  authorId: string;
  message: string;          // HTML string (rich text with @mention spans)
  timestamp: number;
  replies: Reply[];
  isPinned?: boolean;
  pinnedAt?: number;
  isEdited?: boolean;
  entityMention?: EntityRef; // { type: "template"|"offer"|"background"; id: string; name: string }
}

interface Reply {
  id: string;
  authorId: string;
  message: string;
  timestamp: number;
  isEdited?: boolean;
  entityMention?: EntityRef;
}

interface NotifItem {
  id: string;
  action: "mentioned_you" | "replied_to_you";
  actorId: string;
  recipientId: string;
  projectId: string;
  projectName: string;
  timestamp: number;
  isRead: boolean;
  targetCommentId: string;
  targetReplyId?: string;
  targetEntityId?: string;
  preview: string;          // plain-text excerpt, max 80 chars
}
```

---

## 4. Mock Data

### offerLibrary (157 entries)

Defined in `projects/lib/mock-data.ts`. Offer IDs follow the pattern `offer-<N>`.

| Make | Model | Count | Variants |
|---|---|---|---|
| Honda | CR-V | ~13 | l36, l24, apr60, apr72, fin48 |
| Honda | Civic | ~5 | l36, l24, fin48 |
| Honda | HR-V | ~7 | l36, apr60 |
| Honda | Odyssey | ~5 | l36, fin48 |
| BMW | Various | ~14 | 3 Series, X5, M3 — l36, apr60 |
| Mercedes | Various | ~10 | E-Class, GLE — l36, fin48 |

**Variant suffix conventions:**
- `l36` = 36-month lease
- `l24` = 24-month lease
- `apr60` = 60-month finance at promotional APR
- `apr72` = 72-month finance
- `fin48` = 48-month standard finance

### templateLibrary (11 single-product + 3 multi-product = 14 total)

Single-product templates (automotive):
`website-2000x500`, `display-970x250`, `display-300x250`, `social-1080x1080`, `website-600x450`, `website-600x1067`, `event-1920x200`, `display-728x90`, `display-300x600`, `display-160x600`, `event-1900x776`

Multi-product templates:
`website-1969x1080-3prod` (3 slots), `social-1080x1080-3prod` (3 slots), `social-1080x1080-keymsg` (3 slots + key message text)

Pharma templates: separate set, identified by `isPharmaZoneConfig()` returning true.

### backgroundCollections

- 4 static scene backgrounds: `dirt-road`, `gold-flare`, `purple-city`, `snow-house`
- ~10 lifestyle image sets (identified by `isLifestyle: true`): balloon-festival, beach-sunset, desert-day, docks-midday, field-with-mountain, forest-lodge, frozen-lake-night, ice-lab, stadium-night, etc.
- Generated backgrounds from Replicate pipeline (added dynamically as `generatedBackgroundCollections`)

### brandKits

| id | oem | Logo count | Colors |
|---|---|---|---|
| honda | Honda | 12 | #000000, #CC0000 |
| bmw | BMW | 2 | #000000, #1C69D4 |
| spiriva | Spiriva | 1 | #000000, #16a34a |
| mercedes | Mercedes-Benz | 4 | #000000, #000000 |

### projects array (static mock data)

Key mock projects:
- `honda-demo` — primary Honda demo project with 4 offers, 3 templates
- `honda-multibrand-demo` — BMW + Honda + Mercedes + Spiriva (pharma hybrid)
- `spiriva-april2026` — Pharma-only project, no offers/templates
- `bmw-spring2026`, `honda-citylifestyle`, `honda-city-improvers`

Static projects have status overrides tracked via `statusOverrides` state (drag-drop) and can be "promoted" to `localProjects` when edited. `PROJECT_OVERRIDES` in mock-data provides per-project logo URL and custom taskIds overrides.

---

## 5. State Management

### ProjectsModuleInner (top-level state)

| State | Type | Purpose |
|---|---|---|
| `localProjects` | `LocalProject[]` | Newly created + edited projects. Persisted to `STORAGE_KEYS.LOCAL_PROJECTS`. |
| `statusOverrides` | `Record<string, ProjectStatus>` | Drag-drop status overrides for static mock projects. Persisted to `STORAGE_KEYS.STATUS_OVERRIDES`. |
| `deletedIds` | `Set<string>` | Session-only deleted project IDs. |
| `selectedProjectId` | `string \| null` | Currently open project. |
| `currentPage` | `ProjectPage` | Active sub-page within detail view. |

### ProjectDetailView (per-project state)

| State | Type | Persistence | Purpose |
|---|---|---|---|
| `agentAddedOfferIds` | `string[]` | PROJECT_STATE per project | Offer IDs added by the AI agent |
| `agentAddedTemplateIds` | `string[]` | PROJECT_STATE per project | Template IDs added by the AI agent |
| `agentAddedBgIds` | `string[]` | PROJECT_STATE per project | Background IDs added by agent |
| `removedOfferIds` | `Set<string>` | PROJECT_STATE per project | Offers removed by user |
| `removedTemplateIds` | `Set<string>` | PROJECT_STATE per project | Templates removed by user |
| `removedBgIds` | `Set<string>` | Session only | Backgrounds removed this session |
| `selectedBgId` | `string \| null` | PROJECT_STATE per project | Legacy single selected bg (replaced by agentAddedBgIds) |
| `expandedSections` | `Partial<Record<SectionId, boolean>>` | None | Which accordion sections are open |
| `offerPatches` | `Record<string, Partial<StoredOffer>>` | PROJECT_STATE per project | Per-offer field edits (price, term, etc.) |
| `agentActivatedOems` | `string[]` | PROJECT_STATE per project | OEM brand kits activated by agent or auto-wired |
| `customBackgroundLibrary` | `CustomBackground[]` | CUSTOM_BACKGROUND_LIBRARY keyed by projectId | Dealer-uploaded backgrounds |
| `customOfferLibrary` | `StoredOffer[]` | CUSTOM_OFFER_LIBRARY | Offers extracted from file uploads |
| `customTemplateLibrary` | `Template[]` | None (in-memory) | Duplicated templates |
| `taskOwners` | `Record<string, string>` | PROJECT_STATE per project | Section owner IDs |
| `generatedAssets` | `GeneratedAsset[]` | PROJECT_STATE per project | Generated asset records |

### localStorage Keys (STORAGE_KEYS)

```typescript
STORAGE_KEYS = {
  LOCAL_PROJECTS:           "constellation_projects",
  STATUS_OVERRIDES:         "constellation_project_status_overrides",
  PROJECT_STATE:            (id: string) => `constellation_project_state_${id}`,
  CUSTOM_OFFER_LIBRARY:     "constellation_custom_offer_library",
  CUSTOM_BACKGROUND_LIBRARY: "constellation_custom_background_library",
  // Comments:
  COMMENTS_STORAGE_KEY:     (ctx: string) => `constellation_comments_${ctx}`,
  NOTIFS_STORAGE_KEY:       "constellation_notifications",
}
```

### PROJECT_STATE schema (per-project)

```typescript
{
  addedOfferIds?: string[];
  addedTemplateIds?: string[];
  removedOfferIds?: string[];
  removedTemplateIds?: string[];
  bgId?: string | null;
  agentAddedBgIds?: string[];
  activatedOem?: string | null;          // legacy single-OEM field
  activatedOems?: string[];              // current multi-OEM array
  taskOwners?: Record<string, string>;
  generatedAssetIds?: Array<{ offerId: string; templateId: string; bgId: string | null }>;
  offerPatches?: Record<string, Partial<StoredOffer>>;
}
```

### ProjectStore (React Context in `project-store.tsx`)

Session-only store (not persisted). Holds:
- Per-project logo overrides at 4 scopes: `offerLogoIds`, `offerTemplateLogoIds`, `templateLogoIds`, `backgroundMakeLogoIds`
- Per-project color overrides at the same 4 scopes: `offerColors`, `offerTemplateColors`, `templateColors`, `backgroundMakeColors`
- Background exclusions per template and per offer×template
- `combinations` — multi-product slot assignments
- `customTemplateFields` — manually edited zone fields (keyMessage, year)
- `variableMappings` — 11 variables → offer field name or special token

**4 logo/color scopes in priority order (highest to lowest):**
1. `scope="offerTemplate"` — specific offer + specific template
2. `scope="offer"` — all templates for this offer
3. `scope="template"` — all offers for this template
4. `scope="backgroundMake"` — all combinations for this background + make

---

## 6. Agent System

### Architecture

The agent runs as a server-sent events (SSE) stream from `/api/agent/stream`. The frontend sends a `POST` request with `{ messages, projectContext }` and receives `text_delta`, `tool_result`, and `done` events.

```
ProjectDetailView
    → dispatches PROJECT_CONTEXT_EVENT (CustomEvent) whenever state changes
    → ProjectAgentPane listens, stores latest ProjectContextPayload

User types message
    → ProjectAgentPane calls streamMessage(messages, ctx)
    → useAgentStream POSTs to /api/agent/stream
    → SSE events arrive: text_delta → build streaming text bubble
                         tool_result → render proposal card
                         done → finalize
```

### useAgentStream hook (`agent/useAgentStream.ts`)

```typescript
function useAgentStream(): {
  streaming: boolean;
  streamMessage(
    messages: ApiMessage[],
    ctx: ProjectContextPayload,
    onDelta: (d: string) => void,
    onTool: (name: string, input: Record<string, unknown>) => void,
    onDone: () => void,
    onError: (msg: string) => void,
    forceTool?: string,
  ): Promise<void>;
  stop(): void;
}
```

Internally uses `ReadableStream` reader and parses SSE lines. Supports `forceTool` to force a specific tool on the next call (used for continuation messages).

### Tool Definitions (`agent-lib/tool-definitions.ts`)

The agent has 20+ tools. Key ones:

| Tool | When used | Effect |
|---|---|---|
| `setup_project` | First step for new project | Renders SetupProjectCard |
| `propose_offers` | After setup | Renders OffersProposalCard |
| `propose_templates` | After offers confirmed | Renders TemplatesProposalCard |
| `propose_backgrounds` | After templates confirmed | Renders BackgroundsProposalCard |
| `propose_brand` | After backgrounds | Renders BrandProposalCard |
| `propose_project` | Existing project refresh | Renders combined proposal |
| `add_offers_to_project` | Small direct additions | Fires `add_offers` AgentActionPayload |
| `remove_offers_from_project` | Direct removal | Fires `remove_offers` AgentActionPayload |
| `add_templates_to_project` | Direct addition | Fires `add_templates` AgentActionPayload |
| `remove_templates_from_project` | Direct removal | Fires `remove_templates` AgentActionPayload |
| `add_backgrounds_to_project` | Named background | Fires `add_backgrounds` AgentActionPayload |
| `remove_backgrounds_from_project` | Named background | Fires `remove_backgrounds` AgentActionPayload |
| `edit_offer` | Price/term change | Fires `edit_offer` AgentActionPayload |
| `update_project_display` | CTA/dealer name/fine print | Fires `update_project_display` AgentActionPayload |
| `propose_share` | Share review request | Renders ReviewerPickerCard |
| `propose_email` | Email share | Renders ReviewerPickerCard (email default) |
| `propose_task_owners` | Assign section owners | Renders TaskOwnersCard |
| `propose_notify_owners` | Notify all owners | Renders NotifyOwnersCard |
| `propose_parsed_offers` | File upload extraction | Renders ParsedOffersCard |
| `propose_proactive_questions` | Autopilot mode | Renders ProactiveQuestionsCard |
| `list_jellybean_colors` | Color availability | Returns available color families |
| `swap_jellybean_color` | Change car color | Fires `swap_jellybean` AgentActionPayload |
| `generate_dealer_background` | Dealer bg flow | Triggers Replicate pipeline |
| `duplicate_template_in_project` | Template copy | Fires `duplicate_template` AgentActionPayload |
| `set_project_name` | Rename | Fires `set_project_name` AgentActionPayload |

### Tool Executor (AgentActionPayload dispatch)

When a tool resolves, the agent fires `window.dispatchEvent(new CustomEvent(PROJECT_AGENT_ACTION_EVENT, { detail: payload }))`. `ProjectDetailView` listens and updates state:

```typescript
type AgentActionPayload =
  | { action: "add_offers";            offerIds: string[]; editedOfferIds?: string[] }
  | { action: "remove_offers";         offerIds: string[] }
  | { action: "add_templates";         templateIds: string[] }
  | { action: "remove_templates";      templateIds: string[] }
  | { action: "set_project_name";      name: string }
  | { action: "create_project";        name, account, oem, startDate, endDate, owner?, platforms? }
  | { action: "set_brand";             oem: string }
  | { action: "add_backgrounds";       backgroundIds: string[] }
  | { action: "add_custom_background"; background: {...} }
  | { action: "send_email";            recipient, message }
  | { action: "add_custom_offers";     offers: CustomOffer[] }
  | { action: "edit_offer";            offerId, patches }
  | { action: "set_task_owners";       owners: Record<string, string> }
  | { action: "set_dealer_bg_generating"; value: boolean }
  | { action: "remove_backgrounds";    backgroundIds: string[] }
  | { action: "duplicate_template";    templateId, newName? }
  | { action: "update_project_display"; patches }
  | { action: "swap_jellybean";        offerId, jellybeanUrl, jellybeanId, colorFamily }
```

### ProjectContextPayload

Sent with every stream request to give the agent full context:

```typescript
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
  availableOffers: OfferSummary[];      // full catalog summary
  availableTemplates: TemplateSummary[];
  activeBrandOem?: string;
  taskOwners?: Record<string, string>;
  currentBackgroundIds?: string[];
  generatedAssetPreviews?: Array<{
    bgUrl, vehicleUrl, offerName, templateName, dims,
    offerType?, monthlyPayment?, term?, trim?, make?
  }>;
}
```

### System Prompt (`agent-lib/system-prompt.ts`)

Instructs the model to:
- Follow the 4-step flow: setup → offers → templates → backgrounds → brand
- Use `flow_steps` to determine which steps to execute after setup
- Not hallucinate offer/template/background IDs
- Use `propose_parsed_offers` when the catalog lacks matching vehicles
- Never put color names in offer trim/model fields — use `list_jellybean_colors` + `swap_jellybean_color`
- Handle Portuguese and English equally (bilingual support)

### ProactiveWidgets (`agent/ProactiveWidgets.tsx`)

- `ProactiveAutoApplyBar` — progress bar shown inside proposal cards when `proactive=true`. Auto-applies after 5 seconds unless cancelled. Shows countdown and "Cancel" button.
- `ProactiveQuestionsCard` — 3-question intake form for autopilot mode. Questions: priority model, key message preference, urgency. Fires continuation message with answers.

### ReviewerPickerCard (`ProjectAgentPane.tsx`)

Contact list rendered when `propose_share` or `propose_email` fires.

- `MOCK_CONTACTS` — 11 contacts in 3 groups: `"constellation"` (5), `"dealer"` (5), `"internal"` (1).
- `customContacts` state — contacts added by typing an email address.
- `channels` state — per-contact `"platform" | "email"`. Default: constellation → platform, dealer → email.
- `emailInput` state — free-form email input to add unknown contacts.
- `recipientHints` from agent — pre-selects named contacts.
- On send: fires `onSend(selected, channels, message)` which posts a share API call.

### Window Events (agent ↔ main panel bridge)

| Event name | Direction | Payload | Purpose |
|---|---|---|---|
| `project-context-update` | Module → Agent | `ProjectContextPayload` | Context sync on every state change |
| `project-agent-action` | Agent → Module | `AgentActionPayload` | Agent updates project state |
| `agent-scroll-to-section` | Agent → Module | `{ section: SectionId }` | Expand and scroll to a section |
| `agent-generate-assets` | Agent → Module | none | Open generate modal |
| `agent-assets-generated` | Module → Agent | `{ count }` | Confirm generation complete |
| `agent-open-campaigns` | Agent → Module | none | Navigate to Campaigns section |
| `project-status-change` | Module internal | `{ projectId, status }` | Status update after generation |

---

## 7. Asset Generation

### JellyBeanCard Component

The core ad preview card. Given an offer (with vehicle PNG URL), a template, and optional background, it renders a composited ad preview at a fixed height.

**Rendering pipeline:**

1. Compute card dimensions: `w = fixedHeight * (template.width / template.height)`, clamped to 540px wide.
2. If `groundFraction` is defined (dealer custom background): run canvas composite (async, shows skeleton during).
3. If `compositeUrl` is provided (pre-generated Flux output): show directly, suppress CSS car overlay.
4. If neither: show `bgImage` as `object-cover` background, overlay car PNG via absolute CSS positioning.

**Canvas composite steps (for dealer backgrounds):**
1. Load car PNG via `fetch + blob` to avoid CORS canvas taint.
2. Alpha-detect tire position: scan pixel rows from bottom until alpha > 20 — `tireFraction`.
3. Load background image (may fail if Replicate URL expired — falls back to CSS overlay with computed `carBottom`).
4. Draw background with object-cover geometry.
5. `detectGroundStart()` — scan pixel brightness from bottom upward to find building/ground junction.
6. Apply ground normalization zoom if ground band is too thin.
7. Sample bottom 30% luminance for adaptive text colors (`deriveAdaptiveColors`).
8. Compute car dimensions constrained by available area and `carWidthFraction`.
9. Draw elliptical contact shadow at tire line.
10. Draw car PNG.
11. Export as JPEG 0.92 → `setCompositeImage`.

**Dealer placement table** (`dealerCarPlacement`): for backgrounds with `id.startsWith("dealer-bg-")`, uses per-aspect-ratio fixed fractions instead of model calls.

**Zone-config layout**: for templates with a zone config, all text elements (dealerName, leaseLabel, price, CTA, finePrint, disclaimer) are absolutely positioned using `s(v) = Math.round(v * (w / canvasW))` uniform scale. For templates without a zone config, fallback layout is used.

### getBgImage utility

```typescript
function getBgImage(bg, template): string | undefined
```

Looks up `bg.images[template.id]` first, then falls back to closest aspect ratio among known sizes. If no match, returns the first available image URL.

### generatedAssets Flow

```typescript
type GeneratedAsset = { key: string; offer: Offer; template: Template; bgId: string | null }
```

Generated by the "Generate Assets" modal in `ProjectDetailView`. The key is `"<bgId>-<templateId>-<offerId>"`. Assets are persisted to `PROJECT_STATE.generatedAssetIds` and restored on mount.

The agent triggers generation by firing `AGENT_GENERATE_ASSETS_EVENT`. The modal collects all visible `offers × templates × backgrounds` combinations and creates `GeneratedAsset` records. After generation, fires `AGENT_ASSETS_GENERATED_EVENT` with count.

### Template Rendering (AdTemplate component)

`AdTemplate.tsx` renders a full ad template with real offer data substituted into zone positions. It reads zone configs from `template-zone-configs.ts` and renders logos, text, and car image at proper coordinates.

### send-review API

When sharing, the frontend calls `/api/send-review` with asset preview data. This POST sends the project link and optional email to the recipient.

---

## 8. Comments System

### CommentsContext (`comments/CommentsContext.tsx`)

React context wrapping the entire application. Mounted in `AppContent.tsx`:

```tsx
<CommentsProvider contextId={commentsContextId} contextName={commentsContextName} currentUserId={...}>
```

`contextId` changes when the user navigates between sections/projects (driving comment data reload from localStorage). For a specific project it equals the project's UUID. For campaign tabs it equals `"campaigns-overview"`, `"campaigns-pre-approvals"`, etc.

**State managed:**
- `comments: CommentData[]` — useReducer, persisted to `COMMENTS_STORAGE_KEY(contextId)`
- `notifications: NotifItem[]` — useReducer, persisted to `NOTIFS_STORAGE_KEY` (global, not per-context)
- `isPanelOpen`, `isNotifOpen` — panel visibility booleans
- `pendingEntity` — entity ref to pre-filter the panel when opened via `CommentsButton` on a specific asset
- `highlightedCommentId` — auto-cleared after 5 seconds

**Key functions:**
- `addComment(draft)` — generates ID, sets authorId/timestamp, dispatches ADD, calls `emitMentionNotifs`
- `editComment(id, message)` — sets `isEdited: true`
- `deleteComment(id)` — removes from state and storage
- `pinComment(id, pinned)` — sets `isPinned` and `pinnedAt`
- `addReply(commentId, draft)` — appends reply, emits mention notifications
- `markRead(notifId)` / `markAllRead()` — updates notification isRead state

**Window event bridges:**
- `toggle-comments-panel` — triggered by keyboard shortcut `c` in AppContent
- `comment-notifs-changed` — emitted by provider when notifications change; TopNavBar listens to update badge
- `comment-mark-read` — fired by TopNavBar, handled by provider
- `comment-open-to` — deep-link to specific comment; fired after navigation
- `comments-opened` — fired when panel opens (agent pane closes in response)
- `agent-opened` — fired when agent opens (comments panel closes in response)

### CommentsSidePanel (`comments/CommentsSidePanel.tsx`)

Renders comment list filtered to `contextId`. Shows pinned comments first, then by timestamp descending. When `pendingEntity` is set, filters to show only comments on that entity.

### CommentsButton (`comments/CommentsButton.tsx`)

Icon button with badge showing unread count for current context. Always visible (no `opacity-0`). Size 16, color `#686576`. Reference implementation per `feedback_icon_size.md`.

### NotificationsTray (`comments/NotificationsTray.tsx`)

Dropdown showing `NotifItem[]` filtered to `currentUser.id`. Clicking a notification fires `comment-open-to` to navigate and highlight the target comment.

### ChatBubble (`comments/ChatBubble.tsx`)

Renders a single comment with:
- Author avatar + name + timestamp
- `RichTextRenderer` for the message HTML
- Reply thread (indented)
- Pin indicator
- `CommentMenu` (edit / delete / pin / copy link)
- Highlight pulse when `highlightedCommentId === comment.id`

### CommentComposer (`comments/CommentComposer.tsx`)

Rich text `contenteditable` div. Supports:
- Bold, italic, underline via `FormattingToolbar`
- `@` trigger opens `MentionOverlay` (floating list of `COMMENT_USERS`)
- Entity mentions via `#` or drag-and-drop (stores `entityMention` ref)
- Keyboard: Enter submits, Shift+Enter newline, Escape closes

### RichTextRenderer (`comments/RichTextRenderer.tsx`)

Renders HTML comment messages. Processes `<span data-mention-id="...">` into styled `@name` chips. Safe HTML — no dangerouslySetInnerHTML of untrusted content.

### MentionOverlay (`comments/MentionOverlay.tsx`)

Floating positioned overlay (via `createPortal`). Appears when `@` is typed. Filters `COMMENT_USERS` by typed text. Keyboard navigation (up/down/enter). Inserts a `<span data-mention-id>` into the composer.

---

## 9. Backgrounds System

### Two Background Sources

**1. backgroundCollections (catalog)** — imported from `mock-data.ts`. These are static scene photography and lifestyle images with per-format Cloudinary URLs. Users browse them in `SelectBackgroundDialog` and `LogosBackgroundsPage`.

**2. customBackgroundLibrary (dealer-uploaded)** — stored in `STORAGE_KEYS.CUSTOM_BACKGROUND_LIBRARY`, keyed by projectId. Created by:
- The agent's `generate_dealer_background` tool → Replicate Flux pipeline → stored after user approval in `DealerBgProposalCard`
- The `EditBackgroundModal` → edits an existing background via AI inpainting

**Additive model**: Backgrounds only appear in a project when explicitly added by the agent or user. They are never auto-included from the catalog. The `visibleBackgrounds` array in `ProjectDetailView` is:

```typescript
const visibleBackgrounds = [
  ...sceneBackgrounds.filter(b => agentAddedBgIds.includes(b.id) && !removedBgIds.has(b.id)),
  ...customBackgroundLibrary.filter(b => !removedBgIds.has(b.id)),
];
```

### getBgImage utility

Called with a background collection and a template. Returns the best-matching background URL for that template's dimensions:
1. Exact key match: `bg.images[template.id]`
2. Closest aspect ratio among `KNOWN_SIZES` map
3. Any value in `bg.images` as last resort

### EditBackgroundModal (`EditBackgroundModal.tsx`)

Allows AI-powered editing of backgrounds via Replicate's Flux model.

- Uses `replicateClient.ts` to call the Replicate API
- User uploads a scene photo or selects an existing background
- Agent generates per-format background images at all template sizes
- Results are stored via Cloudinary Fetch URL pattern for persistence (Replicate URLs expire after ~1h)
- On confirmation, fires `add_custom_background` agent action

### LogosBackgroundsPage

The Logos & Backgrounds page has two view modes:

**Simple view** (default): one accordion row per offer. Each row shows the offer's car image and the backgrounds applicable to it (filtered by template exclusions).

**Fine Tune view** (`fineTune = true`): one accordion row per offer × template combination. Each row shows the exact background that will be used for that specific pairing.

The `StyleOverrideButtons` component inside each accordion row shows:
- Logo swatches per slot type (primary-square, event-horizontal, event-square)
- Text color swatch + button color swatch
- Clicking a swatch shows a color picker popover with 600ms tooltip delay
- Revert button per color to restore brand kit default

The 4-scope color/logo priority chain is resolved in `StyleOverrideButtons.applyColorOverride`.

---

## 10. Key Patterns & Conventions

### Accordion Sections (ProjectAccordionSection)

```typescript
interface ProjectAccordionSectionProps {
  title: string;
  count?: number;              // null = always-open empty state, undefined = hidden
  expanded?: boolean;          // controlled mode
  onExpandedChange?: (v: boolean) => void;
  emptyContent?: ReactNode;    // shown when count is null
  ownerSlot?: ReactNode;       // TaskOwner component
  statusSlot?: ReactNode;      // status chip
  children?: ReactNode;
}
```

- Three states: `count === null` → shows `emptyContent`, never collapses; `count > 0` → shows count badge, expandable; `count === undefined` → standard expandable.
- Uses `AnimatePresence` + `motion.div` for height animation: `duration: 0.2, ease: [0.4, 0, 0.2, 1]`.
- Background: `bg-[#F4F5F6]`, hover: `bg-[#ECEDF0]`, active: `bg-[#E4E5E9]`.
- `ownerSlot` and `statusSlot` use `e.stopPropagation()` to prevent accordion toggle.

### Shareable URL Pattern

`handleProjectChange(id, name)` in `AppContent.tsx`:
```typescript
navigate(buildUrl(userType, clientId, 'projects') + `?project=${encodeURIComponent(id)}`)
```

On mount, AppContent reads `?project=<id>` from `location.search` and forwards it to `ProjectsModule` as `openProjectId` prop.

### Additive Model for Offers/Templates/Backgrounds

The project's `offerIds` and `templateIds` arrays are the base set. The agent can only **add** to these via `agentAddedOfferIds`/`agentAddedTemplateIds`. Users can remove any item (base or agent-added) by adding to `removedOfferIds`/`removedTemplateIds`. This means:

```typescript
visibleOffers = [...baseOffers, ...agentAddedOffers]
  .filter(unique)
  .filter(o => !removedOfferIds.has(o.id))
```

### offerPatches

Per-offer field overrides stored separately from the offer library:

```typescript
offerPatches: Record<string, Partial<StoredOffer>>
// e.g. { "offer-1": { monthlyPayment: 299, term: 36 } }
```

Applied at render time: `combinedOfferLibrary = offerLibrary.map(o => offerPatches[o.id] ? { ...o, ...offerPatches[o.id] } : o)`.

### customBackgroundLibrary Thumbnail Fallback

When loading from localStorage, blob: and data: URL thumbnails are replaced with the first `http` URL found in `bg.images`:

```typescript
const badThumb = !bg.thumbnail || bg.thumbnail.startsWith('blob:') || bg.thumbnail.startsWith('data:');
if (badThumb && bg.images) {
  const fallback = Object.values(bg.images).find(u => u.startsWith('http'));
  if (fallback) return { ...bg, thumbnail: fallback };
}
```

Saving also strips transient fields: any key starting with `_`, any value starting with `blob:`, and any `data:` value > 50,000 bytes.

### CTA Button Pattern

CTA buttons in JellyBeanCard use `whiteSpace: "nowrap"` and `minWidth: s(tl.cta.w)` to prevent wrapping. Always backed by `#111014` dark background with white text.

### TaskOwner

`PROJECT_OWNERS` array in `CreateProjectDialog.tsx` defines the 5 team members. `TaskOwner` component renders an initials avatar button that shows a portal-based dropdown of owners. The selected owner's `id` is stored in `taskOwners[sectionId]` state.

### Status Chip Colors

| Status | Background | Text |
|---|---|---|
| In Progress | `#E3F2FD` | `#0d47a1` |
| Assets Created | `#EDE7F6` | `#4527A0` |
| Awaiting Approval | `rgba(225,118,19,0.08)` | `#613f02` |
| Approved | `#E8F5E9` | `#1b5e20` |
| Needs Edits | `rgba(210,50,63,0.08)` | `#be0e1c` |
| Done | `#E8F5E9` | `#1b5e20` |
| Expired / Archived | `#F3F4F6` | `var(--ink-secondary)` |

---

## 11. MUI Migration Notes

### CSS Variables → MUI Theme

| CSS var | MUI equivalent |
|---|---|
| `--brand-accent` | `theme.palette.primary.main` (e.g. `#473bab`) |
| `--brand-mid` | `theme.palette.primary.light` |
| `--brand-accent-hover` | `theme.palette.primary.dark` |
| `--ink` | `theme.palette.text.primary` |
| `--ink-secondary` | `theme.palette.text.secondary` |
| `--ink-tertiary` | `theme.palette.text.disabled` |
| `--danger` | `theme.palette.error.main` |

Define all as custom palette tokens in `createTheme`. Keep CSS variable aliases on `:root` so portal-rendered components (Popper, Modal) inherit them.

### Tailwind Classes → MUI

| Tailwind | MUI sx |
|---|---|
| `rounded-xl` | `borderRadius: 2` (×8px) |
| `rounded-full` | `borderRadius: "50%"` |
| `shadow-sm` | `boxShadow: 1` |
| `bg-[#F4F5F6]` | `bgcolor: "#F4F5F6"` |
| `text-xs` | `typography: "caption"` or `fontSize: 12` |
| `font-semibold` | `fontWeight: 600` |
| `truncate` | `overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"` |
| `shrink-0` | `flexShrink: 0` |
| `gap-2` | `gap: 1` (×8=8px) |

### Component Mappings

| Source | MUI equivalent |
|---|---|
| `ProjectAccordionSection` | Custom `MuiAccordion` with `disableGutters` and `elevation={0}`. Override `MuiAccordionSummary` and `MuiAccordionDetails`. |
| `dialog.tsx` (Radix) | `MuiDialog` with `fullScreen` for two-panel dialogs. Use `DialogTitle`, `DialogContent`, `DialogActions`. |
| `badge.tsx` (CVA) | `MuiChip` with `size="small"` and custom `sx`. For notification count use `MuiBadge`. |
| `checkbox.tsx` (Radix) | `MuiCheckbox` with `size="small"` and `color="primary"`. |
| `select.tsx` (Radix) | `MuiSelect` with `size="small"`. |
| `scroll-area.tsx` (Radix) | MUI's `Box` with `overflow: "auto"` and custom scrollbar CSS via `GlobalStyles`. |
| `AssetCard` | `MuiCard` with `aspect-ratio: 1/1` on the media slot. |
| `CardViewVertical` | `MuiGrid` with `container spacing={3}`. |
| `DropdownMenu` (Radix) | `MuiMenu` + `MuiMenuItem`. |
| `Tooltip` (Radix) | `MuiTooltip` with `enterDelay={600}` for the 600ms pattern. |
| `AnimatePresence` + `motion.div` (Framer) | `MuiCollapse` for accordion height animation. `MuiFade` for opacity-only transitions. `MuiSlide` for panel entry. |
| `createPortal` (React) | MUI's `Portal` component or built-in portal in `Modal`/`Popper`. |

### Framer Motion → MUI Transitions

- Accordion expand/collapse (`duration: 0.2`): use `MuiCollapse` with `timeout={200}`.
- Message cards entrance (`opacity: 0, y: 6`): use `MuiFade` + `MuiSlide` or `Grow`.
- Kanban column collapse: `MuiCollapse`.
- Lightbox entry (`scale: 0.96`): use `MuiZoom` with custom `timeout`.

### Dialogs

All two-panel "browser" dialogs (BrowseOffersDialog, SelectTemplateDialog, SelectBackgroundDialog) are full-screen with 50px margins and a fixed left sidebar. Implement as `MuiDialog` with `fullWidth maxWidth={false}` and custom `sx` for the margin. Left panel uses `MuiList` or custom `MuiTreeView`. Right panel uses the `CardViewVertical` grid pattern.

### Accordion Sections

`ProjectAccordionSection` should become a custom styled `MuiAccordion`:

```tsx
<Accordion disableGutters elevation={0} sx={{ bgcolor: "#F4F5F6", borderRadius: 2 }}>
  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
    {/* title + count badge + ownerSlot + statusSlot */}
  </AccordionSummary>
  <AccordionDetails>
    {children}
  </AccordionDetails>
</Accordion>
```

Override `MuiAccordionSummary-root` to stop propagation for owner/status slot click events.

### ProjectStore

Keep as a plain React Context — MUI has no opinion on state management. Consider migrating to Zustand if the store grows, but the context pattern is fine.

### CommentsSystem

The comments system is completely self-contained. Migrate it as-is, replacing:
- `contenteditable` composer → can remain (MUI has no equivalent)
- Radix `Tooltip` → `MuiTooltip`
- Portal usage → MUI `Portal`
- Tailwind classes → `sx` props

### Icon Library

Currently using Lucide React. For MUI, use `@mui/icons-material` where icons match, or keep Lucide (it works alongside MUI). Custom SVG icons (`LCOffers`, `LCTemplates`, etc.) should remain as inline SVG components.

### Theme Data Mode

`data-mode="dealer"` or `data-mode="oem"` on `<html>` drives CSS variable palette switches. In MUI, implement this as a theme switch using `createTheme` with conditional palette values, toggled via a `ThemeProvider` re-render when `userType` changes.

### Typography

Current font: `system-ui, sans-serif` (Tailwind default), with `font-['Roboto']` explicitly on some chips. MUI defaults to Roboto — this aligns well. Set `typography.fontFamily = "'Roboto', system-ui, sans-serif"` in the MUI theme.

### Canvas Compositing (JellyBeanCard)

This is pure DOM/Canvas code — no Tailwind. Migrate as-is. The only change needed is replacing absolute CSS positioning classes with `sx={{ position: "absolute", ... }}` on the image wrappers.

---

*Generated from source files in `/projects-migration/source/` on 2026-06-25. All type names and state keys are exact matches to the source code.*
