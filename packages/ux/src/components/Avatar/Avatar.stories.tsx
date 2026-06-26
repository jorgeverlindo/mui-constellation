import type { Meta, StoryObj } from '@storybook/react-vite';
import Stack from '@mui/material/Stack';
import { Avatar } from './Avatar';

const meta = {
  title: 'Display/Avatar',
  component: Avatar,
  args: { name: 'Jorge Verlindo' },
  argTypes: {
    size: { control: { type: 'number', min: 14, max: 96 } },
    variant: {
      control: 'select',
      options: ['circular', 'rounded', 'square'],
    },
    colorFromName: { control: 'boolean' },
  },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const DerivedColors: Story = {
  render: (args) => (
    <Stack direction="row" spacing={1.5}>
      <Avatar {...args} colorFromName name="Jorge Verlindo" />
      <Avatar {...args} colorFromName name="Ana Souza" />
      <Avatar {...args} colorFromName name="Marcus Webb" />
      <Avatar {...args} colorFromName name="Lena Park" />
      <Avatar {...args} colorFromName name="Diego Ortiz" />
    </Stack>
  ),
};

export const Sizes: Story = {
  render: (args) => (
    <Stack direction="row" spacing={1.5} alignItems="center">
      <Avatar {...args} size={16} />
      <Avatar {...args} size={24} />
      <Avatar {...args} size={32} />
      <Avatar {...args} size={48} />
      <Avatar {...args} size={64} />
    </Stack>
  ),
};

export const Shapes: Story = {
  render: (args) => (
    <Stack direction="row" spacing={1.5}>
      <Avatar {...args} variant="circular" />
      <Avatar {...args} variant="rounded" />
      <Avatar {...args} variant="square" />
    </Stack>
  ),
};

export const WithImage: Story = {
  args: {
    src: 'https://i.pravatar.cc/64?img=12',
    size: 48,
  },
};

export const SingleName: Story = { args: { name: 'Constellation' } };
