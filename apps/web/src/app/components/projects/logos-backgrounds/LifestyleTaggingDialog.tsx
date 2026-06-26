import { useState, useEffect } from "react";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import ButtonBase from "@mui/material/ButtonBase";
import IconButton from "@mui/material/IconButton";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import CloseIcon from "@mui/icons-material/Close";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import type { BackgroundCollection } from "./BackgroundCollectionCard";
import type { DetectedVehicle } from "../lib/api-client";
import { identifyVehicleWithAnthropic } from "../lib/api-client";
import { suggestVehicleTag } from "../lib/lifestyle-data";
import { templateLibrary } from "../lib/mock-data";

// ─── Template size options ─────────────────────────────────────────────────────

const TEMPLATE_OPTIONS = templateLibrary.map((t) => ({
  id: t.id,
  label: `${t.width}×${t.height}`,
  sublabel: t.format,
  width: t.width,
  height: t.height,
}));

function detectTemplateId(imgWidth: number, imgHeight: number): string | null {
  const exact = TEMPLATE_OPTIONS.find(
    (t) => t.width === imgWidth && t.height === imgHeight
  );
  if (exact) return exact.id;
  const ratio = imgWidth / imgHeight;
  let best: (typeof TEMPLATE_OPTIONS)[0] | null = null;
  let bestDiff = Infinity;
  for (const t of TEMPLATE_OPTIONS) {
    const diff = Math.abs(t.width / t.height - ratio);
    if (diff < bestDiff) { bestDiff = diff; best = t; }
  }
  return best?.id ?? null;
}

// ─── VehicleTagRow ─────────────────────────────────────────────────────────────

const KNOWN_TAGS = [
  { value: "CRV-Trailsport", label: "CR-V TrailSport" },
  { value: "CRV-LX",         label: "CR-V LX" },
  { value: "CRV",            label: "CR-V (generic)" },
  { value: "HRV",            label: "HR-V" },
  { value: "Civic",          label: "Civic" },
];

function VehicleTagRow({
  vehicle,
  tag,
  onTagChange,
}: {
  vehicle: DetectedVehicle;
  tag: string | null;
  onTagChange: (tag: string | null) => void;
}) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const label = [vehicle.year, vehicle.make, vehicle.model, vehicle.trim]
    .filter(Boolean)
    .join(" ");

  const knownTag = KNOWN_TAGS.find((k) => k.value === tag);

  const confidenceColor =
    vehicle.confidence === "high"
      ? { color: "success.dark", bgcolor: "#F0FDF4" }
      : vehicle.confidence === "medium"
      ? { color: "warning.dark", bgcolor: "#FFFBEB" }
      : { color: "error.dark", bgcolor: "#FEF2F2" };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        py: 1.5,
        borderBottom: "1px solid",
        borderColor: "divider",
        "&:last-child": { borderBottom: 0 },
      }}
    >
      {/* Vehicle info */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          sx={{
            fontSize: "0.875rem",
            fontWeight: 600,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {label}
        </Typography>
        <Box
          component="span"
          sx={{
            display: "inline-block",
            mt: "2px",
            fontSize: "10px",
            fontWeight: 500,
            px: 1,
            py: "2px",
            borderRadius: "9999px",
            ...confidenceColor,
          }}
        >
          {vehicle.confidence} confidence
        </Box>
      </Box>

      {/* Tag selector */}
      <Box sx={{ position: "relative", flexShrink: 0 }}>
        <ButtonBase
          onClick={(e) => setAnchorEl(e.currentTarget)}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.75,
            fontSize: "12px",
            fontWeight: 500,
            px: 1.5,
            py: 0.75,
            borderRadius: "9999px",
            border: "1px solid",
            ...(tag
              ? { bgcolor: "#F5F3FF", borderColor: "#C4B5FD", color: "#6D28D9" }
              : { bgcolor: "#FFFBEB", borderColor: "#FCD34D", color: "#D97706" }),
            transition: "all 0.2s",
          }}
        >
          {tag ? (
            <>
              <CheckCircleIcon sx={{ fontSize: 12 }} />
              {knownTag?.label ?? tag}
            </>
          ) : (
            <>
              <WarningAmberIcon sx={{ fontSize: 12 }} />
              No tag matched
            </>
          )}
          <ExpandMoreIcon sx={{ fontSize: 11 }} />
        </ButtonBase>

        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={() => setAnchorEl(null)}
          slotProps={{
            paper: {
              sx: {
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider",
                boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                minWidth: 180,
              },
            },
          }}
        >
          <MenuItem
            onClick={() => { onTagChange(null); setAnchorEl(null); }}
            sx={{
              fontSize: "12px",
              color: !tag ? "warning.dark" : "text.secondary",
              fontWeight: !tag ? 600 : 400,
              bgcolor: !tag ? "#FFFBEB" : "transparent",
            }}
          >
            None
          </MenuItem>
          <Box sx={{ borderTop: "1px solid", borderColor: "divider", my: 0.5 }} />
          {KNOWN_TAGS.map((k) => (
            <MenuItem
              key={k.value}
              onClick={() => { onTagChange(k.value); setAnchorEl(null); }}
              sx={{
                fontSize: "12px",
                color: tag === k.value ? "#6D28D9" : "text.primary",
                fontWeight: tag === k.value ? 600 : 400,
                bgcolor: tag === k.value ? "#F5F3FF" : "transparent",
              }}
            >
              {k.label}
            </MenuItem>
          ))}
        </Menu>
      </Box>
    </Box>
  );
}

