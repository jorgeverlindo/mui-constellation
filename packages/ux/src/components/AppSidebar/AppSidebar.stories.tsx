import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import RssFeedIcon from '@mui/icons-material/RssFeed';
import BrushOutlinedIcon from '@mui/icons-material/BrushOutlined';
import LanguageOutlinedIcon from '@mui/icons-material/LanguageOutlined';
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import InsightsOutlinedIcon from '@mui/icons-material/InsightsOutlined';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { AppSidebar, type AppSidebarItem } from './AppSidebar';

const navItems: AppSidebarItem[] = [
  { id: 'projects', label: 'Projects', icon: <FolderOutlinedIcon /> },
  { id: 'feeds', label: 'Feeds', icon: <RssFeedIcon /> },
  { id: 'design', label: 'Design', icon: <BrushOutlinedIcon /> },
  { id: 'portal', label: 'Portal', icon: <LanguageOutlinedIcon /> },
  { id: 'campaigns', label: 'Campaigns', icon: <CampaignOutlinedIcon /> },
  { id: 'inventory', label: 'Inventory', icon: <Inventory2OutlinedIcon /> },
  { id: 'insights', label: 'Insights', icon: <InsightsOutlinedIcon /> },
  { id: 'ai-tools', label: 'AI Tools', icon: <AutoAwesomeOutlinedIcon /> },
  { id: 'chats', label: 'Chats', icon: <ChatBubbleOutlineIcon /> },
];

const logo = (
  <Avatar
    variant="rounded"
    sx={{
      width: 40,
      height: 40,
      bgcolor: 'background.paper',
      color: 'brand.accent',
      fontWeight: 500,
    }}
  >
    C
  </Avatar>
);

const meta = {
  title: 'Navigation/AppSidebar',
  component: AppSidebar,
  args: {
    items: navItems,
    activeId: 'campaigns',
    logo,
  },
  decorators: [
    (Story) => (
      <Box sx={{ height: 640, display: 'flex' }}>
        <Story />
      </Box>
    ),
  ],
} satisfies Meta<typeof AppSidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ProjectsActive: Story = { args: { activeId: 'projects' } };

export const InsightsActive: Story = { args: { activeId: 'insights' } };

export const NoActiveItem: Story = { args: { activeId: undefined } };

export const WithFooter: Story = {
  args: {
    footer: (
      <IconButton aria-label="Help" sx={{ color: 'rail.icon' }}>
        <HelpOutlineIcon />
      </IconButton>
    ),
  },
};

export const Interactive: Story = {
  render: (args) => {
    const [active, setActive] = useState('campaigns');
    return <AppSidebar {...args} activeId={active} onSelect={setActive} />;
  },
};
