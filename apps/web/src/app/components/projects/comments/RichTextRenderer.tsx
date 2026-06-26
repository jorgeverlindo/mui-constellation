// ─── RichTextRenderer ────────────────────────────────────────────────────────
// Safely renders sanitized HTML from comments / replies.
// Mention spans (data-mention-id) are styled in brand purple.
// Never call dangerouslySetInnerHTML without DOMPurify — sanitizeHtml() handles it.

import React from "react";
import Box from "@mui/material/Box";
import type { SxProps, Theme } from "@mui/material/styles";
import { sanitizeHtml } from "./utils";

interface RichTextRendererProps {
  html: string;
  sx?: SxProps<Theme>;
  // className kept for backward compat but not used with MUI sx
  className?: string;
}

export function RichTextRenderer({ html, sx }: RichTextRendererProps) {
  const clean = sanitizeHtml(html);
  return (
    <Box
      sx={{
        fontSize: 13,
        lineHeight: 1.5,
        color: "#1f1d25",
        wordBreak: "break-word",
        // Mention chips: purple, slightly bold
        "& [data-mention-id]": {
          color: "#473bab",
          fontWeight: 500,
          cursor: "default",
        },
        // Inline formatting
        "& strong, & b": { fontWeight: 600 },
        "& em, & i": { fontStyle: "italic" },
        "& u": { textDecoration: "underline" },
        "& s, & strike": { textDecoration: "line-through" },
        "& a": { color: "#473bab", textDecoration: "underline" },
        "& ul": { listStyleType: "disc", pl: "20px", my: 0.5 },
        "& ol": { listStyleType: "decimal", pl: "20px", my: 0.5 },
        "& p": { mb: 0 },
        ...sx,
      }}
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
}
