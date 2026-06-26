"use client";

import { useState, useCallback } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import CheckIcon from "@mui/icons-material/Check";
import RefreshIcon from "@mui/icons-material/Refresh";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { AdTemplate } from "./AdTemplate";
import { TemplateWireframe } from "./TemplateWireframe";
import { zoneConfigs, isSingleProductTextLayout, isKeyMessageTextLayout, isPharmaZoneConfig } from "../lib/template-zone-configs";
import type { TemplateZoneConfig, ProductSlot, LogoPosition, TextElement, SingleProductTextLayout, MultiProductTextLayout, KeyMessageTextLayout } from "../lib/template-zone-configs";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Offer {
  year: string;
  make: string;
  model: string;
  trim: string;
  image: string;
  monthlyPayment: number;
  term: number;
  totalDueAtSigning: number;
}

interface Background {
  color: string;
  images?: Record<string, string>;
}

interface TemplateZoneEditorProps {
  templateId: string;
  templateName: string;
  previewOffer?: Offer;
  previewBackground?: Background;
  onClose: () => void;
}

type SaveState = "idle" | "saving" | "saved" | "error";

// ─── Number input field ───────────────────────────────────────────────────────

function NumField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.25 }}>
      <Typography sx={{ fontSize: "0.625rem", fontWeight: 500, color: "text.secondary", textTransform: "uppercase", letterSpacing: "0.05em" }}>
        {label}
      </Typography>
      <TextField
        type="number"
        size="small"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        inputProps={{ style: { fontSize: "0.75rem", padding: "6px 8px" } }}
        sx={{
          "& .MuiOutlinedInput-root": {
            bgcolor: "#fff",
            "& fieldset": { borderColor: "#e5e7eb" },
            "&:hover fieldset": { borderColor: "#d1d5db" },
          },
          "& input[type=number]": {
            MozAppearance: "textfield",
          },
          "& input[type=number]::-webkit-inner-spin-button, & input[type=number]::-webkit-outer-spin-button": {
            WebkitAppearance: "none",
          },
        }}
      />
    </Box>
  );
}

// ─── Section heading ──────────────────────────────────────────────────────────

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <Typography sx={{
      fontSize: "0.6875rem",
      fontWeight: 600,
      color: "#374151",
      textTransform: "uppercase",
      letterSpacing: "0.06em",
      mb: 1,
      mt: 2,
      "&:first-of-type": { mt: 0 },
    }}>
      {children}
    </Typography>
  );
}

// ─── Product slot editor ──────────────────────────────────────────────────────

function SlotEditor({
  index,
  slot,
  onChange,
}: {
  index: number;
  slot: ProductSlot;
  onChange: (s: ProductSlot) => void;
}) {
  function set(key: keyof ProductSlot, v: number) {
    onChange({ ...slot, [key]: v });
  }
  return (
    <Box sx={{ borderRadius: 1.5, border: "1px solid #F3F4F6", bgcolor: "#F9FAFB", p: 1.5, display: "flex", flexDirection: "column", gap: 1 }}>
      <Typography sx={{ fontSize: "0.6875rem", fontWeight: 600, color: "var(--brand-accent, #473bab)" }}>
        Product Slot {index + 1}
      </Typography>
      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 }}>
        <NumField label="Left (l)" value={slot.l} onChange={(v) => set("l", v)} />
        <NumField label="Top" value={slot.top} onChange={(v) => set("top", v)} />
        <NumField label="Width (w)" value={slot.w} onChange={(v) => set("w", v)} />
        <NumField label="Height (h)" value={slot.h} onChange={(v) => set("h", v)} />
      </Box>
    </Box>
  );
}

// ─── Logo editor ─────────────────────────────────────────────────────────────

function LogoEditor({
  label,
  logo,
  onChange,
}: {
  label: string;
  logo: LogoPosition;
  onChange: (l: LogoPosition) => void;
}) {
  function set(key: keyof LogoPosition, v: number) {
    onChange({ ...logo, [key]: v });
  }
  return (
    <Box sx={{ borderRadius: 1.5, border: "1px solid #F3F4F6", bgcolor: "#F9FAFB", p: 1.5, display: "flex", flexDirection: "column", gap: 1 }}>
      <Typography sx={{ fontSize: "0.6875rem", fontWeight: 600, color: "#7c3aed" }}>{label}</Typography>
      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1 }}>
        <NumField label="Left (l)" value={logo.l} onChange={(v) => set("l", v)} />
        <NumField label="Top" value={logo.top} onChange={(v) => set("top", v)} />
        <NumField label="Size" value={logo.size} onChange={(v) => set("size", v)} />
      </Box>
    </Box>
  );
}

