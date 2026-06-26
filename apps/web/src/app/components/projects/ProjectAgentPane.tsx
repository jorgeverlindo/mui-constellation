"use client";

import { useState, useRef, useEffect, useCallback, useMemo, forwardRef, type ButtonHTMLAttributes } from "react";
import { createPortal } from "react-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import InputBase from "@mui/material/InputBase";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Tooltip from "@mui/material/Tooltip";
import Chip from "@mui/material/Chip";
import Collapse from "@mui/material/Collapse";
import Fade from "@mui/material/Fade";
import Slide from "@mui/material/Slide";
import Avatar from "@mui/material/Avatar";
import Checkbox from "@mui/material/Checkbox";
import LinearProgress from "@mui/material/LinearProgress";
import Divider from "@mui/material/Divider";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import CheckIcon from "@mui/icons-material/Check";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import FileOpenIcon from "@mui/icons-material/FileOpen";
import LabelIcon from "@mui/icons-material/Label";
import LayersIcon from "@mui/icons-material/Layers";
import ImageIcon from "@mui/icons-material/Image";
import InfoIcon from "@mui/icons-material/Info";
import SearchIcon from "@mui/icons-material/Search";
import { AgentPane } from "../AgentPane";
import type { UserType } from "../../utils/routing";
import { PROJECT_OWNERS, PLATFORM_OPTIONS } from "./CreateProjectDialog";
import { OfferCard } from "./offers/OfferCard";
import type { Offer as OfferCardData } from "./offers/OfferCard";
import { offerLibrary } from "./lib/mock-data";
import { useWorkflow } from "../../contexts/WorkflowContext";
import { TemplateZoneEditor } from "./templates/TemplateZoneEditor";
import { inlineMarkdown, MarkdownContent } from "./agent/markdown";
import { ResponseActions } from "./agent/ResponseActions";
import { ConstellationArcMark, useConstellationAnim } from "./agent/ConstellationArcMark";
import { ProactiveAutoApplyBar, ProactiveQuestionsCard } from "./agent/ProactiveWidgets";
import { AgentSelect, AgentAddSelect, ConfirmedChip, WhyThese } from "./agent/AgentSelects";
import { SetupProjectCard } from "./agent/SetupProjectCard";
import { OffersProposalCard } from "./agent/OffersProposalCard";
import { type TemplateInfo } from "./agent/TemplatePreviewModal";
import {
  loadAgentThreads, saveAgentThreads, getThreadTitle, groupThreadsByDate,
  fileToBase64, parseExcelToText, deduplicateName,
} from "./agent/utils";
import type { AgentThread } from "./agent/utils";
import { useAgentStream } from "./agent/useAgentStream";

// ─── Stubs for contexts/modules not yet present in MUI app ────────────────────
function useUsabilityTesting() {
  return { triggerEvent: (_: string) => {} };
}
function AvatarInitials({ initials, size, bgColor }: { initials: string; size: number; bgColor?: string }) {
  return (
    <Box sx={{ width: size, height: size, borderRadius: "50%", bgcolor: bgColor ?? "#473bab", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <Typography sx={{ fontSize: size * 0.38, fontWeight: 700, color: "white", letterSpacing: "0.4px", lineHeight: 1 }}>{initials}</Typography>
    </Box>
  );
}
const STORAGE_KEYS = { LOCAL_PROJECTS: "constellation_local_projects" };
function resolveJellybean(_model: string, _colorFamily?: string, _year?: string, _trim?: string): string | null {
  return null;
}

const imgAgentAvatar = 'https://res.cloudinary.com/dvq75cqna/image/upload/v1780071107/vw-funds/a66b3945941bddb97efa53207e606703467e02b3.png';

// ─── AgentInput stub (minimal MUI implementation) ─────────────────────────────
export interface AgentInputHandle {
  populate: (text: string) => void;
}
const AgentInput = forwardRef<AgentInputHandle, {
  onSubmit: (text: string, files: File[]) => void;
  onFilesChange?: (files: File[]) => void;
  onStop?: () => void;
  streaming?: boolean;
  accountName?: string;
}>(function AgentInput({ onSubmit, onFilesChange, onStop, streaming, accountName }, ref) {
  const [value, setValue] = useState("");
  useEffect(() => {
    if (ref && typeof ref === "object" && ref !== null) {
      (ref as React.MutableRefObject<AgentInputHandle>).current = {
        populate: (text: string) => setValue(text),
      };
    }
  }, [ref]);
  const handleSubmit = () => {
    if (!value.trim() && !streaming) return;
    if (streaming) { onStop?.(); return; }
    const text = value;
    setValue("");
    onSubmit(text, []);
  };
  return (
    <Box sx={{
      bgcolor: "background.paper", border: "1px solid rgba(0,0,0,0.12)",
      borderRadius: "16px", p: "12px", width: "100%",
      boxShadow: "0px 2px 2px rgba(0,0,0,0.08)",
    }}>
      <InputBase
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
        placeholder="Ask anything"
        multiline
        maxRows={4}
        fullWidth
        sx={{ fontSize: "14px", color: "#1f1d25" }}
      />
      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: "8px" }}>
        <IconButton
          size="small"
          onClick={handleSubmit}
          disabled={!value.trim() && !streaming}
          sx={{
            bgcolor: "primary.main", color: "white", width: 30, height: 30,
            "&:hover": { bgcolor: "#392e8a" },
            "&.Mui-disabled": { bgcolor: "primary.main", opacity: 0.5, color: "white" },
          }}
        >
          {streaming
            ? <Box sx={{ width: 10, height: 10, bgcolor: "white", borderRadius: "2px" }} />
            : <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
          }
        </IconButton>
      </Box>
    </Box>
  );
});

// ─── Shared event constants ────────────────────────────────────────────────────
export const PROJECT_CONTEXT_EVENT         = "project-context-update";
export const PROJECT_AGENT_ACTION_EVENT    = "project-agent-action";
export const AGENT_SCROLL_TO_SECTION_EVENT = "agent-scroll-to-section";
export const AGENT_GENERATE_ASSETS_EVENT   = "agent-generate-assets";
export const AGENT_ASSETS_GENERATED_EVENT  = "agent-assets-generated";
export const AGENT_OPEN_CAMPAIGNS_EVENT    = "agent-open-campaigns";

export interface ProjectContextPayload {
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
  availableOffers: {
    id: string; year: string; make: string; model: string; trim: string;
    offerType: string; monthlyPayment: number; term: number;
    pvi: number; aging: number; stock: number;
    image?: string;
  }[];
  availableTemplates: {
    id: string; name: string; format: string; width: number; height: number; brand: string;
  }[];
  activeBrandOem?: string;
  taskOwners?: Record<string, string>;
  currentBackgroundIds?: string[];
  generatedAssetPreviews?: Array<{
    bgUrl: string; vehicleUrl: string; offerName: string; templateName: string; dims: string;
    offerType?: string; monthlyPayment?: number; term?: number; trim?: string; make?: string;
  }>;
}

export interface CustomOffer {
  id: string; year: string; make: string; model: string; trim: string;
  offerType: string; monthlyPayment: string; term: string; dueAtSigning: string;
  apr?: string; notes?: string; image?: string; exteriorColor?: string;
}

export function resolveCarImage(make: string, model: string, trim: string, year?: string, colorFamily?: string): string {
  return resolveJellybean(model, colorFamily, year, trim) ?? "";
}

export type AgentActionPayload =
  | { action: "add_offers";       offerIds: string[]; editedOfferIds?: string[] }
  | { action: "remove_offers";    offerIds: string[] }
  | { action: "add_templates";    templateIds: string[] }
  | { action: "remove_templates"; templateIds: string[] }
  | { action: "set_project_name"; name: string }
  | { action: "create_project";   name: string; account: string; oem: string; startDate: string; endDate: string; owner?: string; platforms?: string[] }
  | { action: "set_brand";        oem: string }
  | { action: "add_backgrounds";  backgroundIds: string[] }
  | { action: "add_custom_background"; background: { id: string; name: string; thumbnail: string; images: Record<string, string> } }
  | { action: "send_email";       recipient: string; message: string }
  | { action: "add_custom_offers"; offers: CustomOffer[] }
  | { action: "edit_offer"; offerId: string; patches: Partial<{ monthlyPayment: number; term: number; totalDueAtSigning: number; offerType: string; trim: string; year: string; make: string; model: string }> }
  | { action: "set_task_owners"; owners: Record<string, string> }
  | { action: "set_dealer_bg_generating"; value: boolean }
  | { action: "remove_backgrounds"; backgroundIds: string[] }
  | { action: "duplicate_template"; templateId: string; newName?: string }
  | { action: "update_project_display"; patches: { ctaText?: string; leaseLabel?: string; finePrint?: string; dealerName?: string } }
  | { action: "swap_jellybean"; offerId: string; jellybeanUrl: string; jellybeanId: string; colorFamily: string };

type ApiContentBlock =
  | { type: "text"; text: string }
  | { type: "image"; source: { type: "base64"; media_type: string; data: string } }
  | { type: "document"; source: { type: "base64"; media_type: "application/pdf"; data: string } };

type ApiMessage = { role: "user" | "assistant"; content: string | ApiContentBlock[] };

type Role = "user" | "assistant";

interface TextMessage    { id: string; role: Role;        type: "text";      content: string; isGenerateAssetsPrompt?: boolean; applied?: boolean; totalGenerated?: number }
interface ToolChipMsg    { id: string; role: "assistant"; type: "tool";      name: string; input: Record<string, unknown> }
interface ProposalMsg    { id: string; role: "assistant"; type: "proposal";  input: ProposalInput; applied: boolean }
interface SetupMsg       { id: string; role: "assistant"; type: "setup";     input: SetupInput;    applied: boolean }
interface OffersMsg      { id: string; role: "assistant"; type: "offers";    input: OffersInput;   applied: boolean }
interface TemplatesMsg    { id: string; role: "assistant"; type: "templates"; input: TemplatesInput; applied: boolean }
interface BrandMsg        { id: string; role: "assistant"; type: "brand";       input: BrandInput;        applied: boolean }
interface BackgroundsMsg  { id: string; role: "assistant"; type: "backgrounds"; input: BackgroundsInput;  applied: boolean }
interface PreviewMsg      { id: string; role: "assistant"; type: "preview";     offerIds: string[];       templateIds: string[] }
interface ContinuationMsg { id: string; role: "user";     type: "continuation"; content: string }
interface EmailMsg        { id: string; role: "assistant"; type: "email";       input: EmailInput;        applied: boolean }
interface ShareMsg        { id: string; role: "assistant"; type: "share";       input: ShareInput;        applied: boolean }
interface NotifyOwnersMsg { id: string; role: "assistant"; type: "notify_owners"; input: NotifyOwnersInput; applied: boolean; liveOwners?: Record<string, string>; }
interface TaskOwnersInput {
  owners?: Record<string, string>;
  suggested_owners?: Array<{ section: string; name: string }>;
}
interface TaskOwnersMsg { id: string; role: "assistant"; type: "task_owners"; input: TaskOwnersInput; applied: boolean; liveOwners?: Record<string, string>; }
interface ProactiveQuestionsInput { intro_line?: string; }
interface ProactiveQuestionsMsg {
  id: string; role: "assistant"; type: "proactive_questions";
  input: ProactiveQuestionsInput; applied: boolean;
}
interface UserFileMsg     { id: string; role: "user"; type: "user_file"; text: string; files: { name: string; type: string }[]; apiContent: ApiContentBlock[] }
interface ParsedOffersMsg { id: string; role: "assistant"; type: "parsed_offers"; input: ParsedOffersInput; applied: boolean }
interface ReviewerPickerMsg {
  id: string; role: "assistant"; type: "reviewer_picker"; applied: boolean;
  recipientHints?: string[];
}
interface CampaignCtaMsg { id: string; role: "assistant"; type: "campaign_cta"; }
interface DealerBgProposalMsg {
  id: string; role: "assistant"; type: "dealer_bg_proposal";
  bgObject: { id: string; name: string; thumbnail: string; images: Record<string, string> };
  previewUrl: string; applied: boolean;
}

type Message = TextMessage | ToolChipMsg | ProposalMsg | SetupMsg | OffersMsg | TemplatesMsg | BrandMsg | BackgroundsMsg | PreviewMsg | ContinuationMsg | EmailMsg | ShareMsg | UserFileMsg | ParsedOffersMsg | NotifyOwnersMsg | TaskOwnersMsg | ProactiveQuestionsMsg | DealerBgProposalMsg | ReviewerPickerMsg | CampaignCtaMsg;

interface ProposalInput {
  project_name?: string; offer_ids: string[]; template_ids: string[];
  start_date?: string; end_date?: string; rationale: string;
}
interface SetupInput {
  project_name: string; account?: string; oem: string;
  start_date: string; end_date: string;
  flow_scope?: "full" | "offers_only" | "templates_only" | "offers_and_templates" | "templates_and_email" | "offers_and_email" | "full_dealer_bg";
  flow_steps?: string[]; owner?: string; platforms?: string[];
}
interface OffersInput      { offer_ids: string[]; rationale: string; }
interface TemplatesInput   { template_ids: string[]; rationale: string; }
interface BrandInput       { oem: string; rationale: string; }
interface BackgroundsInput { background_ids: string[]; rationale: string; }
interface EmailInput       { recipient_hint?: string; message: string; }
interface ShareInput {
  recipient_hint: string; project_name?: string;
  mechanism?: "email" | "platform";
  selectedContacts?: Array<{ name: string; email: string; group: "constellation" | "dealer" | "internal" }>;
}
interface NotifyOwnersInput { owners?: Record<string, string>; }
interface ParsedOfferRow {
  id: string; year: string; make: string; model: string; trim?: string;
  offer_type: string; monthly_payment: string; term: string;
  due_at_signing?: string; apr?: string; notes?: string;
  field_confidence: Record<string, "high" | "medium" | "low">;
}
interface ParsedOffersInput {
  source: string; offers: ParsedOfferRow[]; extraction_notes?: string;
}

// ─── Custom header icons ───────────────────────────────────────────────────────
function IconHistory() {
  return (
    <svg width="24" height="24" viewBox="0 0 34 30" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17 11.4583V14.9999L19.9167 17.9166" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M9.28906 8.95825V12.2916H12.6224" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M9.71094 17.5695C10.7707 20.5634 13.6301 22.7084 16.9913 22.7084C21.2547 22.7084 24.7109 19.2573 24.7109 15.0001C24.7109 10.7429 21.2547 7.29175 16.9913 7.29175C13.7927 7.29175 11.0484 9.2343 9.87716 12.0024" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function IconExpand() {
  return (
    <svg width="24" height="24" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16.4583 8.125H21.875V13.5417M16.4583 13.5417L21.2305 8.76953M13.5417 16.4583L8.76953 21.2305M8.125 16.4583V21.875H13.5417" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function IconClose() {
  return (
    <svg width="24" height="24" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M11.4609 11.4583L18.5443 18.5416M18.5443 11.4583L11.4609 18.5416" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

// ─── Shared constants ──────────────────────────────────────────────────────────
const AVAILABLE_ACCOUNTS = ["Honda of Anywhere", "BMW Seattle", "Spiriva Pharma", "Multiple Brands Inc.", "Honda City"];
const AVAILABLE_BRANDS   = ["Honda", "BMW", "Spiriva", "Volkswagen", "Audi", "General"];

const MOCK_CONTACTS = [
  { name: "Luke Theobald", email: "luke.theobald@helloconstellation.com", group: "constellation" as const },
  { name: "Jenny Park",    email: "jenny.park@helloconstellation.com",    group: "constellation" as const },
  { name: "Sonya Koh",     email: "sonya.koh@helloconstellation.com",     group: "constellation" as const },
  { name: "Zak Flaten",    email: "zak.flaten@helloconstellation.com",    group: "constellation" as const },
  { name: "Rachel Hui",    email: "rachel.hui@helloconstellation.com",    group: "constellation" as const },
  { name: "Mike Henderson",  email: "mike.henderson@hondaofanywhere.com", group: "dealer" as const },
  { name: "Sarah Collins",   email: "sarah.collins@hondaofanywhere.com",  group: "dealer" as const },
  { name: "James Whitaker",  email: "james.whitaker@hondaofanywhere.com", group: "dealer" as const },
  { name: "Ashley Morgan",   email: "ashley.morgan@hondaofanywhere.com",  group: "dealer" as const },
  { name: "Katelyn Gray",    email: "katelyn.gray@emichvw.com",           group: "dealer" as const },
  { name: "Jenni Eckhart",   email: "jenni.eckhart@helloconstellation.com", group: "internal" as const },
];

// ─── Scene backgrounds ─────────────────────────────────────────────────────────
const SCENE_BACKGROUNDS = [
  { id: "dirt-road",                name: "Dirt Road",            thumbnail: "https://res.cloudinary.com/dvq75cqna/image/upload/v1780071536/vw-funds/public/backgrounds/Dirt-Road-HO_251027_1_Display_300x250_1.png" },
  { id: "gold-flare",               name: "Gold Flare",           thumbnail: "https://res.cloudinary.com/dvq75cqna/image/upload/v1780071581/vw-funds/public/backgrounds/Gold-Flare-HO_251027_3_Display_300x250_1.png" },
  { id: "purple-city",              name: "Purple City",          thumbnail: "https://res.cloudinary.com/dvq75cqna/image/upload/v1780071599/vw-funds/public/backgrounds/Purple-City-HO_251229_D_Keeler_Display_300x250_1.png" },
  { id: "snow-house",               name: "Snow House",           thumbnail: "https://res.cloudinary.com/dvq75cqna/image/upload/v1780071611/vw-funds/public/backgrounds/Snow-House-HO_251120_2_Display_300x250_1.png" },
  { id: "ballon-festival",          name: "Balloon Festival",     thumbnail: "https://res.cloudinary.com/dvq75cqna/image/upload/v1780071509/vw-funds/public/backgrounds/Ballon_Festival/1777265296524_9d7c8327.jpg" },
  { id: "beach-sunset",             name: "Beach Sunset",         thumbnail: "https://res.cloudinary.com/dvq75cqna/image/upload/v1780071515/vw-funds/public/backgrounds/Beach_Sunset/BM_250724_2_DISPLAY_300x250.jpg" },
  { id: "desert-day",               name: "Desert Day",           thumbnail: "https://res.cloudinary.com/dvq75cqna/image/upload/v1780071522/vw-funds/public/backgrounds/Desert_Day/tmp_b9mipxq_1080x1080_1774762572901_300x250_1774892650125.jpg" },
  { id: "desert-pyramid-night-sky", name: "Desert Pyramid Night", thumbnail: "https://res.cloudinary.com/dvq75cqna/image/upload/v1780071533/vw-funds/public/backgrounds/Desert_Pyramid_Night_Sky/1777056196506_131012de.jpg" },
  { id: "docks-midday",             name: "Docks Midday",         thumbnail: "https://res.cloudinary.com/dvq75cqna/image/upload/v1780071549/vw-funds/public/backgrounds/Docks_Midday/BM_250515_1_SOCIAL_1080x1080_300x250_1774892650098.jpg" },
  { id: "field-with-mountain",      name: "Field With Mountain",  thumbnail: "https://res.cloudinary.com/dvq75cqna/image/upload/v1780071563/vw-funds/public/backgrounds/Field_With_Mountain/1777014100078_094e3bd4.jpg" },
  { id: "forest-lodge",             name: "Forest Lodge",         thumbnail: "https://res.cloudinary.com/dvq75cqna/image/upload/v1780071569/vw-funds/public/backgrounds/Forest_Lodge/1777217113411_a7cf6a69.jpg" },
  { id: "frozen-lake-night",        name: "Frozen Lake Night",    thumbnail: "https://res.cloudinary.com/dvq75cqna/image/upload/v1780071579/vw-funds/public/backgrounds/Frozen_Lake_Night/1777303348542_7657d84b.jpg" },
  { id: "ice-lab",                  name: "Ice Lab",              thumbnail: "https://res.cloudinary.com/dvq75cqna/image/upload/v1780071589/vw-funds/public/backgrounds/Ice_Lab/1777123961113_36260ab2.jpg" },
  { id: "stadium-night",            name: "Stadium Night",        thumbnail: "https://res.cloudinary.com/dvq75cqna/image/upload/v1780071628/vw-funds/public/backgrounds/Stadium_Night/BM_250825_1C_Display_300x250.jpg" },
];

type ReviewerContact = typeof MOCK_CONTACTS[number];

// ─── Gradient button sx helper ─────────────────────────────────────────────────
const gradientBtnSx = {
  background: "linear-gradient(99deg, #473bab 0%, #6356e1 100%)",
  color: "white", borderRadius: "100px", fontSize: "13px", fontWeight: 500,
  letterSpacing: "0.46px", textTransform: "none" as const,
  "&:hover": { background: "linear-gradient(99deg, #392e8a 0%, #5040cc 100%)" },
  "&.Mui-disabled": { opacity: 0.4, color: "white", background: "linear-gradient(99deg, #473bab 0%, #6356e1 100%)" },
};

const dismissBtnSx = {
  borderRadius: "100px", fontSize: "13px", color: "text.secondary",
  textTransform: "none" as const, px: "14px",
  "&:hover": { bgcolor: "rgba(0,0,0,0.05)" },
};

const cardSx = {
  borderRadius: "14px", border: "1px solid rgba(0,0,0,0.1)",
  bgcolor: "background.paper", overflow: "hidden",
  boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
};

// ─── TemplatesProposalCard ─────────────────────────────────────────────────────
interface TemplatesCardProps {
  input: TemplatesInput;
  context: ProjectContextPayload | null;
  onApply: (templateIds: string[]) => void;
  onDismiss: () => void;
  proactive?: boolean;
  platforms?: string[];
}
function TemplatesProposalCard({ input, context, onApply, onDismiss, proactive, platforms }: TemplatesCardProps) {
  const allTemplates = context?.availableTemplates ?? [];

  const matchesPlatforms = (format: string) => {
    if (!platforms || platforms.length === 0) return true;
    const f = format.toLowerCase();
    return platforms.some(p => {
      if (p === "google-pmax") return true;
      if (p === "website") return f.includes("website") || f.includes("mobile");
      if (p === "facebook" || p === "meta") return f.includes("social");
      if (p === "google-display") return f.includes("display");
      return false;
    });
  };

  const [templateIds, setTemplateIds] = useState<string[]>(() =>
    platforms && platforms.length > 0
      ? input.template_ids.filter(id => {
          const t = allTemplates.find(x => x.id === id);
          return !t || matchesPlatforms(t.format);
        })
      : input.template_ids
  );
  const [applied,    setApplied]    = useState(false);
  const [zoneTpl,    setZoneTpl]    = useState<TemplateInfo | null>(null);
  const templates = allTemplates.filter(t => matchesPlatforms(t.format));
  const [manualMode, setManualMode] = useState(false);
  const autoApplyRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!proactive || manualMode || applied) return;
    autoApplyRef.current = setTimeout(() => { setApplied(true); onApply(templateIds); }, 5000);
    return () => { if (autoApplyRef.current) clearTimeout(autoApplyRef.current); };
  }, [proactive, manualMode, applied]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    window.dispatchEvent(new CustomEvent(AGENT_SCROLL_TO_SECTION_EVENT, { detail: { section: "templates" } }));
  }, []);

  if (applied) {
    return (
      <Box sx={{ ml: "32px", mt: "4px" }}>
        <ConfirmedChip label={`${templateIds.length} template${templateIds.length !== 1 ? "s" : ""} added`} />
      </Box>
    );
  }

  return (
    <>
      {zoneTpl && createPortal(
        <TemplateZoneEditor templateId={zoneTpl.id} templateName={zoneTpl.name} onClose={() => setZoneTpl(null)} />,
        document.body,
      )}
      <Box sx={{ ml: "32px", mt: "4px", display: "flex", flexDirection: "column", gap: "8px" }}>
        {/* Rationale */}
        <Box sx={{ pl: "2px" }}>
          <Typography sx={{ fontSize: 12, color: "rgb(31,29,37)", lineHeight: 1.43, letterSpacing: "0.17px" }}>
            {input.rationale}
          </Typography>
          <WhyThese content={
            <Box sx={{ fontSize: 12, color: "rgb(31,29,37)", lineHeight: 1.43, letterSpacing: "0.17px" }}>
              <Typography sx={{ fontWeight: 600, mb: "4px", fontSize: "inherit" }}>How I picked these</Typography>
              <Typography sx={{ mb: "4px", fontSize: "inherit" }}>I select templates based on two priorities:</Typography>
              <Typography sx={{ mb: "2px", fontSize: "inherit" }}>• <strong>Format coverage</strong> — I aim to cover website banner, display leaderboard, and social square formats for maximum reach across placements.</Typography>
              <Typography sx={{ fontSize: "inherit" }}>• <strong>Brand match</strong> — templates tagged with your project's OEM are prioritised over generic multi-brand ones.</Typography>
            </Box>
          } />
        </Box>
        {/* Items card */}
        <Box sx={cardSx}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: "10px", px: "14px", py: "12px" }}>
            <Box>
              <Typography sx={{ fontSize: "10px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "text.disabled", mb: "4px" }}>
                Templates · {templateIds.length} selected
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: "4px", maxHeight: "40vh", overflowY: "auto", pr: "2px" }}>
                {templateIds.map((id) => {
                  const t = templates.find(x => x.id === id);
                  return (
                    <Box key={id} sx={{ display: "flex", alignItems: "center", gap: "8px", px: "10px", py: "7px", borderRadius: "8px", bgcolor: "#f5f4f8" }}>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ fontSize: "12px", fontWeight: 500, color: "#1f1d25", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {t ? t.name : id}
                        </Typography>
                        {t && <Typography sx={{ fontSize: "10.5px", color: "text.secondary", mt: "1px" }}>{t.format} · {t.width}×{t.height} · {t.brand}</Typography>}
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
                        {t && (
                          <IconButton size="small" onClick={() => setZoneTpl(t)} title="Edit Zone" sx={{ color: "#686576", "&:hover": { color: "primary.main" }, p: "2px" }}>
                            <VisibilityIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        )}
                        <IconButton size="small" onClick={() => setTemplateIds(p => p.filter(x => x !== id))} sx={{ color: "#686576", "&:hover": { color: "#dc2626" }, p: "2px" }}>
                          <DeleteIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Box>
                    </Box>
                  );
                })}
                <AgentAddSelect
                  placeholder="Add another template…"
                  onAdd={v => setTemplateIds(p => [...p, v])}
                  options={templates.filter(t => !templateIds.includes(t.id)).map(t => ({ value: t.id, label: `${t.name} — ${t.format}` }))}
                />
              </Box>
            </Box>
            {/* Customize hint */}
            <Box sx={{ display: "flex", alignItems: "flex-start", gap: "6px", px: "2px", pt: "2px" }}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
                <circle cx="6" cy="6" r="5.5" stroke="#6356e1" strokeOpacity="0.5"/>
                <path d="M6 5.5V8.5M6 3.5V4.5" stroke="#6356e1" strokeOpacity="0.7" strokeLinecap="round"/>
              </svg>
              <Typography sx={{ fontSize: 11, color: "text.secondary", lineHeight: 1.5 }}>
                These templates are all customizable. Click the <strong style={{ color: "#1f1d25" }}>⋮</strong> menu on any template card and select <strong style={{ color: "#473bab" }}>Edit Zone</strong> to customize.
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: "8px", pt: "2px" }}>
              <Button fullWidth onClick={() => { onApply(templateIds); setApplied(true); }} disabled={templateIds.length === 0} sx={{ ...gradientBtnSx, py: "8px" }}>
                Add templates
              </Button>
              <Button onClick={onDismiss} sx={dismissBtnSx}>Dismiss</Button>
            </Box>
          </Box>
          {proactive && !manualMode && !applied && (
            <ProactiveAutoApplyBar delay={5000} onCancel={() => { if (autoApplyRef.current) clearTimeout(autoApplyRef.current); setManualMode(true); }} />
          )}
        </Box>
      </Box>
    </>
  );
}

