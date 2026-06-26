import { forwardRef, type ReactNode } from 'react';
import MuiDrawer, { type DrawerProps as MuiDrawerProps } from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';

export interface DrawerProps
  extends Omit<MuiDrawerProps, 'anchor' | 'onClose' | 'title'> {
  /** Header title — e.g. "Client Settings", "Filters". */
  title?: ReactNode;
  /** Called by the header X, the backdrop and the Escape key. */
  onClose?: () => void;
  /**
   * Panel width in px. @default 320 (the app's side sheets default to 280
   * and resize 200–480; 320 is a comfortable middle for fixed content)
   */
  width?: number;
}

const Root = styled(MuiDrawer)({
  '& .MuiDrawer-paper': {
    // Side-sheet pattern from the original app (side-sheet/SideSheet.tsx)
    display: 'flex',
    flexDirection: 'column',
  },
});

function CloseGlyph() {
  return (
    <svg
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

/**
 * Constellation Drawer — right-anchored side sheet following the app's
 * SideSheet pattern: 16px header padding, 16px medium title, round 30px
 * close button, divider, scrollable content with 16px/24px padding.
 */
export const Drawer = forwardRef<HTMLDivElement, DrawerProps>(function Drawer(
  { title, onClose, width = 320, children, ...props },
  ref,
) {
  return (
    <Root
      ref={ref}
      anchor="right"
      onClose={onClose}
      slotProps={{ paper: { sx: { width } } }}
      {...props}
    >
      {/* Header — app side-sheet: min-h 40, px 16, pt 12, pb 8 */}
      <Box
        sx={{
          flex: 'none',
          display: 'flex',
          alignItems: 'center',
          minHeight: 40,
          px: 2,
          pt: 1.5,
          pb: 1,
        }}
      >
        <Typography
          variant="h4"
          component="h2"
          sx={{ flex: 1, pr: 4, letterSpacing: '0.15px' }}
        >
          {title}
        </Typography>
        {onClose ? (
          <IconButton
            aria-label="Close panel"
            onClick={onClose}
            size="small"
            sx={{
              width: 30,
              height: 30,
              flex: 'none',
              color: 'ink.secondary',
            }}
          >
            <CloseGlyph />
          </IconButton>
        ) : null}
      </Box>
      <Divider sx={{ flex: 'none' }} />
      {/* Content slot — scrollable, px 16 / pt 4 / pb 24 per the app */}
      <Box sx={{ flex: 1, overflowY: 'auto', px: 2, pt: 0.5, pb: 3 }}>
        {children}
      </Box>
    </Root>
  );
});
