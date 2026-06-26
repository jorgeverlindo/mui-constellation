import type { Meta, StoryObj } from '@storybook/react-vite';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { ProgressLinear } from './ProgressLinear';

const meta = {
  title: 'Feedback/ProgressLinear',
  component: ProgressLinear,
  args: { value: 60 },
  argTypes: {
    variant: {
      control: 'select',
      options: ['determinate', 'indeterminate', 'buffer'],
    },
    value: { control: { type: 'range', min: 0, max: 100 } },
  },
  decorators: [
    (Story) => (
      <div style={{ width: 360 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ProgressLinear>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Determinate: Story = {};

export const Indeterminate: Story = {
  args: { variant: 'indeterminate' },
};

export const Buffer: Story = {
  args: { variant: 'buffer', value: 45, valueBuffer: 70 },
};

export const Values: Story = {
  render: () => (
    <Stack spacing={2}>
      {[0, 25, 50, 75, 100].map((v) => (
        <Stack key={v} spacing={0.5}>
          <Typography variant="caption" color="text.secondary">
            {v}%
          </Typography>
          <ProgressLinear value={v} />
        </Stack>
      ))}
    </Stack>
  ),
};
