import type { Meta, StoryObj } from '@storybook/react-vite';
import Box from '@mui/material/Box';
import { SearchInput } from './SearchInput';

const meta = {
  title: 'Inputs/SearchInput',
  component: SearchInput,
} satisfies Meta<typeof SearchInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const CustomPlaceholder: Story = {
  args: { placeholder: 'Search claims' },
};

export const FullWidth: Story = {
  render: (args) => (
    <Box sx={{ width: 560 }}>
      <SearchInput {...args} fullWidth />
    </Box>
  ),
};

export const Disabled: Story = { args: { disabled: true } };