// ─── Text element editor ──────────────────────────────────────────────────────

function TextElementEditor({
  fieldKey,
  label,
  el,
  onChange,
  showWH,
  active,
  onToggle,
}: {
  fieldKey: string;
  label: string;
  el: TextElement;
  onChange: (e: TextElement) => void;
  showWH?: boolean;
  active?: boolean;
  onToggle: (key: string, open: boolean) => void;
}) {
  const [open, setOpen] = useState(false);

  function toggle() {
    const next = !open;
    setOpen(next);
    onToggle(fieldKey, next);
  }

  function set(key: keyof TextElement, v: number) {
    onChange({ ...el, [key]: v });
  }

  return (
    <Box sx={{
      borderRadius: 1.5,
      border: "1px solid",
      borderColor: active ? "#fdba74" : "#F3F4F6",
      bgcolor: active ? "#fff7ed" : "#F9FAFB",
      transition: "border-color 0.15s, background-color 0.15s",
    }}>
      <Box
        component="button"
        onClick={toggle}
        sx={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 1.5,
          py: 1,
          fontSize: "0.6875rem",
          fontWeight: 600,
          color: active ? "#c2410c" : "#0f766e",
          background: "none",
          border: "none",
          cursor: "pointer",
          transition: "color 0.15s",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
          {active && <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "#f97316", flexShrink: 0 }} />}
          {label}
        </Box>
        <Typography sx={{ color: "#9ca3af", fontSize: "0.625rem" }}>{open ? "▲" : "▼"}</Typography>
      </Box>
      {open && (
        <Box sx={{ px: 1.5, pb: 1.5, display: "flex", flexDirection: "column", gap: 1 }}>
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1 }}>
            <NumField label="Left (l)" value={el.l} onChange={(v) => set("l", v)} />
            <NumField label="Top" value={el.top} onChange={(v) => set("top", v)} />
            <NumField label="Font size" value={el.fontSize} onChange={(v) => set("fontSize", v)} />
          </Box>
          {showWH && (
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 }}>
              <NumField label="Width (w)" value={el.w ?? 0} onChange={(v) => set("w", v)} />
              <NumField label="Height (h)" value={el.h ?? 0} onChange={(v) => set("h", v)} />
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}

// ─── Single-product text layout editor ───────────────────────────────────────

function SingleTextLayoutEditor({
  tl,
  onChange,
  activeField,
  onFieldToggle,
}: {
  tl: SingleProductTextLayout;
  onChange: (tl: SingleProductTextLayout) => void;
  activeField: string | null;
  onFieldToggle: (key: string, open: boolean) => void;
}) {
  function setEl(field: keyof SingleProductTextLayout, el: TextElement) {
    onChange({ ...tl, [field]: el });
  }
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      {tl.dealerName && (
        <TextElementEditor fieldKey="dealerName" label="Dealer Name" el={tl.dealerName}
          onChange={(el) => setEl("dealerName", el)}
          active={activeField === "dealerName"} onToggle={onFieldToggle} />
      )}
      <TextElementEditor fieldKey="title" label="Title" el={tl.title!}
        onChange={(el) => setEl("title", el)}
        active={activeField === "title"} onToggle={onFieldToggle} />
      <TextElementEditor fieldKey="leaseLabel" label="Lease Label" el={tl.leaseLabel!}
        onChange={(el) => setEl("leaseLabel", el)}
        active={activeField === "leaseLabel"} onToggle={onFieldToggle} />
      <TextElementEditor fieldKey="price" label="Price" el={tl.price!}
        onChange={(el) => setEl("price", el)}
        active={activeField === "price"} onToggle={onFieldToggle} />
      <TextElementEditor fieldKey="termLabel" label="Term Label" el={tl.termLabel!}
        onChange={(el) => setEl("termLabel", el)}
        active={activeField === "termLabel"} onToggle={onFieldToggle} />
      <TextElementEditor fieldKey="dueLabel" label="Due Label" el={tl.dueLabel!}
        onChange={(el) => setEl("dueLabel", el)}
        active={activeField === "dueLabel"} onToggle={onFieldToggle} />
      <TextElementEditor fieldKey="cta" label="CTA Button" el={tl.cta!}
        onChange={(el) => setEl("cta", el)} showWH
        active={activeField === "cta"} onToggle={onFieldToggle} />
      <TextElementEditor fieldKey="disclaimer" label="Disclaimer" el={tl.disclaimer!}
        onChange={(el) => setEl("disclaimer", el)} showWH
        active={activeField === "disclaimer"} onToggle={onFieldToggle} />
    </Box>
  );
}

