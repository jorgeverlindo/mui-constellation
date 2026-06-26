import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { ComplianceMetricsGroup } from '../app/components/ComplianceMetricsGroup';

export function ComplianceScreen() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'auto', p: '24px', gap: '24px' }}>
      <Typography sx={{ fontSize: '1.25rem', fontWeight: 600, color: 'text.primary' }}>
        Compliance
      </Typography>
      <Box sx={{ display: 'flex', gap: '16px' }}>
        <ComplianceMetricsGroup />
      </Box>
    </Box>
  );
}
