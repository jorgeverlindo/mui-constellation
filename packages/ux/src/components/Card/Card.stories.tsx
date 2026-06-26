import type { Meta, StoryObj } from '@storybook/react-vite';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MoreHoriz from '@mui/icons-material/MoreHoriz';
import { Card, CardHeader, CardContent } from './Card';
import { KeyValueRow } from '../KeyValueRow/KeyValueRow';

const meta = {
  title: 'Display/Card',
  component: Card,
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Card sx={{ width: 360 }}>
      <CardHeader title="Fund Utilization" subheader="Q3 2026 · all dealers" />
      <CardContent>
        <Typography variant="body2" color="text.secondary">
          Budget consumption across co-op programs, updated daily.
        </Typography>
      </CardContent>
    </Card>
  ),
};

export const WithAction: Story = {
  render: () => (
    <Card sx={{ width: 360 }}>
      <CardHeader
        title="Spend Breakdown"
        subheader="Last 30 days"
        action={
          <IconButton size="small" aria-label="More options">
            <MoreHoriz fontSize="small" />
          </IconButton>
        }
      />
      <CardContent>
        <Typography variant="body2" color="text.secondary">
          Digital 64% · TV 21% · Print 15%
        </Typography>
      </CardContent>
    </Card>
  ),
};

/** Compact KPI pattern (KPICard/MetricCard in the app): 12px/8px padding. */
export const KPI: Story = {
  render: () => (
    <Stack direction="row" spacing={1.5}>
      {[
        ['Total Budget', '$1.2M'],
        ['Claims Submitted', '348'],
        ['Approval Rate', '92%'],
      ].map(([label, value]) => (
        <Card key={label} sx={{ px: 1.5, py: 1, minWidth: 120, flex: 1 }}>
          <Typography sx={{ fontSize: 11, letterSpacing: '0.4px', lineHeight: 1.66, color: 'ink.primary' }}>
            {label}
          </Typography>
          <Typography sx={{ fontSize: 16, letterSpacing: '0.15px', lineHeight: 1.75, color: 'ink.secondary' }}>
            {value}
          </Typography>
        </Card>
      ))}
    </Stack>
  ),
};

export const WithKeyValueRows: Story = {
  render: () => (
    <Card sx={{ width: 380 }}>
      <CardHeader title="Claim Details" />
      <CardContent sx={{ pt: 1 }}>
        <Box>
          <KeyValueRow label="Claim ID" value="CLM-2024-00318" copyValue="CLM-2024-00318" />
          <KeyValueRow label="Submitted" value="Mar 12, 2026" />
          <KeyValueRow label="Amount" value="$12,400.00" divider={false} />
        </Box>
      </CardContent>
    </Card>
  ),
};
