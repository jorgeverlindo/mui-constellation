import { forwardRef } from 'react';
import MuiBadge, { type BadgeProps as MuiBadgeProps } from '@mui/material/Badge';
import { styled } from '@mui/material/styles';

export type BadgeProps = MuiBadgeProps;

// Figma <Badge> (Topbar Notification): 18px circle, brand fill, 10px/500
// white text, no outer ring.
const StyledBadge = styled(MuiBadge)({
  '& .MuiBadge-badge': {
    fontSize: 10,
    fontWeight: 500,
    lineHeight: '14px',
    minWidth: 18,
    height: 18,
    padding: '0 4px',
  },
  '& .MuiBadge-dot': {
    minWidth: 8,
    height: 8,
    padding: 0,
  },
});

/**
 * Constellation Badge — notification count/dot anchored to an icon or avatar.
 *
 * Decision: in the original app, "badge" splits into two patterns — small
 * label pills (PriorityBadge/StatusChip, covered by the DS `Chip`) and the
 * notification counter on the TopNavBar bell (18px circle, brand accent bg,
 * white 10px/500 text, white ring, "9+" overflow). This component covers the
 * latter, so it wraps MUI Badge. Defaults: `color="primary"` (brand accent)
 * and `max={9}` to render "9+" like the app.
 */
export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  function Badge({ color = 'primary', max = 9, ...props }, ref) {
    return <StyledBadge ref={ref} color={color} max={max} {...props} />;
  },
);
