import type { Meta, StoryObj } from '@storybook/react-vite';
import Stack from '@mui/material/Stack';
import { Button } from './Button';

const meta = {
  title: 'Inputs/Button',
  component: Button,
  args: { children: 'Add Funds' },
  argTypes: {
    variant: {
      control: 'select',
      options: ['contained', 'outlined', 'text'],
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
    },
    color: {
      control: 'select',
      options: ['primary', 'secondary', 'error', 'warning'],
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Contained: Story = {};

export const Outlined: Story = { args: { variant: 'outlined' } };

export const Text: Story = { args: { variant: 'text' } };

export const Sizes: Story = {
  render: (args) => (
    <Stack direction="row" spacing={2} alignItems="center">
      <Button {...args} size="small">Small</Button>
      <Button {...args} size="medium">Medium</Button>
      <Button {...args} size="large">Large</Button>
    </Stack>
  ),
};

export const Destructive: Story = { args: { color: 'error', children: 'Delete' } };

export const Disabled: Story = { args: { disabled: true } };
