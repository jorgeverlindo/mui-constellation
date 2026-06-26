"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Checkbox from "@mui/material/Checkbox";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { useComments } from "../../comments";

export interface Offer {
  id: string;
  year: string;
  make: string;
  model: string;
  trim: string;
  image: string;
  stock: number;
  offerType: string;
  tags: string[];
  pvi: number;
  aging: number;
  sales: number;
  inventory: number;
  monthlyPayment: number;
  term: number;
  totalDueAtSigning: number;
  /** Optional VIN — shown as subtitle in "regular" variant */
  vin?: string;
}

interface OfferCardProps {
  offer: Offer;
  selected?: boolean;
  onSelect?: (id: string, checked: boolean) => void;
  /** Called when "Remove from project" is chosen in the kebab menu */
  onDelete?: () => void;
  /**
   * "recommendation" — catalog offer with PVI / aging / sales / inventory metrics (default when pvi > 0)
   * "regular"        — custom / client-submitted offer; no scoring metrics shown
   * If omitted the variant is inferred: custom- prefix or pvi === 0 → regular.
   */
  variant?: "recommendation" | "regular";
  sx?: object;
}

/** Infer variant from offer data when not explicitly provided */
function resolveVariant(offer: Offer, explicit?: "recommendation" | "regular"): "recommendation" | "regular" {
  if (explicit) return explicit;
  if (offer.id.startsWith("custom-") || offer.pvi === 0) return "regular";
  return "recommendation";
}

