// TODO: port full implementation from vw-funds-2
// Stub: renders a functional Share modal with Send/Link tabs using MUI Dialog
import { useState, useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import CloseIcon from '@mui/icons-material/Close';

interface ShareReportModalProps {
  isOpen: boolean;
  reportName: string;
  onClose: () => void;
}

export function ShareReportModal({ isOpen, reportName, onClose }: ShareReportModalProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [requireLogin, setRequireLogin] = useState(false);

  useEffect(() => {
    if (isOpen) setActiveTab(0);
  }, [isOpen]);

  const shareUrl = `https://vwfunds.app/reports/shared/${encodeURIComponent(reportName.toLowerCase().replace(/\s+/g, '-'))}`;

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 4 } }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 0 }}>
        <Typography sx={{ fontSize: '15px', fontWeight: 600, color: 'text.primary', letterSpacing: '-0.1px' }}>
          Share AI Report
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </DialogTitle>

      <Box sx={{ px: 3, borderBottom: '1px solid #E8E9EC' }}>
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          sx={{ '& .MuiTab-root': { fontSize: '13px', fontWeight: 500, textTransform: 'none', color: 'text.secondary' }, '& .Mui-selected': { color: 'primary.main' } }}
        >
          <Tab label="Send And Schedule" />
          <Tab label="Public Link" />
        </Tabs>
      </Box>

      <DialogContent>
        {activeTab === 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '20px', pt: '4px' }}>
            <Box>
              <Typography sx={{ fontSize: '12px', color: 'text.secondary', mb: '6px' }}>Report title</Typography>
              <TextField
                value={reportName}
                fullWidth
                size="small"
                inputProps={{ readOnly: true }}
                sx={{ '& .MuiInputBase-input': { fontSize: '13px' } }}
              />
            </Box>
            <Box>
              <Typography sx={{ fontSize: '12px', color: 'text.secondary', mb: '6px' }}>Recipients</Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="Add recipients…"
                sx={{ '& .MuiInputBase-input': { fontSize: '13px' } }}
              />
            </Box>
          </Box>
        )}
        {activeTab === 1 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px', pt: '4px' }}>
            <Box>
              <Typography sx={{ fontSize: '12px', color: 'text.secondary', mb: '6px' }}>Report title</Typography>
              <TextField value={reportName} fullWidth size="small" inputProps={{ readOnly: true }} sx={{ '& .MuiInputBase-input': { fontSize: '13px' } }} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: '12px', color: 'text.secondary', mb: '6px' }}>Shareable link</Typography>
              <TextField value={shareUrl} fullWidth size="small" inputProps={{ readOnly: true }} sx={{ '& .MuiInputBase-input': { fontSize: '12px', color: 'text.secondary' } }} />
            </Box>
            <FormControlLabel
              control={<Switch checked={requireLogin} onChange={e => setRequireLogin(e.target.checked)} size="small" />}
              label={<Typography sx={{ fontSize: '13px' }}>Require login to view</Typography>}
            />
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid #E8E9EC', gap: '12px' }}>
        <Button onClick={onClose} sx={{ color: 'text.secondary', textTransform: 'none', fontWeight: 500, borderRadius: '100px', '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' } }}>
          Cancel
        </Button>
        <Button
          onClick={onClose}
          variant="contained"
          sx={{ bgcolor: 'primary.main', textTransform: 'none', fontWeight: 500, borderRadius: '100px', '&:hover': { bgcolor: '#392e8a' } }}
        >
          {activeTab === 0 ? 'Send' : 'Done'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// Re-export SchedulePanel as a stub so WebMonitoringConfigModal can import it
export function SchedulePanel(_props?: {
  defaultEnabled?: boolean;
  defaultExpanded?: boolean;
  defaultRepeatEvery?: number;
  defaultRepeatUnit?: string;
  defaultEndsType?: string;
}) {
  // TODO: port full SchedulePanel from vw-funds-2/src/app/components/ShareReportModal.tsx
  return (
    <Box sx={{ border: '1px solid #E8E9EC', borderRadius: '10px', p: '16px' }}>
      <Typography sx={{ fontSize: '13px', color: 'text.secondary' }}>Schedule (stub)</Typography>
    </Box>
  );
}
