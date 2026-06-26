import React from 'react';
import { Box, Typography, Tooltip } from '@mui/material';
import { ink, brand, surface as surfaceTokens, status as statusTokens } from '@jorgeverlindo/constellation-ux';

const BRAND = brand.accent;
const ACTIVE_BG = 'rgba(71,59,171,0.1)';
const INACTIVE_COLOR = 'rgba(17,16,20,0.44)';

interface TabDef {
  id: string;
  label: string;
  Icon: React.FC;
}

interface VerticalTabStripProps {
  tabs: TabDef[];
  activeId: string;
  onChange: (id: string) => void;
}

export function VerticalTabStrip({ tabs, activeId, onChange }: VerticalTabStripProps) {
  return (
    <Box sx={{
      width: 72,
      flexShrink: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      borderRight: '1px solid',
      borderColor: 'divider',
      bgcolor: 'background.paper',
      pt: 1,
    }}>
      {tabs.map(tab => {
        const isActive = tab.id === activeId;
        return (
          <Tooltip key={tab.id} title={tab.label} placement="right" arrow>
            <Box
              onClick={() => onChange(tab.id)}
              sx={{
                width: 56,
                height: 56,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 0.5,
                borderRadius: '10px',
                cursor: 'pointer',
                bgcolor: isActive ? ACTIVE_BG : 'transparent',
                color: isActive ? BRAND : INACTIVE_COLOR,
                transition: 'background 0.12s, color 0.12s',
                '&:hover': {
                  bgcolor: isActive ? ACTIVE_BG : 'rgba(0,0,0,0.04)',
                  color: isActive ? BRAND : ink.primary,
                },
                mb: 0.5,
              }}
            >
              <Box sx={{ fontSize: 0, lineHeight: 0 }}>
                <tab.Icon />
              </Box>
              <Typography sx={{
                fontSize: 9,
                fontWeight: isActive ? 700 : 500,
                               color: 'inherit',
                lineHeight: 1,
                textAlign: 'center',
                letterSpacing: '0.2px',
              }}>
                {tab.label}
              </Typography>
            </Box>
          </Tooltip>
        );
      })}
    </Box>
  );
}
