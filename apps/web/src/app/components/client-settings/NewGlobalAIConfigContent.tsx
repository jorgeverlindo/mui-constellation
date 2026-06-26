// TODO: port full implementation from vw-funds-2
// Stub: the NewGlobalAIConfigContent in vw-funds-2 is a large multi-tab form
// with AI model selection, preview panel, VinsAppliedTab, and form state
// management that depends on app-specific data modules not yet ported.
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckIcon from '@mui/icons-material/Check';

interface NewGlobalAIConfigContentProps {
  onCancel: () => void;
  onSave?: (record: Record<string, unknown>) => void;
  initialData?: Record<string, unknown>;
  isSideSheetOpen?: boolean;
  onToggleSideSheet?: () => void;
}

export function NewGlobalAIConfigContent({ onCancel, onSave }: NewGlobalAIConfigContentProps) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', px: '16px', py: '12px', borderBottom: '1px solid rgba(0,0,0,0.08)', flexShrink: 0 }}>
        <IconButton onClick={onCancel} size="small">
          <ArrowBackIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
        </IconButton>
        <Typography sx={{ fontSize: '1rem', fontWeight: 500, color: 'text.primary', flex: 1 }}>
          New Global AI Config
        </Typography>
        <Button onClick={onCancel} sx={{ color: 'rgba(17,16,20,0.6)', textTransform: 'none', borderRadius: '100px' }}>Cancel</Button>
        <Button
          onClick={() => { onSave?.({ id: `config-${Date.now()}`, name: 'New Config' }); }}
          variant="contained"
          startIcon={<CheckIcon />}
          sx={{ bgcolor: 'primary.main', textTransform: 'none', borderRadius: '100px', '&:hover': { bgcolor: 'primary.dark' } }}
        >
          Save Config
        </Button>
      </Box>

      {/* Body placeholder */}
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
            New Global AI Config form
          </Typography>
          <Typography sx={{ fontSize: '0.75rem', color: 'text.disabled', mt: '4px' }}>
            Full implementation from vw-funds-2 pending port
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
