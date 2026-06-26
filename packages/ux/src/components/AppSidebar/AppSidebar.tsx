import { forwardRef, type ReactNode } from 'react';
import Box, { type BoxProps } from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
// Type-only import: pulls in the palette augmentation (palette.rail/ink/...)
// declared next to the theme, without any runtime dependency.
import type {} from '../../theme/createConstellationTheme';

/** Fixed rail width from the original app (`w-[72px]`). */
export const APP_SIDEBAR_WIDTH = 72;

export interface AppSidebarItem {
  /** Stable identifier passed to `onSelect` and matched against `activeId`. */
  id: string;
  label: string;
  /** 24px icon (e.g. an @mui/icons-material icon). Inherits rail.icon color. */
  icon: ReactNode;
}

export interface AppSidebarProps
  extends Omit<BoxProps, 'children' | 'onSelect'> {
  /** Navigation entries, top to bottom. */
  items: AppSidebarItem[];
  /** id of the active item — gets the rail.active pill behind its icon. */
  activeId?: string;
  /** Called with the item id when an entry is clicked. */
  onSelect?: (id: string) => void;
  /** Slot rendered at the top of the rail (client logo, 40x40 in the app). */
  logo?: ReactNode;
  /** Slot pinned to the bottom of the rail (e.g. a Help item). */
  footer?: ReactNode;
}

/**
 * Constellation AppSidebar — the dark 72px navigation rail on the left of the
 * app. Built with Box + ButtonBase (not MuiDrawer): the original rail is a
 * plain fixed column with no Paper surface, transitions or breakpoint
 * behavior, so a permanent Drawer would only add wrappers to fight against.
 * Position it with the parent layout (e.g. `position: fixed; inset: 0 auto 0 0`).
 *
 * Visuals per the app: bg rail.bg, 56x32 pill in rail.active behind the
 * active icon (10% tint on hover), icons in rail.icon, 11px labels.
 */
export const AppSidebar = forwardRef<HTMLElement, AppSidebarProps>(
  function AppSidebar(
    { items, activeId, onSelect, logo, footer, sx, ...props },
    ref,
  ) {
    return (
      <Box
        ref={ref}
        component="nav"
        sx={[
          {
            width: APP_SIDEBAR_WIDTH,
            flexShrink: 0,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            bgcolor: 'rail.bg',
            overflow: 'hidden',
          },
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
        {...props}
      >
        {/* Logo slot — 60px tall area with 10px top padding, per the app */}
        {logo ? (
          <Box
            sx={{
              height: 60,
              pt: '10px',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {logo}
          </Box>
        ) : null}

        {/* Nav items — 12px gap, 12px top padding, per the app */}
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            pt: 1.5,
            gap: 1.5,
            overflowY: 'auto',
          }}
        >
          {items.map((item) => {
            const active = item.id === activeId;
            return (
              <ButtonBase
                key={item.id}
                onClick={() => onSelect?.(item.id)}
                aria-current={active ? 'page' : undefined}
                sx={{
                  width: '100%',
                  height: 48,
                  flexShrink: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  // Hover tint on the icon pill (app: rail.active at 10%)
                  '&:hover .ConstellationAppSidebar-pill': active
                    ? undefined
                    : {
                        bgcolor: (theme) =>
                          alpha(theme.palette.rail.active, 0.1),
                      },
                }}
              >
                <Box
                  className="ConstellationAppSidebar-pill"
                  sx={{
                    width: 56,
                    height: 32,
                    borderRadius: 999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'background-color 200ms',
                    bgcolor: active ? 'rail.active' : 'transparent',
                    color: 'rail.icon',
                    '& svg': { fontSize: 24 },
                  }}
                >
                  {item.icon}
                </Box>
                <Typography
                  sx={{
                    fontSize: '0.6875rem',
                    letterSpacing: '0.4px',
                    lineHeight: 1,
                    whiteSpace: 'nowrap',
                    color: 'rail.text',
                  }}
                >
                  {item.label}
                </Typography>
              </ButtonBase>
            );
          })}
        </Box>

        {/* Footer slot — pinned to the bottom (Help / library in the app) */}
        {footer ? (
          <Box
            sx={{
              width: '100%',
              flexShrink: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              pb: 1.5,
              gap: 1.5,
            }}
          >
            {footer}
          </Box>
        ) : null}
      </Box>
    );
  },
);
