// ─── CommentsSidePanel ────────────────────────────────────────────────────────
// Sliding right-side panel for the full comments thread.
// Ported from Tailwind/motion to MUI sx props + MUI Slide.
import { useRef, useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Collapse from '@mui/material/Collapse';
import { useCommentsRequired, getUserById } from './CommentsContext';
import { usePaneResize, PaneResizer } from '../PaneResizer';
import { ChatBubble } from './ChatBubble';
import { CommentComposer } from './CommentComposer';
import type { Attachment } from './types';

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
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: '12px', py: '48px', px: '24px', textAlign: 'center' }}>
      <Box sx={{ width: 48, height: 48, borderRadius: '50%', bgcolor: 'rgba(71,59,171,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'primary.main' }}>
        <ChatIcon size={22} />
      </Box>
      <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary', lineHeight: 1.6 }}>
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
    comments, currentUser, isPanelOpen, closePanel,
    addComment, editComment, deleteComment, pinComment,
    addReply, editReply, deleteReply,
    pendingEntity, clearPendingEntity, highlightedCommentId,
  } = ctx;

  useEffect(() => {
    if (!highlightedCommentId) return;
    const el = commentRefs.current.get(highlightedCommentId);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [highlightedCommentId]);

  const ENTITY_TYPE_LABEL: Record<string, string> = {
    offer: "Offer", template: "Template", background: "Background", preview: "Preview", vehicle: "VIN",
  };

  const totalCount = comments.reduce((sum, c) => sum + 1 + c.replies.length, 0);

  const [mounted, setMounted] = useState(false);
  const { width, isDragging, handleResizeStart } = usePaneResize({ initialWidth: 400, min: 280, max: 640, side: 'right' });
  useEffect(() => { if (isPanelOpen) setMounted(true); }, [isPanelOpen]);

  const handleNewComment = (html: string, attachments?: Attachment[]) => {
    addComment({ message: html, replies: [], attachments: attachments ?? [], projectId: '', ...(pendingEntity ? { entityMention: pendingEntity } : {}) });
    clearPendingEntity();
    requestAnimationFrame(() => { scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" }); });
  };

  return (
    <>
      {mounted && (
        <Collapse
          in={isPanelOpen}
          orientation="horizontal"
          appear
          timeout={350}
          onExited={() => setMounted(false)}
          sx={{ height: '100%', flexShrink: 0 }}
        >
      <Box sx={{ width, flexShrink: 0, height: '100%', display: 'flex', flexDirection: 'row' }}>
        <PaneResizer onMouseDown={handleResizeStart} isDragging={isDragging} />
        <Box
          component="aside"
          aria-label="Comments panel"
          sx={{
            display: 'flex', flexDirection: 'column', flex: 1,
            height: '100%', overflow: 'hidden',
            bgcolor: 'white', borderRadius: 2,
            boxShadow: '0px 1px 3px rgba(0,0,0,0.08)',
            border: '1px solid rgba(0,0,0,0.04)',
          }}
        >
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: '16px', py: '12px', borderBottom: '1px solid #e8e7ef', flexShrink: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Box sx={{ color: 'text.secondary', display: 'flex' }}><ChatIcon size={16} /></Box>
            <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: 'text.primary', lineHeight: 1.3 }}>Comments</Typography>
            {totalCount > 0 && <Typography sx={{ fontSize: '0.75rem', color: 'text.disabled' }}>({totalCount})</Typography>}
          </Box>
          <Box
            component="button"
            type="button"
            onClick={closePanel}
            aria-label="Close comments"
            sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: '6px', border: 'none', bgcolor: 'transparent', cursor: 'pointer', color: 'text.secondary', '&:hover': { bgcolor: 'rgba(0,0,0,0.06)', color: 'text.primary' }, transition: 'background 0.1s' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </Box>
        </Box>

        {/* Thread (scrollable) */}
        <Box ref={scrollRef} sx={{ flex: 1, overflowY: 'auto', px: '12px', py: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {comments.length === 0 ? (
            <EmptyState />
          ) : (
            comments.map(comment => (
              <div
                key={comment.id}
                ref={el => {
                  if (el) commentRefs.current.set(comment.id, el);
                  else commentRefs.current.delete(comment.id);
                }}
              >
                <ChatBubble
                  comment={comment}
                  getUserById={getUserById}
                  currentUserId={currentUser.id}
                  onEdit={(id, html) => editComment(id, html)}
                  onDelete={id => deleteComment(id)}
                  onPin={(id, pinned) => pinComment(id, pinned)}
                  onAddReply={(commentId, html, attachments) => addReply(commentId, { message: html, attachments: attachments ?? [] })}
                  onEditReply={(commentId, replyId, html) => editReply(commentId, replyId, html)}
                  onDeleteReply={(commentId, replyId) => deleteReply(commentId, replyId)}
                  isRover={comment.id === highlightedCommentId}
                />
              </div>
            ))
          )}
        </Box>

        {/* Composer */}
        <Box sx={{ flexShrink: 0, px: '12px', pb: '12px', pt: '8px', borderTop: '1px solid #e8e7ef' }}>
          {pendingEntity && (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', mb: '8px', px: '10px', py: '6px', borderRadius: '8px', bgcolor: 'rgba(71,59,171,0.06)', border: '1px solid rgba(71,59,171,0.15)' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#473bab" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                  <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                </svg>
                <Typography component="span" sx={{ fontSize: '0.6875rem', color: 'text.secondary', flexShrink: 0 }}>
                  {ENTITY_TYPE_LABEL[pendingEntity.type] ?? pendingEntity.type}:
                </Typography>
                <Typography component="span" sx={{ fontSize: '0.6875rem', color: 'primary.main', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {pendingEntity.label}
                </Typography>
              </Box>
              <Box
                component="button"
                type="button"
                onClick={clearPendingEntity}
                aria-label="Remove entity reference"
                sx={{ flexShrink: 0, color: 'text.disabled', bgcolor: 'transparent', border: 'none', cursor: 'pointer', '&:hover': { color: 'text.secondary' }, transition: 'color 0.1s' }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </Box>
            </Box>
          )}
          <CommentComposer onSubmit={handleNewComment} placeholder={`Comment as ${currentUser.name.split(" ")[0]}…`} />
        </Box>
        </Box>
      </Box>
        </Collapse>
      )}
    </>
  );
}
