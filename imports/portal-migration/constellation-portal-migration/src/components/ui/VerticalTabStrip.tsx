import React from 'react';
import { Box, Typography, Tooltip } from '@mui/material';
import { tokens } from '../../theme/tokens';

export interface VerticalTab {
  id: string;
  label: string;
  Icon: React.FC;
}

export interface VerticalTabStripProps {
  tabs: VerticalTab[];
  activeId: string;
  onChange: (id: string) => void;
}

export function VerticalTabStrip({ tabs, activeId, onChange }: VerticalTabStripProps) {
  return (
    <Box sx={{ width: 72, flexShrink: 0, borderRight: '1px solid', borderColor: 'divider', display: 'flex', paddingX: '8px', gap: '4px', flexDirection: 'column' }}>
      {tabs.map(({ id, label, Icon }) => {
        const active = activeId === id;
        return (
          <Tooltip key={id} title={label} placement="right" arrow>
            <Box
              onClick={() => onChange(id)}
              sx={{
                height: 56, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px',
                cursor: 'pointer',
                color: active ? tokens.primary : 'text.disabled',
                bgcolor: active ? `${tokens.primary}12` : 'transparent',
                transition: 'all 0.15s',
                '&:hover': { bgcolor: active ? `${tokens.primary}12` : 'action.hover', color: active ? tokens.primary : 'text.primary' },
              }}
            >
              <Icon />
              <Typography sx={{ fontSize: 11, fontFamily: 'Roboto, sans-serif', lineHeight: 1, fontWeight: active ? 600 : 400 }}>
                {label}
              </Typography>
            </Box>
          </Tooltip>
        );
      })}
    </Box>
  );
}
