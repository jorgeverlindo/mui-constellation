"use client";

import { useState, useMemo } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import InputBase from "@mui/material/InputBase";
import Checkbox from "@mui/material/Checkbox";
import Chip from "@mui/material/Chip";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableBody from "@mui/material/TableBody";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import BarChartIcon from "@mui/icons-material/BarChart";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import SearchIcon from "@mui/icons-material/Search";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import GridViewIcon from "@mui/icons-material/GridView";
import TableRowsIcon from "@mui/icons-material/TableRows";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import CheckIcon from "@mui/icons-material/Check";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { OfferCard } from "./offers/OfferCard";
import { BrowseOffersDialog } from "./offers/BrowseOffersDialog";
import {
  getProjectOffers,
  getProjectById,
  offerLibrary,
} from "./lib/mock-data";
import { useProjectStore } from "./lib/project-store";

type Offer = typeof offerLibrary[number];

export function OffersPage({
  projectId,
  onNavigateTo,
}: {
  projectId: string;
  onNavigateTo: (page: string) => void;
}) {
  const id = projectId;
  const project = getProjectById(id);

  const { deletedOfferIds, deleteOffers, addedOfferIds, addOffers } =
    useProjectStore();

  // Base offers from mock-data + dynamically added ones
  const baseOffers = getProjectOffers(id);
  const extraOffers = useMemo(() => {
    const projectAddedIds = addedOfferIds[id] ?? [];
    return projectAddedIds
      .map((aid) => offerLibrary.find((o) => o.id === aid))
      .filter((o): o is Offer => !!o);
  }, [addedOfferIds, id]);

  const allOffers = useMemo(
    () => [...baseOffers, ...extraOffers],
    [baseOffers, extraOffers]
  );
  const offers = useMemo(
    () => allOffers.filter((o) => !deletedOfferIds.has(o.id)),
    [allOffers, deletedOfferIds]
  );

  // Current offer IDs in project (for the dialog to know what's already added)
  const existingOfferIds = useMemo(
    () => new Set(offers.map((o) => o.id)),
    [offers]
  );

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [browseOpen, setBrowseOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  function handleSelect(offerId: string, checked: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      checked ? next.add(offerId) : next.delete(offerId);
      return next;
    });
  }

  function handleSelectAll() {
    if (selected.size === offers.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(offers.map((o) => o.id)));
    }
  }

  function handleDelete() {
    deleteOffers(Array.from(selected));
    setSelected(new Set());
  }

  function handleAddFromBrowse(ids: string[]) {
    addOffers(id, ids);
  }

  // suppress unused variable warning — project is kept for parity with source
  void project;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Page header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          px: 3,
          py: 1.5,
          bgcolor: "#fff",
        }}
      >
        <Typography
          component="h1"
          sx={{ fontSize: "1.125rem", fontWeight: 600, color: "rgb(17,24,39)" }}
        >
          Offers
        </Typography>
        <Chip
          label="Data Compliance"
          size="small"
          sx={{
            ml: "4px",
            fontSize: "0.75rem",
            fontWeight: 500,
            color: "#6356E1",
            bgcolor: "rgba(99,86,225,0.08)",
            border: "1px solid rgba(99,86,225,0.20)",
            "& .MuiChip-label": { px: "10px" },
          }}
        />
        <IconButton
          size="small"
          sx={{ ml: "4px", color: "rgb(156,163,175)", "&:hover": { color: "rgb(75,85,99)" } }}
        >
          <MoreVertIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Box>

      <Box
        sx={{
          flex: 1,
          overflow: "auto",
          px: 3,
          py: 2.5,
          display: "flex",
          flexDirection: "column",
          gap: 2.5,
        }}
      >
        {/* CTA blocks */}
        <Box
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          }}
        >
          <CtaBlock
            icon={<AutoAwesomeIcon sx={{ fontSize: 20, color: "rgba(99,86,225,0.60)" }} />}
            text="From inventory, incentives, and competitors"
            action="Get Recommendations"
            onClick={undefined}
          />
          <CtaBlock
            icon={<BarChartIcon sx={{ fontSize: 20, color: "rgba(99,86,225,0.60)" }} />}
            text="Regional, national and VIN-level offers"
            action="Browse All Offers"
            onClick={() => setBrowseOpen(true)}
          />
          <CtaBlock
            icon={<AccessTimeIcon sx={{ fontSize: 20, color: "rgba(99,86,225,0.60)" }} />}
            text="Browse offers from the previous months"
            action="See Past Offers"
            onClick={undefined}
          />
        </Box>

        {/* Recommendations section */}
        <Box>
          {/* Section header */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 1.5,
            }}
          >
            <Typography
              component="h2"
              sx={{ fontSize: "0.875rem", fontWeight: 600, color: "rgb(17,24,39)" }}
            >
              Recommendations to get you started
            </Typography>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              {/* Search */}
              <Box
                sx={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  bgcolor: "#fff",
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: "9999px",
                  px: 1,
                  py: 0.25,
                }}
              >
                <SearchIcon sx={{ fontSize: 13, color: "text.disabled", mr: 0.5, flexShrink: 0 }} />
                <InputBase
                  placeholder="Find below"
                  sx={{
                    fontSize: "0.75rem",
                    color: "rgb(55,65,81)",
                    "& input::placeholder": { color: "rgb(156,163,175)", opacity: 1 },
                  }}
                  inputProps={{ style: { padding: "2px 0" } }}
                />
              </Box>

              {/* Delete selected */}
              {selected.size > 0 && (
                <Button
                  onClick={handleDelete}
                  startIcon={<DeleteOutlineIcon sx={{ fontSize: 13 }} />}
                  size="small"
                  sx={{
                    fontSize: "0.75rem",
                    fontWeight: 500,
                    color: "rgb(220,38,38)",
                    textTransform: "none",
                    p: 0,
                    minWidth: 0,
                    gap: 0.5,
                    "&:hover": { color: "rgb(153,27,27)", bgcolor: "transparent" },
                  }}
                >
                  Delete ({selected.size})
                </Button>
              )}

              {/* Select all */}
              <Button
                onClick={handleSelectAll}
                size="small"
                sx={{
                  fontSize: "0.75rem",
                  fontWeight: 500,
                  color: "#6356E1",
                  textTransform: "none",
                  p: 0,
                  minWidth: 0,
                  "&:hover": { bgcolor: "transparent", color: "#5244cc" },
                }}
              >
                {selected.size === offers.length && offers.length > 0
                  ? "Deselect All"
                  : "Select All"}
              </Button>

              <Typography sx={{ fontSize: "0.75rem", color: "text.disabled" }}>
                {offers.length} offer{offers.length !== 1 ? "s" : ""}
              </Typography>

              {/* View mode toggle */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1,
                  overflow: "hidden",
                }}
              >
                <IconButton
                  onClick={() => setViewMode("grid")}
                  size="small"
                  title="Grid view"
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: 0,
                    bgcolor: viewMode === "grid" ? "#6356E1" : "transparent",
                    color: viewMode === "grid" ? "#fff" : "rgb(156,163,175)",
                    "&:hover": {
                      bgcolor: viewMode === "grid" ? "#6356E1" : "#F9FAFB",
                      color: viewMode === "grid" ? "#fff" : "rgb(55,65,81)",
                    },
                  }}
                >
                  <GridViewIcon sx={{ fontSize: 13 }} />
                </IconButton>
                <IconButton
                  onClick={() => setViewMode("table")}
                  size="small"
                  title="Table view"
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: 0,
                    bgcolor: viewMode === "table" ? "#6356E1" : "transparent",
                    color: viewMode === "table" ? "#fff" : "rgb(156,163,175)",
                    "&:hover": {
                      bgcolor: viewMode === "table" ? "#6356E1" : "#F9FAFB",
                      color: viewMode === "table" ? "#fff" : "rgb(55,65,81)",
                    },
                  }}
                >
                  <TableRowsIcon sx={{ fontSize: 13 }} />
                </IconButton>
              </Box>
            </Box>
          </Box>

          {/* Offer cards grid / table */}
          {viewMode === "grid" ? (
            <Box
              sx={{
                display: "grid",
                gap: 2,
                gridTemplateColumns: "repeat(auto-fill, minmax(320px, 380px))",
              }}
            >
              {offers.map((offer) => (
                <OfferCard
                  key={offer.id}
                  offer={offer}
                  selected={selected.has(offer.id)}
                  onSelect={handleSelect}
                />
              ))}
            </Box>
          ) : (
            <OfferTable
              offers={offers}
              selected={selected}
              onSelect={handleSelect}
            />
          )}
        </Box>
      </Box>

      {/* Footer nav */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          px: 3,
          py: 1.5,
          bgcolor: "#fff",
        }}
      >
        <Button
          onClick={() => onNavigateTo("templates")}
          endIcon={<ChevronRightIcon sx={{ fontSize: 14 }} />}
          size="small"
          sx={{
            fontSize: "0.875rem",
            fontWeight: 500,
            color: "#6356E1",
            border: "1px solid rgba(99,86,225,0.30)",
            borderRadius: "9999px",
            px: 2,
            py: 0.75,
            textTransform: "none",
            "&:hover": { bgcolor: "rgba(99,86,225,0.05)", borderColor: "rgba(99,86,225,0.30)" },
          }}
        >
          Add Templates
        </Button>
      </Box>

      {/* Browse All Offers dialog */}
      <BrowseOffersDialog
        open={browseOpen}
        onClose={() => setBrowseOpen(false)}
        existingOfferIds={existingOfferIds}
        onAdd={handleAddFromBrowse}
      />
    </Box>
  );
}

