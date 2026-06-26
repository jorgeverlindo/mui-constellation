import React from 'react';
import { Chip, Tooltip } from '@mui/material';

const BRAND = '#473bab';

export type ConfidenceLevel = 'high' | 'medium' | 'low';

export interface ConfidenceBadgeProps {
  level: ConfidenceLevel;
  score?: number;
  tooltipContent?: React.ReactNode;
}

const LEVEL_LABELS: Record<ConfidenceLevel, string> = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

export function ConfidenceBadge({ level, score, tooltipContent }: ConfidenceBadgeProps) {
  const label = score !== undefined
    ? `${LEVEL_LABELS[level]} · ${Math.round(score * 100)}%`
    : LEVEL_LABELS[level];

  const chip = (
    <Chip
      label={label}
      size="small"
      variant="outlined"
      sx={{
        height: 18,
        borderRadius: '8px',
        fontSize: 10,
        fontWeight: 600,
        lineHeight: 1,
        bgcolor: 'transparent',
        color: BRAND,
        borderColor: `${BRAND}60`,
        '& .MuiChip-label': { px: '6px' },
        cursor: tooltipContent ? 'help' : 'default',
      }}
    />
  );

  if (!tooltipContent) return chip;
  return (
    <Tooltip arrow placement="top" title={tooltipContent}>
      {chip}
    </Tooltip>
  );
}

export function toConfidenceLevel(confidence: number): ConfidenceLevel {
  if (confidence >= 0.75) return 'high';
  if (confidence >= 0.45) return 'medium';
  return 'low';
}
