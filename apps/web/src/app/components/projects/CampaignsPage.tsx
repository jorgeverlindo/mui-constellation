import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import InputBase from "@mui/material/InputBase";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import MenuItem from "@mui/material/MenuItem";
import Menu from "@mui/material/Menu";
import Chip from "@mui/material/Chip";
import SearchIcon from "@mui/icons-material/Search";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import AddIcon from "@mui/icons-material/Add";
import CampaignIcon from "@mui/icons-material/Campaign";
import GlobeIcon from "@mui/icons-material/Language";
import CalendarIcon from "@mui/icons-material/CalendarToday";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import DeleteIcon from "@mui/icons-material/Delete";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

// ─── Types ─────────────────────────────────────────────────────────────────────

type CampaignStatus = "Draft" | "Scheduled" | "Active" | "Ended";

interface Campaign {
  id: string;
  name: string;
  platform: string;
  status: CampaignStatus;
  startDate: string;
  endDate: string;
  adShellCount: number;
}

// ─── Status chip ───────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<CampaignStatus, { bgcolor: string; color: string }> = {
  Draft:     { bgcolor: "#F3F4F6", color: "#6B7280" },
  Scheduled: { bgcolor: "#FFF7ED", color: "#C2410C" },
  Active:    { bgcolor: "#F0FDF4", color: "#15803D" },
  Ended:     { bgcolor: "#F3F4F6", color: "#9CA3AF" },
};

function StatusChip({ status }: { status: CampaignStatus }) {
  const colors = STATUS_COLORS[status];
  return (
    <Chip
      label={status}
      size="small"
      sx={{
        height: 20,
        fontSize: "0.625rem",
        fontWeight: 500,
        bgcolor: colors.bgcolor,
        color: colors.color,
        borderRadius: "999px",
        "& .MuiChip-label": { px: 1 },
      }}
    />
  );
}

// ─── Campaign card ─────────────────────────────────────────────────────────────

function CampaignCard({ campaign, onDelete }: { campaign: Campaign; onDelete: () => void }) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);

  return (
    <Box
      sx={{
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "#fff",
        overflow: "hidden",
        transition: "box-shadow 0.2s",
        "&:hover": { boxShadow: 1 },
        "&:hover .more-btn": { opacity: 1 },
      }}
    >
      {/* Accent bar */}
      <Box sx={{ height: 6, width: "100%", background: "linear-gradient(90deg, var(--brand-accent), var(--brand-mid, #6356E1))" }} />

      <Box sx={{ px: 2, py: 1.5, display: "flex", flexDirection: "column", gap: 1.25 }}>
        {/* Title row */}
        <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.25, minWidth: 0 }}>
            <Typography sx={{ fontSize: "0.8125rem", fontWeight: 600, color: "text.primary", lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {campaign.name}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
              <GlobeIcon sx={{ fontSize: 11, color: "text.disabled", flexShrink: 0 }} />
              <Typography sx={{ fontSize: "0.6875rem", color: "text.secondary" }}>
                {campaign.platform}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexShrink: 0 }}>
            <StatusChip status={campaign.status} />
            <Box sx={{ position: "relative" }}>
              <IconButton
                className="more-btn"
                size="small"
                onClick={(e) => setAnchorEl(e.currentTarget)}
                sx={{
                  opacity: 0,
                  width: 24,
                  height: 24,
                  color: "text.disabled",
                  borderRadius: 0.5,
                  transition: "opacity 0.15s",
                  "&:hover": { bgcolor: "#F3F4F6" },
                }}
              >
                <MoreVertIcon sx={{ fontSize: 13 }} />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={menuOpen}
                onClose={() => setAnchorEl(null)}
                elevation={3}
                PaperProps={{
                  sx: { borderRadius: 2, border: "1px solid", borderColor: "divider", minWidth: 140, py: 0.75 },
                }}
              >
                <MenuItem
                  onClick={() => setAnchorEl(null)}
                  sx={{ fontSize: "0.75rem", color: "text.primary", gap: 1, py: 0.75 }}
                >
                  <OpenInNewIcon sx={{ fontSize: 11 }} />
                  View Campaign
                </MenuItem>
                <MenuItem
                  onClick={() => { setAnchorEl(null); onDelete(); }}
                  sx={{ fontSize: "0.75rem", color: "error.main", gap: 1, py: 0.75, "&:hover": { bgcolor: "#FEF2F2" } }}
                >
                  <DeleteIcon sx={{ fontSize: 11 }} />
                  Delete
                </MenuItem>
              </Menu>
            </Box>
          </Box>
        </Box>

        {/* Date row */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
          <CalendarIcon sx={{ fontSize: 11, color: "text.disabled", flexShrink: 0 }} />
          <Typography sx={{ fontSize: "0.6875rem", color: "text.secondary" }}>
            {campaign.startDate} – {campaign.endDate}
          </Typography>
        </Box>

        {/* Ad shell count */}
        <Typography sx={{ fontSize: "0.6875rem", color: "text.disabled" }}>
          {campaign.adShellCount} ad shell{campaign.adShellCount !== 1 ? "s" : ""}
        </Typography>
      </Box>
    </Box>
  );
}

