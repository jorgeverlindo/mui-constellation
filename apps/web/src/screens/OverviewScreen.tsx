import { useLocation } from 'react-router';
import Box from '@mui/material/Box';
import type { UserType } from '../app/utils/routing';
import { FundsOverviewContent } from '../app/components/FundsOverviewContent';
import { FundsOverviewOEMContent } from '../app/components/FundsOverviewOEMContent';

function deriveUserType(pathname: string): UserType {
  const p = pathname.toLowerCase();
  if (p.includes('/dealership-singular/')) return 'dealer-singular';
  if (p.includes('/dealership-emich/')) return 'dealer-emich';
  if (p.includes('/dealership/')) return 'dealer';
  return 'oem';
}

export function OverviewScreen() {
  const { pathname } = useLocation();
  const userType = deriveUserType(pathname);

  return (
    <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflowY: 'auto', p: 2 }}>
      {userType === 'oem' ? (
        <FundsOverviewOEMContent />
      ) : (
        <FundsOverviewContent userType={userType} />
      )}
    </Box>
  );
}
