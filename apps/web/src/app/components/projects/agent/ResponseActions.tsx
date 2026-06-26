"use client";

import { useState } from "react";
import { Box, Tooltip } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ThumbUpOutlinedIcon from "@mui/icons-material/ThumbUpOutlined";
import ThumbDownOutlinedIcon from "@mui/icons-material/ThumbDownOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";

// ─── Response action bar ───────────────────────────────────────────────────────
export function ResponseActions({ text }: { text: string }) {
  const [liked,  setLiked]  = useState<boolean | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleDownload = () => {
    const blob = new Blob([text], { type: "text/plain" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url;
    a.download = "constellation-response.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleShare = () => {
    if (navigator.share) navigator.share({ text }).catch(() => {});
    else handleCopy();
  };

  const btnSx = {
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
    transition: "background 0.15s, color 0.15s",
    "&:hover": {
      background: "rgba(0,0,0,0.06)",
      color: "var(--ink-secondary)",
    },
  };

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: "1px", mt: "6px", ml: "32px" }}>
      <Tooltip title="Copy" placement="bottom">
        <Box component="button" onClick={handleCopy} sx={btnSx}>
          {copied
            ? <CheckIcon sx={{ fontSize: 12, color: "#2e9c5e" }} />
            : <ContentCopyIcon sx={{ fontSize: 12 }} />}
        </Box>
      </Tooltip>

      <Tooltip title="Like" placement="bottom">
        <Box
          component="button"
          onClick={() => setLiked(liked === true ? null : true)}
          sx={{
            ...btnSx,
            ...(liked === true ? { color: "var(--brand-accent)" } : {}),
          }}
        >
          <ThumbUpOutlinedIcon sx={{ fontSize: 12 }} />
        </Box>
      </Tooltip>

      <Tooltip title="Dislike" placement="bottom">
        <Box
          component="button"
          onClick={() => setLiked(liked === false ? null : false)}
          sx={{
            ...btnSx,
            ...(liked === false ? { color: "#dc2626" } : {}),
          }}
        >
          <ThumbDownOutlinedIcon sx={{ fontSize: 12 }} />
        </Box>
      </Tooltip>

      <Tooltip title="Edit" placement="bottom">
        <Box component="button" sx={btnSx}>
          <EditOutlinedIcon sx={{ fontSize: 12 }} />
        </Box>
      </Tooltip>

      <Tooltip title="Download" placement="bottom">
        <Box component="button" onClick={handleDownload} sx={btnSx}>
          <DownloadOutlinedIcon sx={{ fontSize: 12 }} />
        </Box>
      </Tooltip>

      <Tooltip title="Share" placement="bottom">
        <Box component="button" onClick={handleShare} sx={btnSx}>
          <ShareOutlinedIcon sx={{ fontSize: 12 }} />
        </Box>
      </Tooltip>
    </Box>
  );
}