export function OfferCard({ offer, selected = false, onSelect, onDelete, variant: variantProp, sx }: OfferCardProps) {
  const variant = resolveVariant(offer, variantProp);
  const fullName = `${offer.year} ${offer.make} ${offer.model} ${offer.trim}`;
  const [hovered, setHovered] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const commentsCtx = useComments();

  // Filter out the internal "Custom" tag from the visible chips
  const visibleTags = offer.tags.filter((t) => t !== "Custom");

  const borderColor = selected
    ? "#6356E1"
    : hovered
    ? "rgba(99,86,225,0.35)"
    : "rgba(0,0,0,0.12)";

  const boxShadow = selected
    ? "0 2px 8px rgba(99,86,225,0.14)"
    : hovered
    ? "0 4px 12px rgba(0,0,0,0.10)"
    : undefined;

  function handleMenuOpen(e: React.MouseEvent<HTMLElement>) {
    e.stopPropagation();
    setMenuAnchor(e.currentTarget);
  }

  function handleMenuClose() {
    setMenuAnchor(null);
  }

  return (
    <Box
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      sx={{
        borderRadius: "12px",
        border: `1px solid ${borderColor}`,
        bgcolor: hovered && !selected ? "#FAFAFA" : "#fff",
        boxShadow,
        overflow: "hidden",
        cursor: "pointer",
        transition: "border-color 0.15s, box-shadow 0.15s, background 0.15s",
        width: "100%",
        ...sx,
      }}
    >
      {/* ── Top section ──────────────────────────────────────────────────────── */}
      <Box sx={{ p: "10px 12px 10px 0", display: "flex", gap: 0 }}>

        {/* Car image block — includes checkbox overlay */}
        <Box sx={{ width: 90, minHeight: 80, position: "relative", flexShrink: 0 }}>
          {/* Checkbox — top-left corner */}
          {onSelect && (
            <Box
              sx={{ position: "absolute", top: 0, left: 0, zIndex: 2, p: "6px 6px 0 6px" }}
              onClick={(e) => e.stopPropagation()}
            >
              <Checkbox
                size="small"
                checked={selected}
                onChange={(e) => onSelect(offer.id, e.target.checked)}
                sx={{
                  p: 0,
                  width: 16,
                  height: 16,
                  color: "rgba(0,0,0,0.38)",
                  "&.Mui-checked": { color: "#6356E1" },
                }}
              />
            </Box>
          )}

          {/* Vehicle image */}
          <Box sx={{ position: "absolute", inset: 0, overflow: "hidden" }}>
            {offer.image ? (
              <Box
                component="img"
                src={offer.image}
                alt={fullName}
                sx={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center bottom" }}
              />
            ) : (
              <Box
                component="img"
                src="https://res.cloudinary.com/dvq75cqna/image/upload/v1780071654/vw-funds/public/car-silhouette.png"
                alt="vehicle"
                sx={{ width: 69, height: 69, objectFit: "contain", opacity: 0.72 }}
              />
            )}
          </Box>
        </Box>

        {/* Right content */}
        <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "2px", pl: "10px" }}>
          {/* Title + action buttons row */}
          <Box sx={{ display: "flex", alignItems: "flex-start", gap: "4px" }}>
            <Typography
              component="span"
              sx={{
                flex: 1,
                fontSize: 12,
                fontWeight: 400,
                lineHeight: "143%",
                letterSpacing: "0.17px",
                color: "rgb(31,29,37)",
                pr: "4px",
              }}
            >
              {fullName}
            </Typography>

            {/* Comment button — only shown when CommentsProvider is present */}
            {commentsCtx && (
              <Box
                component="button"
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  commentsCtx.openPanelForEntity({ id: offer.id, label: fullName, type: "offer" });
                }}
                title="Comment on this offer"
                sx={{
                  color: "rgba(104,101,118,0.7)",
                  flexShrink: 0,
                  background: "none",
                  border: "none",
                  p: "2px",
                  cursor: "pointer",
                  borderRadius: "4px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </Box>
            )}

            {/* Kebab menu */}
            <IconButton
              size="small"
              onClick={handleMenuOpen}
              sx={{
                color: "rgba(104,101,118,0.7)",
                flexShrink: 0,
                p: "2px",
                borderRadius: "4px",
                width: 20,
                height: 20,
              }}
            >
              <MoreVertIcon sx={{ fontSize: 15 }} />
            </IconButton>
            <Menu
              anchorEl={menuAnchor}
              open={Boolean(menuAnchor)}
              onClose={handleMenuClose}
              onClick={(e) => e.stopPropagation()}
              PaperProps={{
                sx: {
                  borderRadius: "12px",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.14)",
                  border: "1px solid rgba(0,0,0,0.12)",
                  minWidth: 180,
                  p: "4px",
                },
              }}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
            >
              {onDelete && (
                <MenuItem
                  onClick={(e) => { e.stopPropagation(); handleMenuClose(); onDelete(); }}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    px: "12px",
                    py: "8px",
                    borderRadius: "8px",
                    fontSize: 13,
                    color: "#D2323F",
                    "&:hover": { bgcolor: "#FFF5F5" },
                  }}
                >
                  <DeleteOutlineIcon sx={{ fontSize: 13, color: "#D2323F" }} />
                  Remove from project
                </MenuItem>
              )}
            </Menu>
          </Box>

          {/* Subtitle: stock (recommendation) or VIN (regular) */}
          <Typography
            component="p"
            sx={{
              fontSize: 11,
              lineHeight: "166%",
              letterSpacing: "0.4px",
              color: "rgb(104,101,118)",
              m: 0,
            }}
          >
            {variant === "recommendation"
              ? `${offer.stock} in stock`
              : offer.vin ?? (offer.stock > 1 ? `${offer.stock} in stock` : null)}
          </Typography>

          {/* Metric chips — Recommendation only */}
          {variant === "recommendation" && (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: "4px", mt: "2px" }}>
              {offer.aging > 0 && <MetricChip label="Aging" value={offer.aging} />}
              {offer.sales > 0 && <MetricChip label="Sales" value={offer.sales} />}
              {offer.inventory > 0 && <MetricChip label="Inventory" value={offer.inventory} />}
            </Box>
          )}
        </Box>
      </Box>

      {/* ── Divider ──────────────────────────────────────────────────────────── */}
      <Box sx={{ height: 1, bgcolor: "rgba(0,0,0,0.08)", mx: "8px" }} />

      {/* ── Bottom section ───────────────────────────────────────────────────── */}
      <Box sx={{ p: "6px 8px 8px", display: "flex", flexDirection: "column", gap: "4px" }}>
        {/* Offer type + tags chips */}
        <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "4px" }}>
          <OfferTypeChip label={offer.offerType} />
          {visibleTags.map((tag) => (
            <TagChip key={tag} label={tag} />
          ))}
          {variant === "recommendation" && offer.pvi > 0 && <PviChip value={offer.pvi} />}
        </Box>

        {/* Financial details */}
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
          <FinancialCell label="Monthly Payment" value={`$${offer.monthlyPayment.toLocaleString()}`} />
          <FinancialCell label="Term" value={String(offer.term)} />
          <FinancialCell
            label="Total Due at Signing"
            value={offer.totalDueAtSigning > 0 ? `$${offer.totalDueAtSigning.toLocaleString()}` : "—"}
            infoIcon
          />
        </Box>
      </Box>
    </Box>
  );
}

