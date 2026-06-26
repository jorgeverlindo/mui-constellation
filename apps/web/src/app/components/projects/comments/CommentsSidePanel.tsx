// ─── CommentsSidePanel ────────────────────────────────────────────────────────
// The sliding right-side panel that houses the full comments thread for a
// project. Uses CommentsContext via useCommentsRequired().
//
// Layout:
//   ┌──────────────────────┐
//   │ Header (title + close)│
//   ├──────────────────────┤
//   │ Scrollable thread    │ ← ChatBubble list, newest on top
//   ├──────────────────────┤
//   │ Composer             │ ← new top-level comment
//   └──────────────────────┘

import React, { useRef, useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Collapse from "@mui/material/Collapse";

import { useCommentsRequired, getUserById } from "./CommentsContext";
import { ChatBubble } from "./ChatBubble";
import { CommentComposer } from "./CommentComposer";
import type { Attachment } from "./types";

// ── Close icon ────────────────────────────────────────────────────────────────

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  );
}

// ── ChatIcon ──────────────────────────────────────────────────────────────────

export function ChatIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, gap: 1.5, py: 6, px: 3, textAlign: "center" }}>
      <Box sx={{ width: 48, height: 48, borderRadius: "50%", bgcolor: "rgba(71,59,171,0.08)", display: "flex", alignItems: "center", justifyContent: "center", color: "#473bab" }}>
        <ChatIcon size={22} />
      </Box>
      <Typography sx={{ fontSize: 13, color: "#686576", lineHeight: 1.6 }}>
        No comments yet. Be the first to add one!
      </Typography>
    </Box>
  );
}

// ── CommentsSidePanel ─────────────────────────────────────────────────────────

export function CommentsSidePanel() {
  const ctx = useCommentsRequired();
  const scrollRef = useRef<HTMLDivElement>(null);
  const commentRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const {
    comments,
    currentUser,
    isPanelOpen,
    closePanel,
    addComment,
    editComment,
    deleteComment,
    pinComment,
    addReply,
    editReply,
    deleteReply,
    pendingEntity,
    clearPendingEntity,
    highlightedCommentId,
  } = ctx;

  useEffect(() => {
    if (!highlightedCommentId) return;
    const el = commentRefs.current.get(highlightedCommentId);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [highlightedCommentId]);

  const ENTITY_TYPE_LABEL: Record<string, string> = {
    offer: "Offer",
    template: "Template",
    background: "Background",
    preview: "Preview",
    vehicle: "VIN",
  };

  const totalCount = comments.reduce((sum, c) => sum + 1 + c.replies.length, 0);

  const handleNewComment = (html: string, attachments?: Attachment[]) => {
    addComment({
      message: html,
      projectId: "",
      attachments: attachments ?? [],
      ...(pendingEntity ? { entityMention: pendingEntity } : {}),
    } as Parameters<typeof addComment>[0]);
    clearPendingEntity();
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    });
  };

  return (
    <Collapse
      in={isPanelOpen}
      orientation="horizontal"
      timeout={450}
      sx={{ flexShrink: 0, height: "100%" }}
    >
      <Box
        component="aside"
        aria-label="Comments panel"
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
        {/* ── Header ────────────────────────────────────────────────────── */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 2, py: 1.5, borderBottom: "1px solid #e8e7ef", flexShrink: 0 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box sx={{ color: "#686576", display: "flex" }}>
              <ChatIcon size={16} />
            </Box>
            <Typography sx={{ fontSize: 15, fontWeight: 600, color: "#1f1d25", lineHeight: 1.2 }}>
              Comments
            </Typography>
            {totalCount > 0 && (
              <Typography sx={{ fontSize: 12, color: "#9c99a9" }}>
                ({totalCount})
              </Typography>
            )}
          </Box>
          <IconButton
            onClick={closePanel}
            aria-label="Close comments"
            size="small"
            sx={{ color: "#686576", borderRadius: 1, width: 28, height: 28, "&:hover": { bgcolor: "rgba(0,0,0,0.06)", color: "#1f1d25" } }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        {/* ── Thread (scrollable) ────────────────────────────────────────── */}
        <Box
          ref={scrollRef}
          sx={{ flex: 1, overflowY: "auto", px: 1.5, py: 1.5, display: "flex", flexDirection: "column", gap: 1 }}
        >
          {comments.length === 0 ? (
            <EmptyState />
          ) : (
            comments.map((comment) => (
              <Box
                key={comment.id}
                ref={(el: HTMLDivElement | null) => {
                  if (el) commentRefs.current.set(comment.id, el);
                  else commentRefs.current.delete(comment.id);
                }}
              >
                <ChatBubble
                  comment={comment}
                  getUserById={getUserById}
                  currentUserId={currentUser.id}
                  onEdit={(id, html) => editComment(id, html)}
                  onDelete={(id) => deleteComment(id)}
                  onPin={(id, pinned) => pinComment(id, pinned)}
                  onAddReply={(commentId, html, attachments) =>
                    addReply(commentId, { message: html, attachments: attachments ?? [] })
                  }
                  onEditReply={(commentId, replyId, html) =>
                    editReply(commentId, replyId, html)
                  }
                  onDeleteReply={(commentId, replyId) =>
                    deleteReply(commentId, replyId)
                  }
                  isRover={comment.id === highlightedCommentId}
                />
              </Box>
            ))
          )}
        </Box>

        {/* ── Composer ──────────────────────────────────────────────────── */}
        <Box sx={{ flexShrink: 0, px: 1.5, pb: 1.5, pt: 1, borderTop: "1px solid #e8e7ef" }}>
          {/* Entity banner — shown when a card triggered the panel */}
          {pendingEntity && (
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1, mb: 1, px: 1.25, py: 0.75, borderRadius: 2, bgcolor: "rgba(71,59,171,0.06)", border: "1px solid rgba(71,59,171,0.15)" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, minWidth: 0 }}>
                <Box sx={{ flexShrink: 0, display: "flex", color: "#473bab" }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                    <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                  </svg>
                </Box>
                <Typography component="span" sx={{ fontSize: 11, color: "#686576", flexShrink: 0 }}>
                  {ENTITY_TYPE_LABEL[pendingEntity.type] ?? pendingEntity.type}:
                </Typography>
                <Typography component="span" sx={{ fontSize: 11, color: "#473bab", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {pendingEntity.label}
                </Typography>
              </Box>
              <IconButton
                onClick={clearPendingEntity}
                aria-label="Remove entity reference"
                size="small"
                sx={{ flexShrink: 0, color: "#9c99a9", p: 0, "&:hover": { color: "#686576", bgcolor: "transparent" } }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </IconButton>
            </Box>
          )}
          <CommentComposer
            onSubmit={handleNewComment}
            placeholder={`Comment as ${currentUser.name.split(" ")[0]}…`}
          />
        </Box>
      </Box>
    </Collapse>
  );
}
