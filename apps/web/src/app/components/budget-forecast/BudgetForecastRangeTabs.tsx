import React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { RangeOption } from '../../../data/types/overview';
import { useTranslation } from '../../contexts/LanguageContext';

interface BudgetForecastRangeTabsProps {
  selectedRange: RangeOption;
  onRangeChange: (range: RangeOption) => void;
}

const TABS: { label: string; value: RangeOption }[] = [
  { label: '3 Months', value: '3m' },
  { label: '6 Months', value: '6m' },
  { label: '12 Months', value: '12m' },
];

export const BudgetForecastRangeTabs: React.FC<BudgetForecastRangeTabsProps> = ({
  selectedRange,
  onRangeChange,
}) => {
  const { t } = useTranslation();

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      {TABS.map((tab) => {
        const isActive = selectedRange === tab.value;
        return (
          <Button
            key={tab.value}
            onClick={() => onRangeChange(tab.value)}
            size="small"
            sx={{
              px: '12px',
              py: '6px',
              borderRadius: '100px',
              fontSize: '0.75rem',
              fontWeight: 500,
              textTransform: 'none',
              minWidth: 'auto',
              bgcolor: isActive ? '#6356e1' : 'transparent',
              color: isActive ? '#fff' : '#6356e1',
              border: '1px solid',
              borderColor: isActive ? '#6356e1' : 'rgba(99,86,225,0.2)',
              boxShadow: isActive ? '0 1px 3px rgba(99,86,225,0.3)' : 'none',
              '&:hover': {
                bgcolor: isActive ? '#5245cc' : 'rgba(99,86,225,0.05)',
                borderColor: '#6356e1',
              },
              transition: 'all 0.2s',
            }}
          >
            {t(tab.label)}
          </Button>
        );
      })}
    </Box>
  );
};
