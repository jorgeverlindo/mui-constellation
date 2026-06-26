// TODO: port full implementation from vw-funds-2
// Stub: renders the modal shell with MUI Dialog. InteractiveAnnotation pins are stubbed
// as simple numbered dots (InteractiveAnnotation is not ported separately).
import { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import CloseIcon from '@mui/icons-material/Close';
import ShieldIcon from '@mui/icons-material/Shield';
import CheckIcon from '@mui/icons-material/Check';
import Slide from '@mui/material/Slide';
import type { TransitionProps } from '@mui/material/transitions';
import { forwardRef } from 'react';
import { useTranslation } from '../contexts/LanguageContext';
import { WCMItem } from './WebMonitoringContent';
import { ImageWithFallback } from './figma/ImageWithFallback';

const imgDialog = 'https://res.cloudinary.com/dvq75cqna/image/upload/v1780071137/vw-funds/e77c7a2ee09d8ca869445423a77526a5edbb0b4e.png';

const SlideUp = forwardRef(function Transition(
  props: TransitionProps & { children: React.ReactElement },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

interface PinProps { number: number; x: number; y: number; title: string; }
function AnnotationPin({ number, x, y, title }: PinProps) {
  const [open, setOpen] = useState(false);
  return (
    <Box sx={{ position: 'absolute', left: `${x}%`, top: `${y}%`, zIndex: 10, transform: 'translate(-50%, -50%)' }}>
      <Box
        onClick={() => setOpen(o => !o)}
        sx={{
          width: 24, height: 24, borderRadius: '50%', bgcolor: '#D2323F', color: 'white',
          fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', boxShadow: '0 2px 6px rgba(210,50,63,0.5)', userSelect: 'none',
        }}
      >
        {number}
      </Box>
      {open && (
        <Box sx={{
          position: 'absolute', top: -8, left: 30, minWidth: 200,
          bgcolor: 'white', borderRadius: 2, boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
          p: 1.5, zIndex: 20,
        }}>
          <Typography sx={{ fontSize: 12, fontWeight: 600, color: 'text.primary' }}>{title}</Typography>
        </Box>
      )}
    </Box>
  );
}

interface WebMonitoringModalProps {
  item: WCMItem;
  open: boolean;
  onClose: () => void;
}

export function WebMonitoringModal({ item, open, onClose }: WebMonitoringModalProps) {
  const { t } = useTranslation();
  const screenshotSrc = item.screenshotDataUrl ?? imgDialog;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      TransitionComponent={SlideUp}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '24px',
          maxHeight: '90vh',
          boxShadow: '0px 9px 46px 8px rgba(0,0,0,0.12), 0px 24px 38px 3px rgba(0,0,0,0.14)',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      {/* Title bar */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, pt: 2, pb: 1.5, borderBottom: '1px solid rgba(0,0,0,0.08)', flexShrink: 0 }}>
        <Typography sx={{ fontSize: 20, fontWeight: 500, color: 'text.primary', letterSpacing: '0.15px' }}>
          {item.id} - {t('Website Compliance Case')}
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
        </IconButton>
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, overflowY: 'auto', p: 2, minHeight: 0 }}>
        <Box sx={{ position: 'relative', overflow: 'visible', borderRadius: 3, border: '1px solid rgba(0,0,0,0.12)' }}>
          <Box sx={{ overflow: 'hidden', borderRadius: 3 }}>
            <ImageWithFallback
              src={screenshotSrc}
              alt={item.dealership + ' inventory page'}
              style={{ width: '100%', objectFit: 'cover', display: 'block' }}
            />
          </Box>
          {/* Annotation pins (simplified) */}
          <AnnotationPin number={1} x={22} y={54} title={t('Missing Legal Disclaimer')} />
          <AnnotationPin number={2} x={50} y={54} title={t('Missing Legal Disclaimer')} />
        </Box>
      </Box>

      {/* Actions */}
      <Box sx={{ borderTop: '1px solid rgba(0,0,0,0.08)', px: 2, py: 2, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1, flexShrink: 0 }}>
        <Button
          variant="outlined"
          startIcon={<ShieldIcon />}
          sx={{ borderColor: '#D2323F', color: '#be0e1c', borderRadius: '100px', textTransform: 'none', '&:hover': { bgcolor: 'rgba(210,50,63,0.08)' } }}
        >
          {t('Assign Penalty')}
        </Button>
        <Button onClick={onClose} sx={{ color: 'rgba(17,16,20,0.6)', borderRadius: '100px', textTransform: 'none', px: 3 }}>
          {t('Cancel')}
        </Button>
        <Button
          variant="contained"
          startIcon={<CheckIcon />}
          sx={{ bgcolor: 'primary.main', borderRadius: '100px', textTransform: 'none', '&:hover': { bgcolor: 'primary.dark' } }}
        >
          {t('Mark As Reviewed')}
        </Button>
      </Box>
    </Dialog>
  );
}
