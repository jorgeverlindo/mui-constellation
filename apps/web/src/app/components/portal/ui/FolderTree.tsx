import React, { useState, useRef } from 'react';
import {
  Box,
  Typography,
  IconButton,
  InputBase,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider as MuiDivider,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import DriveFileMoveOutlinedIcon from '@mui/icons-material/DriveFileMoveOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import ArchiveOutlinedIcon from '@mui/icons-material/ArchiveOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CreateNewFolderOutlinedIcon from '@mui/icons-material/CreateNewFolderOutlined';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import { useFolderStore } from '../store/useFolderStore';
import type { Folder } from '../store/useFolderStore';
import { useDownloadStore } from '../store/useDownloadStore';
import { useUploadStore } from '../store/useUploadStore';
import { useArchivedStore } from '../store/useArchivedStore';
import { extractZip } from '../utils/extractZip';
import { AppSnackbar } from './AppSnackbar';
import { MoveFolderDialog } from './MoveFolderDialog';
import { RenameFolderDialog } from './RenameFolderDialog';
import { FolderUploadConfirmDialog } from './FolderUploadConfirmDialog';
import { usePortalNav } from '../PortalNavContext';
import { ink, brand, surface as surfaceTokens, status as statusTokens } from '@jorgeverlindo/constellation-ux';

// ─── Design tokens ────────────────────────────────────────────────────────────
const BRAND       = brand.accent;
const ACTIVE_BG   = 'rgba(99,86,225,0.12)';
const TEXT_MAIN   = ink.primary;
const TEXT_DIM    = 'rgba(17,16,20,0.56)';
const TEXT_MUTED  = ink.secondary;
const DIVIDER     = 'rgba(0,0,0,0.12)';
const LABEL_SIZE  = 14;
const ITEM_HEIGHT = 32;
const ITEM_PY     = '4px';

// ─── Inline SVG icons ─────────────────────────────────────────────────────────

const IcoChevronRight = () => (
  <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
    <path d="M7.27869 4.5L6.22119 5.5575L9.65619 9L6.22119 12.4425L7.27869 13.5L11.7787 9L7.27869 4.5Z" fill="currentColor"/>
  </svg>
);

const IcoFolder = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2.0625 3.5625V13.6875C2.0625 14.1017 2.39829 14.4375 2.8125 14.4375H15.1875C15.6017 14.4375 15.9375 14.1017 15.9375 13.6875V5.8125C15.9375 5.39829 15.6017 5.0625 15.1875 5.0625H9.40139C9.15062 5.0625 8.91645 4.93717 8.77735 4.72853L7.72265 3.14647C7.58355 2.93783 7.34938 2.8125 7.09861 2.8125H2.8125C2.39829 2.8125 2.0625 3.14829 2.0625 3.5625Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const IcoFolderReadOnly = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9.3501 14.4375H15.5376C15.9518 14.4375 16.2876 14.1017 16.2876 13.6875V5.8125C16.2876 5.39829 15.9518 5.0625 15.5376 5.0625H9.75149C9.50072 5.0625 9.26655 4.93717 9.12745 4.72853L8.07275 3.14647C7.93365 2.93783 7.69947 2.8125 7.44871 2.8125H3.1626C2.74838 2.8125 2.4126 3.14829 2.4126 3.5625V8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M7.88529 12.3561C5.81257 9.38781 3.18743 9.38781 1.11471 12.3561C0.961764 12.5751 0.961765 12.8675 1.11471 13.0865C3.18743 16.0548 5.81257 16.0548 7.88529 13.0865C8.03824 12.8675 8.03824 12.5751 7.88529 12.3561Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M4.32706 12.7205H4.67258M4.84534 12.7205C4.84534 12.9113 4.69065 13.066 4.49982 13.066C4.30899 13.066 4.1543 12.9113 4.1543 12.7205C4.1543 12.5297 4.30899 12.375 4.49982 12.375C4.69065 12.375 4.84534 12.5297 4.84534 12.7205Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const IcoFolderShared = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9.93752 14.4375H15.1875C15.6017 14.4375 15.9375 14.1017 15.9375 13.6875V5.8125C15.9375 5.39829 15.6017 5.0625 15.1875 5.0625H9.40141C9.15064 5.0625 8.91647 4.93717 8.77737 4.72853L7.72267 3.14647C7.58357 2.93783 7.3494 2.8125 7.09863 2.8125H2.81252C2.39831 2.8125 2.06252 3.14829 2.06252 3.5625V6.1875M5.81252 9.375C5.81252 10.0999 5.2249 10.6875 4.50002 10.6875C3.77515 10.6875 3.18752 10.0999 3.18752 9.375C3.18752 8.65013 3.77515 8.0625 4.50002 8.0625C5.2249 8.0625 5.81252 8.65013 5.81252 9.375ZM1.73776 14.3035C2.29125 13.2623 3.32105 12.5625 4.50002 12.5625C5.679 12.5625 6.7088 13.2623 7.26228 14.3035C7.48925 14.7304 7.1307 15.1875 6.64717 15.1875H2.35287C1.86934 15.1875 1.5108 14.7304 1.73776 14.3035Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const IcoFolderAccount = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10.9999 14.4375H15.1874C15.6016 14.4375 15.9374 14.1017 15.9374 13.6875V5.8125C15.9374 5.39829 15.6016 5.0625 15.1874 5.0625H9.40132C9.15055 5.0625 8.91638 4.93717 8.77728 4.72853L7.72258 3.14647C7.58348 2.93783 7.34931 2.8125 7.09854 2.8125H2.81243C2.39822 2.8125 2.06243 3.14829 2.06243 3.5625V6.5M1.57146 11.8587V14.6085C1.57146 14.9658 1.86113 15.2555 2.21846 15.2555H7.71793C8.07526 15.2555 8.36493 14.9658 8.36493 14.6085V11.8587M3.6141 10.4408L3.52524 10.9739C3.42457 11.578 2.90196 12.0207 2.28958 12.0207C1.40334 12.0207 0.797335 11.1256 1.12648 10.3028L1.57061 9.19242C1.66886 8.94678 1.90677 8.78571 2.17133 8.78571H7.76522C8.02979 8.78571 8.26769 8.94678 8.36595 9.19242L8.81008 10.3028C9.13922 11.1256 8.53322 12.0207 7.64697 12.0207C7.0346 12.0207 6.51198 11.578 6.41131 10.9739L6.10052 9.10921L6.3198 10.425C6.45899 11.2602 5.81493 12.0205 4.96822 12.0205C4.12683 12.0205 3.48555 11.2698 3.6141 10.4408ZM3.6141 10.4408L3.83603 9.10921L3.61664 10.425C3.61576 10.4303 3.61492 10.4355 3.6141 10.4408Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const IcoBrandKits = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8.66613 2.0049C8.95688 1.72363 9.41832 1.72363 9.70907 2.0049L10.8246 3.08402C10.9908 3.24487 11.222 3.31999 11.4511 3.28759L12.9878 3.07023C13.3884 3.01357 13.7617 3.28479 13.8316 3.68325L14.0997 5.21194C14.1397 5.4398 14.2826 5.63646 14.4869 5.74488L15.8579 6.4723C16.2153 6.66191 16.3579 7.10076 16.1802 7.4642L15.4986 8.85855C15.397 9.06639 15.397 9.30947 15.4986 9.5173L16.1802 10.9117C16.3579 11.2751 16.2153 11.714 15.8579 11.9036L14.4869 12.631C14.2826 12.7394 14.1397 12.9361 14.0997 13.1639L13.8316 14.6926C13.7617 15.0911 13.3884 15.3623 12.9878 15.3056L11.4511 15.0883C11.222 15.0559 10.9908 15.131 10.8246 15.2918L9.70907 16.371C9.41832 16.6522 8.95688 16.6522 8.66613 16.371L7.55065 15.2918C7.38438 15.131 7.15319 15.0559 6.92414 15.0883L5.3874 15.3056C4.98685 15.3623 4.61354 15.0911 4.54364 14.6926L4.27549 13.1639C4.23552 12.9361 4.09264 12.7394 3.88829 12.631L2.51728 11.9036C2.15992 11.714 2.01733 11.2751 2.19499 10.9117L2.87659 9.51731C2.97819 9.30947 2.97819 9.06639 2.87659 8.85855L2.19499 7.4642C2.01733 7.10076 2.15992 6.66191 2.51728 6.4723L3.88829 5.74488C4.09264 5.63646 4.23552 5.4398 4.27549 5.21194L4.54364 3.68325C4.61354 3.28479 4.98685 3.01357 5.3874 3.07023L6.92414 3.28759C7.15319 3.31999 7.38438 3.24487 7.55065 3.08402L8.66613 2.0049Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
    <path d="M9.03294 6.4136C9.10741 6.30493 9.26779 6.30493 9.34226 6.4136L10.2079 7.6767C10.2323 7.71228 10.2682 7.73836 10.3096 7.75055L11.7783 8.18352C11.9047 8.22077 11.9543 8.3733 11.8739 8.47771L10.9402 9.69132C10.9139 9.7255 10.9001 9.7677 10.9013 9.81081L10.9434 11.3415C10.9471 11.4732 10.8173 11.5675 10.6932 11.5233L9.25042 11.0103C9.20979 10.9958 9.16541 10.9958 9.12478 11.0103L7.68202 11.5233C7.55789 11.5675 7.42814 11.4732 7.43177 11.3415L7.47387 9.81081C7.47505 9.7677 7.46134 9.7255 7.43504 9.69132L6.50127 8.47771C6.42093 8.3733 6.47049 8.22077 6.59685 8.18352L8.06563 7.75055C8.107 7.73836 8.1429 7.71228 8.16728 7.6767L9.03294 6.4136Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
  </svg>
);

