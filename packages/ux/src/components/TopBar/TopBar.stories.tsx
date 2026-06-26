import type { Meta, StoryObj } from '@storybook/react-vite';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';
import Badge from '@mui/material/Badge';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import SearchIcon from '@mui/icons-material/Search';
import { Breadcrumb } from '../Breadcrumb/Breadcrumb';
import { TopBar } from './TopBar';

const actions = (
  <>
    <IconButton size="small" aria-label="Comments">
      <ChatBubbleOutlineIcon fontSize="small" />
    </IconButton>
    <IconButton size="small" aria-label="Notifications">
      <Badge badgeContent={3} color="primary">
        <NotificationsNoneIcon fontSize="small" />
      </Badge>
    </IconButton>
    <IconButton size="small" aria-label="Settings">
      <SettingsOutlinedIcon fontSize="small" />
    </IconButton>
    <Avatar sx={{ width: 32, height: 32, ml: 0.5 }}>JV</Avatar>
  </>
);

const search = (
  <Box
    sx={{
      maxWidth: 560,
      mx: 'auto',
      height: 34,
      display: 'flex',
      alignItems: 'center',
      gap: 1,
      pl: 1,
      pr: 2,
      borderRadius: 999,
      bgcolor: 'background.paper',
      border: '1px solid',
      borderColor: 'divider',
    }}
  >
    <SearchIcon sx={{ color: 'ink.secondary' }} />
    <InputBase
      placeholder="Search anything"
      sx={{ flex: 1, fontSize: '0.875rem' }}
    />
  </Box>
);

const meta = {
  title: 'Navigation/TopBar',
  component: TopBar,
  args: { title: 'Funds' },
} satisfies Meta<typeof TopBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithActions: Story = { args: { actions } };

export const WithSearch: Story = {
  args: { actions, children: search },
};

export const WithBreadcrumb: Story = {
  args: {
    title: (
      <Breadcrumb
        items={[
          { label: 'Funds', href: '#' },
          { label: 'Claims', href: '#' },
          { label: 'Claim #4821' },
        ]}
      />
    ),
    actions,
  },
};

export const WithDivider: Story = {
  args: { divider: true, actions },
};
