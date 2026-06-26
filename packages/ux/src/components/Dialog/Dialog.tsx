import { forwardRef } from 'react';
import MuiDialog, { type DialogProps as MuiDialogProps } from '@mui/material/Dialog';
import MuiDialogTitle, {
  type DialogTitleProps as MuiDialogTitleProps,
} from '@mui/material/DialogTitle';
import MuiDialogContent, {
  type DialogContentProps as MuiDialogContentProps,
} from '@mui/material/DialogContent';
import MuiDialogActions, {
  type DialogActionsProps as MuiDialogActionsProps,
} from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import { styled } from '@mui/material/styles';
// Load the Constellation palette augmentation (palette.ink/brand/...)
import type {} from '../../theme/createConstellationTheme';
import { shapeTokens } from '../../theme/tokens';

export type DialogProps = MuiDialogProps;

const Root = styled(MuiDialog)({
  '& .MuiDialog-paper': {
    // Figma <Dialog> <Paper>: shapeTokens.modalRadius = 24px
    borderRadius: shapeTokens.modalRadius,
    // Anchor for the absolutely-positioned DialogTitle close button.
    position: 'relative',
  },
});

/**
 * Constellation Dialog — MUI Dialog with the DS modal paper radius.
 * Compose with `DialogTitle` (supports `onClose` for the corner X),
 * `DialogContent` and `DialogActions` from this module.
 */
export const Dialog = forwardRef<HTMLDivElement, DialogProps>(
  function Dialog(props, ref) {
    return <Root ref={ref} {...props} />;
  },
);

export interface DialogTitleProps extends MuiDialogTitleProps {
  /** When provided, renders the round close (X) button in the top-right corner. */
  onClose?: () => void;
}

// Original app modal header: px-6 pt-5, title 16–18px medium, 32px round X.
const TitleRoot = styled(MuiDialogTitle)(({ theme }) => ({
  padding: '20px 64px 0 24px',
  fontSize: '1.125rem',
  fontWeight: theme.typography.fontWeightMedium,
  lineHeight: 1.5,
  color: theme.palette.ink.primary,
}));

const CloseButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  top: 16,
  right: 16,
  width: 32,
  height: 32,
  color: theme.palette.ink.secondary,
}));

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

/** Dialog title with optional top-right close button (pass `onClose`). */
export const DialogTitle = forwardRef<HTMLHeadingElement, DialogTitleProps>(
  function DialogTitle({ onClose, children, ...props }, ref) {
    return (
      <>
        <TitleRoot ref={ref} {...props}>
          {children}
        </TitleRoot>
        {onClose ? (
          <CloseButton aria-label="Close" onClick={onClose} size="small">
            <CloseGlyph />
          </CloseButton>
        ) : null}
      </>
    );
  },
);

export type DialogContentProps = MuiDialogContentProps;

/** Dialog body — 24px horizontal padding per the app's modal layout. */
export const DialogContent = styled(MuiDialogContent)({
  padding: '16px 24px',
}) as typeof MuiDialogContent;

export type DialogActionsProps = MuiDialogActionsProps;

/** Footer actions — right-aligned, divider on top, per the app's modals. */
export const DialogActions = styled(MuiDialogActions)(({ theme }) => ({
  padding: '16px 24px',
  gap: 8,
  borderTop: `1px solid ${theme.palette.divider}`,
})) as typeof MuiDialogActions;