const IcoStar = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 2.25L10.854 6.61L15.5625 7.0275L12.15 10.044L13.1738 14.6588L9 12.2063L4.82625 14.6588L5.85 10.044L2.4375 7.0275L7.146 6.61L9 2.25Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const IcoClock = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 5.8125V9L11.0625 11.0625M15.9375 9C15.9375 12.8315 12.8315 15.9375 9 15.9375C5.16852 15.9375 2.0625 12.8315 2.0625 9C2.0625 5.16852 5.16852 2.0625 9 2.0625C12.8315 2.0625 15.9375 5.16852 15.9375 9Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const IcoTrash = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path fillRule="evenodd" clipRule="evenodd" d="M5.68795 3.75C6.21051 2.43225 7.49616 1.5 9.0007 1.5C10.5052 1.5 11.7909 2.43225 12.3135 3.75H15.9375C16.2482 3.75 16.5 4.00184 16.5 4.3125C16.5 4.62316 16.2482 4.875 15.9375 4.875H14.9649L14.2941 15.272C14.2495 15.9626 13.6764 16.5 12.9843 16.5H5.01567C4.3236 16.5 3.75045 15.9626 3.7059 15.272L3.03512 4.875H2.0625C1.75184 4.875 1.5 4.62316 1.5 4.3125C1.5 4.00184 1.75184 3.75 2.0625 3.75H5.68795ZM6.94621 3.75C7.37951 3.07331 8.13816 2.625 9.0007 2.625C9.86324 2.625 10.6219 3.07331 11.0552 3.75H6.94621ZM7.875 8.0625C7.875 7.75184 7.62316 7.5 7.3125 7.5C7.00184 7.5 6.75 7.75184 6.75 8.0625V12.1875C6.75 12.4982 7.00184 12.75 7.3125 12.75C7.62316 12.75 7.875 12.4982 7.875 12.1875V8.0625ZM10.6875 7.5C10.9982 7.5 11.25 7.75184 11.25 8.0625V12.1875C11.25 12.4982 10.9982 12.75 10.6875 12.75C10.3768 12.75 10.125 12.4982 10.125 12.1875V8.0625C10.125 7.75184 10.3768 7.5 10.6875 7.5Z" fill="#473BAB"/>
  </svg>
);

