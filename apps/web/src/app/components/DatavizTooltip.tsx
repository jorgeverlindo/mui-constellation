import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import type { TooltipProps } from 'recharts';
import type { ValueType, NameType } from 'recharts/types/component/DefaultTooltipContent';
import React from 'react';

type TooltipPayload = NonNullable<TooltipProps<ValueType, NameType>['payload']>[number];

interface DatavizTooltipProps extends TooltipProps<ValueType, NameType> {
  title?: string;
  renderTitle?: (payload: TooltipPayload[]) => string;
  renderItems?: (payload: TooltipPayload[]) => React.ReactNode;
}

export function DatavizTooltip({ active, payload, label, title, renderTitle, renderItems }: DatavizTooltipProps) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const displayTitle = title || (renderTitle ? renderTitle(payload) : label) || '';

  return (
    <Paper
      elevation={3}
      sx={{
        border: '1px solid rgba(0,0,0,0.12)',
        p: '12px',
        minWidth: 180,
        borderRadius: 1,
      }}
    >
      {displayTitle && (
        <>
          <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: 'text.primary', mb: '8px', pb: '4px' }}>
            {displayTitle}
          </Typography>
          <Divider sx={{ mb: '8px', borderColor: 'rgba(0,0,0,0.06)' }} />
        </>
      )}

      {renderItems ? (
        renderItems(payload)
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {payload.map((entry, index) => (
            <Box key={`item-${index}`} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', gap: '16px' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Box
                  sx={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, bgcolor: (entry.color || entry.fill) as string }}
                />
                <Typography sx={{ fontSize: '11px', color: 'text.secondary', fontWeight: 500, textTransform: 'capitalize' }}>
                  {entry.name}
                </Typography>
              </Box>
              <Typography sx={{ fontSize: '11px', color: 'text.primary', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
              </Typography>
            </Box>
          ))}
        </Box>
      )}
    </Paper>
  );
}
