import Box from '@mui/material/Box';
import { BudgetForecastCard } from '../app/components/BudgetForecastCard';

export function PlannerScreen() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'auto', p: '24px' }}>
      <BudgetForecastCard variant="card" />
    </Box>
  );
}