// ─── Multi-product text layout editor ────────────────────────────────────────

function MultiNumEditor({
  fieldKey,
  label,
  children,
  active,
  onToggle,
}: {
  fieldKey: string;
  label: string;
  children: React.ReactNode;
  active?: boolean;
  onToggle: (key: string, open: boolean) => void;
}) {
  const [open, setOpen] = useState(false);
  function toggle() {
    const next = !open;
    setOpen(next);
    onToggle(fieldKey, next);
  }
  return (
    <Box sx={{
      borderRadius: 1.5,
      border: "1px solid",
      borderColor: active ? "#fdba74" : "#F3F4F6",
      bgcolor: active ? "#fff7ed" : "#F9FAFB",
      transition: "border-color 0.15s, background-color 0.15s",
    }}>
      <Box
        component="button"
        onClick={toggle}
        sx={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 1.5,
          py: 1,
          fontSize: "0.6875rem",
          fontWeight: 600,
          color: active ? "#c2410c" : "#0f766e",
          background: "none",
          border: "none",
          cursor: "pointer",
          transition: "color 0.15s",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
          {active && <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "#f97316", flexShrink: 0 }} />}
          {label}
        </Box>
        <Typography sx={{ color: "#9ca3af", fontSize: "0.625rem" }}>{open ? "▲" : "▼"}</Typography>
      </Box>
      {open && <Box sx={{ px: 1.5, pb: 1.5, display: "flex", flexDirection: "column", gap: 1 }}>{children}</Box>}
    </Box>
  );
}

function MultiTextLayoutEditor({
  tl,
  onChange,
  activeField,
  onFieldToggle,
}: {
  tl: MultiProductTextLayout;
  onChange: (tl: MultiProductTextLayout) => void;
  activeField: string | null;
  onFieldToggle: (key: string, open: boolean) => void;
}) {
  function set(key: keyof MultiProductTextLayout, v: number) {
    onChange({ ...tl, [key]: v });
  }
  function setDisclaimer(el: TextElement) {
    onChange({ ...tl, disclaimer: el });
  }
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <MultiNumEditor fieldKey="title" label="Title" active={activeField === "title"} onToggle={onFieldToggle}>
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1 }}>
          <NumField label="Left" value={tl.titleLeft} onChange={(v) => set("titleLeft", v)} />
          <NumField label="Top" value={tl.titleTop} onChange={(v) => set("titleTop", v)} />
          <NumField label="Font size" value={tl.titleFontSize} onChange={(v) => set("titleFontSize", v)} />
        </Box>
      </MultiNumEditor>

      <MultiNumEditor fieldKey="trim" label="Trim" active={activeField === "trim"} onToggle={onFieldToggle}>
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1 }}>
          <NumField label="Left" value={tl.trimLeft} onChange={(v) => set("trimLeft", v)} />
          <NumField label="Top" value={tl.trimTop} onChange={(v) => set("trimTop", v)} />
          <NumField label="Font size" value={tl.trimFontSize} onChange={(v) => set("trimFontSize", v)} />
        </Box>
      </MultiNumEditor>

      <MultiNumEditor fieldKey="price" label="Price" active={activeField === "price"} onToggle={onFieldToggle}>
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1 }}>
          <NumField label="Left" value={tl.priceLeft} onChange={(v) => set("priceLeft", v)} />
          <NumField label="Top" value={tl.priceTop} onChange={(v) => set("priceTop", v)} />
          <NumField label="Font size" value={tl.priceFontSize} onChange={(v) => set("priceFontSize", v)} />
        </Box>
      </MultiNumEditor>

      <MultiNumEditor fieldKey="cta" label="CTA Button" active={activeField === "cta"} onToggle={onFieldToggle}>
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1 }}>
          <NumField label="Left" value={tl.ctaLeft} onChange={(v) => set("ctaLeft", v)} />
          <NumField label="Top" value={tl.ctaTop} onChange={(v) => set("ctaTop", v)} />
          <NumField label="Height" value={tl.ctaH} onChange={(v) => set("ctaH", v)} />
          <NumField label="Font size" value={tl.ctaFontSize} onChange={(v) => set("ctaFontSize", v)} />
          <NumField label="Padding" value={tl.ctaPadding} onChange={(v) => set("ctaPadding", v)} />
        </Box>
      </MultiNumEditor>

      <MultiNumEditor fieldKey="disclaimer" label="Disclaimer" active={activeField === "disclaimer"} onToggle={onFieldToggle}>
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1 }}>
          <NumField label="Left (l)" value={tl.disclaimer.l} onChange={(v) => setDisclaimer({ ...tl.disclaimer, l: v })} />
          <NumField label="Top" value={tl.disclaimer.top} onChange={(v) => setDisclaimer({ ...tl.disclaimer, top: v })} />
          <NumField label="Font size" value={tl.disclaimer.fontSize} onChange={(v) => setDisclaimer({ ...tl.disclaimer, fontSize: v })} />
        </Box>
      </MultiNumEditor>
    </Box>
  );
}