// ─── New campaign dialog ───────────────────────────────────────────────────────

function NewCampaignDialog({
  projectName,
  onSave,
  onCancel,
}: {
  projectName: string;
  onSave: (c: Omit<Campaign, "id">) => void;
  onCancel: () => void;
}) {
  const [name, setName]           = useState(`${projectName} Campaign`);
  const [platform, setPlatform]   = useState("Facebook");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate]     = useState("");

  const inputSx = {
    width: "100%",
    px: 1.5,
    py: 1,
    fontSize: "0.8125rem",
    borderRadius: 1.5,
    border: "1px solid",
    borderColor: "divider",
    bgcolor: "#fff",
    "&:focus-within": { borderColor: "var(--brand-accent)", outline: "none" },
  } as const;

  const labelSx = {
    fontSize: "0.6875rem",
    fontWeight: 500,
    color: "text.secondary",
    textTransform: "uppercase" as const,
    letterSpacing: "0.05em",
  };

  return (
    <Dialog
      open
      onClose={onCancel}
      PaperProps={{
        sx: {
          borderRadius: 3,
          p: 3,
          width: 400,
          maxWidth: "calc(100vw - 32px)",
          display: "flex",
          flexDirection: "column",
          gap: 2,
          boxShadow: "0 25px 50px rgba(0,0,0,0.15)",
        },
      }}
      BackdropProps={{ sx: { backdropFilter: "blur(2px)", bgcolor: "rgba(0,0,0,0.3)" } }}
    >
      <DialogContent sx={{ p: 0, display: "flex", flexDirection: "column", gap: 2 }}>
        {/* Dialog header */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              bgcolor: "rgba(var(--brand-accent-rgb, 71 59 171) / 0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CampaignIcon sx={{ fontSize: 16, color: "var(--brand-accent)" }} />
          </Box>
          <Typography sx={{ fontSize: "0.9375rem", fontWeight: 600, color: "text.primary" }}>
            New Campaign
          </Typography>
        </Box>

        {/* Form fields */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {/* Campaign name */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
            <Typography sx={labelSx}>Campaign name</Typography>
            <Box sx={inputSx}>
              <InputBase
                value={name}
                onChange={(e) => setName(e.target.value)}
                fullWidth
                sx={{ fontSize: "0.8125rem" }}
              />
            </Box>
          </Box>

          {/* Platform */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
            <Typography sx={labelSx}>Platform</Typography>
            <Box sx={inputSx}>
              <InputBase
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                placeholder="e.g. Facebook, Google, Display…"
                fullWidth
                sx={{ fontSize: "0.8125rem" }}
              />
            </Box>
          </Box>

          {/* Dates */}
          <Box sx={{ display: "flex", gap: 1.5 }}>
            <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 0.5 }}>
              <Typography sx={labelSx}>Start date</Typography>
              <Box sx={inputSx}>
                <InputBase
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  fullWidth
                  sx={{ fontSize: "0.8125rem" }}
                />
              </Box>
            </Box>
            <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 0.5 }}>
              <Typography sx={labelSx}>End date</Typography>
              <Box sx={inputSx}>
                <InputBase
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  fullWidth
                  sx={{ fontSize: "0.8125rem" }}
                />
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Actions */}
        <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end", pt: 0.5 }}>
          <Button
            onClick={onCancel}
            variant="outlined"
            size="small"
            sx={{
              px: 2,
              py: 1,
              borderRadius: "999px",
              fontSize: "0.8125rem",
              fontWeight: 500,
              color: "text.secondary",
              borderColor: "divider",
              textTransform: "none",
              "&:hover": { bgcolor: "#F9FAFB" },
            }}
          >
            Cancel
          </Button>
          <Button
            disabled={!name.trim()}
            onClick={() =>
              onSave({
                name: name.trim(),
                platform: platform.trim() || "Web",
                status: "Draft",
                startDate: startDate || "TBD",
                endDate: endDate || "TBD",
                adShellCount: 0,
              })
            }
            variant="contained"
            size="small"
            sx={{
              px: 2,
              py: 1,
              borderRadius: "999px",
              fontSize: "0.8125rem",
              fontWeight: 600,
              color: "#fff",
              bgcolor: "var(--brand-accent)",
              textTransform: "none",
              boxShadow: "none",
              "&:hover": { bgcolor: "var(--brand-accent-hover, #3b30a0)", boxShadow: "none" },
              "&.Mui-disabled": { opacity: 0.4 },
            }}
          >
            Create Campaign
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export function CampaignsPage({
  projectId,
  projectName,
  onNavigateTo,
}: {
  projectId: string;
  projectName: string;
  onNavigateTo: (page: string) => void;
}) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [query, setQuery]         = useState("");
  const [showNew, setShowNew]     = useState(false);

  const filtered = campaigns.filter((c) =>
    c.name.toLowerCase().includes(query.toLowerCase())
  );

  function addCampaign(data: Omit<Campaign, "id">) {
    setCampaigns((prev) => [...prev, { ...data, id: `camp-${prev.length + 1}` }]);
    setShowNew(false);
  }

  const navBtnSx = {
    fontSize: "0.875rem",
    fontWeight: 500,
    color: "var(--brand-accent)",
    borderColor: "rgba(var(--brand-accent-rgb, 71 59 171) / 0.3)",
    borderRadius: "999px",
    px: 2,
    py: 0.75,
    textTransform: "none" as const,
    "&:hover": {
      bgcolor: "rgba(var(--brand-accent-rgb, 71 59 171) / 0.05)",
      borderColor: "var(--brand-accent)",
    },
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, px: 3, py: 1.5, bgcolor: "#fff" }}>
        <Typography sx={{ fontSize: "1.125rem", fontWeight: 600, color: "text.primary" }}>
          Campaigns
        </Typography>

        <Box sx={{ ml: "auto", display: "flex", alignItems: "center", gap: 1.5 }}>
          {/* Search */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              border: "1px solid",
              borderColor: "divider",
              borderRadius: "999px",
              px: 1.5,
              py: 0.5,
              bgcolor: "#fff",
            }}
          >
            <SearchIcon sx={{ fontSize: 13, color: "text.disabled", mr: 0.5 }} />
            <InputBase
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Find campaigns…"
              sx={{ fontSize: "0.75rem", color: "text.primary", "& input::placeholder": { color: "text.disabled" } }}
            />
          </Box>

          {/* New Campaign button */}
          <Button
            onClick={() => setShowNew(true)}
            startIcon={<AddIcon sx={{ fontSize: 13 }} />}
            variant="outlined"
            size="small"
            sx={navBtnSx}
          >
            New Campaign
          </Button>
        </Box>
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, overflowY: "auto", px: 3, py: 2.5 }}>
        {filtered.length === 0 ? (
          <Box
            sx={{
              bgcolor: "#fff",
              border: "2px dashed",
              borderColor: "divider",
              borderRadius: 2,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              py: 6,
              gap: 1.5,
            }}
          >
            <Box sx={{ color: "#D1D5DB" }}>
              <CampaignIcon sx={{ fontSize: 28, strokeWidth: 1.5 }} />
            </Box>
            <Typography sx={{ fontSize: "0.875rem", color: "text.disabled" }}>
              {query ? "No campaigns match your search." : "No campaigns yet."}
            </Typography>
            {!query && (
              <Button
                onClick={() => setShowNew(true)}
                startIcon={<AddIcon sx={{ fontSize: 13 }} />}
                variant="outlined"
                size="small"
                sx={navBtnSx}
              >
                New Campaign
              </Button>
            )}
          </Box>
        ) : (
          <Box
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            }}
          >
            {filtered.map((c) => (
              <CampaignCard
                key={c.id}
                campaign={c}
                onDelete={() => setCampaigns((prev) => prev.filter((x) => x.id !== c.id))}
              />
            ))}
          </Box>
        )}
      </Box>

      {/* Footer nav */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          px: 3,
          py: 1.5,
          bgcolor: "#fff",
          borderTop: "1px solid",
          borderColor: "divider",
        }}
      >
        <Button
          onClick={() => onNavigateTo("adshells")}
          startIcon={<ChevronLeftIcon sx={{ fontSize: 14 }} />}
          variant="outlined"
          size="small"
          sx={navBtnSx}
        >
          Ad Shells
        </Button>
      </Box>

      {showNew && (
        <NewCampaignDialog
          projectName={projectName}
          onSave={addCampaign}
          onCancel={() => setShowNew(false)}
        />
      )}
    </Box>
  );
}
