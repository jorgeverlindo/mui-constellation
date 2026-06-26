import type { Meta, StoryObj } from '@storybook/react-vite';
import Box from '@mui/material/Box';
import { Chip } from '../Chip/Chip';
import { KeyValueRow } from './KeyValueRow';

const meta = {
  title: 'Display/KeyValueRow',
  component: KeyValueRow,
  args: {
    label: 'Dealership',
    value: 'AutoNation Volkswagen Las Vegas',
  },
  decorators: [
    (Story) => (
      <Box sx={{ width: 380 }}>
        <Story />
      </Box>
    ),
  ],
} satisfies Meta<typeof KeyValueRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Copyable: Story = {
  args: {
    label: 'VIN',
    value: '3VW2B7AJ5KM214098',
    copyValue: '3VW2B7AJ5KM214098',
  },
};

export const DetailList: Story = {
  render: () => (
    <Box>
      <KeyValueRow label="Claim ID" value="CLM-2024-00318" copyValue="CLM-2024-00318" />
      <KeyValueRow label="Dealership" value="AutoNation VW Las Vegas" />
      <KeyValueRow label="Submitted" value="Mar 12, 2026" />
      <KeyValueRow
        label="Status"
        value={<Chip variant="success" label="Approved" />}
      />
      <KeyValueRow label="Amount" value="$12,400.00" copyValue="12400.00" divider={false} />
    </Box>
  ),
};

export const WithoutDivider: Story = {
  args: { divider: false },
};
