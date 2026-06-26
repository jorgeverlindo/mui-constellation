import type { ReactNode } from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { constellationTheme } from './theme/createConstellationTheme';

export interface ConstellationProviderProps {
  children: ReactNode;
}

/**
 * Wraps the app with the Constellation theme and CssBaseline.
 * The Inter font must be loaded by the host app (e.g. @fontsource/inter).
 */
export function ConstellationProvider({ children }: ConstellationProviderProps) {
  return (
    <ThemeProvider theme={constellationTheme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
