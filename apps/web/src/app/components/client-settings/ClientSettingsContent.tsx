// TODO: port full implementation from vw-funds-2
// Stub: renders the ClientSettings shell with nav sidebar and Global AI Configs
// list placeholder. Full DataGrid, NewGlobalAIConfigContent, VinsAppliedTab,
// SideSheet sub-components are stubbed.
import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Divider from '@mui/material/Divider';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import { BreadcrumbBar } from '../BreadcrumbBar';
import { Snackbar } from './Snackbar';

// ─── Nav ──────────────────────────────────────────────────────────────────────

const CLIENT_SETTINGS_NAV = [
  { id: 'accounts', label: 'Accounts' },
  { id: 'ad-shell-configurations', label: 'Ad Shell Configurations' },
  { id: 'brand-kits', label: 'Brand Kits' },
  { id: 'billing', label: 'Billing' },
  { id: 'dashboards', label: 'Dashboards' },
  { id: 'features', label: 'Features' },
  { id: 'fields', label: 'Fields' },
  { id: 'integrations', label: 'Integrations' },
  { id: 'prompts', label: 'Prompts' },
  { id: 'tags', label: 'Tags' },
  { id: 'users', label: 'Users' },
  { id: 'global-ai-configs', label: 'Global AI Configs' },
  { id: 'settings', label: 'Settings' },
] as const;

type NavItem = (typeof CLIENT_SETTINGS_NAV)[number]['id'];

// ─── ClientSettingsContent ─────────────────────────────────────────────────────

interface ClientSettingsContentProps {
  initialSection?: string;
  openConfigId?: string | null;
  onConfigOpened?: () => void;
}

export function ClientSettingsContent({ initialSection }: ClientSettingsContentProps) {
  const [activeNavItem, setActiveNavItem] = useState<NavItem>((initialSection as NavItem) ?? 'global-ai-configs');
  const [search, setSearch] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [sideSheetOpen, setSideSheetOpen] = useState(true);

  return (
    <Box sx={{ flex: 1, display: 'flex', height: '100%', minWidth: 0, overflow: 'hidden', position: 'relative' }}>
      {/* Sidebar nav */}
      {sideSheetOpen && (
        <Box
          sx={{
            width: 240, flexShrink: 0, height: '100%', overflow: 'auto',
            bgcolor: 'white', borderRadius: 2, mr: '8px',
            boxShadow: '0px 1px 3px rgba(0,0,0,0.08)', border: '1px solid rgba(0,0,0,0.04)',
            display: 'flex', flexDirection: 'column',
          }}
        >
          <Box sx={{ px: '16px', py: '12px', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
            <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'text.primary' }}>Client Settings</Typography>
          </Box>
          <Box sx={{ py: '8px' }}>
            {CLIENT_SETTINGS_NAV.map(item => (
              <Box
                key={item.id}
                component="button"
                onClick={() => setActiveNavItem(item.id)}
                sx={{
                  display: 'flex', alignItems: 'center', px: '16px', py: '8px',
                  border: 'none', textAlign: 'left', cursor: 'pointer',
                  bgcolor: activeNavItem === item.id ? 'rgba(71,59,171,0.08)' : 'transparent',
                  color: activeNavItem === item.id ? '#473bab' : '#1f1d25',
                  borderRadius: '8px', mx: '4px', width: 'calc(100% - 8px)',
                  '&:hover': { bgcolor: activeNavItem === item.id ? 'rgba(71,59,171,0.1)' : 'rgba(0,0,0,0.04)' },
                  transition: 'background 0.1s',
                }}
              >
                <Typography sx={{ fontSize: '0.875rem', fontWeight: activeNavItem === item.id ? 500 : 400, letterSpacing: '0.15px', color: 'inherit' }}>
                  {item.label}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {/* Main content */}
      <Box sx={{ flex: 1, minWidth: 0, height: '100%', bgcolor: 'white', borderRadius: 2, overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0px 1px 3px rgba(0,0,0,0.08)', border: '1px solid rgba(0,0,0,0.04)' }}>
        {/* Header */}
        <Box sx={{ flexShrink: 0, px: '16px', pt: '12px', pb: 0 }}>
          <BreadcrumbBar items={[{ label: 'Settings' }]} activeLabel={CLIENT_SETTINGS_NAV.find(n => n.id === activeNavItem)?.label ?? 'Global AI Configs'} />

          {/* Toolbar */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', py: '12px' }}>
            <Button
              onClick={() => { setSnackbarOpen(true); setTimeout(() => setSnackbarOpen(false), 5000); }}
              startIcon={<AddIcon />}
              variant="contained"
              sx={{ bgcolor: 'primary.main', borderRadius: '100px', textTransform: 'none', '&:hover': { bgcolor: 'primary.dark' }, fontSize: '0.8125rem', fontWeight: 500, letterSpacing: '0.46px', flexShrink: 0 }}
            >
              New Global AI Config
            </Button>
            <TextField
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Find below"
              size="small"
              sx={{ width: 200 }}
              InputProps={{
                startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 18, color: 'rgba(17,16,20,0.56)' }} /></InputAdornment>,
                sx: { borderRadius: '20px', fontSize: '0.875rem', bgcolor: 'surface.inputBackground' },
              }}
            />
            <Box sx={{ ml: 'auto' }}>
              <Typography sx={{ fontSize: '0.6875rem', color: 'text.secondary' }}>0 Items</Typography>
            </Box>
          </Box>
          <Divider />
        </Box>

        {/* Content area */}
        <Box sx={{ flex: 1, overflow: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Box sx={{ textAlign: 'center', py: '48px' }}>
            <Typography sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
              {CLIENT_SETTINGS_NAV.find(n => n.id === activeNavItem)?.label} content
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: 'text.disabled', mt: '4px' }}>
              Full implementation from vw-funds-2 pending port
            </Typography>
          </Box>
        </Box>
      </Box>

      <Snackbar
        open={snackbarOpen}
        onClose={() => setSnackbarOpen(false)}
        message="Global AI Config saved successfully."
        actionLabel="Dismiss"
        onAction={() => setSnackbarOpen(false)}
      />
    </Box>
  );
}
