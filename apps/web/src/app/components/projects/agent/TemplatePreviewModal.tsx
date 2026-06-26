"use client";

import { Box, Dialog, DialogContent, Fade, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";

// ─── Template Preview Modal ────────────────────────────────────────────────────
export type TemplateInfo = { id: string; name: string; format: string; width: number; height: number; brand: string };

export function TemplatePreviewModal({ template, onClose }: { template: TemplateInfo | null; onClose: () => void }) {
  // Scale the template dimensions into a preview box (max 260×140)
  const maxW = 260; const maxH = 140;
  const scaleW = template ? maxW / template.width  : 1;
  const scaleH = template ? maxH / template.height : 1;
  const scale  = Math.min(scaleW, scaleH, 1);
  const pw = template ? Math.round(template.width  * scale) : 0;
  const ph = template ? Math.round(template.height * scale) : 0;

  return (
    <Dialog
      open={!!template}
      onClose={onClose}
      TransitionComponent={Fade}
      transitionDuration={150}
      PaperProps={{
        sx: {
          width: 300,
          borderRadius: "16px",
          overflow: "hidden",
          boxShadow: "0 24px 64px rgba(0,0,0,0.22)",
          m: "16px",
        },
      }}
      slotProps={{
        backdrop: {
          sx: {
            background: "rgba(0,0,0,0.42)",
            backdropFilter: "blur(2px)",
          },
        },
      }}
    >
      {template && (
        <>
          {/* Header */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              px: "16px",
              pt: "14px",
              pb: "10px",
              borderBottom: "1px solid rgba(0,0,0,0.06)",
            }}
          >
            <Box>
              <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: "var(--ink)" }}>
                {template.name}
              </Typography>
              <Typography sx={{ fontSize: 10.5, color: "var(--ink-secondary)", mt: "1px" }}>
                {template.brand} · {template.format}
              </Typography>
            </Box>
            <Box
              component="button"
              onClick={onClose}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 26,
                height: 26,
                borderRadius: "50%",
                border: "none",
                background: "transparent",
                cursor: "pointer",
                color: "var(--ink-tertiary)",
                transition: "background 0.15s",
                "&:hover": { background: "rgba(0,0,0,0.06)" },
              }}
            >
              <CloseIcon sx={{ fontSize: 13 }} />
            </Box>
          </Box>

          {/* Preview canvas */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              px: "16px",
              py: "16px",
              background: "#f7f7fb",
            }}
          >
            <Box
              sx={{
                width: pw,
                height: ph,
                background: "linear-gradient(135deg, rgba(71,59,171,0.07) 0%, rgba(99,86,225,0.14) 100%)",
                border: "1.5px dashed rgba(71,59,171,0.28)",
                borderRadius: "6px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "5px",
              }}
            >
              <DescriptionOutlinedIcon
                sx={{
                  fontSize: Math.max(16, Math.min(32, pw * 0.12)),
                  color: "rgba(71,59,171,0.45)",
                }}
              />
              <Typography
                sx={{
                  fontSize: 8.5,
                  color: "rgba(71,59,171,0.55)",
                  letterSpacing: "0.6px",
                  textTransform: "uppercase",
                }}
              >
                {template.width}×{template.height}
              </Typography>
            </Box>
          </Box>

          {/* Details */}
          <Box sx={{ px: "16px", pb: "16px", display: "flex", flexDirection: "column", gap: "6px" }}>
            {([
              ["Format",     template.format],
              ["Dimensions", `${template.width} × ${template.height} px`],
              ["Brand",      template.brand],
            ] as [string, string][]).map(([label, value]) => (
              <Box key={label} sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Typography sx={{ fontSize: 11, color: "var(--ink-tertiary)", fontWeight: 500 }}>
                  {label}
                </Typography>
                <Typography sx={{ fontSize: 11, color: "var(--ink)" }}>
                  {value}
                </Typography>
              </Box>
            ))}
          </Box>
        </>
      )}
    </Dialog>
  );
}
