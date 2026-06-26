// ─── CommentComposer ─────────────────────────────────────────────────────────
// contentEditable composer with rich text formatting, @mention autocomplete,
// and file attachments. Ported from Tailwind to MUI sx props.
import React, { useCallback, useEffect, useRef, useState, ChangeEvent, KeyboardEvent } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { COMMENT_USERS } from './constants';
import type { Attachment, CommentUser } from './types';
import { sanitizeHtml } from './utils';
import { FormattingToolbar } from './FormattingToolbar';
import { MentionOverlay } from './MentionOverlay';

function fileToDataUrl(f: File): Promise<string> {
  return new Promise(resolve => {
    const r = new FileReader();
    r.onload = e => resolve(e.target!.result as string);
    r.readAsDataURL(f);
  });
}

function insertMentionAtCaret(user: CommentUser): void {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return;
  const chip = document.createElement("span");
  chip.setAttribute("data-mention-id", user.id);
  chip.setAttribute("contenteditable", "false");
  chip.style.color = '#473bab';
  chip.style.fontWeight = '500';
  chip.textContent = `@${user.name}`;
  const space = document.createTextNode(" ");
  const range = sel.getRangeAt(0);
  range.insertNode(chip);
  const afterChip = document.createRange();
  afterChip.setStartAfter(chip);
  afterChip.collapse(true);
  afterChip.insertNode(space);
  const finalRange = document.createRange();
  finalRange.setStartAfter(space);
  finalRange.collapse(true);
  sel.removeAllRanges();
  sel.addRange(finalRange);
}

interface CommentComposerProps {
  onSubmit: (html: string, attachments?: Attachment[]) => void;
  replyToName?: string;
  onCancelReply?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
  className?: string;
}

