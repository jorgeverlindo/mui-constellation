// ─── ChatBubble ───────────────────────────────────────────────────────────────
// Renders a single top-level comment card.
// Ported from Tailwind/motion to MUI sx props (no motion/react).
import { useCallback, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { Attachment, CommentData, CommentUser, Reply } from './types';
import { formatTimestamp } from './utils';
import { RichTextRenderer } from './RichTextRenderer';
import { CommentComposer } from './CommentComposer';
import { CommentMenu } from './CommentMenu';
import type { CommentMenuAction } from './CommentMenu';

// ── Avatar ────────────────────────────────────────────────────────────────────

function Avatar({ user, size = 28 }: { user: CommentUser; size?: number }) {
  if (user.avatar) {
    return <img src={user.avatar} alt={user.name} width={size} height={size} style={{ borderRadius: '50%', objectFit: 'cover', flexShrink: 0, display: 'block', width: size, height: size }} />;
  }
  return (
    <Box component="span" sx={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', color: 'white', fontWeight: 500, userSelect: 'none', width: size, height: size, bgcolor: user.color || '#bcbbc2', fontSize: size * 0.38 }} aria-label={user.name}>
      {user.initials}
    </Box>
  );
}

// ── DotsIcon ──────────────────────────────────────────────────────────────────

function DotsIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" />
    </svg>
  );
}

// ── PinBadge ──────────────────────────────────────────────────────────────────

function PinBadge() {
  return (
    <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.625rem', color: 'primary.main', fontWeight: 500, bgcolor: 'rgba(71,59,171,0.08)', px: '6px', py: '2px', borderRadius: '100px' }} aria-label="Pinned">
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="17" x2="12" y2="22"/>
        <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V17z"/>
      </svg>
      Pinned
    </Box>
  );
}

// ── AttachmentRow ─────────────────────────────────────────────────────────────

