"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Chip from "@mui/material/Chip";
import CloseIcon from "@mui/icons-material/Close";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useProjectStore } from "../lib/project-store";

// ─── Types ────────────────────────────────────────────────────────────────────

type TemplateType = "single" | "multi" | "keyMessage";

interface VariableDef {
  /** Matches the exact identifier used inside {} in AdTemplate.tsx */
  key: string;
  /** Which template types render this variable */
  usedIn: TemplateType[];
  /** Short human description of the rendered output */
  hint: string;
  /** Ordered list of mapping options to show in the select */
  options: string[];
}

// ─── Offer field options ─────────────────────────────────────────────────────

interface FieldOption {
  value: string;
  label: string;
  group: "offer" | "special";
  example?: string;
}

const FIELD_OPTIONS: FieldOption[] = [
  // Offer fields — raw column names from the data model
  { value: "year",               label: "year",               group: "offer",   example: "2026" },
  { value: "make",               label: "make",               group: "offer",   example: "Honda" },
  { value: "model",              label: "model",              group: "offer",   example: "CR-V" },
  { value: "trim",               label: "trim",               group: "offer",   example: "TrailSport AWD" },
  { value: "offerType",          label: "offerType",          group: "offer",   example: "Lease" },
  { value: "monthlyPayment",     label: "monthlyPayment",     group: "offer",   example: "529" },
  { value: "term",               label: "term",               group: "offer",   example: "36" },
  { value: "totalDueAtSigning",  label: "totalDueAtSigning",  group: "offer",   example: "4999" },
  { value: "stock",              label: "stock",              group: "offer",   example: "16" },
  { value: "pvi",                label: "pvi",                group: "offer",   example: "92" },
  { value: "aging",              label: "aging",              group: "offer",   example: "27" },
  { value: "sales",              label: "sales",              group: "offer",   example: "10" },
  { value: "inventory",          label: "inventory",          group: "offer",   example: "16" },
  // Special tokens
  { value: "__fixed__",          label: "Fixed text (hardcoded)",        group: "special" },
  { value: "__project__",        label: "Dealer name (from project)",    group: "special" },
  { value: "__manual__",         label: "Manual input (Styles step)",    group: "special" },
  { value: "__auto__",           label: "Auto-generated from slots",     group: "special" },
];

// ─── Variable definitions ─────────────────────────────────────────────────────

const VARIABLES: VariableDef[] = [
  {
    key: "year",
    usedIn: ["single", "multi"],
    hint: "Model year — e.g. 2026",
    options: ["year", "make", "model", "trim", "offerType", "monthlyPayment", "term", "totalDueAtSigning", "stock", "pvi", "aging", "sales", "inventory"],
  },
  {
    key: "make",
    usedIn: ["single", "multi"],
    hint: "Manufacturer — e.g. Honda",
    options: ["make", "model", "trim", "year", "offerType", "monthlyPayment", "term", "totalDueAtSigning", "stock", "pvi", "aging", "sales", "inventory"],
  },
  {
    key: "model",
    usedIn: ["single", "multi"],
    hint: "Vehicle model — e.g. CR-V",
    options: ["model", "trim", "make", "year", "offerType", "monthlyPayment", "term", "totalDueAtSigning", "stock", "pvi", "aging", "sales", "inventory"],
  },
  {
    key: "trim",
    usedIn: ["single", "multi"],
    hint: "Trim level — e.g. TrailSport AWD",
    options: ["trim", "model", "make", "year", "offerType", "monthlyPayment", "term", "totalDueAtSigning", "stock", "pvi", "aging", "sales", "inventory"],
  },
  {
    key: "monthlyPayment",
    usedIn: ["single", "multi"],
    hint: 'Monthly payment rendered as "$529/mo."',
    options: ["monthlyPayment", "totalDueAtSigning", "term", "stock", "pvi", "aging", "sales", "inventory", "__fixed__"],
  },
  {
    key: "term",
    usedIn: ["single"],
    hint: 'Term rendered as "for 36 months."',
    options: ["term", "monthlyPayment", "totalDueAtSigning", "stock", "pvi", "aging", "sales", "inventory", "__fixed__"],
  },
  {
    key: "totalDueAtSigning",
    usedIn: ["single"],
    hint: 'Due at signing — rendered as "$4,999 due at signing"',
    options: ["totalDueAtSigning", "monthlyPayment", "term", "stock", "pvi", "aging", "sales", "inventory", "__fixed__"],
  },
  {
    key: "cta",
    usedIn: ["single", "multi", "keyMessage"],
    hint: 'CTA button label — currently "Learn More"',
    options: ["__fixed__", "offerType", "make", "model", "trim"],
  },
  {
    key: "dealerName",
    usedIn: ["single"],
    hint: "Dealer name — shown on 600×1067 tall banner only",
    options: ["__project__", "__fixed__", "make"],
  },
  {
    key: "keyMessage",
    usedIn: ["keyMessage"],
    hint: "Large headline — manually typed in the Styles step",
    options: ["__manual__", "__fixed__", "offerType", "make", "model"],
  },
  {
    key: "modelLine",
    usedIn: ["keyMessage"],
    hint: 'Auto-built from slot models — e.g. "CR-V, HR-V and Odyssey"',
    options: ["__auto__", "model", "make", "__fixed__"],
  },
];

// ─── Defaults (must match project-store.tsx) ──────────────────────────────────

const DEFAULTS: Record<string, string> = {
  year:              "year",
  make:              "make",
  model:             "model",
  trim:              "trim",
  monthlyPayment:    "monthlyPayment",
  term:              "term",
  totalDueAtSigning: "totalDueAtSigning",
  cta:               "__fixed__",
  dealerName:        "__project__",
  keyMessage:        "__manual__",
  modelLine:         "__auto__",
};

