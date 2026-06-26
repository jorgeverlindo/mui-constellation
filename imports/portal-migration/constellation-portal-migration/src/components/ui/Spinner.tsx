import { CircularProgress } from '@mui/material';

// AV3 primary color token
const PRIMARY = '#3730a3';

const SIZE_MAP = { sm: 16, md: 24, lg: 40 } as const;

export interface SpinnerProps {
  /** Preset size or explicit pixel value */
  size?: keyof typeof SIZE_MAP | number;
  /** Inherits surrounding text color when 'inherit', uses AV3 primary otherwise */
  color?: 'primary' | 'inherit';
  className?: string;
}

export function Spinner({ size = 'md', color = 'primary', className }: SpinnerProps) {
  const px = typeof size === 'number' ? size : SIZE_MAP[size];

  return (
    <CircularProgress
      size={px}
      className={className}
      sx={{ color: color === 'primary' ? PRIMARY : 'inherit', flexShrink: 0 }}
    />
  );
}
