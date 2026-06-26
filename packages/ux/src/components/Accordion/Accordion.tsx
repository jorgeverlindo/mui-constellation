import { forwardRef, type ReactNode } from 'react';
import MuiAccordion, {
  type AccordionProps as MuiAccordionProps,
} from '@mui/material/Accordion';
import MuiAccordionSummary from '@mui/material/AccordionSummary';
import MuiAccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export interface AccordionProps
  extends Omit<MuiAccordionProps, 'children' | 'title' | 'variant'> {
  /** Header content. Strings get the DS header typography (14px / 500 / ink). */
  title: ReactNode;
  /** Slot rendered at the right edge of the header, before the chevron. */
  secondary?: ReactNode;
  /**
   * Visual style:
   * - `divider` (default) — flat list row with a bottom divider, like the
   *   app's `ui/accordion.tsx`.
   * - `filled` — soft grey rounded card, like `ProjectAccordionSection`.
   */
  variant?: 'divider' | 'filled';
  /** Body revealed when expanded. */
  children?: ReactNode;
}

/**
 * Constellation Accordion — thin wrapper over MuiAccordion/Summary/Details.
 * No elevation, rotating chevron on the right, 44px header. `divider` renders
 * a flat row with a bottom border; `filled` renders the grey rounded card used
 * in the project detail sections.
 */
export const Accordion = forwardRef<HTMLDivElement, AccordionProps>(
  function Accordion(
    { title, secondary, variant = 'divider', children, sx, ...props },
    ref,
  ) {
    const filled = variant === 'filled';

    return (
      <MuiAccordion
        ref={ref}
        disableGutters
        square
        elevation={0}
        sx={[
          {
            // Remove the MUI top pseudo-divider; we own all borders here.
            '&::before': { display: 'none' },
            backgroundColor: 'transparent',
            boxShadow: 'none',
            backgroundImage: 'none',
          },
          filled
            ? {
                backgroundColor: 'surface.filled',
                borderRadius: '12px',
                overflow: 'hidden',
              }
            : {
                borderBottom: '1px solid',
                borderColor: 'divider',
              },
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
        {...props}
      >
        <MuiAccordionSummary
          expandIcon={
            <ExpandMoreIcon
              fontSize="small"
              // App chevron is rgba(17,16,20,0.56); ink.secondary is the
              // closest token.
              sx={{ color: 'ink.secondary' }}
            />
          }
          sx={{
            minHeight: 44,
            px: filled ? 2.5 : 0,
            '& .MuiAccordionSummary-content': {
              my: '10px',
              alignItems: 'center',
              gap: 1,
            },
          }}
        >
          {typeof title === 'string' ? (
            <Typography
              sx={{
                fontSize: '0.875rem',
                fontWeight: 500,
                color: 'text.primary',
                flex: 1,
                minWidth: 0,
              }}
            >
              {title}
            </Typography>
          ) : (
            title
          )}
          {secondary}
        </MuiAccordionSummary>
        <MuiAccordionDetails
          sx={{
            pt: 0,
            pb: 2,
            px: filled ? 2 : 0,
            fontSize: '0.875rem',
            color: 'text.primary',
          }}
        >
          {children}
        </MuiAccordionDetails>
      </MuiAccordion>
    );
  },
);
