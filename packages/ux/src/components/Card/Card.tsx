import { forwardRef } from 'react';
import MuiCard, { type CardProps as MuiCardProps } from '@mui/material/Card';
import MuiCardHeader, {
  type CardHeaderProps as MuiCardHeaderProps,
} from '@mui/material/CardHeader';
import MuiCardContent, {
  type CardContentProps as MuiCardContentProps,
} from '@mui/material/CardContent';
import { styled } from '@mui/material/styles';
// Palette module augmentation (brand/ink/rail/surface)
import type {} from '../../theme/createConstellationTheme';

export type CardProps = MuiCardProps;
export type CardHeaderProps = MuiCardHeaderProps;
export type CardContentProps = MuiCardContentProps;

const StyledCard = styled(MuiCard)(({ theme }) => ({
  // App cards (KPICard/MetricCard/smart cards): white bg, 12px radius,
  // 1px hairline border, no elevation. App border is rgba(0,0,0,0.12);
  // the divider token is 0.10 — using the token.
  borderRadius: 12,
  border: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
  boxShadow: 'none',
  backgroundImage: 'none',
}));

/**
 * Constellation Card — outlined surface for KPI/metric/detail cards.
 *
 * White background, 12px radius, hairline border, flat (no shadow) — per
 * KPICard/MetricCard and the smart cards in the original app. Compose with
 * `CardHeader` and `CardContent` below.
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(
  function Card(props, ref) {
    return <StyledCard ref={ref} {...props} />;
  },
);

const StyledCardHeader = styled(MuiCardHeader)(({ theme }) => ({
  padding: theme.spacing(3, 3, 0),
  '& .MuiCardHeader-title': {
    // h4 scale of the DS: 1rem / 500 / lh 1.5
    fontSize: '1rem',
    fontWeight: 500,
    lineHeight: 1.5,
    color: theme.palette.ink.primary,
  },
  '& .MuiCardHeader-subheader': {
    fontSize: 13,
    color: theme.palette.ink.secondary,
  },
}));

/**
 * Constellation CardHeader — title/subheader/action row with DS typography
 * (16px/500 title, 13px secondary subheader) and 24px side padding.
 */
export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  function CardHeader(props, ref) {
    return <StyledCardHeader ref={ref} {...props} />;
  },
);

const StyledCardContent = styled(MuiCardContent)(({ theme }) => ({
  padding: theme.spacing(3),
  '&:last-child': { paddingBottom: theme.spacing(3) },
}));

/** Constellation CardContent — 24px padding all around (app cards use p-6). */
export const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  function CardContent(props, ref) {
    return <StyledCardContent ref={ref} {...props} />;
  },
);