const IcoArchive = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2.25 4.5H15.75V6.75H2.25V4.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M3.375 6.75V13.5C3.375 14.1213 3.87868 14.625 4.5 14.625H13.5C14.1213 14.625 14.625 14.1213 14.625 13.5V6.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M7.125 9.375H10.875" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const IcoMore = () => (
  <svg width="16" height="16" viewBox="0 0 3 13" fill="currentColor">
    <circle cx="1.5" cy="1.5" r="1.5"/>
    <circle cx="1.5" cy="6.5" r="1.5"/>
    <circle cx="1.5" cy="11.5" r="1.5"/>
  </svg>
);

// ─── Tree data model ──────────────────────────────────────────────────────────
type FolderIcon = 'folder' | 'folder-read-only' | 'folder-shared' | 'folder-account';

interface TreeItem {
  id: string;
  label: string;
  count?: number;
  icon: FolderIcon;
  level: number;
  active?: boolean;
  expandable?: boolean;
  expanded?: boolean;
}

function buildFlatTree(
  folders: Folder[],
  expandedIds: string[],
  archivedIds: string[],
  parentId: string | null = null,
  level = 0,
): TreeItem[] {
  const children = folders.filter(f => (f.parentId ?? null) === parentId && !archivedIds.includes(f.id));
  const result: TreeItem[] = [];
  for (const folder of children) {
    const hasChildren = folders.some(f => f.parentId === folder.id && !archivedIds.includes(f.id));
    const isExpanded  = expandedIds.includes(folder.id);
    const safeIcon    = (['folder','folder-read-only','folder-shared','folder-account'] as const).includes(folder.icon as FolderIcon)
      ? folder.icon as FolderIcon
      : 'folder';
    result.push({ id: folder.id, label: folder.name, count: folder.count, icon: safeIcon, level, expandable: hasChildren, expanded: hasChildren && isExpanded });
    if (hasChildren && isExpanded) {
      result.push(...buildFlatTree(folders, expandedIds, archivedIds, folder.id, level + 1));
    }
  }
  return result;
}

const SHORTCUTS = [
  { id: 'fav',     label: 'Favorites', icon: 'star'    as const, route: null   },
  { id: 'recents', label: 'Recents',   icon: 'clock'   as const, route: null   },
  { id: 'trash',   label: 'Trash',     icon: 'trash'   as const, route: null   },
  { id: 'archive', label: 'Archive',   icon: 'archive' as const, route: 'archive' },
];

const BRAND_ITEMS = [
  { id: 'b-acura',    label: 'Acura',      type: 'Official' },
  { id: 'b-alfa',     label: 'Alfa Romeo', type: 'Client'   },
  { id: 'b-audi',     label: 'Audi',       type: 'Official' },
  { id: 'b-bmw',      label: 'BMW',        type: 'Official' },
  { id: 'b-chevy',    label: 'Chevrolet',  type: 'Official' },
  { id: 'b-chrysler', label: 'Chrysler',   type: 'Official' },
  { id: 'b-dodge',    label: 'Dodge',      type: 'Client'   },
];

