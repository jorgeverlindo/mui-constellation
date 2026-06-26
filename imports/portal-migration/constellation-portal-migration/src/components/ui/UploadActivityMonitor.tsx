import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, IconButton, CircularProgress, Collapse } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useUploadStore, UploadJob, FolderUploadJob } from '../../store/useUploadStore';
import { ReviewMetadataModal } from './ReviewMetadataModal';
import { Asset } from '../../types/asset';

// ─── Tokens ───────────────────────────────────────────────────────────────────
const BRAND    = '#473bab';
const TEXT_DIM = 'rgba(17,16,20,0.56)';
const DIVIDER  = 'rgba(0,0,0,0.08)';

// ─── Individual file row ──────────────────────────────────────────────────────
function JobRow({ job }: { job: UploadJob }) {
  return (
    <Box sx={{
      display: 'flex', alignItems: 'center', gap: '12px',
      px: '16px', py: '9px',
      borderBottom: `1px solid ${DIVIDER}`, '&:last-child': { borderBottom: 'none' },
    }}>
      <Box sx={{ width: 36, height: 36, borderRadius: '6px', flexShrink: 0, bgcolor: '#f0f2f4', overflow: 'hidden' }}>
        {job.previewUrl && (
          <Box component="img" src={job.previewUrl} alt={job.name} sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        )}
      </Box>
      <Typography sx={{ flex: 1, fontSize: 13, fontFamily: 'Roboto, sans-serif', color: '#1f1d25', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {job.name}
      </Typography>
      {job.status === 'uploading' && <CircularProgress size={20} thickness={3} sx={{ color: BRAND, flexShrink: 0 }} />}
      {job.status === 'done'     && <CheckCircleIcon sx={{ fontSize: 22, color: '#22c55e', flexShrink: 0 }} />}
      {job.status === 'error'    && <ErrorOutlineIcon sx={{ fontSize: 22, color: '#ef4444', flexShrink: 0 }} />}
    </Box>
  );
}

// ─── Folder upload job card ───────────────────────────────────────────────────
function FolderJobCard({
  folderJob, fileJobs, onOpenFolder, onViewMetadata,
}: {
  folderJob:       FolderUploadJob;
  fileJobs:        UploadJob[];
  onOpenFolder:    () => void;
  onViewMetadata:  (assets: Asset[]) => void;
}) {
  const [skippedOpen, setSkippedOpen] = useState(false);
  const [filesOpen,   setFilesOpen]   = useState(false);

  const uploadedCount  = fileJobs.filter(j => j.status === 'done').length;
  const uploadingCount = fileJobs.filter(j => j.status === 'uploading').length;
  const skippedCount   = folderJob.skippedFileNames.length;
  const { status }     = folderJob;

  // Status icon
  const StatusIcon = () => {
    if (status === 'uploading')
      return <CircularProgress size={18} thickness={3} sx={{ color: BRAND, flexShrink: 0 }} />;
    if (status === 'done')
      return <CheckCircleIcon sx={{ fontSize: 20, color: '#22c55e', flexShrink: 0 }} />;
    if (status === 'partial')
      return <WarningAmberIcon sx={{ fontSize: 20, color: '#f59e0b', flexShrink: 0 }} />;
    if (status === 'empty')
      return <FolderOutlinedIcon sx={{ fontSize: 20, color: TEXT_DIM, flexShrink: 0 }} />;
    if (status === 'error')
      return <ErrorOutlineIcon sx={{ fontSize: 20, color: '#ef4444', flexShrink: 0 }} />;
    return null;
  };

  // Summary line
  const summary = () => {
    if (status === 'uploading') {
      const total = fileJobs.length;
      return `${uploadedCount} of ${total} file${total !== 1 ? 's' : ''} uploading…`;
    }
    if (status === 'done')
      return `${uploadedCount} asset${uploadedCount !== 1 ? 's' : ''} uploaded`;
    if (status === 'partial')
      return `${uploadedCount} uploaded · ${skippedCount} skipped`;
    if (status === 'empty')
      return 'Folder created — no supported assets found';
    if (status === 'error')
      return 'Failed to upload folder';
    return '';
  };

  return (
    <Box sx={{ borderBottom: `1px solid ${DIVIDER}` }}>
      {/* ── Folder header ──────────────────────────────────────────────── */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: '10px', px: '16px', py: '12px' }}>
        <Box sx={{ pt: '1px' }}><StatusIcon /></Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: 13, fontWeight: 600, fontFamily: 'Roboto, sans-serif', color: '#1f1d25', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {folderJob.folderName}
          </Typography>
          <Typography sx={{ fontSize: 11, color: TEXT_DIM, fontFamily: 'Roboto, sans-serif' }}>
            {summary()} · into <strong>{folderJob.destFolderName}</strong>
          </Typography>
        </Box>

        {/* Expand individual files toggle */}
        {fileJobs.length > 0 && (
          <IconButton
            size="small"
            onClick={() => setFilesOpen(o => !o)}
            sx={{ p: 0, width: 20, height: 20, color: TEXT_DIM, transform: filesOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s', '&:hover': { bgcolor: 'transparent', color: BRAND } }}
          >
            <ChevronRightIcon sx={{ fontSize: 16 }} />
          </IconButton>
        )}
      </Box>

      {/* ── Individual file rows (collapsible) ─────────────────────────── */}
      <Collapse in={filesOpen}>
        <Box sx={{ bgcolor: '#ffffff', borderTop: `1px solid ${DIVIDER}` }}>
          {fileJobs.map(job => (
            <Box key={job.id} sx={{ display: 'flex', alignItems: 'center', gap: '10px', px: '20px', py: '7px', borderBottom: `1px solid ${DIVIDER}`, '&:last-child': { borderBottom: 'none' } }}>
              <Box sx={{ width: 28, height: 28, borderRadius: '4px', bgcolor: '#f0f2f4', overflow: 'hidden', flexShrink: 0 }}>
                {job.previewUrl && <Box component="img" src={job.previewUrl} sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />}
              </Box>
              <Typography sx={{ flex: 1, fontSize: 12, fontFamily: 'Roboto, sans-serif', color: '#1f1d25', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {job.name}
              </Typography>
              {job.status === 'uploading' && <CircularProgress size={14} thickness={3} sx={{ color: BRAND, flexShrink: 0 }} />}
              {job.status === 'done'     && <CheckCircleIcon sx={{ fontSize: 16, color: '#22c55e', flexShrink: 0 }} />}
              {job.status === 'error'    && <ErrorOutlineIcon sx={{ fontSize: 16, color: '#ef4444', flexShrink: 0 }} />}
            </Box>
          ))}
        </Box>
      </Collapse>

      {/* ── Skipped files (partial state only) ─────────────────────────── */}
      {(status === 'partial' || (status === 'done' && skippedCount > 0)) && skippedCount > 0 && (
        <>
          <Box
            onClick={() => setSkippedOpen(o => !o)}
            sx={{ display: 'flex', alignItems: 'center', gap: '6px', px: '16px', py: '7px', cursor: 'pointer', bgcolor: '#fffbf0', borderTop: `1px solid ${DIVIDER}`, '&:hover': { bgcolor: '#fef9e7' } }}
          >
            <WarningAmberIcon sx={{ fontSize: 14, color: '#f59e0b', flexShrink: 0 }} />
            <Typography sx={{ flex: 1, fontSize: 12, color: '#92400e', fontFamily: 'Roboto, sans-serif' }}>
              {skippedCount} file{skippedCount !== 1 ? 's' : ''} skipped (unsupported format)
            </Typography>
            <ChevronRightIcon sx={{ fontSize: 14, color: TEXT_DIM, transform: skippedOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s' }} />
          </Box>
          <Collapse in={skippedOpen}>
            <Box sx={{ bgcolor: '#fffbf0', borderTop: `1px solid ${DIVIDER}` }}>
              {folderJob.skippedFileNames.map(name => (
                <Typography key={name} sx={{ fontSize: 11, color: '#92400e', fontFamily: 'Roboto, sans-serif', px: '24px', py: '5px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {name}
                </Typography>
              ))}
            </Box>
          </Collapse>
        </>
      )}

      {/* ── Empty folder note ───────────────────────────────────────────── */}
      {status === 'empty' && (
        <Box sx={{ px: '16px', py: '8px', bgcolor: '#ffffff', borderTop: `1px solid ${DIVIDER}` }}>
          <Typography sx={{ fontSize: 11, color: TEXT_DIM, fontFamily: 'Roboto, sans-serif', fontStyle: 'italic' }}>
            The folder was created but contained no supported image files.
          </Typography>
        </Box>
      )}

      {/* ── Completion actions ──────────────────────────────────────────── */}
      {status !== 'uploading' && status !== 'error' && (
        <Box sx={{ display: 'flex', gap: '20px', px: '16px', py: '10px', borderTop: `1px solid ${DIVIDER}`, bgcolor: '#ffffff' }}>
          <Typography
            onClick={onOpenFolder}
            sx={{ fontSize: 13, fontWeight: 600, color: BRAND, cursor: 'pointer', fontFamily: 'Roboto, sans-serif', '&:hover': { textDecoration: 'underline' } }}
          >
            Open Folder
          </Typography>
          {fileJobs.some(j => j.asset) && (
            <Typography
              onClick={() => onViewMetadata(fileJobs.filter(j => j.asset).map(j => j.asset!))}
              sx={{ fontSize: 13, fontWeight: 600, color: BRAND, cursor: 'pointer', fontFamily: 'Roboto, sans-serif', '&:hover': { textDecoration: 'underline' } }}
            >
              View Metadata
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
}

// ─── Monitor header title ─────────────────────────────────────────────────────
function buildTitle(
  folderJobs: FolderUploadJob[],
  standaloneUploading: number,
  standaloneDone: number,
): string {
  const folderUploading = folderJobs.filter(fj => fj.status === 'uploading').length;
  const totalUploading  = folderUploading + standaloneUploading;

  if (totalUploading > 0) {
    const parts: string[] = [];
    if (folderUploading > 0) parts.push(`${folderUploading} folder${folderUploading !== 1 ? 's' : ''}`);
    if (standaloneUploading > 0) parts.push(`${standaloneUploading} asset${standaloneUploading !== 1 ? 's' : ''}`);
    return `Uploading ${parts.join(' and ')}…`;
  }

  const folderDone  = folderJobs.filter(fj => fj.status !== 'uploading').length;
  const totalDone   = folderDone + standaloneDone;
  return `${totalDone} item${totalDone !== 1 ? 's' : ''} uploaded`;
}

// ─── Component ────────────────────────────────────────────────────────────────
export function UploadActivityMonitor() {
  const { jobs, folderJobs, isMinimized, minimize, expand, clearCompleted } = useUploadStore();
  const navigate = useNavigate();
  const [reviewOpen,         setReviewOpen]         = useState(false);
  const [reviewFolderAssets, setReviewFolderAssets] = useState<Asset[] | null>(null);

  // Standalone jobs: not part of any folder upload
  const standaloneJobs = jobs.filter(j => !j.folderJobId);

  const hasAnything = jobs.length > 0 || folderJobs.length > 0;
  if (!hasAnything) return null;

  // Overall "all done" check
  const standaloneUploading = standaloneJobs.filter(j => j.status === 'uploading').length;
  const standaloneDone      = standaloneJobs.filter(j => j.status === 'done').length;
  const folderUploading     = folderJobs.filter(fj => fj.status === 'uploading').length;
  const allDone             = standaloneUploading === 0 && folderUploading === 0 && hasAnything;

  const completedAssets = standaloneJobs.filter(j => j.status === 'done' && j.asset).map(j => j.asset!);

  const title = buildTitle(folderJobs, standaloneUploading, standaloneDone);

  return (
    <Box sx={{
      position: 'fixed', bottom: 0, left: '96px', zIndex: 1400,
      width: 380, borderRadius: '12px 12px 0 0',
      bgcolor: '#ffffff',
      borderTop: `2px solid ${BRAND}`, borderLeft: `2px solid ${BRAND}`, borderRight: `2px solid ${BRAND}`,
      boxShadow: '0 -4px 24px rgba(71,59,171,0.14)',
      fontFamily: 'Roboto, sans-serif',
      overflow: 'hidden',
    }}>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <Box sx={{ display: 'flex', alignItems: 'center', px: '16px', py: '12px', bgcolor: '#ffffff', borderBottom: isMinimized ? 'none' : `1px solid ${DIVIDER}` }}>
        <Typography sx={{ flex: 1, fontSize: 13, fontWeight: 600, fontFamily: 'Roboto, sans-serif', color: '#1f1d25' }}>
          {title}
        </Typography>
        <IconButton size="small" onClick={isMinimized ? expand : minimize}
          sx={{ width: 24, height: 24, p: 0, color: TEXT_DIM, '&:hover': { bgcolor: 'transparent', color: '#1f1d25' } }}>
          {isMinimized ? <KeyboardArrowUpIcon sx={{ fontSize: 18 }} /> : <KeyboardArrowDownIcon sx={{ fontSize: 18 }} />}
        </IconButton>
        {allDone && (
          <IconButton size="small" onClick={clearCompleted}
            sx={{ width: 24, height: 24, p: 0, ml: '4px', color: TEXT_DIM, '&:hover': { bgcolor: 'transparent', color: '#1f1d25' } }}>
            <CloseIcon sx={{ fontSize: 16 }} />
          </IconButton>
        )}
      </Box>

      {/* ── Content ─────────────────────────────────────────────────────────── */}
      {!isMinimized && (
        <>
          <Box sx={{ maxHeight: 360, overflowY: 'auto', '&::-webkit-scrollbar': { width: 4 }, '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(0,0,0,0.15)', borderRadius: 2 } }}>

            {/* Folder upload jobs — shown first with rich status */}
            {folderJobs.map(fj => (
              <FolderJobCard
                key={fj.id}
                folderJob={fj}
                fileJobs={jobs.filter(j => fj.fileJobIds.includes(j.id))}
                onOpenFolder={() => navigate(`/portal/${fj.createdFolderId}`)}
                onViewMetadata={(assets) => { minimize(); setReviewFolderAssets(assets); }}
              />
            ))}

            {/* Standalone file jobs — individual uploads not from a folder */}
            {standaloneJobs.map(job => <JobRow key={job.id} job={job} />)}
          </Box>

          {/* ── Footer actions ─────────────────────────────────────────────── */}
          {allDone && (standaloneJobs.length > 0 || completedAssets.length > 0) && (
            <Box sx={{ display: 'flex', gap: '20px', px: '16px', py: '12px', borderTop: `1px solid ${DIVIDER}`, bgcolor: '#ffffff' }}>
              <Typography sx={{ fontSize: 13, fontWeight: 600, color: BRAND, cursor: 'pointer', fontFamily: 'Roboto, sans-serif', '&:hover': { textDecoration: 'underline' } }}>
                View In Folder
              </Typography>
              {completedAssets.length > 0 && (
                <Typography onClick={() => { minimize(); setReviewOpen(true); }}
                  sx={{ fontSize: 13, fontWeight: 600, color: BRAND, cursor: 'pointer', fontFamily: 'Roboto, sans-serif', '&:hover': { textDecoration: 'underline' } }}>
                  Review Metadata
                </Typography>
              )}
            </Box>
          )}
        </>
      )}

      {/* Review Metadata modal — standalone uploads */}
      {reviewOpen && completedAssets.length > 0 && (
        <ReviewMetadataModal open={reviewOpen} assets={completedAssets} onClose={() => setReviewOpen(false)} />
      )}

      {/* View Metadata modal — folder upload assets */}
      {reviewFolderAssets && reviewFolderAssets.length > 0 && (
        <ReviewMetadataModal
          open={Boolean(reviewFolderAssets)}
          assets={reviewFolderAssets}
          onClose={() => setReviewFolderAssets(null)}
        />
      )}
    </Box>
  );
}
