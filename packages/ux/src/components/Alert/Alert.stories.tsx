import type { Meta, StoryObj } from '@storybook/react-vite';
import AlertTitle from '@mui/material/AlertTitle';
import Stack from '@mui/material/Stack';
import { Alert } from './Alert';

const meta = {
  title: 'Feedback/Alert',
  component: Alert,
  args: { children: 'Your report has been generated successfully.' },
  argTypes: {
    severity: {
      control: 'select',
      options: ['error', 'warning', 'info', 'success'],
    },
    variant: {
      control: 'select',
      options: ['standard', 'outlined', 'filled'],
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: 480 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Severities: Story = {
  render: () => (
    <Stack spacing={2}>
      <Alert severity="error">Claim submission failed. Please try again.</Alert>
      <Alert severity="warning">Revision requested — review the flagged items.</Alert>
      <Alert severity="info">Funds data refreshes every 24 hours.</Alert>
      <Alert severity="success">Pre-approval submitted.</Alert>
    </Stack>
  ),
};

export const WithTitle: Story = {
  render: () => (
    <Alert severity="error">
      <AlertTitle>Submission denied</AlertTitle>
      The claim exceeds the remaining fund balance for this period.
    </Alert>
  ),
};

export const Dismissible: Story = {
  args: {
    severity: 'info',
    onClose: () => {},
    children: 'Web monitoring is now active for 3 dealer sites.',
  },
};