// ─── Helper: folder label with count ─────────────────────────────────────────
function FolderLabel({ label, count, selected }: { label: string; count?: number; selected?: boolean }) {
  return (
    <Box sx={{ flex: 1, display: 'flex', alignItems: 'baseline', gap: '3px', minWidth: 0, pl: '4px', py: ITEM_PY }}>
      <Typography sx={{
        fontSize: LABEL_SIZE, color: TEXT_MAIN,        lineHeight: 1.4, fontWeight: selected ? 500 : 400,
        wordBreak: 'break-word', flexShrink: 1,
      }}>
        {label}
      </Typography>
      {count !== undefined && (
        <Typography sx={{
          fontSize: LABEL_SIZE, color: TEXT_MUTED,          lineHeight: 1.4, fontWeight: 400, flexShrink: 0,
        }}>
          ({count})
        </Typography>
      )}
    </Box>
  );
}

// ─── ShortcutRow ─────────────────────────────────────────────────────────────
function ShortcutRow({
  label, icon, active, count, onClick,
}: {
  label: string;
  icon: 'star' | 'clock' | 'trash' | 'archive';
  active?: boolean;
  count?: number;
  onClick?: () => void;
}) {
  const IconComponent =
    icon === 'star'    ? IcoStar :
    icon === 'clock'   ? IcoClock :
    icon === 'archive' ? IcoArchive :
    IcoTrash;

  return (
    <Box
      onClick={onClick}
      sx={{
        display: 'flex', alignItems: 'center', gap: '4px',
        height: ITEM_HEIGHT, px: '4px', borderRadius: '4px',
        cursor: onClick ? 'pointer' : 'default',
        bgcolor: active ? ACTIVE_BG : 'transparent',
        '&:hover': { bgcolor: active ? ACTIVE_BG : surfaceTokens.canvas },
        '&:hover .more-btn': { opacity: 1 },
      }}
    >
      <Box sx={{ width: 16, flexShrink: 0 }} />
      <Box sx={{ width: 19, height: 19, display: 'flex', alignItems: 'center', justifyContent: 'center', color: BRAND, flexShrink: 0 }}>
        <IconComponent />
      </Box>
      <Typography sx={{ flex: 1, fontSize: LABEL_SIZE, color: TEXT_MAIN, lineHeight: 1, pl: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: active ? 500 : 400 }}>
        {label}
      </Typography>
      {count !== undefined && count > 0 && (
        <Box sx={{ px: '5px', py: '1px', borderRadius: '10px', bgcolor: `${BRAND}18`, flexShrink: 0 }}>
          <Typography sx={{ fontSize: 11, color: BRAND, lineHeight: 1.4, fontWeight: 600 }}>
            {count}
          </Typography>
        </Box>
      )}
      <IconButton className="more-btn" size="small" sx={{ width: 20, height: 20, p: 0, opacity: 0, flexShrink: 0, color: TEXT_DIM, transition: 'opacity 0.1s', '&:hover': { bgcolor: 'transparent' } }}>
        <IcoMore />
      </IconButton>
    </Box>
  );
}

// ─── FolderRow ────────────────────────────────────────────────────────────────
type FolderMenuAction = 'rename' | 'move' | 'archive' | 'delete' | 'upload-folder' | 'download-folder';

