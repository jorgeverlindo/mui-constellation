"use client";

import { useState, useMemo } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import InputBase from "@mui/material/InputBase";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import Checkbox from "@mui/material/Checkbox";
import Chip from "@mui/material/Chip";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import CheckIcon from "@mui/icons-material/Check";
import { offerLibrary } from "../lib/mock-data";

type Offer = typeof offerLibrary[number];

interface BrowseOffersDialogProps {
  open: boolean;
  onClose: () => void;
  /** IDs of offers already in the project (base + previously added, excluding deleted) */
  existingOfferIds: Set<string>;
  onAdd: (ids: string[]) => void;
}

const MAKES = ["All", "BMW", "Mercedes-Benz", "Honda"];

export function BrowseOffersDialog({ open, onClose, existingOfferIds, onAdd }: BrowseOffersDialogProps) {
  const [search, setSearch] = useState("");
  const [makeFilter, setMakeFilter] = useState("All");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    return offerLibrary.filter((o) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        o.make.toLowerCase().includes(q) ||
        o.model.toLowerCase().includes(q) ||
        o.trim.toLowerCase().includes(q) ||
        o.year.includes(q);
      const matchesMake = makeFilter === "All" || o.make === makeFilter;
      return matchesSearch && matchesMake;
    });
  }, [search, makeFilter]);

  function toggle(id: string) {
    if (existingOfferIds.has(id)) return;
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function handleAdd() {
    onAdd(Array.from(selected));
    setSelected(new Set());
    onClose();
  }

  function handleClose() {
    setSelected(new Set());
    onClose();
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth={false}
      sx={{
        "& .MuiDialog-paper": {
          m: "24px",
          width: "calc(100vw - 48px)",
          maxWidth: "none",
          height: "calc(100vh - 48px)",
          maxHeight: "none",
          borderRadius: 3,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          px: 3,
          py: 2,
          borderBottom: "1px solid",
          borderColor: "divider",
          flexShrink: 0,
        }}
      >
        <Box>
          <Typography sx={{ fontSize: "1rem", fontWeight: 600, color: "rgb(31,29,37)" }}>
            Browse All Offers
          </Typography>
          <Typography sx={{ fontSize: "0.75rem", color: "text.secondary", mt: "2px" }}>
            Select offers to add to this project
          </Typography>
        </Box>

        {/* Search */}
        <Box
          sx={{
            ml: "auto",
            display: "flex",
            alignItems: "center",
            bgcolor: "#F9FAFB",
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 1,
            px: 1,
            py: 0.25,
            width: 208,
          }}
        >
          <SearchIcon sx={{ fontSize: 13, color: "text.disabled", mr: 0.5, flexShrink: 0 }} />
          <InputBase
            placeholder="Search offers…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ fontSize: "0.75rem", flex: 1 }}
          />
        </Box>

        <IconButton
          onClick={handleClose}
          size="small"
          sx={{ ml: 0.5, color: "text.secondary" }}
        >
          <CloseIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>

      {/* Make filter chips */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          px: 3,
          py: 1.5,
          borderBottom: "1px solid",
          borderColor: "divider",
          flexShrink: 0,
        }}
      >
        {MAKES.map((make) => (
          <Chip
            key={make}
            label={make}
            size="small"
            onClick={() => setMakeFilter(make)}
            sx={{
              fontSize: "0.75rem",
              fontWeight: 500,
              cursor: "pointer",
              bgcolor: makeFilter === make ? "#6356E1" : "#F3F4F6",
              color: makeFilter === make ? "#fff" : "rgb(75,85,99)",
              "&:hover": {
                bgcolor: makeFilter === make ? "#5244cc" : "#E5E7EB",
              },
              "& .MuiChip-label": { px: "10px" },
            }}
          />
        ))}
        <Typography sx={{ ml: "auto", fontSize: "0.75rem", color: "text.disabled" }}>
          {filtered.length} offers
        </Typography>
      </Box>

      {/* Offer grid */}
      <DialogContent sx={{ flex: 1, overflow: "auto", px: 3, py: 2.5 }}>
        {filtered.length === 0 ? (
          <Typography sx={{ fontSize: "0.875rem", color: "text.secondary", textAlign: "center", py: 6 }}>
            No offers match your search.
          </Typography>
        ) : (
          <Box
            sx={{
              display: "grid",
              gap: "12px",
              gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))",
            }}
          >
            {filtered.map((offer) => {
              const alreadyAdded = existingOfferIds.has(offer.id);
              const isSelected = selected.has(offer.id);
              return (
                <BrowseOfferCard
                  key={offer.id}
                  offer={offer}
                  alreadyAdded={alreadyAdded}
                  selected={isSelected}
                  onToggle={() => toggle(offer.id)}
                />
              );
            })}
          </Box>
        )}
      </DialogContent>

      {/* Footer */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 3,
          py: 2,
          borderTop: "1px solid",
          borderColor: "divider",
          flexShrink: 0,
          bgcolor: "#F9FAFB",
        }}
      >
        <Typography sx={{ fontSize: "0.75rem", color: "text.secondary" }}>
          {selected.size > 0
            ? `${selected.size} offer${selected.size !== 1 ? "s" : ""} selected`
            : "No offers selected"}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Button
            variant="outlined"
            onClick={handleClose}
            size="small"
            sx={{
              fontSize: "0.875rem",
              fontWeight: 500,
              color: "rgb(75,85,99)",
              borderColor: "rgb(209,213,219)",
              borderRadius: "9999px",
              px: 2,
              py: 0.75,
              textTransform: "none",
              "&:hover": { bgcolor: "#F3F4F6", borderColor: "rgb(209,213,219)" },
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleAdd}
            disabled={selected.size === 0}
            size="small"
            sx={{
              fontSize: "0.875rem",
              fontWeight: 600,
              bgcolor: "#6356E1",
              borderRadius: "9999px",
              px: 2.5,
              py: 0.75,
              textTransform: "none",
              boxShadow: "none",
              "&:hover": { bgcolor: "#5244cc", boxShadow: "none" },
              "&.Mui-disabled": { bgcolor: "#E5E7EB", color: "#9CA3AF" },
            }}
          >
            Add {selected.size > 0 ? `(${selected.size})` : ""}
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
}

