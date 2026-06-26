import { useState } from 'react';
import { useLocation } from 'react-router';
import Box from '@mui/material/Box';
import type { DateRange } from '../app/components/DateRangePicker';
import type { UserType } from '../app/utils/routing';
import { FundsClaimsContent, CLAIMS_MOCK_DATA } from '../app/components/FundsClaimsContent';
import { ClaimsPanel } from '../app/components/ClaimsPanel';

function deriveUserType(pathname: string): UserType {
  const p = pathname.toLowerCase();
  if (p.includes('/dealership-singular/')) return 'dealer-singular';
  if (p.includes('/dealership-emich/')) return 'dealer-emich';
  if (p.includes('/dealership/')) return 'dealer';
  return 'oem';
}

export function ClaimsScreen() {
  const { pathname } = useLocation();
  const userType = deriveUserType(pathname);

  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(2025, 0, 1),
    to: new Date(2026, 11, 31),
  });
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null);

  const selectedClaim = selectedClaimId != null
    ? CLAIMS_MOCK_DATA.find(c => c.id === selectedClaimId)
    : undefined;

  return (
    <Box sx={{ flex: 1, minHeight: 0, display: 'flex', overflow: 'hidden' }}>
      <Box sx={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
        <FundsClaimsContent
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          selectedClaimId={selectedClaimId}
          onSelectClaim={setSelectedClaimId}
          userType={userType === 'dealer-singular' || userType === 'oem' ? userType : 'dealer'}
        />
      </Box>
      {selectedClaim && (
        <Box sx={{ width: 440, flexShrink: 0, borderLeft: '1px solid', borderColor: 'divider', overflowY: 'auto', bgcolor: 'background.paper' }}>
          <ClaimsPanel
            claim={selectedClaim}
            onClose={() => setSelectedClaimId(null)}
            userType={userType === 'dealer-singular' || userType === 'oem' ? userType : 'dealer'}
          />
        </Box>
      )}
    </Box>
  );
}
