import { forwardRef, type ReactNode } from 'react';
import MuiAppBar, {
  type AppBarProps as MuiAppBarProps,
} from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

/** Bar height from the original app's TopNavBar (`h-12`). */
export const TOP_BAR_HEIGHT = 48;

export interface TopBarProps extends Omit<MuiAppBarProps, 'title'> {
  /**
   * Left slot — page title or a Breadcrumb. Strings get 16px / 500 / ink
   * typography; any other ReactNode renders as-is.
   */
  title?: ReactNode;
  /** Right slot — actions (icon buttons, avatar...), 8px apart. */
  actions?: ReactNode;
  /** Center slot — stretches between title and actions (e.g. global search). */
  children?: ReactNode;
  /** Renders a 1px bottom border in the theme divider color. Default false —
   * the original app's top bar has no border. */
  divider?: boolean;
}

/**
 * Constellation TopBar — the light 48px application header. Slots: `title`
 * (left), `children` (center, flexible) and `actions` (right). Defaults to
 * `position="static"` and no elevation so it composes into any layout; in the
 * app it sits fixed at the top, to the right of the AppSidebar rail.
 */
export const TopBar = forwardRef<HTMLElement, TopBarProps>(function TopBar(
  { title, actions, children, divider = false, sx, ...props },
  ref,
) {
  return (
    <MuiAppBar
      ref={ref}
      position="static"
      elevation={0}
      sx={[
        {
          bgcolor: 'surface.topbar',
          color: 'text.primary',
          borderBottom: divider ? '1px solid' : 'none',
          borderColor: 'divider',
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...props}
    >
      <Toolbar
        disableGutters
        sx={{
          // App: fixed 48px height with 24px horizontal padding.
          height: TOP_BAR_HEIGHT,
          minHeight: { xs: TOP_BAR_HEIGHT },
          px: 3,
          gap: 2,
        }}
      >
        {title !== undefined && title !== null ? (
          typeof title === 'string' ? (
            <Typography
              sx={{
                fontSize: '1rem',
                fontWeight: 500,
                color: 'text.primary',
                whiteSpace: 'nowrap',
              }}
            >
              {title}
            </Typography>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 0 }}>
              {title}
            </Box>
          )
        ) : null}

        {/* Center slot — takes the remaining width (search in the app) */}
        <Box sx={{ flex: 1, minWidth: 0 }}>{children}</Box>

        {actions ? (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              flexShrink: 0,
            }}
          >
            {actions}
          </Box>
        ) : null}
      </Toolbar>
    </MuiAppBar>
  );
});
