import { useState, useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Slide from '@mui/material/Slide';
import type { TransitionProps } from '@mui/material/transitions';
import { forwardRef } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { emitSnackbar } from '../Snackbar';
import { useWorkflow } from '../../contexts/WorkflowContext';

const SlideUp = forwardRef(function Transition(
  props: TransitionProps & { children: React.ReactElement },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

interface PortalPreApprovalDrawerProps {
  open: boolean;
  onClose: () => void;
  assets: string[];
}

export function PortalPreApprovalDrawer({ open, onClose, assets }: PortalPreApprovalDrawerProps) {
  const { addPortalSubmission } = useWorkflow();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open && !isSubmitting && !isSubmitted) onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose, isSubmitting, isSubmitted]);

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      addPortalSubmission({ title: 'Portal Pre-Approval Request', mediaType: 'Digital', initiativeType: 'Brand Awareness' });
      setIsSubmitting(false);
      setIsSubmitted(true);
      emitSnackbar('Pre-approval submitted');
      setTimeout(() => {
        onClose();
        setTimeout(() => setIsSubmitted(false), 500);
      }, 2500);
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
          width: '92vw', maxWidth: 1100, height: '88vh',
          borderRadius: 3, overflow: 'hidden', display: 'flex', flexDirection: 'column',
        },
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 3, py: 2, borderBottom: '1px solid', borderColor: 'divider', flexShrink: 0 }}>
        <Typography sx={{ fontSize: '1.125rem', fontWeight: 600 }}>Pre-approval Request</Typography>
        <IconButton onClick={onClose} disabled={isSubmitting} size="small">
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Body */}
      <Box sx={{ flex: 1, minHeight: 0, display: 'flex', position: 'relative' }}>
        {/* Left: preview */}
        <Box sx={{ flex: 1, bgcolor: '#F0F2F4', overflow: 'hidden', display: 'flex', flexWrap: 'wrap', gap: 2, p: 3, alignContent: 'flex-start', overflowY: 'auto' }}>
          {assets.length === 0 ? (
            <Typography sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>No assets selected.</Typography>
          ) : (
            assets.map((src, i) => (
              <Box key={i} sx={{ width: 200, height: 200, borderRadius: 2, overflow: 'hidden', flexShrink: 0 }}>
                <Box component="img" src={src} alt={`Asset ${i + 1}`} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </Box>
            ))
          )}
        </Box>

        <Box sx={{ width: 1, bgcolor: 'divider', my: 2, flexShrink: 0 }} />

        {/* Right: form stub */}
        <Box sx={{ width: 380, flexShrink: 0, bgcolor: 'surface.topbar', p: 3, display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}>
          <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'text.primary' }}>Pre-approval details</Typography>
          <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary', lineHeight: 1.6 }}>
            Submit the selected {assets.length} asset{assets.length !== 1 ? 's' : ''} for OEM review.
            Once approved, the campaign can proceed.
          </Typography>
          <Box sx={{ flex: 1 }} />
          <Button
            variant="contained"
            fullWidth
            onClick={handleSubmit}
            disabled={isSubmitting || isSubmitted}
            sx={{ borderRadius: 999, textTransform: 'none' }}
          >
            {isSubmitting ? 'Submitting…' : 'Submit for Pre-Approval'}
          </Button>
        </Box>

        {/* Success/loading overlay */}
        {(isSubmitting || isSubmitted) && (
          <Box sx={{
            position: 'absolute', inset: 0, zIndex: 50,
            bgcolor: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(4px)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2,
          }}>
            {isSubmitting ? (
              <>
                <CircularProgress size={40} />
                <Typography sx={{ fontWeight: 500 }}>Submitting request…</Typography>
              </>
            ) : (
              <>
                <Box sx={{ width: 64, height: 64, borderRadius: '50%', bgcolor: 'brand.accent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckCircleOutlineIcon sx={{ fontSize: 36, color: '#fff' }} />
                </Box>
                <Typography sx={{ fontSize: '1.25rem', fontWeight: 600 }}>Request Submitted!</Typography>
                <Typography sx={{ fontSize: '0.875rem', color: 'text.secondary', textAlign: 'center', maxWidth: 280 }}>
                  Your pre-approval request has been successfully created and is being reviewed.
                </Typography>
                <Button variant="contained" onClick={onClose} sx={{ borderRadius: 999, mt: 1, textTransform: 'none' }}>
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
