// TODO: port full implementation from vw-funds-2
// Stub: renders the modal shell with MUI Dialog. Full dealership list,
// notify-by-email multi-select, and compliance doc upload are stubbed.
import { useState, useRef, ChangeEvent, DragEvent } from 'react';
import { createPortal } from 'react-dom';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { SchedulePanel } from './ShareReportModal';
import { emitSnackbar } from './Snackbar';
import { useTranslation } from '../contexts/LanguageContext';

interface WebMonitoringConfigModalProps {
  open: boolean;
  onClose: () => void;
}

export function WebMonitoringConfigModal({ open, onClose }: WebMonitoringConfigModalProps) {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [docs, setDocs] = useState<{ id: string; name: string; size: number }[]>([
    { id: 'doc-vw-brand', name: 'VW Brand Guidelines.pdf', size: 4_823_000 },
  ]);
  const [isDragOver, setIsDragOver] = useState(false);

  function handleFile(file: File) {
    setDocs(prev => [...prev, { id: `doc-${Date.now()}`, name: file.name, size: file.size }]);
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  }

  function onSelectFile(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  }

  function handleSave() {
    emitSnackbar(t('Web Monitoring configuration saved'));
    onClose();
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { borderRadius: '24px', maxHeight: '90vh' } }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', pb: '16px', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
        <Box>
          <Typography sx={{ fontSize: '20px', fontWeight: 500, color: 'text.primary', letterSpacing: '0.15px' }}>
            {t('Web Monitoring Configuration')}
          </Typography>
          <Typography sx={{ fontSize: '14px', color: 'text.secondary', mt: '4px' }}>
            {t('Configure how dealership websites are scanned for compliance violations')}
          </Typography>
        </Box>
        <IconButton onClick={onClose} sx={{ flexShrink: 0 }}>
          <CloseIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ py: '20px' }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          {/* Left column */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Monitoring frequency */}
            <Box component="section">
              <Typography sx={{ fontSize: '14px', fontWeight: 500, color: 'text.primary', mb: '12px' }}>
                {t('Monitoring frequency')}
              </Typography>
              <Typography sx={{ fontSize: '12px', color: 'text.secondary', mb: '12px' }}>
                {t('Set how often the AI scans dealership sites for new infractions.')}
              </Typography>
              <SchedulePanel defaultEnabled defaultExpanded defaultRepeatUnit="day" defaultEndsType="never" />
            </Box>

            {/* Compliance documents */}
            <Box component="section">
              <Typography sx={{ fontSize: '14px', fontWeight: 500, color: 'text.primary', mb: '4px' }}>
                {t('Compliance requirements documents')}
              </Typography>
              <Typography sx={{ fontSize: '12px', color: 'text.secondary', mb: '12px' }}>
                {t('The AI uses these documents as the reference rulebook to identify compliance infractions.')}
              </Typography>

              <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,.txt" style={{ display: 'none' }} onChange={onSelectFile} />

              {docs.map(d => (
                <Box key={d.id} sx={{ display: 'flex', alignItems: 'center', gap: '12px', px: '16px', py: '12px', border: '1px solid #E0E0E0', borderRadius: '10px', bgcolor: '#FAFAFB', mb: '8px' }}>
                  <Box sx={{ width: 40, height: 40, borderRadius: '8px', bgcolor: 'rgba(71,59,171,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <UploadFileIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontSize: '13px', fontWeight: 500, color: 'text.primary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {d.name}
                    </Typography>
                    <Typography sx={{ fontSize: '11px', color: 'text.disabled' }}>
                      {(d.size / 1024).toFixed(1)} KB
                    </Typography>
                  </Box>
                  <Button size="small" color="error" onClick={() => setDocs(prev => prev.filter(x => x.id !== d.id))}>
                    Remove
                  </Button>
                </Box>
              ))}

              <Box
                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
                sx={{
                  borderRadius: '10px',
                  border: '2px dashed',
                  borderColor: isDragOver ? '#473BAB' : '#D0CFD7',
                  bgcolor: isDragOver ? 'rgba(71,59,171,0.04)' : '#FAFAFB',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  py: '32px',
                  px: '24px',
                  textAlign: 'center',
                  transition: 'all 0.15s',
                  '&:hover': { bgcolor: '#F5F4F8' },
                }}
              >
                <UploadFileIcon sx={{ color: 'text.disabled', fontSize: 24 }} />
                <Typography sx={{ fontSize: '13px', fontWeight: 500, color: 'text.primary' }}>
                  {t('Drag a PDF or Word document here, or click to browse')}
                </Typography>
                <Typography sx={{ fontSize: '11px', color: 'text.disabled' }}>PDF · DOC · DOCX · TXT</Typography>
              </Box>
            </Box>
          </Box>

          {/* Right column — monitored dealerships stub */}
          <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <Typography sx={{ fontSize: '14px', fontWeight: 500, color: 'text.primary', mb: '12px' }}>
              {t('Monitored dealerships')}
            </Typography>
            <Box sx={{ flex: 1, border: '1px solid #E0E0E0', borderRadius: '10px', overflow: 'auto', p: '12px' }}>
              {/* TODO: render dealership list from vw-funds-2 implementation */}
              <Typography sx={{ fontSize: '13px', color: 'text.secondary' }}>
                10 dealerships configured (stub — see vw-funds-2 for full implementation)
              </Typography>
            </Box>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: '24px', py: '16px', borderTop: '1px solid rgba(0,0,0,0.08)', gap: '12px' }}>
        <Button onClick={onClose} sx={{ color: 'rgba(17,16,20,0.6)', textTransform: 'none', borderRadius: '100px', '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' } }}>
          {t('Cancel')}
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          startIcon={<CheckIcon />}
          sx={{ bgcolor: 'primary.main', textTransform: 'none', borderRadius: '100px', '&:hover': { bgcolor: 'primary.dark' } }}
        >
          {t('Save Configuration')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
