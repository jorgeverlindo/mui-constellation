import Box from '@mui/material/Box';
import CheckIcon from '@mui/icons-material/Check';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CancelIcon from '@mui/icons-material/Cancel';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import WarningIcon from '@mui/icons-material/Warning';
import { useTranslation } from '../contexts/LanguageContext';

// ─── SeverityChip ────────────────────────────────────────────────────────────

const SEVERITY_TOKENS = {
  High:   { bg: 'rgba(210,50,63,0.08)',  color: '#be0e1c', dot: '#D2323F' },
  Medium: { bg: 'rgba(225,118,19,0.08)', color: '#613f02', dot: '#E17613' },
  Low:    { bg: '#F3F4F6',               color: 'text.secondary', dot: '#9C99A9' },
} as const;

type SeverityLevel = keyof typeof SEVERITY_TOKENS;

export function SeverityChip({ severity }: { severity: string }) {
  const token = SEVERITY_TOKENS[severity as SeverityLevel] ?? SEVERITY_TOKENS.Low;
  return (
    <Box
      component="span"
      sx={{
        borderRadius: '8px',
        px: '8px',
        py: '4px',
        fontSize: '11px',
        fontWeight: 400,
        letterSpacing: '0.4px',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        userSelect: 'none',
        whiteSpace: 'nowrap',
        lineHeight: 1.2,
        bgcolor: token.bg,
        color: token.color,
      }}
    >
      <Box
        component="span"
        sx={{ width: 6, height: 6, borderRadius: '50%', flexShrink: 0, bgcolor: token.dot }}
      />
      {severity}
    </Box>
  );
}

// ─── StatusChip ──────────────────────────────────────────────────────────────

export type ClaimStatus =
  | 'Approved'
  | 'Pending'
  | 'Open'
  | 'In Review'
  | 'Revision Requested'
  | 'Denied'
  | 'Declined'
  | 'Finished'
  | 'Penalty Applied'
  | 'Ready for Payment'
  | 'Paid'
  | 'Paid out'
  | 'At risk'
  | 'Solution Submitted'
  | 'Solved';

interface StatusChipProps {
  status: ClaimStatus | string;
  sx?: object;
}

type StatusConfig = {
  bg: string;
  color: string;
  icon: React.ReactNode | null;
};

function getStatusConfig(status: string): StatusConfig {
  const iconSx = { fontSize: 14, mr: '6px' };
  switch (status) {
    case 'Approved':
    case 'Paid out':
      return {
        bg: '#E8F5E9', color: 'success.main',
        icon: (
          <Box sx={{ width: 14, height: 14, mr: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', border: '1px solid #4CAF50' }}>
            <CheckIcon sx={{ fontSize: 10, color: '#4CAF50' }} />
          </Box>
        ),
      };
    case 'Pending':
      return { bg: 'rgba(225,118,19,0.08)', color: '#613f02', icon: <HourglassEmptyIcon sx={{ ...iconSx, color: 'warning.main' }} /> };
    case 'Open':
      return {
        bg: '#E1F5FE', color: '#014361',
        icon: (
          <Box sx={{ width: 14, height: 14, mr: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', border: '1px solid #03A9F4', color: '#03A9F4' }}>
            <MoreHorizIcon sx={{ fontSize: 10 }} />
          </Box>
        ),
      };
    case 'In Review':
      return { bg: '#FFF3E0', color: '#E65100', icon: <VisibilityIcon sx={{ ...iconSx, color: '#EF6C00' }} /> };
    case 'Revision Requested':
      return { bg: 'rgba(225,118,19,0.08)', color: '#613f02', icon: <HourglassEmptyIcon sx={{ ...iconSx, color: 'warning.main' }} /> };
    case 'Denied':
    case 'Declined':
    case 'Penalty Applied':
      return { bg: 'rgba(210,50,63,0.08)', color: '#be0e1c', icon: <CancelIcon sx={{ ...iconSx, color: 'error.main' }} /> };
    case 'Finished':
      return { bg: '#F3F4F6', color: '#374151', icon: <DoneAllIcon sx={{ ...iconSx }} /> };
    case 'Ready for Payment':
      return { bg: '#E8F5E9', color: 'success.main', icon: <AttachMoneyIcon sx={{ ...iconSx, color: '#4CAF50' }} /> };
    case 'Paid':
      return { bg: '#E8F5E9', color: 'success.main', icon: <CreditCardIcon sx={{ ...iconSx, color: '#4CAF50' }} /> };
    case 'At risk':
      return { bg: 'rgba(210,50,63,0.08)', color: '#be0e1c', icon: <WarningIcon sx={{ ...iconSx, color: 'error.main' }} /> };
    case 'Solution Submitted':
      return { bg: 'rgba(225,118,19,0.08)', color: '#613f02', icon: <HourglassEmptyIcon sx={{ ...iconSx, color: 'warning.main' }} /> };
    case 'Solved':
      return {
        bg: '#E8F5E9', color: 'success.main',
        icon: (
          <Box sx={{ width: 14, height: 14, mr: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', border: '1px solid #4CAF50' }}>
            <CheckIcon sx={{ fontSize: 10, color: '#4CAF50' }} />
          </Box>
        ),
      };
    default:
      return { bg: '#F3F4F6', color: 'text.secondary', icon: null };
  }
}

export function StatusChip({ status, sx }: StatusChipProps) {
  const { t } = useTranslation();
  const { bg, color, icon } = getStatusConfig(status);

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        px: '8px',
        py: '4px',
        borderRadius: '8px',
        fontSize: '11px',
        fontWeight: 400,
        letterSpacing: '0.4px',
        lineHeight: 1.2,
        userSelect: 'none',
        whiteSpace: 'nowrap',
        bgcolor: bg,
        color,
        ...sx,
      }}
    >
      {icon}
      <span>{t(status)}</span>
    </Box>
  );
}
