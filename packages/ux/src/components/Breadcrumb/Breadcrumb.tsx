import { forwardRef, type MouseEvent, type ReactNode } from 'react';
import MuiBreadcrumbs, {
  type BreadcrumbsProps as MuiBreadcrumbsProps,
} from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

export interface BreadcrumbItem {
  label: ReactNode;
  /** Renders the segment as an anchor. */
  href?: string;
  /** Click handler — without `href` the segment renders as a button. */
  onClick?: (event: MouseEvent) => void;
}

export interface BreadcrumbProps
  extends Omit<MuiBreadcrumbsProps, 'children'> {
  /**
   * Trail segments in order. The last item is the current page: rendered in
   * ink.primary with `aria-current="page"` and never linked.
   */
  items: BreadcrumbItem[];
}

// 11px / 400 / 0.4px tracking — per BreadcrumbBar in the original app.
const segmentTypography = {
  fontSize: '0.6875rem',
  fontWeight: 400,
  letterSpacing: '0.4px',
  lineHeight: 1.6,
} as const;

/**
 * Constellation Breadcrumb — MuiBreadcrumbs driven by an `items` array.
 * Ancestor segments are muted (ink.secondary, darken on hover); the last
 * segment is the active page (ink.primary, non-interactive). Separator is a
 * small chevron, per the app's BreadcrumbBar.
 */
export const Breadcrumb = forwardRef<HTMLElement, BreadcrumbProps>(
  function Breadcrumb({ items, sx, ...props }, ref) {
    return (
      <MuiBreadcrumbs
        ref={ref}
        aria-label="Breadcrumb"
        separator={<NavigateNextIcon sx={{ fontSize: 14 }} />}
        sx={[
          {
            color: 'ink.secondary',
            // App uses a tight 4px gap between segments and chevrons.
            '& .MuiBreadcrumbs-separator': { mx: 0.5 },
          },
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
        {...props}
      >
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          if (isLast) {
            return (
              <Typography
                key={index}
                aria-current="page"
                sx={{ ...segmentTypography, color: 'ink.primary' }}
              >
                {item.label}
              </Typography>
            );
          }

          if (item.href || item.onClick) {
            return (
              <Link
                key={index}
                href={item.href}
                component={item.href ? 'a' : 'button'}
                type={item.href ? undefined : 'button'}
                onClick={item.onClick}
                underline="none"
                sx={{
                  ...segmentTypography,
                  color: 'ink.secondary',
                  cursor: 'pointer',
                  transition: 'color 150ms',
                  '&:hover': { color: 'ink.primary' },
                }}
              >
                {item.label}
              </Link>
            );
          }

          return (
            <Typography
              key={index}
              sx={{ ...segmentTypography, color: 'ink.secondary' }}
            >
              {item.label}
            </Typography>
          );
        })}
      </MuiBreadcrumbs>
    );
  },
);
