// TODO: port full implementation from vw-funds-2
// Stub: renders the angle bar with MUI components.
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

export const ANGLES = [
  { id: '34-l',  label: '3/4 L' },
  { id: 'front', label: 'Front' },
  { id: '34-r',  label: '3/4 R' },
  { id: 'right', label: 'Right' },
  { id: 'left',  label: 'Left'  },
  { id: 'rear',  label: 'Rear'  },
] as const;

interface AngleBarProps {
  currentIndex: number;
  onSetAngle: (index: number) => void;
  multiAngleEnabled: boolean;
  onToggleMultiAngle: () => void;
  viewMode: 'single' | 'grid';
  onSetViewMode: (mode: 'single' | 'grid') => void;
}

export function AngleBar({ currentIndex, onSetAngle, multiAngleEnabled, onToggleMultiAngle }: AngleBarProps) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1.5, py: 1, borderTop: '1px solid rgba(0,0,0,0.08)', bgcolor: 'white', flexShrink: 0 }}>
      <Box component="label" sx={{ display: 'flex', alignItems: 'center', gap: 0.75, cursor: 'pointer', flexShrink: 0 }}>
        <input
          type="checkbox"
          checked={multiAngleEnabled}
          onChange={onToggleMultiAngle}
          style={{ margin: 0 }}
        />
        <Typography sx={{ fontSize: 11, color: 'text.secondary', letterSpacing: '0.4px' }}>Multi-Angle</Typography>
      </Box>
      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
        {ANGLES.map((angle, idx) => (
          <Button
            key={angle.id}
            size="small"
            onClick={() => onSetAngle(idx)}
            sx={{
              minWidth: 0, px: 1, py: 0.25, borderRadius: 1, fontSize: 11, textTransform: 'none',
              letterSpacing: '0.4px', fontWeight: idx === currentIndex ? 600 : 400,
              bgcolor: idx === currentIndex ? 'rgba(71,59,171,0.1)' : 'transparent',
              color: idx === currentIndex ? '#473bab' : '#686576',
              '&:hover': { bgcolor: 'rgba(71,59,171,0.06)' },
            }}
          >
            {angle.label}
          </Button>
        ))}
      </Box>
    </Box>
  );
}
