import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export type MonitorStage = 'preparing' | 'complete' | 'error' | 'cancelled';

export interface MonitorState {
  stage: MonitorStage;
  reportName: string;
  displayName: string;
  blobUrl: string | null;
}

interface ActivityMonitorProps extends MonitorState {
  onClose: () => void;
}

const stageLabel: Record<MonitorStage, string> = {
  preparing: 'Preparing download',
  complete: 'Download complete',
  error: 'Download failed',
  cancelled: 'Download cancelled',
};

export function ActivityMonitor({ stage, displayName, blobUrl, onClose }: ActivityMonitorProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => { setCollapsed(false); }, [stage]);

  const handleClose = () => {
    if (isExiting) return;
    setIsExiting(true);
    setTimeout(onClose, 400);
  };

  const isCancelled = stage === 'cancelled';
  const isError = stage === 'error';
  const borderColor = isError ? '#E53E3E' : '#5151D3';

  const node = (
    <Box
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 24,
        zIndex: 9999,
        width: 340,
        borderRadius: '12px 12px 0 0',
        overflow: 'hidden',
        boxShadow: '0 -2px 20px rgba(0,0,0,0.12)',
        transform: isExiting ? 'translateY(110%)' : 'translateY(0)',
        transition: 'transform 0.4s cubic-bezier(0.4,0,0.2,1)',
        ...(isCancelled
          ? { bgcolor: '#2D2D38' }
          : { border: `2px solid ${borderColor}`, borderBottom: 'none', bgcolor: 'background.paper' }),
      }}
    >
      {isCancelled ? (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: '16px', height: 46 }}>
          <Typography sx={{ color: 'white', fontSize: '13px', fontWeight: 500 }}>
            {stageLabel.cancelled}
          </Typography>
          <IconButton onClick={handleClose} size="small" sx={{ color: 'white' }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      ) : (
        <>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: '16px', height: 46, bgcolor: '#F2F2F5', gap: '4px' }}>
            <Typography sx={{ flex: 1, fontSize: '12px', fontWeight: 500, color: 'text.primary', lineHeight: 1 }}>
              {stageLabel[stage]}
            </Typography>
            <IconButton onClick={() => setCollapsed(c => !c)} size="small" aria-label={collapsed ? 'Expand' : 'Collapse'}>
              <ExpandMoreIcon sx={{ transform: collapsed ? 'rotate(180deg)' : 'none', transition: 'transform 0.4s', fontSize: 18 }} />
            </IconButton>
            <IconButton onClick={handleClose} size="small">
              <CloseIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Box>

          <Box sx={{ overflow: 'hidden', height: collapsed ? 0 : 56, transition: 'height 0.4s cubic-bezier(0.4,0,0.2,1)' }}>
            <Box
              role={blobUrl ? 'button' : undefined}
              tabIndex={blobUrl ? 0 : undefined}
              onClick={() => blobUrl && window.open(blobUrl, '_blank')}
              sx={{
                display: 'flex',
                alignItems: 'center',
                px: '14px',
                height: 56,
                gap: '12px',
                bgcolor: 'background.paper',
                cursor: blobUrl ? 'pointer' : 'default',
                transform: collapsed ? 'translateY(100%)' : 'translateY(0)',
                transition: 'transform 0.4s cubic-bezier(0.4,0,0.2,1)',
              }}
            >
              {/* PDF icon */}
              <Box sx={{ width: 28, height: 34, bgcolor: '#E8E8EE', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Typography sx={{ fontSize: '8px', fontWeight: 700, color: '#6B6B78', letterSpacing: '0.5px' }}>PDF</Typography>
              </Box>

              <Typography sx={{ flex: 1, fontSize: '13px', color: 'text.primary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {displayName}
              </Typography>

              {stage === 'preparing' && <CircularProgress size={22} sx={{ color: '#5151D3' }} />}
              {stage === 'complete' && <CheckCircleIcon sx={{ color: '#22C55E', fontSize: 22 }} />}
              {stage === 'error' && <WarningAmberIcon sx={{ color: '#E53E3E', fontSize: 22 }} />}
            </Box>
          </Box>
        </>
      )}
    </Box>
  );

  return createPortal(node, document.body);
}
