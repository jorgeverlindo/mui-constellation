"use client";

import { useState, useRef, useEffect } from "react";
import {
  Box,
  Collapse,
  InputBase,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CheckIcon from "@mui/icons-material/Check";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import { PROJECT_OWNERS, PLATFORM_OPTIONS } from "../CreateProjectDialog";

function AvatarInitials({ initials, size, bgColor }: { initials: string; size: number; bgColor?: string }) {
  return (
    <Avatar sx={{ width: size, height: size, fontSize: size * 0.45, bgcolor: bgColor ?? 'primary.main', fontWeight: 600 }}>
      {initials}
    </Avatar>
  );
}

function ChannelChip({ label, icon, onRemove }: { label: string; icon?: string; onRemove?: () => void }) {
  return (
    <Chip
      size="small"
      label={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {icon && <Box component="img" src={icon} alt="" sx={{ width: 12, height: 12, objectFit: 'contain' }} />}
          {label}
        </Box>
      }
      onDelete={onRemove}
      deleteIcon={<CloseIcon sx={{ fontSize: '12px !important' }} />}
      sx={{ height: 22, fontSize: '0.7rem', '& .MuiChip-label': { px: 0.75 } }}
    />
  );
}
import { AgentSelect, ConfirmedChip } from "./AgentSelects";
import { ProactiveAutoApplyBar } from "./ProactiveWidgets";
import { deduplicateName } from "./utils";

// ─── Shared constants (mirrors ProjectsModule) ────────────────────────────────
const AVAILABLE_ACCOUNTS = ["Honda of Anywhere", "BMW Seattle", "Spiriva Pharma", "Multiple Brands Inc.", "Honda City"];
const AVAILABLE_BRANDS   = ["Honda", "BMW", "Spiriva", "Volkswagen", "Audi", "General"];

interface SetupInput {
  project_name: string;
  account?: string;
  oem: string;
  start_date: string;
  end_date: string;
  flow_scope?: "full" | "offers_only" | "templates_only" | "offers_and_templates" | "templates_and_email" | "offers_and_email";
  flow_steps?: string[];
  owner?: string;
  platforms?: string[];
}

export interface SetupProjectCardProps {
  input: SetupInput;
  existingNames?: string[];
  onApply: (name: string, account: string, oem: string, startDate: string, endDate: string, owner: string, platforms: string[]) => void;
  onDismiss: () => void;
  proactive?: boolean;
}

export function SetupProjectCard({ input, existingNames = [], onApply, onDismiss, proactive }: SetupProjectCardProps) {
  const dedupedName = deduplicateName(input.project_name, existingNames);
  const [name,      setName]      = useState(dedupedName);
  const [account,   setAccount]   = useState(input.account ?? "");
  const [oem,       setOem]       = useState(input.oem);
  const [startDate, setStartDate] = useState(input.start_date);
  const [endDate,   setEndDate]   = useState(input.end_date);
  const [ownerId,   setOwnerId]   = useState(input.owner ? (PROJECT_OWNERS.find(o => o.name === input.owner)?.id ?? "jorge-verlindo") : "jorge-verlindo");

  const normalizePlatformIds = (raw: string[]): string[] =>
    raw.flatMap(val => {
      if (PLATFORM_OPTIONS.some(p => p.id === val)) return [val];
      const lower = val.toLowerCase().replace(/[-\s]/g, "");
      const match = PLATFORM_OPTIONS.find(p =>
        p.id.replace(/-/g, "") === lower ||
        p.label.toLowerCase().replace(/[-\s]/g, "") === lower
      );
      return match ? [match.id] : [];
    });

  const [platforms, setPlatforms] = useState<string[]>(normalizePlatformIds(input.platforms ?? []));
  const [applied,         setApplied]         = useState(false);
  const [nameError,       setNameError]       = useState("");
  const [startDateError,  setStartDateError]  = useState("");
  const [endDateError,    setEndDateError]    = useState("");
  const wasDeduplicated = dedupedName !== input.project_name;
  const [manualMode, setManualMode] = useState(false);
  const autoApplyRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Owner dropdown open state
  const [ownerOpen, setOwnerOpen]       = useState(false);
  const [platformsOpen, setPlatformsOpen] = useState(false);

  // Proactive auto-apply
  useEffect(() => {
    if (!proactive || manualMode || applied) return;
    const owner = PROJECT_OWNERS.find(o => o.id === ownerId);
    autoApplyRef.current = setTimeout(() => {
      setApplied(true);
      onApply(name, account, oem, startDate, endDate, owner?.name ?? "", platforms);
    }, 5000);
    return () => { if (autoApplyRef.current) clearTimeout(autoApplyRef.current); };
  }, [proactive, manualMode, applied]); // eslint-disable-line react-hooks/exhaustive-deps

  if (applied) {
    return (
      <Box sx={{ ml: "32px", mt: "4px" }}>
        <ConfirmedChip label={`Project "${name}" created`} />
      </Box>
    );
  }

  const inputSx = {
    width: "100%",
    px: "10px",
    py: "7px",
    borderRadius: "8px",
    fontSize: 12,
    color: "var(--ink)",
    border: "1px solid rgba(0,0,0,0.12)",
    background: "#fafafb",
    outline: "none",
    transition: "all 0.15s",
    "&:focus": {
      borderColor: "var(--brand-accent)",
      boxShadow: "0 0 0 1px rgba(71,59,171,0.15)",
    },
  };

  const labelSx = {
    fontSize: 10,
    fontWeight: 600,
    textTransform: "uppercase" as const,
    letterSpacing: "0.06em",
    color: "var(--ink-tertiary)",
    mb: "4px",
    display: "block",
  };

  const selectedOwner = PROJECT_OWNERS.find(o => o.id === ownerId);
  const togglePlatform = (p: string) =>
    setPlatforms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);

  return (
    <Box
      sx={{
        ml: "32px",
        mt: "4px",
        borderRadius: "14px",
        border: "1px solid rgba(0,0,0,0.1)",
        background: "white",
        overflow: "hidden",
        boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
        opacity: 0,
        animation: "fadeInUp 0.2s ease forwards",
        "@keyframes fadeInUp": {
          from: { opacity: 0, transform: "translateY(6px)" },
          to:   { opacity: 1, transform: "translateY(0)" },
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: "14px",
          pt: "10px",
          pb: "8px",
          borderBottom: "1px solid rgba(0,0,0,0.06)",
          background: "#fafafa",
          display: "flex",
          alignItems: "center",
          gap: "6px",
        }}
      >
        <Box
          sx={{
            width: 18,
            height: 18,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            background: "linear-gradient(135deg, var(--brand-accent), var(--brand-mid))",
          }}
        >
          <AddIcon sx={{ fontSize: 9, color: "white" }} />
        </Box>
        <Typography sx={{ fontSize: 11.5, fontWeight: 600, color: "var(--brand-accent)", letterSpacing: "0.3px" }}>
          New project setup
        </Typography>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: "10px", px: "14px", py: "12px" }}>
        {/* Name */}
        <Box>
          <Typography component="span" sx={labelSx}>Project name</Typography>
          <Box
            component="input"
            type="text"
            value={name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setName(e.target.value); setNameError(""); }}
            onFocus={(e: React.FocusEvent<HTMLInputElement>) => e.target.select()}
            placeholder="e.g. Honda Summer Lease Event"
            sx={inputSx}
          />
          {nameError ? (
            <Typography sx={{ mt: "4px", fontSize: 10, color: "var(--danger)" }}>{nameError}</Typography>
          ) : (
            <Typography sx={{ mt: "4px", fontSize: 10, color: "var(--ink-tertiary)", fontStyle: "italic" }}>
              {wasDeduplicated
                ? `"${input.project_name}" already exists — adjusted to avoid a collision. Edit to customise.`
                : "Suggested name — edit to customise."}
            </Typography>
          )}
        </Box>

        {/* Account + Brand row */}
        <Box sx={{ display: "flex", gap: "8px" }}>
          <Box sx={{ flex: 1 }}>
            <Typography component="span" sx={labelSx}>Account</Typography>
            <AgentSelect
              value={account} onChange={setAccount}
              placeholder="Select account"
              options={AVAILABLE_ACCOUNTS.map(a => ({ value: a, label: a }))}
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography component="span" sx={labelSx}>Brand</Typography>
            <AgentSelect
              value={oem} onChange={setOem}
              options={AVAILABLE_BRANDS.map(b => ({ value: b, label: b }))}
            />
          </Box>
        </Box>

        {/* Owner */}
        <Box>
          <Typography component="span" sx={labelSx}>Owner</Typography>
          <Box sx={{ position: "relative" }}>
            <Box
              component="button"
              onClick={() => setOwnerOpen(v => !v)}
              sx={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                px: "10px",
                py: "7px",
                borderRadius: "8px",
                fontSize: 12,
                border: "1px solid rgba(0,0,0,0.12)",
                background: "#fafafb",
                cursor: "pointer",
                textAlign: "left",
                transition: "all 0.15s",
                "&:hover": { borderColor: "#b0b0b5" },
              }}
            >
              {selectedOwner ? (
                <>
                  <AvatarInitials initials={selectedOwner.initials} size={18} bgColor={selectedOwner.color} />
                  <Box component="span" sx={{ flex: 1, color: "var(--ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {selectedOwner.name}
                  </Box>
                </>
              ) : (
                <Box component="span" sx={{ flex: 1, color: "var(--ink-tertiary)" }}>Select owner</Box>
              )}
              <ExpandMoreIcon sx={{ fontSize: 14, flexShrink: 0, color: "var(--ink-tertiary)" }} />
            </Box>
            <Collapse in={ownerOpen}>
              <Box
                sx={{
                  position: "absolute",
                  zIndex: 500,
                  left: 0,
                  right: 0,
                  mt: "4px",
                  borderRadius: "12px",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.14)",
                  border: "1px solid rgba(0,0,0,0.1)",
                  background: "white",
                  p: "4px",
                  maxHeight: 240,
                  overflowY: "auto",
                }}
              >
                {PROJECT_OWNERS.map(owner => (
                  <Box
                    key={owner.id}
                    component="button"
                    onClick={() => { setOwnerId(owner.id); setOwnerOpen(false); }}
                    sx={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      px: "10px",
                      py: "6px",
                      borderRadius: "8px",
                      fontSize: 12,
                      color: "var(--ink)",
                      cursor: "pointer",
                      background: "transparent",
                      border: "none",
                      textAlign: "left",
                      "&:hover": { background: "#f5f4f8" },
                    }}
                  >
                    <AvatarInitials initials={owner.initials} size={20} bgColor={owner.color} />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontSize: 12 }}>{owner.name}</Typography>
                      <Typography sx={{ fontSize: 10, color: "var(--ink-tertiary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {owner.email}
                      </Typography>
                    </Box>
                    {owner.id === ownerId && (
                      <CheckIcon sx={{ fontSize: 11, color: "var(--brand-accent)", flexShrink: 0 }} />
                    )}
                  </Box>
                ))}
              </Box>
            </Collapse>
          </Box>
        </Box>

        {/* Dates row */}
        <Box sx={{ display: "flex", gap: "8px" }}>
          <Box sx={{ flex: 1 }}>
            <Typography component="span" sx={labelSx}>Start date</Typography>
            <Box
              component="input"
              type="text"
              value={startDate}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setStartDate(e.target.value); setStartDateError(""); }}
              placeholder="Jun 1, 2026"
              sx={{ ...inputSx, ...(startDateError ? { borderColor: "var(--danger)" } : {}) }}
            />
            {startDateError && (
              <Typography sx={{ mt: "4px", fontSize: 10, color: "var(--danger)" }}>{startDateError}</Typography>
            )}
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography component="span" sx={labelSx}>End date</Typography>
            <Box
              component="input"
              type="text"
              value={endDate}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setEndDate(e.target.value); setEndDateError(""); }}
              placeholder="Jun 30, 2026"
              sx={{ ...inputSx, ...(endDateError ? { borderColor: "var(--danger)" } : {}) }}
            />
            {endDateError && (
              <Typography sx={{ mt: "4px", fontSize: 10, color: "var(--danger)" }}>{endDateError}</Typography>
            )}
          </Box>
        </Box>

        {/* Platforms */}
        <Box>
          <Typography component="span" sx={labelSx}>Platforms</Typography>
          <Box sx={{ position: "relative" }}>
            <Box
              component="button"
              onClick={() => setPlatformsOpen(v => !v)}
              sx={{
                width: "100%",
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: "4px",
                minHeight: 34,
                px: "8px",
                py: "5px",
                borderRadius: "8px",
                fontSize: 12,
                border: "1px solid rgba(0,0,0,0.12)",
                background: "#fafafb",
                cursor: "pointer",
                textAlign: "left",
                transition: "all 0.15s",
                "&:hover": { borderColor: "#b0b0b5" },
              }}
            >
              {platforms.length === 0 ? (
                <Box component="span" sx={{ flex: 1, color: "var(--ink-tertiary)" }}>Select platforms</Box>
              ) : (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: "3px", flex: 1, minWidth: 0 }}>
                  {platforms.map(id => {
                    const p = PLATFORM_OPTIONS.find(o => o.id === id);
                    if (!p) return null;
                    return (
                      <ChannelChip
                        key={id}
                        label={p.label}
                        icon={p.icon}
                        onRemove={() => togglePlatform(id)}
                      />
                    );
                  })}
                </Box>
              )}
              <ExpandMoreIcon sx={{ fontSize: 14, flexShrink: 0, color: "var(--ink-tertiary)", ml: "auto", alignSelf: "center" }} />
            </Box>
            <Collapse in={platformsOpen}>
              <Box
                sx={{
                  position: "absolute",
                  zIndex: 500,
                  left: 0,
                  right: 0,
                  mt: "4px",
                  borderRadius: "12px",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.14)",
                  border: "1px solid rgba(0,0,0,0.1)",
                  background: "white",
                  p: "4px",
                }}
              >
                {PLATFORM_OPTIONS.map(p => {
                  const active = platforms.includes(p.id);
                  return (
                    <Box
                      key={p.id}
                      component="button"
                      onClick={() => togglePlatform(p.id)}
                      sx={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        px: "10px",
                        py: "6px",
                        borderRadius: "8px",
                        fontSize: 12,
                        color: "var(--ink)",
                        cursor: "pointer",
                        background: "transparent",
                        border: "none",
                        textAlign: "left",
                        "&:hover": { background: "#f5f4f8" },
                      }}
                    >
                      <Box
                        component="span"
                        sx={{
                          width: 14,
                          height: 14,
                          borderRadius: "3px",
                          border: "1px solid",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          transition: "all 0.15s",
                          background: active ? "var(--brand-accent)" : "white",
                          borderColor: active ? "var(--brand-accent)" : "rgba(0,0,0,0.2)",
                        }}
                      >
                        {active && <CheckIcon sx={{ fontSize: 9, color: "white" }} />}
                      </Box>
                      <Box component="img" src={p.icon} alt="" sx={{ width: 12, height: 12, flexShrink: 0, objectFit: "contain" }} />
                      <span>{p.label}</span>
                    </Box>
                  );
                })}
              </Box>
            </Collapse>
          </Box>
        </Box>

        {/* CTAs */}
        <Box sx={{ display: "flex", alignItems: "center", gap: "8px", pt: "2px" }}>
          <Box
            component="button"
            onClick={() => {
              const norm = (s: string) => s.trim().toLowerCase();
              let hasError = false;
              if ((existingNames ?? []).some(n => norm(n) === norm(name))) {
                setNameError("Already exists — choose a different name");
                hasError = true;
              } else {
                setNameError("");
              }
              if (!startDate.trim()) {
                setStartDateError("Start date is required");
                hasError = true;
              } else {
                setStartDateError("");
              }
              if (!endDate.trim()) {
                setEndDateError("End date is required");
                hasError = true;
              } else {
                setEndDateError("");
              }
              if (hasError) return;
              const ownerName = PROJECT_OWNERS.find(o => o.id === ownerId)?.name ?? "Jorge Verlindo";
              onApply(name, account, oem, startDate, endDate, ownerName, platforms);
              setApplied(true);
            }}
            disabled={!name.trim()}
            sx={{
              flex: 1,
              py: "8px",
              borderRadius: "999px",
              fontSize: 13,
              fontWeight: 500,
              letterSpacing: "0.46px",
              color: "white",
              border: "none",
              cursor: "pointer",
              background: "linear-gradient(99deg, var(--brand-accent) 0%, var(--brand-mid) 100%)",
              transition: "opacity 0.15s",
              "&:disabled": { opacity: 0.4 },
            }}
          >
            Create project
          </Box>
          <Box
            component="button"
            onClick={onDismiss}
            sx={{
              px: "14px",
              py: "8px",
              borderRadius: "999px",
              fontSize: 13,
              color: "var(--ink-secondary)",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              transition: "background 0.15s",
              "&:hover": { background: "rgba(0,0,0,0.05)" },
            }}
          >
            Dismiss
          </Box>
        </Box>
      </Box>

      {proactive && !manualMode && !applied && (
        <ProactiveAutoApplyBar
          delay={5000}
          onCancel={() => {
            if (autoApplyRef.current) clearTimeout(autoApplyRef.current);
            setManualMode(true);
          }}
        />
      )}
    </Box>
  );
}
