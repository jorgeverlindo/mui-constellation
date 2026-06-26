import React from 'react';
import { Chip, Tooltip } from '@mui/material';
import { tokens } from '../../theme/tokens';

const CHIP_RADIUS = 8;

export type ConfidenceLevel = 'high' | 'medium' | 'low';

export interface ConfidenceBadgeProps {
  level: ConfidenceLevel;
  /** Raw confidence score (0–1). When provided, percentage is shown alongside the level label. */
  score?: number;
  /** Tooltip content shown on hover. Used for field detection insights. */
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
        borderRadius: `${CHIP_RADIUS}px`,
        fontSize: 10,
        fontWeight: 600,
        lineHeight: 1,
        bgcolor: 'transparent',
        color: tokens.primary,
        borderColor: `${tokens.primary}60`,
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

/**
 * Converts a raw confidence score (0–1) to a ConfidenceLevel.
 *   >= 0.75 → 'high'
 *   >= 0.45 → 'medium'
 *     < 0.45 → 'low'
 */
export function toConfidenceLevel(confidence: number): ConfidenceLevel {
  if (confidence >= 0.75) return 'high';
  if (confidence >= 0.45) return 'medium';
  return 'low';
}
