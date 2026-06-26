// TODO: port full implementation from vw-funds-2
// Stub: renders the form shell with MUI components. AI auto-fill simulation,
// interactive annotation overlay, and CustomSelect are stubbed.
import { useState, useRef, ChangeEvent, DragEvent } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import UploadIcon from '@mui/icons-material/Upload';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { useTranslation } from '../contexts/LanguageContext';
import { StatusChip } from './StatusChip';
import { emitSnackbar } from './Snackbar';
import type { WCMItem } from '../../data/types/compliance';

export type { WCMItem };

const SEVERITY_OPTIONS = ['Low', 'Medium', 'High'];
const STATUS_OPTIONS = ['Open', 'In Review', 'Resolved', 'Penalty Applied'];
const CHANNEL_OPTIONS = ['Website', 'Social', 'Search', 'Display'];
const DEALERSHIP_OPTIONS = [
  'Jack Daniels Volkswagen', 'Emich Volkswagen', 'Volkswagen of Downtown LA',
  'Jim Ellis Volkswagen', 'Hendrick Volkswagen Frisco', 'Volkswagen of Union',
  'Palisades Volkswagen', 'Trend Motors Volkswagen', 'Open Road Volkswagen Manhattan', 'Douglas Volkswagen',
];

function todayFormatted() {
  const now = new Date();
  return now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function nextInfractionId() {
  return `WCM-${24200 + Math.floor(Math.random() * 800)}`;
}

interface WebMonitoringCreateFormProps {
  onClose: () => void;
  onSave?: (infraction: WCMItem) => void;
  userType?: 'dealer' | 'dealer-singular' | 'dealer-emich' | 'oem';
  currentDealerName?: string;
  currentReporterName?: string;
}

export function WebMonitoringCreateForm({ onClose, onSave, userType = 'oem', currentDealerName, currentReporterName }: WebMonitoringCreateFormProps) {
  const { t } = useTranslation();
  const isDealerReport = userType !== 'oem';
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiFilled, setAiFilled] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [detectedOn, setDetectedOn] = useState(todayFormatted());
  const [dealership, setDealership] = useState('');
  const [violationType, setViolationType] = useState('');
  const [channel, setChannel] = useState('Website');
  const [url, setUrl] = useState('');
  const [severity, setSeverity] = useState('Medium');
  const [status, setStatus] = useState(isDealerReport ? 'Pending' : 'Open');
  const [comments, setComments] = useState('');

  function handleFile(file: File) {
    if (!/^image\/(png|jpe?g)$/.test(file.type)) { emitSnackbar(t('Only PNG or JPG screenshots are accepted.')); return; }
    const reader = new FileReader();
    reader.onload = () => {
      setScreenshot(reader.result as string);
      setIsAnalyzing(true);
      setTimeout(() => {
        setDealership('Jack Daniels Volkswagen');
        setUrl('https://www.jackdanielsvw.com/');
        setViolationType('Incorrect OEM logo usage');
        setComments('The logo formatting is a compliance infraction.');
        setIsAnalyzing(false);
        setAiFilled(true);
        emitSnackbar(t('AI analyzed screenshot — fields populated. Review before saving.'));
      }, 1500);
    };
    reader.readAsDataURL(file);
  }

  function onDrop(e: DragEvent<HTMLDivElement>) { e.preventDefault(); setIsDragOver(false); const f = e.dataTransfer.files?.[0]; if (f) handleFile(f); }
  function onSelectFile(e: ChangeEvent<HTMLInputElement>) { const f = e.target.files?.[0]; if (f) handleFile(f); }

  const canSave = !!screenshot && dealership.trim() && violationType.trim() && url.trim();

  function handleSave() {
    if (!canSave) return;
    const infraction: WCMItem = {
      id: nextInfractionId(), detectedOn, dealership: dealership.trim(), violationType: violationType.trim(),
      source: 'Manually Added', url: url.trim(), severity, status,
      comments: comments.trim() || undefined, screenshotDataUrl: screenshot ?? undefined,
      reportedBy: isDealerReport ? (currentReporterName ?? 'Mallory Manning') : undefined,
      createdAtISO: new Date().toISOString(),
    };
    onSave?.(infraction);
    onClose();
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: 'background.paper' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', px: '32px', py: '20px', borderBottom: '1px solid #E0E0E0', flexShrink: 0 }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontSize: '20px', fontWeight: 500, color: 'text.primary', letterSpacing: '0.15px' }}>
            {isDealerReport ? t('Report Infraction') : t('New Infraction')}
          </Typography>
          <Typography sx={{ fontSize: '14px', color: 'text.secondary', mt: '4px' }}>
            {isDealerReport ? t('Flag a compliance violation by another dealership') : t('Manually report a compliance violation')}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0, ml: '16px' }}>
          <StatusChip status={status} />
          <Box sx={{ width: '1px', height: 24, bgcolor: '#E0E0E0' }} />
          <IconButton onClick={onClose} size="small">
            <CloseIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
          </IconButton>
        </Box>
      </Box>

      {/* Body */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <Box sx={{ px: '32px', py: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {isDealerReport && (
            <Alert severity="warning" icon={<WarningAmberIcon />} sx={{ borderRadius: '10px' }}>
              <Typography sx={{ fontSize: '12px', fontWeight: 500 }}>You are about to report an infraction by another dealership.</Typography>
              <Typography sx={{ fontSize: '12px', mt: '2px' }}>The reported dealership will not be informed that you submitted this report.</Typography>
            </Alert>
          )}

          {/* Screenshot upload */}
          <Box component="section">
            <Typography sx={{ fontSize: '15px', fontWeight: 500, color: 'text.primary' }}>{t('Issue Preview')}</Typography>
            <Typography sx={{ fontSize: '11px', color: 'text.disabled', mt: '4px' }}>
              {t('Drop a PNG or JPG screenshot. Our AI will identify the violation and pre-fill the fields below.')}
            </Typography>

            <input ref={fileInputRef} type="file" accept="image/png,image/jpeg" style={{ display: 'none' }} onChange={onSelectFile} />

            {!screenshot ? (
              <Box
                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
                sx={{
                  mt: '12px', borderRadius: '16px', border: '2px dashed',
                  borderColor: isDragOver ? '#473BAB' : '#D0CFD7',
                  bgcolor: isDragOver ? 'rgba(71,59,171,0.04)' : '#FAFAFB',
                  cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', py: '48px', px: '24px', textAlign: 'center',
                  '&:hover': { bgcolor: '#F5F4F8' }, transition: 'all 0.15s',
                }}
              >
                <UploadIcon sx={{ color: 'text.disabled', fontSize: 32 }} />
                <Typography sx={{ fontSize: '13px', fontWeight: 500, color: 'text.primary' }}>{t('Drag a screenshot here, or click to browse')}</Typography>
                <Typography sx={{ fontSize: '11px', color: 'text.disabled' }}>PNG or JPG · max 10MB</Typography>
              </Box>
            ) : (
              <Box sx={{ mt: '12px', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.12)', position: 'relative', overflow: 'hidden' }}>
                <Box sx={{ maxHeight: 260, overflow: 'hidden', position: 'relative' }}>
                  <img src={screenshot} alt="Uploaded screenshot" style={{ width: '100%', maxHeight: 260, objectFit: 'cover', objectPosition: 'top', display: 'block' }} />
                  {isAnalyzing && (
                    <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(4px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <CircularProgress size={24} sx={{ color: 'primary.main' }} />
                      <Typography sx={{ fontSize: '12px', fontWeight: 500, color: 'text.primary' }}>{t('AI analyzing screenshot…')}</Typography>
                    </Box>
                  )}
                </Box>
                {aiFilled && !isAnalyzing && (
                  <Box sx={{ position: 'absolute', bottom: '8px', left: '8px', display: 'flex', alignItems: 'center', gap: '6px', px: '10px', py: '4px', borderRadius: '100px', bgcolor: 'rgba(255,255,255,0.9)', border: '1px solid #E0E0E0' }}>
                    <AutoAwesomeIcon sx={{ color: 'primary.main', fontSize: 12 }} />
                    <Typography sx={{ fontSize: '11px', fontWeight: 500, color: 'primary.main' }}>{t('AI pre-filled')}</Typography>
                  </Box>
                )}
              </Box>
            )}
          </Box>

          {/* Comments */}
          <Box component="section">
            <Typography sx={{ fontSize: '15px', fontWeight: 500, color: 'text.primary', mb: '8px' }}>{t('Comments')}</Typography>
            <TextField multiline rows={4} fullWidth value={comments} onChange={e => setComments(e.target.value)} placeholder={t('Add internal notes about this infraction…')} sx={{ '& .MuiInputBase-input': { fontSize: '13px' } }} />
          </Box>

          {/* Violation Details */}
          <Box component="section">
            <Typography sx={{ fontSize: '15px', fontWeight: 500, color: 'text.primary', mb: '16px' }}>{t('Violation Details')}</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <TextField label={t('Detected On')} value={detectedOn} onChange={e => setDetectedOn(e.target.value)} size="small" fullWidth sx={{ '& .MuiInputBase-input': { fontSize: '13px' } }} />
              <FormControl size="small" fullWidth>
                <InputLabel sx={{ fontSize: '13px' }}>{t('Dealership')}</InputLabel>
                <Select value={dealership} onChange={e => setDealership(e.target.value)} label={t('Dealership')} sx={{ fontSize: '13px' }}>
                  {DEALERSHIP_OPTIONS.map(d => <MenuItem key={d} value={d}><Typography sx={{ fontSize: '13px' }}>{d}</Typography></MenuItem>)}
                </Select>
              </FormControl>
              <TextField label={t('Violation Type')} value={violationType} onChange={e => setViolationType(e.target.value)} size="small" fullWidth sx={{ '& .MuiInputBase-input': { fontSize: '13px' } }} />
              <FormControl size="small" fullWidth>
                <InputLabel sx={{ fontSize: '13px' }}>{t('Channel')}</InputLabel>
                <Select value={channel} onChange={e => setChannel(e.target.value)} label={t('Channel')} sx={{ fontSize: '13px' }}>
                  {CHANNEL_OPTIONS.map(c => <MenuItem key={c} value={c}><Typography sx={{ fontSize: '13px' }}>{c}</Typography></MenuItem>)}
                </Select>
              </FormControl>
              <TextField label={t('Website / URL')} value={url} onChange={e => setUrl(e.target.value)} size="small" fullWidth sx={{ '& .MuiInputBase-input': { fontSize: '13px' } }} />
              <FormControl size="small" fullWidth>
                <InputLabel sx={{ fontSize: '13px' }}>{t('Severity')}</InputLabel>
                <Select value={severity} onChange={e => setSeverity(e.target.value)} label={t('Severity')} sx={{ fontSize: '13px' }}>
                  {SEVERITY_OPTIONS.map(s => <MenuItem key={s} value={s}><Typography sx={{ fontSize: '13px' }}>{s}</Typography></MenuItem>)}
                </Select>
              </FormControl>
              {!isDealerReport && (
                <FormControl size="small" fullWidth>
                  <InputLabel sx={{ fontSize: '13px' }}>{t('Status')}</InputLabel>
                  <Select value={status} onChange={e => setStatus(e.target.value)} label={t('Status')} sx={{ fontSize: '13px' }}>
                    {STATUS_OPTIONS.map(s => <MenuItem key={s} value={s}><Typography sx={{ fontSize: '13px' }}>{s}</Typography></MenuItem>)}
                  </Select>
                </FormControl>
              )}
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Footer */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px', px: '32px', py: '16px', borderTop: '1px solid #E0E0E0', flexShrink: 0 }}>
        <Button onClick={onClose} sx={{ color: 'rgba(17,16,20,0.6)', textTransform: 'none', borderRadius: '100px', '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' } }}>
          {t('Cancel')}
        </Button>
        <Button
          onClick={handleSave}
          disabled={!canSave}
          variant="contained"
          startIcon={<CheckIcon />}
          sx={{ bgcolor: 'primary.main', textTransform: 'none', borderRadius: '100px', '&:hover': { bgcolor: 'primary.dark' }, '&.Mui-disabled': { bgcolor: '#D0CFD7' } }}
        >
          {t('Report Infraction')}
        </Button>
      </Box>
    </Box>
  );
}
