import { useRef, useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import CloseIcon from '@mui/icons-material/Close';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import { StatusChip } from './StatusChip';
import { useTranslation } from '../contexts/LanguageContext';
import { WorkflowHistoryTimeline } from './WorkflowHistoryTimeline';
import { KeyValueRow } from '@jorgeverlindo/constellation-ux';
import { useWorkflow } from '../contexts/WorkflowContext';
import type { PortalSubmission } from '../contexts/WorkflowContext';
import type { PreApproval } from './FundsPreApprovalsContent';

interface PreApprovalPanelProps {
  preApproval: PreApproval;
  onClose: () => void;
  userType?: 'dealer' | 'dealer-singular' | 'oem';
  onCreateClaim?: () => void;
  onOpenAIReview?: () => void;
}

export function PreApprovalPanel({
  preApproval,
  onClose,
  userType = 'dealer',
  onCreateClaim,
  onOpenAIReview,
}: PreApprovalPanelProps) {
  const { t } = useTranslation();
  const {
    workflow,
    approvePreApproval,
    requestPreApprovalRevision,
    declinePreApproval,
    resubmitPreApprovalWithComment,
    createClaim,
    addPreApprovalDocument,
    removePreApprovalDocument,
    updatePortalSubmissionStatus,
    addDealerNote,
  } = useWorkflow();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const oemTextareaRef = useRef<HTMLTextAreaElement>(null);
  const dealerTextareaRef = useRef<HTMLTextAreaElement>(null);

  const [oemDraftComment, setOemDraftComment] = useState('');
  const [dealerDraftComment, setDealerDraftComment] = useState('');

  const isWorkflowItem = preApproval.id === workflow.preApproval.id;
  const portalSub: PortalSubmission | undefined = workflow.portalSubmissions.find(s => s.id === preApproval.id);
  const isPortalItem = !!portalSub;

  const wfPA = workflow.preApproval;
  const liveStatus = isWorkflowItem ? wfPA.status : preApproval.status;
  const liveOemComment = isWorkflowItem ? wfPA.oemComment : (portalSub?.oemComment ?? null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const sizeKB = file.size / 1024;
    const sizeStr = sizeKB >= 1024 ? `${(sizeKB / 1024).toFixed(1)} MB` : `${sizeKB.toFixed(0)} KB`;
    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'file';
    const url = URL.createObjectURL(file);
    addPreApprovalDocument({ name: file.name, size: sizeStr, type: ext, url });
    e.target.value = '';
  };

  const handleApprove = () => {
    if (isPortalItem) {
      updatePortalSubmissionStatus(preApproval.id, 'Approved', oemDraftComment.trim() || undefined);
    } else {
      approvePreApproval(oemDraftComment.trim() || undefined);
    }
    setOemDraftComment('');
    onClose();
  };

  const handleRequestAdjustments = () => {
    if (!oemDraftComment.trim()) return;
    if (isPortalItem) {
      updatePortalSubmissionStatus(preApproval.id, 'Revision Requested', oemDraftComment.trim());
    } else {
      requestPreApprovalRevision(oemDraftComment.trim());
    }
    setOemDraftComment('');
    onClose();
  };

  const handleDeclinePreApproval = () => {
    if (isPortalItem) {
      updatePortalSubmissionStatus(preApproval.id, 'Declined', oemDraftComment.trim() || undefined);
    } else {
      declinePreApproval(oemDraftComment.trim() || undefined);
    }
    setOemDraftComment('');
    onClose();
  };

  const handleCreateClaim = () => {
    createClaim();
    onCreateClaim?.();
    onClose();
  };

  const handleResubmit = () => {
    resubmitPreApprovalWithComment(dealerDraftComment.trim());
    setDealerDraftComment('');
    onClose();
  };

  const handleSendDealerNote = () => {
    if (!dealerDraftComment.trim()) return;
    addDealerNote('preApproval', dealerDraftComment.trim());
    setDealerDraftComment('');
  };

  // Auto-resize textareas
  useEffect(() => {
    const el = oemTextareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [oemDraftComment]);

  useEffect(() => {
    const el = dealerTextareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [dealerDraftComment]);

  const renderFooter = () => {
    if (!isWorkflowItem && !isPortalItem) {
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <TextField
            inputRef={dealerTextareaRef}
            multiline
            minRows={1}
            value={dealerDraftComment}
            onChange={(e) => setDealerDraftComment(e.target.value)}
            placeholder="Add a note to the OEM (optional)…"
            size="small"
            fullWidth
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
            <Button onClick={onClose} variant="text" sx={{ borderRadius: '9999px', color: 'rgba(17,16,20,0.6)' }}>
              {t('Close')}
            </Button>
            {dealerDraftComment.trim() && (
              <Button
                onClick={handleSendDealerNote}
                variant="contained"
                sx={{ borderRadius: '9999px', bgcolor: 'var(--brand-accent, #6200EE)', '&:hover': { bgcolor: 'var(--brand-accent-hover, #5000d4)' } }}
              >
                Send Note
              </Button>
            )}
          </Box>
        </Box>
      );
    }

    if (userType === 'oem') {
      const canAct = liveStatus !== 'Approved' && liveStatus !== 'Declined';
      if (canAct) {
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <TextField
              inputRef={oemTextareaRef}
              multiline
              minRows={1}
              value={oemDraftComment}
              onChange={(e) => setOemDraftComment(e.target.value)}
              placeholder="Add a comment (required for Request Adjustments)…"
              size="small"
              fullWidth
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
              <Button onClick={onClose} variant="text" sx={{ borderRadius: '9999px', color: 'rgba(17,16,20,0.6)' }}>
                {t('Close')}
              </Button>
              <Button
                onClick={handleRequestAdjustments}
                disabled={!oemDraftComment.trim()}
                variant="outlined"
                sx={{ borderRadius: '9999px', borderColor: '#E17613', color: 'warning.main', '&:hover': { bgcolor: 'rgba(225,118,19,0.06)' } }}
              >
                Request Adjustments
              </Button>
              <Button
                onClick={handleDeclinePreApproval}
                variant="outlined"
                startIcon={<CancelOutlinedIcon />}
                sx={{ borderRadius: '9999px', borderColor: '#D2323F', color: 'error.main', '&:hover': { bgcolor: 'rgba(210,50,63,0.06)' } }}
              >
                Decline
              </Button>
              <Button
                onClick={handleApprove}
                variant="contained"
                sx={{ borderRadius: '9999px', bgcolor: 'var(--brand-accent, #6200EE)', '&:hover': { bgcolor: 'var(--brand-accent-hover, #5000d4)' } }}
              >
                Approve
              </Button>
            </Box>
          </Box>
        );
      }
      return (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button onClick={onClose} variant="text" sx={{ borderRadius: '9999px', color: 'rgba(17,16,20,0.6)' }}>
            {t('Close')}
          </Button>
        </Box>
      );
    }

    // Dealer view
    if (liveStatus === 'Approved') {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
          <Button onClick={onClose} variant="text" sx={{ borderRadius: '9999px', color: 'rgba(17,16,20,0.6)' }}>
            {t('Close')}
          </Button>
          <Button
            onClick={handleCreateClaim}
            variant="contained"
            startIcon={<CheckCircleOutlineIcon />}
            sx={{ borderRadius: '9999px', bgcolor: 'var(--brand-accent, #6200EE)', '&:hover': { bgcolor: 'var(--brand-accent-hover, #5000d4)' } }}
          >
            Create Claim
          </Button>
        </Box>
      );
    }

    if (liveStatus === 'Revision Requested') {
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <TextField
            inputRef={dealerTextareaRef}
            multiline
            minRows={1}
            value={dealerDraftComment}
            onChange={(e) => setDealerDraftComment(e.target.value)}
            placeholder="Add a reply to the OEM (optional)…"
            size="small"
            fullWidth
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
            <Button onClick={onClose} variant="text" sx={{ borderRadius: '9999px', color: 'rgba(17,16,20,0.6)' }}>
              {t('Close')}
            </Button>
            <Button
              onClick={handleResubmit}
              variant="contained"
              startIcon={<ChatBubbleOutlineIcon />}
              sx={{ borderRadius: '9999px', bgcolor: 'var(--brand-accent, #6200EE)', '&:hover': { bgcolor: 'var(--brand-accent-hover, #5000d4)' } }}
            >
              Resubmit for Review
            </Button>
          </Box>
        </Box>
      );
    }

    // Submitted / Resubmitted / In Review
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <TextField
          inputRef={dealerTextareaRef}
          multiline
          minRows={1}
          value={dealerDraftComment}
          onChange={(e) => setDealerDraftComment(e.target.value)}
          placeholder="Add a note to the OEM (optional)…"
          size="small"
          fullWidth
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
          <Button onClick={onClose} variant="text" sx={{ borderRadius: '9999px', color: 'rgba(17,16,20,0.6)' }}>
            {t('Close')}
          </Button>
          {dealerDraftComment.trim() && (
            <Button
              onClick={handleSendDealerNote}
              variant="contained"
              sx={{ borderRadius: '9999px', bgcolor: 'var(--brand-accent, #6200EE)', '&:hover': { bgcolor: 'var(--brand-accent-hover, #5000d4)' } }}
            >
              Send Note
            </Button>
          )}
        </Box>
      </Box>
    );
  };

  const docs = isWorkflowItem ? wfPA.documents : preApproval.documents;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: 'background.paper' }}>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 4,
          py: 2.5,
          borderBottom: '1px solid #E0E0E0',
          flexShrink: 0,
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography sx={{ color: 'text.primary', fontSize: '20px', fontWeight: 500, letterSpacing: '0.15px', lineHeight: 1.3 }}>
            {t('Pre-approval')} - {preApproval.id}{' '}
            ({preApproval.mediaType.split('/')[0].split(' ')[0]})
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button
              size="small"
              startIcon={<StarBorderIcon sx={{ width: 14, height: 14 }} />}
              variant="outlined"
              sx={{
                borderRadius: '9999px',
                borderColor: '#E0E0E0',
                color: 'rgba(31,29,37,0.8)',
                fontSize: '13px',
                fontWeight: 500,
                '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' },
              }}
            >
              {t('Follow')}
            </Button>
            <Button
              size="small"
              startIcon={<PeopleOutlineIcon sx={{ width: 14, height: 14 }} />}
              variant="outlined"
              sx={{
                borderRadius: '9999px',
                borderColor: '#E0E0E0',
                color: 'rgba(31,29,37,0.8)',
                fontSize: '13px',
                fontWeight: 500,
                minWidth: 0,
                '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' },
              }}
            >
              2
            </Button>
            <StatusChip status={liveStatus} />
          </Box>

          <Divider orientation="vertical" flexItem sx={{ mx: 0.5, height: 24, alignSelf: 'center' }} />

          <IconButton onClick={onClose} size="small">
            <CloseIcon sx={{ width: 20, height: 20, color: 'text.secondary' }} />
          </IconButton>
        </Box>
      </Box>

      {/* Body — scrollable */}
      <Box sx={{ flex: 1, overflowY: 'auto' }}>
        <Box sx={{ px: 4, py: 3, display: 'flex', flexDirection: 'column', gap: 4 }}>

          {/* AI Review — OEM only */}
          {userType === 'oem' && onOpenAIReview && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                onClick={onOpenAIReview}
                variant="contained"
                startIcon={<AutoAwesomeIcon sx={{ width: 16, height: 16 }} />}
                sx={{
                  borderRadius: '9999px',
                  bgcolor: 'var(--brand-accent, #6200EE)',
                  fontSize: '13px',
                  fontWeight: 500,
                  '&:hover': { bgcolor: 'var(--brand-accent-hover, #5000d4)' },
                }}
              >
                AI Review Items
              </Button>
            </Box>
          )}

          {/* Approval Request */}
          <Box component="section">
            <Typography sx={{ color: 'text.primary', fontSize: '15px', fontWeight: 500, mb: 2 }}>
              {t('Approval Request')}
            </Typography>
            <Box>
              {(isWorkflowItem ? wfPA.title : preApproval.title) && (
                <KeyValueRow
                  label={t('Title')}
                  value={isWorkflowItem ? (wfPA.title ?? '') : (preApproval.title ?? '')}
                />
              )}
              <KeyValueRow label={t('Submitted by')} value={preApproval.submittedBy.name} />
              <KeyValueRow
                label={t('Submitted at')}
                value={preApproval.submittedAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              />
              <KeyValueRow
                label={t('Last updated')}
                value={preApproval.lastUpdated.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              />
              <KeyValueRow
                label={t('Dealership')}
                value={`${preApproval.dealershipCode} - ${preApproval.dealershipName} (${preApproval.dealershipCity})`}
              />
              <KeyValueRow label={t('Initiative Type')} value={t(preApproval.initiativeType)} />
              {isWorkflowItem && (
                <KeyValueRow label="Activity Period" value={wfPA.activityPeriod} />
              )}
              <KeyValueRow label={t('Contact Information')} value={preApproval.contactEmail} />
            </Box>
          </Box>

          {/* Channel Breakdown */}
          {isWorkflowItem && wfPA.claimLines.length > 0 && (
            <Box component="section">
              <Typography sx={{ color: 'text.primary', fontSize: '15px', fontWeight: 500, mb: 1.5 }}>
                Channel Breakdown
              </Typography>
              <Box>
                {wfPA.claimLines.map((line, idx) => {
                  const amt = parseFloat(line.amount) || 0;
                  return (
                    <KeyValueRow
                      key={idx}
                      label={line.description || `Activity ${idx + 1}`}
                      value={`$${amt.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    />
                  );
                })}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    py: 1.5,
                    borderTop: '2px solid rgba(98,0,238,0.2)',
                    mt: 0.5,
                  }}
                >
                  <Typography sx={{ color: 'text.primary', fontSize: '13px', fontWeight: 500 }}>{t('Total Amount')}</Typography>
                  <Typography sx={{ color: 'var(--brand-accent, #6200EE)', fontSize: '15px', fontWeight: 700 }}>
                    ${wfPA.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}

          {/* Details */}
          <Box component="section">
            <Typography sx={{ color: 'text.primary', fontSize: '15px', fontWeight: 500, mb: 1.5 }}>{t('Details')}</Typography>
            <Box sx={{ borderTop: '1px solid #E0E0E0' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', py: 2 }}>
                <Typography sx={{ color: 'text.secondary', fontSize: '13px', width: '33%' }}>{t('Description')}</Typography>
                <Typography
                  sx={{ color: 'text.primary', fontSize: '13px', width: '67%', textAlign: 'right', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}
                >
                  {isWorkflowItem ? wfPA.details : preApproval.description}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Media Type */}
          <Box component="section">
            <Typography
              sx={{ color: 'text.secondary', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', mb: 1.5, letterSpacing: '0.8px' }}
            >
              {t('MEDIA TYPE')}
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {(isWorkflowItem ? wfPA.mediaType : preApproval.mediaType)
                ?.split(',')
                .map(s => s.trim())
                .filter(Boolean)
                .map(chip => (
                  <Box
                    key={chip}
                    sx={{
                      px: 1.5,
                      py: 0.75,
                      borderRadius: 1,
                      fontSize: '13px',
                      fontWeight: 500,
                      bgcolor: '#F3F4F6',
                      color: 'text.primary',
                    }}
                  >
                    {chip}
                  </Box>
                ))}
            </Box>
          </Box>

          {/* Supporting Documents */}
          <Box component="section">
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
              <Typography sx={{ color: 'text.primary', fontSize: '15px', fontWeight: 500 }}>{t('Supporting Documents')}</Typography>
              {isWorkflowItem && (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.mp4,.webm,.mov"
                    style={{ position: 'absolute', width: 0, height: 0, opacity: 0, overflow: 'hidden', pointerEvents: 'none' }}
                    onChange={handleFileChange}
                    tabIndex={-1}
                  />
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    size="small"
                    variant="outlined"
                    startIcon={<AttachFileIcon sx={{ width: 14, height: 14 }} />}
                    sx={{
                      borderRadius: '9999px',
                      borderColor: '#E0E0E0',
                      color: 'text.secondary',
                      fontSize: '13px',
                      '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' },
                    }}
                  >
                    Add Document
                  </Button>
                </>
              )}
            </Box>

            {docs.length > 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {docs.map((doc, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      border: '1px solid #E0E0E0',
                      borderRadius: 2,
                      display: 'flex',
                      overflow: 'hidden',
                      bgcolor: 'background.paper',
                      maxWidth: 480,
                    }}
                  >
                    <Box
                      sx={{
                        width: 72,
                        bgcolor: '#F5F5F5',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRight: '1px solid #E0E0E0',
                        flexShrink: 0,
                      }}
                    >
                      <Box
                        sx={{
                          width: 40,
                          height: 48,
                          bgcolor: 'background.paper',
                          border: '1px solid #E0E0E0',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Typography sx={{ fontSize: '9px', fontWeight: 700, color: '#FF5252' }}>
                          {doc.type.toUpperCase().slice(0, 4)}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ flex: 1, p: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', minWidth: 0 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: 0, pr: 1.5 }}>
                        <Typography sx={{ color: 'text.primary', fontSize: '13px', fontWeight: 500, wordBreak: 'break-all', lineHeight: 1.3, mb: '2px' }}>
                          {doc.name}
                        </Typography>
                        <Typography sx={{ color: 'text.secondary', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          {doc.type.toUpperCase()} | {doc.size}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <IconButton size="small" sx={{ color: 'text.secondary', '&:hover': { color: 'var(--brand-accent, #6200EE)' } }}>
                          <VisibilityOutlinedIcon sx={{ width: 16, height: 16 }} />
                        </IconButton>
                        {isWorkflowItem && userType !== 'oem' && (
                          <IconButton
                            size="small"
                            onClick={() => removePreApprovalDocument(doc.name)}
                            sx={{ color: 'text.disabled', '&:hover': { color: 'error.main', bgcolor: 'rgba(210,50,63,0.06)' } }}
                          >
                            <DeleteOutlineIcon sx={{ width: 16, height: 16 }} />
                          </IconButton>
                        )}
                      </Box>
                    </Box>
                  </Box>
                ))}
              </Box>
            ) : (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 1,
                  py: 3,
                  border: '1px dashed #E0E0E0',
                  borderRadius: 3,
                  textAlign: 'center',
                }}
              >
                <AttachFileIcon sx={{ width: 24, height: 24, color: 'text.disabled' }} />
                <Typography sx={{ fontSize: '13px', color: 'text.disabled' }}>
                  {isWorkflowItem
                    ? 'No documents attached yet. Click Add Document to attach.'
                    : t('No documents attached')}
                </Typography>
              </Box>
            )}
          </Box>

          {/* OEM comment / workflow timeline */}
          {liveOemComment && (
            <Box component="section" sx={{ bgcolor: '#FFF8E1', mx: -2, px: 2, py: 2, borderRadius: 2, border: '1px solid #FFE0B2' }}>
              <Typography sx={{ color: '#EF6C00', fontSize: '15px', fontWeight: 500, mb: 1.5 }}>OEM Comment</Typography>
              <Typography sx={{ fontSize: '13px', color: 'text.primary', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{liveOemComment}</Typography>
            </Box>
          )}

          {!isWorkflowItem && preApproval.status === 'Revision Requested' && (
            <Box component="section" sx={{ bgcolor: '#FFF8E1', mx: -2, px: 2, py: 2, borderRadius: 2, border: '1px solid #FFE0B2' }}>
              <Typography sx={{ color: '#EF6C00', fontSize: '15px', fontWeight: 500, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#EF6C00' }} />
                {t('Revisions Required')}
              </Typography>
              <Box sx={{ pl: 2, borderLeft: '2px solid #FFE0B2' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 1 }}>
                  <Typography sx={{ fontSize: '13px', fontWeight: 500, color: 'text.primary' }}>{t('Compliance Team')}</Typography>
                  <Typography sx={{ fontSize: '11px', color: 'text.secondary' }}>Jan 10, 2026 9:16 AM</Typography>
                </Box>
                <Typography sx={{ fontSize: '13px', color: 'text.primary', lineHeight: 1.6 }}>
                  {t('Hi! Kindly resubmit the creative, as we are currently unable to view the file. Thank you! -CS')}
                </Typography>
              </Box>
            </Box>
          )}

          {/* Workflow Activity Timeline */}
          {isWorkflowItem && wfPA.history.length > 0 && (
            <WorkflowHistoryTimeline history={wfPA.history} />
          )}
        </Box>
      </Box>

      {/* Footer */}
      <Box sx={{ p: 3, borderTop: '1px solid #E0E0E0', bgcolor: 'background.paper', flexShrink: 0 }}>
        {renderFooter()}
      </Box>
    </Box>
  );
}
