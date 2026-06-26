import type { Meta, StoryObj } from '@storybook/react-vite';
import Stack from '@mui/material/Stack';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { IconButton } from './IconButton';

const meta = {
  title: 'Inputs/IconButton',
  component: IconButton,
  args: { children: <CloseIcon fontSize="inherit" />, 'aria-label': 'Close' },
  argTypes: {
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
    },
    color: {
      control: 'select',
      options: ['default', 'primary', 'secondary', 'error', 'warning'],
    },
  },
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Sizes: Story = {
  render: (args) => (
    <Stack direction="row" spacing={2} alignItems="center">
      <IconButton {...args} size="small" />
      <IconButton {...args} size="medium" />
      <IconButton {...args} size="large" />
    </Stack>
  ),
};

export const Colors: Story = {
  render: (args) => (
    <Stack direction="row" spacing={2} alignItems="center">
      <IconButton {...args} aria-label="Search">
        <SearchIcon fontSize="inherit" />
      </IconButton>
      <IconButton {...args} color="primary" aria-label="Notifications">
        <NotificationsNoneIcon fontSize="inherit" />
      </IconButton>
      <IconButton {...args} color="error" aria-label="Delete">
        <DeleteOutlineIcon fontSize="inherit" />
      </IconButton>
    </Stack>
  ),
};

export const Disabled: Story = { args: { disabled: true } };
