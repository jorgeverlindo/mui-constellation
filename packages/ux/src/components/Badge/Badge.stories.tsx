import type { Meta, StoryObj } from '@storybook/react-vite';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import NotificationsNoneOutlined from '@mui/icons-material/NotificationsNoneOutlined';
import MailOutline from '@mui/icons-material/MailOutline';
import { Badge } from './Badge';

const bell = (
  <IconButton size="small">
    <NotificationsNoneOutlined />
  </IconButton>
);

const meta = {
  title: 'Display/Badge',
  component: Badge,
  args: {
    badgeContent: 4,
    children: bell,
  },
  argTypes: {
    color: {
      control: 'select',
      options: ['primary', 'secondary', 'error', 'warning', 'default'],
    },
    variant: {
      control: 'select',
      options: ['standard', 'dot'],
    },
    max: { control: 'number' },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Overflow: Story = {
  // max defaults to 9 → renders "9+" like the TopNavBar bell
  args: { badgeContent: 23 },
};

export const Dot: Story = { args: { variant: 'dot' } };

export const Colors: Story = {
  render: (args) => (
    <Stack direction="row" spacing={3}>
      <Badge {...args} color="primary">{bell}</Badge>
      <Badge {...args} color="error">{bell}</Badge>
      <Badge {...args} color="warning">{bell}</Badge>
    </Stack>
  ),
};

export const ZeroHidden: Story = {
  render: (args) => (
    <Stack direction="row" spacing={3}>
      <Badge {...args} badgeContent={0}>
        <IconButton size="small">
          <MailOutline />
        </IconButton>
      </Badge>
      <Badge {...args} badgeContent={0} showZero>
        <IconButton size="small">
          <MailOutline />
        </IconButton>
      </Badge>
    </Stack>
  ),
};
