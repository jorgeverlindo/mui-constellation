"use client";

import { useState, useRef, useEffect } from "react";
import { Box, Collapse, LinearProgress, Typography } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { ConfirmedChip } from "./AgentSelects";
import { ConstellationArcMark, useConstellationAnim } from "./ConstellationArcMark";

// ─── Proactive Auto-Apply Progress Bar ───────────────────────────────────────
const STEPS = [
  { type: "check" as const, label: "Ranking by priority and ROI" },
  { type: "check" as const, label: "Scoring aging and Turn Rate" },
  { type: "dot"   as const, label: "Formatting report output" },
];

export function ProactiveAutoApplyBar({ delay, onCancel }: { delay: number; onCancel: () => void }) {
  const [progress, setProgress] = useState(0);
  const [stepsOpen, setStepsOpen] = useState(false);
  const startRef = useRef(Date.now());
  const arcs = useConstellationAnim(true);

  useEffect(() => {
    startRef.current = Date.now();
    let rafId: number;
    const tick = () => {
      const p = Math.min((Date.now() - startRef.current) / delay * 100, 100);
      setProgress(p);
      if (p < 100) rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [delay]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "11px" }}>

      {/* Loader Accordion */}
      <Box sx={{ pt: "10px", pb: "10px", display: "flex", flexDirection: "column", gap: "4px" }}>

        {/* Header row */}
        <Box
          component="button"
          onClick={() => setStepsOpen(o => !o)}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0,
            cursor: "pointer",
            width: "100%",
            background: "none",
            border: "none",
            transition: "opacity 0.15s",
            "&:hover": { opacity: 0.75 },
          }}
        >
          <Box sx={{ width: 24, height: 24, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ConstellationArcMark arcs={arcs} size={24} />
          </Box>
          <Typography
            component="span"
            sx={{ flex: 1, textAlign: "left", fontSize: 11, color: "rgb(104,101,118)", letterSpacing: "0.4px", lineHeight: "166%" }}
          >
            Applying your selections…
          </Typography>
          <Box sx={{ width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <ExpandMoreIcon
              sx={{
                fontSize: 14,
                color: "rgba(17,16,20,0.56)",
                transition: "transform 0.22s cubic-bezier(0.25,0.1,0.25,1)",
                transform: stepsOpen ? "rotate(180deg)" : "rotate(0deg)",
              }}
            />
          </Box>
        </Box>

        {/* Steps list */}
        <Collapse in={stepsOpen}>
          <Box sx={{ pl: "21px", display: "flex", flexDirection: "column", gap: "3px" }}>
            {STEPS.map((s, i) => (
              <Box key={i} sx={{ display: "flex", alignItems: "center", gap: "4px", height: s.type === "dot" ? 10 : 16 }}>
                {s.type === "check" ? (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
                    <circle cx="8" cy="8" r="6" stroke="#6356e1" strokeWidth="1"/>
                    <path d="M5.5 8l1.5 1.5L10.5 6" stroke="#6356e1" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  <Box sx={{ width: 8, height: 8, borderRadius: "50%", background: "#6356e1", flexShrink: 0 }} />
                )}
                <Typography component="span" sx={{ fontSize: 10, color: "rgb(104,101,118)", lineHeight: "10px" }}>
                  {s.label}
                </Typography>
              </Box>
            ))}
          </Box>
        </Collapse>
      </Box>

      {/* Loader footer */}
      <Box sx={{ pl: "7px", display: "flex", flexDirection: "column", gap: "10px" }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography component="span" sx={{ fontSize: 11, color: "rgb(104,101,118)", letterSpacing: "0.4px", lineHeight: "166%" }}>
            Applying automatically…
          </Typography>
          <Box
            component="button"
            onClick={onCancel}
            sx={{
              fontSize: 13,
              fontWeight: 500,
              color: "#473BAB",
              letterSpacing: "0.46px",
              lineHeight: "22px",
              cursor: "pointer",
              background: "none",
              border: "none",
              transition: "opacity 0.15s",
              "&:hover": { opacity: 0.75 },
            }}
          >
            Edit Manually
          </Box>
        </Box>
        {/* MUI LinearProgress — 4px, white track, brand fill */}
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            height: 4,
            borderRadius: 2,
            backgroundColor: "white",
            "& .MuiLinearProgress-bar": {
              backgroundColor: "#473BAB",
              borderRadius: 2,
              transition: "none",
            },
          }}
        />
      </Box>

    </Box>
  );
}

// ─── Proactive Questions Card ─────────────────────────────────────────────────
const PROACTIVE_OPTIONS = {
  goal:       ["Brand Awareness", "Conquest", "Retention", "Service Drive"] as const,
  timeline:   ["Weekend Event", "Month-long", "Seasonal", "Flexible"] as const,
  offerFocus: ["Lease-heavy", "Finance-heavy", "Mixed", "No preference"] as const,
};

interface ProactiveQuestionsInput {
  intro_line?: string;
}

function ChipRow({ label, options, value, onChange }: { label: string; options: readonly string[]; value: string | null; onChange: (v: string) => void }) {
  return (
    <Box>
      <Typography
        sx={{
          fontSize: 10,
          fontWeight: 600,
          color: "var(--ink-tertiary)",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          mb: "6px",
        }}
      >
        {label}
      </Typography>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
        {options.map(opt => (
          <Box
            key={opt}
            component="button"
            onClick={() => onChange(opt)}
            sx={{
              px: "10px",
              py: "5px",
              borderRadius: "999px",
              fontSize: 11.5,
              fontWeight: 500,
              border: "1px solid",
              cursor: "pointer",
              transition: "all 0.15s",
              ...(value === opt
                ? {
                    background: "var(--brand-accent)",
                    borderColor: "var(--brand-accent)",
                    color: "white",
                  }
                : {
                    background: "white",
                    borderColor: "rgba(0,0,0,0.12)",
                    color: "var(--ink-secondary)",
                    "&:hover": {
                      borderColor: "var(--brand-accent)",
                      color: "var(--brand-accent)",
                    },
                  }),
            }}
          >
            {opt}
          </Box>
        ))}
      </Box>
    </Box>
  );
}

export function ProactiveQuestionsCard({
  input, applied, onSubmit,
}: {
  input: ProactiveQuestionsInput;
  applied: boolean;
  onSubmit: (goal: string, timeline: string, offerFocus: string) => void;
}) {
  const [goal,       setGoal]       = useState<string | null>(null);
  const [timeline,   setTimeline]   = useState<string | null>(null);
  const [offerFocus, setOfferFocus] = useState<string | null>(null);

  if (applied) {
    return (
      <Box sx={{ ml: "32px", mt: "4px" }}>
        <ConfirmedChip label="Proactive build started" />
      </Box>
    );
  }

  const canStart = goal !== null && timeline !== null && offerFocus !== null;
  const introLine = input.intro_line ?? "I've reviewed your catalog and team data — let me ask three quick questions to guide my selections.";

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
          background: "#f8f7ff",
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
          <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
            <path d="M4.5 1v7M1 4.5h7" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        </Box>
        <Typography sx={{ fontSize: 11.5, fontWeight: 600, color: "var(--brand-accent)", letterSpacing: "0.3px" }}>
          Proactive Campaign Build
        </Typography>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: "14px", px: "14px", py: "12px" }}>
        <Typography sx={{ fontSize: 12, color: "var(--ink-secondary)", lineHeight: 1.5 }}>
          {introLine}
        </Typography>
        <ChipRow label="Campaign goal" options={PROACTIVE_OPTIONS.goal} value={goal} onChange={setGoal} />
        <ChipRow label="Timeline" options={PROACTIVE_OPTIONS.timeline} value={timeline} onChange={setTimeline} />
        <ChipRow label="Offer focus" options={PROACTIVE_OPTIONS.offerFocus} value={offerFocus} onChange={setOfferFocus} />
      </Box>

      <Box sx={{ px: "14px", pb: "12px", display: "flex", justifyContent: "flex-end" }}>
        <Box
          component="button"
          onClick={() => { if (canStart) onSubmit(goal!, timeline!, offerFocus!); }}
          disabled={!canStart}
          sx={{
            px: "16px",
            py: "8px",
            borderRadius: "999px",
            color: "white",
            fontSize: 12,
            fontWeight: 500,
            border: "none",
            cursor: "pointer",
            background: "linear-gradient(135deg, var(--brand-accent) 0%, var(--brand-mid) 100%)",
            transition: "opacity 0.15s",
            "&:hover": { opacity: 0.9 },
            "&:disabled": { opacity: 0.4, cursor: "not-allowed" },
          }}
        >
          Start Proactive Build →
        </Box>
      </Box>
    </Box>
  );
}
