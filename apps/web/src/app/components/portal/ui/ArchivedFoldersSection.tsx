import { Box, Typography, IconButton, Tooltip } from '@mui/material';
import { AppSnackbar } from './AppSnackbar';
import UnarchiveOutlinedIcon from '@mui/icons-material/UnarchiveOutlined';
import { useState } from 'react';
import { useFolderStore } from '../store/useFolderStore';
import { ink, brand, surface as surfaceTokens, status as statusTokens } from '@jorgeverlindo/constellation-ux';

const BRAND = brand.accent;
const TEXT_DIM = 'rgba(17,16,20,0.56)';
const BORDER = 'rgba(0,0,0,0.08)';

function FolderIconSvg() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ color: BRAND }}>
      <path d="M2.0625 3.5625V13.6875C2.0625 14.1017 2.39829 14.4375 2.8125 14.4375H15.1875C15.6017 14.4375 15.9375 14.1017 15.9375 13.6875V5.8125C15.9375 5.39829 15.6017 5.0625 15.1875 5.0625H9.40139C9.15062 5.0625 8.91645 4.93717 8.77735 4.72853L7.72265 3.14647C7.58355 2.93783 7.34938 2.8125 7.09861 2.8125H2.8125C2.39829 2.8125 2.0625 3.14829 2.0625 3.5625Z"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ArchivedFoldersSection() {
  const { folders, archivedIds, unarchiveFolder } = useFolderStore();
  const [snackMsg, setSnackMsg] = useState<string | null>(null);

  const archivedFolders = folders.filter(f => archivedIds.includes(f.id));
  if (archivedFolders.length === 0) return null;

  const handleUnarchive = (folderId: string, folderName: string) => {
    unarchiveFolder(folderId);
    setSnackMsg(`"${folderName}" restored from archive`);
  };

  return (
    <>
      <Box sx={{ px: 2, pt: 2, pb: 1, flexShrink: 0 }}>
        <Typography sx={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.6px', textTransform: 'uppercase', color: TEXT_DIM, mb: 1.25 }}>
          Archived Folders ({archivedFolders.length})
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {archivedFolders.map(folder => (
            <Box key={folder.id} sx={{ display: 'flex', alignItems: 'center', gap: '8px', px: '10px', py: '7px', borderRadius: '8px', border: `1px solid ${BORDER}`, bgcolor: '#fafafa', '&:hover': { bgcolor: '#f5f5f7', borderColor: 'rgba(0,0,0,0.14)' }, transition: 'background 0.1s, border-color 0.1s' }}>
              <Box sx={{ color: BRAND, display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                <FolderIconSvg />
              </Box>
              <Typography sx={{ fontSize: 13, color: ink.primary, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {folder.name}
              </Typography>
              {folder.count !== undefined && (
                <Typography sx={{ fontSize: 12, color: TEXT_DIM, flexShrink: 0 }}>
                  ({folder.count})
                </Typography>
              )}
              <Tooltip title="Restore from archive" placement="top">
                <IconButton size="small" onClick={() => handleUnarchive(folder.id, folder.name)} sx={{ p: '3px', color: TEXT_DIM, flexShrink: 0, '&:hover': { color: BRAND, bgcolor: `${BRAND}10` } }}>
                  <UnarchiveOutlinedIcon sx={{ fontSize: 15 }} />
                </IconButton>
              </Tooltip>
            </Box>
          ))}
        </Box>
        <Box sx={{ mt: 2, borderBottom: `1px solid ${BORDER}` }} />
      </Box>
      <AppSnackbar open={Boolean(snackMsg)} message={snackMsg ?? ''} onClose={() => setSnackMsg(null)} />
    </>
  );
}
