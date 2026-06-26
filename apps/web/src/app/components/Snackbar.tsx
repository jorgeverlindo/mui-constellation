/**
 * Snackbar — event-bus based toast system.
 * emitSnackbar(message) can be called from anywhere (no React context needed).
 * <SnackbarHost /> mounted once near root renders the toasts.
 */
import { useEffect, useState, useCallback } from 'react';
import MuiSnackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

type Severity = 'success' | 'info' | 'warning' | 'error';

type SnackbarMsg = { id: number; message: string; severity?: Severity };

type Listener = (msg: SnackbarMsg) => void;
const listeners = new Set<Listener>();
let _counter = 0;

export function emitSnackbar(message: string, severity?: Severity) {
  const msg: SnackbarMsg = { id: ++_counter, message, severity };
  listeners.forEach(l => l(msg));
}

export function SnackbarHost() {
  const [items, setItems] = useState<SnackbarMsg[]>([]);

  const removeItem = useCallback((id: number) => {
    setItems(prev => prev.filter(i => i.id !== id));
  }, []);

  useEffect(() => {
    const listener: Listener = msg => {
      setItems(prev => [...prev, msg]);
      window.setTimeout(() => {
        setItems(prev => prev.filter(i => i.id !== msg.id));
      }, 3000);
    };
    listeners.add(listener);
    return () => { listeners.delete(listener); };
  }, []);

  // Show the most recent item (MUI Snackbar handles one at a time gracefully)
  const item = items[items.length - 1];

  return (
    <>
      {items.map(it => (
        <MuiSnackbar
          key={it.id}
          open={true}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          sx={{ bottom: { xs: 24 }, left: { xs: 24 } }}
        >
          <Alert
            severity={it.severity ?? 'info'}
            variant="filled"
            onClose={() => removeItem(it.id)}
            action={
              <IconButton size="small" color="inherit" onClick={() => removeItem(it.id)}>
                <CloseIcon fontSize="small" />
              </IconButton>
            }
            sx={{
              bgcolor: it.severity ? undefined : '#2a2831',
              color: 'white',
              fontSize: '0.75rem',
              letterSpacing: '0.17px',
              '& .MuiAlert-icon': { display: it.severity ? undefined : 'none' },
            }}
          >
            {it.message}
          </Alert>
        </MuiSnackbar>
      ))}
      {/* Suppress unused `item` warning */}
      {void item}
    </>
  );
}
