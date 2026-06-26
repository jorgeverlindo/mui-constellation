import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import Typography from '@mui/material/Typography';
import { Button } from '../Button/Button';
import { Dialog, DialogActions, DialogContent, DialogTitle } from './Dialog';

const meta = {
  title: 'Feedback/Dialog',
  component: Dialog,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

function BasicDialogDemo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Share report</Button>
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle onClose={() => setOpen(false)}>Share report</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Send this report to recipients by email or copy a link to the
            current version.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button variant="text" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={() => setOpen(false)}>Send</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export const Default: Story = {
  args: { open: false, children: null },
  render: () => <BasicDialogDemo />,
};

function ConfirmationDialogDemo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button color="error" variant="outlined" onClick={() => setOpen(true)}>
        Delete monitor
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete this monitor?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            This will stop web monitoring for the selected dealer sites. This
            action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button variant="text" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button color="error" onClick={() => setOpen(false)}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export const Confirmation: Story = {
  args: { open: false, children: null },
  render: () => <ConfirmationDialogDemo />,
};

function ScrollableDialogDemo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="outlined" onClick={() => setOpen(true)}>
        Open guidelines
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle onClose={() => setOpen(false)}>Fund guidelines</DialogTitle>
        <DialogContent dividers>
          {Array.from({ length: 12 }, (_, i) => (
            <Typography key={i} variant="body2" color="text.secondary" paragraph>
              Section {i + 1} — eligibility rules, claim windows and required
              documentation for co-op fund usage across approved channels.
            </Typography>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Done</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export const ScrollableContent: Story = {
  args: { open: false, children: null },
  render: () => <ScrollableDialogDemo />,
};
