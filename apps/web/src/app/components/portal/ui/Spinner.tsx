import { CircularProgress } from '@mui/material';

const PRIMARY = '#473bab';
const SIZE_MAP = { sm: 16, md: 24, lg: 40 } as const;

export interface SpinnerProps {
  size?: keyof typeof SIZE_MAP | number;
  color?: 'primary' | 'inherit';
}

export function Spinner({ size = 'md', color = 'primary' }: SpinnerProps) {
  const px = typeof size === 'number' ? size : SIZE_MAP[size];
  return (
    <CircularProgress size={px} sx={{ color: color === 'primary' ? PRIMARY : 'inherit', flexShrink: 0 }} />
  );
}
