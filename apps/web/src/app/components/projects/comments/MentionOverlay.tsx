// ─── MentionOverlay ──────────────────────────────────────────────────────────
// Floating dropdown that appears when the user types "@" in the composer.
// Filters COMMENT_USERS by the partial query and lets the parent insert a
// mention chip into the contentEditable.

import React, { useEffect, useRef, useState } from "react";
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Typography from "@mui/material/Typography";
import type { CommentUser } from "./types";

interface MentionOverlayProps {
  query: string;
  users: CommentUser[];
  onSelect: (user: CommentUser) => void;
  onDismiss: () => void;
}

function UserRow({
  user,
  isActive,
  onClick,
}: {
  user: CommentUser;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <ButtonBase
      onMouseDown={(e) => {
        e.preventDefault(); // don't blur the composer
        onClick();
      }}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        width: "100%",
        px: 1.5,
        py: 1,
        textAlign: "left",
        transition: "background-color 0.1s",
        bgcolor: isActive ? "rgba(71,59,171,0.08)" : "transparent",
        "&:hover": { bgcolor: isActive ? "rgba(71,59,171,0.08)" : "rgba(0,0,0,0.04)" },
      }}
    >
      {/* Avatar */}
      <Box
        component="span"
        aria-hidden="true"
        sx={{
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 28,
          height: 28,
          borderRadius: "50%",
          color: "white",
          fontSize: 10,
          fontWeight: 500,
          userSelect: "none",
          bgcolor: user.color || "#bcbbc2",
        }}
      >
        {user.initials}
      </Box>

      {/* Name + email */}
      <Box sx={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
        <Typography sx={{ fontSize: 13, color: "#1f1d25", lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: 500 }}>
          {user.name}
        </Typography>
        {user.email && (
          <Typography sx={{ fontSize: 11, color: "#686576", lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {user.email}
          </Typography>
        )}
      </Box>
    </ButtonBase>
  );
}

export function MentionOverlay({ query, users, onSelect, onDismiss }: MentionOverlayProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(query.toLowerCase()) ||
      u.email?.toLowerCase().includes(query.toLowerCase()),
  );

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (filtered.length === 0) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => (i + 1) % filtered.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => (i - 1 + filtered.length) % filtered.length);
      } else if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        onSelect(filtered[activeIndex]);
      } else if (e.key === "Escape") {
        onDismiss();
      }
    };

    window.addEventListener("keydown", handleKey, { capture: true });
    return () => window.removeEventListener("keydown", handleKey, { capture: true });
  }, [filtered, activeIndex, onSelect, onDismiss]);

  if (filtered.length === 0) return null;

  return (
    <Box
      role="listbox"
      aria-label="Mention users"
      sx={{
        position: "absolute",
        zIndex: 50,
        bottom: "100%",
        mb: 0.5,
        left: 0,
        width: 256,
        bgcolor: "background.paper",
        borderRadius: 3,
        overflow: "hidden",
        boxShadow: "0px 3px 14px 2px rgba(0,0,0,0.12), 0px 8px 10px 1px rgba(0,0,0,0.14), 0px 5px 5px -3px rgba(0,0,0,0.2)",
        maxHeight: 192,
        overflowY: "auto",
      }}
    >
      <Box sx={{ py: 0.5 }}>
        {filtered.map((user, idx) => (
          <UserRow
            key={user.id}
            user={user}
            isActive={idx === activeIndex}
            onClick={() => onSelect(user)}
          />
        ))}
      </Box>
    </Box>
  );
}
