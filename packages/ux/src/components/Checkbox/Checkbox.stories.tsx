import type { Meta, StoryObj } from '@storybook/react-vite';
import Stack from '@mui/material/Stack';
import { Checkbox } from './Checkbox';

const meta = {
  title: 'Inputs/Checkbox',
  component: Checkbox,
  argTypes: {
    size: {
      control: 'select',
      options: ['small', 'medium'],
    },
  },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Checked: Story = { args: { defaultChecked: true } };

export const WithLabel: Story = {
  args: { label: 'Include archived claims', defaultChecked: true },
};

export const Indeterminate: Story = { args: { indeterminate: true } };

export const Disabled: Story = {
  render: (args) => (
    <Stack>
      <Checkbox {...args} label="Disabled unchecked" disabled />
      <Checkbox {...args} label="Disabled checked" disabled defaultChecked />
    </Stack>
  ),
};
