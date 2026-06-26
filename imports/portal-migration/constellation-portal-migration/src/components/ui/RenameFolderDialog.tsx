import { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useFolderStore } from '../../store/useFolderStore';

const BRAND    = '#473bab';
const TEXT_DIM = 'rgba(17,16,20,0.56)';

interface RenameFolderDialogProps {
  open: boolean;
  folderId: string;
  currentName: string;
  onClose: () => void;
}

export function RenameFolderDialog({ open, folderId, currentName, onClose }: RenameFolderDialogProps) {
  const { renameFolder } = useFolderStore();
  const [name, setName] = useState(currentName);

  useEffect(() => { if (open) setName(currentName); }, [open, currentName]);

  const handleSave = () => {
    const trimmed = name.trim();
    if (trimmed && trimmed !== currentName) renameFolder(folderId, trimmed);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { borderRadius: '16px' } }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1, fontFamily: 'Roboto, sans-serif', fontWeight: 700, fontSize: 17 }}>
        Rename folder
        <IconButton size="small" onClick={onClose} sx={{ color: TEXT_DIM }}>
          <CloseIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: '8px !important' }}>
        <TextField
          autoFocus
          fullWidth
          size="small"
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') onClose(); }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '8px', fontFamily: 'Roboto, sans-serif', fontSize: 14,
              '&.Mui-focused fieldset': { borderColor: BRAND },
            },
          }}
        />
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button onClick={onClose} size="small" sx={{ textTransform: 'none', color: TEXT_DIM, borderRadius: '100px', fontFamily: 'Roboto, sans-serif' }}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          size="small"
          disabled={!name.trim() || name.trim() === currentName}
          sx={{ textTransform: 'none', borderRadius: '100px', bgcolor: BRAND, boxShadow: 'none', fontFamily: 'Roboto, sans-serif', fontWeight: 600, '&:hover': { bgcolor: '#3730a3', boxShadow: 'none' }, '&.Mui-disabled': { bgcolor: `${BRAND}40`, color: '#fff' } }}
        >
          Rename
        </Button>
      </DialogActions>
    </Dialog>
  );
}
