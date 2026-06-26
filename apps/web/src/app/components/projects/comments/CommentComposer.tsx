// ─── CommentComposer ─────────────────────────────────────────────────────────
// contentEditable composer with:
//   • Rich text formatting via FormattingToolbar
//   • @mention autocomplete via MentionOverlay
//   • Send on Ctrl/Cmd+Enter (or via the send button)
//   • Optional "Reply to" banner when replyTo is supplied
//
// Mention chips are inserted as:
//   <span data-mention-id="{userId}" contenteditable="false">@Name</span>
//
// The parent receives sanitized HTML via onSubmit(html).

import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";

import { COMMENT_USERS } from "./constants";
import type { Attachment, CommentUser } from "./types";
import { sanitizeHtml } from "./utils";
import { FormattingToolbar } from "./FormattingToolbar";
import { MentionOverlay } from "./MentionOverlay";

// ── helpers ───────────────────────────────────────────────────────────────────

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
  chip.className = "mention-chip";
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

// ── component ────────────────────────────────────────────────────────────────

interface CommentComposerProps {
  onSubmit: (html: string, attachments?: Attachment[]) => void;
  replyToName?: string;
  onCancelReply?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
  className?: string;
}

export function CommentComposer({
  onSubmit,
  replyToName,
  onCancelReply,
  placeholder = "Add a comment…",
  autoFocus = false,
  className = "",
}: CommentComposerProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEmpty, setIsEmpty] = useState(true);
  const [attachments, setAttachments] = useState<{ id: string; name: string; file: File; previewUrl: string | null }[]>([]);

  const [mentionQuery, setMentionQuery] = useState<string | null>(null);

  useEffect(() => {
    if (autoFocus && editorRef.current) {
      editorRef.current.focus();
    }
  }, [autoFocus]);

  const handleFormat = useCallback((command: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false);
  }, []);

  const detectMention = useCallback(() => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) {
      setMentionQuery(null);
      return;
    }
    const range = sel.getRangeAt(0);
    const preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(editorRef.current!);
    preCaretRange.setEnd(range.endContainer, range.endOffset);
    const text = preCaretRange.toString();
    const atIdx = text.lastIndexOf("@");
    if (atIdx === -1) {
      setMentionQuery(null);
      return;
    }
    const afterAt = text.slice(atIdx + 1);
    if (afterAt.includes(" ") || afterAt.length > 30) {
      setMentionQuery(null);
      return;
    }
    setMentionQuery(afterAt);
  }, []);

  const handleMentionTrigger = useCallback(() => {
    const el = editorRef.current;
    if (!el) return;
    el.focus();
    document.execCommand('insertText', false, '@');
    detectMention();
  }, [detectMention]);

  const handleAttach = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length) {
      const newItems = files.map(file => ({
        id: `att-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        name: file.name,
        file,
        previewUrl: file.type.startsWith("image/") ? URL.createObjectURL(file) : null,
      }));
      setAttachments(prev => [...prev, ...newItems]);
    }
    e.target.value = '';
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        void handleSubmit();
        return;
      }
      if (e.key === "Escape" && mentionQuery !== null) {
        setMentionQuery(null);
      }
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === '7') {
        e.preventDefault();
        document.execCommand('insertOrderedList', false);
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === '8') {
        e.preventDefault();
        document.execCommand('insertUnorderedList', false);
        return;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mentionQuery],
  );

  const handleInput = useCallback(() => {
    const el = editorRef.current;
    if (!el) return;
    const text = el.innerText.trim();
    setIsEmpty(text === "" || text === "\n" || el.innerHTML === "<br>");
    detectMention();
  }, [detectMention]);

  const handleMentionSelect = useCallback(
    (user: CommentUser) => {
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
    },
    [mentionQuery],
  );

  const handleSubmit = useCallback(async () => {
    const el = editorRef.current;
    if (!el) return;
    const raw = el.innerHTML;
    const clean = sanitizeHtml(raw);
    const text = el.innerText.trim();
    if (!text) return;

    const attachmentData: Attachment[] = await Promise.all(
      attachments.map(async (a) => {
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
    <Box sx={{ display: "flex", flexDirection: "column" }}>
      {/* Reply-to banner */}
      {replyToName && (
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 1.5, py: 0.75, mb: 0.5, borderRadius: 2, bgcolor: "rgba(71,59,171,0.06)", fontSize: 12, color: "#473bab" }}>
          <Typography component="span" sx={{ fontSize: 12, color: "#473bab" }}>
            Replying to <strong>{replyToName}</strong>
          </Typography>
          {onCancelReply && (
            <IconButton
              onClick={onCancelReply}
              aria-label="Cancel reply"
              size="small"
              sx={{ ml: 1, color: "#686576", p: 0, "&:hover": { color: "#1f1d25", bgcolor: "transparent" } }}
            >
              ✕
            </IconButton>
          )}
        </Box>
      )}

      {/* Outer box */}
      <Box
        sx={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          borderRadius: 3,
          border: "1px solid #e8e7ef",
          bgcolor: "background.paper",
          transition: "border-color 0.15s, box-shadow 0.15s",
          "&:focus-within": {
            borderColor: "#473bab",
            boxShadow: "0 0 0 1px rgba(71,59,171,0.2)",
          },
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
            minHeight: 60,
            maxHeight: 160,
            overflowY: "auto",
            px: 1.5,
            pt: 1.25,
            pb: 0.5,
            fontSize: 13,
            lineHeight: 1.5,
            color: "#1f1d25",
            outline: "none",
            resize: "none",
            // Placeholder via CSS :empty
            "&:empty::before": {
              content: `attr(aria-label)`,
              color: "#9c99a9",
              pointerEvents: "none",
            },
            // Mention chips
            "& [data-mention-id]": {
              color: "#473bab",
              fontWeight: 500,
            },
            // List styles
            "& ol": { listStyleType: "decimal", paddingLeft: 20 },
            "& ul": { listStyleType: "disc", paddingLeft: 20 },
            "& li": { marginLeft: 4 },
          }}
        />

        {/* Attachment preview */}
        {attachments.length > 0 && (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, px: 1.5, pb: 0.5 }}>
            {attachments.map((att, i) => (
              att.previewUrl ? (
                <Box key={att.id} sx={{ position: "relative" }}>
                  <Box
                    component="img"
                    src={att.previewUrl}
                    alt={att.name}
                    title={att.name}
                    sx={{ width: 40, height: 40, borderRadius: 2, objectFit: "cover", border: "1px solid rgba(0,0,0,0.1)", display: "block" }}
                  />
                  <IconButton
                    size="small"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      URL.revokeObjectURL(att.previewUrl!);
                      setAttachments(prev => prev.filter((_, j) => j !== i));
                    }}
                    sx={{ position: "absolute", top: -4, right: -4, width: 16, height: 16, p: 0, bgcolor: "rgba(0,0,0,0.5)", color: "white", fontSize: 10, borderRadius: "50%", "&:hover": { bgcolor: "rgba(0,0,0,0.7)" } }}
                  >
                    ×
                  </IconButton>
                </Box>
              ) : (
                <Box key={att.id} sx={{ display: "flex", alignItems: "center", gap: 0.5, px: 1, py: 0.5, borderRadius: 1, bgcolor: "rgba(0,0,0,0.05)", fontSize: 11, color: "#686576" }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
                  </svg>
                  <Box component="span" sx={{ maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{att.name}</Box>
                  <IconButton
                    size="small"
                    onMouseDown={(e) => { e.preventDefault(); setAttachments(prev => prev.filter((_, j) => j !== i)); }}
                    sx={{ p: 0, color: "#9c99a9", "&:hover": { color: "#686576", bgcolor: "transparent" } }}
                  >
                    ×
                  </IconButton>
                </Box>
              )
            ))}
          </Box>
        )}

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          style={{ display: "none" }}
          onChange={handleFileChange}
        />

        {/* Toolbar + send row */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 1, pb: 1, pt: 0.25 }}>
          <FormattingToolbar onFormat={handleFormat} onMentionTrigger={handleMentionTrigger} onAttach={handleAttach} />

          <IconButton
            onClick={() => void handleSubmit()}
            disabled={isEmpty}
            aria-label="Send comment"
            size="small"
            sx={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              transition: "background-color 0.15s",
              ...(isEmpty
                ? { color: "#cac9cf", cursor: "not-allowed" }
                : { bgcolor: "#473bab", color: "white", "&:hover": { bgcolor: "#382f8f" } }),
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </IconButton>
        </Box>

        {/* Mention overlay — floats above the composer */}
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