function FolderRow({
  item, onSelect, selected, onMenuAction,
}: {
  item: TreeItem;
  onSelect: (id: string) => void;
  selected: boolean;
  onMenuAction: (id: string, name: string, action: FolderMenuAction) => void;
}) {
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);

  const FolderIconComponent = item.icon === 'folder-read-only'
    ? IcoFolderReadOnly
    : item.icon === 'folder-shared'
      ? IcoFolderShared
      : item.icon === 'folder-account'
        ? IcoFolderAccount
        : IcoFolder;

  const openMenu = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    setMenuAnchor(e.currentTarget);
  };
  const closeMenu = () => setMenuAnchor(null);
  const handleAction = (action: FolderMenuAction) => { closeMenu(); onMenuAction(item.id, item.label, action); };

  return (
    <>
      <Box
        onClick={() => onSelect(item.id)}
        sx={{
          position: 'relative',
          display: 'flex', alignItems: 'flex-start', gap: 0,
          minHeight: ITEM_HEIGHT, px: '4px',
          borderRadius: '4px', cursor: 'pointer',
          bgcolor: selected ? ACTIVE_BG : 'transparent',
          '&:hover': { bgcolor: selected ? ACTIVE_BG : surfaceTokens.canvas },
          '&:hover .more-btn': { opacity: 1 },
        }}
      >
        {item.level > 0 && Array.from({ length: item.level }).map((_, i) => (
          <Box key={i} sx={{ position: 'absolute', left: i * 16 + 12, top: 0, bottom: 0, width: '1.5px', bgcolor: 'rgba(0,0,0,0.10)', pointerEvents: 'none' }} />
        ))}
        <Box sx={{ width: item.level * 16, flexShrink: 0 }} />
        <Box sx={{ width: 19, height: ITEM_HEIGHT, display: 'flex', alignItems: 'center', justifyContent: 'center', color: TEXT_DIM, flexShrink: 0, transform: item.expandable && item.expanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s ease' }}>
          {item.expandable ? <IcoChevronRight /> : null}
        </Box>
        <Box sx={{ width: 19, height: ITEM_HEIGHT, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: BRAND }}>
          <FolderIconComponent />
        </Box>
        <FolderLabel label={item.label} count={item.count} selected={selected} />
        <IconButton
          className="more-btn"
          size="small"
          onClick={openMenu}
          sx={{ width: 20, height: 20, mt: '4px', p: 0, opacity: Boolean(menuAnchor) ? 1 : 0, flexShrink: 0, color: TEXT_DIM, transition: 'opacity 0.1s', '&:hover': { bgcolor: 'transparent', color: BRAND } }}
        >
          <IcoMore />
        </IconButton>
      </Box>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={closeMenu}
        onClick={e => e.stopPropagation()}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          sx: {
            minWidth: 180, borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.12)', py: 0.5,
            '& .MuiMenuItem-root': { px: 2, py: '10px', gap: '12px', fontSize: 14 },
          },
        }}
      >
        <MenuItem onClick={() => handleAction('rename')}>
          <ListItemIcon sx={{ minWidth: 0, color: TEXT_DIM }}><EditOutlinedIcon sx={{ fontSize: 20 }} /></ListItemIcon>
          <ListItemText primary="Rename" primaryTypographyProps={{ fontSize: 14 }} />
        </MenuItem>
        {item.icon !== 'folder-account' && (
          <MenuItem onClick={() => handleAction('move')}>
            <ListItemIcon sx={{ minWidth: 0, color: TEXT_DIM }}><DriveFileMoveOutlinedIcon sx={{ fontSize: 20 }} /></ListItemIcon>
            <ListItemText primary="Move to…" primaryTypographyProps={{ fontSize: 14 }} />
          </MenuItem>
        )}
        {item.icon === 'folder-read-only' ? (
          <Tooltip title="Not available in folders shared with you" placement="right" arrow>
            <span>
              <MenuItem disabled>
                <ListItemIcon sx={{ minWidth: 0, color: 'rgba(0,0,0,0.26)' }}><CreateNewFolderOutlinedIcon sx={{ fontSize: 20 }} /></ListItemIcon>
                <ListItemText primary="Upload Folder" primaryTypographyProps={{ fontSize: 14 }} />
              </MenuItem>
            </span>
          </Tooltip>
        ) : (
          <MenuItem onClick={() => handleAction('upload-folder')}>
            <ListItemIcon sx={{ minWidth: 0, color: TEXT_DIM }}><CreateNewFolderOutlinedIcon sx={{ fontSize: 20 }} /></ListItemIcon>
            <ListItemText primary="Upload Folder" primaryTypographyProps={{ fontSize: 14 }} />
          </MenuItem>
        )}
        <MenuItem onClick={() => handleAction('download-folder')}>
          <ListItemIcon sx={{ minWidth: 0, color: TEXT_DIM }}><FileDownloadOutlinedIcon sx={{ fontSize: 20 }} /></ListItemIcon>
          <ListItemText primary="Download Folder" primaryTypographyProps={{ fontSize: 14 }} />
        </MenuItem>
        <MuiDivider sx={{ my: 0.5 }} />
        <MenuItem onClick={() => handleAction('archive')}>
          <ListItemIcon sx={{ minWidth: 0, color: TEXT_DIM }}><ArchiveOutlinedIcon sx={{ fontSize: 20 }} /></ListItemIcon>
          <ListItemText primary="Archive" primaryTypographyProps={{ fontSize: 14 }} />
        </MenuItem>
        <MenuItem onClick={() => handleAction('delete')} sx={{ color: statusTokens.danger }}>
          <ListItemIcon sx={{ minWidth: 0, color: statusTokens.danger }}><DeleteOutlineIcon sx={{ fontSize: 20 }} /></ListItemIcon>
          <ListItemText primary="Delete" primaryTypographyProps={{ fontSize: 14, color: statusTokens.danger }} />
        </MenuItem>
      </Menu>
    </>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function splitBySharedWithMe<T extends { level: number; icon: string }>(items: T[]): { mine: T[]; shared: T[] } {
  const mine: T[] = [];
  const shared: T[] = [];
  let inShared = false;
  for (const item of items) {
    if (item.level === 0) inShared = item.icon === 'folder-read-only';
    (inShared ? shared : mine).push(item);
  }
  return { mine, shared };
}

