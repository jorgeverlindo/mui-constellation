import { Box, Typography, IconButton, CircularProgress } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import FolderZipOutlinedIcon from '@mui/icons-material/FolderZipOutlined';
import FolderOffOutlinedIcon from '@mui/icons-material/FolderOffOutlined';
import ReplayIcon from '@mui/icons-material/Replay';
import { useDownloadStore, DownloadJob } from '../store/useDownloadStore';
import { ink, brand, surface as surfaceTokens, status as statusTokens } from '@jorgeverlindo/constellation-ux';

const BRAND    = brand.accent;
const TEXT_DIM = 'rgba(17,16,20,0.56)';
const DIVIDER  = 'rgba(0,0,0,0.08)';

function JobRow({ job, onRetry }: { job: DownloadJob; onRetry: () => void }) {
  const { status, folderName, assetCount, skippedCount } = job;

  const label = () => {
    if (status === 'generating') return `Zipping ${assetCount} file${assetCount !== 1 ? 's' : ''}`;
    if (status === 'ready')      return `${assetCount} file${assetCount !== 1 ? 's' : ''} downloaded`;
    if (status === 'partial')    return `${assetCount} downloaded · ${skippedCount} skipped (unsupported format)`;
    if (status === 'error')      return 'Download failed';
    if (status === 'empty')      return 'No downloadable assets found';
    return '';
  };

  const trailingIcon = () => {
    if (status === 'generating') return <CircularProgress size={20} thickness={3} sx={{ color: BRAND, flexShrink: 0 }} />;
    if (status === 'ready')      return <CheckCircleIcon sx={{ fontSize: 22, color: '#22c55e', flexShrink: 0 }} />;
    if (status === 'partial')    return <WarningAmberIcon sx={{ fontSize: 20, color: '#f59e0b', flexShrink: 0 }} />;
    if (status === 'error')      return (
      <IconButton size="small" onClick={onRetry} title="Retry"
        sx={{ p: '3px', color: TEXT_DIM, flexShrink: 0, '&:hover': { color: BRAND, bgcolor: `${BRAND}10` } }}>
        <ReplayIcon sx={{ fontSize: 16 }} />
      </IconButton>
    );
    if (status === 'empty') return <FolderOffOutlinedIcon sx={{ fontSize: 20, color: TEXT_DIM, flexShrink: 0 }} />;
    return null;
  };

  return (
    <Box sx={{
      display: 'flex', alignItems: 'center', gap: '12px',
      px: '16px', py: '9px',
      borderBottom: `1px solid ${DIVIDER}`, '&:last-child': { borderBottom: 'none' },
    }}>
      <FolderZipOutlinedIcon sx={{ fontSize: 20, color: TEXT_DIM, flexShrink: 0 }} />
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontSize: 13, color: ink.primary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {folderName}.zip
        </Typography>
        <Typography sx={{ fontSize: 11, color: status === 'partial' ? '#92400e' : TEXT_DIM }}>
          {label()}
        </Typography>
      </Box>
      {trailingIcon()}
    </Box>
  );
}

export function DownloadActivityMonitor() {
  const { jobs, isMinimized, minimize, expand, clearCompleted, retry } = useDownloadStore();

  if (jobs.length === 0) return null;

  const hasGenerating = jobs.some(j => j.status === 'generating');
  const allDone       = !hasGenerating;
  const hasPartial    = jobs.some(j => j.status === 'partial');
  const allEmpty      = jobs.every(j => j.status === 'empty');
  const title = hasGenerating
    ? 'Preparing download'
    : allEmpty   ? 'Nothing to download'
    : hasPartial ? 'Download complete — some files skipped'
    : 'Download complete';

  return (
    <Box sx={{
      position: 'fixed', bottom: 0, left: '96px', zIndex: 1400,
      width: 380, borderRadius: '12px 12px 0 0',
      bgcolor: '#ffffff',
      borderTop: `2px solid ${BRAND}`, borderLeft: `2px solid ${BRAND}`, borderRight: `2px solid ${BRAND}`,
      boxShadow: '0 -4px 24px rgba(71,59,171,0.14)',
      overflow: 'hidden',
    }}>
      <Box sx={{
        display: 'flex', alignItems: 'center', px: '16px', py: '12px',
        bgcolor: '#ffffff', borderBottom: isMinimized ? 'none' : `1px solid ${DIVIDER}`,
      }}>
        <Typography sx={{ flex: 1, fontSize: 13, fontWeight: 600, color: ink.primary }}>
          {title}
        </Typography>
        <IconButton size="small" onClick={isMinimized ? expand : minimize}
          sx={{ width: 24, height: 24, p: 0, color: TEXT_DIM, '&:hover': { bgcolor: 'transparent', color: ink.primary } }}>
          {isMinimized ? <KeyboardArrowUpIcon sx={{ fontSize: 18 }} /> : <KeyboardArrowDownIcon sx={{ fontSize: 18 }} />}
        </IconButton>
        {allDone && (
          <IconButton size="small" onClick={clearCompleted}
            sx={{ width: 24, height: 24, p: 0, ml: '4px', color: TEXT_DIM, '&:hover': { bgcolor: 'transparent', color: ink.primary } }}>
            <CloseIcon sx={{ fontSize: 16 }} />
          </IconButton>
        )}
      </Box>

      {!isMinimized && (
        <Box sx={{
          maxHeight: 280, overflowY: 'auto',
          '&::-webkit-scrollbar': { width: 4 },
          '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(0,0,0,0.15)', borderRadius: 2 },
        }}>
          {jobs.map(job => (
            <JobRow key={job.id} job={job} onRetry={() => retry(job.id)} />
          ))}
        </Box>
      )}
    </Box>
  );
}