// ─── Key-message text layout editor ──────────────────────────────────────────

function KeyMessageTextLayoutEditor({
  tl,
  onChange,
  activeField,
  onFieldToggle,
}: {
  tl: KeyMessageTextLayout;
  onChange: (tl: KeyMessageTextLayout) => void;
  activeField: string | null;
  onFieldToggle: (key: string, open: boolean) => void;
}) {
  function setEl(field: keyof KeyMessageTextLayout, el: TextElement) {
    onChange({ ...tl, [field]: el });
  }
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <TextElementEditor fieldKey="keyMessage" label="Key Message  ✏️ manual" el={tl.keyMessage}
        onChange={(el) => setEl("keyMessage", el)} showWH
        active={activeField === "keyMessage"} onToggle={onFieldToggle} />
      <TextElementEditor fieldKey="year" label="Year  ✏️ manual" el={tl.year}
        onChange={(el) => setEl("year", el)}
        active={activeField === "year"} onToggle={onFieldToggle} />
      <TextElementEditor fieldKey="modelLine" label="Model Line  (auto)" el={tl.modelLine}
        onChange={(el) => setEl("modelLine", el)}
        active={activeField === "modelLine"} onToggle={onFieldToggle} />
      <TextElementEditor fieldKey="cta" label="CTA Button" el={tl.cta!}
        onChange={(el) => setEl("cta", el)} showWH
        active={activeField === "cta"} onToggle={onFieldToggle} />
      <TextElementEditor fieldKey="disclaimer" label="Disclaimer" el={tl.disclaimer!}
        onChange={(el) => setEl("disclaimer", el)} showWH
        active={activeField === "disclaimer"} onToggle={onFieldToggle} />
    </Box>
  );
}

// ─── Main editor ──────────────────────────────────────────────────────────────

