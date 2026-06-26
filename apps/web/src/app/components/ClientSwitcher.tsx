import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import InputBase from '@mui/material/InputBase';
import SearchIcon from '@mui/icons-material/Search';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import IconButton from '@mui/material/IconButton';
import Slide from '@mui/material/Slide';

// ─── Logos ─────────────────────────────────────────────────────────────────
const audiLogoOEM = 'https://res.cloudinary.com/dvq75cqna/image/upload/v1780071269/vw-funds/logos/Audi.png';
const rideNowLogo = 'https://res.cloudinary.com/dvq75cqna/image/upload/v1780071277/vw-funds/logos/RideNow.png';

const VW_LOGO_PATH = "M20 32.3229C13.2414 32.3229 7.70429 26.7586 7.70429 20C7.70429 18.48 7.97571 17.0414 8.49143 15.6843L15.6843 30.1514C15.7657 30.3414 15.9014 30.5043 16.1186 30.5043C16.3357 30.5043 16.4714 30.3414 16.5529 30.1514L19.8643 22.7414C19.8914 22.66 19.9457 22.5786 20.0271 22.5786C20.1086 22.5786 20.1357 22.66 20.19 22.7414L23.5014 30.1514C23.5829 30.3414 23.7186 30.5043 23.9357 30.5043C24.1529 30.5043 24.2886 30.3414 24.37 30.1514L31.5629 15.6843C32.0786 17.0414 32.35 18.48 32.35 20C32.2957 26.7586 26.7586 32.3229 20 32.3229ZM20 17.2043C19.9186 17.2043 19.8914 17.1229 19.8371 17.0414L15.9829 8.35571C17.2314 7.89428 18.5886 7.65 20 7.65C21.4114 7.65 22.7686 7.89428 24.0171 8.35571L20.1629 17.0414C20.1086 17.15 20.0814 17.2043 20 17.2043ZM16.0643 26.1343C15.9829 26.1343 15.9557 26.0529 15.9014 25.9714L9.65857 13.3771C10.7714 11.6671 12.2643 10.2286 14.0829 9.22429L18.5886 19.24C18.6429 19.4029 18.7786 19.4571 18.9143 19.4571H21.0857C21.2486 19.4571 21.3571 19.43 21.4386 19.24L25.9443 9.22429C27.7357 10.2286 29.2557 11.6671 30.3686 13.3771L24.0714 25.9714C24.0443 26.0529 23.99 26.1343 23.9086 26.1343C23.8271 26.1343 23.8 26.0529 23.7457 25.9714L21.3843 20.5971C21.3029 20.4071 21.1943 20.38 21.0314 20.38H18.86C18.6971 20.38 18.5886 20.4071 18.5071 20.5971L16.2271 25.9714C16.2 26.0529 16.1457 26.1343 16.0643 26.1343ZM20 33.5714C27.5186 33.5714 33.5714 27.5186 33.5714 20C33.5714 12.4814 27.5186 6.42857 20 6.42857C12.4814 6.42857 6.42857 12.4814 6.42857 20C6.42857 27.5186 12.4814 33.5714 20 33.5714Z";

// ─── Data ──────────────────────────────────────────────────────────────────
interface ClientEntry { id: string; name: string; active: boolean }

const RECENT_CLIENTS: ClientEntry[] = [
  { id: 'audi',     name: 'Audi',       active: true },
  { id: 'vw',       name: 'Volkswagen', active: true },
  { id: 'ride-now', name: 'Ride Now',   active: true },
];

// ─── ClientRow ──────────────────────────────────────────────────────────────
function getLogo(id: string, size = 32) {
  if (id === 'ride-now') return <img src={rideNowLogo} alt="Ride Now" width={size} height={size} style={{ borderRadius: 4, objectFit: 'cover', display: 'block' }} />;
  if (id === 'vw') return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="4" fill="white" />
      <path d={VW_LOGO_PATH} fill="#1F1D25" />
    </svg>
  );
  if (id === 'audi') return <img src={audiLogoOEM} alt="Audi" width={size} height={size} style={{ borderRadius: 4, objectFit: 'cover', display: 'block' }} />;
  const initials = id.split('-').slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('');
  return (
    <Box sx={{ width: size, height: size, bgcolor: '#3a3a3a', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: size * 0.35, fontWeight: 500, flexShrink: 0, userSelect: 'none' }}>
      {initials}
    </Box>
  );
}

