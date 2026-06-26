import React from 'react';
import type { Preview } from '@storybook/react-vite';
import '@fontsource/inter/300.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import { ConstellationProvider } from '../src';

const preview: Preview = {
  decorators: [
    (Story) => (
      <ConstellationProvider>
        <Story />
      </ConstellationProvider>
    ),
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
