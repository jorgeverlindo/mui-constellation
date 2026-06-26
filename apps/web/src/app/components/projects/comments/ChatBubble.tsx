// ─── ChatBubble ───────────────────────────────────────────────────────────────
// Renders a single top-level comment card including:
//   • Author avatar (initials + color)
//   • Author name, timestamp, "edited" badge
//   • Rich-text message body
//   • Entity mention chip (optional)
//   • Pin indicator
//   • Inline reply list (collapsed / expanded)
//   • Reply composer trigger
//   • ⋯ context menu (edit / delete / pin)

import React, { useCallback, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";

import type { Attachment, CommentData, CommentUser, Reply } from "./types";
import { formatTimestamp } from "./utils";
import { RichTextRenderer } from "./RichTextRenderer";
import { CommentComposer } from "./CommentComposer";
import { CommentMenu } from "./CommentMenu";
import type { CommentMenuAction } from "./CommentMenu";

// ── Avatar ────────────────────────────────────────────────────────────────────

function Avatar({ user, size = 28 }: { user: CommentUser; size?: number }) {
  if (user.avatar) {
    return (
      <Box
        component="img"
        src={user.avatar}
        alt={user.name}
        sx={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
      />
    );
  }
  return (
    <Box
      component="span"
      aria-label={user.name}
      sx={{
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "50%",
        color: "white",
        fontWeight: 500,
        userSelect: "none",
        width: size,
        height: size,
        bgcolor: user.color || "#bcbbc2",
        fontSize: size * 0.38,
      }}
    >
      {user.initials}
    </Box>
  );
}

// ── ReplyRow ──────────────────────────────────────────────────────────────────

interface ReplyRowProps {
  reply: Reply;
  author: CommentUser | undefined;
  currentUserId: string;
  onEdit: (replyId: string, newHtml: string) => void;
  onDelete: (replyId: string) => void;
}

function ReplyRow({ reply, author, currentUserId, onEdit, onDelete }: ReplyRowProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [hovered, setHovered] = useState(false);

  const handleMenuAction = useCallback(
    (action: CommentMenuAction) => {
      if (action === "edit") setEditing(true);
      if (action === "delete") onDelete(reply.id);
    },
    [onDelete, reply.id],
  );

  const handleEditSubmit = useCallback(
    (html: string) => {
      onEdit(reply.id, html);
      setEditing(false);
    },
    [onEdit, reply.id],
  );

  const isOwn = reply.authorId === currentUserId;
  const authorName = author?.name ?? "Unknown";

  return (
    <Box
      sx={{ display: "flex", gap: 1, alignItems: "flex-start", pt: 1 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Avatar user={author ?? { id: reply.authorId, name: "?", initials: "?", color: "#bcbbc2", email: "", avatar: null }} size={24} />

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: "flex", alignItems: "baseline", gap: 1, flexWrap: "wrap" }}>
          <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#686576", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {authorName}
          </Typography>
          <Typography sx={{ fontSize: 11, color: "#9c99a9" }}>
            {formatTimestamp(reply.timestamp)}
            {reply.isEdited && <span style={{ marginLeft: 4 }}>(edited)</span>}
          </Typography>
        </Box>

        {editing ? (
          <CommentComposer
            onSubmit={handleEditSubmit}
            onCancelReply={() => setEditing(false)}
            placeholder="Edit reply…"
            autoFocus
          />
        ) : (
          <>
            <RichTextRenderer html={reply.message} sx={{ mt: 0.25, fontSize: 12 }} />
            {reply.attachments && reply.attachments.length > 0 && (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, mt: 1 }}>
                {reply.attachments.map(att => (
                  att.thumbnailUrl ? (
                    <Box
                      key={att.id}
                      component="img"
                      src={att.thumbnailUrl}
                      alt={att.name}
                      title={att.name}
                      sx={{ width: 48, height: 48, borderRadius: 2, objectFit: "cover", border: "1px solid rgba(0,0,0,0.08)" }}
                    />
                  ) : (
                    <Box key={att.id} sx={{ display: "flex", alignItems: "center", gap: 0.5, px: 1, py: 0.5, borderRadius: 1, bgcolor: "rgba(0,0,0,0.05)", fontSize: 11, color: "#686576" }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
                      <Box component="span" sx={{ maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{att.name}</Box>
                    </Box>
                  )
                ))}
              </Box>
            )}
          </>
        )}
      </Box>

      {/* ⋯ menu trigger — visible on hover */}
      {isOwn && !editing && (
        <Box sx={{ position: "relative", opacity: hovered ? 1 : 0, transition: "opacity 0.15s", flexShrink: 0 }}>
          <IconButton
            onClick={() => setMenuOpen((p) => !p)}
            aria-label="Reply options"
            size="small"
            sx={{ width: 20, height: 20, color: "#686576", borderRadius: 0.5, "&:hover": { bgcolor: "rgba(0,0,0,0.06)" } }}
          >
            <DotsIcon size={14} />
          </IconButton>
          <CommentMenu
            isOpen={menuOpen}
            showPin={false}
            isOwn={isOwn}
            onAction={handleMenuAction}
            onClose={() => setMenuOpen(false)}
          />
        </Box>
      )}
    </Box>
  );
}

// ── DotsIcon ──────────────────────────────────────────────────────────────────

function DotsIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="5" r="1.5" />
      <circle cx="12" cy="12" r="1.5" />
      <circle cx="12" cy="19" r="1.5" />
    </svg>
  );
}

// ── PinBadge ──────────────────────────────────────────────────────────────────

function PinBadge() {
  return (
    <Box
      component="span"
      aria-label="Pinned"
      sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, fontSize: 10, color: "#473bab", fontWeight: 500, bgcolor: "rgba(71,59,171,0.08)", px: 0.75, py: 0.25, borderRadius: "999px" }}
    >
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="17" x2="12" y2="22"/>
        <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V17z"/>
      </svg>
      Pinned
    </Box>
  );
}

