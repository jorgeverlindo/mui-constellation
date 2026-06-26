import { useState, type ComponentProps } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import Stack from '@mui/material/Stack';
import { Select, type SelectOption } from './Select';

const fundOptions: SelectOption[] = [
  { value: 'coop', label: 'Co-op Advertising' },
  { value: 'training', label: 'Training Fund' },
  { value: 'demo', label: 'Demo Vehicles' },
  { value: 'events', label: 'Events & Sponsorship', disabled: true },
];

const meta = {
  title: 'Inputs/Select',
  component: Select,
  args: {
    label: 'Fund Type',
    options: fundOptions,
    sx: { minWidth: 240 },
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['small', 'medium'],
    },
  },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

function ControlledSelect({
  defaultValue,
  ...props
}: ComponentProps<typeof Select>) {
  const [value, setValue] = useState<string>(
    typeof defaultValue === 'string' ? defaultValue : '',
  );
  return (
    <Select
      {...props}
      value={value}
      onChange={(event) => setValue(event.target.value as string)}
    />
  );
}

export const Default: Story = {
  render: (args) => <ControlledSelect {...args} fullWidth={false} />,
};

export const WithPlaceholder: Story = {
  render: (args) => <ControlledSelect {...args} placeholder="Select a fund…" />,
};

export const WithValue: Story = {
  render: (args) => <ControlledSelect {...args} defaultValue="coop" />,
};

export const HelperText: Story = {
  render: (args) => (
    <ControlledSelect {...args} helperText="Determines the claim workflow." />
  ),
};

export const ErrorState: Story = {
  render: (args) => (
    <ControlledSelect {...args} error helperText="Fund type is required." />
  ),
};

export const Disabled: Story = {
  render: (args) => <ControlledSelect {...args} defaultValue="coop" disabled />,
};

export const Sizes: Story = {
  render: (args) => (
    <Stack direction="row" spacing={2}>
      <ControlledSelect {...args} size="small" label="Small" defaultValue="coop" />
      <ControlledSelect {...args} size="medium" label="Medium" defaultValue="coop" />
    </Stack>
  ),
};