// ─── Brand Proposal Card ───────────────────────────────────────────────────────
function normalizeOem(raw: string): string {
  if (!raw) return "";
  const direct = AVAILABLE_BRANDS.find(b => b === raw);
  if (direct) return direct;
  const cleaned = raw.replace(/_/g, " ").trim().toLowerCase();
  return AVAILABLE_BRANDS.find(b => cleaned.startsWith(b.toLowerCase()) || b.toLowerCase().startsWith(cleaned)) ?? raw;
}

interface BrandCardProps {
  input: BrandInput; projectName?: string;
  onApply: (oem: string) => void; onDismiss: () => void; proactive?: boolean;
}
function BrandProposalCard({ input, projectName, onApply, onDismiss, proactive }: BrandCardProps) {
  const [oem,     setOem]     = useState(() => normalizeOem(input.oem));
  const [applied, setApplied] = useState(false);
  const [manualMode, setManualMode] = useState(false);
  const autoApplyRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!proactive || manualMode || applied) return;
    autoApplyRef.current = setTimeout(() => { setApplied(true); onApply(oem); }, 5000);
    return () => { if (autoApplyRef.current) clearTimeout(autoApplyRef.current); };
  }, [proactive, manualMode, applied]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    window.dispatchEvent(new CustomEvent(AGENT_SCROLL_TO_SECTION_EVENT, { detail: { section: "theme" } }));
  }, []);

  if (applied) {
    return <Box sx={{ ml: "32px", mt: "4px" }}><ConfirmedChip label={`${oem} brand kit activated`} /></Box>;
  }

  return (
    <Box sx={{ ml: "32px", mt: "4px", display: "flex", flexDirection: "column", gap: "8px" }}>
      <Box sx={{ pl: "2px" }}>
        <Typography sx={{ fontSize: 12, color: "rgb(31,29,37)", lineHeight: 1.43, letterSpacing: "0.17px" }}>{input.rationale}</Typography>
        <WhyThese content={
          <Box sx={{ fontSize: 12, color: "rgb(31,29,37)", lineHeight: 1.43, letterSpacing: "0.17px" }}>
            <Typography sx={{ fontWeight: 600, mb: "4px", fontSize: "inherit" }}>How I picked this</Typography>
            <Typography sx={{ fontSize: "inherit" }}>• <strong>Brand consistency</strong> — the kit matches the OEM on your project, ensuring logos, colours, and typography align with the manufacturer's guidelines across all ad formats.</Typography>
          </Box>
        } />
      </Box>
      <Box sx={cardSx}>
        {projectName && (
          <Box sx={{ px: "14px", pt: "10px", pb: "8px", borderBottom: "1px solid rgba(0,0,0,0.06)", bgcolor: "#fafafa" }}>
            <Typography sx={{ fontSize: 10.5, color: "text.disabled" }}>
              Project: <strong style={{ color: "#1f1d25" }}>{projectName}</strong>
            </Typography>
          </Box>
        )}
        <Box sx={{ display: "flex", flexDirection: "column", gap: "10px", px: "14px", py: "12px" }}>
          <Box>
            <Typography sx={{ fontSize: "10px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "text.disabled", mb: "4px" }}>Brand / Theme Kit</Typography>
            <AgentSelect value={oem} onChange={setOem} options={AVAILABLE_BRANDS.map(b => ({ value: b, label: b }))} />
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: "8px", pt: "2px" }}>
            <Button fullWidth onClick={() => { onApply(oem); setApplied(true); }} sx={{ ...gradientBtnSx, py: "8px" }}>
              Activate brand kit
            </Button>
            <Button onClick={onDismiss} sx={dismissBtnSx}>Skip</Button>
          </Box>
        </Box>
        {proactive && !manualMode && !applied && (
          <ProactiveAutoApplyBar delay={5000} onCancel={() => { if (autoApplyRef.current) clearTimeout(autoApplyRef.current); setManualMode(true); }} />
        )}
      </Box>
    </Box>
  );
}

// ─── Campaign CTA Card ─────────────────────────────────────────────────────────
function CampaignCtaCard() {
  return (
    <Box sx={{ ml: "32px", mr: "16px", mt: "4px", ...cardSx, boxShadow: "0px 1px 3px rgba(0,0,0,0.12), 0px 1px 1px rgba(0,0,0,0.14), 0px 2px 1px -1px rgba(0,0,0,0.2)" }}>
      <Box sx={{ display: "flex", flexDirection: "column", gap: "12px", p: "14px" }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#1f1d25", letterSpacing: "0.15px", lineHeight: 1.57 }}>Assets ready for campaign</Typography>
          <Typography sx={{ fontSize: 12, color: "#686576", letterSpacing: "0.17px", lineHeight: 1.43 }}>This is a pre-approved flow — your assets are set. Would you like to generate a campaign now?</Typography>
        </Box>
        <Button fullWidth onClick={() => window.dispatchEvent(new CustomEvent(AGENT_OPEN_CAMPAIGNS_EVENT))} sx={{ ...gradientBtnSx, py: "8px" }}>
          Go to Campaigns
        </Button>
      </Box>
    </Box>
  );
}

// ─── ReviewerPickerCard ────────────────────────────────────────────────────────
function ReviewerPickerCard({
  applied, projectName, projectUrl, onSend, recipientHints,
}: {
  applied: boolean; projectName: string; projectUrl: string;
  onSend: (contacts: ReviewerContact[], channels: Record<string, "platform" | "email">, message: string) => void;
  recipientHints?: string[];
}) {
  const [customContacts, setCustomContacts] = useState<ReviewerContact[]>([]);
  const allContacts = [...MOCK_CONTACTS, ...customContacts];

  const [selected, setSelected] = useState<ReviewerContact[]>(() => {
    if (recipientHints && recipientHints.length > 0) {
      const lowerHints = recipientHints.map(h => h.toLowerCase());
      return MOCK_CONTACTS.filter(c =>
        lowerHints.some(h => c.name.toLowerCase().includes(h) || h.includes(c.name.toLowerCase().split(" ")[0]))
      );
    }
    return MOCK_CONTACTS.filter(c => c.group !== "dealer");
  });
  const [message, setMessage] = useState(() => `I'd like to share the ${projectName} project with you. Please find the project link below:\n\n${projectUrl}`);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const emailInputRef = useRef<HTMLInputElement>(null);
  const [channels, setChannels] = useState<Record<string, "platform" | "email">>(
    () => Object.fromEntries(MOCK_CONTACTS.map(c => [c.email, c.group === "dealer" ? "email" : "platform"]))
  );
  const [menuAnchor, setMenuAnchor] = useState<{ el: HTMLElement; email: string } | null>(null);

  const toggleChannel = (email: string) =>
    setChannels(prev => ({ ...prev, [email]: prev[email] === "platform" ? "email" : "platform" }));
  const remove = (email: string) => setSelected(prev => prev.filter(c => c.email !== email));
  const add = (contact: ReviewerContact) => {
    setSelected(prev => prev.find(c => c.email === contact.email) ? prev : [...prev, contact]);
    setShowAddMenu(false);
  };
  const addByEmail = (raw: string) => {
    const email = raw.trim().toLowerCase();
    if (!email || !email.includes("@")) return;
    const existing = allContacts.find(c => c.email.toLowerCase() === email);
    if (existing) {
      if (!selected.find(s => s.email === existing.email)) setSelected(prev => [...prev, existing]);
    } else {
      const name = email.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, l => l.toUpperCase());
      const contact: ReviewerContact = { name, email, group: "dealer" };
      setCustomContacts(prev => [...prev, contact]);
      setChannels(prev => ({ ...prev, [email]: "email" }));
      setSelected(prev => [...prev, contact]);
    }
    setEmailInput(""); setShowAddMenu(false);
  };
  const available = allContacts.filter(c => !selected.find(s => s.email === c.email));
  const initials = (name: string) => name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

  if (applied) return <Box sx={{ ml: "32px", mt: "4px" }}><ConfirmedChip label="Sent for review" /></Box>;

  return (
    <Box sx={{ ml: "32px", mr: "16px", mt: "4px", ...cardSx, overflow: "visible", boxShadow: "0px 1px 3px rgba(0,0,0,0.12), 0px 1px 1px rgba(0,0,0,0.14), 0px 2px 1px -1px rgba(0,0,0,0.2)" }}>
      <Box sx={{ display: "flex", flexDirection: "column", gap: "12px", p: "14px" }}>
        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#1f1d25", letterSpacing: "0.15px", lineHeight: 1.57 }}>Share for review</Typography>
          <Box sx={{ display: "flex", alignItems: "center", px: "6px", py: "3px", borderRadius: "8px", bgcolor: "#fafaff", minHeight: 24 }}>
            <Typography sx={{ fontSize: 11, color: "#6356e1", letterSpacing: "0.16px", lineHeight: "18px" }}>{selected.length} selected</Typography>
          </Box>
        </Box>

        {/* Contact list */}
        <Box sx={{ display: "flex", flexDirection: "column", borderRadius: "12px", overflow: "hidden" }}>
          {selected.map((contact, i) => (
            <Box key={contact.email} sx={{ position: "relative" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: "12px", px: "8px", py: "4px" }}>
                <Avatar sx={{ width: 24, height: 24, bgcolor: "#f4f5f6", fontSize: 9, color: "#473bab", letterSpacing: "0.4px" }}>
                  {initials(contact.name)}
                </Avatar>
                <Box sx={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0, py: "4px" }}>
                  <Typography sx={{ fontSize: 12, color: "#1f1d25", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{contact.name}</Typography>
                  <Typography sx={{ fontSize: 11, color: "#686576", letterSpacing: "0.4px" }}>
                    {channels[contact.email] === "platform" ? "Platform Message" : contact.email}
                  </Typography>
                </Box>
                <IconButton size="small" onClick={e => setMenuAnchor({ el: e.currentTarget, email: contact.email })} sx={{ p: "5px" }}>
                  <MoreVertIcon sx={{ fontSize: 14, color: "#686576" }} />
                </IconButton>
                <Menu anchorEl={menuAnchor?.email === contact.email ? menuAnchor.el : null} open={menuAnchor?.email === contact.email} onClose={() => setMenuAnchor(null)}>
                  <MenuItem onClick={() => { toggleChannel(contact.email); setMenuAnchor(null); }}>
                    {channels[contact.email] === "platform" ? "Notify by Email" : "Notify by Platform Message"}
                  </MenuItem>
                  <MenuItem onClick={() => { remove(contact.email); setMenuAnchor(null); }} sx={{ color: "#dc2626" }}>
                    Remove contact
                  </MenuItem>
                </Menu>
              </Box>
              {i < selected.length - 1 && <Divider />}
            </Box>
          ))}
        </Box>

        {/* Add contact */}
        <Box sx={{ position: "relative" }}>
          <Button fullWidth variant="outlined" onClick={() => { setShowAddMenu(v => !v); setTimeout(() => emailInputRef.current?.focus(), 50); }}
            sx={{ borderRadius: "100px", borderColor: "#473bab", color: "#473bab", fontSize: "13px", fontWeight: 500, textTransform: "none", "&:hover": { bgcolor: "rgba(71,59,171,0.04)" } }}>
            Include Contact
          </Button>
          {showAddMenu && (
            <Box sx={{ position: "absolute", top: "100%", left: 0, right: 0, mt: "4px", bgcolor: "background.paper", borderRadius: "8px", border: "1px solid rgba(0,0,0,0.12)", zIndex: 20, overflow: "hidden", boxShadow: "0px 4px 12px rgba(0,0,0,0.12)" }}>
              {available.map(contact => (
                <Box component="button" key={contact.email} onClick={() => add(contact)}
                  sx={{ width: "100%", display: "flex", alignItems: "center", gap: "10px", px: "12px", py: "8px", bgcolor: "transparent", border: "none", cursor: "pointer", textAlign: "left", "&:hover": { bgcolor: "#f5f4ff" } }}>
                  <Avatar sx={{ width: 24, height: 24, bgcolor: "#f4f5f6", fontSize: 9, color: "#473bab" }}>{initials(contact.name)}</Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontSize: 12, color: "#1f1d25" }}>{contact.name}</Typography>
                    <Typography sx={{ fontSize: 10, color: "#686576" }}>{contact.email}</Typography>
                  </Box>
                </Box>
              ))}
              {available.length > 0 && <Divider sx={{ mx: "12px" }} />}
              <Box sx={{ display: "flex", alignItems: "center", gap: "8px", px: "12px", py: "8px" }}>
                <InputBase
                  inputRef={emailInputRef}
                  type="email" value={emailInput}
                  onChange={e => setEmailInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addByEmail(emailInput); } }}
                  placeholder="Enter email address..."
                  sx={{ flex: 1, fontSize: "12px", color: "#1f1d25" }}
                />
                <IconButton size="small" onClick={() => addByEmail(emailInput)} disabled={!emailInput.includes("@")}
                  sx={{ width: 20, height: 20, bgcolor: "#473bab", color: "white", "&:hover": { bgcolor: "#392e8a" }, "&.Mui-disabled": { opacity: 0.3, bgcolor: "#473bab", color: "white" } }}>
                  <AddIcon sx={{ fontSize: 10 }} />
                </IconButton>
              </Box>
            </Box>
          )}
        </Box>

        {/* Message textarea */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <Typography sx={{ fontSize: 12, color: "#686576", px: "4px" }}>Message</Typography>
          <TextField
            value={message} onChange={e => setMessage(e.target.value)}
            multiline rows={4} fullWidth size="small"
            sx={{ "& .MuiOutlinedInput-root": { fontSize: 12, bgcolor: "#f9fafa", borderRadius: "4px" } }}
          />
        </Box>

        {/* Send */}
        <Button fullWidth onClick={() => selected.length > 0 && onSend(selected, channels, message)} disabled={selected.length === 0} sx={{ ...gradientBtnSx, py: "8px" }}>
          Send Message
        </Button>
      </Box>
    </Box>
  );
}

// ─── DealerBgPreviewImage ──────────────────────────────────────────────────────
function DealerBgPreviewImage({ src }: { src: string }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <>
      <Box sx={{ position: "absolute", inset: 0, zIndex: 1, opacity: loaded ? 0 : 1, transition: "opacity 0.3s ease", bgcolor: "#ececf2", pointerEvents: "none" }} />
      <Box component="img" src={src} alt="Generated background preview"
        sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block", opacity: loaded ? 1 : 0, transition: "opacity 0.3s ease" }}
        onLoad={() => setLoaded(true)} onError={() => setLoaded(true)} />
    </>
  );
}

