import { useState, useMemo } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import InputBase from "@mui/material/InputBase";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import SearchIcon from "@mui/icons-material/Search";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import GlobeIcon from "@mui/icons-material/Language";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import LayersIcon from "@mui/icons-material/Layers";

import { templateLibrary, backgroundCollections } from "./lib/mock-data";

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface GeneratedAsset {
  key: string;
  offer: {
    id: string;
    make: string;
    model: string;
    trim?: string;
    year?: number;
    image?: string;
    monthlyPayment?: number;
  };
  template: {
    id: string;
    name: string;
    width?: number;
    height?: number;
    platform?: string;
  };
  bgId: string | null;
}

interface FormatGroup {
  templateId: string;
  templateName: string;
  width: number;
  height: number;
  platform: string;
  assets: GeneratedAsset[];
}

interface AdShell {
  id: string;
  assets: GeneratedAsset[];
  formats: FormatGroup[];
  bgId: string | null;
  bgName: string;
  bgNum: number;
  name: string;
}

// ─── Build shells ──────────────────────────────────────────────────────────────

function buildShells(assets: GeneratedAsset[]): AdShell[] {
  const bgMap = new Map<string, GeneratedAsset[]>();
  assets.forEach((a) => {
    const key = a.bgId ?? "none";
    if (!bgMap.has(key)) bgMap.set(key, []);
    bgMap.get(key)!.push(a);
  });

  let bgCounter = 0;
  return Array.from(bgMap.entries()).map(([bgKey, bgAssets]) => {
    bgCounter++;
    const bgId = bgKey === "none" ? null : bgKey;

    const tmplMap = new Map<string, GeneratedAsset[]>();
    bgAssets.forEach((a) => {
      if (!tmplMap.has(a.template.id)) tmplMap.set(a.template.id, []);
      tmplMap.get(a.template.id)!.push(a);
    });

    const formats: FormatGroup[] = Array.from(tmplMap.entries()).map(([tmplId, tmplAssets]) => {
      const first = tmplAssets[0];
      const tmpl = templateLibrary.find((t) => t.id === tmplId) ?? first.template;
      return {
        templateId: tmplId,
        templateName: (tmpl as any).name ?? first.template.name ?? tmplId,
        width: (tmpl as any).width ?? 0,
        height: (tmpl as any).height ?? 0,
        platform: (tmpl as any).platform ?? first.template.platform ?? "Web",
        assets: tmplAssets,
      };
    });

    const bgInfo = backgroundCollections.find((b) => b.id === bgId);
    const bgName = (bgInfo as any)?.name ?? (bgId ? `BG ${bgCounter}` : "No Background");

    return {
      id: bgKey,
      assets: bgAssets,
      formats,
      bgId,
      bgName,
      bgNum: bgCounter,
      name: `BG_${bgCounter}`,
    };
  });
}

// ─── Asset layer ───────────────────────────────────────────────────────────────

function AssetLayer({ asset, width, height }: { asset: GeneratedAsset; width: number; height: number }) {
  const isWide = !height || !width || width >= height;
  const innerW = isWide ? "100%" : `${(width / height) * 100}%`;
  const innerH = !isWide ? "100%" : `${(height / width) * 100}%`;

  return (
    <Box sx={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Box style={{ width: innerW, height: innerH, position: "relative", flexShrink: 0 }}>
        {asset.offer.image ? (
          <Box
            component="img"
            src={asset.offer.image}
            alt={asset.offer.model}
            sx={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain" }}
          />
        ) : (
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              bgcolor: "#E5E7EB",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.625rem",
              color: "text.disabled",
              fontWeight: 500,
            }}
          >
            AD
          </Box>
        )}
      </Box>
    </Box>
  );
}

// ─── Ad Shell card ─────────────────────────────────────────────────────────────