// ─── LifestyleTaggingDialog ────────────────────────────────────────────────────

interface LifestyleTaggingDialogProps {
  file: File;
  imageUrl: string;
  onConfirm: (bg: BackgroundCollection) => void;
  onCancel: () => void;
}

type Stage = "detecting" | "review" | "error";

export function LifestyleTaggingDialog({
  file,
  imageUrl,
  onConfirm,
  onCancel,
}: LifestyleTaggingDialogProps) {
  const [stage, setStage] = useState<Stage>("detecting");
  const [vehicles, setVehicles] = useState<DetectedVehicle[]>([]);
  const [tags, setTags] = useState<(string | null)[]>([]);
  const [templateId, setTemplateId] = useState<string | null>(null);
  const [imgDims, setImgDims] = useState<{ w: number; h: number } | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [templateAnchorEl, setTemplateAnchorEl] = useState<null | HTMLElement>(null);
  const templateOpen = Boolean(templateAnchorEl);

  // Detect image dimensions and auto-select template
  useEffect(() => {
    const img = new window.Image();
    img.onload = () => {
      const dims = { w: img.naturalWidth, h: img.naturalHeight };
      setImgDims(dims);
      setTemplateId(detectTemplateId(dims.w, dims.h));
    };
    img.src = imageUrl;
  }, [imageUrl]);

  // Call the API
  useEffect(() => {
    async function identify() {
      try {
        const reader = new FileReader();
        reader.onload = async () => {
          const dataUrl = reader.result as string;
          const [header, base64] = dataUrl.split(",");
          const mediaType = header.match(/data:([^;]+)/)?.[1] ?? "image/png";

          const detected = await identifyVehicleWithAnthropic(base64, mediaType);
          setVehicles(detected);
          setTags(detected.map((v: DetectedVehicle) => suggestVehicleTag(v.model, v.trim)));
          setStage("review");
        };
        reader.readAsDataURL(file);
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : "Unknown error");
        setStage("error");
      }
    }
    identify();
  }, [file]);

  function handleConfirm() {
    const activeTags = tags.filter(Boolean) as string[];
    const isMulti = activeTags.length > 1;
    const id = `lifestyle-upload-${Date.now()}`;
    const name = vehicles.map((v) => [v.model, v.trim].filter(Boolean).join(" ")).join(" + ") || file.name.replace(/\.[^.]+$/, "");

    const bg: BackgroundCollection = {
      id,
      name,
      type: "Lifestyle",
      isLifestyle: true,
      ...(isMulti ? { vehicleTags: activeTags } : { vehicleTag: activeTags[0] ?? undefined }),
      sizes: 1,
      folder: "Uploads",
      color: "#6b7a8d",
      thumbnail: imageUrl,
      images: templateId ? { [templateId]: imageUrl } : {},
    };

    onConfirm(bg);
  }

  const selectedTemplate = TEMPLATE_OPTIONS.find((t) => t.id === templateId);
  const canConfirm = tags.some(Boolean) && templateId;

  return (
    <Dialog
      open
      onClose={onCancel}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: { borderRadius: 3, overflow: "hidden", maxHeight: "90vh" },
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 2.5,
          py: 2,
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <AutoAwesomeIcon sx={{ fontSize: 16, color: "#7C3AED" }} />
          <Typography sx={{ fontSize: "1rem", fontWeight: 600 }}>
            Identify Lifestyle Image
          </Typography>
        </Box>
        <IconButton onClick={onCancel} size="small" sx={{ color: "text.secondary" }}>
          <CloseIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0, overflow: "hidden auto" }}>
        {/* Image preview */}
        <Box
          sx={{
            bgcolor: "#111827",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            maxHeight: 260,
          }}
        >
          <Box
            component="img"
            src={imageUrl}
            alt="Lifestyle preview"
            sx={{ width: "100%", objectFit: "contain", maxHeight: 260 }}
          />
        </Box>

        <Box sx={{ px: 2.5, py: 2, display: "flex", flexDirection: "column", gap: 2.5 }}>
          {/* Detecting state */}
          {stage === "detecting" && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                py: 4,
                gap: 1.5,
              }}
            >
              <CircularProgress size={32} sx={{ color: "#7C3AED" }} />
              <Typography sx={{ fontSize: "0.875rem", color: "text.secondary" }}>
                Identifying vehicles with AI…
              </Typography>
            </Box>
          )}

          {/* Error state */}
          {stage === "error" && (
            <Box
              sx={{
                display: "flex",
                alignItems: "flex-start",
                gap: 1.5,
                p: 2,
                bgcolor: "#FEF2F2",
                borderRadius: 2,
                border: "1px solid #FEE2E2",
              }}
            >
              <WarningAmberIcon sx={{ fontSize: 16, color: "error.main", mt: "2px", flexShrink: 0 }} />
              <Box>
                <Typography sx={{ fontSize: "0.875rem", fontWeight: 600, color: "error.dark" }}>
                  Identification failed
                </Typography>
                <Typography sx={{ fontSize: "0.75rem", color: "error.main", mt: "2px" }}>
                  {errorMsg}
                </Typography>
              </Box>
            </Box>
          )}

          {/* Review state */}
          {stage === "review" && (
            <>
              {/* Vehicle list */}
              <Box>
                <Typography
                  sx={{
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: "text.secondary",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    mb: 1,
                  }}
                >
                  Detected vehicles · {vehicles.length}
                </Typography>
                {vehicles.length === 0 ? (
                  <Typography
                    sx={{
                      fontSize: "0.875rem",
                      color: "text.secondary",
                      py: 2,
                      textAlign: "center",
                    }}
                  >
                    No vehicles detected in this image.
                  </Typography>
                ) : (
                  <Box>
                    {vehicles.map((v, i) => (
                      <VehicleTagRow
                        key={i}
                        vehicle={v}
                        tag={tags[i] ?? null}
                        onTagChange={(t) => setTags((prev) => prev.map((p, j) => j === i ? t : p))}
                      />
                    ))}
                  </Box>
                )}
              </Box>

              {/* Template size */}
              <Box>
                <Typography
                  sx={{
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: "text.secondary",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    mb: 1,
                  }}
                >
                  Template size
                  {imgDims && (
                    <Box
                      component="span"
                      sx={{ ml: 1, fontWeight: 400, textTransform: "none", color: "text.disabled" }}
                    >
                      (image: {imgDims.w}×{imgDims.h})
                    </Box>
                  )}
                </Typography>
                <ButtonBase
                  onClick={(e) => setTemplateAnchorEl(e.currentTarget)}
                  sx={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    border: "1px solid",
                    borderColor: templateId ? "divider" : "#FCD34D",
                    borderRadius: 1.5,
                    px: 1.5,
                    py: 1,
                    bgcolor: templateId ? "#fff" : "#FFFBEB",
                    fontSize: "0.875rem",
                    justifyContent: "flex-start",
                    transition: "all 0.2s",
                  }}
                >
                  {selectedTemplate ? (
                    <>
                      <Typography sx={{ fontWeight: 500, fontSize: "0.875rem" }}>
                        {selectedTemplate.label}
                      </Typography>
                      <Typography sx={{ fontSize: "0.75rem", color: "text.secondary" }}>
                        {selectedTemplate.sublabel}
                      </Typography>
                    </>
                  ) : (
                    <Typography sx={{ color: "#D97706", fontSize: "0.875rem" }}>
                      Select template size…
                    </Typography>
                  )}
                  <ExpandMoreIcon sx={{ ml: "auto", fontSize: 13, color: "text.secondary", flexShrink: 0 }} />
                </ButtonBase>
                <Menu
                  anchorEl={templateAnchorEl}
                  open={templateOpen}
                  onClose={() => setTemplateAnchorEl(null)}
                  slotProps={{
                    paper: {
                      sx: {
                        borderRadius: 2,
                        border: "1px solid",
                        borderColor: "divider",
                        boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                        maxHeight: 208,
                        overflow: "auto",
                      },
                    },
                  }}
                >
                  {TEMPLATE_OPTIONS.map((t) => (
                    <MenuItem
                      key={t.id}
                      onClick={() => { setTemplateId(t.id); setTemplateAnchorEl(null); }}
                      sx={{
                        display: "flex",
                        gap: 1.5,
                        bgcolor: templateId === t.id ? "rgba(71,59,171,0.08)" : "transparent",
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: "0.875rem",
                          fontWeight: 500,
                          color: templateId === t.id ? "#473bab" : "text.primary",
                        }}
                      >
                        {t.label}
                      </Typography>
                      <Typography sx={{ fontSize: "0.75rem", color: "text.secondary" }}>
                        {t.sublabel}
                      </Typography>
                    </MenuItem>
                  ))}
                </Menu>
              </Box>
            </>
          )}
        </Box>
      </DialogContent>

      {/* Footer */}
      <DialogActions
        sx={{
          px: 2.5,
          py: 1.5,
          borderTop: "1px solid",
          borderColor: "divider",
          gap: 1.5,
        }}
      >
        <Button
          onClick={onCancel}
          variant="outlined"
          sx={{
            fontSize: "0.875rem",
            fontWeight: 500,
            borderRadius: 1.5,
            px: 2.5,
            py: 1,
            color: "text.secondary",
            borderColor: "divider",
          }}
        >
          Cancel
        </Button>
        {stage === "review" && (
          <Button
            onClick={handleConfirm}
            disabled={!canConfirm}
            variant="contained"
            startIcon={<AutoAwesomeIcon sx={{ fontSize: 14 }} />}
            sx={{
              fontSize: "0.875rem",
              fontWeight: 600,
              borderRadius: 1.5,
              px: 2.5,
              py: 1,
              bgcolor: "#7C3AED",
              "&:hover": { bgcolor: "#6D28D9" },
              "&:disabled": { opacity: 0.4, cursor: "not-allowed" },
            }}
          >
            Add as Lifestyle Image
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