// ── Main ChatBubble ───────────────────────────────────────────────────────────

interface ChatBubbleProps {
  comment: CommentData;
  getUserById: (id: string) => CommentUser | undefined;
  currentUserId: string;
  onEdit: (commentId: string, html: string) => void;
  onDelete: (commentId: string) => void;
  onPin: (commentId: string, pinned: boolean) => void;
  onAddReply: (commentId: string, html: string, attachments?: Attachment[]) => void;
  onEditReply: (commentId: string, replyId: string, html: string) => void;
  onDeleteReply: (commentId: string, replyId: string) => void;
  isRover?: boolean;
}

export function ChatBubble({
  comment,
  getUserById,
  currentUserId,
  onEdit,
  onDelete,
  onPin,
  onAddReply,
  onEditReply,
  onDeleteReply,
  isRover,
}: ChatBubbleProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [replying, setReplying] = useState(false);
  const [hovered, setHovered] = useState(false);

  const author = getUserById(comment.authorId);
  const authorName = author?.name ?? "Unknown";
  const isOwn = comment.authorId === currentUserId;

  const handleMenuAction = useCallback(
    (action: CommentMenuAction) => {
      if (action === "edit") setEditing(true);
      if (action === "delete") onDelete(comment.id);
      if (action === "pin") onPin(comment.id, true);
      if (action === "unpin") onPin(comment.id, false);
    },
    [comment.id, onDelete, onPin],
  );

  const handleEditSubmit = useCallback(
    (html: string) => {
      onEdit(comment.id, html);
      setEditing(false);
    },
    [comment.id, onEdit],
  );

  const handleReplySubmit = useCallback(
    (html: string, attachments?: Attachment[]) => {
      onAddReply(comment.id, html, attachments);
      setReplying(false);
      setShowReplies(true);
    },
    [comment.id, onAddReply],
  );

  const replyCount = comment.replies.length;

  return (
    <Box
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      sx={{
        bgcolor: "background.paper",
        borderRadius: 4,
        border: "1px solid",
        borderColor: isRover ? "#473bab" : comment.isPinned ? "rgba(71,59,171,0.3)" : "#e8e7ef",
        boxShadow: isRover
          ? "0 0 0 2px #473bab, 0px 2px 2px 0px rgba(0,0,0,0.08)"
          : "0px 2px 2px 0px rgba(0,0,0,0.08)",
        ...(isRover ? { bgcolor: "rgba(71,59,171,0.04)" } : {}),
        display: "flex",
        flexDirection: "column",
        gap: 1,
        p: 1.5,
        outline: comment.isPinned && !isRover ? "1px solid rgba(71,59,171,0.3)" : undefined,
        transition: "box-shadow 0.3s ease",
      }}
    >
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
        <Avatar user={author ?? { id: comment.authorId, name: "?", initials: "?", color: "#bcbbc2", email: "", avatar: null }} size={28} />

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#686576", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {authorName}
            </Typography>
            {comment.isPinned && <PinBadge />}
            {comment.module && (
              <Typography component="span" sx={{ fontSize: 10, color: "#9c99a9", bgcolor: "rgba(0,0,0,0.04)", px: 0.75, py: 0.25, borderRadius: "999px" }}>
                {comment.module}
              </Typography>
            )}
          </Box>
          <Typography sx={{ fontSize: 11, color: "#9c99a9", mt: 0.25 }}>
            {formatTimestamp(comment.timestamp)}
            {comment.isEdited && <span style={{ marginLeft: 4 }}>(edited)</span>}
          </Typography>
        </Box>

        {/* ⋯ button — visible on hover */}
        <Box sx={{ position: "relative", opacity: hovered ? 1 : 0, transition: "opacity 0.15s", flexShrink: 0 }}>
          <IconButton
            onClick={() => setMenuOpen((p) => !p)}
            aria-label="Comment options"
            size="small"
            sx={{ width: 24, height: 24, color: "#686576", borderRadius: 0.5, "&:hover": { bgcolor: "rgba(0,0,0,0.06)" } }}
          >
            <DotsIcon size={16} />
          </IconButton>
          <CommentMenu
            isOpen={menuOpen}
            isPinned={comment.isPinned}
            showPin={true}
            isOwn={isOwn}
            onAction={handleMenuAction}
            onClose={() => setMenuOpen(false)}
          />
        </Box>
      </Box>

      {/* ── Entity mention chip ────────────────────────────────────────────── */}
      {comment.entityMention && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, fontSize: 11, color: "#686576" }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
            <polyline points="15 3 21 3 21 9"/>
            <line x1="10" y1="14" x2="21" y2="3"/>
          </svg>
          <Typography component="span" sx={{ fontSize: 11, color: "#473bab", fontWeight: 500 }}>{comment.entityMention.label}</Typography>
          <Typography component="span" sx={{ fontSize: 11, color: "#bcbbc2" }}>({comment.entityMention.type})</Typography>
        </Box>
      )}

      {/* ── Message body or edit composer ─────────────────────────────────── */}
      {editing ? (
        <CommentComposer
          onSubmit={handleEditSubmit}
          onCancelReply={() => setEditing(false)}
          placeholder="Edit comment…"
          autoFocus
        />
      ) : (
        <>
          <RichTextRenderer html={comment.message} />
          {comment.attachments.length > 0 && (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, mt: 1 }}>
              {comment.attachments.map(att => (
                att.thumbnailUrl ? (
                  <Box
                    key={att.id}
                    component="img"
                    src={att.thumbnailUrl}
                    alt={att.name}
                    title={att.name}
                    sx={{ width: 48, height: 48, borderRadius: 2, objectFit: "cover", border: "1px solid rgba(0,0,0,0.08)" }}
                  />
                ) : (
                  <Box key={att.id} sx={{ display: "flex", alignItems: "center", gap: 0.5, px: 1, py: 0.5, borderRadius: 1, bgcolor: "rgba(0,0,0,0.05)", fontSize: 11, color: "#686576" }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
                    <Box component="span" sx={{ maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{att.name}</Box>
                  </Box>
                )
              ))}
            </Box>
          )}
        </>
      )}

      {/* ── Footer: reply count + reply button ────────────────────────────── */}
      {!editing && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, pt: 0.25 }}>
          {replyCount > 0 && (
            <Button
              variant="text"
              size="small"
              onClick={() => setShowReplies((p) => !p)}
              sx={{ fontSize: 12, color: "#473bab", p: 0, minWidth: 0, textTransform: "none", "&:hover": { textDecoration: "underline", bgcolor: "transparent" } }}
            >
              {showReplies ? "Hide" : `${replyCount} ${replyCount === 1 ? "reply" : "replies"}`}
            </Button>
          )}
          <Button
            variant="text"
            size="small"
            onClick={() => {
              setReplying((p) => !p);
              setShowReplies(true);
            }}
            sx={{ fontSize: 12, color: "#686576", p: 0, minWidth: 0, textTransform: "none", "&:hover": { color: "#473bab", bgcolor: "transparent" } }}
          >
            Reply
          </Button>
        </Box>
      )}

      {/* ── Replies ───────────────────────────────────────────────────────── */}
      {showReplies && replyCount > 0 && (
        <Box sx={{ borderTop: "1px solid #f0eef8", pt: 1, display: "flex", flexDirection: "column", "& > * + *": { borderTop: "1px solid #f0eef8" } }}>
          {comment.replies.map((reply) => (
            <ReplyRow
              key={reply.id}
              reply={reply}
              author={getUserById(reply.authorId)}
              currentUserId={currentUserId}
              onEdit={(replyId, html) => onEditReply(comment.id, replyId, html)}
              onDelete={(replyId) => onDeleteReply(comment.id, replyId)}
            />
          ))}
        </Box>
      )}

      {/* ── Reply composer ────────────────────────────────────────────────── */}
      {replying && !editing && (
        <Box sx={{ borderTop: "1px solid #f0eef8", pt: 1 }}>
          <CommentComposer
            onSubmit={handleReplySubmit}
            replyToName={authorName}
            onCancelReply={() => setReplying(false)}
            placeholder={`Reply to ${authorName}…`}
            autoFocus
          />
        </Box>
      )}
    </Box>
  );
}
