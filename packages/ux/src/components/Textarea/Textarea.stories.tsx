import type { Meta, StoryObj } from '@storybook/react-vite';
import { Textarea } from './Textarea';

const meta = {
  title: 'Inputs/Textarea',
  component: Textarea,
  args: { placeholder: 'Add a note…' },
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithLabel: Story = {
  args: { label: 'Notes', placeholder: 'Describe the claim…' },
};

export const Error: Story = {
  args: {
    label: 'Notes',
    error: true,
    helperText: 'Notes are required',
  },
};

export const FixedRows: Story = {
  args: { label: 'Comments', minRows: 4, maxRows: 8 },
};

export const Disabled: Story = {
  args: { label: 'Notes', defaultValue: 'Read-only note', disabled: true },
};