export function TemplateZoneEditor({
  templateId,
  templateName,
  previewOffer,
  previewBackground,
  onClose,
}: TemplateZoneEditorProps) {
  const original = zoneConfigs[templateId];
  // Pharma templates use a different renderer — zone editor not supported
  if (original && isPharmaZoneConfig(original)) return null;
  const [local, setLocal] = useState<TemplateZoneConfig>(
    original ? structuredClone(original as TemplateZoneConfig) : {
      canvasW: 0, canvasH: 0,
      bgZone: { l: 0, top: 0, w: 0, h: 0 },
      productSlots: [],
      logoP: { l: 0, top: 0, size: 0 },
      logoE: { l: 0, top: 0, size: 0 },
      textLayout: {
        title: { l: 0, top: 0, fontSize: 16 },
        leaseLabel: { l: 0, top: 0, fontSize: 12 },
        price: { l: 0, top: 0, fontSize: 32 },
        termLabel: { l: 0, top: 0, fontSize: 12 },
        dueLabel: { l: 0, top: 0, fontSize: 12 },
        cta: { l: 0, top: 0, fontSize: 14, w: 99, h: 40 },
        disclaimer: { l: 0, top: 0, fontSize: 10 },
      },
    }
  );
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [activeTextField, setActiveTextField] = useState<string | null>(null);

  // ── Updaters ──────────────────────────────────────────────────────────────

  const setSlot = useCallback((index: number, slot: ProductSlot) => {
    setLocal((prev) => {
      const slots = [...prev.productSlots];
      slots[index] = slot;
      return { ...prev, productSlots: slots };
    });
  }, []);

  const setLogoP = useCallback((logo: LogoPosition) => {
    setLocal((prev) => ({ ...prev, logoP: logo }));
  }, []);

  const setLogoE = useCallback((logo: LogoPosition) => {
    setLocal((prev) => ({ ...prev, logoE: logo }));
  }, []);

  const handleFieldToggle = useCallback((key: string, open: boolean) => {
    setActiveTextField(open ? key : null);
  }, []);

  function handleReset() {
    if (original) setLocal(structuredClone(original as TemplateZoneConfig));
    setActiveTextField(null);
  }

  // ── Save to JSON via API ──────────────────────────────────────────────────

  async function handleSave() {
    setSaveState("saving");
    try {
      const res = await fetch("/api/template-zone-configs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId, config: local }),
      });
      if (!res.ok) throw new Error("Server error");
      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 2500);
    } catch {
      setSaveState("error");
      setTimeout(() => setSaveState("idle"), 3000);
    }
  }

  // ── Preview scale ─────────────────────────────────────────────────────────

  const MAX_PREVIEW_W = 580;
  const MAX_PREVIEW_H = 440;
  const previewScale = Math.min(
    MAX_PREVIEW_W / local.canvasW,
    MAX_PREVIEW_H / local.canvasH,
    1
  );

  const dummyBg: Background = { color: "#e2e8f0" };

  return (
    <Box sx={{ position: "fixed", inset: 0, zIndex: 50, display: "flex" }}>
      {/* Backdrop */}
      <Box sx={{ position: "absolute", inset: 0, bgcolor: "rgba(0,0,0,0.4)" }} onClick={onClose} />

      {/* Panel */}
      <Box sx={{ position: "relative", ml: "auto", display: "flex", height: "100%", width: "100%", maxWidth: "64rem", bgcolor: "#fff", boxShadow: 24 }}>

        {/* ── Left: controls ── */}
        <Box sx={{ display: "flex", width: 288, flexShrink: 0, flexDirection: "column", borderRight: "1px solid #F3F4F6" }}>
          {/* Header */}
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #F3F4F6", px: 2, py: 1.5 }}>
            <Box>
              <Typography sx={{ fontSize: "0.875rem", fontWeight: 600, color: "#111827" }}>Zone Editor</Typography>
              <Typography sx={{ fontSize: "0.6875rem", color: "#9ca3af", mt: 0.25, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 190 }}>
                {templateName}
              </Typography>
            </Box>
            <IconButton size="small" onClick={onClose} sx={{ color: "#9ca3af", "&:hover": { color: "#4b5563" } }}>
              <CloseIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Box>

          {/* Fields */}
          <Box sx={{ flex: 1, overflow: "auto", px: 2, py: 2, display: "flex", flexDirection: "column", gap: 1.5 }}>
            <SectionHeading>Product Slots</SectionHeading>
            {local.productSlots.map((slot, i) => (
              <SlotEditor key={i} index={i} slot={slot} onChange={(s) => setSlot(i, s)} />
            ))}

            <SectionHeading>Logos</SectionHeading>
            <LogoEditor label="Primary Logo" logo={local.logoP} onChange={setLogoP} />
            <LogoEditor label="Event Logo" logo={local.logoE} onChange={setLogoE} />

            <SectionHeading>Text Layout</SectionHeading>
            {isSingleProductTextLayout(local.textLayout) ? (
              <SingleTextLayoutEditor
                tl={local.textLayout}
                onChange={(tl) => setLocal((prev) => ({ ...prev, textLayout: tl }))}
                activeField={activeTextField}
                onFieldToggle={handleFieldToggle}
              />
            ) : isKeyMessageTextLayout(local.textLayout) ? (
              <KeyMessageTextLayoutEditor
                tl={local.textLayout}
                onChange={(tl) => setLocal((prev) => ({ ...prev, textLayout: tl }))}
                activeField={activeTextField}
                onFieldToggle={handleFieldToggle}
              />
            ) : (
              <MultiTextLayoutEditor
                tl={local.textLayout as MultiProductTextLayout}
                onChange={(tl) => setLocal((prev) => ({ ...prev, textLayout: tl }))}
                activeField={activeTextField}
                onFieldToggle={handleFieldToggle}
              />
            )}
          </Box>

          {/* Footer */}
          <Box sx={{ borderTop: "1px solid #F3F4F6", px: 2, py: 1.5, display: "flex", alignItems: "center", gap: 1 }}>
            <Button
              size="small"
              onClick={handleReset}
              startIcon={<RefreshIcon sx={{ fontSize: 12 }} />}
              sx={{ fontSize: "0.75rem", color: "#6b7280", textTransform: "none", "&:hover": { color: "#374151" } }}
            >
              Reset
            </Button>
            <Button
              size="small"
              onClick={handleSave}
              disabled={saveState === "saving"}
              startIcon={
                saveState === "saving" ? (
                  <Box sx={{ width: 12, height: 12, border: "2px solid #fff", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.75s linear infinite", "@keyframes spin": { to: { transform: "rotate(360deg)" } } }} />
                ) : saveState === "saved" ? (
                  <CheckIcon sx={{ fontSize: 12 }} />
                ) : saveState === "error" ? (
                  <ErrorOutlineIcon sx={{ fontSize: 12 }} />
                ) : (
                  <SaveIcon sx={{ fontSize: 12 }} />
                )
              }
              sx={{
                ml: "auto",
                display: "flex",
                alignItems: "center",
                gap: 0.75,
                borderRadius: 1.5,
                bgcolor: "var(--brand-accent, #473bab)",
                px: 2,
                py: 0.75,
                fontSize: "0.75rem",
                fontWeight: 600,
                color: "#fff",
                textTransform: "none",
                "&:hover": { bgcolor: "var(--brand-accent-hover, #392e8a)" },
                "&.Mui-disabled": { opacity: 0.6, color: "#fff" },
              }}
            >
              {saveState === "saving" ? "Saving…" : saveState === "saved" ? "Saved!" : saveState === "error" ? "Error" : "Save"}
            </Button>
          </Box>
        </Box>

        {/* ── Right: live preview ── */}
        <Box sx={{ display: "flex", flex: 1, flexDirection: "column" }}>
          {/* Preview header */}
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #F3F4F6", px: 2.5, py: 1.5 }}>
            <Typography sx={{ fontSize: "0.75rem", fontWeight: 500, color: "#6b7280" }}>
              Live Preview · {local.canvasW}×{local.canvasH}
            </Typography>
            <Typography sx={{ fontSize: "0.6875rem", color: activeTextField ? "#ea580c" : "#9ca3af", fontWeight: activeTextField ? 500 : 400 }}>
              {activeTextField
                ? `Editing: ${activeTextField}`
                : "Expand a text field to highlight it in the preview"
              }
            </Typography>
          </Box>

          {/* Preview area */}
          <Box sx={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "center", overflow: "auto", bgcolor: "#F9FAFB", p: 4 }}>
            <TemplateWireframe
              templateId={templateId}
              scale={previewScale}
              zoneConfig={local}
              showText
              activeField={activeTextField ?? undefined}
            />
          </Box>

          {/* Hint */}
          <Box sx={{ borderTop: "1px solid #F3F4F6", px: 2.5, py: 1 }}>
            <Typography sx={{ fontSize: "0.6875rem", color: "#9ca3af" }}>
              Orange zones = text variables · Blue = CTA button · Expand a field on the left to highlight it here.
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