function ClientRow({ entry, currentClientId, onSelect }: { entry: ClientEntry; currentClientId: string; onSelect: (id: string) => void }) {
  const isSelected = entry.id === currentClientId;
  return (
    <Box
      onClick={() => entry.active && onSelect(entry.id)}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        px: '12px',
        py: '8px',
        borderRadius: '8px',
        cursor: entry.active ? 'pointer' : 'not-allowed',
        opacity: entry.active ? 1 : 0.4,
        bgcolor: isSelected && entry.active ? 'rgba(255,255,255,0.1)' : 'transparent',
        '&:hover': entry.active ? { bgcolor: 'rgba(255,255,255,0.1)' } : {},
        transition: 'background 0.15s',
      }}
    >
      <Box sx={{ flexShrink: 0 }}>{getLogo(entry.id)}</Box>
      <Typography sx={{ color: 'white', fontSize: '13px', fontWeight: 400, letterSpacing: '0.15px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {entry.name}
      </Typography>
      {isSelected && entry.active && (
        <Box sx={{ ml: 'auto', width: 6, height: 6, borderRadius: '50%', bgcolor: '#ACABFF', flexShrink: 0 }} />
      )}
    </Box>
  );
}

// ─── ClientSwitcher ──────────────────────────────────────────────────────────
interface ClientSwitcherProps {
  isOpen: boolean;
  onClose: () => void;
  currentClientId: string;
  onSelect: (clientId: string) => void;
}

export function ClientSwitcher({ isOpen, onClose, currentClientId, onSelect }: ClientSwitcherProps) {
  const [query, setQuery] = useState('');

  const filtered = (entries: ClientEntry[]) =>
    query.trim() === '' ? entries : entries.filter(e => e.name.toLowerCase().includes(query.toLowerCase()));

  const handleSelect = (id: string) => { onSelect(id); onClose(); };

  return (
    <>
      {isOpen && (
        <Box sx={{ position: 'fixed', inset: 0, zIndex: 105 }} onClick={onClose} />
      )}
      <Slide direction="right" in={isOpen} mountOnEnter unmountOnExit>
        <Box
          sx={{
            position: 'fixed',
            left: 72,
            top: 0,
            bottom: 0,
            width: 240,
            bgcolor: '#1e1a42',
            zIndex: 110,
            display: 'flex',
            flexDirection: 'column',
            boxShadow: 8,
          }}
        >
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px', px: '16px', height: 60, flexShrink: 0, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <IconButton onClick={onClose} size="small" sx={{ color: 'rgba(255,255,255,0.7)', '&:hover': { color: 'white' } }}>
              <ArrowBackIcon sx={{ fontSize: 18 }} />
            </IconButton>
            <Typography sx={{ color: 'white', fontWeight: 600, fontSize: '14px', letterSpacing: '0.1px' }}>
              Switch Client
            </Typography>
          </Box>

          {/* Search */}
          <Box sx={{ px: '12px', pt: '12px', pb: '8px', flexShrink: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', bgcolor: 'rgba(255,255,255,0.1)', borderRadius: '8px', px: '12px', py: '8px' }}>
              <SearchIcon sx={{ color: 'rgba(255,255,255,0.5)', fontSize: 16, flexShrink: 0 }} />
              <InputBase
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="search"
                sx={{ color: 'white', fontSize: '13px', flex: 1, '& ::placeholder': { color: 'rgba(255,255,255,0.4)' } }}
              />
            </Box>
          </Box>

          {/* List */}
          <Box sx={{ flex: 1, overflow: 'auto', px: '8px', pb: '16px' }}>
            {filtered(RECENT_CLIENTS).length > 0 && (
              <Box sx={{ mb: '4px' }}>
                <Typography sx={{ px: '12px', py: '6px', fontSize: '11px', fontWeight: 500, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                  Recent Clients
                </Typography>
                {filtered(RECENT_CLIENTS).map(entry => (
                  <ClientRow key={entry.id} entry={entry} currentClientId={currentClientId} onSelect={handleSelect} />
                ))}
              </Box>
            )}
          </Box>
        </Box>
      </Slide>
    </>
  );
}
