import { forwardRef } from 'react';
import MuiAlert, { type AlertProps as MuiAlertProps } from '@mui/material/Alert';
import { styled } from '@mui/material/styles';

export type AlertProps = MuiAlertProps;

const Root = styled(MuiAlert)(({ theme }) => ({
  // Figma <Alert> (Snackbar page): radius 4, padding 6px 16px, 14px text
  borderRadius: 4,
  padding: '6px 16px',
  fontSize: '0.875rem',
  lineHeight: 1.5,
  '& .MuiAlert-message': { padding: 0 },
  '& .MuiAlert-icon': { padding: 0, marginRight: 12, alignItems: 'flex-start' },
  '& .MuiAlert-action': { paddingTop: 0 },
  '& .MuiAlertTitle-root': {
    fontWeight: theme.typography.fontWeightMedium,
    marginBottom: 2,
  },
}));

/**
 * Constellation Alert — MUI Alert with the DS card radius and compact padding.
 * Severities map to the theme palette: `error` → status.danger (#D2323F),
 * `warning` → status.warning (#E17613). `info`/`success` fall back to MUI
 * defaults — no Constellation tokens exist for them yet.
 */
export const Alert = forwardRef<HTMLDivElement, AlertProps>(
  function Alert({ severity = 'info', ...props }, ref) {
    return <Root ref={ref} severity={severity} {...props} />;
  },
);
