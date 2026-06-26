// TODO: port full implementation from vw-funds-2
// PreApprovalForm is not ported yet; this stub renders the layout shell with MUI.
import { useState, useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import Slide from '@mui/material/Slide';
import type { TransitionProps } from '@mui/material/transitions';
import { forwardRef } from 'react';
import { emitSnackbar } from '../Snackbar';

const SlideUp = forwardRef(function Transition(
  props: TransitionProps & { children: React.ReactElement },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

interface ProjectsPreApprovalDrawerProps {
  open: boolean;
  onClose: () => void;
  assets: string[];
}

export function ProjectsPreApprovalDrawer({ open, onClose, assets }: ProjectsPreApprovalDrawerProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open && !isSubmitting && !isSubmitted) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose, isSubmitting, isSubmitted]);

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      emitSnackbar('Pre-approval submitted');
      setTimeout(() => {
        onClose();
        setTimeout(() => setIsSubmitted(false), 500);
      }, 3000);
    }, 1500);
  };

  return (
    <Dialog
      open={open}
      onClose={!isSubmitting ? onClose : undefined}
      TransitionComponent={SlideUp}
      maxWidth={false}
      PaperProps={{
        sx: {
          width: '95vw',
          height: '90vh',
          maxWidth: '95vw',
          borderRadius: '16px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      {/* Header */}
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 3, py: 2, borderBottom: '1px solid rgba(0,0,0,0.08)', flexShrink: 0 }}>
        <Typography sx={{ fontSize: 18, fontWeight: 600, color: 'text.primary' }}>
          Pre-approval Request
        </Typography>
        <IconButton onClick={onClose} disabled={isSubmitting} size="small">
          <CloseIcon sx={{ fontSize: 24, color: 'rgba(17,16,20,0.56)' }} />
        </IconButton>
      </DialogTitle>

      {/* Body */}
      <Box sx={{ flex: 1, display: 'flex', minHeight: 0, position: 'relative' }}>
        {/* Left pane: asset preview grid */}
        <Box sx={{ flex: 1, bgcolor: 'surface.canvas', minWidth: 0, overflow: 'auto', p: 3 }}>
          {assets.length === 0 ? (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <Typography sx={{ color: 'text.disabled', fontSize: 14 }}>No assets selected</Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 2 }}>
              {assets.map((src, i) => (
                <Box key={i} sx={{ borderRadius: 2, overflow: 'hidden', aspectRatio: '1/1', bgcolor: '#e0e0e0' }}>
                  <Box component="img" src={src} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </Box>
              ))}
            </Box>
          )}
        </Box>

        {/* Divider */}
        <Box sx={{ width: 1, bgcolor: 'rgba(0,0,0,0.08)', my: 2 }} />

        {/* Right pane: form stub */}
        <Box sx={{ width: 380, flexShrink: 0, bgcolor: 'surface.inputBackground', p: 3, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography sx={{ fontSize: 15, fontWeight: 500, color: 'text.primary' }}>Pre-Approval Details</Typography>
          <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
            {/* TODO: port PreApprovalForm from vw-funds-2 */}
            Submit the selected {assets.length} asset{assets.length !== 1 ? 's' : ''} for pre-approval review.
          </Typography>
          <Box sx={{ flex: 1 }} />
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={isSubmitting || assets.length === 0}
            sx={{ bgcolor: 'primary.main', borderRadius: '100px', textTransform: 'none', '&:hover': { bgcolor: 'primary.dark' } }}
          >
            Submit for Pre-Approval
          </Button>
        </Box>

        {/* Overlay: submitting / success */}
        {(isSubmitting || isSubmitted) && (
          <Box sx={{
            position: 'absolute', inset: 0, zIndex: 50,
            bgcolor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(4px)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2,
          }}>
            {isSubmitting ? (
              <>
                <CircularProgress sx={{ color: 'primary.main' }} />
                <Typography sx={{ fontSize: 16, fontWeight: 500, color: 'text.primary' }}>Submitting request...</Typography>
              </>
            ) : (
              <>
                <Box sx={{ width: 64, height: 64, bgcolor: 'primary.main', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckCircleOutlineIcon sx={{ color: 'white', fontSize: 32 }} />
                </Box>
                <Typography sx={{ fontSize: 20, fontWeight: 600, color: 'text.primary' }}>Request Submitted!</Typography>
                <Typography sx={{ fontSize: 14, color: 'text.secondary', maxWidth: 280, textAlign: 'center' }}>
                  Your pre-approval request has been successfully created and is being reviewed.
                </Typography>
                <Button onClick={onClose} variant="contained" sx={{ mt: 2, bgcolor: 'primary.main', borderRadius: '100px', textTransform: 'none', px: 4 }}>
                  Done
                </Button>
              </>
            )}
          </Box>
        )}
      </Box>
    </Dialog>
  );
}
