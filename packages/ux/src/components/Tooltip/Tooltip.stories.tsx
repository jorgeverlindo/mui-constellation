import type { Meta, StoryObj } from '@storybook/react-vite';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import InfoOutlined from '@mui/icons-material/InfoOutlined';
import { Tooltip } from './Tooltip';

const meta = {
  title: 'Display/Tooltip',
  component: Tooltip,
  args: {
    title: 'Copy value',
    children: <Button variant="outlined">Hover me</Button>,
  },
  argTypes: {
    placement: {
      control: 'select',
      options: ['top', 'bottom', 'left', 'right'],
    },
    arrow: { control: 'boolean' },
  },
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Placements: Story = {
  render: (args) => (
    <Stack direction="row" spacing={4} sx={{ p: 6 }}>
      <Tooltip {...args} title="Top" placement="top">
        <Button variant="outlined">Top</Button>
      </Tooltip>
      <Tooltip {...args} title="Bottom" placement="bottom">
        <Button variant="outlined">Bottom</Button>
      </Tooltip>
      <Tooltip {...args} title="Left" placement="left">
        <Button variant="outlined">Left</Button>
      </Tooltip>
      <Tooltip {...args} title="Right" placement="right">
        <Button variant="outlined">Right</Button>
      </Tooltip>
    </Stack>
  ),
};

export const WithoutArrow: Story = { args: { arrow: false } };

export const OnIconButton: Story = {
  render: (args) => (
    <Tooltip {...args} title="More information">
      <IconButton size="small">
        <InfoOutlined fontSize="small" />
      </IconButton>
    </Tooltip>
  ),
};

export const LongText: Story = {
  args: {
    title:
      'Longer helper text wraps at 220px max-width, matching the original app side-panel tooltips.',
  },
};
