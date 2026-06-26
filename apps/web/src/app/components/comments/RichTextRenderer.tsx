// ─── RichTextRenderer ────────────────────────────────────────────────────────
// Safely renders sanitized HTML from comments / replies.
// Mention spans (data-mention-id) are styled in brand purple.
// sanitizeHtml() in utils.ts handles sanitization without DOMPurify.
import Box from '@mui/material/Box';
import { sanitizeHtml } from './utils';

interface RichTextRendererProps {
  html: string;
  className?: string;
}

export function RichTextRenderer({ html, className = "" }: RichTextRendererProps) {
  const clean = sanitizeHtml(html);
  return (
    <Box
      className={className}
      sx={{
        fontSize: '0.8125rem',
        lineHeight: 1.5,
        color: 'text.primary',
        wordBreak: 'break-word',
        '& [data-mention-id]': { color: 'primary.main', fontWeight: 500, cursor: 'default' },
        '& strong, & b': { fontWeight: 600 },
        '& em, & i': { fontStyle: 'italic' },
        '& u': { textDecoration: 'underline' },
        '& s, & strike': { textDecoration: 'line-through' },
        '& a': { color: 'primary.main', textDecoration: 'underline' },
        '& ul': { listStyle: 'disc', pl: '20px', my: '4px' },
        '& ol': { listStyle: 'decimal', pl: '20px', my: '4px' },
        '& p': { mb: 0 },
      }}
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
}
