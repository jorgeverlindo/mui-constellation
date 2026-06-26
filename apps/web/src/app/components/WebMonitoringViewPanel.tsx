// WebMonitoringViewPanel — view-mode panel for a WCM infraction.
// TODO: InteractiveAnnotation pins are simplified (stub dots). Port InteractiveAnnotation
// from vw-funds-2 src/app/components/pre-approval/InteractiveAnnotation.tsx for full fidelity.
import { useState, useRef, ChangeEvent, DragEvent, ReactNode } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import CloseIcon from '@mui/icons-material/Close';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import ShieldIcon from '@mui/icons-material/Shield';
import CheckIcon from '@mui/icons-material/Check';
import UploadIcon from '@mui/icons-material/CloudUpload';
import { useTranslation } from '../contexts/LanguageContext';
import { WCMItem } from './WebMonitoringContent';
import { StatusChip, SeverityChip } from './StatusChip';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { WorkflowHistoryTimeline } from './WorkflowHistoryTimeline';
import { emitSnackbar } from './Snackbar';
import type { PanelCaseSolution } from './WebMonitoringPanel';
import type { WCMComment } from '../../data/types/compliance';
import type { WorkflowEvent } from '../contexts/WorkflowContext';

const imgScreenshot = 'https://res.cloudinary.com/dvq75cqna/image/upload/v1780071062/vw-funds/474e8b063908875e688d0c1396b3726c6afa9ce4.png';

export function stripUrlForChrome(url: string): string {
  return url.replace(/^https?:\/\//i, '').replace(/^www\./i, '');
}

export function formatSolutionDateTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch {
    return iso;
  }
}

const ROW_LABEL_CLS = { color: 'text.secondary', fontSize: 13, fontWeight: 400, width: 160, flexShrink: 0 };
const ROW_VALUE_CLS = { color: 'text.primary', fontSize: 13, fontWeight: 500, flex: 1, textAlign: 'left' as const };

function LeftKVRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', py: 1.75, borderBottom: '1px solid #F0F0F0', gap: 1.5, '&:last-child': { borderBottom: 'none' } }}>
      <Typography sx={ROW_LABEL_CLS}>{label}</Typography>
      {typeof value === 'string' || typeof value === 'number'
        ? <Typography sx={ROW_VALUE_CLS}>{value}</Typography>
        : <Box sx={{ flex: 1 }}>{value}</Box>
      }
    </Box>
  );
}

// Simplified annotation pin — replaces InteractiveAnnotation
function SimplePin({ number, x, y }: { number: number; x: number; y: number }) {
  const [open, setOpen] = useState(false);
  return (
    <Box sx={{ position: 'absolute', left: `${x}%`, top: `${y}%`, transform: 'translate(-50%,-50%)', zIndex: 10 }}>
      <Box
        onClick={() => setOpen(o => !o)}
        sx={{
          width: 22, height: 22, borderRadius: '50%', bgcolor: '#D2323F', color: 'white',
          fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
        }}
      >
        {number}
      </Box>
    </Box>
  );
}

interface WebMonitoringViewPanelProps {
  item: WCMItem;
  onClose: () => void;
  onOpenModal?: () => void;
  userType?: 'dealer' | 'dealer-singular' | 'dealer-emich' | 'oem';
  solution?: PanelCaseSolution;
  onSubmitSolution?: (draft: { screenshotDataUrl: string; comment: string }) => void;
  onMarkSolved?: () => void;
  onAcceptReport?: () => void;
  currentDealerName?: string;
  wcmComments?: WCMComment[];
  onAddComment?: (text: string) => void;
  currentUserName?: string;
}

