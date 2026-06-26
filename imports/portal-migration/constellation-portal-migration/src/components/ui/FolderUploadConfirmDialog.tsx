import { useState, useMemo, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Box, Typography, IconButton, Tooltip, Checkbox,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import { useFolderStore } from '../../store/useFolderStore';
import { useUploadStore, ACCEPTED_TYPES } from '../../store/useUploadStore';

// ─── Tokens (mirrors MoveFolderDialog exactly) ────────────────────────────────
const BRAND       = '#473bab';
const ACTIVE      = 'rgba(71,59,171,0.08)';
const BORDER      = 'rgba(0,0,0,0.08)';
const TEXT_DIM    = 'rgba(17,16,20,0.56)';
const WARN_BG     = 'rgba(245,158,11,0.08)';
const WARN_BORDER = 'rgba(245,158,11,0.4)';
const WARN_TEXT   = '#92400e';
const INFO_BG     = 'rgba(71,59,171,0.06)';
const INFO_BORDER = 'rgba(71,59,171,0.2)';

// ─── Folder chip (source → destination) ──────────────────────────────────────
function FolderChip({ name, sub }: { name: string; sub?: string }) {
  return (
    <Box sx={{
      display: 'flex', alignItems: 'center', gap: '8px',
      px: '12px', py: '10px', borderRadius: '10px',
      border: `1px solid ${BORDER}`, bgcolor: '#fafafa', minWidth: 0, flex: 1,
    }}>
      <FolderOutlinedIcon sx={{ fontSize: 20, color: BRAND, flexShrink: 0 }} />
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{
          fontSize: 13, fontWeight: 600, fontFamily: 'Roboto, sans-serif',
          color: '#1f1d25', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {name}
        </Typography>
        {sub && (
          <Typography sx={{ fontSize: 11, color: TEXT_DIM, fontFamily: 'Roboto, sans-serif' }}>
            {sub}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

// ─── File row — mirrors MoveFolderDialog's FolderRow aesthetic ────────────────
function FileRow({
  file,
  checked,
  disabled,
  onChange,
}: {
  file: File;
  checked: boolean;
  disabled: boolean;
  onChange: (checked: boolean) => void;
}) {
  const ext     = file.name.split('.').pop()?.toUpperCase() ?? '?';
  const isImage = ACCEPTED_TYPES.includes(file.type);

  const row = (
    <Box
      onClick={disabled ? undefined : () => onChange(!checked)}
      sx={{
        display: 'flex', alignItems: 'center', gap: '10px',
        px: '12px', py: '8px', cursor: disabled ? 'not-allowed' : 'pointer',
        borderRadius: '8px', opacity: disabled ? 0.6 : 1,
        bgcolor: 'transparent',
        border: '1px solid transparent',
        '&:hover': { bgcolor: disabled ? 'transparent' : '#f5f5f7' },
        transition: 'background 0.1s',
      }}
    >
      <Checkbox
        checked={checked}
        disabled={disabled}
        onChange={(_, val) => onChange(val)}
        onClick={e => e.stopPropagation()}
        size="small"
        sx={{
          p: 0, flexShrink: 0,
          color: 'rgba(0,0,0,0.26)',
          '&.Mui-checked': { color: BRAND },
          '&.Mui-disabled': { color: 'rgba(0,0,0,0.18)' },
        }}
      />

      <Box sx={{ flexShrink: 0, display: 'flex', alignItems: 'center', color: disabled ? 'rgba(0,0,0,0.26)' : 'rgba(17,16,20,0.56)' }}>
        {isImage
          ? <ImageOutlinedIcon sx={{ fontSize: 18 }} />
          : <InsertDriveFileOutlinedIcon sx={{ fontSize: 18 }} />}
      </Box>

      <Typography sx={{
        flex: 1, fontSize: 14, fontFamily: 'Roboto, sans-serif',
        color: disabled ? 'rgba(0,0,0,0.3)' : '#1f1d25',
        fontWeight: 400,
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        {file.name}
      </Typography>

      <Box sx={{
        px: '6px', py: '2px', borderRadius: '4px', flexShrink: 0,
        bgcolor: disabled ? 'rgba(0,0,0,0.06)' : `${BRAND}14`,
      }}>
        <Typography sx={{
          fontSize: 10, fontWeight: 600, fontFamily: 'Roboto, sans-serif', lineHeight: 1.4,
          color: disabled ? 'rgba(0,0,0,0.3)' : BRAND, textTransform: 'uppercase',
        }}>
          {ext}
        </Typography>
      </Box>
    </Box>
  );

  if (disabled) {
    return (
      <Tooltip title="Asset type not supported" placement="right" arrow>
        {row}
      </Tooltip>
    );
  }
  return row;
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface FolderUploadConfirmDialogProps {
  open: boolean;
  folderName: string;
  files: File[];
  dest: { id: string; name: string; icon: string };
  onClose: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────
export function FolderUploadConfirmDialog({
  open, folderName, files, dest, onClose,
}: FolderUploadConfirmDialogProps) {
  const { addFolder, folders } = useFolderStore();
  const { addFolderUpload }    = useUploadStore();

  const supportedFiles   = useMemo(() => files.filter(f => ACCEPTED_TYPES.includes(f.type)), [files]);
  const unsupportedFiles = useMemo(() => files.filter(f => !ACCEPTED_TYPES.includes(f.type)), [files]);
  const isAccountFolder  = dest.icon === 'folder-account';

  // Track which supported files are selected (all on by default)
  const [checkedNames, setCheckedNames] = useState<Set<string>>(new Set());

  // Reset selection whenever files change (new zip picked)
  useEffect(() => {
    setCheckedNames(new Set(supportedFiles.map(f => f.name)));
  }, [files]);

  const toggleFile = (name: string, val: boolean) => {
    setCheckedNames(prev => {
      const next = new Set(prev);
      val ? next.add(name) : next.delete(name);
      return next;
    });
  };

  const allChecked  = supportedFiles.length > 0 && supportedFiles.every(f => checkedNames.has(f.name));
  const someChecked = supportedFiles.some(f => checkedNames.has(f.name));

  const toggleAll = () => {
    setCheckedNames(allChecked ? new Set() : new Set(supportedFiles.map(f => f.name)));
  };

  const selectedCount  = supportedFiles.filter(f => checkedNames.has(f.name)).length;
  const isEmpty        = files.length === 0;
  const allUnsupported = files.length > 0 && supportedFiles.length === 0;
  const noneSelected   = !isEmpty && !allUnsupported && selectedCount === 0;

  // Unique uppercased extensions of unsupported files (e.g. "PDF, MP4")
  const unsupportedExts = useMemo(() => {
    const exts = new Set(unsupportedFiles.map(f => f.name.split('.').pop()?.toUpperCase() ?? '?'));
    return Array.from(exts).join(', ');
  }, [unsupportedFiles]);

  const destFolder = folders.find(f => f.id === dest.id);
  const destPath   = destFolder ? dest.name : 'Portal';

  const handleUpload = () => {
    const filesToUpload = supportedFiles.filter(f => checkedNames.has(f.name));
    const newFolderId   = `folder-upload-${Date.now()}`;

    addFolder({
      id:       newFolderId,
      name:     folderName,
      parentId: dest.id,
      icon:     'folder',
      count:    filesToUpload.length,
    });

    addFolderUpload({
      folderName,
      destFolderName:   dest.name,
      createdFolderId:  newFolderId,
      supportedFiles:   filesToUpload,
      skippedFileNames: [
        ...unsupportedFiles.map(f => f.name),
        ...supportedFiles.filter(f => !checkedNames.has(f.name)).map(f => f.name),
      ],
    });

    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { borderRadius: '16px', overflow: 'hidden' } }}
    >
      {/* Title */}
      <DialogTitle sx={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        pb: 1.5, fontFamily: 'Roboto, sans-serif', fontWeight: 700, fontSize: 17,
      }}>
        Upload Folder
        <IconButton size="small" onClick={onClose} sx={{ color: TEXT_DIM }}>
          <CloseIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </DialogTitle>

      <Box sx={{ px: 3, pb: 0 }}>
        {/* Folder → Destination visual */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', mb: 2 }}>
          <FolderChip
            name={folderName}
            sub={`${files.length} file${files.length !== 1 ? 's' : ''}`}
          />
          <ArrowForwardIcon sx={{ fontSize: 18, color: TEXT_DIM, flexShrink: 0 }} />
          <FolderChip
            name={dest.name}
            sub={destPath !== dest.name ? destPath : undefined}
          />
        </Box>

        {/* Summary banner — reactive to selection */}
        <Box sx={{
          px: 1.5, py: 1.25, borderRadius: '8px', mb: 1.5,
          bgcolor: INFO_BG, border: `1px solid ${INFO_BORDER}`,
          display: 'flex', gap: 1,
        }}>
          <InfoOutlinedIcon sx={{ fontSize: 16, color: allUnsupported ? '#d97706' : BRAND, mt: '1px', flexShrink: 0 }} />
          <Typography sx={{ fontSize: 12, color: allUnsupported ? WARN_TEXT : BRAND, fontFamily: 'Roboto, sans-serif', lineHeight: 1.5 }}>
            {isEmpty
              ? 'No files found in this archive. The folder will be created empty.'
              : allUnsupported
                ? <>None of the {files.length} file{files.length !== 1 ? 's' : ''} in this archive ({unsupportedExts}) are supported. The folder will be created empty.</>
                : noneSelected
                  ? 'No assets selected — select at least one file to upload.'
                  : (
                    <>
                      <strong>{selectedCount}</strong> asset{selectedCount !== 1 ? 's' : ''} will be uploaded
                      {unsupportedFiles.length > 0 && (
                        <span style={{ color: TEXT_DIM }}>
                          {' '}· {unsupportedFiles.length} {unsupportedFiles.length !== 1 ? 'files' : 'file'} ({unsupportedExts}) will be skipped
                        </span>
                      )}
                    </>
                  )}
          </Typography>
        </Box>

        {/* Account folder warning */}
        {isAccountFolder && (
          <Box sx={{
            px: 1.5, py: 1.25, borderRadius: '8px', mb: 1.5,
            bgcolor: WARN_BG, border: `1px solid ${WARN_BORDER}`, display: 'flex', gap: 1,
          }}>
            <WarningAmberOutlinedIcon sx={{ fontSize: 16, color: '#d97706', mt: '1px', flexShrink: 0 }} />
            <Typography sx={{ fontSize: 12, color: WARN_TEXT, fontFamily: 'Roboto, sans-serif', lineHeight: 1.5 }}>
              This folder is uploading into an account folder. The new folder and all uploaded assets will inherit that account's visibility restrictions.
            </Typography>
          </Box>
        )}

        {/* Select-all header row */}
        {files.length > 0 && (
          <Box sx={{
            display: 'flex', alignItems: 'center', gap: '10px',
            px: '12px', py: '6px', mb: '2px',
          }}>
            <Checkbox
              checked={allChecked}
              indeterminate={someChecked && !allChecked}
              onChange={toggleAll}
              size="small"
              sx={{
                p: 0, flexShrink: 0, color: 'rgba(0,0,0,0.26)',
                '&.Mui-checked, &.MuiCheckbox-indeterminate': { color: BRAND },
              }}
            />
            <Typography sx={{ fontSize: 12, color: TEXT_DIM, fontFamily: 'Roboto, sans-serif', fontWeight: 500 }}>
              {allChecked ? 'Deselect all' : 'Select all'}
            </Typography>
            <Typography sx={{ fontSize: 12, color: TEXT_DIM, fontFamily: 'Roboto, sans-serif', ml: 'auto' }}>
              {files.length} file{files.length !== 1 ? 's' : ''}
            </Typography>
          </Box>
        )}
      </Box>

      {/* File list — same scrollable pattern as MoveFolderDialog */}
      <DialogContent dividers sx={{
        p: '8px', maxHeight: 260, overflowY: 'auto', borderColor: BORDER,
        '&::-webkit-scrollbar': { width: 4 },
        '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(0,0,0,0.15)', borderRadius: 2 },
      }}>
        {isEmpty ? (
          <Box sx={{ py: 5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography sx={{ fontSize: 13, color: TEXT_DIM, fontFamily: 'Roboto, sans-serif' }}>
              No files found in this archive
            </Typography>
          </Box>
        ) : (
          /* Supported first, then unsupported */
          [...supportedFiles, ...unsupportedFiles].map((file, idx) => {
            const isSupported = ACCEPTED_TYPES.includes(file.type);
            return (
              <FileRow
                key={`${file.name}-${idx}`}
                file={file}
                checked={isSupported ? checkedNames.has(file.name) : false}
                disabled={!isSupported}
                onChange={val => toggleFile(file.name, val)}
              />
            );
          })
        )}
      </DialogContent>

      {/* Actions */}
      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button
          onClick={onClose}
          size="small"
          sx={{ textTransform: 'none', color: TEXT_DIM, borderRadius: '100px', fontFamily: 'Roboto, sans-serif' }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleUpload}
          variant="contained"
          size="small"
          disabled={noneSelected}
          sx={{
            textTransform: 'none', borderRadius: '100px', bgcolor: BRAND,
            boxShadow: 'none', fontFamily: 'Roboto, sans-serif', fontWeight: 600,
            '&:hover': { bgcolor: '#3730a3', boxShadow: 'none' },
            '&.Mui-disabled': { bgcolor: `${BRAND}50`, color: '#fff' },
          }}
        >
          {isEmpty || allUnsupported
            ? 'Create Empty Folder'
            : `Upload${selectedCount > 0 ? ` (${selectedCount})` : ''}`}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
