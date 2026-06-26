import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import { ButtonProps } from '@mui/material/Button';

interface ActionButtonProps extends Omit<ButtonProps, 'children'> {
  label: string;
}

export function ActionButton({ label, sx, ...props }: ActionButtonProps) {
  return (
    <Button
      variant="contained"
      startIcon={<AddIcon />}
      sx={{
        bgcolor: 'primary.main',
        height: 40,
        px: '16px',
        borderRadius: '100px',
        fontSize: '13px',
        fontWeight: 500,
        letterSpacing: '0.46px',
        textTransform: 'capitalize',
        color: 'white',
        flexShrink: 0,
        '&:hover': { bgcolor: '#392e8a' },
        ...sx,
      }}
      {...props}
    >
      {label}
    </Button>
  );
}