export function WebMonitoringViewPanel({
  item, onClose, onOpenModal, userType = 'oem',
  solution, onSubmitSolution, onMarkSolved, onAcceptReport,
  currentDealerName, wcmComments = [], onAddComment, currentUserName,
}: WebMonitoringViewPanelProps) {
  const { t } = useTranslation();
  const [commentDraft, setCommentDraft] = useState('');
  const solutionInputRef = useRef<HTMLInputElement>(null);
  const [solutionScreenshot, setSolutionScreenshot] = useState<string | null>(null);
  const [solutionComment, setSolutionComment] = useState('');
  const [solutionDragOver, setSolutionDragOver] = useState(false);
  const [solutionDropError, setSolutionDropError] = useState<string | null>(null);

  const handleSendComment = () => {
    const text = commentDraft.trim();
    if (!text) return;
    onAddComment?.(text);
    setCommentDraft('');
  };

  function handleSolutionFile(file: File) {
    setSolutionDropError(null);
    if (!/^image\/(png|jpe?g)$/.test(file.type)) { setSolutionDropError(t('Only PNG or JPG screenshots are accepted.')); return; }
    const reader = new FileReader();
    reader.onload = () => setSolutionScreenshot(reader.result as string);
    reader.readAsDataURL(file);
  }

  function onSolutionDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault(); setSolutionDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleSolutionFile(f);
  }

  function onSolutionSelectFile(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) handleSolutionFile(f);
  }

  const screenshotSrc = item.screenshotDataUrl ?? imgScreenshot;
  const chromeUrl = stripUrlForChrome(item.url);
  const displayStatus = solution?.solved ? 'Solved' : solution ? 'Solution Submitted' : item.status;

  const isTargetDealer = userType !== 'oem' && !!currentDealerName && item.dealership === currentDealerName;
  const isReportingDealer = userType !== 'oem' && !!item.reportedBy && item.reportedBy === currentUserName;

  // Simplified pins (replacing InteractiveAnnotation)
  const pins = [
    { x: 18, y: 56 },
    { x: 48, y: 56 },
  ];
  const isOemLogo = item.source === 'Manually Added' && /oem logo/i.test(item.violationType);
  const activePins = isOemLogo ? [{ x: 26, y: 5 }] : pins;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: 'white' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 4, py: 2.5, borderBottom: '1px solid #E0E0E0', flexShrink: 0 }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ color: 'text.primary', fontSize: 20, fontWeight: 500, letterSpacing: '0.15px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {item.id}
          </Typography>
          <Typography sx={{ fontSize: 14, color: 'text.secondary', mt: 0.5 }}>{t('Website Compliance Case')}</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexShrink: 0, ml: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button
              size="small"
              startIcon={<StarBorderIcon sx={{ fontSize: 14 }} />}
              sx={{ border: '1px solid #E0E0E0', borderRadius: '100px', textTransform: 'none', color: 'text.primary', fontSize: 13, fontWeight: 500, '&:hover': { bgcolor: '#F9FAFB' } }}
            >
              {t('Follow')}
            </Button>
            <StatusChip status={displayStatus} />
          </Box>
          <Box sx={{ width: 1, height: 24, bgcolor: '#E0E0E0' }} />
          <IconButton size="small" onClick={onClose}>
            <CloseIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
          </IconButton>
        </Box>
      </Box>

      {/* Body */}
      <Box sx={{ flex: 1, overflowY: 'auto', px: 4, py: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>

        {/* Issue Preview */}
        <Box component="section">
          <Typography sx={{ color: 'text.primary', fontSize: 15, fontWeight: 500 }}>{t('Issue Preview')}</Typography>
          <Typography sx={{ fontSize: 11, color: 'text.disabled', mt: 0.5 }}>
            {t('Annotated evidence captured from the monitored dealership page.')}
          </Typography>

          <Box
            sx={{ mt: 1.5, borderRadius: 3, border: '1px solid rgba(0,0,0,0.12)', cursor: 'pointer', '&:hover': { boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }, transition: 'box-shadow 0.15s' }}
            onClick={() => onOpenModal?.()}
          >
            {/* Chrome bar */}
            <Box sx={{ bgcolor: 'white', borderBottom: '1px solid rgba(0,0,0,0.08)', px: 1.5, py: 1, display: 'flex', alignItems: 'center', gap: 1, borderRadius: '12px 12px 0 0' }}>
              <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#FF5F57', flexShrink: 0 }} />
              <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#FEBC2E', flexShrink: 0 }} />
              <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#28C840', flexShrink: 0 }} />
              <Typography sx={{ flex: 1, fontSize: 10, color: 'text.disabled', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {chromeUrl}
              </Typography>
            </Box>

            {/* Screenshot with simplified pins */}
            <Box sx={{ position: 'relative', overflow: 'visible' }}>
              <Box sx={{ maxHeight: 260, overflow: 'hidden', borderRadius: '0 0 12px 12px' }}>
                <ImageWithFallback
                  src={screenshotSrc}
                  alt={item.dealership + ' website screenshot'}
                  style={{ width: '100%', objectFit: 'cover', objectPosition: 'top', display: 'block' }}
                />
              </Box>
              {activePins.map((pin, idx) => (
                <SimplePin key={idx} number={idx + 1} x={pin.x} y={pin.y} />
              ))}
            </Box>
          </Box>
        </Box>

        {/* Comments (numbered pin list) */}
        <Box component="section">
          <Typography sx={{ color: 'text.primary', fontSize: 15, fontWeight: 500, mb: 1.5 }}>{t('Comments')}</Typography>
          <Box component="ol" sx={{ pl: 2.5, m: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
            {activePins.map((_, idx) => (
              <Typography component="li" key={idx} sx={{ fontSize: 13, color: 'text.primary', lineHeight: 1.6 }}>
                <Box component="span" sx={{ fontWeight: 600 }}>{t('Missing Legal Disclaimer')}</Box>
                <Box component="span" sx={{ color: 'text.secondary' }}>
                  {' — '}{t('Offer card displays payment terms without required disclaimer language visible near the promotional copy.')}
                </Box>
              </Typography>
            ))}
          </Box>
        </Box>

        {/* Violation Details */}
        <Box component="section">
          <Typography sx={{ color: 'text.primary', fontSize: 15, fontWeight: 500, mb: 2 }}>{t('Violation Details')}</Typography>
          <Box>
            <LeftKVRow label={t('Detected On')}    value={item.detectedOn} />
            <LeftKVRow label={t('Dealership')}     value={item.dealership} />
            <LeftKVRow label={t('Violation Type')} value={item.violationType} />
            <LeftKVRow label={t('Source')}         value={t(item.source)} />
            <LeftKVRow label={t('Channel')}        value={t('Website')} />
            <LeftKVRow
              label={t('Website / URL')}
              value={
                <Box component="a"
                  href={/^https?:\/\//i.test(item.url) ? item.url : `https://${item.url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ color: 'primary.main', textDecoration: 'none', '&:hover': { textDecoration: 'underline' }, fontSize: 13, fontWeight: 500 }}
                >
                  {item.url}
                </Box>
              }
            />
            <LeftKVRow label={t('Severity')} value={<SeverityChip severity={item.severity} />} />
            <LeftKVRow
              label={t('Reported by')}
              value={(() => {
                const hide = isTargetDealer;
                return item.reportedBy && !hide
                  ? item.reportedBy
                  : <Typography component="span" sx={{ color: 'text.disabled', fontSize: 13 }}>—</Typography>;
              })()}
            />
          </Box>
        </Box>

        {/* Activity */}
        {!isReportingDealer && (() => {
          const creationEvent: WorkflowEvent = isTargetDealer
            ? { id: `create-${item.id}`, timestamp: item.createdAtISO ?? new Date(item.detectedOn).toISOString(), actor: 'OEM', actorName: 'Compliance Team', action: `Compliance infraction reported against ${item.dealership}` }
            : { id: `create-${item.id}`, timestamp: item.createdAtISO ?? new Date(item.detectedOn).toISOString(), actor: item.reportedBy ? 'Dealer' : 'OEM', actorName: item.reportedBy ?? 'OEM', action: item.reportedBy ? `Reported a compliance infraction against ${item.dealership}` : `Compliance infraction added for ${item.dealership}` };

          const events: WorkflowEvent[] = [
            creationEvent,
            ...(solution ? [{ id: `solution-${item.id}`, timestamp: solution.submittedAtISO, actor: 'Dealer' as const, actorName: solution.submittedBy, action: 'Solution submitted', comment: solution.comment || undefined }] : []),
            ...wcmComments.map(c => ({ id: c.id, timestamp: c.timestampISO, actor: c.role === 'oem' ? 'OEM' as const : 'Dealer' as const, actorName: c.author, action: c.role === 'oem' ? 'OEM note' : 'Note added', comment: c.text })),
          ].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

          return (
            <Box component="section">
              <WorkflowHistoryTimeline history={events} />
            </Box>
          );
        })()}

        {/* Issue Solution */}
        {!isReportingDealer && (userType !== 'oem' || !!solution) && (
          <Box component="section">
            <Typography sx={{ color: 'text.primary', fontSize: 15, fontWeight: 500, mb: 1.5 }}>{t('Issue Solution')}</Typography>
            {solution ? (
              <Box sx={{ borderRadius: 3, border: '1px solid rgba(0,0,0,0.12)', overflow: 'hidden' }}>
                {solution.screenshotDataUrl ? (
                  <Box component="img" src={solution.screenshotDataUrl} alt="Submitted solution screenshot" sx={{ width: '100%', maxHeight: 260, objectFit: 'cover', objectPosition: 'top', display: 'block' }} />
                ) : (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 4, bgcolor: '#FAFAFB' }}>
                    <Typography sx={{ fontSize: 13, color: 'text.disabled' }}>Screenshot not available</Typography>
                  </Box>
                )}
                <Box sx={{ px: 2, py: 1.5, borderTop: '1px solid rgba(0,0,0,0.08)' }}>
                  <Typography sx={{ fontSize: 13, color: 'text.primary', lineHeight: 1.6 }}>{solution.comment}</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1, fontSize: 12, color: 'text.secondary' }}>
                    <Typography component="span" sx={{ fontWeight: 600, color: 'text.primary', fontSize: 12 }}>{solution.submittedBy}</Typography>
                    <span>·</span>
                    <span>{formatSolutionDateTime(solution.submittedAtISO)}</span>
                    {solution.solved && (
                      <>
                        <span>·</span>
                        <Typography component="span" sx={{ color: 'success.main', fontWeight: 600, fontSize: 12 }}>{t('Marked as solved')}</Typography>
                      </>
                    )}
                  </Box>
                </Box>
              </Box>
            ) : (
              <>
                <input ref={solutionInputRef} type="file" accept="image/png,image/jpeg" style={{ display: 'none' }} onChange={onSolutionSelectFile} />
                {!solutionScreenshot ? (
                  <Box
                    onDragOver={(e) => { e.preventDefault(); setSolutionDragOver(true); }}
                    onDragLeave={() => setSolutionDragOver(false)}
                    onDrop={onSolutionDrop}
                    onClick={() => solutionInputRef.current?.click()}
                    sx={{
                      borderRadius: 3, border: '2px dashed', cursor: 'pointer',
                      borderColor: solutionDragOver ? '#473BAB' : '#D0CFD7',
                      bgcolor: solutionDragOver ? 'rgba(71,59,171,0.04)' : '#FAFAFB',
                      '&:hover': { bgcolor: '#F5F4F8' },
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      gap: 1, py: 5, px: 3, textAlign: 'center',
                    }}
                  >
                    <UploadIcon sx={{ fontSize: 28, color: 'text.disabled' }} />
                    <Typography sx={{ fontSize: 13, fontWeight: 500, color: 'text.primary' }}>
                      {t('Drag a screenshot of the fix here, or click to browse')}
                    </Typography>
                    <Typography sx={{ fontSize: 11, color: 'text.disabled' }}>PNG or JPG · max 10MB</Typography>
                    {solutionDropError && <Typography sx={{ fontSize: 11, color: 'error.main', mt: 0.5 }}>{solutionDropError}</Typography>}
                  </Box>
                ) : (
                  <Box sx={{ borderRadius: 3, border: '1px solid rgba(0,0,0,0.12)', position: 'relative' }}>
                    <Box component="img" src={solutionScreenshot} alt="Solution screenshot" sx={{ width: '100%', maxHeight: 220, objectFit: 'cover', objectPosition: 'top', display: 'block', borderRadius: 3 }} />
                    <Button
                      size="small"
                      onClick={() => solutionInputRef.current?.click()}
                      sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(255,255,255,0.9)', color: 'text.primary', border: '1px solid #E0E0E0', borderRadius: '100px', textTransform: 'none', fontSize: 11, fontWeight: 500, '&:hover': { bgcolor: 'white' } }}
                    >
                      {t('Replace')}
                    </Button>
                  </Box>
                )}
                <TextField
                  multiline
                  rows={3}
                  fullWidth
                  value={solutionComment}
                  onChange={(e) => setSolutionComment(e.target.value)}
                  placeholder={t('Add a note for the OEM…')}
                  sx={{ mt: 1.5, '& .MuiInputBase-input': { fontSize: 13 } }}
                />
              </>
            )}
          </Box>
        )}
      </Box>

      {/* OEM note composer */}
      {userType === 'oem' && (
        <Box sx={{ px: 4, pt: 1.5, pb: 0, borderTop: '1px solid #E0E0E0', flexShrink: 0 }}>
          <TextField
            multiline
            rows={2}
            fullWidth
            value={commentDraft}
            onChange={(e) => setCommentDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSendComment(); }}
            placeholder={t('Write a note to the dealer…')}
            sx={{ '& .MuiInputBase-input': { fontSize: 13 } }}
          />
        </Box>
      )}

      {/* Footer */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1.5, px: 4, py: 2, flexShrink: 0, ...(userType !== 'oem' ? { borderTop: '1px solid #E0E0E0' } : {}) }}>
        {userType === 'oem' && !solution?.solved && (
          <>
            <Button
              variant="outlined"
              startIcon={<ShieldIcon sx={{ fontSize: 16 }} />}
              sx={{ borderColor: '#D2323F', color: '#be0e1c', borderRadius: '100px', textTransform: 'none', fontSize: 13, '&:hover': { bgcolor: 'rgba(210,50,63,0.08)' } }}
            >
              {t('Assign Penalty')}
            </Button>
            {!solution && (
              <Button onClick={onClose} sx={{ color: 'rgba(17,16,20,0.6)', borderRadius: '100px', textTransform: 'none', px: 3 }}>
                {t('Cancel')}
              </Button>
            )}
          </>
        )}

        {(() => {
          if (isReportingDealer) return null;
          if (userType !== 'oem' && solution) return null;
          if (userType === 'oem' && solution?.solved) return null;

          const isDealerSubmit = userType !== 'oem';
          const isOemAcceptReport = userType === 'oem' && !!item.reportedBy && item.status === 'Pending' && !solution;
          const isOemMarkSolved = userType === 'oem' && !!solution && !solution.solved;
          const label = isDealerSubmit
            ? t('Submit Solution')
            : isOemAcceptReport ? t('Accept Report')
            : isOemMarkSolved ? t('Mark as Solved')
            : t('Mark As Reviewed');
          const disabled = isDealerSubmit && !(solutionScreenshot && solutionComment.trim());

          const handleClick = () => {
            if (isDealerSubmit) {
              if (!solutionScreenshot || !solutionComment.trim()) return;
              onSubmitSolution?.({ screenshotDataUrl: solutionScreenshot, comment: solutionComment.trim() });
              emitSnackbar(t('Solution submitted to OEM for review'));
              return;
            }
            if (commentDraft.trim()) { onAddComment?.(commentDraft.trim()); setCommentDraft(''); }
            if (isOemAcceptReport) { onAcceptReport?.(); emitSnackbar(t('Report accepted — status moved to Open')); return; }
            if (isOemMarkSolved) { onMarkSolved?.(); emitSnackbar(t('Case marked as solved')); return; }
          };

          return (
            <Button
              onClick={handleClick}
              disabled={disabled}
              variant="contained"
              startIcon={<CheckIcon sx={{ fontSize: 16 }} />}
              sx={{ bgcolor: 'primary.main', borderRadius: '100px', textTransform: 'none', fontSize: 14, fontWeight: 500, px: 3, '&:hover': { bgcolor: 'primary.dark' }, '&.Mui-disabled': { bgcolor: '#D0CFD7' } }}
            >
              {label}
            </Button>
          );
        })()}
      </Box>
    </Box>
  );
}
