import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import ButtonBase from '@mui/material/ButtonBase';
import CheckIcon from '@mui/icons-material/Check';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { StatusChip } from './StatusChip';
import type { ClaimStatus } from './StatusChip';

interface ClaimsSubmittedBansProps {
  activeFilter: ClaimStatus | null;
  onFilterChange: (status: ClaimStatus | null) => void;
  counts: {
    approved: number;
    pending: number;
    inReview: number;
  };
  amounts: {
    approved: number;
    pending: number;
    inReview: number;
  };
}

export function ClaimsSubmittedBans({
  activeFilter,
  onFilterChange,
  counts,
  amounts,
}: ClaimsSubmittedBansProps) {
  const handleCardClick = (status: ClaimStatus) => {
    if (activeFilter === status) {
      onFilterChange(null);
    } else {
      onFilterChange(status);
    }
  };

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 3,
        borderRadius: 3,
        mb: 3,
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
      }}
    >
      <Typography sx={{ fontSize: '14px', fontWeight: 600, color: 'text.primary', mb: 2 }}>
        Claims Submitted
      </Typography>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <FilterCard
          status="Approved"
          amount={amounts.approved}
          isActive={activeFilter === 'Approved'}
          onClick={() => handleCardClick('Approved')}
          icon={<CheckIcon sx={{ fontSize: 12 }} />}
        />
        <FilterCard
          status="Pending"
          amount={amounts.pending}
          isActive={activeFilter === 'Pending'}
          onClick={() => handleCardClick('Pending')}
          icon={<MoreHorizIcon sx={{ fontSize: 12 }} />}
        />
        <FilterCard
          status="In Review"
          amount={amounts.inReview}
          isActive={activeFilter === 'In Review'}
          onClick={() => handleCardClick('In Review')}
          icon={<VisibilityOutlinedIcon sx={{ fontSize: 12 }} />}
        />
      </Box>
    </Paper>
  );
}

function FilterCard({
  status,
  amount,
  isActive,
  onClick,
  icon: _icon,
}: {
  status: string;
  amount: number;
  isActive: boolean;
  onClick: () => void;
  icon: React.ReactNode;
}) {
  return (
    <ButtonBase
      onClick={onClick}
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        p: 2,
        borderRadius: 2,
        border: isActive ? '1px solid transparent' : '1px solid rgba(0,0,0,0.12)',
        bgcolor: isActive ? 'rgba(0,0,0,0.02)' : 'background.paper',
        outline: isActive ? '2px solid #6200EE' : 'none',
        outlineOffset: isActive ? 1 : 0,
        transition: 'all 0.15s',
        textAlign: 'left',
        cursor: 'pointer',
        '&:hover': {
          borderColor: isActive ? 'transparent' : 'rgba(0,0,0,0.2)',
          bgcolor: 'rgba(0,0,0,0.02)',
        },
      }}
    >
      <Box sx={{ mb: 1.5 }}>
        <StatusChip status={status} />
      </Box>
      <Typography sx={{ fontSize: '20px', fontWeight: 500, color: 'text.primary', letterSpacing: '-0.01em' }}>
        ${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
      </Typography>
    </ButtonBase>
  );
}
