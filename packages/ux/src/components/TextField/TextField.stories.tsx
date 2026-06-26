import type { Meta, StoryObj } from '@storybook/react-vite';
import Stack from '@mui/material/Stack';
import { TextField } from './TextField';

const meta = {
  title: 'Inputs/TextField',
  component: TextField,
  args: { placeholder: 'Enter a value' },
  argTypes: {
    size: {
      control: 'select',
      options: ['small', 'medium'],
    },
  },
} satisfies Meta<typeof TextField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithLabel: Story = {
  args: { label: 'Fund name', placeholder: 'e.g. Q3 Co-op Funds' },
};

export const WithHelperText: Story = {
  args: {
    label: 'Amount',
    placeholder: '0.00',
    helperText: 'Amount in USD before taxes',
  },
};

export const Error: Story = {
  args: {
    label: 'Amount',
    defaultValue: '-50',
    error: true,
    helperText: 'Amount must be positive',
  },
};

export const Disabled: Story = {
  args: { label: 'Fund name', defaultValue: 'Q3 Co-op Funds', disabled: true },
};

export const FullWidth: Story = {
  render: (args) => (
    <Stack spacing={2} sx={{ width: 360 }}>
      <TextField {...args} label="Claim title" fullWidth />
      <TextField {...args} label="Reference" fullWidth />
    </Stack>
  ),
};
