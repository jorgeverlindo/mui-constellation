import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import Stack from '@mui/material/Stack';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker, type DatePickerProps } from './DatePicker';

const meta = {
  title: 'Inputs/DatePicker',
  component: DatePicker,
  decorators: [
    (Story) => (
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Story />
      </LocalizationProvider>
    ),
  ],
  args: {
    label: 'Start Date',
  },
} satisfies Meta<typeof DatePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

function ControlledDatePicker(props: DatePickerProps) {
  const [value, setValue] = useState<Date | null>(props.value ?? null);
  return <DatePicker {...props} value={value} onChange={setValue} />;
}

export const Default: Story = {
  render: (args) => <ControlledDatePicker {...args} />,
};

export const WithValue: Story = {
  render: (args) => (
    <ControlledDatePicker {...args} value={new Date(2026, 5, 12)} />
  ),
};

export const ErrorState: Story = {
  render: (args) => (
    <ControlledDatePicker
      {...args}
      slotProps={{
        textField: { error: true, helperText: 'Start date is required.' },
      }}
    />
  ),
};

export const Disabled: Story = {
  render: (args) => (
    <ControlledDatePicker {...args} value={new Date(2026, 5, 12)} disabled />
  ),
};

export const MinMaxDates: Story = {
  render: (args) => (
    <ControlledDatePicker
      {...args}
      label="Within Q2 2026"
      minDate={new Date(2026, 3, 1)}
      maxDate={new Date(2026, 5, 30)}
    />
  ),
};

export const Sizes: Story = {
  render: (args) => (
    <Stack direction="row" spacing={2}>
      <ControlledDatePicker
        {...args}
        label="Small"
        slotProps={{ textField: { size: 'small' } }}
      />
      <ControlledDatePicker {...args} label="Medium" />
    </Stack>
  ),
};
