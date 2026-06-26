// ─── NotificationsTray ────────────────────────────────────────────────────────
// Sliding right-side panel listing @mention / reply notifications for the
// current user. Uses CommentsContext via useCommentsRequired().

import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import ButtonBase from "@mui/material/ButtonBase";
import Collapse from "@mui/material/Collapse";

import { useCommentsRequired, getUserById } from "./CommentsContext";
import { formatTimestamp } from "./utils";
import type { NotifItem } from "./types";

// ── Icons ─────────────────────────────────────────────────────────────────────

export function BellIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function CheckAllIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 12l5 5 8-8" />
      <path d="M9 12l5 5 8-8" />
    </svg>
  );
}

// ── Action label helpers ──────────────────────────────────────────────────────

const ACTION_LABEL: Record<string, string> = {
  mentioned_you:   "mentioned you",
  replied_to_you:  "replied to you",
  commented:       "commented",
  pinned:          "pinned a comment",
  assigned_you:    "assigned you",
};

// ── Actor Avatar ──────────────────────────────────────────────────────────────

function ActorAvatar({ actorId }: { actorId: string }) {
  const user = getUserById(actorId);
  if (!user) {
    return (
      <Box sx={{ width: 28, height: 28, borderRadius: "50%", bgcolor: "rgba(0,0,0,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 10, fontWeight: 600, color: "#686576" }}>
        ?
      </Box>
    );
  }
  if (user.avatar) {
    return (
      <Box
        component="img"
        src={user.avatar}
        alt={user.name}
        sx={{ width: 28, height: 28, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
      />
    );
  }
  return (
    <Box
      sx={{ width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 10, fontWeight: 600, color: "white", bgcolor: user.color }}
    >
      {user.initials}
    </Box>
  );
}

// ── Single notification row ───────────────────────────────────────────────────

interface NotifRowProps {
  notif: NotifItem;
  onRead: (id: string) => void;
  onOpenComments: () => void;
}

function NotifRow({ notif, onRead, onOpenComments }: NotifRowProps) {
  const actor = getUserById(notif.actorId);
  const actorName = actor?.name.split(" ")[0] ?? "Someone";
  const actionLabel = ACTION_LABEL[notif.action] ?? notif.action;

  const handleClick = () => {
    if (!notif.isRead) onRead(notif.id);
    onOpenComments();
  };

  return (
    <ButtonBase
      onClick={handleClick}
      sx={{
        width: "100%",
        textAlign: "left",
        display: "flex",
        alignItems: "flex-start",
        gap: 1.25,
        px: 1.5,
        py: 1.25,
        borderRadius: 2,
        transition: "background-color 0.1s",
        cursor: "pointer",
        bgcolor: notif.isRead ? "transparent" : "rgba(71,59,171,0.05)",
        "&:hover": {
          bgcolor: notif.isRead ? "rgba(0,0,0,0.04)" : "rgba(71,59,171,0.09)",
        },
      }}
    >
      {/* Unread dot */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", width: 8, flexShrink: 0, mt: "9px" }}>
        {!notif.isRead && (
          <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "#473bab" }} />
        )}
      </Box>

      {/* Avatar */}
      <ActorAvatar actorId={notif.actorId} />

      {/* Text block */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontSize: 12, lineHeight: 1.4, color: "#1f1d25" }}>
          <strong>{actorName}</strong>
          {" "}
          <Box component="span" sx={{ color: "#686576" }}>{actionLabel}</Box>
        </Typography>
        {notif.preview && (
          <Typography sx={{ fontSize: 11, color: "#9c99a9", mt: 0.25, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", lineHeight: 1.4 }}>
            {notif.preview}
          </Typography>
        )}
        <Typography sx={{ fontSize: 10, color: "#b8b6c0", mt: 0.5 }}>
          {formatTimestamp(notif.timestamp)}
        </Typography>
      </Box>
    </ButtonBase>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, gap: 1.5, py: 6, px: 3, textAlign: "center" }}>
      <Box sx={{ width: 48, height: 48, borderRadius: "50%", bgcolor: "rgba(71,59,171,0.08)", display: "flex", alignItems: "center", justifyContent: "center", color: "#473bab" }}>
        <BellIcon size={22} />
      </Box>
      <Typography sx={{ fontSize: 13, color: "#686576", lineHeight: 1.6 }}>
        No notifications yet. Mention someone with @name to notify them.
      </Typography>
    </Box>
  );
}

// ── NotificationsTray ─────────────────────────────────────────────────────────

export function NotificationsTray() {
  const ctx = useCommentsRequired();

  const {
    notifications,
    unreadCount,
    markRead,
    markAllRead,
    isNotifOpen,
    closeNotif,
    openPanel,
  } = ctx;

  const myNotifs = notifications.filter(
    (n) => n.recipientId === ctx.currentUser.id,
  );

  const handleOpenComments = () => {
    closeNotif();
    openPanel();
  };

  return (
    <Collapse
      in={isNotifOpen}
      orientation="horizontal"
      timeout={450}
      sx={{ flexShrink: 0, height: "100%" }}
    >
      <Box
        component="aside"
        aria-label="Notifications tray"
        sx={{
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
          height: "100%",
          width: 400,
          overflow: "hidden",
          bgcolor: "background.paper",
          borderRadius: 4,
          boxShadow: "0px 2px 4px rgba(0,0,0,0.06)",
          border: "1px solid rgba(0,0,0,0.04)",
        }}
      >
        {/* ── Header ──────────────────────────────────────────────────── */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 2, py: 1.5, borderBottom: "1px solid #e8e7ef", flexShrink: 0, gap: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
            <Box sx={{ color: "#686576", flexShrink: 0, display: "flex" }}>
              <BellIcon size={16} />
            </Box>
            <Typography sx={{ fontSize: 15, fontWeight: 600, color: "#1f1d25", lineHeight: 1.2, flexShrink: 0 }}>
              Notifications
            </Typography>
            {unreadCount > 0 && (
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", minWidth: 18, height: 18, px: 0.5, borderRadius: "999px", fontSize: 10, fontWeight: 600, bgcolor: "#473bab", color: "white", flexShrink: 0 }}>
                {unreadCount}
              </Box>
            )}
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, flexShrink: 0 }}>
            {unreadCount > 0 && (
              <IconButton
                onClick={markAllRead}
                title="Mark all as read"
                aria-label="Mark all as read"
                size="small"
                sx={{ width: 28, height: 28, color: "#686576", borderRadius: 1, "&:hover": { bgcolor: "rgba(0,0,0,0.06)", color: "#1f1d25" } }}
              >
                <CheckAllIcon />
              </IconButton>
            )}
            <IconButton
              onClick={closeNotif}
              aria-label="Close notifications"
              size="small"
              sx={{ width: 28, height: 28, color: "#686576", borderRadius: 1, "&:hover": { bgcolor: "rgba(0,0,0,0.06)", color: "#1f1d25" } }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>

        {/* ── List (scrollable) ────────────────────────────────────────── */}
        <Box sx={{ flex: 1, overflowY: "auto", px: 1, py: 1, display: "flex", flexDirection: "column", gap: 0.25 }}>
          {myNotifs.length === 0 ? (
            <EmptyState />
          ) : (
            myNotifs.map((notif) => (
              <NotifRow
                key={notif.id}
                notif={notif}
                onRead={markRead}
                onOpenComments={handleOpenComments}
              />
            ))
          )}
        </Box>
      </Box>
    </Collapse>
  );
}
