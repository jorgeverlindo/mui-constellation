import { useState } from 'react';
import Box from '@mui/material/Box';
import type { DateRange } from '../app/components/DateRangePicker';
import { FundsCasesContent } from '../app/components/FundsCasesContent';

const DEFAULT_DATE_RANGE: DateRange = {
  from: new Date(2025, 0, 1),
  to: new Date(2025, 11, 31),
};

export function CasesScreen() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(DEFAULT_DATE_RANGE);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <FundsCasesContent dateRange={dateRange} onDateRangeChange={setDateRange} />
    </Box>
  );
}