// ─── OfferTable ───────────────────────────────────────────────────────────────

type OfferRow = typeof offerLibrary[number];

const COLS: { key: string; label: string; align?: "right" }[] = [
  { key: "vehicle", label: "Vehicle" },
  { key: "offerType", label: "Type" },
  { key: "tags", label: "Tags" },
  { key: "pvi", label: "PVI", align: "right" },
  { key: "aging", label: "Aging", align: "right" },
  { key: "sales", label: "Sales", align: "right" },
  { key: "inventory", label: "Inventory", align: "right" },
  { key: "monthlyPayment", label: "Monthly", align: "right" },
  { key: "term", label: "Term", align: "right" },
  { key: "totalDue", label: "Due at Signing", align: "right" },
];

function OfferTable({
  offers,
  selected,
  onSelect,
}: {
  offers: OfferRow[];
  selected: Set<string>;
  onSelect: (id: string, checked: boolean) => void;
}) {
  const allSelected =
    offers.length > 0 && offers.every((o) => selected.has(o.id));
  const someSelected = offers.some((o) => selected.has(o.id)) && !allSelected;

  function handleSelectAll(e: React.ChangeEvent<HTMLInputElement>) {
    offers.forEach((o) => onSelect(o.id, e.target.checked));
  }

  return (
    <Box
      sx={{
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
        overflow: "hidden",
        bgcolor: "#fff",
      }}
    >
      <Table size="small" sx={{ borderCollapse: "collapse" }}>
        <TableHead>
          <TableRow sx={{ bgcolor: "#F9FAFB", borderBottom: "1px solid", borderColor: "divider" }}>
            {/* Checkbox */}
            <TableCell sx={{ width: 32, pl: 2, pr: 1, py: 1.25, borderBottom: 0 }}>
              <Checkbox
                size="small"
                checked={allSelected}
                indeterminate={someSelected}
                onChange={handleSelectAll}
                sx={{
                  p: 0,
                  width: 14,
                  height: 14,
                  color: "rgba(0,0,0,0.38)",
                  "&.Mui-checked, &.MuiCheckbox-indeterminate": { color: "#6356E1" },
                }}
              />
            </TableCell>
            {/* Car image placeholder column */}
            <TableCell sx={{ width: 48, px: 1, py: 1.25, borderBottom: 0 }} />
            {COLS.map((col) => (
              <TableCell
                key={col.key}
                align={col.align}
                sx={{
                  px: 1.5,
                  py: 1.25,
                  fontSize: "0.6875rem",
                  fontWeight: 600,
                  color: "rgb(107,114,128)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  whiteSpace: "nowrap",
                  borderBottom: 0,
                }}
              >
                {col.label}
              </TableCell>
            ))}
            {/* Actions */}
            <TableCell sx={{ width: 32, pr: 1.5, py: 1.25, borderBottom: 0 }} />
          </TableRow>
        </TableHead>
        <TableBody>
          {offers.map((offer, i) => {
            const isSelected = selected.has(offer.id);
            return (
              <TableRow
                key={offer.id}
                sx={{
                  borderBottom: "1px solid",
                  borderColor: "rgba(0,0,0,0.06)",
                  "&:last-child": { borderBottom: 0 },
                  bgcolor: isSelected
                    ? "rgba(99,86,225,0.05)"
                    : i % 2 === 1
                    ? "rgba(249,250,251,0.4)"
                    : "#fff",
                  "&:hover": { bgcolor: "rgba(99,86,225,0.04)" },
                  transition: "background-color 0.1s",
                }}
              >
                {/* Checkbox */}
                <TableCell sx={{ pl: 2, pr: 1, py: 1.25, borderBottom: 0 }}>
                  <Checkbox
                    size="small"
                    checked={isSelected}
                    onChange={(e) => onSelect(offer.id, e.target.checked)}
                    sx={{
                      p: 0,
                      width: 14,
                      height: 14,
                      color: "rgba(0,0,0,0.38)",
                      "&.Mui-checked": { color: "#6356E1" },
                    }}
                  />
                </TableCell>

                {/* Car thumbnail */}
                <TableCell sx={{ px: 1, py: 1, borderBottom: 0 }}>
                  <Box sx={{ position: "relative", width: 48, height: 32, flexShrink: 0 }}>
                    <Box
                      component="img"
                      src={offer.image}
                      alt={offer.model}
                      sx={{
                        position: "absolute",
                        inset: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                      }}
                    />
                  </Box>
                </TableCell>

                {/* Vehicle */}
                <TableCell sx={{ px: 1.5, py: 1.25, minWidth: 200, borderBottom: 0 }}>
                  <Typography
                    component="p"
                    sx={{ fontSize: "0.75rem", fontWeight: 600, color: "rgb(17,24,39)", lineHeight: 1.4 }}
                  >
                    {offer.year} {offer.make} {offer.model}
                  </Typography>
                  <Typography
                    component="p"
                    sx={{ fontSize: "0.6875rem", color: "rgb(156,163,175)", lineHeight: 1.4, mt: "2px" }}
                  >
                    {offer.trim}
                  </Typography>
                </TableCell>

                {/* Offer type */}
                <TableCell sx={{ px: 1.5, py: 1.25, whiteSpace: "nowrap", borderBottom: 0 }}>
                  <Box
                    component="span"
                    sx={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      bgcolor: "rgba(99,86,225,0.08)",
                      color: "#6356E1",
                      fontSize: "0.6875rem",
                      fontWeight: 500,
                      px: "8px",
                      py: "2px",
                      borderRadius: "9999px",
                    }}
                  >
                    <CheckIcon sx={{ fontSize: 10 }} />
                    {offer.offerType}
                  </Box>
                </TableCell>

                {/* Tags */}
                <TableCell sx={{ px: 1.5, py: 1.25, borderBottom: 0 }}>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                    {offer.tags.map((tag) => (
                      <Box
                        key={tag}
                        component="span"
                        sx={{
                          display: "inline-block",
                          fontSize: "0.6875rem",
                          color: "rgb(107,114,128)",
                          bgcolor: "rgb(243,244,246)",
                          px: "8px",
                          py: "2px",
                          borderRadius: "9999px",
                        }}
                      >
                        {tag}
                      </Box>
                    ))}
                  </Box>
                </TableCell>

                {/* PVI */}
                <TableCell align="right" sx={{ px: 1.5, py: 1.25, borderBottom: 0 }}>
                  <Box
                    component="span"
                    sx={{
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      color: "rgb(29,78,216)",
                      bgcolor: "rgb(239,246,255)",
                      px: "8px",
                      py: "2px",
                      borderRadius: "9999px",
                    }}
                  >
                    {offer.pvi}
                  </Box>
                </TableCell>

                {/* Aging */}
                <TableCell align="right" sx={{ px: 1.5, py: 1.25, borderBottom: 0 }}>
                  <Typography
                    component="span"
                    sx={{
                      fontSize: "0.75rem",
                      fontWeight: 500,
                      color:
                        offer.aging >= 60
                          ? "rgb(220,38,38)"
                          : offer.aging >= 30
                          ? "rgb(217,119,6)"
                          : "rgb(55,65,81)",
                    }}
                  >
                    {offer.aging}d
                  </Typography>
                </TableCell>

                {/* Sales */}
                <TableCell
                  align="right"
                  sx={{ px: 1.5, py: 1.25, fontSize: "0.75rem", fontWeight: 500, color: "rgb(55,65,81)", borderBottom: 0 }}
                >
                  {offer.sales}
                </TableCell>

                {/* Inventory */}
                <TableCell
                  align="right"
                  sx={{ px: 1.5, py: 1.25, fontSize: "0.75rem", fontWeight: 500, color: "rgb(55,65,81)", borderBottom: 0 }}
                >
                  {offer.inventory}
                </TableCell>

                {/* Monthly Payment */}
                <TableCell align="right" sx={{ px: 1.5, py: 1.25, borderBottom: 0 }}>
                  <Typography
                    component="p"
                    sx={{ fontSize: "0.75rem", fontWeight: 700, color: "rgb(17,24,39)", m: 0 }}
                  >
                    ${offer.monthlyPayment.toLocaleString()}
                  </Typography>
                  <Typography component="p" sx={{ fontSize: "0.625rem", color: "rgb(156,163,175)", m: 0 }}>
                    /mo
                  </Typography>
                </TableCell>

                {/* Term */}
                <TableCell
                  align="right"
                  sx={{ px: 1.5, py: 1.25, fontSize: "0.75rem", fontWeight: 500, color: "rgb(55,65,81)", borderBottom: 0 }}
                >
                  {offer.term} mo
                </TableCell>

                {/* Total Due at Signing */}
                <TableCell align="right" sx={{ px: 1.5, py: 1.25, borderBottom: 0 }}>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "4px" }}>
                    <Typography
                      component="p"
                      sx={{ fontSize: "0.75rem", fontWeight: 700, color: "rgb(17,24,39)", m: 0 }}
                    >
                      ${offer.totalDueAtSigning.toLocaleString()}
                    </Typography>
                    <InfoOutlinedIcon sx={{ fontSize: 10, color: "rgb(209,213,219)", flexShrink: 0 }} />
                  </Box>
                </TableCell>

                {/* Row actions */}
                <TableCell align="right" sx={{ pr: 1.5, py: 1.25, borderBottom: 0 }}>
                  <IconButton
                    size="small"
                    sx={{
                      color: "rgb(209,213,219)",
                      p: "2px",
                      "&:hover": { color: "rgb(107,114,128)" },
                    }}
                  >
                    <MoreHorizIcon sx={{ fontSize: 15 }} />
                  </IconButton>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Box>
  );
}

// ─── CtaBlock ─────────────────────────────────────────────────────────────────

function CtaBlock({
  icon,
  text,
  action,
  onClick,
}: {
  icon: React.ReactNode;
  text: string;
  action: string;
  onClick?: () => void;
}) {
  return (
    <Box
      sx={{
        bgcolor: "#fff",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        p: 2,
        display: "flex",
        flexDirection: "column",
        gap: 1.5,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
        {icon}
        <Typography sx={{ fontSize: "0.75rem", color: "text.secondary", lineHeight: 1.6 }}>
          {text}
        </Typography>
      </Box>
      <Button
        onClick={onClick}
        fullWidth
        size="small"
        sx={{
          bgcolor: "#6356E1",
          color: "#fff",
          fontSize: "0.75rem",
          fontWeight: 600,
          py: 1,
          px: 1.5,
          borderRadius: "9999px",
          textTransform: "none",
          boxShadow: "none",
          "&:hover": { bgcolor: "#5244cc", boxShadow: "none" },
        }}
      >
        {action}
      </Button>
    </Box>
  );
}
