import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Button } from '../Button/Button';
import { Drawer } from './Drawer';

const meta = {
  title: 'Feedback/Drawer',
  component: Drawer,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Drawer>;

export default meta;
type Story = StoryObj<typeof meta>;

function DefaultDrawerDemo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open client settings</Button>
      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title="Client Settings"
      >
        <List disablePadding>
          {['Profile', 'Fund rules', 'Notifications', 'Integrations', 'Team'].map(
            (item) => (
              <ListItemButton key={item} sx={{ borderRadius: 1 }}>
                <ListItemText
                  primary={item}
                  slotProps={{ primary: { variant: 'body2' } }}
                />
              </ListItemButton>
            ),
          )}
        </List>
      </Drawer>
    </>
  );
}

export const Default: Story = {
  args: { open: false },
  render: () => <DefaultDrawerDemo />,
};

function WideDrawerDemo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="outlined" onClick={() => setOpen(true)}>
        Open filters (480px)
      </Button>
      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title="Filters"
        width={480}
      >
        <Stack spacing={2} sx={{ pt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Wider side sheet for dense content — the app resizes its side
            sheets between 200px and 480px.
          </Typography>
          <Button variant="outlined" size="small">
            Reset filters
          </Button>
        </Stack>
      </Drawer>
    </>
  );
}

export const WideSheet: Story = {
  args: { open: false },
  render: () => <WideDrawerDemo />,
};

function PersistentDrawerDemo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="outlined" onClick={() => setOpen((v) => !v)}>
        Toggle persistent panel
      </Button>
      <Drawer
        variant="persistent"
        open={open}
        onClose={() => setOpen(false)}
        title="Activity"
      >
        <Typography variant="body2" color="text.secondary" sx={{ pt: 1 }}>
          Persistent variant — stays open alongside the page content without a
          backdrop.
        </Typography>
      </Drawer>
    </>
  );
}

export const Persistent: Story = {
  args: { open: false },
  render: () => <PersistentDrawerDemo />,
};
