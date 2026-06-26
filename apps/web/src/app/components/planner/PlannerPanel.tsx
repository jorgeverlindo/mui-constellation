// Stub — full implementation will be ported by follow-up agent
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import { useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import type { Campaign } from './PlannerContent';

interface PlannerPanelProps {
  campaign: Campaign | null | undefined;
  onClose: () => void;
  onSave: (data: Partial<Campaign>) => void;
}

export function PlannerPanel({ campaign, onClose, onSave }: PlannerPanelProps) {
  const [name, setName]   = useState(campaign?.name ?? '');
  const [budget, setBudget] = useState(String(campaign?.budget ?? ''));
  const [quarter, setQuarter] = useState(campaign?.quarter ?? 'Q1');
  const [status, setStatus] = useState<Campaign['status']>(campaign?.status ?? 'Pending');

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'background.paper', borderRadius: 'inherit', overflow: 'hidden' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 3, py: 2, borderBottom: '1px solid', borderColor: 'divider', flexShrink: 0 }}>
        <Typography sx={{ fontWeight: 600, fontSize: '0.9375rem' }}>
          {campaign ? 'Edit Campaign' : 'New Campaign'}
        </Typography>
        <IconButton size="small" onClick={onClose}><CloseIcon fontSize="small" /></IconButton>
      </Box>

      {/* Form */}
      <Box sx={{ flex: 1, overflowY: 'auto', p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {campaign?.thumbnail && (
          <Box sx={{ borderRadius: 2, overflow: 'hidden', height: 160, mb: 1 }}>
            <Box component="img" src={campaign.thumbnail} alt={campaign.name} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </Box>
        )}
        <TextField label="Campaign Name" value={name} onChange={(e) => setName(e.target.value)} fullWidth size="small" />
        <TextField label="Budget ($)" value={budget} onChange={(e) => setBudget(e.target.value)} fullWidth size="small" type="number" />
        <TextField select label="Quarter" value={quarter} onChange={(e) => setQuarter(e.target.value)} fullWidth size="small">
          {['Q1', 'Q2', 'Q3', 'Q4'].map((q) => <MenuItem key={q} value={q}>{q}</MenuItem>)}
        </TextField>
        <TextField select label="Status" value={status} onChange={(e) => setStatus(e.target.value as Campaign['status'])} fullWidth size="small">
          {(['Approved', 'Pending', 'Revision Requested'] as const).map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
        </TextField>
      </Box>

      {/* Footer */}
      <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', display: 'flex', gap: 1.5, flexShrink: 0 }}>
        <Button fullWidth variant="outlined" onClick={onClose} sx={{ borderRadius: 999, textTransform: 'none' }}>Cancel</Button>
        <Button
          fullWidth variant="contained"
          onClick={() => onSave({ name, budget: Number(budget), quarter, status })}
          sx={{ borderRadius: 999, textTransform: 'none' }}
        >
          Save
        </Button>
      </Box>
    </Box>
  );
}
