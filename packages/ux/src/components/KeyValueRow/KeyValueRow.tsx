import { forwardRef, useRef, useState, type ReactNode } from 'react';
import Box, { type BoxProps } from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import ContentCopy from '@mui/icons-material/ContentCopy';
import Check from '@mui/icons-material/Check';
import { Tooltip } from '../Tooltip/Tooltip';
// Palette module augmentation (brand/ink/rail/surface)
import type {} from '../../theme/createConstellationTheme';

export interface KeyValueRowProps extends BoxProps {
  /** Left-hand label (ink.secondary, 13px) */
  label: ReactNode;
  /** Right-hand value (ink.primary, 13px medium). Accepts any node (e.g. a Chip). */
  value: ReactNode;
  /**
   * Plain string written to the clipboard. When set, a copy button fades in
   * on row hover, with "Copy value" → "Copied!" tooltip feedback.
   */
  copyValue?: string;
  /** Bottom divider (omit on the last row of a list). @default true */
  divider?: boolean;
}

/** execCommand fallback for HTTP / older browsers (mirrors the original app). */
function execCopy(text: string): void {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0;pointer-events:none';
  document.body.appendChild(ta);
  ta.focus();
  ta.select();
  try {
    document.execCommand('copy');
  } catch {
    /* noop */
  }
  document.body.removeChild(ta);
}

/**
 * Constellation KeyValueRow — label/value line for detail panels.
 *
 * Reference: original app KeyValueRow (13px label/value, py 14px, hairline
 * divider) plus the VinDetailContent DetailRow copy-on-hover behavior
 * (hidden copy button, clipboard write with execCommand fallback, "Copied!"
 * feedback).
 */
export const KeyValueRow = forwardRef<HTMLDivElement, KeyValueRowProps>(
  function KeyValueRow({ label, value, copyValue, divider = true, sx, ...props }, ref) {
    const [copied, setCopied] = useState(false);
    const resetTimer = useRef<number | undefined>(undefined);

    const handleCopy = () => {
      if (!copyValue) return;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(copyValue).catch(() => execCopy(copyValue));
      } else {
        execCopy(copyValue);
      }
      setCopied(true);
      window.clearTimeout(resetTimer.current);
      resetTimer.current = window.setTimeout(() => setCopied(false), 1500);
    };

    return (
      <Box
        ref={ref}
        sx={[
          {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1,
            py: 1.75,
            // app uses #F0F0F0 (no token) — divider token is the closest
            borderBottom: divider ? '1px solid' : 'none',
            borderColor: 'divider',
            '&:hover .ConstellationKeyValueRow-copy': {
              opacity: 1,
              pointerEvents: 'auto',
            },
          },
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
        {...props}
      >
        <Typography sx={{ fontSize: 13, color: 'ink.secondary', flexShrink: 0 }}>
          {label}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 0 }}>
          <Typography
            component="div"
            sx={{ fontSize: 13, fontWeight: 500, color: 'ink.primary', textAlign: 'right' }}
          >
            {value}
          </Typography>

          {copyValue !== undefined && (
            <Tooltip title={copied ? 'Copied!' : 'Copy value'} placement="top">
              <IconButton
                aria-label="Copy value"
                size="small"
                onClick={handleCopy}
                className="ConstellationKeyValueRow-copy"
                sx={(theme) => ({
                  width: 28,
                  height: 28,
                  opacity: 0,
                  pointerEvents: 'none',
                  transition: theme.transitions.create('opacity', { duration: 150 }),
                  color: copied ? theme.palette.brand.accent : theme.palette.ink.secondary,
                  '&:focus-visible': { opacity: 1, pointerEvents: 'auto' },
                })}
              >
                {copied ? (
                  <Check sx={{ fontSize: 16 }} />
                ) : (
                  <ContentCopy sx={{ fontSize: 16 }} />
                )}
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>
    );
  },
);
