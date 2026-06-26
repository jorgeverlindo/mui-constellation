import React, { useState, useRef, useEffect } from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import { ChevronLeftIcon, ChevronRightIcon } from './icons';

interface BudgetForecastYearPickerProps {
  selectedYear: number;
  onYearChange: (year: number) => void;
}

const YEARS = [2026, 2025, 2024, 2023];

export const BudgetForecastYearPicker: React.FC<BudgetForecastYearPickerProps> = ({
  selectedYear,
  onYearChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <Box
      ref={dropdownRef}
      sx={{ display: 'flex', alignItems: 'center', gap: '16px', position: 'relative' }}
    >
      <IconButton
        size="small"
        onClick={() => onYearChange(selectedYear - 1)}
        sx={{ color: 'text.secondary', '&:hover': { bgcolor: 'action.hover' } }}
      >
        <ChevronLeftIcon />
      </IconButton>

      <Box sx={{ position: 'relative' }}>
        <Typography
          onClick={() => setIsOpen(!isOpen)}
          sx={{
            fontSize: '1.25rem',
            fontWeight: 700,
            color: 'text.primary',
            px: '8px',
            py: '4px',
            borderRadius: '4px',
            cursor: 'pointer',
            '&:hover': { bgcolor: 'action.hover' },
            userSelect: 'none',
          }}
        >
          {selectedYear}
        </Typography>

        {isOpen && (
          <Paper
            elevation={4}
            sx={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              left: '50%',
              transform: 'translateX(-50%)',
              width: 128,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              overflow: 'hidden',
              zIndex: 50,
            }}
          >
            {YEARS.map((year) => (
              <MenuItem
                key={year}
                selected={selectedYear === year}
                onClick={() => { onYearChange(year); setIsOpen(false); }}
                sx={{
                  fontSize: '0.875rem',
                  justifyContent: 'center',
                  color: selectedYear === year ? '#6356e1' : 'text.primary',
                  fontWeight: selectedYear === year ? 500 : 400,
                  '&.Mui-selected': { bgcolor: 'rgba(99,86,225,0.08)' },
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              >
                {year}
              </MenuItem>
            ))}
          </Paper>
        )}
      </Box>

      <IconButton
        size="small"
        onClick={() => onYearChange(selectedYear + 1)}
        sx={{ color: 'text.secondary', '&:hover': { bgcolor: 'action.hover' } }}
      >
        <ChevronRightIcon />
      </IconButton>
    </Box>
  );
};