// ─── GenerateAssetsSmartCard ───────────────────────────────────────────────────
function GenerateAssetsSmartCard({
  context, confirmedBackgroundIds, applied, totalGenerated,
}: {
  context: ProjectContextPayload | null; confirmedBackgroundIds: string[]; applied: boolean; totalGenerated?: number;
}) {
  if (applied) {
    return <Box sx={{ ml: "32px", mt: "4px" }}><ConfirmedChip label={`${totalGenerated ?? 0} assets generated`} /></Box>;
  }

  const selectedOffers = (context?.currentOfferIds ?? []).map(id => context?.availableOffers.find(o => o.id === id)).filter((o): o is NonNullable<typeof o> => Boolean(o));
  const selectedTemplates = (context?.currentTemplateIds ?? []).map(id => context?.availableTemplates.find(t => t.id === id)).filter((t): t is NonNullable<typeof t> => Boolean(t));
  const offerCount = selectedOffers.length;
  const templateCount = selectedTemplates.length;
  const bgCount = confirmedBackgroundIds.length > 0 ? confirmedBackgroundIds.length : 1;
  const total = Math.max(offerCount * templateCount * bgCount, 0);
  const adShells = bgCount;
  const offerNames = selectedOffers.slice(0, 4).map(o => o.model).join(" · ") || "—";
  const tmplDims = selectedTemplates.slice(0, 4).map(t => `${t.width}×${t.height}`).join(" · ") || "—";
  const bgNames = confirmedBackgroundIds.length > 0
    ? confirmedBackgroundIds.slice(0, 3).map(id => SCENE_BACKGROUNDS.find(b => b.id === id)?.name ?? id).join(" · ")
    : "No backgrounds";

  const listItems = [
    { icon: <LabelIcon sx={{ fontSize: 14, color: "#473bab" }} />, label: `${offerCount} Offer${offerCount !== 1 ? "s" : ""}`, sub: offerNames },
    { icon: <LayersIcon sx={{ fontSize: 14, color: "#473bab" }} />, label: "Templates", sub: tmplDims },
    { icon: <ImageIcon sx={{ fontSize: 14, color: "#473bab" }} />, label: `${confirmedBackgroundIds.length > 0 ? confirmedBackgroundIds.length : "No"} Background${confirmedBackgroundIds.length !== 1 ? "s" : ""}`, sub: bgNames },
  ];

  return (
    <Box sx={{ ml: "32px", mt: "4px", ...cardSx }}>
      <Box sx={{ display: "flex", flexDirection: "column", gap: "12px", p: "14px" }}>
        <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#1f1d25", letterSpacing: "0.15px" }}>Generate Assets</Typography>
        <Box>
          {listItems.map((item, i) => (
            <Box key={i} sx={{ display: "flex", alignItems: "center", gap: "12px", py: "10px", borderBottom: i < listItems.length - 1 ? "1px solid rgba(0,0,0,0.07)" : "none" }}>
              <Box sx={{ width: 36, height: 36, borderRadius: "100px", bgcolor: "#EEEEFF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {item.icon}
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#1f1d25", lineHeight: 1.4 }}>{item.label}</Typography>
                <Typography sx={{ fontSize: 11, color: "#686576", lineHeight: 1.4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", mt: "2px" }}>{item.sub}</Typography>
              </Box>
            </Box>
          ))}
        </Box>
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: "8px", p: "10px 12px", border: "1px solid #473bab", borderRadius: "8px", bgcolor: "rgba(71,59,171,0.04)" }}>
          <InfoIcon sx={{ fontSize: 14, color: "#473bab", flexShrink: 0, mt: "1px" }} />
          <Typography sx={{ fontSize: 12, color: "#473bab", lineHeight: 1.5 }}>
            <strong>{total} Assets</strong> will be grouped into <strong>{adShells} Ad Shell{adShells !== 1 ? "s" : ""}</strong> — one per background — each containing all format sizes for every offer.
          </Typography>
        </Box>
        <Box sx={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <Button fullWidth onClick={() => window.dispatchEvent(new CustomEvent(AGENT_GENERATE_ASSETS_EVENT))} sx={{ ...gradientBtnSx, py: "10px" }}>
            Generate {total} Assets
          </Button>
          <Button fullWidth variant="outlined" onClick={() => window.dispatchEvent(new CustomEvent(AGENT_SCROLL_TO_SECTION_EVENT, { detail: { section: "adshells" } }))}
            sx={{ borderRadius: "100px", fontSize: 13, fontWeight: 500, color: "#473bab", borderColor: "rgba(99,86,225,0.5)", textTransform: "none", py: "10px", "&:hover": { bgcolor: "rgba(71,59,171,0.04)" } }}>
            Review First
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

// ─── BackgroundsProposalCard ───────────────────────────────────────────────────
interface BackgroundsCardProps {
  input: BackgroundsInput; onApply: (backgroundIds: string[]) => void;
  onDismiss: () => void; proactive?: boolean;
}
function BackgroundsProposalCard({ input, onApply, onDismiss }: BackgroundsCardProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [applied, setApplied] = useState(false);
  const [previewBg, setPreviewBg] = useState<string | null>(null);

  useEffect(() => {
    if (!previewBg) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setPreviewBg(null); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [previewBg]);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent(AGENT_SCROLL_TO_SECTION_EVENT, { detail: { section: "backgrounds" } }));
  }, []);

  const toggle = (id: string) => setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  if (applied) return <Box sx={{ ml: "32px", mt: "4px" }}><ConfirmedChip label={`${selectedIds.length} background${selectedIds.length !== 1 ? "s" : ""} added`} /></Box>;

  return (
    <Box sx={{ ml: "32px", mt: "4px", display: "flex", flexDirection: "column", gap: "8px" }}>
      <Box sx={{ pl: "2px" }}>
        <Typography sx={{ fontSize: 12, color: "rgb(31,29,37)", lineHeight: 1.43, letterSpacing: "0.17px" }}>{input.rationale}</Typography>
        <WhyThese content={
          <Box sx={{ fontSize: 12, color: "rgb(31,29,37)", lineHeight: 1.43, letterSpacing: "0.17px" }}>
            <Typography sx={{ fontWeight: 600, mb: "4px", fontSize: "inherit" }}>How I picked these</Typography>
            <Typography sx={{ mb: "2px", fontSize: "inherit" }}>• <strong>Environment variety</strong> — different lighting conditions and settings keep the creative fresh across placements and avoid visual repetition.</Typography>
            <Typography sx={{ fontSize: "inherit" }}>• <strong>Vehicle framing</strong> — I avoid overly generic or cluttered scenes, favouring open roads, urban vistas, and scenic backdrops that naturally frame the vehicle as the hero.</Typography>
          </Box>
        } />
      </Box>
      <Box sx={cardSx}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: "10px", px: "14px", py: "12px" }}>
          <Box>
            <Typography sx={{ fontSize: "10px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "text.disabled", mb: "8px" }}>
              Backgrounds · {selectedIds.length} selected
            </Typography>
            <Box sx={{ display: "flex", gap: "10px", overflowX: "auto", pb: "8px" }}>
              {SCENE_BACKGROUNDS.map(bg => {
                const isSelected = selectedIds.includes(bg.id);
                return (
                  <Box component="button" key={bg.id} onClick={() => toggle(bg.id)}
                    sx={{ flexNone: 0, flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", cursor: "pointer", width: 200, bgcolor: "transparent", border: "none", p: 0 }}>
                    <Box sx={{ position: "relative", width: "200px", height: "133px", borderRadius: "10px", overflow: "hidden", outline: isSelected ? "2px solid #473bab" : "2px solid transparent", outlineOffset: "1px", boxShadow: isSelected ? "0 0 0 3px rgba(71,59,171,0.15)" : "none" }}>
                      <Box component="img" src={bg.thumbnail} alt={bg.name} sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                      <Box sx={{ position: "absolute", top: "6px", left: "6px", zIndex: 10, width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "4px", bgcolor: isSelected ? "#473bab" : "rgba(255,255,255,0.88)", border: isSelected ? "none" : "1.5px solid rgba(0,0,0,0.28)", boxShadow: "0 1px 3px rgba(0,0,0,0.18)" }}>
                        {isSelected && <CheckIcon sx={{ fontSize: 11, color: "white" }} />}
                      </Box>
                      <IconButton size="small" onClick={e => { e.stopPropagation(); setPreviewBg(bg.thumbnail); }}
                        sx={{ position: "absolute", top: "6px", right: "6px", zIndex: 10, width: 26, height: 26, bgcolor: "rgba(0,0,0,0.5)", "&:hover": { bgcolor: "rgba(0,0,0,0.7)" }, opacity: 0, ".MuiButtonBase-root:hover + &": { opacity: 1 }, transition: "opacity 0.2s" }}>
                        <VisibilityIcon sx={{ fontSize: 13, color: "white" }} />
                      </IconButton>
                    </Box>
                    <Typography sx={{ fontSize: "9px", color: "text.secondary", textAlign: "center", lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", width: "100%" }}>
                      {bg.name}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: "8px", pt: "2px" }}>
            <Button fullWidth onClick={() => { onApply(selectedIds); setApplied(true); }} disabled={selectedIds.length === 0} sx={{ ...gradientBtnSx, py: "8px" }}>
              Add {selectedIds.length > 0 ? `${selectedIds.length} ` : ""}background{selectedIds.length !== 1 ? "s" : ""}
            </Button>
            <Button onClick={onDismiss} sx={dismissBtnSx}>Skip</Button>
          </Box>
        </Box>
      </Box>
      {previewBg && createPortal(
        <Box sx={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "rgba(0,0,0,0.75)" }}
          onClick={() => setPreviewBg(null)}>
          <Box sx={{ position: "relative", maxWidth: "90vw", maxHeight: "85vh", borderRadius: "12px", overflow: "hidden", boxShadow: 24 }}
            onClick={e => e.stopPropagation()}>
            <Box component="img" src={previewBg} alt="Background preview" sx={{ display: "block", maxWidth: "90vw", maxHeight: "85vh", objectFit: "contain" }} />
            <IconButton onClick={() => setPreviewBg(null)} size="small"
              sx={{ position: "absolute", top: "10px", right: "10px", width: 32, height: 32, bgcolor: "rgba(0,0,0,0.6)", color: "white", "&:hover": { bgcolor: "rgba(0,0,0,0.8)" } }}>
              <CloseIcon sx={{ fontSize: 14 }} />
            </IconButton>
          </Box>
        </Box>,
        document.body,
      )}
    </Box>
  );
}

// ─── ShareChooserCard ──────────────────────────────────────────────────────────
function ShareChooserCard({ input, projectName, applied, onChooseEmail, onChoosePlatform }: {
  input: ShareInput; projectName: string; applied: boolean;
  onChooseEmail: (recipientHint: string) => void;
  onChoosePlatform: (recipientName: string) => void;
}) {
  const recipient = input.recipient_hint || "the recipient";
  const firstName = recipient.split(" ")[0];
  const [chosen, setChosen] = useState<"email" | "platform" | null>(input.mechanism ?? null);
  const firedRef = useRef(false);

  useEffect(() => {
    if (input.mechanism && !firedRef.current) {
      firedRef.current = true;
      if (input.mechanism === "email") onChooseEmail(recipient);
      else onChoosePlatform(recipient);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (chosen === "email") return <Box sx={{ ml: "32px", mt: "4px" }}><ConfirmedChip label={`Opening email share for ${firstName}…`} /></Box>;
  if (chosen === "platform") return <Box sx={{ ml: "32px", mt: "4px" }}><ConfirmedChip label={`Platform notification sent to ${firstName}`} /></Box>;

  // Grouped contacts mode
  if (input.selectedContacts && input.selectedContacts.length > 0) {
    const emailContacts = input.selectedContacts.filter(c => c.group !== "dealer");
    const platformContacts = input.selectedContacts.filter(c => c.group === "dealer");
    const handleGroupedConfirm = () => {
      setChosen("email");
      if (emailContacts.length > 0) onChooseEmail(emailContacts.map(c => c.name).join(", "));
      if (platformContacts.length > 0) onChoosePlatform(platformContacts.map(c => c.name).join(", "));
    };
    type SC = NonNullable<typeof input.selectedContacts>[number];
    const ContactRow = ({ contact, method, color }: { contact: SC; method: string; color: string }) => (
      <Box sx={{ display: "flex", alignItems: "center", gap: "8px", py: "5px" }}>
        <Avatar sx={{ width: 22, height: 22, bgcolor: color, fontSize: 8, fontWeight: 700 }}>
          {contact.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
        </Avatar>
        <Typography sx={{ fontSize: 12, color: "text.primary", flex: 1 }}>{contact.name}</Typography>
        <Chip label={method} size="small" sx={{ fontSize: 10, bgcolor: "rgba(0,0,0,0.06)", height: 20 }} />
      </Box>
    );
    return (
      <Box sx={{ ml: "32px", mt: "4px", ...cardSx, maxWidth: 360 }}>
        <Box sx={{ px: "14px", pt: "10px", pb: "8px", borderBottom: "1px solid rgba(0,0,0,0.06)", bgcolor: "#fafafa" }}>
          <Typography sx={{ fontSize: 14, fontWeight: 700, color: "text.primary" }}>Ready to send</Typography>
          <Typography sx={{ fontSize: 10.5, color: "text.disabled", lineHeight: 1.4 }}>Here's how each reviewer will be notified.</Typography>
        </Box>
        <Box sx={{ px: "14px", py: "10px", display: "flex", flexDirection: "column" }}>
          {emailContacts.length > 0 && (
            <Box sx={{ mb: "6px" }}>
              <Typography sx={{ fontSize: "9px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "#c4c1d0", mb: "3px" }}>Via Email</Typography>
              {emailContacts.map(c => <ContactRow key={c.email} contact={c} method="Email" color="#473bab" />)}
            </Box>
          )}
          {platformContacts.length > 0 && (
            <Box sx={{ mb: "6px" }}>
              <Typography sx={{ fontSize: "9px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "#c4c1d0", mb: "3px" }}>Via Platform</Typography>
              {platformContacts.map(c => <ContactRow key={c.email} contact={c} method="Platform" color="#0d7a5f" />)}
            </Box>
          )}
          <Button onClick={handleGroupedConfirm} sx={{ ...gradientBtnSx, py: "8px", mt: "6px" }}>Confirm & Send</Button>
        </Box>
      </Box>
    );
  }

  const optionSx = (hover: string) => ({
    display: "flex", alignItems: "center", gap: "10px", px: "12px", py: "10px",
    borderRadius: "10px", border: "1px solid rgba(0,0,0,0.10)", bgcolor: "background.paper",
    cursor: "pointer", textAlign: "left" as const, width: "100%",
    "&:hover": { bgcolor: hover, borderColor: hover === "#f5f4ff" ? "rgba(99,86,225,0.35)" : "rgba(13,122,95,0.35)" },
    transition: "all 0.15s",
  });

  return (
    <Box sx={{ ml: "32px", mt: "4px", ...cardSx }}>
      <Box sx={{ px: "14px", pt: "10px", pb: "8px", borderBottom: "1px solid rgba(0,0,0,0.06)", bgcolor: "#fafafa" }}>
        <Typography sx={{ fontSize: 11, color: "text.secondary", lineHeight: 1.5 }}>
          How would you like to send to <strong style={{ color: "#1f1d25" }}>{recipient}</strong>?
        </Typography>
      </Box>
      <Box sx={{ display: "flex", flexDirection: "column", gap: "8px", px: "14px", py: "12px" }}>
        <Box component="button" onClick={() => { setChosen("email"); onChooseEmail(input.recipient_hint); }} sx={optionSx("#f5f4ff")}>
          <Box sx={{ width: 30, height: 30, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "rgba(99,86,225,0.10)", flexShrink: 0 }}>
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none"><rect x="2" y="5" width="16" height="11" rx="2" stroke="#6356e1" strokeWidth="1.5"/><path d="M2 7l8 5 8-5" stroke="#6356e1" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: 12, fontWeight: 500, color: "text.primary" }}>Send via Email</Typography>
            <Typography sx={{ fontSize: 10.5, color: "text.disabled" }}>Share a project link by email</Typography>
          </Box>
          <ChevronRightIcon sx={{ fontSize: 13, color: "text.disabled", flexShrink: 0 }} />
        </Box>
        <Box component="button" onClick={() => { setChosen("platform"); onChoosePlatform(input.recipient_hint); }} sx={optionSx("#f0faf7")}>
          <Box sx={{ width: 30, height: 30, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "rgba(13,122,95,0.10)", flexShrink: 0 }}>
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none"><path d="M10 2.5C7.1 2.5 4.7 4.7 4.7 7.5V11.5L3 13v.5h14V13l-1.7-1.5V7.5C15.3 4.7 12.9 2.5 10 2.5Z" stroke="#0d7a5f" strokeWidth="1.5" strokeLinejoin="round"/><path d="M8 13.5c0 1.1.9 2 2 2s2-.9 2-2" stroke="#0d7a5f" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: 12, fontWeight: 500, color: "text.primary" }}>Platform Communications</Typography>
            <Typography sx={{ fontSize: 10.5, color: "text.disabled" }}>Send an in-app notification</Typography>
          </Box>
          <ChevronRightIcon sx={{ fontSize: 13, color: "text.disabled", flexShrink: 0 }} />
        </Box>
      </Box>
    </Box>
  );
}

// ─── Task Owners Proposal Card ─────────────────────────────────────────────────
const TASK_SECTIONS = [
  { id: "offers", label: "Offers" }, { id: "templates", label: "Templates" },
  { id: "platforms", label: "Platforms" }, { id: "backgrounds", label: "Backgrounds" },
  { id: "brand", label: "Theme & Logos" }, { id: "assets", label: "Assets" },
  { id: "adshells", label: "Ad Shells" }, { id: "campaigns", label: "Campaigns" },
];

function TaskOwnersProposalCard({ input, liveOwners, onApply }: {
  input: TaskOwnersInput; liveOwners?: Record<string, string>;
  onApply: (owners: Record<string, string>) => void;
}) {
  const seededOwners = useMemo(() => {
    const seed: Record<string, string> = {};
    (input.suggested_owners ?? []).forEach(({ section, name }) => {
      const match = PROJECT_OWNERS.find(o => o.name.toLowerCase().includes(name.toLowerCase()));
      if (match) seed[section] = match.id;
    });
    return seed;
  }, [input.suggested_owners]);

  const [selections, setSelections] = useState<Record<string, string>>(() => {
    const base: Record<string, string> = { ...seededOwners };
    if (input.owners) {
      Object.entries(input.owners).forEach(([section, name]) => {
        const owner = PROJECT_OWNERS.find(o => o.name.toLowerCase().includes(name.toLowerCase()));
        if (owner) base[section] = owner.id;
      });
    }
    Object.assign(base, liveOwners);
    return base;
  });

  const [applied, setApplied] = useState(false);
  const [menuState, setMenuState] = useState<{ anchorEl: HTMLElement; sectionId: string } | null>(null);

  const handleConfirm = () => { onApply(selections); setApplied(true); };

  if (applied) {
    const count = Object.keys(selections).length;
    return <Box sx={{ ml: "32px", mt: "4px" }}><ConfirmedChip label={`Task owners set for ${count} section${count !== 1 ? "s" : ""}`} /></Box>;
  }

  return (
    <Box sx={{ ml: "32px", mt: "4px", ...cardSx }}>
      <Box sx={{ px: "14px", pt: "10px", pb: "8px", borderBottom: "1px solid rgba(0,0,0,0.06)", bgcolor: "#fafafa" }}>
        <Typography sx={{ fontSize: 11, fontWeight: 600, color: "text.primary" }}>Assign Task Owners</Typography>
        <Typography sx={{ fontSize: 10.5, color: "text.disabled", mt: "2px" }}>
          {input.suggested_owners?.length ? "Based on your team and recent campaigns, I'm proposing these task owners for your review." : "Choose a responsible owner for each section."}
        </Typography>
      </Box>
      <Box sx={{ display: "flex", flexDirection: "column" }}>
        {TASK_SECTIONS.map(({ id, label }) => {
          const ownerId = selections[id];
          const owner = PROJECT_OWNERS.find(o => o.id === ownerId);
          return (
            <Box key={id} sx={{ display: "flex", alignItems: "center", gap: "10px", px: "14px", py: "8px", borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
              <Typography sx={{ fontSize: 12, color: "text.secondary", flex: 1 }}>{label}</Typography>
              <Box component="button" onClick={e => setMenuState({ anchorEl: e.currentTarget, sectionId: id })}
                sx={{ display: "flex", alignItems: "center", gap: "6px", px: "8px", py: "4px", borderRadius: "8px", border: "1px solid rgba(0,0,0,0.10)", bgcolor: "#F9FAFA", cursor: "pointer", minWidth: "130px", textAlign: "left", "&:hover": { borderColor: "#473bab", bgcolor: "#f5f4ff" }, transition: "all 0.15s" }}>
                {owner ? (
                  <>
                    {owner.avatar
                      ? <Box component="img" src={owner.avatar} alt={owner.name} sx={{ width: 16, height: 16, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
                      : <AvatarInitials initials={owner.initials} size={16} bgColor={owner.color} />
                    }
                    <Typography sx={{ fontSize: 11, color: "text.primary", flex: 1 }}>{owner.name.split(" ")[0]}</Typography>
                  </>
                ) : (
                  <Typography sx={{ fontSize: 11, color: "text.disabled", flex: 1 }}>Unassigned</Typography>
                )}
                <ExpandMoreIcon sx={{ fontSize: 11, color: "text.disabled", flexShrink: 0 }} />
              </Box>
            </Box>
          );
        })}
      </Box>
      <Box sx={{ px: "14px", py: "10px", borderTop: "1px solid rgba(0,0,0,0.06)", display: "flex", justifyContent: "flex-end" }}>
        <Button onClick={handleConfirm} sx={{ ...gradientBtnSx, px: "14px", py: "7px", fontSize: 12, background: "linear-gradient(135deg, #6356e1 0%, #8B5CF6 100%)" }}>
          Apply Task Owners
        </Button>
      </Box>
      <Menu anchorEl={menuState?.anchorEl ?? null} open={Boolean(menuState)} onClose={() => setMenuState(null)}>
        <MenuItem onClick={() => { setSelections(p => { const n = { ...p }; if (menuState) delete n[menuState.sectionId]; return n; }); setMenuState(null); }}
          sx={{ display: "flex", alignItems: "center", gap: "8px", fontSize: 12, color: "text.disabled" }}>
          <Box sx={{ width: 16, height: 16, flexShrink: 0 }} />
          Unassigned
          {menuState && !selections[menuState.sectionId] && <CheckIcon sx={{ ml: "auto", fontSize: 11, color: "primary.main" }} />}
        </MenuItem>
        {PROJECT_OWNERS.map(o => (
          <MenuItem key={o.id} onClick={() => { if (menuState) setSelections(p => ({ ...p, [menuState.sectionId]: o.id })); setMenuState(null); }}
            sx={{ display: "flex", alignItems: "center", gap: "8px", fontSize: 12 }}>
            {o.avatar
              ? <Box component="img" src={o.avatar} alt={o.name} sx={{ width: 16, height: 16, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
              : <AvatarInitials initials={o.initials} size={16} bgColor={o.color} />
            }
            <Box sx={{ flex: 1 }}>{o.name}</Box>
            {menuState && selections[menuState.sectionId] === o.id && <CheckIcon sx={{ fontSize: 11, color: "primary.main" }} />}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
}

// ─── NotifyOwnersCard ──────────────────────────────────────────────────────────
function NotifyOwnersCard({ liveOwners, projectName, onApply }: {
  liveOwners?: Record<string, string>; projectName: string; onApply: () => void;
}) {
  const [chosen, setChosen] = useState<"email" | "platform" | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const resolvedOwners = useMemo(() => {
    const map = liveOwners ?? {};
    const seen = new Set<string>();
    return Object.entries(map)
      .map(([section, idOrName]) => {
        const owner = PROJECT_OWNERS.find(o => o.id === idOrName) ?? PROJECT_OWNERS.find(o => o.name.toLowerCase() === idOrName.toLowerCase());
        if (!owner || seen.has(owner.id)) return null;
        seen.add(owner.id);
        return { section, owner };
      })
      .filter((x): x is { section: string; owner: typeof PROJECT_OWNERS[number] } => x !== null);
  }, [liveOwners]);

  useEffect(() => {
    setMessage(`Hi team,\n\nI'd like to share the project "${projectName}" with you for your review and action.\n\nPlease find the project link below:\n\nhttps://constellation-ux-app.vercel.app/OEM/Projects\n\nThank you!`);
  }, [projectName]);

  if (resolvedOwners.length === 0) return <Box sx={{ ml: "32px", mt: "4px" }}><ConfirmedChip label="No task owners assigned yet" /></Box>;

  if (chosen === "platform") {
    return (
      <Box sx={{ ml: "32px", mt: "4px", ...cardSx }}>
        <Box sx={{ px: "14px", pt: "10px", pb: "8px", borderBottom: "1px solid rgba(0,0,0,0.06)", bgcolor: "#f0faf7" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: "7px" }}>
            <Box sx={{ width: 16, height: 16, borderRadius: "50%", bgcolor: "#0d7a5f", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <CheckIcon sx={{ fontSize: 9, color: "white" }} />
            </Box>
            <Typography sx={{ fontSize: 11, fontWeight: 600, color: "#0d7a5f" }}>Task owners notified via platform</Typography>
          </Box>
        </Box>
        <Box sx={{ display: "flex", flexDirection: "column", gap: "2px", px: "14px", py: "10px" }}>
          {resolvedOwners.map(({ section, owner }) => (
            <Box key={owner.id} sx={{ display: "flex", alignItems: "center", gap: "8px", py: "4px" }}>
              {owner.avatar ? <Box component="img" src={owner.avatar} alt={owner.name} sx={{ width: 22, height: 22, borderRadius: "50%", objectFit: "cover" }} /> : <AvatarInitials initials={owner.initials} size={22} bgColor={owner.color} />}
              <Typography sx={{ fontSize: 12, color: "text.primary" }}>{owner.name}</Typography>
              <Typography sx={{ fontSize: 10.5, color: "text.disabled", textTransform: "capitalize" }}>{section}</Typography>
            </Box>
          ))}
        </Box>
      </Box>
    );
  }

  if (chosen === "email") {
    if (emailSent) {
      const names = resolvedOwners.map(({ owner }) => owner.name.split(" ")[0]).join(", ");
      return <Box sx={{ ml: "32px", mt: "4px" }}><ConfirmedChip label={`Email sent to ${names}`} /></Box>;
    }
    return (
      <Box sx={{ ml: "32px", mt: "4px", ...cardSx }}>
        <Box sx={{ px: "14px", pt: "10px", pb: "8px", borderBottom: "1px solid rgba(0,0,0,0.06)", bgcolor: "#fafafa", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography sx={{ fontSize: 11, fontWeight: 600, color: "text.primary" }}>Email to task owners</Typography>
          <IconButton size="small" onClick={() => setChosen(null)} sx={{ color: "text.disabled" }}>
            <CloseIcon sx={{ fontSize: 12 }} />
          </IconButton>
        </Box>
        <Box sx={{ px: "14px", py: "12px", display: "flex", flexDirection: "column", gap: "10px" }}>
          <Box>
            <Typography sx={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "text.disabled", mb: "6px" }}>To</Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
              {resolvedOwners.map(({ owner }) => (
                <Box key={owner.id} sx={{ display: "flex", alignItems: "center", gap: "5px", px: "8px", py: "3px", borderRadius: "100px", bgcolor: "#F4F5F6" }}>
                  {owner.avatar ? <Box component="img" src={owner.avatar} alt={owner.name} sx={{ width: 14, height: 14, borderRadius: "50%", objectFit: "cover" }} /> : <AvatarInitials initials={owner.initials} size={14} bgColor={owner.color} />}
                  <Typography sx={{ fontSize: 11, color: "text.primary" }}>{owner.name}</Typography>
                </Box>
              ))}
            </Box>
          </Box>
          <Box>
            <Typography sx={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "text.disabled", mb: "6px" }}>Subject</Typography>
            <Typography sx={{ fontSize: 12, color: "text.primary" }}>Project shared: {projectName}</Typography>
          </Box>
          <Box>
            <Typography sx={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "text.disabled", mb: "6px" }}>Message</Typography>
            <TextField
              value={message} onChange={e => setMessage(e.target.value)}
              multiline fullWidth size="small"
              sx={{ "& .MuiOutlinedInput-root": { fontSize: 12, bgcolor: "#F9FAFA", borderRadius: "8px", minHeight: 80 } }}
            />
          </Box>
          <Button onClick={() => { onApply(); setEmailSent(true); }} startIcon={<svg width="13" height="13" viewBox="0 0 20 20" fill="none"><path d="M3 10l14-7-7 14V10H3z" fill="white"/></svg>}
            sx={{ ...gradientBtnSx, alignSelf: "flex-end", px: "14px", py: "7px", fontSize: 12, background: "linear-gradient(135deg, #6356e1 0%, #8B5CF6 100%)" }}>
            Send to all
          </Button>
        </Box>
      </Box>
    );
  }

  // Choice card
  const optionSx2 = (hover: string, hoverBorder: string) => ({
    display: "flex", alignItems: "center", gap: "10px", px: "12px", py: "10px",
    borderRadius: "10px", border: "1px solid rgba(0,0,0,0.10)", bgcolor: "background.paper",
    cursor: "pointer", textAlign: "left" as const, width: "100%",
    "&:hover": { bgcolor: hover, borderColor: hoverBorder },
    transition: "all 0.15s",
  });

  return (
    <Box sx={{ ml: "32px", mt: "4px", ...cardSx }}>
      <Box sx={{ px: "14px", pt: "10px", pb: "8px", borderBottom: "1px solid rgba(0,0,0,0.06)", bgcolor: "#fafafa" }}>
        <Typography sx={{ fontSize: 11, color: "text.secondary", lineHeight: 1.5 }}>
          Notify <strong style={{ color: "#1f1d25" }}>{resolvedOwners.length} task owner{resolvedOwners.length !== 1 ? "s" : ""}</strong>. How would you like to send?
        </Typography>
      </Box>
      <Box sx={{ display: "flex", flexDirection: "column", gap: "8px", px: "14px", py: "12px" }}>
        <Box component="button" onClick={() => setChosen("email")} sx={optionSx2("#f5f4ff", "rgba(99,86,225,0.35)")}>
          <Box sx={{ width: 30, height: 30, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "rgba(99,86,225,0.10)", flexShrink: 0 }}>
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none"><rect x="2" y="5" width="16" height="11" rx="2" stroke="#6356e1" strokeWidth="1.5"/><path d="M2 7l8 5 8-5" stroke="#6356e1" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: 12, fontWeight: 500, color: "text.primary" }}>Send via Email</Typography>
            <Typography sx={{ fontSize: 10.5, color: "text.disabled" }}>One email to all task owners</Typography>
          </Box>
          <ChevronRightIcon sx={{ fontSize: 13, color: "text.disabled", flexShrink: 0 }} />
        </Box>
        <Box component="button" onClick={() => { setChosen("platform"); onApply(); }} sx={optionSx2("#f0faf7", "rgba(13,122,95,0.35)")}>
          <Box sx={{ width: 30, height: 30, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "rgba(13,122,95,0.10)", flexShrink: 0 }}>
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none"><path d="M10 2.5C7.1 2.5 4.7 4.7 4.7 7.5V11.5L3 13v.5h14V13l-1.7-1.5V7.5C15.3 4.7 12.9 2.5 10 2.5Z" stroke="#0d7a5f" strokeWidth="1.5" strokeLinejoin="round"/><path d="M8 13.5c0 1.1.9 2 2 2s2-.9 2-2" stroke="#0d7a5f" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: 12, fontWeight: 500, color: "text.primary" }}>Platform Communications</Typography>
            <Typography sx={{ fontSize: 10.5, color: "text.disabled" }}>In-app notification to all owners</Typography>
          </Box>
          <ChevronRightIcon sx={{ fontSize: 13, color: "text.disabled", flexShrink: 0 }} />
        </Box>
      </Box>
      <Box sx={{ px: "14px", pb: "10px", display: "flex", flexWrap: "wrap", gap: "4px" }}>
        {resolvedOwners.map(({ section, owner }) => (
          <Box key={owner.id} sx={{ display: "flex", alignItems: "center", gap: "4px", px: "7px", py: "3px", borderRadius: "100px", bgcolor: "#F4F5F6" }}>
            {owner.avatar ? <Box component="img" src={owner.avatar} alt={owner.name} sx={{ width: 14, height: 14, borderRadius: "50%", objectFit: "cover" }} /> : <AvatarInitials initials={owner.initials} size={14} bgColor={owner.color} />}
            <Typography sx={{ fontSize: 11, color: "text.primary" }}>{owner.name.split(" ")[0]}</Typography>
            <Typography sx={{ fontSize: 10, color: "text.disabled", textTransform: "capitalize" }}>· {section}</Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

// ─── EmailProposalCard ─────────────────────────────────────────────────────────
interface EmailCardProps {
  input: EmailInput; projectName: string;
  onApply: (recipient: string, message: string) => void; onDismiss: () => void;
}
function EmailProposalCard({ input, projectName, onApply, onDismiss }: EmailCardProps) {
  const hint = (input.recipient_hint ?? "").trim();
  const knownContact = hint ? MOCK_CONTACTS.find(c => c.name.toLowerCase().includes(hint.toLowerCase()) || c.email.toLowerCase().includes(hint.toLowerCase())) : undefined;
  const isUnknownRecipient = !!hint && !knownContact;
  const [selectedEmails, setSelectedEmails] = useState<Set<string>>(() => knownContact ? new Set([knownContact.email]) : new Set());
  const [unknownEmail, setUnknownEmail] = useState("");
  const [message, setMessage] = useState(input.message);
  const [applied, setApplied] = useState(false);

  const toggleContact = (email: string) => setSelectedEmails(prev => {
    const next = new Set(prev); next.has(email) ? next.delete(email) : next.add(email); return next;
  });

  const getRecipientLabel = () => {
    if (isUnknownRecipient) return unknownEmail || hint;
    if (knownContact) return knownContact.name.split(" ")[0];
    return MOCK_CONTACTS.filter(c => selectedEmails.has(c.email)).map(c => c.name.split(" ")[0]).join(", ") || "recipient";
  };

  if (applied) return <Box sx={{ ml: "32px", mt: "4px" }}><ConfirmedChip label={`Email sent to ${getRecipientLabel()}`} /></Box>;

  const canSend = isUnknownRecipient ? unknownEmail.includes("@") : knownContact ? true : selectedEmails.size > 0;
  const handleSend = () => {
    const recipient = isUnknownRecipient ? unknownEmail : knownContact ? knownContact.email : [...selectedEmails].join(", ");
    onApply(recipient, message); setApplied(true);
  };

  const CONTACT_GROUPS = [{ key: "constellation" as const, label: "Constellation" }, { key: "dealer" as const, label: "Dealer" }];

  return (
    <Box sx={{ ml: "32px", mt: "4px", ...cardSx }}>
      <Box sx={{ px: "14px", pt: "10px", pb: "8px", borderBottom: "1px solid rgba(0,0,0,0.06)", bgcolor: "#fafafa" }}>
        <Typography sx={{ fontSize: 11, color: "text.secondary", lineHeight: 1.5 }}>
          Sharing project link for <strong style={{ color: "#1f1d25" }}>{projectName}</strong>
        </Typography>
      </Box>
      <Box sx={{ display: "flex", flexDirection: "column", gap: "10px", px: "14px", py: "12px" }}>
        <Box>
          <Typography sx={{ fontSize: "10px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "text.disabled", mb: "6px" }}>Send to</Typography>
          {knownContact && (
            <Box sx={{ display: "flex", alignItems: "center", gap: "8px", px: "10px", py: "8px", borderRadius: "8px", bgcolor: "rgba(71,59,171,0.08)", outline: "1.5px solid rgba(71,59,171,0.35)" }}>
              <Avatar sx={{ width: 28, height: 28, bgcolor: knownContact.group === "constellation" ? "#473bab" : "#0d7a5f", fontSize: 10, fontWeight: 700 }}>
                {knownContact.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontSize: 12, fontWeight: 500, color: "text.primary" }}>{knownContact.name}</Typography>
                <Typography sx={{ fontSize: 10, color: "text.disabled", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{knownContact.email}</Typography>
              </Box>
              <CheckIcon sx={{ fontSize: 13, color: "primary.main", flexShrink: 0 }} />
            </Box>
          )}
          {isUnknownRecipient && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <Typography sx={{ fontSize: 11.5, color: "text.secondary", lineHeight: 1.5 }}>
                I don't have <strong style={{ color: "#1f1d25" }}>"{hint}"</strong> in my contacts.
              </Typography>
              <TextField type="email" value={unknownEmail} onChange={e => setUnknownEmail(e.target.value)} placeholder="their@email.com" size="small" fullWidth
                sx={{ "& .MuiOutlinedInput-root": { fontSize: 12, bgcolor: "#fafafb" } }} />
            </Box>
          )}
          {!hint && (
            <Box sx={{ display: "flex", flexDirection: "column" }}>
              {CONTACT_GROUPS.map(group => {
                const contacts = MOCK_CONTACTS.filter(c => c.group === group.key);
                return (
                  <Box key={group.key}>
                    <Typography sx={{ fontSize: "9px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "#c4c1d0", px: "2px", mb: "3px", mt: "6px" }}>{group.label}</Typography>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: "3px", mb: "4px" }}>
                      {contacts.map(c => {
                        const isSelected = selectedEmails.has(c.email);
                        const avatarBg = group.key === "constellation" ? "#473bab" : "#0d7a5f";
                        return (
                          <Box component="button" key={c.email} onClick={() => toggleContact(c.email)}
                            sx={{ display: "flex", alignItems: "center", gap: "8px", px: "10px", py: "7px", borderRadius: "8px", cursor: "pointer", textAlign: "left", width: "100%", border: "none", bgcolor: isSelected ? "rgba(71,59,171,0.08)" : "#f5f4f8", outline: isSelected ? "1.5px solid rgba(71,59,171,0.35)" : "1.5px solid transparent", transition: "all 0.15s" }}>
                            <Avatar sx={{ width: 24, height: 24, bgcolor: avatarBg, fontSize: 9, fontWeight: 700 }}>
                              {c.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                            </Avatar>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography sx={{ fontSize: 12, fontWeight: 500, color: "text.primary" }}>{c.name}</Typography>
                              <Typography sx={{ fontSize: 10, color: "text.disabled", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.email}</Typography>
                            </Box>
                            {isSelected && <CheckIcon sx={{ fontSize: 12, color: "primary.main", flexShrink: 0 }} />}
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
        <Box>
          <Typography sx={{ fontSize: "10px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "text.disabled", mb: "6px" }}>Message</Typography>
          <TextField value={message} onChange={e => setMessage(e.target.value)} multiline rows={3} fullWidth size="small"
            sx={{ "& .MuiOutlinedInput-root": { fontSize: 12, bgcolor: "#fafafb" } }} />
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: "8px", pt: "2px" }}>
          <Button fullWidth onClick={handleSend} disabled={!canSend} sx={{ ...gradientBtnSx, py: "8px" }}>Send email</Button>
          <Button onClick={onDismiss} sx={dismissBtnSx}>Cancel</Button>
        </Box>
      </Box>
    </Box>
  );
}

// ─── Ad Preview Card ──────────────────────────────────────────────────────────
const BRAND_COLORS: Record<string, string> = {
  Honda: "#CC0000", BMW: "#0066B1", Volkswagen: "#001E50",
  Audi: "#B30000", Toyota: "#EB0A1E", Ford: "#003478",
  Hyundai: "#002C5F", Kia: "#05141F", Chevrolet: "#D1A600",
};

function AdPreviewCard({ offer, template }: {
  offer: { id: string; year: string; make: string; model: string; trim: string; offerType: string; monthlyPayment: number; term: number; pvi: number; aging: number; stock: number };
  template?: { id: string; name: string; format: string; width: number; height: number; brand: string };
}) {
  const brandColor = BRAND_COLORS[offer.make] ?? "#473bab";
  return (
    <Box sx={{ position: "relative", flexShrink: 0, borderRadius: "10px", overflow: "hidden", width: 148, height: 168, background: "linear-gradient(145deg, #e9e9e9 0%, #d6d6d6 100%)", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
      <Box sx={{ position: "absolute", top: "5px", right: "5px", zIndex: 10, display: "flex", alignItems: "center", gap: "3px", px: "5px", py: "2px", borderRadius: "100px", background: "rgba(255,255,255,0.82)", backdropFilter: "blur(4px)" }}>
        <Box sx={{ width: 5, height: 5, borderRadius: "50%", bgcolor: "#686576" }} />
        <Typography sx={{ fontSize: 8, fontWeight: 600, color: "#686576", letterSpacing: "0.3px" }}>Draft</Typography>
      </Box>
      <Box sx={{ position: "absolute", top: 0, left: 0, right: 0, display: "flex", alignItems: "center", justifyContent: "space-between", px: "7px", py: "5px", background: "rgba(0,0,0,0.52)" }}>
        <Typography sx={{ fontSize: 7.5, fontWeight: 500, color: "rgba(255,255,255,0.82)", letterSpacing: "0.2px" }}>{offer.make} Dealer</Typography>
        <Typography sx={{ fontSize: 6.5, fontWeight: 700, color: "rgba(255,255,255,0.6)", letterSpacing: "1px", textTransform: "uppercase" }}>{offer.make}</Typography>
      </Box>
      <Box sx={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pt: "24px", pb: "58px" }}>
        <svg width="88" height="38" viewBox="0 0 88 38" fill="none" style={{ opacity: 0.38 }}>
          <path d="M70 18H18L23 8H65L70 18Z" fill={brandColor} />
          <rect x="8" y="18" width="72" height="9" rx="3" fill={brandColor} />
          <circle cx="22" cy="30" r="6" fill={brandColor} />
          <circle cx="66" cy="30" r="6" fill={brandColor} />
          <circle cx="22" cy="30" r="2.8" fill="#d8d8d8" />
          <circle cx="66" cy="30" r="2.8" fill="#d8d8d8" />
        </svg>
      </Box>
      <Box sx={{ position: "absolute", bottom: 0, left: 0, right: 0, px: "7px", pt: "7px", pb: "7px", background: "linear-gradient(to top, rgba(0,0,0,0.80) 0%, rgba(0,0,0,0.62) 100%)" }}>
        <Typography sx={{ fontSize: 7, fontWeight: 500, color: "rgba(255,255,255,0.65)", letterSpacing: "0.5px", textTransform: "uppercase", mb: "1px" }}>
          {offer.offerType} · {offer.year} {offer.make} {offer.model}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "baseline", gap: "2px" }}>
          <Typography sx={{ fontSize: 22, fontWeight: 700, color: "white", lineHeight: 1 }}>${offer.monthlyPayment}</Typography>
          <Typography sx={{ fontSize: 8, color: "rgba(255,255,255,0.6)" }}>/mo</Typography>
        </Box>
        <Typography sx={{ fontSize: 6.5, color: "rgba(255,255,255,0.42)", mt: "2px" }}>{offer.term}mo · {offer.trim}</Typography>
      </Box>
      {template && (
        <Box sx={{ position: "absolute", top: "20px", left: "5px" }}>
          <Typography sx={{ fontSize: 7, fontWeight: 600, color: "white", bgcolor: "rgba(71,59,171,0.82)", px: "5px", py: "2px", borderRadius: "4px", letterSpacing: "0.3px" }}>
            {template.width}×{template.height}
          </Typography>
        </Box>
      )}
    </Box>
  );
}

// ─── Preview Strip ─────────────────────────────────────────────────────────────
function PreviewStrip({ msg, context }: { msg: PreviewMsg; context: ProjectContextPayload | null }) {
  const [open, setOpen] = useState(true);
  const offers    = context?.availableOffers    ?? [];
  const templates = context?.availableTemplates ?? [];
  const selectedOffers    = msg.offerIds.map(id => offers.find(o => o.id === id)).filter(Boolean) as typeof offers;
  const selectedTemplates = msg.templateIds.map(id => templates.find(t => t.id === id)).filter(Boolean) as typeof templates;

  return (
    <Box sx={{ ml: "32px", mt: "6px" }}>
      <Box component="button" onClick={() => setOpen(o => !o)} sx={{ display: "flex", alignItems: "center", gap: "5px", mb: "8px", cursor: "pointer", width: "100%", textAlign: "left", bgcolor: "transparent", border: "none", p: 0 }}>
        <ExpandMoreIcon sx={{ fontSize: 14, color: "text.secondary", transition: "transform 0.18s", transform: open ? "rotate(0deg)" : "rotate(-90deg)" }} />
        <Typography sx={{ fontSize: 11.5, fontWeight: 600, color: "#1f1d25" }}>Preview ({selectedOffers.length})</Typography>
        {selectedTemplates.length > 0 && (
          <Box sx={{ fontSize: 9.5, color: "#473bab", bgcolor: "rgba(71,59,171,0.08)", px: "7px", py: "1px", borderRadius: "100px", fontWeight: 500 }}>
            {selectedTemplates.length} template{selectedTemplates.length !== 1 ? "s" : ""}
          </Box>
        )}
      </Box>
      <Collapse in={open}>
        <Box sx={{ display: "flex", gap: "8px", overflowX: "auto", pb: "6px", scrollbarWidth: "none" }}>
          {selectedOffers.map((offer, i) => (
            <AdPreviewCard key={offer.id} offer={offer} template={selectedTemplates.length > 0 ? selectedTemplates[i % selectedTemplates.length] : undefined} />
          ))}
        </Box>
      </Collapse>
    </Box>
  );
}

// ─── ParsedOffersCard ──────────────────────────────────────────────────────────
function ParsedOffersCard({ input, applied, onApply, onDismiss }: {
  input: ParsedOffersInput; applied: boolean;
  onApply: (offers: CustomOffer[]) => void; onDismiss: () => void;
}) {
  const [checkedIds, setCheckedIds] = useState<Set<string>>(() => new Set(input.offers.map(o => o.id)));
  const [customizeMode, setCustomizeMode] = useState(false);
  const [customizations, setCustomizations] = useState<Record<string, { monthlyPayment: string; term: string; dueAtSigning: string }>>({});
  const selectAllRef = useRef<HTMLInputElement>(null);
  const checkedCount = checkedIds.size;
  const allChecked  = checkedCount === input.offers.length;
  const someChecked = checkedCount > 0 && checkedCount < input.offers.length;

  useEffect(() => {
    if (!customizeMode) return;
    setCustomizations(prev => {
      const next = { ...prev };
      for (const row of input.offers) {
        if (!next[row.id]) {
          next[row.id] = { monthlyPayment: row.monthly_payment ?? "0", term: row.term ?? "36", dueAtSigning: row.due_at_signing ?? "0" };
        }
      }
      return next;
    });
  }, [customizeMode]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (selectAllRef.current) selectAllRef.current.indeterminate = someChecked;
  }, [someChecked]);

  const toggleAll = () => setCheckedIds(allChecked ? new Set() : new Set(input.offers.map(o => o.id)));
  const toggleRow = (id: string, checked: boolean) => setCheckedIds(prev => { const next = new Set(prev); checked ? next.add(id) : next.delete(id); return next; });

  const toCardData = (row: ParsedOfferRow): OfferCardData => {
    const c = customizations[row.id];
    return {
      id: row.id, year: row.year, make: row.make, model: row.model, trim: row.trim ?? "",
      image: resolveCarImage(row.make, row.model, row.trim ?? "", row.year),
      stock: 0, offerType: row.offer_type, tags: row.apr ? [`${row.apr}% APR`] : [],
      pvi: 0, aging: 0, sales: 0, inventory: 0,
      monthlyPayment:    parseFloat(c?.monthlyPayment ?? row.monthly_payment) || 0,
      term:              parseInt(c?.term ?? row.term) || 0,
      totalDueAtSigning: parseFloat(c?.dueAtSigning ?? row.due_at_signing ?? "0") || 0,
    };
  };

  const handleApply = () => {
    const selected: CustomOffer[] = input.offers
      .filter(r => checkedIds.has(r.id))
      .map(r => {
        const c = customizations[r.id];
        return {
          id: `custom-${r.id}-${Date.now()}`, year: r.year, make: r.make, model: r.model, trim: r.trim ?? "",
          offerType: r.offer_type, monthlyPayment: c?.monthlyPayment ?? r.monthly_payment,
          term: c?.term ?? r.term, dueAtSigning: c?.dueAtSigning ?? r.due_at_signing ?? "0",
          apr: r.apr, notes: r.notes, image: resolveCarImage(r.make, r.model, r.trim ?? "", r.year),
        };
      });
    onApply(selected);
  };

  if (applied) {
    return <Box sx={{ ml: "32px" }}><ConfirmedChip label={`${checkedCount} offer${checkedCount === 1 ? "" : "s"} added`} /></Box>;
  }

  return (
    <Box sx={{ borderRadius: "12px", border: "1px solid rgba(0,0,0,0.10)", bgcolor: "background.paper", overflow: "clip" }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: "8px", px: "12px", py: "10px", bgcolor: "#fafafb", borderBottom: "1px solid rgba(0,0,0,0.07)" }}>
        <Box sx={{ width: 28, height: 28, borderRadius: "6px", bgcolor: "rgba(71,59,171,0.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <FileOpenIcon sx={{ fontSize: 14, color: "#473bab" }} />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: 12, fontWeight: 500, color: "#1f1d25", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{input.source}</Typography>
          <Typography sx={{ fontSize: 11, color: "#686576" }}>{input.offers.length} offer{input.offers.length === 1 ? "" : "s"} extracted</Typography>
        </Box>
        <IconButton size="small" onClick={onDismiss} sx={{ color: "#c4c1d0" }}><CloseIcon sx={{ fontSize: 14 }} /></IconButton>
      </Box>
      <Box sx={{ position: "sticky", top: 0, zIndex: 10, display: "flex", alignItems: "center", gap: "8px", px: "12px", py: "7px", bgcolor: "white", borderBottom: "1px solid rgba(0,0,0,0.07)" }}>
        <Box component="label" sx={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", userSelect: "none" }}>
          <Checkbox
            inputRef={selectAllRef} checked={allChecked} indeterminate={someChecked}
            onChange={toggleAll} size="small"
            sx={{ p: "2px", color: "rgba(0,0,0,0.25)", "&.Mui-checked, &.MuiCheckbox-indeterminate": { color: "#473bab" } }}
          />
          <Typography sx={{ fontSize: 11, color: "#686576" }}>
            {allChecked ? "Deselect all" : someChecked ? `${checkedCount} selected` : "Select all"}
          </Typography>
        </Box>
        <Typography sx={{ ml: "auto", fontSize: 10, color: "#c4c1d0" }}>{input.offers.length} total</Typography>
      </Box>
      <Box sx={{ display: "flex", flexDirection: "column", gap: "8px", p: "10px" }}>
        {input.offers.map(row => (
          <Box key={row.id}>
            <OfferCard offer={toCardData(row)} selected={checkedIds.has(row.id)} onSelect={(_, checked) => toggleRow(row.id, checked)} />
            <Collapse in={customizeMode}>
              <Box sx={{ overflow: "hidden", mt: "4px", px: "12px", py: "10px", borderRadius: "10px", bgcolor: "rgba(71,59,171,0.04)", border: "1px solid rgba(71,59,171,0.12)", display: "flex", flexWrap: "wrap", gap: "8px 16px", alignItems: "flex-end" }}>
                {([
                  { key: "monthlyPayment" as const, label: "Monthly Payment ($)", val: customizations[row.id]?.monthlyPayment ?? row.monthly_payment },
                  { key: "term"           as const, label: "Term (mo)",           val: customizations[row.id]?.term           ?? row.term },
                  { key: "dueAtSigning"   as const, label: "Due at Signing ($)",  val: customizations[row.id]?.dueAtSigning   ?? row.due_at_signing ?? "0" },
                ]).map(({ key, label, val }) => (
                  <Box key={key} sx={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                    <Typography sx={{ fontSize: 11, color: "#686576" }}>{label}</Typography>
                    <TextField type="number" value={val} size="small"
                      onChange={e => setCustomizations(prev => ({
                        ...prev,
                        [row.id]: {
                          monthlyPayment: prev[row.id]?.monthlyPayment ?? row.monthly_payment,
                          term:           prev[row.id]?.term           ?? row.term,
                          dueAtSigning:   prev[row.id]?.dueAtSigning   ?? row.due_at_signing ?? "0",
                          [key]: e.target.value,
                        },
                      }))}
                      sx={{ width: 90, "& .MuiOutlinedInput-root": { fontSize: 12, bgcolor: "white", borderRadius: "6px" } }}
                    />
                  </Box>
                ))}
              </Box>
            </Collapse>
          </Box>
        ))}
      </Box>
      <Box sx={{ position: "sticky", bottom: 0, zIndex: 10, px: "12px", py: "10px", bgcolor: "white", borderTop: "1px solid rgba(0,0,0,0.08)", display: "flex", alignItems: "center", gap: "8px" }}>
        <Button fullWidth onClick={handleApply} disabled={checkedCount === 0}
          sx={{ ...gradientBtnSx, py: "8px", "&.Mui-disabled": { opacity: 0.4 } }}>
          {checkedCount === 0 ? "Select offers to add" : `Add ${checkedCount} offer${checkedCount === 1 ? "" : "s"} to project`}
        </Button>
        <Button onClick={() => setCustomizeMode(m => !m)} variant="outlined"
          sx={{ px: "14px", py: "8px", borderRadius: "100px", fontSize: 13, fontWeight: 500, textTransform: "none", flexShrink: 0, borderColor: customizeMode ? "rgba(71,59,171,0.3)" : "rgba(0,0,0,0.12)", color: customizeMode ? "#473bab" : "#686576", bgcolor: customizeMode ? "rgba(71,59,171,0.08)" : "transparent" }}>
          {customizeMode ? "Done" : "Customize"}
        </Button>
      </Box>
    </Box>
  );
}

// ─── Tool chip view ────────────────────────────────────────────────────────────
function ToolChipView({ name, input }: { name: string; input: Record<string, unknown> }) {
  const cfg: Record<string, { label: string; color: string; bg: string }> = {
    add_offers_to_project:            { label: "Added offers",        color: "#16a34a", bg: "rgba(22,163,74,0.09)"   },
    remove_offers_from_project:       { label: "Removed offers",      color: "#dc2626", bg: "rgba(220,38,38,0.09)"   },
    add_templates_to_project:         { label: "Added templates",     color: "#6356e1", bg: "rgba(99,86,225,0.09)"   },
    remove_templates_from_project:    { label: "Removed templates",   color: "#dc2626", bg: "rgba(220,38,38,0.09)"   },
    set_project_name:                 { label: "Renamed project",     color: "#0369a1", bg: "rgba(3,105,161,0.09)"   },
    edit_offer:                       { label: "Edited offer",        color: "#7c3aed", bg: "rgba(124,58,237,0.09)"  },
    add_backgrounds_to_project:       { label: "Added background",    color: "#0369a1", bg: "rgba(3,105,161,0.09)"   },
    remove_backgrounds_from_project:  { label: "Removed background",  color: "#dc2626", bg: "rgba(220,38,38,0.09)"   },
    duplicate_template_in_project:    { label: "Duplicated template", color: "#6356e1", bg: "rgba(99,86,225,0.09)"   },
    update_project_display:           { label: "Updated display",     color: "#0369a1", bg: "rgba(3,105,161,0.09)"   },
  };
  const c = cfg[name] ?? { label: name, color: "#686576", bg: "rgba(104,101,118,0.09)" };
  let detail = "";
  if (name === "add_offers_to_project" || name === "remove_offers_from_project") {
    const ids = (input.offer_ids as string[]) ?? []; detail = ids.length === 1 ? ids[0] : `${ids.length} offers`;
  } else if (name === "add_templates_to_project" || name === "remove_templates_from_project") {
    const ids = (input.template_ids as string[]) ?? []; detail = ids.length === 1 ? ids[0] : `${ids.length} templates`;
  } else if (name === "set_project_name") { detail = `"${input.name}"`;
  } else if (name === "edit_offer") { detail = `${input.offer_id ?? ""}`;
  } else if (name === "add_backgrounds_to_project" || name === "remove_backgrounds_from_project") {
    const ids = (input.background_ids as string[]) ?? []; detail = ids.length === 1 ? ids[0] : `${ids.length} backgrounds`;
  } else if (name === "duplicate_template_in_project") { detail = `${input.template_id ?? ""}`; }

  return (
    <Box sx={{ display: "inline-flex", alignItems: "center", gap: "6px", bgcolor: c.bg, color: c.color,
      border: `1px solid ${c.bg.replace("0.09)", "0.28)")}`, fontSize: 12, fontWeight: 500,
      letterSpacing: "0.17px", px: "10px", py: "4px", borderRadius: "100px" }}>
      {c.label}
      {detail && <Box component="span" sx={{ fontWeight: 400, opacity: 0.7 }}>· {detail}</Box>}
    </Box>
  );
}

// ─── Category chips ────────────────────────────────────────────────────────────
const PROJECT_CATEGORIES = ["Create a project", "Pick offers", "Pick templates", "Duplicate a project", "Create Automatic Project"];
const CATEGORY_MESSAGES: Record<string, string> = {
  "Create a project":          "Create a project",
  "Pick offers":               "I want to pick offers for a new project. Offers only — no need for templates, backgrounds, or brand.",
  "Pick templates":            "I want to pick templates for a new project. Templates only — no need for offers, backgrounds, or brand.",
  "Duplicate a project":       "Duplicate a project",
  "Create Automatic Project":  "Create a proactive project",
};

function CategoryChip({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <Box component="button" onClick={onClick}
      sx={{ borderRadius: "100px", border: "1px solid rgba(99,86,225,0.5)", px: "10px", py: "4px",
        "&:hover": { bgcolor: "rgba(71,59,171,0.06)" }, cursor: "pointer", bgcolor: "transparent", transition: "background-color 0.15s" }}>
      <Typography sx={{ fontSize: 13, color: "#473bab", fontWeight: 500, letterSpacing: "0.46px", whiteSpace: "nowrap", lineHeight: "22px", textTransform: "capitalize" }}>
        {label}
      </Typography>
    </Box>
  );
}

// ─── SmartProposalCard ─────────────────────────────────────────────────────────
interface SmartProposalCardProps {
  input: ProposalInput; context: ProjectContextPayload | null;
  onApply: (offerIds: string[], templateIds: string[], name?: string) => void;
  onDismiss: () => void;
}
function SmartProposalCard({ input, context, onApply, onDismiss }: SmartProposalCardProps) {
  const [name,        setName]        = useState(input.project_name ?? "");
  const [startDate,   setStartDate]   = useState(input.start_date ?? "");
  const [endDate,     setEndDate]     = useState(input.end_date ?? "");
  const [offerIds,    setOfferIds]    = useState<string[]>(input.offer_ids);
  const [templateIds, setTemplateIds] = useState<string[]>(input.template_ids);
  const [applied,     setApplied]     = useState(false);
  const offers    = context?.availableOffers    ?? [];
  const templates = context?.availableTemplates ?? [];

  const handleApply = () => { onApply(offerIds, templateIds, name || undefined); setApplied(true); };

  if (applied) {
    return (
      <Box sx={{ ml: "32px", mt: "4px" }}>
        <ConfirmedChip label={`${offerIds.length} offer${offerIds.length !== 1 ? "s" : ""} + ${templateIds.length} template${templateIds.length !== 1 ? "s" : ""} added to project`} />
      </Box>
    );
  }

  const fieldSx = { "& .MuiOutlinedInput-root": { fontSize: 12, bgcolor: "#fafafb" } };
  const labelTypo = { fontSize: "10px", fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: "0.06em", color: "text.disabled", mb: "4px" };

  return (
    <Box sx={{ ml: "32px", mt: "4px", ...cardSx }}>
      <Box sx={{ px: "14px", pt: "12px", pb: "10px", borderBottom: "1px solid rgba(0,0,0,0.06)", bgcolor: "#fafafa" }}>
        <Typography sx={{ fontSize: 11, color: "text.secondary", lineHeight: 1.5, letterSpacing: "0.17px" }}>
          {input.rationale}
        </Typography>
      </Box>
      <Box sx={{ display: "flex", flexDirection: "column", gap: "12px", px: "14px", py: "12px" }}>
        {(input.project_name || context?.projectId === "") && (
          <Box>
            <Typography sx={labelTypo}>Project name</Typography>
            <TextField value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Honda Summer Lease 2026" size="small" fullWidth sx={fieldSx} />
          </Box>
        )}
        {(startDate || endDate) && (
          <Box sx={{ display: "flex", gap: "8px" }}>
            <Box sx={{ flex: 1 }}>
              <Typography sx={labelTypo}>Start date</Typography>
              <TextField value={startDate} onChange={e => setStartDate(e.target.value)} size="small" fullWidth sx={fieldSx} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography sx={labelTypo}>End date</Typography>
              <TextField value={endDate} onChange={e => setEndDate(e.target.value)} size="small" fullWidth sx={fieldSx} />
            </Box>
          </Box>
        )}
        {/* Offers */}
        <Box>
          <Typography sx={{ ...labelTypo, mb: "6px" }}>Offers · {offerIds.length} selected</Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {offerIds.map(id => {
              const o = offers.find(x => x.id === id);
              return (
                <Box key={id} sx={{ display: "flex", alignItems: "center", gap: "8px", px: "10px", py: "7px", borderRadius: "8px", bgcolor: "#f5f4f8", "&:hover .del-btn": { opacity: 1 } }}>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontSize: 12, fontWeight: 500, color: "#1f1d25", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {o ? `${o.year} ${o.make} ${o.model} ${o.trim}` : id}
                    </Typography>
                    {o && <Typography sx={{ fontSize: 10.5, color: "text.secondary", mt: "1px" }}>{o.offerType} · ${o.monthlyPayment}/mo · PVI {o.pvi} · {o.aging}d aging</Typography>}
                  </Box>
                  <IconButton className="del-btn" size="small" onClick={() => setOfferIds(prev => prev.filter(x => x !== id))}
                    sx={{ opacity: 0, color: "text.disabled", "&:hover": { color: "#dc2626" }, flexShrink: 0, transition: "opacity 0.15s, color 0.15s" }}>
                    <DeleteIcon sx={{ fontSize: 12 }} />
                  </IconButton>
                </Box>
              );
            })}
            {offers.filter(o => !offerIds.includes(o.id)).length > 0 && (
              <Box sx={{ position: "relative", mt: "2px" }}>
                <Box component="select" value="" onChange={(e: React.ChangeEvent<HTMLSelectElement>) => { if (e.target.value) setOfferIds(prev => [...prev, e.target.value]); }}
                  sx={{ width: "100%", px: "10px", py: "6px", borderRadius: "8px", fontSize: "11px", color: "#473bab", border: "1.5px dashed rgba(71,59,171,0.35)", bgcolor: "transparent", cursor: "pointer", outline: "none", appearance: "none" }}>
                  <option value="">+ Add another offer…</option>
                  {offers.filter(o => !offerIds.includes(o.id)).map(o => (
                    <option key={o.id} value={o.id}>{o.year} {o.make} {o.model} {o.trim} — {o.offerType} ${o.monthlyPayment}/mo</option>
                  ))}
                </Box>
                <AddIcon sx={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", fontSize: 10, color: "#473bab", pointerEvents: "none" }} />
              </Box>
            )}
          </Box>
        </Box>
        {/* Templates */}
        <Box>
          <Typography sx={{ ...labelTypo, mb: "6px" }}>Templates · {templateIds.length} selected</Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {templateIds.map(id => {
              const t = templates.find(x => x.id === id);
              return (
                <Box key={id} sx={{ display: "flex", alignItems: "center", gap: "8px", px: "10px", py: "7px", borderRadius: "8px", bgcolor: "#f5f4f8", "&:hover .del-btn": { opacity: 1 } }}>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontSize: 12, fontWeight: 500, color: "#1f1d25", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t ? t.name : id}</Typography>
                    {t && <Typography sx={{ fontSize: 10.5, color: "text.secondary", mt: "1px" }}>{t.format} · {t.width}×{t.height} · {t.brand}</Typography>}
                  </Box>
                  <IconButton className="del-btn" size="small" onClick={() => setTemplateIds(prev => prev.filter(x => x !== id))}
                    sx={{ opacity: 0, color: "text.disabled", "&:hover": { color: "#dc2626" }, flexShrink: 0, transition: "opacity 0.15s, color 0.15s" }}>
                    <DeleteIcon sx={{ fontSize: 12 }} />
                  </IconButton>
                </Box>
              );
            })}
            {templates.filter(t => !templateIds.includes(t.id)).length > 0 && (
              <Box sx={{ position: "relative", mt: "2px" }}>
                <Box component="select" value="" onChange={(e: React.ChangeEvent<HTMLSelectElement>) => { if (e.target.value) setTemplateIds(prev => [...prev, e.target.value]); }}
                  sx={{ width: "100%", px: "10px", py: "6px", borderRadius: "8px", fontSize: "11px", color: "#473bab", border: "1.5px dashed rgba(71,59,171,0.35)", bgcolor: "transparent", cursor: "pointer", outline: "none", appearance: "none" }}>
                  <option value="">+ Add another template…</option>
                  {templates.filter(t => !templateIds.includes(t.id)).map(t => (
                    <option key={t.id} value={t.id}>{t.name} — {t.format}</option>
                  ))}
                </Box>
                <AddIcon sx={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", fontSize: 10, color: "#473bab", pointerEvents: "none" }} />
              </Box>
            )}
          </Box>
        </Box>
        {/* CTAs */}
        <Box sx={{ display: "flex", alignItems: "center", gap: "8px", pt: "2px" }}>
          <Button fullWidth onClick={handleApply} disabled={offerIds.length === 0 && templateIds.length === 0} sx={{ ...gradientBtnSx, py: "8px" }}>
            Apply to project
          </Button>
          <Button onClick={onDismiss} sx={dismissBtnSx}>Dismiss</Button>
        </Box>
      </Box>
    </Box>
  );
}

// ─── Message bubble router ─────────────────────────────────────────────────────
function MessageBubble({
  message, context, projectName, existingProjectNames,
  confirmedBackgroundIds, setupPlatforms,
  onSetupApply, onSetupDismiss,
  onOffersApply, onOffersDismiss,
  onTemplatesApply, onTemplatesDismiss,
  onBackgroundsApply, onBackgroundsDismiss,
  onBrandApply, onBrandDismiss,
  onProposalApply, onProposalDismiss,
  onEmailApply, onEmailDismiss,
  onShareChooseEmail, onShareChoosePlatform,
  onReviewerPickerConfirm,
  onParsedOffersApply, onParsedOffersDismiss,
  onNotifyOwnersApply, onTaskOwnersApply,
  proactive, onProactiveQuestionsApply,
  dispatchAction, onDealerBgApprove, onDealerBgSkip,
}: {
  message: Message; context: ProjectContextPayload | null;
  projectName: string; existingProjectNames: string[];
  confirmedBackgroundIds: string[]; setupPlatforms?: string[];
  onSetupApply: (name: string, account: string, oem: string, start: string, end: string, owner: string, platforms: string[]) => void;
  onSetupDismiss: () => void;
  onOffersApply: (offerIds: string[], editedOfferIds?: string[]) => void;
  onOffersDismiss: () => void;
  onTemplatesApply: (templateIds: string[]) => void;
  onTemplatesDismiss: () => void;
  onBackgroundsApply: (backgroundIds: string[]) => void;
  onBackgroundsDismiss: () => void;
  onBrandApply: (oem: string) => void;
  onBrandDismiss: () => void;
  onProposalApply: (offerIds: string[], templateIds: string[], name?: string) => void;
  onProposalDismiss: () => void;
  onEmailApply: (recipient: string, message: string) => void;
  onEmailDismiss: () => void;
  onShareChooseEmail: (recipientHint: string) => void;
  onShareChoosePlatform: (recipientName: string) => void;
  onReviewerPickerConfirm: (contacts: typeof MOCK_CONTACTS[number][], channels: Record<string, "platform" | "email">, message: string) => void;
  onParsedOffersApply: (offers: CustomOffer[]) => void;
  onParsedOffersDismiss: () => void;
  onNotifyOwnersApply: () => void;
  onTaskOwnersApply: (owners: Record<string, string>) => void;
  proactive?: boolean;
  onProactiveQuestionsApply?: (goal: string, timeline: string, offerFocus: string) => void;
  dispatchAction?: (a: AgentActionPayload) => void;
  onDealerBgApprove?: (bgObject: { id: string; name: string; thumbnail: string; images: Record<string, string> }) => void;
  onDealerBgSkip?: () => void;
}) {
  if (message.type === "continuation") return null;

  if (message.type === "proactive_questions") {
    return <ProactiveQuestionsCard input={message.input} applied={message.applied} onSubmit={onProactiveQuestionsApply ?? (() => {})} />;
  }

  if (message.type === "user_file") {
    const m = message as UserFileMsg;
    return (
      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <Box sx={{ ml: "40px", bgcolor: "#fafaff", borderRadius: "12px 12px 12px 0", px: "12px", py: "10px", position: "relative", border: "1px solid rgba(99,86,225,0.5)" }}>
          {m.text && <Typography sx={{ fontSize: 12, color: "#1f1d25", lineHeight: 1.43, letterSpacing: "0.17px", mb: "6px" }}>{m.text}</Typography>}
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {m.files.map((f, i) => (
              <Box key={i} sx={{ display: "flex", alignItems: "center", gap: "6px", px: "8px", py: "5px", bgcolor: "rgba(71,59,171,0.06)", border: "1px solid rgba(71,59,171,0.18)", borderRadius: "8px" }}>
                <FileOpenIcon sx={{ fontSize: 11, color: "#473bab", flexShrink: 0 }} />
                <Typography sx={{ fontSize: 11, fontWeight: 500, color: "#473bab", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 160 }}>{f.name}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    );
  }

  if (message.type === "parsed_offers") {
    return <ParsedOffersCard input={message.input} applied={message.applied} onApply={onParsedOffersApply} onDismiss={onParsedOffersDismiss} />;
  }

  if (message.type === "dealer_bg_proposal") {
    const msg = message as DealerBgProposalMsg;
    if (msg.applied) {
      return <Box sx={{ ml: "32px", mt: "4px" }}><ConfirmedChip label="Scene background added to project" /></Box>;
    }
    return (
      <Box sx={{ ml: "32px", mt: "4px", borderRadius: "14px", border: "1px solid rgba(0,0,0,0.10)", bgcolor: "white", overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", maxWidth: 380 }}>
        <Box sx={{ px: "14px", pt: "10px", pb: "8px", borderBottom: "1px solid rgba(0,0,0,0.06)", bgcolor: "#fafafa" }}>
          <Typography sx={{ fontSize: 11, fontWeight: 600, color: "#1f1d25" }}>Scene Background Preview</Typography>
          <Typography sx={{ fontSize: 10.5, color: "#686576", lineHeight: 1.4 }}>Your image adapted with a vehicle on the foreground. Approve to use in this campaign.</Typography>
        </Box>
        <Box sx={{ position: "relative", width: "100%", aspectRatio: "4/3", bgcolor: "#ececf2" }}>
          <DealerBgPreviewImage src={msg.previewUrl} />
          <Box sx={{ position: "absolute", top: "8px", left: "8px", fontSize: 9, fontWeight: 500, color: "white", px: "6px", py: "2px", borderRadius: "4px", background: "rgba(71,59,171,0.82)" }}>Preview</Box>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: "8px", px: "14px", py: "12px" }}>
          <Button fullWidth onClick={() => onDealerBgApprove?.(msg.bgObject)} sx={{ ...gradientBtnSx, py: "8px" }}>
            ✓ Use this background
          </Button>
          <Button onClick={() => onDealerBgSkip?.()} sx={dismissBtnSx}>Skip</Button>
        </Box>
      </Box>
    );
  }

  if (message.type === "tool") {
    return <Box sx={{ ml: "32px", display: "flex" }}><ToolChipView name={message.name} input={message.input} /></Box>;
  }

  if (message.type === "setup") {
    return <SetupProjectCard input={message.input as any} existingNames={existingProjectNames} onApply={onSetupApply} onDismiss={onSetupDismiss} proactive={proactive} />;
  }

  if (message.type === "offers") {
    return <OffersProposalCard input={message.input} context={context} onApply={onOffersApply} onDismiss={onOffersDismiss} proactive={proactive} dispatchAction={dispatchAction as any} />;
  }

  if (message.type === "templates") {
    return <TemplatesProposalCard input={message.input} context={context} onApply={onTemplatesApply} onDismiss={onTemplatesDismiss} proactive={proactive} platforms={setupPlatforms} />;
  }

  if (message.type === "preview") {
    return <PreviewStrip msg={message} context={context} />;
  }

  if (message.type === "backgrounds") {
    return <BackgroundsProposalCard input={message.input} onApply={onBackgroundsApply} onDismiss={onBackgroundsDismiss} proactive={proactive} />;
  }

  if (message.type === "email") {
    return <EmailProposalCard input={message.input} projectName={projectName} onApply={onEmailApply} onDismiss={onEmailDismiss} />;
  }

  if (message.type === "task_owners") {
    return (
      <TaskOwnersProposalCard input={message.input} liveOwners={message.liveOwners}
        onApply={(owners) => {
          const ownerNames: Record<string, string> = {};
          Object.entries(owners).forEach(([section, ownerId]) => {
            const owner = PROJECT_OWNERS.find(o => o.id === ownerId);
            if (owner) ownerNames[section] = owner.name;
          });
          onTaskOwnersApply(ownerNames);
        }} />
    );
  }

  if (message.type === "notify_owners") {
    return <NotifyOwnersCard liveOwners={message.liveOwners} projectName={context?.projectName ?? "this project"} onApply={onNotifyOwnersApply} />;
  }

  if (message.type === "share") {
    return <ShareChooserCard input={message.input} projectName={projectName} applied={message.applied} onChooseEmail={onShareChooseEmail} onChoosePlatform={onShareChoosePlatform} />;
  }

  if (message.type === "reviewer_picker") {
    const projectUrl = context?.projectId
      ? `https://constellation-ux-app.vercel.app/OEM/Projects?project=${context.projectId}`
      : "https://constellation-ux-app.vercel.app/OEM/Projects";
    return <ReviewerPickerCard applied={message.applied} projectName={projectName} projectUrl={projectUrl} onSend={onReviewerPickerConfirm} recipientHints={(message as ReviewerPickerMsg).recipientHints} />;
  }

  if (message.type === "campaign_cta") {
    return <CampaignCtaCard />;
  }

  if (message.type === "brand") {
    return <BrandProposalCard input={message.input} projectName={projectName} onApply={onBrandApply} onDismiss={onBrandDismiss} proactive={proactive} />;
  }

  if (message.type === "proposal") {
    return <SmartProposalCard input={message.input} context={context} onApply={onProposalApply} onDismiss={onProposalDismiss} />;
  }

  if (message.role === "user") {
    const m = message as TextMessage;
    return (
      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <Box sx={{ ml: "40px", bgcolor: "#fafaff", borderRadius: "12px 12px 12px 0", px: "12px", py: "10px", position: "relative", border: "1px solid rgba(99,86,225,0.5)" }}>
          <Typography sx={{ fontSize: 12, color: "#1f1d25", lineHeight: 1.43, letterSpacing: "0.17px" }}>{m.content}</Typography>
        </Box>
      </Box>
    );
  }

  const textMsg = message as TextMessage;
  if (textMsg.isGenerateAssetsPrompt) {
    return (
      <Box>
        <AssistantBubble text={textMsg.content} />
        <GenerateAssetsSmartCard context={context} confirmedBackgroundIds={confirmedBackgroundIds} applied={textMsg.applied ?? false} totalGenerated={textMsg.totalGenerated} />
      </Box>
    );
  }
  return <AssistantBubble text={textMsg.content} />;
}

// ─── Assistant bubble ─────────────────────────────────────────────────────────
function AssistantBubble({ text, streaming = false }: { text: string; streaming?: boolean }) {
  const hasMarkdown = /^\s*\|/m.test(text) || /^#{1,3} /m.test(text) || /\*\*[^*]+\*\*/.test(text);
  return (
    <Box sx={{ "&:hover .response-actions": { opacity: 1 } }}>
      <Box sx={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
        <Box component="img" src={imgAgentAvatar} alt="AI" sx={{ width: 22, height: 22, borderRadius: "50%", objectFit: "cover", flexShrink: 0, mt: "1px" }} />
        <Box sx={{ flex: 1, pt: "2px" }}>
          {hasMarkdown && !streaming
            ? <MarkdownContent text={text} />
            : (
              <Typography sx={{ fontSize: 13, color: "#1f1d25", lineHeight: 1.6, letterSpacing: "0.17px", whiteSpace: "pre-wrap" }}>
                {text}
                {streaming && (
                  <Box component="span" sx={{ display: "inline-block", width: 2, height: 13, bgcolor: "#473bab", ml: "2px", verticalAlign: "middle",
                    "@keyframes blink": { "0%, 100%": { opacity: 1 }, "50%": { opacity: 0 } },
                    animation: "blink 1s step-end infinite" }} />
                )}
              </Typography>
            )
          }
        </Box>
      </Box>
      {!streaming && (
        <Box className="response-actions" sx={{ opacity: 0, transition: "opacity 0.15s" }}>
          <ResponseActions text={text} />
        </Box>
      )}
    </Box>
  );
}

// ─── Honda accounts ────────────────────────────────────────────────────────────
const HONDA_ACCOUNTS = ["Honda of Anywhere", "Honda City"];

// ─── Main component ────────────────────────────────────────────────────────────
interface ProjectAgentPaneProps { isOpen: boolean; onClose: () => void; userType?: UserType; activeUserName?: string; }

export function ProjectAgentPane({ isOpen, onClose, userType, activeUserName }: ProjectAgentPaneProps) {
  const { triggerEvent } = useUsabilityTesting();
  const [paneWidth, setPaneWidth] = useState(400);
  const [isResizing, setIsResizing] = useState(false);
  const isDraggingPane = useRef(false);
  const dragStartX = useRef(0);
  const dragStartWidth = useRef(0);

  function handlePaneDragStart(e: React.MouseEvent) {
    isDraggingPane.current = true; setIsResizing(true);
    dragStartX.current = e.clientX; dragStartWidth.current = paneWidth; e.preventDefault();
    function onMove(ev: MouseEvent) {
      if (!isDraggingPane.current) return;
      const delta = dragStartX.current - ev.clientX;
      setPaneWidth(Math.max(320, Math.min(800, dragStartWidth.current + delta)));
    }
    function onUp() {
      isDraggingPane.current = false; setIsResizing(false);
      window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp);
    }
    window.addEventListener("mousemove", onMove); window.addEventListener("mouseup", onUp);
  }

  const [messages,      setMessages]      = useState<Message[]>([]);
  const [streamingText, setStreamingText] = useState("");
  const [bgProcessing,  setBgProcessing]  = useState(false);
  const [projectContext, setProjectContext] = useState<ProjectContextPayload | null>(null);
  const [showHistory,      setShowHistory]      = useState(false);
  const [threads,          setThreads]          = useState<AgentThread[]>(() => loadAgentThreads());
  const [knownProjectNames, setKnownProjectNames] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.LOCAL_PROJECTS);
      const projects: Array<{ name?: string }> = raw ? JSON.parse(raw) : [];
      return projects.map(p => p.name || "").filter(Boolean);
    } catch { return []; }
  });
  const [simulatingStream, setSimulatingStream] = useState(false);
  const [historySearch, setHistorySearch] = useState("");
  const currentThreadIdRef = useRef<string | null>(null);
  const bottomRef   = useRef<HTMLDivElement>(null);
  const agentInputRef = useRef<AgentInputHandle>(null);
  const { streaming, setStreaming, streamMessage, stop } = useAgentStream();

  const loadingLabel = useMemo((): string => {
    for (let i = messages.length - 1; i >= 0; i--) {
      const m = messages[i];
      if (m.type === "continuation") {
        const c = m.content;
        if (c.includes("Project created"))   return "Spinning up your project…";
        if (c.includes("templates"))         return "Matching templates to your brand…";
        if (c.includes("offer"))             return "Scanning inventory for top picks…";
        if (c.includes("background"))        return "Curating background scenes…";
        if (c.includes("brand"))             return "Activating your brand theme…";
        if (c.includes("email"))             return "Preparing your share…";
        break;
      }
      if (m.type === "text" && m.role === "user") {
        const t = m.content.toLowerCase();
        const isEdit = /remove|delete|change|update|edit|rename|duplicate|swap|replace|adjust|modify|include/.test(t);
        if (isEdit)                          return "Planning your adjustments…";
        if (/offer|lease|inventory/.test(t)) return "Scanning inventory for top picks…";
        if (/template|banner|format/.test(t))return "Matching templates to your brand…";
        if (/background|scene/.test(t))      return "Curating background scenes…";
        if (/brand|theme|logo/.test(t))      return "Activating your brand theme…";
        if (/email|send|share/.test(t))      return "Preparing your share…";
        if (/campaign|project|create|build/.test(t)) return "Setting up your project…";
        break;
      }
    }
    return "Thinking…";
  }, [messages]);

  const { pushProjectMention } = useWorkflow();

  useEffect(() => {
    const h = (e: Event) => setProjectContext((e as CustomEvent<ProjectContextPayload>).detail);
    window.addEventListener(PROJECT_CONTEXT_EVENT, h);
    return () => window.removeEventListener(PROJECT_CONTEXT_EVENT, h);
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      const { total } = (e as CustomEvent<{ total: number }>).detail;
      setMessages(prev => {
        const updated = prev.map(m =>
          (m.type === "text" && (m as TextMessage).isGenerateAssetsPrompt && !(m as TextMessage).applied)
            ? { ...m, applied: true, totalGenerated: total } as TextMessage : m
        );
        const hasPostGenCard = updated.some(m => m.type === "share" || m.type === "reviewer_picker" || m.type === "campaign_cta");
        if (hasPostGenCard) return updated;
        const isProactiveSession = updated.some(m => m.type === "proactive_questions");
        const isDealerBgSession  = updated.some(m => m.type === "dealer_bg_proposal");
        const now = Date.now();
        if (isProactiveSession || isDealerBgSession) {
          return [
            ...updated,
            { id: `a-${now}`, role: "assistant", type: "text", content: "Based on your last project, these are the people who should review." } as TextMessage,
            { id: `reviewer-picker-${now + 1}`, role: "assistant", type: "reviewer_picker", applied: false } as ReviewerPickerMsg,
          ];
        }
        return [...updated, { id: `campaign-cta-${now}`, role: "assistant", type: "campaign_cta" } as CampaignCtaMsg];
      });
    };
    window.addEventListener(AGENT_ASSETS_GENERATED_EVENT, handler);
    return () => window.removeEventListener(AGENT_ASSETS_GENERATED_EVENT, handler);
  }, []);

  useEffect(() => {
    const handler = () => triggerEvent("assets_generated");
    window.addEventListener(AGENT_ASSETS_GENERATED_EVENT, handler);
    return () => window.removeEventListener(AGENT_ASSETS_GENERATED_EVENT, handler);
  }, [triggerEvent]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, streamingText]);

  const dispatchAction = useCallback((a: AgentActionPayload) =>
    window.dispatchEvent(new CustomEvent(PROJECT_AGENT_ACTION_EVENT, { detail: a })), []);

  const proactiveModeRef = useRef(false);
  const [proactiveMode,    setProactiveMode]    = useState(false);
  const [selectedAccount,  setSelectedAccount]  = useState(HONDA_ACCOUNTS[0]);
  const [awaitingNewProject, setAwaitingNewProject] = useState(false);

  const accRef      = useRef("");
  const ctxRef      = useRef<ProjectContextPayload | null>(null);
  const messagesRef = useRef<Message[]>([]);
  const pendingParsedOffersRef  = useRef<CustomOffer[] | null>(null);
  const pendingPipelineTextRef  = useRef<string>("");
  const pendingDealerImageRef   = useRef<string | null>(null);
  const stagedFilesRef          = useRef<File[]>([]);
  const pendingOffersFilesRef   = useRef<File[] | null>(null);
  const projectCreatedByConversationRef = useRef(false);
  const fireNextStepRef = useRef<((step: string) => void) | null>(null);

  useEffect(() => { ctxRef.current      = projectContext; }, [projectContext]);
  useEffect(() => { messagesRef.current = messages;       }, [messages]);

  const filteredContext = useMemo((): ProjectContextPayload | null => {
    if (!projectContext) return null;
    if (userType !== "dealer") return projectContext;
    return {
      ...projectContext,
      availableOffers:    projectContext.availableOffers.filter(o => o.make === "Honda"),
      availableTemplates: projectContext.availableTemplates.filter(t => t.brand === "Honda"),
    };
  }, [projectContext, userType]);

  const filteredCtxRef = useRef<ProjectContextPayload | null>(null);
  useEffect(() => { filteredCtxRef.current = filteredContext; }, [filteredContext]);

  useEffect(() => {
    if (messages.length === 0) return;
    const now = Date.now(); const title = getThreadTitle(messages);
    setThreads(prev => {
      const tid = currentThreadIdRef.current;
      if (tid) {
        const updated = prev.map(t => t.id === tid ? { ...t, messages, title, updatedAt: now } : t);
        saveAgentThreads(updated); return updated;
      } else {
        const newId = `t-${now}`;
        currentThreadIdRef.current = newId;
        const newThread: AgentThread = { id: newId, title, messages, createdAt: now, updatedAt: now };
        const updated = [newThread, ...prev];
        saveAgentThreads(updated); return updated;
      }
    });
  }, [messages]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleToolResult = useCallback((toolName: string, toolInput: Record<string, unknown>) => {
    const preText = accRef.current.trim();
    if (preText) {
      setMessages(prev => [...prev, { id: `a-${Date.now()}`, role: "assistant", type: "text", content: preText } as TextMessage]);
      accRef.current = ""; setStreamingText("");
    }

    const ti = toolInput as unknown;
    if (toolName === "setup_project") {
      setMessages(prev => [...prev, { id: `setup-${Date.now()}`, role: "assistant", type: "setup", input: ti as SetupInput, applied: false } as SetupMsg]);
    } else if (toolName === "propose_offers") {
      setMessages(prev => [...prev, { id: `offers-${Date.now()}`, role: "assistant", type: "offers", input: ti as OffersInput, applied: false } as OffersMsg]);
    } else if (toolName === "propose_templates") {
      setMessages(prev => [...prev, { id: `templates-${Date.now()}`, role: "assistant", type: "templates", input: ti as TemplatesInput, applied: false } as TemplatesMsg]);
    } else if (toolName === "propose_backgrounds") {
      if (proactiveModeRef.current) {
        const bgIds = (ti as BackgroundsInput).background_ids ?? [];
        dispatchAction({ action: "add_backgrounds", backgroundIds: bgIds });
        const bgNames = bgIds.map(id => SCENE_BACKGROUNDS.find(b => b.id === id)?.name ?? id).join(", ");
        const bgLabel = bgIds.length === 1 ? `**${bgNames}**` : `**${bgIds.length} backgrounds** (${bgNames})`;
        setMessages(prev => [...prev, { id: `a-${Date.now()}`, role: "assistant", type: "text", content: `Based on your last project, I recommend ${bgLabel} as your scene backgrounds. I've already added them to the project.` } as TextMessage]);
        setTimeout(() => fireNextStepRef.current?.("backgrounds"), 400);
      } else {
        setMessages(prev => [...prev, { id: `backgrounds-${Date.now()}`, role: "assistant", type: "backgrounds", input: ti as BackgroundsInput, applied: false } as BackgroundsMsg]);
      }
    } else if (toolName === "propose_task_owners") {
      setMessages(prev => [...prev, { id: `task-owners-${Date.now()}`, role: "assistant", type: "task_owners", input: ti as TaskOwnersInput, applied: false, liveOwners: ctxRef.current?.taskOwners } as TaskOwnersMsg]);
    } else if (toolName === "propose_notify_owners") {
      setMessages(prev => [...prev, { id: `notify-owners-${Date.now()}`, role: "assistant", type: "notify_owners", input: ti as NotifyOwnersInput, applied: false, liveOwners: ctxRef.current?.taskOwners } as NotifyOwnersMsg]);
    } else if (toolName === "propose_share" || toolName === "propose_email") {
      const tiparsed = toolInput as { recipient_hints?: string[]; recipient_hint?: string };
      const recipientHints = tiparsed.recipient_hints ?? (tiparsed.recipient_hint ? [tiparsed.recipient_hint] : []);
      triggerEvent("email_notification_sent");
      setMessages(prev => [...prev, { id: `reviewer-picker-${Date.now()}`, role: "assistant", type: "reviewer_picker", applied: false, recipientHints } as ReviewerPickerMsg]);
    } else if (toolName === "propose_brand") {
      setMessages(prev => [...prev, { id: `brand-${Date.now()}`, role: "assistant", type: "brand", input: ti as BrandInput, applied: false } as BrandMsg]);
    } else if (toolName === "propose_project") {
      setMessages(prev => [...prev, { id: `proposal-${Date.now()}`, role: "assistant", type: "proposal", input: ti as ProposalInput, applied: false } as ProposalMsg]);
    } else if (toolName === "propose_proactive_questions") {
      setMessages(prev => [...prev, { id: `proactive-${Date.now()}`, role: "assistant", type: "proactive_questions", input: ti as ProactiveQuestionsInput, applied: false } as ProactiveQuestionsMsg]);
    } else if (toolName === "generate_dealer_background") {
      setMessages(prev => { const last = prev[prev.length - 1]; return (last?.role === "assistant" && last.type === "text") ? prev.slice(0, -1) : prev; });
      setBgProcessing(true);
      dispatchAction({ action: "set_dealer_bg_generating", value: true } as never);
      (async () => {
        try {
          const storedImage = pendingDealerImageRef.current;
          if (!storedImage) throw new Error("No dealer image stored. Please re-upload the image.");
          const ctx = ctxRef.current;
          const vehicleContext = (toolInput as { vehicle_context?: string }).vehicle_context ?? "";
          const ctx2 = ctxRef.current;
          const confirmedOffers = (() => {
            const fromIds = (ctx2?.availableOffers ?? []).filter(o => (ctx2?.currentOfferIds ?? []).includes(o.id));
            if (fromIds.length > 0) return fromIds;
            const vcLower = vehicleContext.toLowerCase();
            return (ctx2?.availableOffers ?? []).filter(o => vcLower.includes(o.model.toLowerCase()) || vcLower.includes(o.make.toLowerCase()));
          })();
          const primaryOffer = confirmedOffers[0];
          const primaryVehicle = primaryOffer
            ? { year: primaryOffer.year, make: primaryOffer.make, model: primaryOffer.model, trim: primaryOffer.trim, offerId: primaryOffer.id, imageUrl: (primaryOffer as { image?: string }).image }
            : { year: new Date().getFullYear().toString(), make: vehicleContext.split(",")[0]?.trim() ?? "Vehicle", model: "", trim: "", offerId: "preview" };

          const { generatePreviewBackground, generatePreviewComposite } = await import("../../../lib/dealerBackgroundGenerator");
          const cleanPreviewBg = await generatePreviewBackground(storedImage);
          const previewUrl = await generatePreviewComposite(cleanPreviewBg, primaryVehicle);

          const bgId = `dealer-bg-${Date.now()}`;
          const selectedTemplates = (ctx?.availableTemplates ?? []).filter(t => (ctx?.currentTemplateIds ?? []).includes(t.id));
          const KNOWN_SIZES_MAP: Record<string, [number, number]> = {
            "website-2000x500": [2000, 500], "display-970x250": [970, 250],
            "display-300x250": [300, 250], "social-1080x1080": [1080, 1080],
            "website-600x450": [600, 450], "website-600x1067": [600, 1067],
          };
          const findBestSizeKey = (w: number, h: number) => {
            const ar = w / h;
            return Object.entries(KNOWN_SIZES_MAP).reduce((best, [key, [kw, kh]]) => {
              const diff = Math.abs(ar - kw / kh);
              return diff < best.diff ? { key, diff } : best;
            }, { key: "display-300x250", diff: Infinity }).key;
          };
          const templateKeys = [...new Set(selectedTemplates.map(t => findBestSizeKey(t.width, t.height)))];

          const customBg: any = {
            id: bgId, name: "Your Scene", thumbnail: cleanPreviewBg,
            images: { "website-600x450": cleanPreviewBg },
            _dealerPhotoDataUrl: storedImage, _cleanBaseBg: cleanPreviewBg,
            _confirmedOffers: confirmedOffers.map(o => ({ offerId: o.id, year: o.year, make: o.make, model: o.model, trim: o.trim, imageUrl: (o as { image?: string }).image })),
            _templateKeys: templateKeys,
          };
          pendingDealerImageRef.current = null;
          setBgProcessing(false);
          setMessages(prev => [...prev, { id: `dealer-bg-${Date.now()}`, role: "assistant", type: "dealer_bg_proposal", bgObject: customBg, previewUrl, applied: false } as DealerBgProposalMsg]);
          dispatchAction({ action: "set_dealer_bg_generating", value: false } as never);
        } catch (err) {
          setBgProcessing(false);
          setMessages(prev => [...prev, { id: `e-${Date.now()}`, role: "assistant", type: "text", content: `⚠️ Background generation failed: ${String(err)}.` } as TextMessage]);
          dispatchAction({ action: "set_dealer_bg_generating", value: false } as never);
        }
      })();
    } else if (toolName === "propose_parsed_offers") {
      const rawInput = toolInput as Record<string, unknown>;
      const normalizedOffers = ((rawInput.offers ?? []) as Record<string, unknown>[]).map(o => {
        const fc: Record<string, "high" | "medium" | "low"> = {};
        if (o.field_confidence && typeof o.field_confidence === "object") Object.assign(fc, o.field_confidence);
        const confidenceKeys = ["monthly_payment", "term", "due_at_signing", "trim", "year", "apr"];
        for (const k of confidenceKeys) {
          const flat = o[`confidence_${k}`] as string | undefined;
          if (flat) fc[k] = flat as "high" | "medium" | "low";
          delete o[`confidence_${k}`];
        }
        return { ...o, field_confidence: fc };
      });
      setMessages(prev => [...prev, { id: `parsed-${Date.now()}`, role: "assistant", type: "parsed_offers",
        input: { source: (rawInput.source as string) ?? "", offers: normalizedOffers as ParsedOfferRow[], extraction_notes: rawInput.extraction_notes as string | undefined }, applied: false } as ParsedOffersMsg]);
    } else {
      setMessages(prev => [...prev, { id: `tool-${Date.now()}`, role: "assistant", type: "tool", name: toolName, input: toolInput } as ToolChipMsg]);
      if (toolName === "add_offers_to_project")         dispatchAction({ action: "add_offers",        offerIds:    toolInput.offer_ids    as string[] });
      else if (toolName === "remove_offers_from_project") dispatchAction({ action: "remove_offers",   offerIds:    toolInput.offer_ids    as string[] });
      else if (toolName === "add_templates_to_project")   dispatchAction({ action: "add_templates",   templateIds: toolInput.template_ids as string[] });
      else if (toolName === "remove_templates_from_project") dispatchAction({ action: "remove_templates", templateIds: toolInput.template_ids as string[] });
      else if (toolName === "set_project_name")           dispatchAction({ action: "set_project_name", name: toolInput.name as string });
      else if (toolName === "edit_offer") {
        const p = (toolInput.patches ?? {}) as Record<string, unknown>;
        const patches: Record<string, unknown> = {};
        if (p.monthlyPayment     != null) patches.monthlyPayment     = Number(p.monthlyPayment);
        if (p.term               != null) patches.term               = Number(p.term);
        if (p.totalDueAtSigning  != null) patches.totalDueAtSigning  = Number(p.totalDueAtSigning);
        if (p.offerType          != null) patches.offerType          = p.offerType;
        if (p.trim               != null) patches.trim               = p.trim;
        if (p.year               != null) patches.year               = p.year;
        if (p.make               != null) patches.make               = p.make;
        if (p.model              != null) patches.model              = p.model;
        dispatchAction({ action: "edit_offer", offerId: toolInput.offer_id as string, patches: patches as never });
      }
      else if (toolName === "add_backgrounds_to_project")    dispatchAction({ action: "add_backgrounds",    backgroundIds: toolInput.background_ids as string[] });
      else if (toolName === "remove_backgrounds_from_project") dispatchAction({ action: "remove_backgrounds", backgroundIds: toolInput.background_ids as string[] });
      else if (toolName === "duplicate_template_in_project") dispatchAction({ action: "duplicate_template", templateId: toolInput.template_id as string, newName: toolInput.new_name as string | undefined });
      else if (toolName === "update_project_display") {
        const p: { ctaText?: string; leaseLabel?: string; finePrint?: string; dealerName?: string } = {};
        if (toolInput.cta_text    != null) p.ctaText    = toolInput.cta_text    as string;
        if (toolInput.lease_label != null) p.leaseLabel = toolInput.lease_label as string;
        if (toolInput.fine_print  != null) p.finePrint  = toolInput.fine_print  as string;
        if (toolInput.dealer_name != null) p.dealerName = toolInput.dealer_name as string;
        dispatchAction({ action: "update_project_display", patches: p });
      }
      else if (toolName === "swap_jellybean_color") {
        const { offer_id, color_family, model, year, trim } = toolInput as { offer_id: string; color_family: string; model: string; year?: string; trim?: string };
        const url = resolveJellybean(model, color_family, year, trim);
        if (url) dispatchAction({ action: "swap_jellybean", offerId: offer_id, jellybeanUrl: url, jellybeanId: `jb-${model}-${color_family}`, colorFamily: color_family });
      }
    }
  }, [dispatchAction, triggerEvent]);

  const sendInternal = useCallback(async (text: string) => {
    const contMsg: ContinuationMsg = { id: `cont-${Date.now()}`, role: "user", type: "continuation", content: text };
    setMessages(prev => [...prev, contMsg]);
    const ctx: ProjectContextPayload = filteredCtxRef.current ?? ctxRef.current ?? {
      projectId: "", projectName: "(no project open)", oem: "", currentOfferIds: [], currentTemplateIds: [], availableOffers: [], availableTemplates: [],
    };
    const offersAlreadyExtracted = messagesRef.current.some(m => m.type === "parsed_offers");
    const rawMsgs = [...messagesRef.current, contMsg].filter((m): m is TextMessage | ContinuationMsg | UserFileMsg =>
      m.type === "text" || m.type === "continuation" || m.type === "user_file"
    );
    const history: ApiMessage[] = [];
    for (const m of rawMsgs) {
      if (m.type === "user_file" && offersAlreadyExtracted) {
        history.push({ role: "user", content: (m as UserFileMsg).text || "Document uploaded." });
        history.push({ role: "assistant", content: "The vehicle offers have been extracted from the uploaded document and are ready." });
      } else {
        history.push({ role: m.role as "user" | "assistant", content: m.type === "user_file" ? (m as UserFileMsg).apiContent : (m as TextMessage | ContinuationMsg).content });
      }
    }
    // Pipeline state markers
    {
      const markers: string[] = [];
      if (ctx.currentOfferIds?.length)    markers.push(`propose_offers ✅ (${ctx.currentOfferIds.length} offers in project)`);
      if (ctx.currentTemplateIds?.length) markers.push(`propose_templates ✅ (${ctx.currentTemplateIds.length} templates in project)`);
      if (ctx.activeBrandOem)             markers.push(`propose_brand ✅ (${ctx.activeBrandOem} brand kit active)`);
      const bgApplied = messagesRef.current.some(m => (m.type === "backgrounds" || m.type === "dealer_bg_proposal") && (m as any).applied);
      if (bgApplied) markers.push("propose_backgrounds / generate_dealer_background ✅ (background confirmed)");
      const taskOwnersApplied = messagesRef.current.some(m => m.type === "task_owners" && (m as any).applied);
      if (taskOwnersApplied) markers.push("propose_task_owners ✅ (task owners set)");
      if (markers.length > 0) {
        history.splice(history.length - 1, 0,
          { role: "user" as const, content: `[PIPELINE STATE — steps already completed: ${markers.join(" | ")}. Do NOT re-propose any of these.]` },
          { role: "assistant" as const, content: "Confirmed. I will not re-propose completed steps." },
        );
      }
    }
    const FORCED_TOOL_PATTERNS: Array<[string, string]> = [
      ["Next: setup_project",         "setup_project"],
      ["Next: propose_offers",        "propose_offers"],
      ["Next: propose_templates",     "propose_templates"],
      ["Next: propose_backgrounds",   "propose_backgrounds"],
      ["Next: propose_brand",         "propose_brand"],
      ["Next: propose_email",         "propose_email"],
      ["Next: propose_share",         "propose_share"],
      ["Next: propose_task_owners",   "propose_task_owners"],
      ["Next: propose_notify_owners", "propose_notify_owners"],
      ["NOW call propose_task_owners","propose_task_owners"],
      ["Call propose_parsed_offers",  "propose_parsed_offers"],
      ["generate_dealer_background",  "generate_dealer_background"],
    ];
    const forcedTool = FORCED_TOOL_PATTERNS.find(([p]) => text.includes(p))?.[1];
    accRef.current = ""; setStreamingText("");
    await streamMessage(history, ctx,
      d => { accRef.current += d; setStreamingText(accRef.current); },
      handleToolResult,
      () => { const t = accRef.current; accRef.current = ""; setStreamingText(""); if (t.trim()) setMessages(p => [...p, { id: `a-${Date.now()}`, role: "assistant", type: "text", content: t } as TextMessage]); },
      err => { setMessages(p => [...p, { id: `e-${Date.now()}`, role: "assistant", type: "text", content: `⚠️ ${err}` } as TextMessage]); accRef.current = ""; setStreamingText(""); },
      forcedTool,
    );
  }, [streamMessage, handleToolResult]);

  const send = useCallback(async (text: string, attachments: File[]) => {
    if (!text.trim() && !attachments.length || streaming) return;

    if (awaitingNewProject) {
      setAwaitingNewProject(false);
      const confirmed = /\b(yes|ok|sure|yeah|yep|sim|claro|certo|pode|vamos|yup|go)\b/i.test(text.trim());
      setMessages(prev => [...prev, { id: `u-${Date.now()}`, role: "user", type: "text", content: text } as TextMessage]);
      if (confirmed) {
        setMessages([]); setStreamingText(""); currentThreadIdRef.current = null;
        setShowHistory(false); proactiveModeRef.current = false; setProactiveMode(false);
        setTimeout(() => {
          const ctx = ctxRef.current;
          const oem = ctx?.availableOffers?.[0]?.make ?? "General";
          const now = new Date();
          const fmt = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
          const setupInput: SetupInput = {
            project_name: deduplicateName("New Project", knownProjectNames), oem,
            start_date: fmt(now), end_date: fmt(new Date(now.getFullYear(), now.getMonth() + 1, now.getDate())),
            flow_steps: ["offers", "templates", "backgrounds", "brand"],
          };
          setMessages([
            { id: `a-${Date.now()}`, role: "assistant", type: "text", content: "Starting fresh! Fill in the details below and confirm when you're ready." } as TextMessage,
            { id: `setup-${Date.now()}`, role: "assistant", type: "setup", input: setupInput, applied: false } as SetupMsg,
          ]);
        }, 350);
      } else {
        setMessages(prev => [...prev, { id: `a-${Date.now()}`, role: "assistant", type: "text", content: `No problem — I'll keep working on **${ctxRef.current?.projectName ?? "this project"}**.` } as TextMessage]);
      }
      return;
    }

    const isProactiveIntent = /\b(proactive|proactively|automatic|automatically|autopilot)\b|do\s+(it\s+all|everything)\s*for\s+me|build\s+(?:the\s+)?(?:whole|entire|full)\s+(?:campaign|project)/i.test(text);

    if (!isProactiveIntent && !attachments.length && ctxRef.current?.projectId && /\b(create|build|start|new)\b.*(project|campaign)/i.test(text.trim())) {
      const name = ctxRef.current.projectName;
      const isComplete = messages.some(m => m.type === "campaign_cta");
      setMessages(prev => [...prev,
        { id: `u-${Date.now()}`, role: "user", type: "text", content: text } as TextMessage,
        { id: `a-${Date.now()}`, role: "assistant", type: "text", content: isComplete
          ? `**${name}** is complete — would you like to create a new project? Just say **yes** to confirm.`
          : `**${name}** is already open — ask me to add offers, templates, backgrounds, or share the project instead.` } as TextMessage,
      ]);
      if (isComplete) setAwaitingNewProject(true);
      return;
    }

    if (!attachments.length && /generate\s+assets?/i.test(text.trim())) {
      window.dispatchEvent(new CustomEvent(AGENT_GENERATE_ASSETS_EVENT));
      setMessages(prev => [...prev,
        { id: `u-${Date.now()}`, role: "user", type: "text", content: text } as TextMessage,
        { id: `a-${Date.now()}`, role: "assistant", type: "text", content: "Opening **Generate Assets**…" } as TextMessage,
      ]);
      return;
    }

    const ctx: ProjectContextPayload = filteredContext ?? projectContext ?? {
      projectId: "", projectName: "(no project open)", oem: "", currentOfferIds: [], currentTemplateIds: [], availableOffers: [], availableTemplates: [],
    };

    let userMsg: TextMessage | UserFileMsg;
    if (attachments.length > 0) {
      const blocks: ApiContentBlock[] = [];
      if (text.trim()) blocks.push({ type: "text", text: text.trim() });
      for (const attachment of attachments) {
        try {
          if (attachment.type.startsWith("image/")) {
            const b64 = await fileToBase64(attachment);
            blocks.push({ type: "image", source: { type: "base64", media_type: attachment.type, data: b64 } });
          } else if (attachment.type === "application/pdf") {
            const b64 = await fileToBase64(attachment);
            blocks.push({ type: "document", source: { type: "base64", media_type: "application/pdf", data: b64 } });
          } else if (/\.xlsx?$/i.test(attachment.name) || attachment.type.includes("spreadsheet") || attachment.type.includes("excel")) {
            const excelText = await parseExcelToText(attachment);
            const textIdx = blocks.findIndex(b => b.type === "text");
            const combined = (textIdx >= 0 ? (blocks[textIdx] as { type: "text"; text: string }).text + "\n\n" : "") + excelText;
            if (textIdx >= 0) blocks.splice(textIdx, 1);
            blocks.unshift({ type: "text", text: combined });
          } else {
            blocks.push({ type: "text", text: `[Attached file: ${attachment.name}]` });
          }
        } catch { blocks.push({ type: "text", text: `[File: ${attachment.name} — could not process]` }); }
      }
      if (!blocks.some(b => b.type === "text")) {
        blocks.unshift({ type: "text", text: `Please extract offers from these files: ${attachments.map(f => f.name).join(", ")}` });
      }
      userMsg = { id: `u-${Date.now()}`, role: "user", type: "user_file", text: text.trim(), files: attachments.map(f => ({ name: f.name, type: f.type })), apiContent: blocks };
    } else {
      userMsg = { id: `u-${Date.now()}`, role: "user", type: "text", content: text };
    }

    setMessages(prev => [...prev, userMsg]);

    const isFileUpload   = userMsg.type === "user_file";
    const isImageUpload  = isFileUpload && (userMsg as UserFileMsg).files.some(f => f.type.startsWith("image/"));
    const lowerTextForBg = text.toLowerCase();
    const hasBgIntent    = isImageUpload && (
      !lowerTextForBg.trim() || lowerTextForBg.includes("background") || lowerTextForBg.includes("project") ||
      lowerTextForBg.includes("campaign") || lowerTextForBg.includes("scene") || lowerTextForBg.includes("dealer")
    );
    if (hasBgIntent) {
      const imageFile = attachments.find(f => f.type.startsWith("image/"));
      if (imageFile) {
        const reader = new FileReader();
        reader.onloadend = () => { if (typeof reader.result === "string") pendingDealerImageRef.current = reader.result; };
        reader.readAsDataURL(imageFile);
      }
    }

    const isImageOrDocument = isFileUpload && !hasBgIntent && (userMsg as UserFileMsg).files.some(f => f.type.startsWith("image/") || f.type === "application/pdf" || /\.xlsx?$/i.test(f.name));

    const offersExtracted = messages.some(m => m.type === "parsed_offers");
    const rawSendMsgs = [...messages, userMsg].filter((m): m is TextMessage | ContinuationMsg | UserFileMsg => m.type === "text" || m.type === "continuation" || m.type === "user_file");
    const history: ApiMessage[] = [];
    for (const m of rawSendMsgs) {
      if (m.type === "user_file" && offersExtracted && m !== userMsg) {
        history.push({ role: "user", content: (m as UserFileMsg).text || "Document uploaded." });
        history.push({ role: "assistant", content: "The vehicle offers have been extracted from the uploaded document and are ready." });
      } else {
        history.push({ role: m.role as "user" | "assistant", content: m.type === "user_file" ? (m as UserFileMsg).apiContent : (m as TextMessage | ContinuationMsg).content });
      }
    }

    accRef.current = ""; setStreamingText("");

    if (isImageOrDocument) {
      pendingPipelineTextRef.current = text.trim();
      setStreaming(true);
      try {
        const res = await fetch("/api/agent/extract", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: history }) });
        if (!res.ok || !res.body) throw new Error(`Server error ${res.status}`);
        const reader = res.body.getReader(); const dec = new TextDecoder(); let buf = "";
        while (true) {
          const { done, value } = await reader.read(); if (done) break;
          buf += dec.decode(value, { stream: true });
          const lines = buf.split("\n"); buf = lines.pop() ?? "";
          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const raw = line.slice(6).trim(); if (!raw) continue;
            let ev: Record<string, unknown>; try { ev = JSON.parse(raw); } catch { continue; }
            if (ev.type === "tool_result") handleToolResult(ev.name as string, ev.input as Record<string, unknown>);
            else if (ev.type === "error") setMessages(prev => [...prev, { id: `e-${Date.now()}`, role: "assistant", type: "text", content: `⚠️ ${ev.message}` } as TextMessage]);
          }
        }
      } catch (err) {
        setMessages(prev => [...prev, { id: `e-${Date.now()}`, role: "assistant", type: "text", content: `⚠️ ${String(err)}` } as TextMessage]);
      } finally { setStreaming(false); }
      return;
    }

    const KNOWN_CONTACTS = ["Katelyn","Luke","Jenny","Sonya","Zak","Rachel","Jenni","Mike","Sarah","James","Ashley","Mallory","Jorge"];
    const lowerText = text.toLowerCase();
    const hasSendVerb = /\b(send|share|manda|envia|forward)\b/.test(lowerText);
    const hasPersonOrMech = KNOWN_CONTACTS.some(n => text.includes(n)) || /\b(email|platform|via\s+platform|via\s+email)\b/.test(lowerText);
    const hasPlatformKeyword = /\b(platform|via platform|platform message)\b/.test(lowerText);
    let userForcedTool: string | undefined;
    if (hasSendVerb && (hasPersonOrMech || hasPlatformKeyword)) userForcedTool = "propose_share";
    const wantsProactive = /\b(proactive|proactively|automatic|automatically|autopilot)\b|do\s+(it\s+all|everything)\s*for\s+me/i.test(lowerText) && !hasBgIntent;
    if (wantsProactive && !userForcedTool) { userForcedTool = "propose_proactive_questions"; triggerEvent("automatic_project_created"); }
    if (hasBgIntent && !ctx.projectId) userForcedTool = "setup_project";

    if (hasBgIntent && ctx.projectId && /\b(create|build|start|new)\b.*(project|campaign)/i.test(text.trim())) {
      const oem = ctx?.availableOffers?.[0]?.make ?? "General";
      const now = new Date();
      const fmt = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
      const setupInput: SetupInput = {
        project_name: deduplicateName("New Project", knownProjectNames), oem,
        start_date: fmt(now), end_date: fmt(new Date(now.getFullYear(), now.getMonth() + 1, now.getDate())),
        flow_steps: ["offers", "templates", "backgrounds", "brand"],
      };
      currentThreadIdRef.current = null; setShowHistory(false);
      proactiveModeRef.current = false; setProactiveMode(false); setStreamingText("");
      setMessages([
        { id: `u-${Date.now()}`, role: "user", type: "text", content: text } as TextMessage,
        { id: `a-${Date.now()}`, role: "assistant", type: "text", content: "Starting a new project — your background image is saved and will be used at the backgrounds step. Fill in the details below." } as TextMessage,
        { id: `setup-${Date.now()}`, role: "assistant", type: "setup", input: setupInput, applied: false } as SetupMsg,
      ]);
      return;
    }

    if (hasBgIntent && ctx.projectId) {
      const confirmedOffers = (ctx.availableOffers ?? []).filter(o => (ctx.currentOfferIds ?? []).includes(o.id));
      const vehicleCtx = confirmedOffers.map(o => `${o.year} ${o.make} ${o.model}`).join(", ") || "project vehicles";
      setTimeout(() => sendInternal(`Background image uploaded for the open project "${ctx.projectName}". Call generate_dealer_background with vehicle_context="${vehicleCtx}". Do NOT call setup_project — the project is already active.`), 400);
      return;
    }

    await streamMessage(history, ctx,
      d => { accRef.current += d; setStreamingText(accRef.current); },
      handleToolResult,
      () => { const t = accRef.current; accRef.current = ""; setStreamingText(""); if (t.trim()) setMessages(prev => [...prev, { id: `a-${Date.now()}`, role: "assistant", type: "text", content: t } as TextMessage]); },
      err => { setMessages(prev => [...prev, { id: `e-${Date.now()}`, role: "assistant", type: "text", content: `⚠️ ${err}` } as TextMessage]); accRef.current = ""; setStreamingText(""); },
      userForcedTool,
    );
  }, [streaming, projectContext, filteredContext, messages, streamMessage, handleToolResult, awaitingNewProject, knownProjectNames, sendInternal, triggerEvent]);

  const getFlowSteps = useCallback((): string[] => {
    const msgs = messagesRef.current;
    const _setupArr = msgs.filter((m): m is SetupMsg => m.type === "setup");
    const setupMsg = _setupArr[_setupArr.length - 1];
    if (setupMsg && pendingDealerImageRef.current) return ["offers", "templates", "dealer_bg", "brand"];
    const SCOPE_STEPS: Record<string, string[]> = {
      full:                 ["offers", "templates", "backgrounds", "brand"],
      offers_only:          ["offers"],
      templates_only:       ["templates"],
      offers_and_templates: ["offers", "templates"],
      templates_and_email:  ["templates", "email"],
      offers_and_email:     ["offers", "email"],
      full_dealer_bg:       ["offers", "templates", "dealer_bg", "brand"],
    };
    const scope = setupMsg?.input.flow_scope;
    if (scope && scope in SCOPE_STEPS) return SCOPE_STEPS[scope];
    const legacySteps = setupMsg?.input.flow_steps;
    if (legacySteps && legacySteps.length > 0) return legacySteps;
    const userMsgs = msgs.filter((m): m is TextMessage => m.type === "text" && m.role === "user");
    const inferStepsFrom = (text: string): string[] | null => {
      const t = text.toLowerCase();
      const steps: string[] = [];
      if (t.includes("offer")) steps.push("offers");
      if (t.includes("template")) steps.push("templates");
      if (t.includes("background")) steps.push("backgrounds");
      if (t.includes("email") || t.includes("send") || t.includes("share")) steps.push("email");
      return steps.length > 0 ? steps : null;
    };
    const recentUser = userMsgs[userMsgs.length - 1]; const firstUser = userMsgs[0];
    if (recentUser && recentUser !== firstUser) { const s = inferStepsFrom(recentUser.content); if (s) return s; }
    if (firstUser) { const s = inferStepsFrom(firstUser.content); if (s) return s; }
    return ["offers", "templates", "backgrounds", "brand"];
  }, []);

  const catalogHasOffersFor = useCallback((oem: string): boolean => {
    const offers = ctxRef.current?.availableOffers ?? [];
    if (offers.length === 0) return false;
    const oemLower = oem.toLowerCase().trim();
    return offers.some(o => { const ml = (o.make ?? "").toLowerCase(); return ml.includes(oemLower) || oemLower.includes(ml); });
  }, []);

  const buildOffersContinuation = useCallback((prefix: string, oem: string): string => {
    if (catalogHasOffersFor(oem)) return `${prefix}. Next: propose_offers`;
    const hasFile = messagesRef.current.some(m => m.type === "user_file");
    const context = hasFile
      ? "Call propose_parsed_offers now — scan the image/document in the conversation history and extract every offer row you can see."
      : "Call propose_parsed_offers now — no catalog offers exist for this brand. Create placeholder rows using the project OEM and current year so the user can fill in the details inline.";
    return `${prefix}. The offer catalog has NO offers for "${oem}". Do NOT call propose_offers. ${context}`;
  }, [catalogHasOffersFor]);

  const fireNextStep = useCallback((completedStep: string) => {
    const steps = getFlowSteps();
    const idx = steps.indexOf(completedStep);
    const nextStep = idx >= 0 && idx < steps.length - 1 ? steps[idx + 1] : null;
    const effectiveNext = (nextStep === "brand" && ctxRef.current?.activeBrandOem) ? (steps[idx + 2] ?? null) : nextStep;
    if (!nextStep || !effectiveNext) {
      if (proactiveModeRef.current) { proactiveModeRef.current = false; setProactiveMode(false); }
      triggerEvent("project_pipeline_complete");
      const ctx = ctxRef.current;
      const offerCount = ctx?.currentOfferIds.length ?? 0; const templateCount = ctx?.currentTemplateIds.length ?? 0;
      if (offerCount > 0 && templateCount > 0) {
        setTimeout(() => setMessages(prev => [...prev, { id: `a-${Date.now()}`, role: "assistant", type: "text", content: "Your offers, templates, and backgrounds are all confirmed. Ready to generate the ad assets?", isGenerateAssetsPrompt: true } as TextMessage]), 600);
      }
      return;
    }
    if (effectiveNext === "dealer_bg") {
      const ctx = ctxRef.current;
      const confirmedOffers = (ctx?.availableOffers ?? []).filter(o => (ctx?.currentOfferIds ?? []).includes(o.id));
      const vehicleContext = confirmedOffers.length > 0 ? confirmedOffers.map(o => `${o.year} ${o.make} ${o.model}`).join(", ") : "vehicles";
      setTimeout(() => sendInternal(`Step complete. generate_dealer_background vehicle_context="${vehicleContext}".`), 400);
      return;
    }
    if (effectiveNext === "offers") {
      const _sa2 = messagesRef.current.filter((m): m is SetupMsg => m.type === "setup");
      const setupMsg = _sa2[_sa2.length - 1];
      const oem = setupMsg?.input.oem ?? ctxRef.current?.oem ?? "";
      setTimeout(() => sendInternal(buildOffersContinuation("Step complete", oem)), 400);
      return;
    }
    const continuations: Record<string, string> = {
      templates: "Step complete. Next: propose_templates", backgrounds: "Step complete. Next: propose_backgrounds",
      brand: "Step complete. Next: propose_brand", email: "Step complete. Next: propose_email", dealer_bg: "Step complete. Next: propose_brand",
    };
    const msg = continuations[effectiveNext];
    if (msg) setTimeout(() => sendInternal(msg), 400);
  }, [getFlowSteps, sendInternal, buildOffersContinuation, triggerEvent]);

  useEffect(() => { fireNextStepRef.current = fireNextStep; }, [fireNextStep]);

  const handleSetupApply = useCallback((name: string, account: string, oem: string, startDate: string, endDate: string, owner: string, platforms: string[]) => {
    projectCreatedByConversationRef.current = true;
    dispatchAction({ action: "create_project", name, account, oem, startDate, endDate, owner, platforms });
    setKnownProjectNames(prev => [...prev, name]);
    if (!pendingParsedOffersRef.current) {
      const unapplied = (messagesRef.current as Message[]).filter((m): m is ParsedOffersMsg => m.type === "parsed_offers" && !(m as ParsedOffersMsg).applied).flatMap(m => (m as ParsedOffersMsg).input.offers) as unknown as CustomOffer[];
      if (unapplied.length > 0) { pendingParsedOffersRef.current = unapplied; setMessages(prev => prev.map(m => m.type === "parsed_offers" && !(m as ParsedOffersMsg).applied ? { ...m, applied: true } as ParsedOffersMsg : m)); }
    }
    setTimeout(() => {
      if (pendingParsedOffersRef.current) {
        const pending = pendingParsedOffersRef.current; pendingParsedOffersRef.current = null;
        dispatchAction({ action: "add_custom_offers", offers: pending });
        setTimeout(() => fireNextStep("offers"), 400); return;
      }
      if (pendingOffersFilesRef.current) {
        const files = pendingOffersFilesRef.current; pendingOffersFilesRef.current = null;
        setTimeout(() => send("Add the offers from the attached file to the project", files), 200); return;
      }
      const steps = getFlowSteps(); const firstStep = steps[0] ?? "offers";
      if (firstStep === "offers") { sendInternal(buildOffersContinuation("Project created", oem)); return; }
      const continuations: Record<string, string> = {
        templates: "Project created. Next: propose_templates", backgrounds: "Project created. Next: propose_backgrounds",
        brand: "Project created. Next: propose_brand", email: "Project created. Next: propose_email",
      };
      sendInternal(continuations[firstStep] ?? buildOffersContinuation("Project created", oem));
    }, 600);
  }, [dispatchAction, send, sendInternal, getFlowSteps, buildOffersContinuation, fireNextStep]);

  const handleProactiveQuestionsSubmit = useCallback((goal: string, timeline: string, offerFocus: string) => {
    setMessages(prev => prev.map(m => m.type === "proactive_questions" && !(m as ProactiveQuestionsMsg).applied ? { ...m, applied: true } as ProactiveQuestionsMsg : m));
    proactiveModeRef.current = true; setProactiveMode(true);
    setTimeout(() => sendInternal(`Proactive build. User priorities: Goal: ${goal}, Timeline: ${timeline}, Offer focus: ${offerFocus}. Call setup_project now with flow_steps ["offers","templates","backgrounds","brand"]. NO text output.`), 200);
  }, [sendInternal]);

  const handleOffersApply = useCallback((offerIds: string[], editedOfferIds: string[] = []) => {
    dispatchAction({ action: "add_offers", offerIds, editedOfferIds });
    const inSetupFlow = messagesRef.current.some(m => m.type === "setup");
    if (!inSetupFlow) { setTimeout(() => sendInternal("Offers added to project. Check the original user request and continue with any remaining steps."), 400); return; }
    fireNextStep("offers");
  }, [dispatchAction, sendInternal, fireNextStep]);

  const handleTemplatesApply = useCallback((templateIds: string[]) => {
    dispatchAction({ action: "add_templates", templateIds }); fireNextStep("templates");
  }, [dispatchAction, fireNextStep]);

  const handleBackgroundsApply = useCallback((backgroundIds: string[]) => {
    dispatchAction({ action: "add_backgrounds", backgroundIds }); fireNextStep("backgrounds");
  }, [dispatchAction, fireNextStep]);

  const handleBackgroundsDismiss = useCallback(() => { fireNextStep("backgrounds"); }, [fireNextStep]);

  const handleEmailApply = useCallback((recipient: string, message: string) => {
    dispatchAction({ action: "send_email", recipient, message });
    const ctx = ctxRef.current;
    const projectOffers    = ctx ? ctx.availableOffers.filter(o => ctx.currentOfferIds.includes(o.id)) : [];
    const projectTemplates = ctx ? ctx.availableTemplates.filter(t => ctx.currentTemplateIds.includes(t.id)) : [];
    fetch("/api/email/send-review", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recipient_email: recipient, message,
        project: { projectId: ctx?.projectId, projectName: ctx?.projectName ?? "Campaign", oem: ctx?.oem,
          start_date: ctx?.startDate, end_date: ctx?.endDate, campaign_owner: ctx?.owner,
          assetItems: (ctx?.generatedAssetPreviews ?? []).map(p => ({ bgUrl: p.bgUrl, vehicleUrl: p.vehicleUrl, offerName: p.offerName, dims: p.dims, offerType: p.offerType, monthlyPayment: p.monthlyPayment, term: p.term, trim: p.trim, make: p.make })),
          offers: projectOffers.map(o => { const rawImage = (o as { image?: string }).image ?? ""; const safeImage = rawImage.startsWith("blob:") || rawImage.startsWith("data:") ? "" : rawImage; return { id: o.id, year: o.year, make: o.make, model: o.model, trim: o.trim, offerType: o.offerType, monthlyPayment: o.monthlyPayment, term: o.term, image: safeImage }; }),
          templates: projectTemplates.map(t => ({ id: t.id, name: t.name, format: t.format })),
        },
      }),
    }).catch(() => {});
    setMessages(prev => [...prev, { id: `a-${Date.now()}`, role: "assistant", type: "text", content: `✅ Email sent to **${recipient}** with the project link.` } as TextMessage]);
    const projectId = ctxRef.current?.projectId;
    if (projectId) window.dispatchEvent(new CustomEvent("project-status-change", { detail: { projectId, status: "Awaiting Approval" } }));
  }, [dispatchAction]);

  const handleEmailDismiss = useCallback(() => {}, []);

  const handleShareChooseEmail = useCallback((recipientHint: string) => {
    const ctx = ctxRef.current;
    const name = ctx?.projectName ?? "this project"; const oem = ctx?.oem ?? "";
    const projectUrl = ctx?.projectId ? `https://constellation-ux-app.vercel.app/OEM/Projects?project=${ctx.projectId}` : "https://constellation-ux-app.vercel.app/OEM/Projects";
    setMessages(prev => [...prev, { id: `email-${Date.now()}`, role: "assistant", type: "email", input: { recipient_hint: recipientHint, message: `I'd like to share the ${oem} project "${name}" with you. You can view and collaborate on it using the link below:\n\n${projectUrl}` }, applied: false } as EmailMsg]);
  }, []);

  const handleShareChoosePlatform = useCallback((recipientName: string) => {
    const ctx = ctxRef.current;
    pushProjectMention(ctx?.projectId ?? "unknown", ctx?.projectName ?? "this project", activeUserName ?? "Someone");
    setMessages(prev => [...prev, { id: `a-${Date.now()}`, role: "assistant", type: "text", content: `✅ Platform notification sent to **${recipientName}**. They'll see a notification in their feed.` } as TextMessage]);
    const projectId = ctxRef.current?.projectId;
    if (projectId) window.dispatchEvent(new CustomEvent("project-status-change", { detail: { projectId, status: "Awaiting Approval" } }));
  }, [pushProjectMention, activeUserName]);

  const handleReviewerPickerConfirm = useCallback((msgId: string, selected: typeof MOCK_CONTACTS[number][], channels: Record<string, "platform" | "email">, _message: string) => {
    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, applied: true } as ReviewerPickerMsg : m));
    triggerEvent("reviewer_sent");
    const platformNames = selected.filter(c => channels[c.email] === "platform").map(c => c.name.split(" ")[0]).join(", ");
    const emailNames    = selected.filter(c => channels[c.email] === "email").map(c => c.name.split(" ")[0]).join(", ");
    const parts: string[] = [];
    if (platformNames) parts.push(`Platform notification sent to **${platformNames}**.`);
    if (emailNames)    parts.push(`Email sent to **${emailNames}**.`);
    setMessages(prev => [...prev, { id: `a-${Date.now()}`, role: "assistant", type: "text", content: parts.join(" ") } as TextMessage]);
    const projectId = ctxRef.current?.projectId;
    if (projectId) window.dispatchEvent(new CustomEvent("project-status-change", { detail: { projectId, status: "Awaiting Approval" } }));
  }, [triggerEvent]);

  const handleParsedOffersApply = useCallback((msgId: string, offers: CustomOffer[]) => {
    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, applied: true } as ParsedOffersMsg : m));
    const projectOpen = Boolean(ctxRef.current?.projectId);
    const inSetupFlow = messagesRef.current.some(m => m.type === "setup");
    const originalText = pendingPipelineTextRef.current;
    pendingPipelineTextRef.current = "";
    if (!projectOpen && !inSetupFlow) {
      pendingParsedOffersRef.current = offers;
      const oem = offers[0]?.make ?? "";
      const emailMatch = originalText.match(/(?:send|email|share)(?:\s+(?:it|this|project))?(?:\s+(?:to|with))?\s+([A-Z][a-z]+)/);
      const recipientClue = emailMatch?.[1] ?? "";
      let setupMsg = `Next: setup_project for a new ${oem} campaign.`;
      if (recipientClue) setupMsg += ` After setup, send by email to ${recipientClue}.`;
      else if (/template/i.test(originalText)) setupMsg += ` After setup, add templates.`;
      sendInternal(setupMsg); return;
    }
    dispatchAction({ action: "add_custom_offers", offers });
    if (inSetupFlow) { fireNextStep("offers"); }
    else if (originalText) {
      const emailMatch = originalText.match(/(?:send|email|share)(?:\s+(?:it|this|project))?(?:\s+(?:to|with))?\s+([A-Z][a-z]+)/);
      const recipientClue = emailMatch?.[1] ?? "";
      if (recipientClue) setTimeout(() => sendInternal(`Offers added. Now send by email to ${recipientClue}.`), 400);
    }
  }, [dispatchAction, fireNextStep, sendInternal]);

  const handleParsedOffersDismiss = useCallback((msgId: string) => {
    setMessages(prev => prev.filter(m => m.id !== msgId));
  }, []);

  const handleBrandApply = useCallback((oem: string) => {
    dispatchAction({ action: "set_brand", oem });
    setTimeout(() => fireNextStep("brand"), 400);
  }, [dispatchAction, fireNextStep]);

  const handleNewThread = useCallback(() => {
    setMessages([]); setStreamingText(""); currentThreadIdRef.current = null;
    setShowHistory(false); proactiveModeRef.current = false; setProactiveMode(false);
  }, []);

  const handleLoadThread = useCallback((thread: AgentThread) => {
    setMessages(thread.messages); currentThreadIdRef.current = thread.id; setShowHistory(false);
  }, []);

  const prevProjectIdRef = useRef<string | null>(null);
  useEffect(() => {
    const newId = projectContext?.projectId ?? "";
    if (prevProjectIdRef.current !== null && prevProjectIdRef.current !== newId) {
      if (projectCreatedByConversationRef.current) { projectCreatedByConversationRef.current = false; }
      else { handleNewThread(); }
    }
    prevProjectIdRef.current = newId;
  }, [projectContext?.projectId, handleNewThread]);

  const handleCreateProjectClick = useCallback(() => {
    if (simulatingStream) return;
    const ctx = ctxRef.current;
    const stagedFiles = stagedFilesRef.current.slice();
    if (stagedFiles.length > 0) {
      stagedFilesRef.current = [];
      const imageFiles = stagedFiles.filter(f => f.type.startsWith("image/"));
      const docFiles   = stagedFiles.filter(f => !f.type.startsWith("image/"));
      if (imageFiles.length > 0 && docFiles.length === 0) { send("Create a project", imageFiles); return; }
      if (docFiles.length > 0) pendingOffersFilesRef.current = docFiles;
    }
    if (ctx?.projectId) {
      const isComplete = messagesRef.current.some(m => m.type === "campaign_cta");
      setMessages(prev => [...prev,
        { id: `u-${Date.now()}`, role: "user", type: "text", content: "Create a project" } as TextMessage,
        { id: `a-${Date.now()}`, role: "assistant", type: "text", content: isComplete
          ? `**${ctx.projectName}** is complete — would you like to create a new project? Just say **yes** to confirm.`
          : `**${ctx.projectName}** is already open. Ask me to add or change offers, templates, backgrounds, or share it.` } as TextMessage,
      ]);
      if (isComplete) setAwaitingNewProject(true); return;
    }
    const oem = ctx?.availableOffers?.[0]?.make ?? "General";
    const now = new Date();
    const fmt = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    const setupInput: SetupInput = { project_name: deduplicateName("New Project", knownProjectNames), oem, start_date: fmt(now), end_date: fmt(new Date(now.getFullYear(), now.getMonth() + 1, now.getDate())), flow_steps: ["offers", "templates", "backgrounds", "brand"] };
    setMessages(prev => [...prev, { id: `u-${Date.now()}`, role: "user", type: "text", content: "Create a project" } as TextMessage]);
    setSimulatingStream(true);
    setTimeout(() => {
      setSimulatingStream(false);
      const oemLabel = oem !== "General" ? ` for **${oem}**` : "";
      setMessages(prev => [...prev,
        { id: `a-${Date.now()}`, role: "assistant", type: "text", content: `I'll set up a new project${oemLabel}. Review the details below and confirm when you're ready.` } as TextMessage,
        { id: `setup-${Date.now()}`, role: "assistant", type: "setup", input: setupInput, applied: false } as SetupMsg,
      ]);
    }, 1100);
  }, [knownProjectNames, simulatingStream, send]);

  const sendWithStaged = useCallback((text: string) => {
    const files = stagedFilesRef.current.slice(); stagedFilesRef.current = [];
    send(text, files);
  }, [send]);

  const handleProposalApply = useCallback((msgId: string, offerIds: string[], templateIds: string[], name?: string) => {
    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, applied: true } as ProposalMsg : m));
    if (offerIds.length)    dispatchAction({ action: "add_offers",      offerIds });
    if (templateIds.length) dispatchAction({ action: "add_templates",   templateIds });
    if (name)               dispatchAction({ action: "set_project_name", name });
  }, [dispatchAction]);

  const handleProposalDismiss = useCallback((msgId: string) =>
    setMessages(prev => prev.filter(m => m.id !== msgId)), []);

  const isAgency = userType === "dealer";
  const focusLabel = isAgency ? selectedAccount : (projectContext?.projectName ?? "Honda of Anywhere");
  const hasMessages = messages.length > 0 || streaming || simulatingStream;
  const arcState = useConstellationAnim((streaming && !streamingText) || simulatingStream || bgProcessing);

  const confirmedBgIds = filteredContext?.currentBackgroundIds
    ?? messages.filter((m): m is BackgroundsMsg => m.type === "backgrounds" && m.applied).flatMap(m => m.input.background_ids);
  const _appliedSetup = messages.filter((m): m is SetupMsg => m.type === "setup" && m.applied);
  const setupPlatforms = _appliedSetup[_appliedSetup.length - 1]?.input.platforms ?? [];

  // ── Render ──────────────────────────────────────────────────────────────────
  // Outer box animates width 0→paneWidth so surrounding layout reflows smoothly.
  // Inner box animates translateX so the content slides in from the right.
  return (
    <Box sx={{
      flexShrink: 0, height: "100%", overflow: "hidden",
      width: isOpen ? paneWidth : 0,
      transition: isResizing ? "none" : "width 0.45s cubic-bezier(0,0,0.2,1)",
    }}>
    <Box sx={{
      position: "relative", flexShrink: 0, height: "100%", overflow: "hidden",
      bgcolor: "background.paper", borderRadius: "16px",
      border: "1px solid rgba(0,0,0,0.04)", boxShadow: "0px 1px 2px rgba(0,0,0,0.08)",
      width: paneWidth,
      transform: isOpen ? "translateX(0)" : "translateX(100%)",
      opacity: isOpen ? 1 : 0,
      transition: isResizing ? "none" : "transform 0.45s cubic-bezier(0,0,0.2,1), opacity 0.45s cubic-bezier(0,0,0.2,1)",
      display: "flex", flexDirection: "column",
    }}>
      {/* Drag handle */}
      <Box
        onMouseDown={handlePaneDragStart}
        sx={{ position: "absolute", left: 0, top: 0, height: "100%", width: 6, cursor: "col-resize", zIndex: 10,
          "&:hover .drag-indicator, &:active .drag-indicator": { bgcolor: "#6356e1" },
        }}>
        <Box className="drag-indicator" sx={{ height: "100%", width: 3, ml: "1.5px", bgcolor: "transparent", transition: "background-color 0.15s", borderRadius: "100px" }} />
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", height: "100%", pt: "12px", px: "16px" }}>
        {/* ── Top bar ─────────────────────────────────────────────────────── */}
        <Box sx={{ position: "relative", display: "flex", alignItems: "center", gap: "4px", pb: "12px", flexShrink: 0 }}>
          <Tooltip title={showHistory ? "Back to conversation" : ""} placement="bottom">
            <IconButton size="small" onClick={() => { if (showHistory) setShowHistory(false); }} sx={{ color: "rgba(17,16,20,0.56)", width: 28, height: 28, flexShrink: 0 }}>
              <ChevronLeftIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
          <Typography sx={{ ml: "2px", fontSize: 16, fontWeight: 500, color: "#1f1d25", letterSpacing: "0.15px", whiteSpace: "nowrap", flexShrink: 0 }}>
            AI Agent Auto
          </Typography>
          <IconButton size="small" sx={{ color: "rgba(17,16,20,0.56)", width: 24, height: 24, ml: "2px", flexShrink: 0 }}>
            <ExpandMoreIcon sx={{ fontSize: 12 }} />
          </IconButton>
          <Box sx={{ position: "absolute", right: "-6px", top: 0, display: "flex", alignItems: "center", gap: "2px" }}>
            <Tooltip title={showHistory ? "Back to chat" : "Thread history"} placement="bottom">
              <IconButton size="small" onClick={() => { setShowHistory(h => !h); setHistorySearch(""); }}
                sx={{ color: "rgba(17,16,20,0.56)", width: 28, height: 28, bgcolor: showHistory ? "rgba(0,0,0,0.05)" : "transparent", flexShrink: 0 }}>
                <IconHistory />
              </IconButton>
            </Tooltip>
            <Tooltip title="New thread" placement="bottom">
              <IconButton size="small" onClick={handleNewThread} sx={{ color: "rgba(17,16,20,0.56)", width: 28, height: 28, flexShrink: 0 }}>
                <IconExpand />
              </IconButton>
            </Tooltip>
            <Tooltip title="Close panel" placement="bottom">
              <IconButton size="small" onClick={onClose} sx={{ color: "rgba(17,16,20,0.56)", width: 28, height: 28, flexShrink: 0 }}>
                <IconClose />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* ── Body ────────────────────────────────────────────────────────── */}
        <Box sx={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
          {showHistory ? (
            /* HISTORY STATE */
            <Box sx={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: "8px", mb: "12px", flexShrink: 0 }}>
                <Box sx={{ position: "relative", flex: 1 }}>
                  <SearchIcon sx={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", fontSize: 13, color: "#c4c1d0", pointerEvents: "none" }} />
                  <InputBase value={historySearch} onChange={e => setHistorySearch(e.target.value)} placeholder="Search conversations…"
                    sx={{ width: "100%", pl: "30px", pr: "10px", py: "7px", borderRadius: "10px", fontSize: 12, color: "#1f1d25", border: "1px solid rgba(0,0,0,0.10)", bgcolor: "#fafafb", "&.Mui-focused": { borderColor: "#473bab" } }} />
                </Box>
                <IconButton onClick={handleNewThread} title="New conversation" size="small"
                  sx={{ width: 34, height: 34, borderRadius: "50%", bgcolor: "rgba(71,59,171,0.08)", "&:hover": { bgcolor: "rgba(71,59,171,0.14)" }, color: "#473bab", flexShrink: 0 }}>
                  <AddIcon sx={{ fontSize: 15 }} />
                </IconButton>
              </Box>
              <Box sx={{ flex: 1, overflowY: "auto" }}>
                {(() => {
                  const filtered = threads.filter(t => !historySearch || t.title.toLowerCase().includes(historySearch.toLowerCase()));
                  const groups = groupThreadsByDate(filtered);
                  if (groups.length === 0) return <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: 120 }}><Typography sx={{ fontSize: 13, color: "#c4c1d0" }}>No conversations yet</Typography></Box>;
                  return groups.map(({ label, items }) => (
                    <Box key={label} sx={{ mb: "16px" }}>
                      <Typography sx={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "#c4c1d0", mb: "6px", px: "2px" }}>{label}</Typography>
                      <Box sx={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                        {items.map(thread => (
                          <Box component="button" key={thread.id} onClick={() => handleLoadThread(thread)}
                            sx={{ width: "100%", textAlign: "left", px: "10px", py: "8px", borderRadius: "10px", bgcolor: thread.id === currentThreadIdRef.current ? "rgba(71,59,171,0.06)" : "transparent", border: "none", cursor: "pointer", "&:hover": { bgcolor: "rgba(0,0,0,0.04)" } }}>
                            <Typography sx={{ fontSize: 13, fontWeight: 500, color: "#1f1d25", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{thread.title}</Typography>
                            <Typography sx={{ fontSize: 11, color: "#c4c1d0", mt: "1px" }}>
                              {new Date(thread.updatedAt).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  ));
                })()}
              </Box>
            </Box>
          ) : !hasMessages ? (
            /* NULL STATE */
            <Box sx={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
              <Box sx={{ pt: "12px", flexShrink: 0 }}>
                <Typography sx={{ fontSize: 20, fontWeight: 700, letterSpacing: "0.15px", lineHeight: 1.6, opacity: 0.9, mb: "10px",
                  background: "linear-gradient(99.77deg, rgb(71,59,171) 37.41%, rgb(172,171,255) 55.08%)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                  Welcome, Jorge
                </Typography>
                <Typography sx={{ fontSize: 14, color: "#1f1d25", letterSpacing: "0.15px", lineHeight: 1.5, opacity: 0.9, mb: "10px" }}>
                  {`Hi, I'm your Auto Intelligence Agent, ready to help you build and optimise your advertising projects.`}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Typography sx={{ fontSize: 14, color: "#1f1d25", letterSpacing: "0.15px", lineHeight: 1.5, opacity: 0.9, flexShrink: 0 }}>My current focus is</Typography>
                  <Typography sx={{ fontSize: 14, fontWeight: 700, letterSpacing: "0.15px", lineHeight: 1.5, opacity: 0.9, whiteSpace: "nowrap",
                    background: "linear-gradient(90deg, #473bab, #1f1d25)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                    {focusLabel}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ flex: 1 }} />
              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", pb: "16px", flexShrink: 0 }}>
                <AgentInput ref={agentInputRef} onSubmit={sendWithStaged} onFilesChange={files => { stagedFilesRef.current = files; }} onStop={stop} streaming={streaming} accountName={isAgency ? selectedAccount : "Honda of Anywhere"} />
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center", justifyContent: "center", width: "100%" }}>
                  {PROJECT_CATEGORIES.map(cat => (
                    <Tooltip key={cat} title={cat === "Create Automatic Project" ? "Create a full project. Agent will pick up all of our templates and take decisions for you." : ""} placement="top">
                      <span>
                        <CategoryChip label={cat} onClick={cat === "Create Automatic Project" ? () => send(CATEGORY_MESSAGES[cat] ?? cat, []) : () => agentInputRef.current?.populate(CATEGORY_MESSAGES[cat] ?? cat)} />
                      </span>
                    </Tooltip>
                  ))}
                </Box>
              </Box>
            </Box>
          ) : (
            /* CHAT STATE */
            <Box sx={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
              <Box sx={{ flex: 1, overflowY: "auto", pb: "8px", minHeight: 0 }}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: "12px", pt: "4px" }}>
                  {messages.map(msg => (
                    <MessageBubble key={msg.id} message={msg} context={filteredContext}
                      projectName={projectContext?.projectName ?? "this project"}
                      existingProjectNames={knownProjectNames}
                      confirmedBackgroundIds={confirmedBgIds}
                      setupPlatforms={setupPlatforms}
                      onSetupApply={handleSetupApply}
                      onSetupDismiss={() => setMessages(prev => prev.filter(m => m.id !== msg.id))}
                      onOffersApply={handleOffersApply}
                      onOffersDismiss={() => setMessages(prev => prev.filter(m => m.id !== msg.id))}
                      onTemplatesApply={handleTemplatesApply}
                      onTemplatesDismiss={() => setMessages(prev => prev.filter(m => m.id !== msg.id))}
                      onBackgroundsApply={handleBackgroundsApply}
                      onBackgroundsDismiss={handleBackgroundsDismiss}
                      onBrandApply={handleBrandApply}
                      onBrandDismiss={() => setMessages(prev => prev.filter(m => m.id !== msg.id))}
                      onProposalApply={(offerIds, templateIds, name) => handleProposalApply(msg.id, offerIds, templateIds, name)}
                      onProposalDismiss={() => handleProposalDismiss(msg.id)}
                      onEmailApply={handleEmailApply}
                      onEmailDismiss={handleEmailDismiss}
                      onShareChooseEmail={handleShareChooseEmail}
                      onShareChoosePlatform={handleShareChoosePlatform}
                      onReviewerPickerConfirm={(contacts, channels, message) => handleReviewerPickerConfirm(msg.id, contacts, channels, message)}
                      onParsedOffersApply={(offers) => handleParsedOffersApply(msg.id, offers)}
                      onParsedOffersDismiss={() => handleParsedOffersDismiss(msg.id)}
                      onNotifyOwnersApply={() => setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, applied: true } : m))}
                      onTaskOwnersApply={(owners) => {
                        dispatchAction({ action: "set_task_owners", owners });
                        setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, applied: true } : m));
                      }}
                      proactive={proactiveMode}
                      onProactiveQuestionsApply={handleProactiveQuestionsSubmit}
                      dispatchAction={dispatchAction}
                      onDealerBgApprove={(bgObject) => {
                        const dealerPhoto = (bgObject as any)._dealerPhotoDataUrl as string | undefined;
                        if (dealerPhoto) dispatchAction({ action: "set_dealer_bg_generating", value: true } as never);
                        dispatchAction({ action: "add_custom_background", background: bgObject });
                        setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, applied: true } as DealerBgProposalMsg : m));
                        window.dispatchEvent(new CustomEvent(AGENT_SCROLL_TO_SECTION_EVENT, { detail: { section: "backgrounds" } }));
                        setTimeout(() => window.dispatchEvent(new CustomEvent(AGENT_SCROLL_TO_SECTION_EVENT, { detail: { section: "preview" } })), 600);
                        setTimeout(() => fireNextStep("dealer_bg"), 300);
                        if (dealerPhoto) {
                          (async () => {
                            try {
                              const { generateDealerBackgroundsForTemplates } = await import("../../../lib/dealerBackgroundGenerator");
                              const selectedKeys = (bgObject as any)._templateKeys as string[] | undefined;
                              const cleanBase = (bgObject as any)._cleanBaseBg as string | undefined ?? dealerPhoto;
                              const cleanBgImages = await generateDealerBackgroundsForTemplates(cleanBase, selectedKeys ?? []);
                              const fallback = (bgObject as any).images["website-600x450"] ?? cleanBase;
                              (selectedKeys ?? Object.keys(cleanBgImages)).forEach(k => { if (!cleanBgImages[k]) cleanBgImages[k] = fallback; });
                              dispatchAction({ action: "add_custom_background", background: { ...(bgObject as any), images: { ...(bgObject as any).images, ...cleanBgImages } } });
                            } catch { /* fallback remains */ }
                            finally { dispatchAction({ action: "set_dealer_bg_generating", value: false } as never); }
                          })();
                        }
                      }}
                      onDealerBgSkip={() => {
                        setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, applied: true } as DealerBgProposalMsg : m));
                        setTimeout(() => setMessages(prev => [...prev, { id: `a-${Date.now()}`, role: "assistant", type: "text", content: "No problem! You can upload a different image, and I'll pick a background from the catalog." } as TextMessage]), 200);
                      }}
                    />
                  ))}

                  {/* Streaming text */}
                  {streaming && streamingText && !bgProcessing && <AssistantBubble text={streamingText} streaming />}

                  {/* Bg processing indicator */}
                  {bgProcessing && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <Box component="img" src={imgAgentAvatar} alt="AI" sx={{ width: 22, height: 22, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
                      <Box sx={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <ConstellationArcMark arcs={arcState} size={18} />
                        <Typography sx={{ fontSize: 12, color: "#686576", letterSpacing: "0.4px" }}>
                          {streaming && streamingText ? streamingText : "Generating the background image — in-painting the scene…"}
                        </Typography>
                      </Box>
                    </Box>
                  )}

                  {/* Contextual loading indicator */}
                  {((streaming && !streamingText) || simulatingStream) && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <Box component="img" src={imgAgentAvatar} alt="AI" sx={{ width: 22, height: 22, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
                      <Box sx={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <ConstellationArcMark arcs={arcState} size={18} />
                        <Typography sx={{ fontSize: 12, color: "#686576", letterSpacing: "0.4px" }}>
                          {simulatingStream ? "Setting up your project…" : loadingLabel}
                        </Typography>
                      </Box>
                    </Box>
                  )}

                  <div ref={bottomRef} />
                </Box>
              </Box>

              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", pb: "16px", flexShrink: 0, pt: "8px" }}>
                <AgentInput ref={agentInputRef} onSubmit={sendWithStaged} onFilesChange={files => { stagedFilesRef.current = files; }} onStop={stop} streaming={streaming} accountName={isAgency ? selectedAccount : "Honda of Anywhere"} />
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center", justifyContent: "center", width: "100%" }}>
                  {PROJECT_CATEGORIES.map(cat => (
                    <Tooltip key={cat} title={cat === "Create Automatic Project" ? "Create a full project. Agent will pick up all of our templates and take decisions for you." : ""} placement="top">
                      <span>
                        <CategoryChip label={cat} onClick={cat === "Create Automatic Project" ? () => send(CATEGORY_MESSAGES[cat] ?? cat, []) : () => agentInputRef.current?.populate(CATEGORY_MESSAGES[cat] ?? cat)} />
                      </span>
                    </Tooltip>
                  ))}
                </Box>
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
    </Box>
  );
}