// ─── Type badge colors ────────────────────────────────────────────────────────

const TYPE_LABELS: Record<TemplateType, string> = {
  single:     "Single",
  multi:      "3-Up",
  keyMessage: "Key Msg",
};

const TYPE_CHIP_SX: Record<TemplateType, object> = {
  single:     { bgcolor: "rgba(71,59,171,0.08)", color: "var(--brand-accent, #473bab)" },
  multi:      { bgcolor: "#fffbeb", color: "#b45309" },
  keyMessage: { bgcolor: "#f0fdf4", color: "#15803d" },
};

// ─── Main component ───────────────────────────────────────────────────────────

export function VariableMappingPane({
  activeTypes,
  onClose,
}: {
  activeTypes: TemplateType[];
  onClose: () => void;
}) {
  const { variableMappings, setVariableMapping, resetVariableMappings } = useProjectStore();

  const visibleVars = VARIABLES.filter((v) =>
    v.usedIn.some((t) => activeTypes.includes(t))
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 2, py: 1.5, borderBottom: "1px solid #F3F4F6", flexShrink: 0 }}>
        <Box>
          <Typography sx={{ fontSize: "0.875rem", fontWeight: 600, color: "#111827" }}>Map Variables</Typography>
          <Typography sx={{ fontSize: "0.6875rem", color: "#9ca3af", mt: 0.25 }}>
            Connect template{" "}
            <Box component="code" sx={{ bgcolor: "#F3F4F6", px: 0.5, borderRadius: 0.5, fontSize: "0.625rem" }}>{"{variables}"}</Box>
            {" "}to offer fields
          </Typography>
        </Box>
        <IconButton
          size="small"
          onClick={onClose}
          sx={{ ml: 1, flexShrink: 0, color: "#9ca3af", "&:hover": { color: "#4b5563" } }}
        >
          <CloseIcon sx={{ fontSize: 15 }} />
        </IconButton>
      </Box>

      {/* Variable list */}
      <Box sx={{ flex: 1, overflow: "auto", px: 2, py: 1.5, display: "flex", flexDirection: "column", gap: 1.5 }}>
        {visibleVars.map((variable) => {
          const current = variableMappings[variable.key] ?? DEFAULTS[variable.key];
          const isDefault = current === DEFAULTS[variable.key];

          // Build ordered select options for this variable
          const offerOpts = variable.options
            .map((v) => FIELD_OPTIONS.find((o) => o.value === v))
            .filter((o): o is FieldOption => !!o && o.group === "offer");
          const specialOpts = variable.options
            .map((v) => FIELD_OPTIONS.find((o) => o.value === v))
            .filter((o): o is FieldOption => !!o && o.group === "special");

          return (
            <Box key={variable.key} sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
              {/* Label row: variable name + type badges + reset */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                <Typography sx={{ fontSize: "0.75rem", color: "#4b5563", flex: 1 }}>{variable.key}</Typography>
                {variable.usedIn
                  .filter((t) => activeTypes.includes(t))
                  .map((t) => (
                    <Chip
                      key={t}
                      label={TYPE_LABELS[t]}
                      size="small"
                      sx={{
                        fontSize: "0.625rem",
                        fontWeight: 500,
                        height: 18,
                        borderRadius: 0.5,
                        flexShrink: 0,
                        ...TYPE_CHIP_SX[t],
                        "& .MuiChip-label": { px: 0.75 },
                      }}
                    />
                  ))}
                {!isDefault && (
                  <IconButton
                    size="small"
                    onClick={() => setVariableMapping(variable.key, DEFAULTS[variable.key])}
                    title="Reset to default"
                    sx={{ p: 0, color: "#d1d5db", flexShrink: 0, "&:hover": { color: "#6b7280" } }}
                  >
                    <RefreshIcon sx={{ fontSize: 11 }} />
                  </IconButton>
                )}
              </Box>

              {/* Select */}
              <Select
                size="small"
                value={current}
                onChange={(e) => setVariableMapping(variable.key, e.target.value)}
                sx={{
                  width: "100%",
                  fontSize: "0.75rem",
                  "& .MuiSelect-select": { py: 0.75, px: 1 },
                  "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e5e7eb" },
                }}
              >
                {offerOpts.length > 0 && [
                  <MenuItem key="__group_offer__" disabled sx={{ fontSize: "0.625rem", color: "#9ca3af", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", py: 0.25 }}>
                    Offer Fields
                  </MenuItem>,
                  ...offerOpts.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value} sx={{ fontSize: "0.75rem" }}>
                      {opt.label}{opt.example ? `  —  e.g. "${opt.example}"` : ""}
                    </MenuItem>
                  )),
                ]}
                {specialOpts.length > 0 && [
                  <MenuItem key="__group_special__" disabled sx={{ fontSize: "0.625rem", color: "#9ca3af", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", py: 0.25 }}>
                    Special
                  </MenuItem>,
                  ...specialOpts.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value} sx={{ fontSize: "0.75rem" }}>
                      {opt.label}
                    </MenuItem>
                  )),
                ]}
              </Select>
            </Box>
          );
        })}
      </Box>

      {/* Footer */}
      <Box sx={{ px: 2, py: 1.5, borderTop: "1px solid #F3F4F6", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Button
          size="small"
          onClick={resetVariableMappings}
          startIcon={<RefreshIcon sx={{ fontSize: 11 }} />}
          sx={{ fontSize: "0.75rem", color: "#9ca3af", textTransform: "none", "&:hover": { color: "#4b5563" } }}
        >
          Reset all defaults
        </Button>
        <Typography sx={{ fontSize: "0.6875rem", color: "#d1d5db" }}>{visibleVars.length} variables</Typography>
      </Box>
    </Box>
  );
}