// ─── Compact offer card for the dialog ───────────────────────────────────────

function BrowseOfferCard({
  offer,
  alreadyAdded,
  selected,
  onToggle,
}: {
  offer: Offer;
  alreadyAdded: boolean;
  selected: boolean;
  onToggle: () => void;
}) {
  const fullName = `${offer.year} ${offer.make} ${offer.model} ${offer.trim}`;

  return (
    <Box
      onClick={alreadyAdded ? undefined : onToggle}
      sx={{
        borderRadius: "12px",
        border: `1px solid ${selected ? "#6356E1" : alreadyAdded ? "rgba(0,0,0,0.06)" : "rgba(0,0,0,0.12)"}`,
        bgcolor: alreadyAdded ? "#fafafa" : "#fff",
        boxShadow: selected ? "0 2px 8px rgba(99,86,225,0.12)" : undefined,
        overflow: "hidden",
        cursor: alreadyAdded ? "default" : "pointer",
        opacity: alreadyAdded ? 0.6 : 1,
      }}
    >
      {/* Top section */}
      <Box sx={{ p: "12px", display: "flex", gap: "12px" }}>
        {/* Car image */}
        <Box sx={{ width: 80, height: 80, position: "relative", flexShrink: 0 }}>
          <Box
            component="img"
            src={offer.image}
            alt={fullName}
            sx={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain" }}
          />
        </Box>

        {/* Right content */}
        <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "4px" }}>
          {/* Title row */}
          <Box sx={{ display: "flex", alignItems: "flex-start", gap: "6px" }}>
            {alreadyAdded ? (
              <Box
                sx={{
                  width: 16,
                  height: 16,
                  mt: "2px",
                  flexShrink: 0,
                  borderRadius: "4px",
                  bgcolor: "#e0e7ff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <CheckIcon sx={{ fontSize: 10, color: "#6356E1" }} />
              </Box>
            ) : (
              <Checkbox
                size="small"
                checked={selected}
                onChange={onToggle}
                onClick={(e) => e.stopPropagation()}
                sx={{
                  p: 0,
                  mt: "2px",
                  width: 16,
                  height: 16,
                  flexShrink: 0,
                  color: "rgba(0,0,0,0.38)",
                  "&.Mui-checked": { color: "#6356E1" },
                }}
              />
            )}
            <Typography
              component="span"
              sx={{
                flex: 1,
                fontSize: 12,
                fontWeight: 400,
                lineHeight: "143%",
                letterSpacing: "0.17px",
                color: "rgb(31,29,37)",
              }}
            >
              {fullName}
            </Typography>
            {alreadyAdded && (
              <Typography
                component="span"
                sx={{ fontSize: 10, color: "#6356E1", fontWeight: 500, flexShrink: 0, mt: "3px" }}
              >
                Added
              </Typography>
            )}
          </Box>

          {/* Stock */}
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
            {offer.stock} in stock
          </Typography>

          {/* Metric chips */}
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
            <MiniChip label="Aging" value={offer.aging} />
            <MiniChip label="Sales" value={offer.sales} />
            <MiniChip label="Inv" value={offer.inventory} />
          </Box>
        </Box>
      </Box>

      {/* Divider */}
      <Box sx={{ height: 1, bgcolor: "rgba(0,0,0,0.08)", mx: "12px" }} />

      {/* Bottom section */}
      <Box sx={{ p: "8px 12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", gap: "4px" }}>
          <BrowseTagChip label={offer.offerType} color="indigo" />
          {offer.tags.map((t) => (
            <BrowseTagChip key={t} label={t} color="gray" />
          ))}
          <BrowseTagChip label={`PVI: ${offer.pvi}`} color="blue" />
        </Box>
        <Box sx={{ display: "flex", gap: "16px" }}>
          <FinCell label="Monthly" value={`$${offer.monthlyPayment.toLocaleString()}`} />
          <FinCell label="Term" value={`${offer.term}mo`} />
          <FinCell
            label="Due at Signing"
            value={offer.totalDueAtSigning === 0 ? "—" : `$${offer.totalDueAtSigning.toLocaleString()}`}
          />
        </Box>
      </Box>
    </Box>
  );
}

function MiniChip({ label, value }: { label: string; value: number }) {
  return (
    <Box
      component="span"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: "2px",
        bgcolor: "rgba(1,87,155,0.08)",
        color: "rgb(1,87,155)",
        fontSize: 10,
        fontWeight: 400,
        px: "6px",
        py: "1px",
        borderRadius: "9999px",
        letterSpacing: "0.16px",
      }}
    >
      {label}: <strong style={{ fontWeight: 600 }}>{value}</strong>
    </Box>
  );
}

function BrowseTagChip({ label, color }: { label: string; color: "indigo" | "gray" | "blue" }) {
  const colorMap = {
    indigo: { bgcolor: "rgba(99,86,225,0.08)", color: "rgb(99,86,225)" },
    gray: { bgcolor: "rgba(104,101,118,0.08)", color: "rgb(104,101,118)" },
    blue: { bgcolor: "rgba(1,87,155,0.08)", color: "rgb(1,87,155)" },
  };
  const { bgcolor, color: textColor } = colorMap[color];
  return (
    <Box
      component="span"
      sx={{
        bgcolor,
        color: textColor,
        fontSize: 10,
        fontWeight: 500,
        px: "6px",
        py: "2px",
        borderRadius: "9999px",
      }}
    >
      {label}
    </Box>
  );
}

function FinCell({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ textAlign: "right" }}>
      <Typography component="p" sx={{ fontSize: 9, color: "rgb(104,101,118)", m: "0 0 2px 0" }}>
        {label}
      </Typography>
      <Typography component="p" sx={{ fontSize: 11, fontWeight: 700, color: "rgb(31,29,37)", m: 0 }}>
        {value}
      </Typography>
    </Box>
  );
}
