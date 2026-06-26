// TODO: port full implementation from vw-funds-2
// Stub: renders the modal shell with MUI Dialog and tab switcher.
import { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import CloseIcon from '@mui/icons-material/Close';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

type ModalTab = 'generated' | 'source' | 'previous';

interface AnglePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  angleLabel: string;
  vehicleName: string;
  generatedSrc: string | null;
  sourceSrc: string | null;
  previousSrc?: string | null;
  defaultSrc: string;
  defaultTab?: ModalTab;
  onPrev?: () => void;
  onNext?: () => void;
}

const TAB_ORDER: ModalTab[] = ['generated', 'source'];

export function AnglePreviewModal({
  isOpen, onClose, angleLabel, vehicleName, generatedSrc, sourceSrc, previousSrc, defaultSrc, defaultTab = 'generated', onPrev, onNext,
}: AnglePreviewModalProps) {
  const [activeTab, setActiveTab] = useState<ModalTab>(defaultTab);

  const tabs: { id: ModalTab; label: string }[] = [
    { id: 'generated', label: 'Generated' },
    ...(previousSrc ? [{ id: 'previous' as ModalTab, label: 'Previous' }] : []),
    { id: 'source', label: 'Source' },
  ];

  const imgSrc = activeTab === 'generated' ? (generatedSrc ?? defaultSrc) : activeTab === 'previous' ? (previousSrc ?? defaultSrc) : (sourceSrc ?? defaultSrc);

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { borderRadius: '16px', maxHeight: '90vh' } }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, pt: 2, pb: 1, borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
        <Box>
          <Typography sx={{ fontSize: 16, fontWeight: 600, color: 'text.primary' }}>{vehicleName}</Typography>
          <Box sx={{ display: 'inline-flex', mt: 0.5, bgcolor: 'rgba(71,59,171,0.1)', px: 1.25, py: 0.25, borderRadius: 1 }}>
            <Typography sx={{ fontSize: 11, fontWeight: 600, color: 'primary.main', letterSpacing: '0.4px' }}>{angleLabel}</Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {onPrev && (
            <IconButton size="small" onClick={onPrev}>
              <ChevronLeftIcon />
            </IconButton>
          )}
          {onNext && (
            <IconButton size="small" onClick={onNext}>
              <ChevronRightIcon />
            </IconButton>
          )}
          <IconButton size="small" onClick={onClose}>
            <CloseIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
          </IconButton>
        </Box>
      </Box>

      {/* Tabs */}
      <Tabs
        value={tabs.findIndex(t => t.id === activeTab)}
        onChange={(_, i) => setActiveTab(tabs[i].id)}
        sx={{ px: 2, '& .MuiTab-root': { textTransform: 'none', fontSize: 13, minHeight: 40 }, '& .Mui-selected': { color: 'primary.main' }, '& .MuiTabs-indicator': { bgcolor: 'primary.main' } }}
      >
        {tabs.map(t => <Tab key={t.id} label={t.label} />)}
      </Tabs>

      {/* Image */}
      <Box sx={{ p: 2, bgcolor: 'surface.canvas', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
        <Box
          component="img"
          src={imgSrc}
          alt={`${vehicleName} ${angleLabel} ${activeTab}`}
          sx={{ maxWidth: '100%', maxHeight: 500, objectFit: 'contain', display: 'block' }}
          onError={(e) => { (e.currentTarget as HTMLImageElement).src = defaultSrc; }}
        />
      </Box>
    </Dialog>
  );
}
