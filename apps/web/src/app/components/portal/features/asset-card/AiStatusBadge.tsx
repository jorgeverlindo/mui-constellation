import { Box, Tooltip, SvgIcon } from '@mui/material';

export type AiStatusBadgeStatus = 'vehicle' | 'none';

export interface AiStatusBadgeProps {
  status: AiStatusBadgeStatus;
}

const VehicleIcon = () => (
  <SvgIcon viewBox="0 0 32 32" sx={{ fontSize: 28 }}>
    <path d="M0 16C0 7.16344 7.16344 0 16 0V0C24.8366 0 32 7.16344 32 16V16C32 24.8366 24.8366 32 16 32V32C7.16344 32 0 24.8366 0 16V16Z" fill="#473BAB"/>
    <g clipPath="url(#clip0_vehicle)">
      <path d="M8.7781 15.0741L11.3383 10.9778C11.4736 10.7612 11.711 10.6296 11.9664 10.6296H20.0342C20.2896 10.6296 20.527 10.7612 20.6624 10.9778L23.2225 15.0741M8.7781 15.0741H7.66699M8.7781 15.0741V20.6296C8.7781 21.0387 9.10974 21.3704 9.51884 21.3704H10.63C11.0391 21.3704 11.3707 21.0387 11.3707 20.6296V19.836H20.63V20.6296C20.63 21.0387 20.9616 21.3704 21.3707 21.3704H22.4818C22.8909 21.3704 23.2225 21.0387 23.2225 20.6296V15.0741M23.2225 15.0741H24.3337M11.3707 16.7672H12.8522M19.1485 16.7672H20.63" stroke="white" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
    </g>
    <defs>
      <clipPath id="clip0_vehicle">
        <rect width="17.7778" height="17.7778" fill="white" transform="translate(7.11133 7.11108)"/>
      </clipPath>
    </defs>
  </SvgIcon>
);

export function AiStatusBadge({ status }: AiStatusBadgeProps) {
  if (status === 'none') return null;

  return (
    <Tooltip title="Vehicle" placement="left" arrow>
      <Box sx={{
        position: 'absolute', top: 8, right: 8,
        width: 28, height: 28,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 2,
        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.18))',
      }}>
        <VehicleIcon />
      </Box>
    </Tooltip>
  );
}
