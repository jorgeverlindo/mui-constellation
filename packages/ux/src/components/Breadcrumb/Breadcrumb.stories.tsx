import type { Meta, StoryObj } from '@storybook/react-vite';
import { Breadcrumb } from './Breadcrumb';

const meta = {
  title: 'Navigation/Breadcrumb',
  component: Breadcrumb,
  args: {
    items: [
      { label: 'Funds' },
      { label: 'Claims' },
      { label: 'Claim #4821' },
    ],
  },
} satisfies Meta<typeof Breadcrumb>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithLinks: Story = {
  args: {
    items: [
      { label: 'Funds', href: '#funds' },
      { label: 'Claims', href: '#claims' },
      { label: 'Claim #4821' },
    ],
  },
};

export const WithClickHandlers: Story = {
  args: {
    items: [
      { label: 'Projects', onClick: () => console.log('Projects') },
      { label: 'Spring Campaign', onClick: () => console.log('Campaign') },
      { label: 'Asset Builder' },
    ],
  },
};

export const TwoLevels: Story = {
  args: {
    items: [{ label: 'Insights', href: '#insights' }, { label: 'Dashboards' }],
  },
};

export const Collapsed: Story = {
  args: {
    maxItems: 3,
    items: [
      { label: 'Portal', href: '#' },
      { label: 'Campaigns', href: '#' },
      { label: 'Meta', href: '#' },
      { label: 'Campaign Planner', href: '#' },
      { label: 'Ad Review' },
    ],
  },
};
