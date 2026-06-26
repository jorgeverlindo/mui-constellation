/**
 * ClaimsPanel — full functional port from vw-funds-2.
 * The complex OEM penalty / strike form is preserved in structure but simplified.
 */
import { useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import CloseIcon from '@mui/icons-material/Close';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import SavingsOutlinedIcon from '@mui/icons-material/SavingsOutlined';
import LoopIcon from '@mui/icons-material/Loop';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { StatusChip } from './StatusChip';
import type { ClaimStatus } from './StatusChip';
import { KeyValueRow } from '@jorgeverlindo/constellation-ux';
import { useTranslation } from '../contexts/LanguageContext';
import { WorkflowHistoryTimeline } from './WorkflowHistoryTimeline';
import {
  useWorkflow,
  WORKFLOW_CAMPAIGN,
  WORKFLOW_DEALER,
} from '../contexts/WorkflowContext';

// ─── Strike & Penalty types ───────────────────────────────────────────────────
export interface Strike {
  level: 1 | 2 | 3;
  type: string;
  date: string;
  description: string;
}

// ─── Claim interface ──────────────────────────────────────────────────────────
export interface Claim {
  id: string;
  uid: string;
  date: Date;
  amount: number;
  status: ClaimStatus;
  timeInClaim: number;
  timeInPayment: number;
  dealershipCode: string;
  dealershipName: string;
  dealershipCity: string;
  fund: string;
  submittedBy: { name: string; avatarUrl: string };
  type: string;
  lastUpdated: string;
  details?: string;
  strikes?: Strike[];
  violationSummary?: string;
  underlyingStatus?: ClaimStatus;
}

interface ClaimsPanelProps {
  claim: Claim;
  onClose: () => void;
  userType?: 'dealer' | 'dealer-singular' | 'oem';
}

export function ClaimsPanel({ claim, onClose, userType = 'dealer' }: ClaimsPanelProps) {
  const { t } = useTranslation();
  const {
    workflow,
    submitClaim,
    approveClaimAction,
    requestClaimRevision,
    declineClaimAction,
    resubmitClaimWithComment,
    processPayment,
    archiveAndReset,
    addClaimDocument,
    removeClaimDocument,
    addDealerNote,
  } = useWorkflow();

  const [oemDraftComment, setOemDraftComment] = useState('');
  const [dealerDraftComment, setDealerDraftComment] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isWorkflowItem = claim.id === workflow.claim.id;
  const wfCL = workflow.claim;
  const rawStatus: ClaimStatus | 'Draft' | 'Submitted' | 'Resubmitted' = isWorkflowItem
    ? (wfCL.status as ClaimStatus | 'Draft' | 'Submitted' | 'Resubmitted')
    : claim.status;
  const liveStatus: ClaimStatus | 'Draft' | 'Submitted' | 'Resubmitted' =
    rawStatus === 'At risk' && userType !== 'oem'
      ? (claim.underlyingStatus ?? 'Pending')
      : rawStatus;
  const liveOemComment = isWorkflowItem ? wfCL.oemComment : null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const sizeKB = file.size / 1024;
    const sizeStr = sizeKB >= 1024 ? `${(sizeKB / 1024).toFixed(1)} MB` : `${sizeKB.toFixed(0)} KB`;
    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'file';
    const url = URL.createObjectURL(file);
    addClaimDocument({ name: file.name, size: sizeStr, type: ext, url });
    e.target.value = '';
  };

  const handleApprove = () => { approveClaimAction(oemDraftComment.trim() || undefined); setOemDraftComment(''); onClose(); };
  const handleRequestAdjustments = () => { if (!oemDraftComment.trim()) return; requestClaimRevision(oemDraftComment.trim()); setOemDraftComment(''); onClose(); };
  const handleDeclineClaim = () => { declineClaimAction(oemDraftComment.trim() || undefined); setOemDraftComment(''); onClose(); };
  const handleProcessPayment = () => { processPayment(); onClose(); };
  const handleResubmit = () => { resubmitClaimWithComment(dealerDraftComment.trim()); setDealerDraftComment(''); onClose(); };
  const handleSendDealerNote = () => { if (!dealerDraftComment.trim()) return; addDealerNote('claim', dealerDraftComment.trim()); setDealerDraftComment(''); };

  const btnAccent = { borderRadius: '9999px', bgcolor: 'var(--brand-accent, #6200EE)', '&:hover': { bgcolor: 'var(--brand-accent-hover, #5000d4)' } };
  const btnText = { borderRadius: '9999px', color: 'rgba(17,16,20,0.6)' };

  const renderFooter = () => {
    if (userType === 'oem') {
      const canAct = !['Approved', 'Declined', 'Paid'].includes(liveStatus);
      if (canAct) {
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <TextField
              multiline minRows={2}
              value={oemDraftComment} onChange={(e) => setOemDraftComment(e.target.value)}
              placeholder="Add a comment (required for Request Adjustments)…"
              size="small" fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
              <Button onClick={onClose} variant="text" sx={btnText}>{t('Close')}</Button>
              <Button onClick={isWorkflowItem ? handleRequestAdjustments : onClose} disabled={!oemDraftComment.trim()} variant="outlined" sx={{ borderRadius: '9999px', borderColor: '#E17613', color: 'warning.main', '&:hover': { bgcolor: 'rgba(225,118,19,0.06)' } }}>
                Request Adjustments
              </Button>
              <Button onClick={isWorkflowItem ? handleDeclineClaim : onClose} variant="outlined" startIcon={<CancelOutlinedIcon />} sx={{ borderRadius: '9999px', borderColor: '#D2323F', color: 'error.main', '&:hover': { bgcolor: 'rgba(210,50,63,0.06)' } }}>
                Decline
              </Button>
              <Button onClick={isWorkflowItem ? handleApprove : onClose} variant="contained" sx={btnAccent}>
                Approve Claim
              </Button>
            </Box>
          </Box>
        );
      }
      if (isWorkflowItem && liveStatus === 'Approved') {
        return (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
            <Button onClick={onClose} variant="text" sx={btnText}>{t('Close')}</Button>
            <Button onClick={handleProcessPayment} variant="contained" startIcon={<SavingsOutlinedIcon />} sx={btnAccent}>
              Process Payment
            </Button>
          </Box>
        );
      }
      return <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}><Button onClick={onClose} variant="text" sx={btnText}>{t('Close')}</Button></Box>;
    }

    if (!isWorkflowItem) {
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <TextField multiline minRows={2} value={dealerDraftComment} onChange={(e) => setDealerDraftComment(e.target.value)} placeholder="Add a note to the OEM (optional)…" size="small" fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }} />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
            <Button onClick={onClose} variant="text" sx={btnText}>{t('Close')}</Button>
            {dealerDraftComment.trim() && <Button onClick={handleSendDealerNote} variant="contained" sx={btnAccent}>Send Note</Button>}
          </Box>
        </Box>
      );
    }

    if (liveStatus === 'Draft') {
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <TextField multiline minRows={2} value={dealerDraftComment} onChange={(e) => setDealerDraftComment(e.target.value)} placeholder="Add a note to the OEM (optional)…" size="small" fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }} />
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography sx={{ fontSize: '13px', color: 'text.secondary' }}>Review the details and submit for OEM review.</Typography>
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <Button onClick={onClose} variant="text" sx={btnText}>{t('Close')}</Button>
              <Button onClick={() => { submitClaim(); onClose(); }} variant="contained" sx={btnAccent}>Submit Claim</Button>
            </Box>
          </Box>
        </Box>
      );
    }

    if (liveStatus === 'Revision Requested') {
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <TextField multiline minRows={2} value={dealerDraftComment} onChange={(e) => setDealerDraftComment(e.target.value)} placeholder="Add a reply to the OEM (optional)…" size="small" fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }} />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
            <Button onClick={onClose} variant="text" sx={btnText}>{t('Close')}</Button>
            <Button onClick={handleResubmit} variant="contained" startIcon={<ChatBubbleOutlineIcon />} sx={btnAccent}>Resubmit Claim</Button>
          </Box>
        </Box>
      );
    }

    if (liveStatus === 'Paid') {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
            <SavingsOutlinedIcon sx={{ width: 16, height: 16, color: '#2e7d32' }} />
            <Typography sx={{ fontSize: '13px', color: '#2e7d32' }}>
              Payment of ${WORKFLOW_CAMPAIGN.totalAmount.toLocaleString()} processed successfully.
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1.5, flexShrink: 0 }}>
            <Button onClick={onClose} variant="text" sx={btnText}>{t('Close')}</Button>
            <Button onClick={() => { archiveAndReset(); onClose(); }} variant="contained" startIcon={<LoopIcon />} sx={btnAccent}>
              Start New Pre-approval
            </Button>
          </Box>
        </Box>
      );
    }

    // Submitted / In Review / Approved — read-only for dealer
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <TextField multiline minRows={2} value={dealerDraftComment} onChange={(e) => setDealerDraftComment(e.target.value)} placeholder="Add a note to the OEM (optional)…" size="small" fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }} />
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
          <Button onClick={onClose} variant="text" sx={btnText}>{t('Close')}</Button>
          {dealerDraftComment.trim() && <Button onClick={handleSendDealerNote} variant="contained" sx={btnAccent}>Send Note</Button>}
        </Box>
      </Box>
    );
  };

  const claimDocs = isWorkflowItem ? wfCL.documents : [];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: 'background.paper' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 4, py: 2.5, borderBottom: '1px solid #E0E0E0', flexShrink: 0 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography sx={{ color: 'text.primary', fontSize: '20px', fontWeight: 500, letterSpacing: '0.15px', lineHeight: 1.3 }}>
            {t('Claim')} - {claim.id}
          </Typography>
          <Typography sx={{ fontSize: '14px', color: 'text.secondary', mt: '4px' }}>
            {isWorkflowItem ? WORKFLOW_DEALER.name : claim.dealershipName}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button size="small" startIcon={<StarBorderIcon sx={{ width: 14, height: 14 }} />} variant="outlined" sx={{ borderRadius: '9999px', borderColor: '#E0E0E0', color: 'rgba(31,29,37,0.8)', fontSize: '13px', fontWeight: 500, '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' } }}>
              {t('Follow')}
            </Button>
            {liveStatus && <StatusChip status={liveStatus} />}
          </Box>
          <Divider orientation="vertical" flexItem sx={{ mx: 0.5, height: 24, alignSelf: 'center' }} />
          <IconButton onClick={onClose} size="small"><CloseIcon sx={{ width: 20, height: 20, color: 'text.secondary' }} /></IconButton>
        </Box>
      </Box>

      {/* Body */}
      <Box sx={{ flex: 1, overflowY: 'auto' }}>
        <Box sx={{ px: 4, py: 3, display: 'flex', flexDirection: 'column', gap: 4 }}>

          {/* Violation Summary */}
          {claim.violationSummary && (
            <Box sx={{ bgcolor: 'rgba(210,50,63,0.04)', mx: -4, px: 4, py: 2, borderBottom: '1px solid rgba(210,50,63,0.15)' }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                <Box sx={{ flexShrink: 0, width: 32, height: 32, borderRadius: '50%', bgcolor: 'rgba(210,50,63,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', mt: '2px' }}>
                  <WarningAmberIcon sx={{ width: 16, height: 16, color: 'error.main' }} />
                </Box>
                <Box>
                  <Typography sx={{ fontSize: '13px', fontWeight: 600, color: 'error.main', mb: '2px' }}>Violation Summary</Typography>
                  <Typography sx={{ fontSize: '13px', color: 'text.primary', lineHeight: 1.6 }}>{claim.violationSummary}</Typography>
                </Box>
              </Box>
            </Box>
          )}

          {/* OEM Revision comment */}
          {isWorkflowItem && userType !== 'oem' && liveStatus === 'Revision Requested' && liveOemComment && (
            <Box sx={{ bgcolor: 'rgba(225,118,19,0.06)', mx: -4, px: 4, py: 2, borderBottom: '1px solid rgba(225,118,19,0.2)' }}>
              <Typography sx={{ color: 'warning.main', fontSize: '13px', fontWeight: 500, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#E17613' }} />
                Adjustments Requested by OEM
              </Typography>
              <Typography sx={{ fontSize: '13px', color: 'text.primary', lineHeight: 1.6, pl: 2, borderLeft: '2px solid rgba(225,118,19,0.3)', whiteSpace: 'pre-wrap' }}>
                {liveOemComment}
              </Typography>
            </Box>
          )}

          {/* Claim Details */}
          <Box component="section">
            <Typography sx={{ color: 'text.primary', fontSize: '15px', fontWeight: 500, mb: 2 }}>{t('Claim Details')}</Typography>
            <Box>
              <KeyValueRow label="Claim ID" value={claim.id} />
              <KeyValueRow label="Dealership" value={`${claim.dealershipCode} - ${claim.dealershipName}`} />
              <KeyValueRow label="Fund" value={claim.fund} />
              <KeyValueRow label="Amount" value={`$${claim.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} />
              <KeyValueRow
                label="Date"
                value={claim.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              />
              <KeyValueRow label="Submitted by" value={claim.submittedBy.name} />
              {claim.details && <KeyValueRow label="Details" value={claim.details} />}
            </Box>
          </Box>

          {/* Invoice total — workflow only */}
          {isWorkflowItem && wfCL.invoiceTotal > 0 && (
            <Box component="section">
              <Typography sx={{ color: 'text.primary', fontSize: '15px', fontWeight: 500, mb: 1.5 }}>Invoice</Typography>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1.5, borderTop: '2px solid rgba(98,0,238,0.2)', mt: 0.5 }}>
                  <Typography sx={{ color: 'text.primary', fontSize: '13px', fontWeight: 500 }}>Total</Typography>
                  <Typography sx={{ color: 'var(--brand-accent, #6200EE)', fontSize: '15px', fontWeight: 700 }}>
                    ${wfCL.invoiceTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}

          {/* Supporting Documents */}
          <Box component="section">
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
              <Typography sx={{ color: 'text.primary', fontSize: '15px', fontWeight: 500 }}>Supporting Documents</Typography>
              {isWorkflowItem && (
                <>
                  <input ref={fileInputRef} type="file" accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.mp4,.webm,.mov" style={{ position: 'absolute', width: 0, height: 0, opacity: 0, overflow: 'hidden', pointerEvents: 'none' }} onChange={handleFileChange} tabIndex={-1} />
                  <Button onClick={() => fileInputRef.current?.click()} size="small" variant="outlined" startIcon={<AttachFileIcon sx={{ width: 14, height: 14 }} />} sx={{ borderRadius: '9999px', borderColor: '#E0E0E0', color: 'text.secondary', fontSize: '13px', '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' } }}>
                    Add Document
                  </Button>
                </>
              )}
            </Box>

            {claimDocs.length > 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {claimDocs.map((doc, idx) => (
                  <Box key={idx} sx={{ border: '1px solid #E0E0E0', borderRadius: 2, display: 'flex', overflow: 'hidden', bgcolor: 'background.paper', maxWidth: 480 }}>
                    <Box sx={{ width: 72, bgcolor: '#F5F5F5', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid #E0E0E0', flexShrink: 0 }}>
                      <Typography sx={{ fontSize: '9px', fontWeight: 700, color: '#FF5252' }}>{doc.type.toUpperCase().slice(0, 4)}</Typography>
                    </Box>
                    <Box sx={{ flex: 1, p: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', minWidth: 0 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: 0, pr: 1.5 }}>
                        <Typography sx={{ color: 'text.primary', fontSize: '13px', fontWeight: 500, wordBreak: 'break-all', lineHeight: 1.3, mb: '2px' }}>{doc.name}</Typography>
                        <Typography sx={{ color: 'text.secondary', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{doc.type.toUpperCase()} | {doc.size}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <IconButton size="small" sx={{ color: 'text.secondary' }}><VisibilityOutlinedIcon sx={{ width: 16, height: 16 }} /></IconButton>
                        {isWorkflowItem && userType !== 'oem' && (
                          <IconButton size="small" onClick={() => removeClaimDocument(doc.name)} sx={{ color: 'text.disabled', '&:hover': { color: 'error.main' } }}>
                            <DeleteOutlineIcon sx={{ width: 16, height: 16 }} />
                          </IconButton>
                        )}
                      </Box>
                    </Box>
                  </Box>
                ))}
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, py: 3, border: '1px dashed #E0E0E0', borderRadius: 3, textAlign: 'center' }}>
                <AttachFileIcon sx={{ width: 24, height: 24, color: 'text.disabled' }} />
                <Typography sx={{ fontSize: '13px', color: 'text.disabled' }}>
                  {isWorkflowItem ? 'No documents attached yet. Click Add Document to attach.' : 'No documents attached'}
                </Typography>
              </Box>
            )}
          </Box>

          {/* Workflow history */}
          {isWorkflowItem && wfCL.history && wfCL.history.length > 0 && (
            <WorkflowHistoryTimeline history={wfCL.history} />
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