export function CommentComposer({
  onSubmit, replyToName, onCancelReply, placeholder = "Add a comment…",
  autoFocus = false, className = "",
}: CommentComposerProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEmpty, setIsEmpty] = useState(true);
  const [attachments, setAttachments] = useState<{ id: string; name: string; file: File; previewUrl: string | null }[]>([]);
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);

  useEffect(() => {
    if (autoFocus && editorRef.current) editorRef.current.focus();
  }, [autoFocus]);

  const handleFormat = useCallback((command: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false);
  }, []);

  const detectMention = useCallback(() => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) { setMentionQuery(null); return; }
    const range = sel.getRangeAt(0);
    const preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(editorRef.current!);
    preCaretRange.setEnd(range.endContainer, range.endOffset);
    const text = preCaretRange.toString();
    const atIdx = text.lastIndexOf("@");
    if (atIdx === -1) { setMentionQuery(null); return; }
    const afterAt = text.slice(atIdx + 1);
    if (afterAt.includes(" ") || afterAt.length > 30) { setMentionQuery(null); return; }
    setMentionQuery(afterAt);
  }, []);

  const handleMentionTrigger = useCallback(() => {
    const el = editorRef.current;
    if (!el) return;
    el.focus();
    document.execCommand('insertText', false, '@');
    detectMention();
  }, [detectMention]);

  const handleAttach = useCallback(() => { fileInputRef.current?.click(); }, []);

  const handleFileChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length) {
      const newItems = files.map(file => ({
        id: `att-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        name: file.name, file,
        previewUrl: file.type.startsWith("image/") ? URL.createObjectURL(file) : null,
      }));
      setAttachments(prev => [...prev, ...newItems]);
    }
    e.target.value = '';
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLDivElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); void handleSubmit(); return; }
    if (e.key === "Escape" && mentionQuery !== null) setMentionQuery(null);
    if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === '7') { e.preventDefault(); document.execCommand('insertOrderedList', false); return; }
    if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === '8') { e.preventDefault(); document.execCommand('insertUnorderedList', false); return; }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mentionQuery]);

  const handleInput = useCallback(() => {
    const el = editorRef.current;
    if (!el) return;
    const text = el.innerText.trim();
    setIsEmpty(text === "" || text === "\n" || el.innerHTML === "<br>");
    detectMention();
  }, [detectMention]);

  const handleMentionSelect = useCallback((user: CommentUser) => {
    const el = editorRef.current;
    if (!el) return;
    el.focus();
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      const queryLen = (mentionQuery?.length ?? 0) + 1;
      range.setStart(range.endContainer, Math.max(0, range.endOffset - queryLen));
      range.deleteContents();
    }
    insertMentionAtCaret(user);
    setMentionQuery(null);
    const text = el.innerText.trim();
    setIsEmpty(text === "");
  }, [mentionQuery]);

  const handleSubmit = useCallback(async () => {
    const el = editorRef.current;
    if (!el) return;
    const raw = el.innerHTML;
    const clean = sanitizeHtml(raw);
    const text = el.innerText.trim();
    if (!text) return;
    const attachmentData: Attachment[] = await Promise.all(
      attachments.map(async a => {
        if (a.file.type.startsWith("image/")) {
          const dataUrl = await fileToDataUrl(a.file);
          return { id: a.id, name: a.name, thumbnailUrl: dataUrl };
        }
        return { id: a.id, name: a.name };
      })
    );
    onSubmit(clean, attachmentData.length > 0 ? attachmentData : undefined);
    attachments.forEach(a => { if (a.previewUrl) URL.revokeObjectURL(a.previewUrl); });
    el.innerHTML = "";
    setIsEmpty(true);
    setMentionQuery(null);
    setAttachments([]);
  }, [onSubmit, attachments]);

  return (
    <Box className={className} sx={{ display: 'flex', flexDirection: 'column' }}>
      {/* Reply-to banner */}
      {replyToName && (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: '12px', py: '6px', mb: '4px', borderRadius: '8px', bgcolor: 'rgba(71,59,171,0.06)', fontSize: '0.75rem', color: 'primary.main' }}>
          <Typography sx={{ fontSize: '0.75rem', color: 'primary.main' }}>
            Replying to <strong>{replyToName}</strong>
          </Typography>
          {onCancelReply && (
            <Box component="button" type="button" onClick={onCancelReply} sx={{ ml: '8px', color: 'text.secondary', bgcolor: 'transparent', border: 'none', cursor: 'pointer', lineHeight: 1, '&:hover': { color: 'text.primary' } }} aria-label="Cancel reply">
              ✕
            </Box>
          )}
        </Box>
      )}

      {/* Outer box */}
      <Box
        sx={{
          position: 'relative', display: 'flex', flexDirection: 'column',
          borderRadius: '12px', border: '1px solid #e8e7ef', bgcolor: 'white',
          '&:focus-within': { borderColor: 'primary.main', boxShadow: '0 0 0 1px rgba(71,59,171,0.2)' },
          transition: 'border-color 0.15s, box-shadow 0.15s',
        }}
      >
        {/* contentEditable */}
        <Box
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          role="textbox"
          aria-multiline="true"
          aria-label={placeholder}
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          onFocus={detectMention}
          sx={{
            minHeight: 60, maxHeight: 160, overflowY: 'auto',
            px: '12px', pt: '10px', pb: '4px',
            fontSize: '0.8125rem', lineHeight: 1.5, color: 'text.primary',
            outline: 'none', resize: 'none',
            '&:empty:before': {
              content: `attr(aria-label)`,
              color: 'text.disabled',
              pointerEvents: 'none',
            },
            '& [data-mention-id]': { color: 'primary.main', fontWeight: 500 },
            '& ol': { listStyle: 'decimal', pl: '20px' },
            '& ul': { listStyle: 'disc', pl: '20px' },
          }}
        />

        {/* Attachment preview */}
        {attachments.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '6px', px: '12px', pb: '4px' }}>
            {attachments.map((att, i) => (
              att.previewUrl ? (
                <Box key={att.id} sx={{ position: 'relative' }}>
                  <img src={att.previewUrl} alt={att.name} title={att.name} style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover', border: '1px solid rgba(0,0,0,0.1)', display: 'block' }} />
                  <Box
                    component="button"
                    type="button"
                    onMouseDown={(e: React.MouseEvent) => { e.preventDefault(); URL.revokeObjectURL(att.previewUrl!); setAttachments(prev => prev.filter((_, j) => j !== i)); }}
                    sx={{ position: 'absolute', top: -4, right: -4, width: 16, height: 16, borderRadius: '50%', bgcolor: 'rgba(0,0,0,0.5)', color: 'white', fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}
                  >×</Box>
                </Box>
              ) : (
                <Box key={att.id} sx={{ display: 'flex', alignItems: 'center', gap: '4px', px: '8px', py: '4px', borderRadius: '6px', bgcolor: 'rgba(0,0,0,0.05)', fontSize: '0.6875rem', color: 'text.secondary' }}>
                  <span style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{att.name}</span>
                  <Box component="button" type="button" onMouseDown={(e: React.MouseEvent) => { e.preventDefault(); setAttachments(prev => prev.filter((_, j) => j !== i)); }} sx={{ color: 'text.disabled', bgcolor: 'transparent', border: 'none', cursor: 'pointer', '&:hover': { color: 'text.secondary' } }}>×</Box>
                </Box>
              )
            ))}
          </Box>
        )}

        {/* Hidden file input */}
        <input ref={fileInputRef} type="file" multiple style={{ display: 'none' }} onChange={handleFileChange} />

        {/* Toolbar + send row */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: '8px', pb: '8px', pt: '2px' }}>
          <FormattingToolbar onFormat={handleFormat} onMentionTrigger={handleMentionTrigger} onAttach={handleAttach} />
          <Box
            component="button"
            type="button"
            onClick={() => void handleSubmit()}
            disabled={isEmpty}
            aria-label="Send comment"
            sx={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 28, height: 28, borderRadius: '50%', border: 'none', cursor: isEmpty ? 'not-allowed' : 'pointer',
              bgcolor: isEmpty ? 'transparent' : '#473bab',
              color: isEmpty ? '#cac9cf' : 'white',
              '&:hover:not(:disabled)': { bgcolor: '#382f8a' },
              transition: 'background 0.15s, color 0.15s',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </Box>
        </Box>

        {/* Mention overlay */}
        {mentionQuery !== null && (
          <MentionOverlay
            query={mentionQuery}
            users={COMMENT_USERS}
            onSelect={handleMentionSelect}
            onDismiss={() => setMentionQuery(null)}
          />
        )}
      </Box>
    </Box>
  );
}
