import type { Meta, StoryObj } from '@storybook/react-vite';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import CheckCircleOutline from '@mui/icons-material/CheckCircleOutline';
import HourglassEmpty from '@mui/icons-material/HourglassEmpty';
import CancelOutlined from '@mui/icons-material/CancelOutlined';
import { Chip } from './Chip';

const meta = {
  title: 'Display/Chip',
  component: Chip,
  args: { label: 'Confirmed', variant: 'success' },
  argTypes: {
    variant: {
      control: 'select',
      options: ['neutral', 'channel', 'success', 'warning', 'error', 'info'],
    },
  },
} satisfies Meta<typeof Chip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Variants: Story = {
  render: () => (
    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
      <Chip variant="neutral" label="Low" />
      <Chip variant="success" label="Approved" />
      <Chip variant="warning" label="Pending" />
      <Chip variant="error" label="Denied" />
      <Chip variant="info" label="In Review" />
      <Chip variant="channel" label="Google PMax" />
    </Stack>
  ),
};

export const StatusWithIcons: Story = {
  render: () => (
    <Stack direction="row" spacing={1}>
      <Chip variant="success" label="Confirmed" icon={<CheckCircleOutline />} />
      <Chip variant="warning" label="Revision Requested" icon={<HourglassEmpty />} />
      <Chip variant="error" label="Denied" icon={<CancelOutlined />} />
    </Stack>
  ),
};

export const Channel: Story = {
  render: () => (
    <Stack direction="row" spacing={1}>
      <Chip
        variant="channel"
        label="Google PMax"
        avatar={<Avatar src="https://www.google.com/favicon.ico" alt="" />}
      />
      <Chip
        variant="channel"
        label="Meta"
        avatar={<Avatar src="https://static.xx.fbcdn.net/rsrc.php/yT/r/aGT3gskzWBf.ico" alt="" />}
      />
    </Stack>
  ),
};

export const Removable: Story = {
  render: () => (
    <Stack direction="row" spacing={1}>
      <Chip variant="channel" label="Google PMax" onDelete={() => {}} />
      <Chip variant="neutral" label="Filter: Q3" onDelete={() => {}} />
    </Stack>
  ),
};

export const Clickable: Story = {
  args: { variant: 'neutral', label: 'Clickable', onClick: () => {} },
};
