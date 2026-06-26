import { useState, useMemo } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Box, Typography, IconButton, CircularProgress,
  Tooltip, LinearProgress, InputBase,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import ReplayIcon from '@mui/icons-material/Replay';
import SearchIcon from '@mui/icons-material/Search';
import { useFolderStore, getDescendantIds, Folder, FolderIconType } from '../store/useFolderStore';
import { ink, brand, surface as surfaceTokens, status as statusTokens } from '@jorgeverlindo/constellation-ux';

const BRAND = brand.accent;
const ACTIVE = 'rgba(71,59,171,0.08)';
const BORDER = 'rgba(0,0,0,0.08)';
const TEXT_DIM = 'rgba(17,16,20,0.56)';
const WARN_BG = 'rgba(245,158,11,0.08)';
const WARN_BORDER = 'rgba(245,158,11,0.4)';
const WARN_TEXT = '#92400e';

function FolderIcon({ type, color }: { type: FolderIconType; color?: string }) {
  const c = color ?? BRAND;
  if (type === 'folder-read-only') return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ color: c }}>
      <path d="M9.3501 14.4375H15.5376C15.9518 14.4375 16.2876 14.1017 16.2876 13.6875V5.8125C16.2876 5.39829 15.9518 5.0625 15.5376 5.0625H9.75149C9.50072 5.0625 9.26655 4.93717 9.12745 4.72853L8.07275 3.14647C7.93365 2.93783 7.69947 2.8125 7.44871 2.8125H3.1626C2.74838 2.8125 2.4126 3.14829 2.4126 3.5625V8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M7.88529 12.3561C5.81257 9.38781 3.18743 9.38781 1.11471 12.3561C0.961764 12.5751 0.961765 12.8675 1.11471 13.0865C3.18743 16.0548 5.81257 16.0548 7.88529 13.0865C8.03824 12.8675 8.03824 12.5751 7.88529 12.3561Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
  if (type === 'folder-shared') return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ color: c }}>
      <path d="M9.93752 14.4375H15.1875C15.6017 14.4375 15.9375 14.1017 15.9375 13.6875V5.8125C15.9375 5.39829 15.6017 5.0625 15.1875 5.0625H9.40141C9.15064 5.0625 8.91647 4.93717 8.77737 4.72853L7.72267 3.14647C7.58357 2.93783 7.3494 2.8125 7.09863 2.8125H2.81252C2.39831 2.8125 2.06252 3.14829 2.06252 3.5625V6.1875M5.81252 9.375C5.81252 10.0999 5.2249 10.6875 4.50002 10.6875C3.77515 10.6875 3.18752 10.0999 3.18752 9.375C3.18752 8.65013 3.77515 8.0625 4.50002 8.0625C5.2249 8.0625 5.81252 8.65013 5.81252 9.375ZM1.73776 14.3035C2.29125 13.2623 3.32105 12.5625 4.50002 12.5625C5.679 12.5625 6.7088 13.2623 7.26228 14.3035C7.48925 14.7304 7.1307 15.1875 6.64717 15.1875H2.35287C1.86934 15.1875 1.5108 14.7304 1.73776 14.3035Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
  if (type === 'folder-account') return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ color: c }}>
      <path d="M10.9999 14.4375H15.1874C15.6016 14.4375 15.9374 14.1017 15.9374 13.6875V5.8125C15.9374 5.39829 15.6016 5.0625 15.1874 5.0625H9.40132C9.15055 5.0625 8.91638 4.93717 8.77728 4.72853L7.72258 3.14647C7.58348 2.93783 7.34931 2.8125 7.09854 2.8125H2.81243C2.39822 2.8125 2.06243 3.14829 2.06243 3.5625V6.5M1.57146 11.8587V14.6085C1.57146 14.9658 1.86113 15.2555 2.21846 15.2555H7.71793C8.07526 15.2555 8.36493 14.9658 8.36493 14.6085V11.8587M3.6141 10.4408L3.52524 10.9739C3.42457 11.578 2.90196 12.0207 2.28958 12.0207C1.40334 12.0207 0.797335 11.1256 1.12648 10.3028L1.57061 9.19242C1.66886 8.94678 1.90677 8.78571 2.17133 8.78571H7.76522C8.02979 8.78571 8.26769 8.94678 8.36595 9.19242L8.81008 10.3028C9.13922 11.1256 8.53322 12.0207 7.64697 12.0207C7.0346 12.0207 6.51198 11.578 6.41131 10.9739L6.10052 9.10921L6.3198 10.425C6.45899 11.2602 5.81493 12.0205 4.96822 12.0205C4.12683 12.0205 3.48555 11.2698 3.6141 10.4408ZM3.6141 10.4408L3.83603 9.10921" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ color: c }}>
      <path d="M2.0625 3.5625V13.6875C2.0625 14.1017 2.39829 14.4375 2.8125 14.4375H15.1875C15.6017 14.4375 15.9375 14.1017 15.9375 13.6875V5.8125C15.9375 5.39829 15.6017 5.0625 15.1875 5.0625H9.40139C9.15062 5.0625 8.91645 4.93717 8.77735 4.72853L7.72265 3.14647C7.58355 2.93783 7.34938 2.8125 7.09861 2.8125H2.8125C2.39829 2.8125 2.0625 3.14829 2.0625 3.5625Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function DialogBreadcrumb({ currentId, folders, onNavigate }: { currentId: string | null; folders: Folder[]; onNavigate: (id: string | null) => void }) {
  const path = useMemo(() => {
    const map = new Map(folders.map(f => [f.id, f]));
    const segments: Array<{ id: string | null; name: string }> = [];
    let cur = currentId ? map.get(currentId) : undefined;
    while (cur) { segments.unshift({ id: cur.id, name: cur.name }); cur = cur.parentId ? map.get(cur.parentId) : undefined; }
    return [{ id: null as string | null, name: 'Portal' }, ...segments];
  }, [currentId, folders]);

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '2px', minHeight: 28 }}>
      {path.map((seg, i) => {
        const isLast = i === path.length - 1;
        return (
          <Box key={String(seg.id)} sx={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
            {i > 0 && <ChevronRightIcon sx={{ fontSize: 14, color: 'rgba(0,0,0,0.28)', flexShrink: 0 }} />}
            <Typography onClick={isLast ? undefined : () => onNavigate(seg.id)} sx={{ fontSize: 13, color: isLast ? ink.primary : BRAND, fontWeight: isLast ? 600 : 400, cursor: isLast ? 'default' : 'pointer', '&:hover': isLast ? {} : { textDecoration: 'underline' }, whiteSpace: 'nowrap' }}>
              {seg.name}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
}

function FolderRow({ folder, selected, disabled, disabledReason, hasChildren, onSelect, onNavigate }: {
  folder: Folder; selected: boolean; disabled: boolean; disabledReason?: string; hasChildren: boolean; onSelect: (id: string) => void; onNavigate: (id: string) => void;
}) {
  const iconColor = disabled ? 'rgba(0,0,0,0.26)' : BRAND;
  const row = (
    <Box onClick={disabled ? undefined : () => onSelect(folder.id)} onDoubleClick={(!disabled && hasChildren) ? () => onNavigate(folder.id) : undefined}
      sx={{ display: 'flex', alignItems: 'center', gap: '10px', px: '12px', py: '9px', cursor: disabled ? 'not-allowed' : 'pointer', borderRadius: '8px', opacity: disabled ? 0.45 : 1, bgcolor: selected ? ACTIVE : 'transparent', border: `1px solid ${selected ? `${BRAND}30` : 'transparent'}`, '&:hover': { bgcolor: disabled ? 'transparent' : selected ? ACTIVE : '#f5f5f7' }, transition: 'background 0.1s' }}>
      <Box sx={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
        <FolderIcon type={folder.icon} color={iconColor} />
      </Box>
      <Typography sx={{ flex: 1, fontSize: 13, color: disabled ? 'rgba(0,0,0,0.3)' : selected ? BRAND : ink.primary, fontWeight: selected ? 500 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {folder.name}
      </Typography>
      {disabled && <LockOutlinedIcon sx={{ fontSize: 14, color: 'rgba(0,0,0,0.22)', flexShrink: 0 }} />}
      {!disabled && hasChildren && (
        <IconButton size="small" onClick={(e) => { e.stopPropagation(); onNavigate(folder.id); }} sx={{ width: 24, height: 24, p: 0, flexShrink: 0, ml: 'auto', color: selected ? BRAND : TEXT_DIM, '&:hover': { bgcolor: 'rgba(0,0,0,0.06)', color: BRAND } }}>
          <ChevronRightIcon sx={{ fontSize: 18 }} />
        </IconButton>
      )}
    </Box>
  );
  if (disabled && disabledReason) return <Tooltip title={disabledReason} placement="right" arrow>{row}</Tooltip>;
  return row;
}

export interface MoveFolderDialogProps {
  open: boolean;
  folderId: string;
  folderName: string;
  onClose: () => void;
  onSuccess?: (folderName: string, destName: string) => void;
}

type MoveStatus = 'idle' | 'loading' | 'loading-large' | 'error';
const LARGE_FOLDER_THRESHOLD = 3;
let _attemptCount = 0;
function shouldSimulateError(): boolean { _attemptCount++; return _attemptCount % 5 === 0; }

export function MoveFolderDialog({ open, folderId, folderName, onClose, onSuccess }: MoveFolderDialogProps) {
  const { folders, archivedIds, moveFolder } = useFolderStore();
  const [currentBrowseFolderId, setCurrentBrowseFolderId] = useState<string | null>(null);
  const [selectedDestId, setSelectedDestId] = useState<string | null>(null);
  const [status, setStatus] = useState<MoveStatus>('idle');
  const [search, setSearch] = useState('');

  const isLoading = status === 'loading' || status === 'loading-large';

  const handleOpen = () => { setCurrentBrowseFolderId(null); setSelectedDestId(null); setStatus('idle'); setSearch(''); };

  const excludedIds = useMemo(() => new Set([folderId, ...getDescendantIds(folderId, folders)]), [folderId, folders]);
  const visibleFolders = folders.filter(f => !archivedIds.includes(f.id));
  const isSearching = search.trim().length > 0;

  const children = useMemo(() => {
    if (isSearching) {
      const q = search.trim().toLowerCase();
      return visibleFolders.filter(f => !excludedIds.has(f.id) && f.name.toLowerCase().includes(q)).sort((a, b) => a.name.localeCompare(b.name));
    }
    return visibleFolders.filter(f => (f.parentId ?? null) === currentBrowseFolderId).sort((a, b) => a.name.localeCompare(b.name));
  }, [visibleFolders, currentBrowseFolderId, search, isSearching, excludedIds]);

  const handleNavigateInto = (id: string) => { setCurrentBrowseFolderId(id); setSelectedDestId(id); setSearch(''); };
  const handleBreadcrumbNavigate = (id: string | null) => { setCurrentBrowseFolderId(id); setSelectedDestId(id); setSearch(''); };
  const handleSelectRow = (id: string) => { setSelectedDestId(prev => prev === id ? currentBrowseFolderId : id); };

  const effectiveDestId = selectedDestId;
  const effectiveDestFolder = effectiveDestId ? folders.find(f => f.id === effectiveDestId) : null;
  const showAccountWarning = effectiveDestFolder?.icon === 'folder-account';
  const destLabel = effectiveDestFolder?.name ?? 'Portal';
  const canMove = effectiveDestId === null || !excludedIds.has(effectiveDestId);

  const isLargeFolder = useMemo(() => getDescendantIds(folderId, folders).length >= LARGE_FOLDER_THRESHOLD, [folderId, folders]);

  const executeMove = async () => {
    const newStatus: MoveStatus = isLargeFolder ? 'loading-large' : 'loading';
    setStatus(newStatus);
    await new Promise(r => setTimeout(r, isLargeFolder ? 3000 : 1500));
    if (shouldSimulateError()) { setStatus('error'); return; }
    moveFolder(folderId, effectiveDestId);
    const destName = effectiveDestFolder?.name ?? 'root level';
    setStatus('idle'); setSelectedDestId(null); setCurrentBrowseFolderId(null);
    onSuccess?.(folderName, destName); onClose();
  };

  const handleRetry = () => { setStatus('idle'); executeMove(); };
  const handleClose = () => { if (isLoading) return; setSelectedDestId(null); setCurrentBrowseFolderId(null); setStatus('idle'); onClose(); };

  return (
    <Dialog open={open} onClose={handleClose} TransitionProps={{ onEnter: handleOpen }} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: '16px', overflow: 'hidden' } }}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', pb: 0.5, fontWeight: 700, fontSize: 17 }}>
        <Box sx={{ flex: 1, pr: 1 }}>Move "{folderName}"</Box>
        <IconButton size="small" onClick={handleClose} disabled={isLoading} sx={{ color: TEXT_DIM, mt: '-2px' }}>
          <CloseIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </DialogTitle>

      {status === 'error' ? (
        <>
          <DialogContent dividers sx={{ borderColor: BORDER }}>
            <Box sx={{ py: 4, px: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5, textAlign: 'center' }}>
              <ErrorOutlineIcon sx={{ fontSize: 40, color: statusTokens.danger, opacity: 0.85 }} />
              <Typography sx={{ fontSize: 15, fontWeight: 600, color: ink.primary }}>Move failed</Typography>
              <Typography sx={{ fontSize: 13, color: TEXT_DIM, maxWidth: 260, lineHeight: 1.6 }}>
                Something went wrong while moving "{folderName}". No changes were made.
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
            <Button onClick={handleClose} size="small" sx={{ textTransform: 'none', color: TEXT_DIM, borderRadius: '100px' }}>Dismiss</Button>
            <Button onClick={handleRetry} variant="contained" size="small" startIcon={<ReplayIcon sx={{ fontSize: 15 }} />} sx={{ textTransform: 'none', borderRadius: '100px', bgcolor: BRAND, boxShadow: 'none', fontWeight: 600, '&:hover': { bgcolor: brand.accentHover, boxShadow: 'none' } }}>Try again</Button>
          </DialogActions>
        </>
      ) : (
        <>
          {!isSearching && (
            <Box sx={{ px: 3, pt: 0.5, pb: 1 }}>
              <DialogBreadcrumb currentId={currentBrowseFolderId} folders={visibleFolders} onNavigate={handleBreadcrumbNavigate} />
            </Box>
          )}
          <Box sx={{ px: 3, pb: 1.25, pt: isSearching ? 1 : 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', px: '10px', height: 34, borderRadius: '8px', border: `1px solid ${isSearching ? BRAND : BORDER}`, bgcolor: '#fafafa', transition: 'border-color 0.15s', '&:focus-within': { borderColor: BRAND, bgcolor: '#fff' } }}>
              <SearchIcon sx={{ fontSize: 16, color: isSearching ? BRAND : TEXT_DIM, flexShrink: 0 }} />
              <InputBase value={search} onChange={e => setSearch(e.target.value)} placeholder="Search folders…" disabled={isLoading} sx={{ flex: 1, fontSize: 13, '& input': { p: 0 }, '& input::placeholder': { color: TEXT_DIM, opacity: 1 } }} />
              {isSearching && (
                <IconButton size="small" onClick={() => setSearch('')} sx={{ p: 0, width: 18, height: 18, color: TEXT_DIM, '&:hover': { color: ink.primary } }}>
                  <CloseIcon sx={{ fontSize: 14 }} />
                </IconButton>
              )}
            </Box>
            {isSearching && (
              <Typography sx={{ fontSize: 11, color: TEXT_DIM, mt: '4px', pl: '2px' }}>
                {children.length === 0 ? 'No folders found' : `${children.length} folder${children.length !== 1 ? 's' : ''} found`}
              </Typography>
            )}
          </Box>

          {status === 'loading-large' && (
            <Box sx={{ mx: 3, mb: 1.5, borderRadius: '8px', overflow: 'hidden', border: `1px solid ${BORDER}` }}>
              <LinearProgress sx={{ height: 3, bgcolor: `${BRAND}15`, '& .MuiLinearProgress-bar': { bgcolor: BRAND } }} />
              <Box sx={{ px: 1.5, py: 1, display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                <InfoOutlinedIcon sx={{ fontSize: 15, color: BRAND, mt: '1px', flexShrink: 0 }} />
                <Typography sx={{ fontSize: 12, color: '#473bab99', lineHeight: 1.5 }}>
                  This may take a moment. Large folders with many assets or subfolders can take longer to process.
                </Typography>
              </Box>
            </Box>
          )}

          {showAccountWarning && status === 'idle' && (
            <Box sx={{ mx: 3, mb: 1.5, px: 1.5, py: 1, borderRadius: '8px', bgcolor: WARN_BG, border: `1px solid ${WARN_BORDER}`, display: 'flex', gap: 1 }}>
              <InfoOutlinedIcon sx={{ fontSize: 16, color: '#d97706', mt: '1px', flexShrink: 0 }} />
              <Typography sx={{ fontSize: 12, color: WARN_TEXT, lineHeight: 1.5 }}>
                Moving into an account folder will apply that account's visibility restrictions.
              </Typography>
            </Box>
          )}

          <DialogContent dividers sx={{ p: '8px', maxHeight: 300, overflowY: 'auto', borderColor: BORDER, opacity: isLoading ? 0.4 : 1, pointerEvents: isLoading ? 'none' : 'auto', transition: 'opacity 0.2s', '&::-webkit-scrollbar': { width: 4 }, '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(0,0,0,0.15)', borderRadius: 2 } }}>
            {children.length === 0 ? (
              <Box sx={{ py: 5, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                <Typography sx={{ fontSize: 13, color: TEXT_DIM }}>
                  {isSearching ? `No folders matching "${search.trim()}"` : 'No subfolders here'}
                </Typography>
                {isSearching && (
                  <Typography onClick={() => setSearch('')} sx={{ fontSize: 12, color: BRAND, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>
                    Clear search
                  </Typography>
                )}
              </Box>
            ) : children.map(folder => {
              const isExcluded = excludedIds.has(folder.id);
              const isShared = folder.icon === 'folder-shared';
              const isDisabled = isExcluded || isShared;
              const hasChildren = visibleFolders.some(f => f.parentId === folder.id);
              const disabledReason = isShared ? 'Cannot move into a shared folder' : isExcluded ? 'Cannot move a folder into itself or its subfolders' : undefined;
              return (
                <FolderRow key={folder.id} folder={folder} selected={selectedDestId === folder.id} disabled={isDisabled} disabledReason={disabledReason} hasChildren={hasChildren} onSelect={handleSelectRow} onNavigate={handleNavigateInto} />
              );
            })}
          </DialogContent>

          <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
            <Button onClick={handleClose} disabled={isLoading} size="small" sx={{ textTransform: 'none', color: TEXT_DIM, borderRadius: '100px' }}>Cancel</Button>
            <Button onClick={executeMove} variant="contained" size="small" disabled={isLoading || !canMove}
              startIcon={isLoading ? <CircularProgress size={13} sx={{ color: 'rgba(255,255,255,0.7)' }} /> : undefined}
              sx={{ textTransform: 'none', borderRadius: '100px', bgcolor: BRAND, boxShadow: 'none', fontWeight: 600, minWidth: 130, '&:hover': { bgcolor: brand.accentHover, boxShadow: 'none' }, '&.Mui-disabled': { bgcolor: `${BRAND}50`, color: '#fff' } }}>
              {isLoading ? 'Moving…' : `Move to "${destLabel}"`}
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
}
