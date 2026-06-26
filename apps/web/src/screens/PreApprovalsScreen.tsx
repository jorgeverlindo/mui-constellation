import { useState } from 'react';
import { useLocation } from 'react-router';
import Box from '@mui/material/Box';
import type { DateRange } from '../app/components/DateRangePicker';
import type { UserType } from '../app/utils/routing';
import { FundsPreApprovalsContent } from '../app/components/FundsPreApprovalsContent';
import { PreApprovalPanel } from '../app/components/PreApprovalPanel';
import type { PreApproval } from '../app/components/FundsPreApprovalsContent';
import { MOCK_DATA } from '../app/components/FundsPreApprovalsContent';

function deriveUserType(pathname: string): UserType {
  const p = pathname.toLowerCase();
  if (p.includes('/dealership-singular/')) return 'dealer-singular';
  if (p.includes('/dealership-emich/')) return 'dealer-emich';
  if (p.includes('/dealership/')) return 'dealer';
  return 'oem';
}

export function PreApprovalsScreen() {
  const { pathname } = useLocation();
  const userType = deriveUserType(pathname);

  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(2025, 0, 1),
    to: new Date(2026, 11, 31),
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPreApprovalId, setSelectedPreApprovalId] = useState<string | null>(null);

  const selectedPA: PreApproval | undefined = selectedPreApprovalId != null
    ? MOCK_DATA.find(pa => pa.id === selectedPreApprovalId)
    : undefined;

  return (
    <Box sx={{ flex: 1, minHeight: 0, display: 'flex', overflow: 'hidden' }}>
      <Box sx={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
        <FundsPreApprovalsContent
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          selectedPreApprovalId={selectedPreApprovalId}
          onSelectPreApproval={setSelectedPreApprovalId}
          userType={userType === 'dealer-singular' || userType === 'oem' ? userType : 'dealer'}
        />
      </Box>
      {selectedPA && (
        <Box sx={{ width: 440, flexShrink: 0, borderLeft: '1px solid', borderColor: 'divider', overflowY: 'auto', bgcolor: 'background.paper' }}>
          <PreApprovalPanel
            preApproval={selectedPA}
            onClose={() => setSelectedPreApprovalId(null)}
            userType={userType === 'dealer-singular' || userType === 'oem' ? userType : 'dealer'}
          />
        </Box>
      )}
    </Box>
  );
}
