// TODO: port full implementation from vw-funds-2
// Stub: renders the AgentPane shell with MUI Box/Typography/TextField/Button
// The complex animation, voice-input, and recommendation card rendering are stubbed.
import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import { usePaneResize, PaneResizer } from './PaneResizer';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import Collapse from '@mui/material/Collapse';

interface AgentPaneProps {
  isOpen: boolean;
  onClose: () => void;
  accountName?: string;
}

const CATEGORIES = ['Reports', 'Find a Specific Vehicle', 'Competitive Inventory', 'Create', 'Favorites'];

export function AgentPane({ isOpen, onClose, accountName }: AgentPaneProps) {
  const [value, setValue] = useState('');
  const [mounted, setMounted] = useState(false);
  const { width, isDragging, handleResizeStart } = usePaneResize({ initialWidth: 400, min: 280, max: 640, side: 'right' });
  useEffect(() => { if (isOpen) setMounted(true); }, [isOpen]);

  return (
    <>
      {mounted && (
        <Collapse
          in={isOpen}
          orientation="horizontal"
          appear
          timeout={350}
          onExited={() => setMounted(false)}
          sx={{ height: '100%', flexShrink: 0 }}
        >
      <Box sx={{ width, flexShrink: 0, height: '100%', display: 'flex', flexDirection: 'row' }}>
        <PaneResizer onMouseDown={handleResizeStart} isDragging={isDragging} />
        <Box
          sx={{
            flex: 1,
            height: '100%',
            bgcolor: 'background.paper',
            borderRadius: 4,
            border: '1px solid rgba(0,0,0,0.04)',
            boxShadow: '0px 1px 2px rgba(0,0,0,0.08)',
            display: 'flex',
            flexDirection: 'column',
            pt: '12px',
            px: '16px',
            overflow: 'hidden',
          }}
        >
        {/* Top bar */}
        <Box sx={{ display: 'flex', alignItems: 'center', height: 40, flexShrink: 0, position: 'relative', pb: '8px' }}>
          <Typography sx={{ fontSize: '16px', fontWeight: 500, color: 'text.primary', letterSpacing: '0.15px', flex: 1 }}>
            AI Agent Auto
          </Typography>
          <IconButton onClick={onClose} size="small" aria-label="Close agent pane" sx={{ color: 'rgba(17,16,20,0.56)' }}>
            <CloseIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Box>

        {/* Body */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          {/* Welcome */}
          <Box sx={{ pt: '12px', flexShrink: 0 }}>
            <Typography
              sx={{
                fontSize: '20px',
                fontWeight: 700,
                mb: '10px',
                opacity: 0.9,
                background: 'linear-gradient(99.77deg, #473BAB 37.41%, #ACABFF 55.08%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Welcome, Mallory
            </Typography>
            <Typography sx={{ fontSize: '14px', color: 'text.primary', letterSpacing: '0.15px', lineHeight: 1.5, opacity: 0.9, mb: '10px' }}>
              {`Hi, I'm your Auto Intelligence Agent currently focused on your store, how can I help you today?`}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Typography sx={{ fontSize: '14px', color: 'text.primary', opacity: 0.9, flexShrink: 0 }}>
                My current focus is
              </Typography>
              <Typography sx={{ fontSize: '14px', fontWeight: 700, background: 'linear-gradient(90deg, #473BAB, #1f1d25)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', opacity: 0.9, whiteSpace: 'nowrap' }}>
                {accountName ?? 'Jack Daniels Volkswagen'}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ flex: 1 }} />

          {/* Input area */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', pb: '16px', flexShrink: 0 }}>
            <Box
              sx={{
                bgcolor: 'background.paper',
                border: '1px solid rgba(0,0,0,0.12)',
                borderRadius: '16px',
                p: '12px',
                width: '100%',
                boxShadow: '0px 2px 2px rgba(0,0,0,0.08)',
              }}
            >
              <TextField
                value={value}
                onChange={e => setValue(e.target.value)}
                placeholder="Ask anything"
                multiline
                maxRows={4}
                fullWidth
                variant="standard"
                InputProps={{ disableUnderline: true, sx: { fontSize: '14px', color: 'text.primary' } }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: '8px' }}>
                <IconButton
                  size="small"
                  disabled={!value.trim()}
                  sx={{
                    bgcolor: 'primary.main',
                    color: 'white',
                    width: 30,
                    height: 30,
                    '&:hover': { bgcolor: '#392e8a' },
                    '&.Mui-disabled': { bgcolor: 'primary.main', opacity: 0.5, color: 'white' },
                  }}
                >
                  <SendIcon sx={{ fontSize: 14 }} />
                </IconButton>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
              {CATEGORIES.map(cat => (
                <Button
                  key={cat}
                  variant="outlined"
                  size="small"
                  sx={{
                    borderRadius: '100px',
                    borderColor: 'rgba(99,86,225,0.5)',
                    color: 'primary.main',
                    fontSize: '13px',
                    fontWeight: 500,
                    textTransform: 'capitalize',
                    '&:hover': { bgcolor: 'rgba(71,59,171,0.06)', borderColor: 'primary.main' },
                  }}
                >
                  {cat}
                </Button>
              ))}
            </Box>
          </Box>
        </Box>
        </Box>
      </Box>
        </Collapse>
      )}
    </>
  );
}
