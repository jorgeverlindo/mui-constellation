import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/date-picker.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  external: [
    'react',
    'react-dom',
    '@mui/material',
    '@mui/icons-material',
    '@mui/x-date-pickers',
    '@emotion/react',
    '@emotion/styled',
    'date-fns',
  ],
});
