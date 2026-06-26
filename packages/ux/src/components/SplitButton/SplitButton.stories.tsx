import type { Meta, StoryObj } from '@storybook/react-vite';
import Stack from '@mui/material/Stack';
import DownloadIcon from '@mui/icons-material/Download';
import ShareIcon from '@mui/icons-material/Share';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { SplitButton } from './SplitButton';

const meta = {
  title: 'Inputs/SplitButton',
  component: SplitButton,
  args: {
    children: 'Generate Report',
    options: [
      { label: 'Download PDF', value: 'pdf', icon: <DownloadIcon fontSize="small" /> },
      { label: 'Share Report', value: 'share', icon: <ShareIcon fontSize="small" /> },
    ],
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['contained', 'outlined', 'text'],
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
    },
    color: {
      control: 'select',
      options: ['primary', 'secondary', 'error', 'warning'],
    },
  },
} satisfies Meta<typeof SplitButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Outlined: Story = {};

export const Contained: Story = { args: { variant: 'contained' } };

export const WithDangerOption: Story = {
  args: {
    children: 'Approve',
    options: [
      { label: 'Request Adjustments', value: 'adjust' },
      {
        label: 'Decline',
        value: 'decline',
        danger: true,
        icon: <DeleteOutlineIcon fontSize="small" />,
      },
    ],
  },
};

export const PrimaryDisabled: Story = {
  args: { primaryDisabled: true },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const Sizes: Story = {
  render: (args) => (
    <Stack direction="row" spacing={2} alignItems="center">
      <SplitButton {...args} size="small">Small</SplitButton>
      <SplitButton {...args} size="medium">Medium</SplitButton>
      <SplitButton {...args} size="large">Large</SplitButton>
    </Stack>
  ),
};
