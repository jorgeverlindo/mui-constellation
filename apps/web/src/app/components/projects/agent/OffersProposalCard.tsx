"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Box, Collapse, Typography } from "@mui/material";
import { OfferCard } from "../offers/OfferCard";
import type { Offer as OfferCardData } from "../offers/OfferCard";
import { offerLibrary } from "../lib/mock-data";
import { AgentAddSelect, ConfirmedChip, WhyThese } from "./AgentSelects";
import { ProactiveAutoApplyBar } from "./ProactiveWidgets";
import { AGENT_SCROLL_TO_SECTION_EVENT } from "../ProjectAgentPane";

interface OffersInput {
  offer_ids: string[];
  rationale: string;
}

interface ProjectContextPayload {
  projectId: string;
  projectName: string;
  oem: string;
  currentOfferIds: string[];
  currentTemplateIds: string[];
  availableOffers: {
    id: string; year: string; make: string; model: string; trim: string;
    offerType: string; monthlyPayment: number; term: number;
    pvi: number; aging: number; stock: number;
  }[];
  availableTemplates: {
    id: string; name: string; format: string; width: number; height: number; brand: string;
  }[];
  activeBrandOem?: string;
  taskOwners?: Record<string, string>;
}

type AgentActionPayload =
  | { action: "add_offers";       offerIds: string[]; editedOfferIds?: string[] }
  | { action: "remove_offers";    offerIds: string[] }
  | { action: "add_templates";    templateIds: string[] }
  | { action: "remove_templates"; templateIds: string[] }
  | { action: "set_project_name"; name: string }
  | { action: "create_project";   name: string; account: string; oem: string; startDate: string; endDate: string; owner?: string; platforms?: string[] }
  | { action: "set_brand";        oem: string }
  | { action: "add_backgrounds";  backgroundIds: string[] }
  | { action: "send_email";       recipient: string; message: string }
  | { action: "add_custom_offers"; offers: unknown[] }
  | { action: "edit_offer"; offerId: string; patches: Partial<{ monthlyPayment: number; term: number; totalDueAtSigning: number; offerType: string; trim: string; year: string; make: string; model: string }> }
  | { action: "set_task_owners"; owners: Record<string, string> };

// ─── Offers Proposal Card ──────────────────────────────────────────────────────
interface OffersCardProps {
  input: OffersInput;
  context: ProjectContextPayload | null;
  onApply: (offerIds: string[], editedOfferIds: string[]) => void;
  onDismiss: () => void;
  proactive?: boolean;
  dispatchAction?: (a: AgentActionPayload) => void;
}

