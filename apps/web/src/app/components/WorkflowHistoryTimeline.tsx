import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { WorkflowEvent, WorkflowDocument } from '../contexts/WorkflowContext';

function isRevisionEvent(evt: WorkflowEvent): boolean {
  return evt.action.toLowerCase().includes('revision') || evt.action.toLowerCase().includes('requested');
}

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  return (
    d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
    ' · ' +
    d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  );
}

interface WorkflowHistoryTimelineProps {
  history: WorkflowEvent[];
  onPreviewDoc?: (doc: WorkflowDocument) => void;
}

export function WorkflowHistoryTimeline({ history, onPreviewDoc }: WorkflowHistoryTimelineProps) {
  if (history.length === 0) return null;

  return (
    <Box component="section">
      <Typography sx={{ color: 'text.primary', fontSize: '15px', fontWeight: 500, mb: '16px' }}>
        Activity
      </Typography>
      <Box sx={{ position: 'relative' }}>
        {history.map((evt, i) => (
          <Box key={evt.id} sx={{ display: 'flex', gap: '12px' }}>
            {/* Dot + connector */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  flexShrink: 0,
                  mt: '5px',
                  bgcolor: isRevisionEvent(evt) ? '#E17613' : evt.actor === 'OEM' ? '#473BAB' : '#1f1d25',
                }}
              />
              {i < history.length - 1 && (
                <Box sx={{ width: '1px', flex: 1, bgcolor: '#E0E0E0', my: '4px' }} />
              )}
            </Box>

            {/* Content */}
            <Box sx={{ pb: '16px', minWidth: 0, flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '8px' }}>
                <Typography sx={{ fontSize: '13px', fontWeight: 500, color: 'text.primary' }}>
                  {evt.actorName}
                </Typography>
                <Typography sx={{ fontSize: '11px', color: 'text.disabled', whiteSpace: 'nowrap' }}>
                  {formatTimestamp(evt.timestamp)}
                </Typography>
              </Box>
              <Typography sx={{ fontSize: '13px', color: 'text.secondary', mt: '2px' }}>
                {evt.action}
              </Typography>

              {evt.comment && (
                <Box
                  sx={{
                    mt: '6px',
                    borderRadius: 2,
                    px: '12px',
                    py: '8px',
                    border: '1px solid',
                    fontSize: '13px',
                    lineHeight: 1.6,
                    whiteSpace: 'pre-wrap',
                    ...(isRevisionEvent(evt)
                      ? { bgcolor: 'rgba(225,118,19,0.06)', borderColor: 'rgba(225,118,19,0.3)', color: 'text.primary' }
                      : { bgcolor: 'surface.inputBackground', borderColor: '#E0E0E0', color: 'text.primary' }),
                  }}
                >
                  &ldquo;{evt.comment}&rdquo;
                </Box>
              )}

              {evt.attachments && evt.attachments.length > 0 && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: '6px', mt: '8px' }}>
                  {evt.attachments.map((doc, di) => (
                    <Paper
                      key={di}
                      variant="outlined"
                      sx={{ display: 'flex', alignItems: 'center', gap: '8px', px: '12px', py: '8px', borderRadius: 2, maxWidth: 320 }}
                    >
                      <Box sx={{ width: 32, height: 36, bgcolor: '#F5F5F5', border: '1px solid #E0E0E0', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Typography sx={{ fontSize: '8px', fontWeight: 700, color: 'error.main', lineHeight: 1 }}>
                          {doc.type.toUpperCase().slice(0, 4)}
                        </Typography>
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ fontSize: '12px', fontWeight: 500, color: 'text.primary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {doc.name}
                        </Typography>
                        <Typography sx={{ fontSize: '10px', color: 'text.disabled', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          {doc.type.toUpperCase()} · {doc.size}
                        </Typography>
                      </Box>
                      {onPreviewDoc && doc.url && (
                        <IconButton size="small" onClick={() => onPreviewDoc(doc)} title="Preview" sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }}>
                          <VisibilityIcon sx={{ fontSize: 14 }} />
                        </IconButton>
                      )}
                    </Paper>
                  ))}
                </Box>
              )}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