// ─── Chip sub-components ──────────────────────────────────────────────────────

function OfferTypeChip({ label }: { label: string }) {
  return (
    <Box
      component="span"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        bgcolor: "rgba(99,86,225,0.10)",
        color: "#6356E1",
        fontSize: 11,
        lineHeight: "18px",
        letterSpacing: "0.16px",
        fontWeight: 500,
        px: "6px",
        py: "1px",
        pl: "4px",
        borderRadius: "8px",
      }}
    >
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }}>
        <path d="M2 6.5L4.5 9L10 3" stroke="#6356E1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {label}
    </Box>
  );
}

function TagChip({ label }: { label: string }) {
  return (
    <Box
      component="span"
      sx={{
        fontSize: 11,
        lineHeight: "18px",
        letterSpacing: "0.16px",
        color: "rgb(104,101,118)",
        bgcolor: "rgba(240,242,244,1)",
        px: "6px",
        py: "1px",
        borderRadius: "8px",
        fontWeight: 400,
      }}
    >
      {label}
    </Box>
  );
}

function PviChip({ value }: { value: number }) {
  return (
    <Box
      component="span"
      sx={{
        fontSize: 11,
        lineHeight: "18px",
        letterSpacing: "0.16px",
        color: "#01579b",
        bgcolor: "rgba(2,136,209,0.08)",
        px: "6px",
        py: "1px",
        borderRadius: "8px",
        fontWeight: 400,
      }}
    >
      PVI: <strong style={{ fontWeight: 600 }}>{value}</strong>
    </Box>
  );
}

function MetricChip({ label, value }: { label: string; value: number }) {
  return (
    <Box
      component="span"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: "2px",
        bgcolor: "rgba(2,136,209,0.08)",
        color: "#01579b",
        fontSize: 11,
        lineHeight: "18px",
        letterSpacing: "0.16px",
        fontWeight: 400,
        px: "6px",
        py: "1px",
        borderRadius: "8px",
      }}
    >
      {label}: <strong style={{ fontWeight: 600 }}>{value}</strong>
    </Box>
  );
}

function FinancialCell({ label, value, infoIcon }: { label: string; value: string; infoIcon?: boolean }) {
  return (
    <Box>
      <Box
        component="p"
        sx={{
          fontSize: 10,
          lineHeight: "10px",
          color: "rgb(104,101,118)",
          m: "0 0 3px 0",
          display: "flex",
          alignItems: "center",
          gap: "2px",
        }}
      >
        {label}
        {infoIcon && <InfoOutlinedIcon sx={{ fontSize: 10, color: "rgb(184,182,192)", flexShrink: 0 }} />}
      </Box>
      <Box
        component="p"
        sx={{
          fontSize: 12,
          lineHeight: "143%",
          letterSpacing: "0.17px",
          fontWeight: 600,
          color: "rgb(31,29,37)",
          m: 0,
        }}
      >
        {value}
      </Box>
    </Box>
  );
}
