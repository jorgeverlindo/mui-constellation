// TODO: port full implementation from vw-funds-2
// Stub: the full VinsAppliedTab has cascading multi-select filters backed by
// VEHICLE_INVENTORY data (not available in this workspace yet). Renders the
// two-column layout shell with placeholder content.
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';

interface VinsAppliedTabProps {
  onSelectionChange?: (count: number) => void;
  onFilteredCountChange?: (count: number) => void;
  initialFilterGroups?: Array<{ filters: Record<string, unknown> }>;
  onFilterGroupsChange?: (groups: Array<{ filters: Record<string, unknown> }>) => void;
}

export function VinsAppliedTab({ onSelectionChange, onFilteredCountChange }: VinsAppliedTabProps = {}) {
  void onSelectionChange;
  void onFilteredCountChange;

  return (
    <Box sx={{ flex: 1, overflow: 'auto', p: '16px 24px' }}>
      <Box sx={{ display: 'flex', gap: '24px', alignItems: 'flex-start', height: '100%' }}>
        {/* Left column — Added by filtering */}
        <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', mb: '12px' }}>
            <Typography sx={{ fontSize: '0.8125rem', fontWeight: 500, letterSpacing: '0.1px', color: 'text.primary' }}>Added by filtering</Typography>
            <Box sx={{ flex: 1 }} />
            <Button startIcon={<AddIcon sx={{ fontSize: 12 }} />} size="small" variant="outlined" sx={{ borderRadius: '100px', borderColor: 'primary.main', color: 'primary.main', textTransform: 'none', fontSize: '0.6875rem', fontWeight: 500, height: 28, px: '10px', '&:hover': { bgcolor: 'rgba(71,59,171,0.05)' } }}>
              Add Filter
            </Button>
          </Box>
          <Box sx={{ border: '1px solid rgba(0,0,0,0.12)', borderRadius: '12px', overflow: 'hidden', bgcolor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', py: '40px' }}>
            <Typography sx={{ fontSize: '0.75rem', color: 'rgba(17,16,20,0.38)', textAlign: 'center' }}>
              Set filters above to find matching VINs
            </Typography>
          </Box>
        </Box>

        {/* Right column — Added manually */}
        <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', mb: '12px' }}>
            <Typography sx={{ fontSize: '0.8125rem', fontWeight: 500, letterSpacing: '0.1px', color: 'text.primary' }}>Added manually</Typography>
            <Box sx={{ flex: 1 }} />
            <Button startIcon={<AddIcon sx={{ fontSize: 12 }} />} size="small" variant="outlined" sx={{ borderRadius: '100px', borderColor: 'primary.main', color: 'primary.main', textTransform: 'none', fontSize: '0.6875rem', fontWeight: 500, height: 28, px: '10px', '&:hover': { bgcolor: 'rgba(71,59,171,0.05)' } }}>
              Add VINs
            </Button>
          </Box>
          <Box sx={{ border: '1px solid rgba(0,0,0,0.12)', borderRadius: '12px', overflow: 'hidden', bgcolor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', py: '40px' }}>
            <Typography sx={{ fontSize: '0.75rem', color: 'rgba(17,16,20,0.38)', textAlign: 'center' }}>
              No VINs added manually yet
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
