// Stub — full pre-approval annotation viewer will be ported by follow-up agent
import { useState } from 'react';
import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Divider from '@mui/material/Divider';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import AutorenewOutlinedIcon from '@mui/icons-material/AutorenewOutlined';
import type { PreApproval } from '../FundsPreApprovalsContent';

interface DrawerOEMProps {
  open: boolean;
  onClose: () => void;
  preApproval?: PreApproval;
  onApprove: (comment: string) => void;
  onRequestRevision: (comment: string) => void;
}

export function DrawerOEM({ open, onClose, preApproval, onApprove, onRequestRevision }: DrawerOEMProps) {
  const [comment, setComment] = useState('');

  const handleApprove = () => {
    onApprove(comment);
    setComment('');
  };
  const handleRevision = () => {
    onRequestRevision(comment);
    setComment('');
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: { xs: '100vw', md: 720 }, display: 'flex', flexDirection: 'column' } }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 3, py: 2, borderBottom: '1px solid', borderColor: 'divider', flexShrink: 0 }}>
        <Typography sx={{ fontWeight: 600, fontSize: '1.0625rem' }}>OEM Review</Typography>
        <IconButton size="small" onClick={onClose}><CloseIcon /></IconButton>
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, overflowY: 'auto', p: 3 }}>
        {preApproval ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box sx={{ p: 2, bgcolor: 'surface.filled', borderRadius: 2 }}>
              <Typography sx={{ fontWeight: 600, mb: 0.5 }}>{preApproval.title ?? 'Pre-Approval'}</Typography>
              <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary' }}>
                {preApproval.dealershipName} · {preApproval.mediaType}
              </Typography>
            </Box>
            {preApproval.documents?.map((doc, i) => (
              <Box key={i} sx={{ p: 1.5, borderRadius: 2, border: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontSize: '0.8125rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.name}</Typography>
                  <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>{doc.type} · {doc.size}</Typography>
                </Box>
              </Box>
            ))}
          </Box>
        ) : (
          <Typography sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
            No pre-approval selected.
          </Typography>
        )}
      </Box>

      {/* Footer */}
      <Divider />
      <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2, flexShrink: 0 }}>
        <TextField
          multiline rows={3} fullWidth
          placeholder="Add a note or feedback (optional)"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, fontSize: '0.875rem' } }}
        />
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<AutorenewOutlinedIcon />}
            onClick={handleRevision}
            disabled={!preApproval}
            sx={{ borderRadius: 999, textTransform: 'none', borderColor: 'divider', color: 'text.primary', '&:hover': { borderColor: 'text.secondary' } }}
          >
            Request Revision
          </Button>
          <Button
            fullWidth
            variant="contained"
            startIcon={<CheckCircleOutlinedIcon />}
            onClick={handleApprove}
            disabled={!preApproval}
            sx={{ borderRadius: 999, textTransform: 'none' }}
          >
            Approve
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
}
