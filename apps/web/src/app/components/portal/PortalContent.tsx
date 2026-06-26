import { Box } from '@mui/material';
import { PortalNavProvider } from './PortalNavContext';
import { PortalPage } from './PortalPage';

interface PortalContentProps {
  onPreApproval?: () => void;
}

export function PortalContent({ onPreApproval: _onPreApproval }: PortalContentProps) {
  return (
    <Box sx={{ display: 'flex', flex: 1, height: '100%', overflow: 'hidden' }}>
      <PortalNavProvider>
        <PortalPage />
      </PortalNavProvider>
    </Box>
  );
}