export function OffersProposalCard({ input, context, onApply, onDismiss, proactive, dispatchAction }: OffersCardProps) {
  const [offerIds, setOfferIds] = useState<string[]>(input.offer_ids);
  const [applied,  setApplied]  = useState(false);
  const [customizeMode, setCustomizeMode] = useState(false);
  const [customizations, setCustomizations] = useState<Record<string, {
    monthlyPayment: number; term: number; totalDueAtSigning: number;
  }>>({});
  const [appliedCustomizations, setAppliedCustomizations] = useState<Set<string>>(new Set());
  const offers = context?.availableOffers ?? [];
  const [manualMode, setManualMode] = useState(false);
  const autoApplyRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!customizeMode) return;
    setCustomizations(prev => {
      const next = { ...prev };
      for (const id of offerIds) {
        if (!next[id]) {
          const o = offers.find(x => x.id === id);
          const full = offerLibrary.find(x => x.id === id);
          next[id] = {
            monthlyPayment: o?.monthlyPayment ?? 0,
            term:           o?.term ?? 36,
            totalDueAtSigning: (full as any)?.totalDueAtSigning ?? 0,
          };
        }
      }
      return next;
    });
  }, [customizeMode]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCustomChange = useCallback((id: string, key: string, value: number) => {
    setCustomizations(prev => {
      const o   = offers.find(x => x.id === id);
      const full = offerLibrary.find(x => x.id === id);
      const orig = {
        monthlyPayment:    o?.monthlyPayment    ?? 0,
        term:              o?.term              ?? 36,
        totalDueAtSigning: (full as any)?.totalDueAtSigning ?? 0,
      };
      const existing = prev[id] ?? orig;
      const updated  = { ...existing, [key]: value };
      if (key === "monthlyPayment" || key === "term") {
        const origRatio = orig.monthlyPayment * orig.term > 0
          ? orig.totalDueAtSigning / (orig.monthlyPayment * orig.term)
          : 0.22;
        updated.totalDueAtSigning = Math.round(updated.monthlyPayment * updated.term * origRatio);
      }
      return { ...prev, [id]: updated };
    });
  }, [offers]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!proactive || manualMode || applied) return;
    autoApplyRef.current = setTimeout(() => {
      setApplied(true);
      onApply(offerIds, [...appliedCustomizations]);
    }, 5000);
    return () => { if (autoApplyRef.current) clearTimeout(autoApplyRef.current); };
  }, [proactive, manualMode, applied]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!applied && offerIds.length > 0 && appliedCustomizations.size >= offerIds.length) {
      setApplied(true);
      onApply(offerIds, [...appliedCustomizations]);
    }
  }, [appliedCustomizations.size]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    window.dispatchEvent(new CustomEvent(AGENT_SCROLL_TO_SECTION_EVENT, { detail: { section: "offers" } }));
  }, []);

  if (applied) {
    return (
      <Box sx={{ ml: "32px", mt: "4px" }}>
        <ConfirmedChip label={`${offerIds.length} offer${offerIds.length !== 1 ? "s" : ""} added`} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        ml: "32px",
        mt: "4px",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        opacity: 0,
        animation: "fadeInUp 0.2s ease forwards",
        "@keyframes fadeInUp": {
          from: { opacity: 0, transform: "translateY(6px)" },
          to:   { opacity: 1, transform: "translateY(0)" },
        },
      }}
    >
      {/* Rationale */}
      <Box sx={{ pl: "2px" }}>
        <Typography sx={{ fontSize: 14, color: "var(--ink-secondary)", lineHeight: 1.6, letterSpacing: "0.17px" }}>
          {input.rationale}
        </Typography>
        <WhyThese content={
          <Box sx={{ fontSize: 11, color: "var(--brand-accent)", lineHeight: 1.6 }}>
            <Typography component="p" sx={{ fontWeight: 600, mb: "4px", fontSize: 11, color: "var(--brand-accent)" }}>How I picked these</Typography>
            <Typography component="p" sx={{ mb: "4px", fontSize: 11, color: "var(--brand-accent)" }}>I rank every offer in your inventory on two signals:</Typography>
            <Typography component="p" sx={{ mb: "2px", fontSize: 11, color: "var(--brand-accent)" }}>• <strong>Aging</strong> — days each unit has been in stock. Older units get priority to move inventory.</Typography>
            <Typography component="p" sx={{ mb: "4px", fontSize: 11, color: "var(--brand-accent)" }}>• <strong>PVI (Performance Value Index)</strong> — projected return per vehicle at its current price. Higher is better.</Typography>
            <Typography component="p" sx={{ fontSize: 11, color: "var(--brand-accent)" }}>The offers with the best combined score for your brand made the cut.</Typography>
          </Box>
        } />
      </Box>

      {/* Offer cards list */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: "6px", maxHeight: "52vh", overflowY: "auto", pr: "2px" }}>
        {offerIds.map((id) => {
          const o = offers.find(x => x.id === id);
          if (!o) return null;
          const fullOffer = offerLibrary.find(x => x.id === o.id);
          const custom = customizations[id];
          const cardData: OfferCardData = {
            id: o.id,
            year: o.year,
            make: o.make,
            model: o.model,
            trim: o.trim,
            image: (fullOffer as any)?.image ?? "",
            stock: o.stock,
            offerType: o.offerType,
            tags: (fullOffer as any)?.tags ?? [],
            pvi: o.pvi,
            aging: o.aging,
            sales: (fullOffer as any)?.sales ?? 0,
            inventory: (fullOffer as any)?.inventory ?? o.stock,
            monthlyPayment: custom?.monthlyPayment ?? o.monthlyPayment,
            term: custom?.term ?? o.term,
            totalDueAtSigning: custom?.totalDueAtSigning ?? (fullOffer as any)?.totalDueAtSigning ?? 0,
          };
          const isApplied = appliedCustomizations.has(id);
          return (
            <Box
              key={id}
              onClick={() => !customizeMode && setCustomizeMode(true)}
              sx={{ cursor: !customizeMode ? "pointer" : undefined }}
            >
              <OfferCard
                offer={cardData}
                variant={isApplied ? "regular" : "recommendation"}
                onDelete={() => setOfferIds(p => p.filter(x => x !== id))}
              />
              <Collapse in={customizeMode}>
                <Box
                  sx={{
                    mt: "4px",
                    px: "12px",
                    py: "10px",
                    borderRadius: "10px",
                    background: "rgba(71,59,171,0.04)",
                    border: "1px solid rgba(71,59,171,0.12)",
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "16px 8px",
                    alignItems: "flex-end",
                  }}
                >
                  {[
                    { key: "monthlyPayment",    label: "Monthly Payment ($)", val: custom?.monthlyPayment    ?? o.monthlyPayment },
                    { key: "term",              label: "Term (mo)",           val: custom?.term              ?? o.term           },
                    { key: "totalDueAtSigning", label: "Due at Signing ($)",  val: custom?.totalDueAtSigning ?? ((fullOffer as any)?.totalDueAtSigning ?? 0) },
                  ].map(({ key, label, val }) => (
                    <Box
                      component="label"
                      key={key}
                      sx={{ fontSize: 11, display: "flex", flexDirection: "column", gap: "3px", color: "var(--ink-secondary)" }}
                    >
                      {label}
                      <Box
                        component="input"
                        type="number"
                        value={val}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleCustomChange(id, key, Number(e.target.value))}
                        sx={{
                          width: 90,
                          px: "8px",
                          py: "4px",
                          borderRadius: "6px",
                          border: "1px solid rgba(0,0,0,0.12)",
                          fontSize: 12,
                          color: "var(--ink)",
                          background: "white",
                          outline: "none",
                          "&:focus": {
                            borderColor: "var(--brand-accent)",
                            boxShadow: "0 0 0 1px rgba(71,59,171,0.15)",
                          },
                        }}
                      />
                    </Box>
                  ))}
                  <Box
                    component="button"
                    onClick={() => {
                      setAppliedCustomizations(prev => new Set([...prev, id]));
                      const c = customizations[id];
                      if (c && dispatchAction) {
                        dispatchAction({ action: "edit_offer", offerId: id, patches: c });
                      }
                    }}
                    sx={{
                      px: "12px",
                      py: "4px",
                      borderRadius: "999px",
                      fontSize: 12,
                      fontWeight: 500,
                      color: "white",
                      cursor: "pointer",
                      border: "none",
                      background: "linear-gradient(99deg, var(--brand-accent) 0%, var(--brand-mid) 100%)",
                      transition: "opacity 0.15s",
                      "&:hover": { opacity: 0.9 },
                    }}
                  >
                    Apply
                  </Box>
                </Box>
              </Collapse>
            </Box>
          );
        })}
      </Box>

      {/* Add another + action buttons */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: "6px", mt: "2px" }}>
        <AgentAddSelect
          placeholder="Add another offer…"
          onAdd={v => setOfferIds(p => [...p, v])}
          options={offers
            .filter(o => !offerIds.includes(o.id))
            .map(o => ({ value: o.id, label: `${o.year} ${o.make} ${o.model} ${o.trim} — ${o.offerType} $${o.monthlyPayment}/mo` }))}
        />
        <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Box
            component="button"
            onClick={() => { onApply(offerIds, [...appliedCustomizations]); setApplied(true); }}
            disabled={offerIds.length === 0}
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
            Add {offerIds.length} offer{offerIds.length !== 1 ? "s" : ""}
          </Box>
          <Box
            component="button"
            onClick={() => setCustomizeMode(m => !m)}
            sx={{
              px: "14px",
              py: "8px",
              borderRadius: "999px",
              fontSize: 13,
              fontWeight: 500,
              border: "1px solid",
              cursor: "pointer",
              transition: "all 0.15s",
              ...(customizeMode
                ? {
                    background: "rgba(71,59,171,0.08)",
                    borderColor: "rgba(71,59,171,0.3)",
                    color: "var(--brand-accent)",
                  }
                : {
                    background: "transparent",
                    borderColor: "rgba(0,0,0,0.12)",
                    color: "var(--ink-secondary)",
                    "&:hover": { background: "rgba(0,0,0,0.05)" },
                  }),
            }}
          >
            {customizeMode ? "Done" : "Customize"}
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