function AdShellCard({
  shell,
  selected,
  onSelect,
}: {
  shell: AdShell;
  selected: boolean;
  onSelect: (checked: boolean) => void;
}) {
  const [hover, setHover] = useState(false);
  const { assets, formats, name, bgName } = shell;
  const previewWidth = formats[0]?.width ?? 0;
  const previewHeight = formats[0]?.height ?? 0;

  return (
    <Box
      sx={{ display: "flex", flexDirection: "column", cursor: "default" }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* Thumbnail */}
      <Box
        sx={{
          position: "relative",
          borderRadius: 1.5,
          overflow: "hidden",
          transition: "all 0.2s",
          aspectRatio: "1 / 1",
          bgcolor: "#f0f2f4",
          border: `${hover || selected ? 2 : 1}px solid ${hover || selected ? "#473bab" : "#e7e7e9"}`,
        }}
      >
        {/* Default: stacked rotated layers */}
        {!hover && (
          <>
            {assets[2] && (
              <Box sx={{ position: "absolute", inset: 3, opacity: 0.4 }} style={{ transform: "rotate(-5deg)" }}>
                <AssetLayer asset={assets[2]} width={previewWidth} height={previewHeight} />
              </Box>
            )}
            {assets[1] && (
              <Box sx={{ position: "absolute", inset: 3, opacity: 0.4 }} style={{ transform: "rotate(5deg)" }}>
                <AssetLayer asset={assets[1]} width={previewWidth} height={previewHeight} />
              </Box>
            )}
            {assets[0] && (
              <Box sx={{ position: "absolute", inset: 3 }}>
                <AssetLayer asset={assets[0]} width={previewWidth} height={previewHeight} />
              </Box>
            )}
          </>
        )}

        {/* Hover: 2×2 format grid */}
        {hover && (
          <Box sx={{ position: "absolute", inset: 0, p: 1 }}>
            <Box
              sx={{
                width: "100%",
                height: "100%",
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 0.75,
              }}
            >
              {formats.slice(0, 4).map((fmt, i) => (
                <Box
                  key={fmt.templateId}
                  sx={{
                    position: "relative",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: "#fff",
                    borderRadius: 1,
                    overflow: "hidden",
                  }}
                >
                  <Typography sx={{ fontSize: "0.5625rem", fontWeight: 600, color: "#1F2937", lineHeight: 1.2, px: 0.5, textAlign: "center" }}>
                    {fmt.width && fmt.height ? `${fmt.width}×${fmt.height}` : fmt.templateName}
                  </Typography>
                  <Typography sx={{ fontSize: "0.5rem", color: "text.disabled", px: 0.5, mt: 0.25, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", width: "100%", textAlign: "center" }}>
                    {fmt.platform}
                  </Typography>
                  {i === 3 && formats.length > 4 && (
                    <>
                      <Box sx={{ position: "absolute", inset: 0, bgcolor: "rgba(0,0,0,0.5)", borderRadius: 1 }} />
                      <Box
                        component="span"
                        sx={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "1.25rem", fontWeight: 300 }}
                      >
                        +{formats.length - 4}
                      </Box>
                    </>
                  )}
                </Box>
              ))}
            </Box>
          </Box>
        )}

        {/* Auto Generated badge + format count — top right */}
        <Box sx={{ position: "absolute", top: 8, right: 8, zIndex: 10, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 0.5 }}>
          <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, px: 1, py: 0.25, borderRadius: "999px", bgcolor: "#EBF5FB" }}>
            <AutoAwesomeIcon sx={{ fontSize: 11, color: "#0277BD" }} />
            <Typography sx={{ fontSize: "0.625rem", fontWeight: 500, color: "#0277BD", whiteSpace: "nowrap", letterSpacing: "0.025em" }}>
              Auto Generated
            </Typography>
          </Box>
          {formats.length > 0 && (
            <Box sx={{ bgcolor: "rgba(0,0,0,0.6)", color: "#fff", borderRadius: "999px", px: 1, py: 0.25, fontSize: "0.625rem", fontFamily: "monospace", whiteSpace: "nowrap" }}>
              {formats.length} format{formats.length !== 1 ? "s" : ""}
            </Box>
          )}
        </Box>

        {/* Platform circle — bottom left */}
        <Box sx={{ position: "absolute", bottom: 8, left: 8, zIndex: 10 }}>
          <Box sx={{ width: 28, height: 28, borderRadius: "50%", bgcolor: "#fff", boxShadow: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <GlobeIcon sx={{ fontSize: 14, color: "text.secondary" }} />
          </Box>
        </Box>

        {/* Edit button — bottom right on hover */}
        <Box
          sx={{
            position: "absolute",
            bottom: 8,
            right: 8,
            zIndex: 10,
            opacity: hover ? 1 : 0,
            pointerEvents: hover ? "auto" : "none",
            transition: "opacity 0.2s",
          }}
        >
          <Button
            startIcon={<EditIcon sx={{ fontSize: 12 }} />}
            size="small"
            sx={{
              bgcolor: "#473bab",
              color: "#fff",
              borderRadius: "999px",
              px: 1.5,
              py: 0.5,
              fontSize: "0.75rem",
              fontWeight: 500,
              textTransform: "none",
              whiteSpace: "nowrap",
              boxShadow: 2,
              "&:hover": { bgcolor: "#3b30a0" },
            }}
          >
            Edit Ad Shell
          </Button>
        </Box>

        {/* Checkbox — top left, visible on hover or selected */}
        <Box
          sx={{
            position: "absolute",
            top: 8,
            left: 8,
            zIndex: 10,
            opacity: hover || selected ? 1 : 0,
            transition: "opacity 0.2s",
          }}
        >
          <Box
            component="button"
            onClick={(e: React.MouseEvent) => { e.stopPropagation(); onSelect(!selected); }}
            sx={{
              width: 20,
              height: 20,
              borderRadius: 0.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "2px solid",
              cursor: "pointer",
              transition: "all 0.15s",
              bgcolor: selected ? "#473bab" : "#fff",
              borderColor: selected ? "#473bab" : "#9CA3AF",
              "&:hover": { borderColor: "#473bab" },
            }}
          >
            {selected && <CheckIcon sx={{ fontSize: 11, color: "#fff", fontWeight: 700 }} />}
          </Box>
        </Box>
      </Box>

      {/* Info below thumbnail */}
      <Box sx={{ pt: 1, pb: 0.5 }}>
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 0.5 }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: "0.8125rem", color: "text.primary", lineHeight: 1.4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {name}
            </Typography>
            <Typography sx={{ fontSize: "0.6875rem", color: "#686576", mt: 0.25, letterSpacing: "0.025em" }}>
              Ad Shell&nbsp;|&nbsp;{formats.length} format{formats.length !== 1 ? "s" : ""}&nbsp;|&nbsp;{assets.length} offer{assets.length !== 1 ? "s" : ""}
            </Typography>
          </Box>
          <IconButton
            size="small"
            sx={{ flexShrink: 0, mt: 0.25, p: 0.5, borderRadius: 0.5, color: "text.secondary", "&:hover": { bgcolor: "#F3F4F6" } }}
          >
            <MoreVertIcon sx={{ fontSize: 15 }} />
          </IconButton>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mt: 0.75 }}>
          <LayersIcon sx={{ fontSize: 12, color: "#686576", flexShrink: 0 }} />
          <Typography sx={{ fontSize: "0.6875rem", color: "#686576", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {bgName}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export function AdShellsPage({
  projectId,
  projectName,
  generatedAssets,
  onNavigateTo,
}: {
  projectId: string;
  projectName: string;
  generatedAssets: GeneratedAsset[];
  onNavigateTo: (page: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const shells = useMemo(() => buildShells(generatedAssets), [generatedAssets]);

  const filtered = useMemo(
    () =>
      shells.filter(
        (s) =>
          s.name.toLowerCase().includes(query.toLowerCase()) ||
          s.bgName.toLowerCase().includes(query.toLowerCase()) ||
          s.formats.some((f) => f.templateName.toLowerCase().includes(query.toLowerCase()))
      ),
    [shells, query]
  );

  function toggleSelect(id: string, checked: boolean) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      checked ? next.add(id) : next.delete(id);
      return next;
    });
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, px: 3, py: 1.5, bgcolor: "#fff" }}>
        <Typography sx={{ fontSize: "1.125rem", fontWeight: 600, color: "text.primary" }}>
          Ad Shells
        </Typography>
        {shells.length > 0 && (
          <Typography sx={{ fontSize: "0.75rem", color: "text.disabled", ml: 0.5 }}>
            {filtered.length} Items
          </Typography>
        )}

        <Box sx={{ ml: "auto", display: "flex", alignItems: "center", gap: 1.5 }}>
          {/* Search */}
          <Box
            sx={{
              position: "relative",
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
              placeholder="Find below"
              sx={{ fontSize: "0.75rem", color: "text.primary", "& input::placeholder": { color: "text.disabled" } }}
            />
          </Box>

          <IconButton size="small" sx={{ color: "text.secondary", "&:hover": { color: "text.primary" } }}>
            <MoreVertIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Box>
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, overflowY: "auto", px: 3, py: 2.5, bgcolor: "#f0f2f4" }}>
        {filtered.length === 0 ? (
          <Box
            sx={{
              bgcolor: "#fff",
              borderRadius: 1.5,
              mx: "auto",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              py: 8,
              gap: 2,
              textAlign: "center",
              maxWidth: 480,
            }}
          >
            <Box sx={{ color: "#D1D5DB" }}>
              <Box
                component="svg"
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <rect x="2" y="3" width="20" height="14" rx="2" />
                <path d="M8 21h8M12 17v4" />
              </Box>
            </Box>
            <Box>
              <Typography sx={{ fontSize: "0.875rem", fontWeight: 500, color: "#1F2937" }}>
                {query ? "No Ad Shells match your search." : "No Ad Shells Added yet."}
              </Typography>
              {!query && (
                <Typography sx={{ fontSize: "0.8125rem", color: "text.secondary", mt: 0.5 }}>
                  Ad Shells are created automatically once Assets are generated.
                </Typography>
              )}
            </Box>
            {!query && (
              <Box
                component="button"
                onClick={() => onNavigateTo("preview")}
                sx={{
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  color: "var(--brand-accent)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  "&:hover": { color: "var(--brand-accent-hover)" },
                }}
              >
                Go to Preview →
              </Box>
            )}
          </Box>
        ) : (
          <Box
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            }}
          >
            {filtered.map((shell) => (
              <AdShellCard
                key={shell.id}
                shell={shell}
                selected={selectedIds.has(shell.id)}
                onSelect={(checked) => toggleSelect(shell.id, checked)}
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
          justifyContent: "space-between",
          px: 3,
          py: 1.5,
          bgcolor: "#fff",
          borderTop: "1px solid",
          borderColor: "divider",
        }}
      >
        <Button
          onClick={() => onNavigateTo("logos-backgrounds")}
          startIcon={<ChevronLeftIcon sx={{ fontSize: 14 }} />}
          variant="outlined"
          size="small"
          sx={{
            fontSize: "0.875rem",
            fontWeight: 500,
            color: "var(--brand-accent)",
            borderColor: "rgba(var(--brand-accent-rgb, 71 59 171) / 0.3)",
            borderRadius: "999px",
            px: 2,
            py: 0.75,
            textTransform: "none",
            "&:hover": { bgcolor: "rgba(var(--brand-accent-rgb, 71 59 171) / 0.05)", borderColor: "var(--brand-accent)" },
          }}
        >
          Styles &amp; Backgrounds
        </Button>

        <Button
          onClick={() => onNavigateTo("campaigns")}
          endIcon={<ChevronRightIcon sx={{ fontSize: 14 }} />}
          variant="outlined"
          size="small"
          sx={{
            fontSize: "0.875rem",
            fontWeight: 500,
            color: "var(--brand-accent)",
            borderColor: "rgba(var(--brand-accent-rgb, 71 59 171) / 0.3)",
            borderRadius: "999px",
            px: 2,
            py: 0.75,
            textTransform: "none",
            "&:hover": { bgcolor: "rgba(var(--brand-accent-rgb, 71 59 171) / 0.05)", borderColor: "var(--brand-accent)" },
          }}
        >
          Campaigns
        </Button>
      </Box>
    </Box>
  );
}
