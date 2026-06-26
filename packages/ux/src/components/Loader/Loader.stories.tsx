import type { Meta, StoryObj } from '@storybook/react-vite';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Loader } from './Loader';

const meta = {
  title: 'Feedback/Loader',
  component: Loader,
  args: { size: 32, running: true },
  argTypes: {
    size: { control: { type: 'range', min: 16, max: 96 } },
    running: { control: 'boolean' },
  },
} satisfies Meta<typeof Loader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Sizes: Story = {
  render: (args) => (
    <Stack direction="row" spacing={4} alignItems="center">
      {[20, 32, 48, 64].map((s) => (
        <Stack key={s} spacing={1} alignItems="center">
          <Loader {...args} size={s} />
          <Typography variant="caption" color="text.secondary">
            {s}px
          </Typography>
        </Stack>
      ))}
    </Stack>
  ),
};

export const Idle: Story = {
  args: { running: false },
};