function AttachmentList({ attachments }: { attachments: Attachment[] }) {
  if (!attachments.length) return null;
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '6px', mt: '8px' }}>
      {attachments.map(att => (
        att.thumbnailUrl ? (
          <img key={att.id} src={att.thumbnailUrl} alt={att.name} title={att.name} style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover', border: '1px solid rgba(0,0,0,0.08)', display: 'block' }} />
        ) : (
          <Box key={att.id} sx={{ display: 'flex', alignItems: 'center', gap: '4px', px: '8px', py: '4px', borderRadius: '6px', bgcolor: 'rgba(0,0,0,0.05)', fontSize: '0.6875rem', color: 'text.secondary' }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
            <span style={{ maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{att.name}</span>
          </Box>
        )
      ))}
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
  const isOwn = reply.authorId === currentUserId;
  const authorName = author?.name ?? "Unknown";
  const fallbackUser: CommentUser = { id: reply.authorId, name: "?", initials: "?", color: "#bcbbc2", email: "", avatar: null };

  const handleMenuAction = useCallback((action: CommentMenuAction) => {
    if (action === "edit") setEditing(true);
    if (action === "delete") onDelete(reply.id);
  }, [onDelete, reply.id]);

  const handleEditSubmit = useCallback((html: string) => { onEdit(reply.id, html); setEditing(false); }, [onEdit, reply.id]);

  return (
    <Box sx={{ display: 'flex', gap: '8px', alignItems: 'flex-start', pt: '8px', '&:hover .reply-menu-btn': { opacity: 1 } }}>
      <Avatar user={author ?? fallbackUser} size={24} />
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' }}>
          <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: 'text.secondary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{authorName}</Typography>
          <Typography sx={{ fontSize: '0.6875rem', color: 'text.disabled' }}>{formatTimestamp(reply.timestamp)}{reply.isEdited && ' (edited)'}</Typography>
        </Box>
        {editing ? (
          <CommentComposer onSubmit={handleEditSubmit} onCancelReply={() => setEditing(false)} placeholder="Edit reply…" autoFocus />
        ) : (
          <>
            <RichTextRenderer html={reply.message} className="" />
            {reply.attachments && <AttachmentList attachments={reply.attachments} />}
          </>
        )}
      </Box>
      {isOwn && !editing && (
        <Box sx={{ position: 'relative', flexShrink: 0 }}>
          <Box
            component="button"
            className="reply-menu-btn"
            type="button"
            onClick={() => setMenuOpen(p => !p)}
            aria-label="Reply options"
            sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 20, height: 20, borderRadius: '4px', border: 'none', bgcolor: 'transparent', cursor: 'pointer', color: 'text.secondary', opacity: 0, transition: 'opacity 0.15s', '&:hover': { bgcolor: 'rgba(0,0,0,0.06)' } }}
          >
            <DotsIcon size={14} />
          </Box>
          <CommentMenu isOpen={menuOpen} showPin={false} isOwn={isOwn} onAction={handleMenuAction} onClose={() => setMenuOpen(false)} />
        </Box>
      )}
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

export function ChatBubble({ comment, getUserById, currentUserId, onEdit, onDelete, onPin, onAddReply, onEditReply, onDeleteReply, isRover }: ChatBubbleProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [replying, setReplying] = useState(false);

  const author = getUserById(comment.authorId);
  const authorName = author?.name ?? "Unknown";
  const isOwn = comment.authorId === currentUserId;
  const replyCount = comment.replies.length;
  const fallbackUser: CommentUser = { id: comment.authorId, name: "?", initials: "?", color: "#bcbbc2", email: "", avatar: null };

  const handleMenuAction = useCallback((action: CommentMenuAction) => {
    if (action === "edit") setEditing(true);
    if (action === "delete") onDelete(comment.id);
    if (action === "pin") onPin(comment.id, true);
    if (action === "unpin") onPin(comment.id, false);
  }, [comment.id, onDelete, onPin]);

  const handleEditSubmit = useCallback((html: string) => { onEdit(comment.id, html); setEditing(false); }, [comment.id, onEdit]);
  const handleReplySubmit = useCallback((html: string, attachments?: Attachment[]) => { onAddReply(comment.id, html, attachments); setReplying(false); setShowReplies(true); }, [comment.id, onAddReply]);

  return (
    <Box
      sx={{
        bgcolor: 'white', borderRadius: '16px',
        border: '1px solid',
        borderColor: isRover ? '#473bab' : comment.isPinned ? 'rgba(71,59,171,0.3)' : '#e8e7ef',
        boxShadow: '0px 2px 2px 0px rgba(0,0,0,0.08)',
        display: 'flex', flexDirection: 'column', gap: '8px', p: '12px',
        ...(isRover ? { bgcolor: 'rgba(71,59,171,0.04)' } : {}),
        '&:hover .comment-menu-btn': { opacity: 1 },
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
        <Avatar user={author ?? fallbackUser} size={28} />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: 'text.secondary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{authorName}</Typography>
            {comment.isPinned && <PinBadge />}
            {comment.module && (
              <Box component="span" sx={{ fontSize: '0.625rem', color: 'text.disabled', bgcolor: 'rgba(0,0,0,0.04)', px: '6px', py: '2px', borderRadius: '100px' }}>{comment.module}</Box>
            )}
          </Box>
          <Typography sx={{ fontSize: '0.6875rem', color: 'text.disabled', mt: '2px' }}>
            {formatTimestamp(comment.timestamp)}{comment.isEdited && ' (edited)'}
          </Typography>
        </Box>
        {/* ⋯ menu */}
        <Box sx={{ position: 'relative', flexShrink: 0 }}>
          <Box
            component="button"
            className="comment-menu-btn"
            type="button"
            onClick={() => setMenuOpen(p => !p)}
            aria-label="Comment options"
            sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, borderRadius: '4px', border: 'none', bgcolor: 'transparent', cursor: 'pointer', color: 'text.secondary', opacity: 0, transition: 'opacity 0.15s', '&:hover': { bgcolor: 'rgba(0,0,0,0.06)' } }}
          >
            <DotsIcon size={16} />
          </Box>
          <CommentMenu isOpen={menuOpen} isPinned={comment.isPinned} showPin isOwn={isOwn} onAction={handleMenuAction} onClose={() => setMenuOpen(false)} />
        </Box>
      </Box>

      {/* Entity mention chip */}
      {comment.entityMention && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.6875rem', color: 'text.secondary' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          <Box component="span" sx={{ color: 'primary.main', fontWeight: 500 }}>{comment.entityMention.label}</Box>
          <Box component="span" sx={{ color: '#bcbbc2' }}>({comment.entityMention.type})</Box>
        </Box>
      )}

      {/* Body */}
      {editing ? (
        <CommentComposer onSubmit={handleEditSubmit} onCancelReply={() => setEditing(false)} placeholder="Edit comment…" autoFocus />
      ) : (
        <>
          <RichTextRenderer html={comment.message} />
          <AttachmentList attachments={comment.attachments} />
        </>
      )}

      {/* Footer */}
      {!editing && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px', pt: '2px' }}>
          {replyCount > 0 && (
            <Box component="button" type="button" onClick={() => setShowReplies(p => !p)} sx={{ fontSize: '0.75rem', color: 'primary.main', border: 'none', bgcolor: 'transparent', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>
              {showReplies ? "Hide" : `${replyCount} ${replyCount === 1 ? "reply" : "replies"}`}
            </Box>
          )}
          <Box component="button" type="button" onClick={() => { setReplying(p => !p); setShowReplies(true); }} sx={{ fontSize: '0.75rem', color: 'text.secondary', border: 'none', bgcolor: 'transparent', cursor: 'pointer', '&:hover': { color: 'primary.main' }, transition: 'color 0.1s' }}>
            Reply
          </Box>
        </Box>
      )}

      {/* Replies */}
      {showReplies && replyCount > 0 && (
        <Box sx={{ borderTop: '1px solid #f0eef8', pt: '8px', display: 'flex', flexDirection: 'column', '& > *:not(:last-child)': { borderBottom: '1px solid #f0eef8' } }}>
          {comment.replies.map(reply => (
            <ReplyRow
              key={reply.id}
              reply={reply}
              author={getUserById(reply.authorId)}
              currentUserId={currentUserId}
              onEdit={(replyId, html) => onEditReply(comment.id, replyId, html)}
              onDelete={replyId => onDeleteReply(comment.id, replyId)}
            />
          ))}
        </Box>
      )}

      {/* Reply composer */}
      {replying && !editing && (
        <Box sx={{ borderTop: '1px solid #f0eef8', pt: '8px' }}>
          <CommentComposer onSubmit={handleReplySubmit} replyToName={authorName} onCancelReply={() => setReplying(false)} placeholder={`Reply to ${authorName}…`} autoFocus />
        </Box>
      )}
    </Box>
  );
}