// ─── Tree content (shared between both render modes) ─────────────────────────
function TreeContent({
  visibleItems, selectedId, isArchiveActive, archiveOpen, brandKitsOpen, archivedFolders, archiveCount,
  setArchiveOpen, setBrandKitsOpen, navigateToFolder, handleSelect, handleMenuAction,
}: {
  visibleItems: TreeItem[];
  selectedId: string;
  isArchiveActive: boolean;
  archiveOpen: boolean;
  brandKitsOpen: boolean;
  archivedFolders: { id: string; name: string; count?: number }[];
  archiveCount: number;
  setArchiveOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setBrandKitsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  navigateToFolder: (id: string) => void;
  handleSelect: (id: string) => void;
  handleMenuAction: (id: string, name: string, action: FolderMenuAction) => void;
}) {
  return (
    <>
      {/* Shortcuts */}
      <Box sx={{ mb: '4px' }}>
        {SHORTCUTS.filter(s => s.id !== 'archive').map(s => (
          <ShortcutRow
            key={s.id}
            label={s.label}
            icon={s.icon}
            active={false}
            onClick={s.route ? () => navigateToFolder(s.route!) : undefined}
          />
        ))}

        {/* Archive — expandable */}
        <Box
          onClick={() => { setArchiveOpen(o => !o); navigateToFolder('archive'); }}
          sx={{
            display: 'flex', alignItems: 'center', gap: '4px',
            height: ITEM_HEIGHT, px: '4px', borderRadius: '4px', cursor: 'pointer',
            bgcolor: isArchiveActive ? ACTIVE_BG : 'transparent',
            '&:hover': { bgcolor: isArchiveActive ? ACTIVE_BG : surfaceTokens.canvas },
            '&:hover .more-btn': { opacity: 1 },
          }}
        >
          <Box sx={{ width: 16, flexShrink: 0 }} />
          <Box sx={{ width: 19, height: 19, display: 'flex', alignItems: 'center', justifyContent: 'center', color: TEXT_DIM, flexShrink: 0, transform: archiveOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s ease' }}>
            {archivedFolders.length > 0 && <IcoChevronRight />}
          </Box>
          <Box sx={{ width: 19, height: 19, display: 'flex', alignItems: 'center', justifyContent: 'center', color: BRAND, flexShrink: 0 }}>
            <IcoArchive />
          </Box>
          <Typography sx={{ flex: 1, fontSize: LABEL_SIZE, color: TEXT_MAIN, lineHeight: 1, pl: '4px', fontWeight: isArchiveActive ? 500 : 400 }}>
            Archive
          </Typography>
          {archiveCount > 0 && (
            <Box sx={{ px: '5px', py: '1px', borderRadius: '10px', bgcolor: `${BRAND}18`, flexShrink: 0 }}>
              <Typography sx={{ fontSize: 11, color: BRAND, fontWeight: 600, lineHeight: 1.4 }}>{archiveCount}</Typography>
            </Box>
          )}
          <IconButton className="more-btn" size="small" sx={{ width: 20, height: 20, p: 0, opacity: 0, flexShrink: 0, color: TEXT_DIM, transition: 'opacity 0.1s', '&:hover': { bgcolor: 'transparent' } }}>
            <IcoMore />
          </IconButton>
        </Box>
        {archiveOpen && archivedFolders.map(f => (
          <Box key={f.id} onClick={() => navigateToFolder('archive')}
            sx={{ display: 'flex', alignItems: 'center', gap: '4px', height: ITEM_HEIGHT, px: '4px', borderRadius: '4px', cursor: 'pointer', '&:hover': { bgcolor: surfaceTokens.canvas } }}>
            <Box sx={{ width: 35, flexShrink: 0 }} />
            <Box sx={{ width: 19, height: 19, display: 'flex', alignItems: 'center', justifyContent: 'center', color: BRAND, flexShrink: 0 }}>
              <IcoFolder />
            </Box>
            <Typography sx={{ flex: 1, fontSize: LABEL_SIZE, color: TEXT_MAIN, lineHeight: 1, pl: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {f.name}
            </Typography>
            {f.count !== undefined && (
              <Typography sx={{ fontSize: LABEL_SIZE, color: TEXT_MUTED, lineHeight: 1 }}>({f.count})</Typography>
            )}
          </Box>
        ))}
      </Box>

      {/* Brand Kits */}
      <Box
        onClick={() => setBrandKitsOpen(o => !o)}
        sx={{
          display: 'flex', alignItems: 'center', gap: '4px',
          height: ITEM_HEIGHT, px: '4px', borderRadius: '4px', cursor: 'pointer', mb: '2px',
          '&:hover': { bgcolor: surfaceTokens.canvas },
        }}
      >
        <Box sx={{ width: 16, flexShrink: 0 }} />
        <Box sx={{ width: 19, height: 19, display: 'flex', alignItems: 'center', justifyContent: 'center', color: TEXT_DIM, flexShrink: 0, transform: brandKitsOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s ease' }}>
          <IcoChevronRight />
        </Box>
        <Box sx={{ width: 19, height: 19, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: BRAND }}>
          <IcoBrandKits />
        </Box>
        <Typography sx={{ flex: 1, fontSize: LABEL_SIZE, color: TEXT_MAIN, lineHeight: 1, pl: '4px' }}>
          Brand Kits
        </Typography>
      </Box>
      {brandKitsOpen && BRAND_ITEMS.map(b => (
        <Box key={b.id} sx={{ display: 'flex', alignItems: 'center', gap: '4px', height: ITEM_HEIGHT, px: '4px', cursor: 'pointer', '&:hover': { bgcolor: surfaceTokens.canvas, borderRadius: '4px' } }}>
          <Box sx={{ width: 32, flexShrink: 0 }} />
          <Box sx={{ width: 18, height: 18, borderRadius: '50%', bgcolor: '#e8eaf6', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography sx={{ fontSize: 8, fontWeight: 700, color: BRAND, lineHeight: 1 }}>
              {b.label.substring(0, 2).toUpperCase()}
            </Typography>
          </Box>
          <Typography sx={{ flex: 1, fontSize: LABEL_SIZE, color: TEXT_MAIN, lineHeight: 1, pl: '4px' }}>
            {b.label}
          </Typography>
        </Box>
      ))}

      {/* Folder tree */}
      {(() => {
        const { mine, shared } = splitBySharedWithMe(visibleItems);
        return (
          <>
            {mine.map(item => (
              <FolderRow key={item.id} item={item as TreeItem} selected={selectedId === item.id} onSelect={handleSelect} onMenuAction={handleMenuAction} />
            ))}
            {shared.length > 0 && (
              <>
                <Box sx={{ borderTop: `1px solid ${DIVIDER}`, mx: '4px', mt: '10px', mb: '6px' }} />
                <Typography sx={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', color: TEXT_MUTED, px: '8px', pb: '4px' }}>
                  Shared with me
                </Typography>
                {shared.map(item => (
                  <FolderRow key={item.id} item={item as TreeItem} selected={selectedId === item.id} onSelect={handleSelect} onMenuAction={handleMenuAction} />
                ))}
              </>
            )}
          </>
        );
      })()}
      <Box sx={{ height: 8 }} />
    </>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
interface FolderTreeProps {
  onClose: () => void;
  noShell?: boolean;
}

export function FolderTree({ onClose, noShell = false }: FolderTreeProps) {
  const { navigateToFolder, currentFolderId } = usePortalNav();
  const { folders, expandedIds, archivedIds, toggleExpand, archiveFolder, deleteFolder, addFolder } = useFolderStore();
  const { addFolderUpload } = useUploadStore();
  const { archivedAssets } = useArchivedStore();
  const archiveCount = archivedAssets.length;

  const [query,          setQuery]          = useState('');
  const [brandKitsOpen,  setBrandKitsOpen]  = useState(false);
  const [archiveOpen,    setArchiveOpen]    = useState(false);
  const [movingFolder,   setMovingFolder]   = useState<{ id: string; name: string } | null>(null);
  const [renamingFolder, setRenamingFolder] = useState<{ id: string; name: string } | null>(null);
  const [snackbarMsg,    setSnackbarMsg]    = useState<string | null>(null);
  const [uploadFolderDest, setUploadFolderDest] = useState<{ id: string; name: string; icon: string } | null>(null);
  const [pendingFolderUpload, setPendingFolderUpload] = useState<{
    dest: { id: string; name: string; icon: string };
    folderName: string;
    files: File[];
  } | null>(null);
  const folderUploadInputRef = useRef<HTMLInputElement>(null);

  const selectedId    = currentFolderId;
  const isArchiveActive = currentFolderId === 'archive';

  const archivedFolders = folders.filter(f => archivedIds.includes(f.id));
  const allTreeItems = buildFlatTree(folders, expandedIds, archivedIds);
  const visibleItems = query.trim()
    ? allTreeItems.filter(i => i.label.toLowerCase().includes(query.toLowerCase()))
    : allTreeItems;

  const handleSelect = (id: string) => {
    const item = allTreeItems.find(i => i.id === id);
    if (item?.expandable) toggleExpand(id);
    navigateToFolder(id);
  };

  const { startDownload } = useDownloadStore();

  const handleMenuAction = (id: string, name: string, action: FolderMenuAction) => {
    if (action === 'rename')  { setRenamingFolder({ id, name }); return; }
    if (action === 'move')    { setMovingFolder({ id, name });   return; }
    if (action === 'archive') { archiveFolder(id); return; }
    if (action === 'delete')  { deleteFolder(id); return; }
    if (action === 'download-folder') {
      const folder = folders.find(f => f.id === id);
      startDownload({ folderName: name, assetCount: folder?.count ?? 0 });
      return;
    }
    if (action === 'upload-folder') {
      const folder = folders.find(f => f.id === id);
      setUploadFolderDest({ id, name, icon: folder?.icon ?? 'folder' });
      if (folderUploadInputRef.current) folderUploadInputRef.current.value = '';
      folderUploadInputRef.current?.click();
    }
  };

  const handleFolderInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const zipFile = e.target.files?.[0];
    e.target.value = '';
    if (!zipFile || !uploadFolderDest) return;
    const { folderName, files } = await extractZip(zipFile);
    setPendingFolderUpload({ dest: uploadFolderDest, folderName, files });
  };

  const treeContentProps = {
    visibleItems,
    selectedId,
    isArchiveActive,
    archiveOpen,
    brandKitsOpen,
    archivedFolders,
    archiveCount,
    setArchiveOpen,
    setBrandKitsOpen,
    navigateToFolder,
    handleSelect,
    handleMenuAction,
  };

  const dialogs = (
    <>
      <input
        ref={folderUploadInputRef}
        type="file"
        accept=".zip"
        style={{ display: 'none' }}
        onChange={handleFolderInputChange}
      />
      <MoveFolderDialog
        open={Boolean(movingFolder)}
        folderId={movingFolder?.id ?? ''}
        folderName={movingFolder?.name ?? ''}
        onClose={() => setMovingFolder(null)}
        onSuccess={(name, dest) => setSnackbarMsg(`"${name}" moved to ${dest}`)}
      />
      <RenameFolderDialog
        open={Boolean(renamingFolder)}
        folderId={renamingFolder?.id ?? ''}
        currentName={renamingFolder?.name ?? ''}
        onClose={() => setRenamingFolder(null)}
      />
      <FolderUploadConfirmDialog
        open={Boolean(pendingFolderUpload)}
        folderName={pendingFolderUpload?.folderName ?? ''}
        files={pendingFolderUpload?.files ?? []}
        dest={pendingFolderUpload?.dest ?? { id: '', name: '', icon: 'folder' }}
        onClose={() => setPendingFolderUpload(null)}
      />
      <AppSnackbar
        open={Boolean(snackbarMsg)}
        message={snackbarMsg ?? ''}
        onClose={() => setSnackbarMsg(null)}
      />
    </>
  );

  // ── noShell mode — outer container provided by LeftPaneShell ─────────────
  if (noShell) {
    return (
      <>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px', px: '12px', pt: '10px', pb: '12px' }}>
          <Box sx={{
            flex: 1, display: 'flex', alignItems: 'center', gap: '6px',
            height: 32, borderRadius: '100px', border: `1px solid ${DIVIDER}`,
            bgcolor: surfaceTokens.inputBackground, px: '10px',
            transition: 'border-color 0.15s',
            '&:focus-within': { borderColor: BRAND },
          }}>
            <SearchIcon sx={{ fontSize: 24, color: ink.tertiary, flexShrink: 0 }} />
            <InputBase
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Find folder"
              inputProps={{ 'aria-label': 'Find folder' }}
              sx={{
                flex: 1, fontSize: 12, color: TEXT_MAIN,
                '& input': { p: 0 },
                '& input::placeholder': { color: ink.tertiary, opacity: 1, fontSize: 14 },
              }}
            />
          </Box>
          <Tooltip title="New folder" placement="bottom">
            <IconButton size="small" aria-label="New folder" sx={{
              width: 28, height: 28, borderRadius: '100px', p: 0,
              bgcolor: BRAND, color: '#fff', flexShrink: 0,
              '&:hover': { bgcolor: brand.accentHover },
            }}>
              <AddIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        </Box>
        <Box sx={{ px: '8px', pb: '8px' }}>
          <TreeContent {...treeContentProps} />
        </Box>
        {dialogs}
      </>
    );
  }

  // ── Standalone mode — own container + header ──────────────────────────────
  return (
    <Box sx={{
      width: 320, height: '100%', flexShrink: 0,
      display: 'flex', flexDirection: 'column',
      bgcolor: '#ffffff', borderRadius: '16px', overflow: 'hidden',
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', px: '12px', pt: '14px', pb: '10px', flexShrink: 0 }}>
        <Typography sx={{ flex: 1, fontSize: 16, fontWeight: 500, color: TEXT_MAIN }}>
          Folders
        </Typography>
        <Tooltip title="Close panel" placement="bottom">
          <IconButton size="small" onClick={onClose} sx={{ width: 28, height: 28, borderRadius: '100px', p: 0, color: TEXT_DIM, '&:hover': { bgcolor: surfaceTokens.canvas, color: TEXT_MAIN } }}>
            <CloseIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px', px: '12px', pb: '16px', flexShrink: 0 }}>
        <Box sx={{
          flex: 1, display: 'flex', alignItems: 'center', gap: '6px',
          height: 32, borderRadius: '100px', border: `1px solid ${DIVIDER}`,
          bgcolor: surfaceTokens.inputBackground, px: '10px',
          transition: 'border-color 0.15s',
          '&:focus-within': { borderColor: BRAND },
        }}>
          <SearchIcon sx={{ fontSize: 24, color: ink.tertiary, flexShrink: 0 }} />
          <InputBase
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Find folder"
            inputProps={{ 'aria-label': 'Find folder' }}
            sx={{
              flex: 1, fontSize: 12, color: TEXT_MAIN,
              '& input': { p: 0 },
              '& input::placeholder': { color: ink.tertiary, opacity: 1, fontSize: 14 },
            }}
          />
        </Box>
        <Tooltip title="New folder" placement="bottom">
          <IconButton size="small" aria-label="New folder" sx={{
            width: 28, height: 28, borderRadius: '100px', p: 0,
            bgcolor: BRAND, color: '#fff', flexShrink: 0,
            '&:hover': { bgcolor: brand.accentHover },
          }}>
            <AddIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>
      </Box>

      <Box sx={{
        flex: 1, overflowY: 'auto', px: '8px',
        '&::-webkit-scrollbar': { width: 4 },
        '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
        '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(0,0,0,0.15)', borderRadius: 2 },
      }}>
        <TreeContent {...treeContentProps} />
      </Box>

      {dialogs}
    </Box>
  );
}
