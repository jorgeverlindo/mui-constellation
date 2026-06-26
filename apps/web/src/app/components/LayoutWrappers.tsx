import Box from '@mui/material/Box';
import { HTMLAttributes, forwardRef } from 'react';

// MainPane Wrapper — primary content area that resizes when RightPane opens
export const MainPane = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ children, style, ...props }, ref) => {
    return (
      <Box
        ref={ref}
        component="div"
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'background.paper',
          borderRadius: 4,
          boxShadow: '0px 1px 2px rgba(0,0,0,0.08)',
          border: '1px solid rgba(0,0,0,0.04)',
          overflow: 'hidden',
        }}
        style={style}
        {...(props as Record<string, unknown>)}
      >
        {children}
      </Box>
    );
  }
);
MainPane.displayName = 'MainPane';

// RightPane Wrapper — side panel that pushes content
export const RightPane = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ children, style, ...props }, ref) => {
    return (
      <Box
        ref={ref}
        component="div"
        sx={{
          flexShrink: 0,
          bgcolor: 'background.paper',
          borderRadius: 4,
          boxShadow: '0px 1px 2px rgba(0,0,0,0.08)',
          border: '1px solid rgba(0,0,0,0.04)',
          overflow: 'hidden',
          height: '100%',
        }}
        style={style}
        {...(props as Record<string, unknown>)}
      >
        {children}
      </Box>
    );
  }
);
RightPane.displayName = 'RightPane';
