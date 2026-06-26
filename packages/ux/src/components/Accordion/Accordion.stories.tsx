import type { Meta, StoryObj } from '@storybook/react-vite';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Accordion } from './Accordion';

const meta = {
  title: 'Navigation/Accordion',
  component: Accordion,
  args: {
    title: 'Offers',
    children:
      'Promotional offers attached to this project appear here, including start and end dates.',
  },
  argTypes: {
    variant: { control: 'select', options: ['divider', 'filled'] },
  },
  decorators: [
    (Story) => (
      <Box sx={{ maxWidth: 520 }}>
        <Story />
      </Box>
    ),
  ],
} satisfies Meta<typeof Accordion>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Divider: Story = {};

export const Filled: Story = { args: { variant: 'filled' } };

export const DefaultExpanded: Story = { args: { defaultExpanded: true } };

export const Disabled: Story = { args: { disabled: true } };

export const WithSecondarySlot: Story = {
  args: {
    title: 'Templates',
    secondary: <Chip label="3 pending" size="small" color="warning" />,
    variant: 'filled',
  },
};

export const Group: Story = {
  render: () => (
    <Stack>
      <Accordion title="Offers" defaultExpanded>
        <Typography variant="body2" color="text.secondary">
          2 active offers — Spring Sales Event, Loyalty Bonus.
        </Typography>
      </Accordion>
      <Accordion title="Templates">
        <Typography variant="body2" color="text.secondary">
          No templates assigned yet.
        </Typography>
      </Accordion>
      <Accordion title="Compliance">
        <Typography variant="body2" color="text.secondary">
          All assets passed the latest compliance review.
        </Typography>
      </Accordion>
    </Stack>
  ),
};

export const FilledGroup: Story = {
  render: () => (
    <Stack spacing={1.5}>
      <Accordion variant="filled" title="Offers" defaultExpanded>
        <Typography variant="body2" color="text.secondary">
          2 active offers — Spring Sales Event, Loyalty Bonus.
        </Typography>
      </Accordion>
      <Accordion
        variant="filled"
        title="Templates"
        secondary={<Chip label="In review" size="small" />}
      >
        <Typography variant="body2" color="text.secondary">
          1 template awaiting approval.
        </Typography>
      </Accordion>
    </Stack>
  ),
};
