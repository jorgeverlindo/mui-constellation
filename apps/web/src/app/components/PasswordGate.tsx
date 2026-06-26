import { useState } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { keyframes } from '@mui/system';
import { ConstellationLogo } from './ConstellationLogo';
import { STORAGE_KEYS, ACCESS_PASSWORD } from '../constants/storageKeys';

const shakeAnim = keyframes`
  0%,100% { transform: translateX(0) }
  20%     { transform: translateX(-7px) }
  40%     { transform: translateX(7px) }
  60%     { transform: translateX(-4px) }
  80%     { transform: translateX(4px) }
`;

export function PasswordGate({ children }: { children: React.ReactNode }) {
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');
  const [unlocked, setUnlocked] = useState(
    () => localStorage.getItem(STORAGE_KEYS.ACCESS) === ACCESS_PASSWORD
  );
  const [value, setValue] = useState('');
  const [shake, setShake] = useState(false);

  const attempt = () => {
    if (value === ACCESS_PASSWORD) {
      localStorage.setItem(STORAGE_KEYS.ACCESS, value);
      setUnlocked(true);
    } else {
      setShake(true);
      setValue('');
      setTimeout(() => setShake(false), 500);
    }
  };

  if (unlocked) return <>{children}</>;

  const logoColor    = prefersDark ? '#ACABFF' : '#1f1d25';
  const pageBg       = prefersDark ? '#0f0e14' : '#f0eff5';
  const cardBg       = prefersDark ? '#1a1825' : '#ffffff';
  const cardBorder   = prefersDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
  const cardShadow   = prefersDark ? '0 24px 64px rgba(0,0,0,0.5)' : '0 8px 40px rgba(0,0,0,0.10)';
  const subtextColor = prefersDark ? '#9c99a9' : '#686576';
  const inputBg      = prefersDark ? '#0f0e14' : '#f5f4f9';
  const inputText    = prefersDark ? '#f9fafa' : '#1f1d25';
  const inputBorder  = prefersDark ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.12)';
  const inputBorderHover = prefersDark ? 'rgba(255,255,255,0.32)' : 'rgba(0,0,0,0.32)';
  const placeholderColor = prefersDark ? 'rgba(249,250,250,0.35)' : 'rgba(31,29,37,0.35)';

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: pageBg,
        transition: 'background-color 0.3s',
      }}
    >
      <Paper
        elevation={0}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '28px',
          p: '52px 44px',
          bgcolor: cardBg,
          border: `1px solid ${cardBorder}`,
          borderRadius: '24px',
          width: 360,
          boxShadow: cardShadow,
          transition: 'background-color 0.3s, box-shadow 0.3s',
        }}
      >
        <ConstellationLogo color={logoColor} height={28} />

        <Typography sx={{ fontSize: 13, color: subtextColor, letterSpacing: '0.01em' }}>
          Enter password to continue
        </Typography>

        <Box sx={{ width: '100%', animation: shake ? `${shakeAnim} 0.4s ease` : 'none' }}>
          <TextField
            type="password"
            placeholder="Password"
            fullWidth
            autoFocus
            value={value}
            onChange={e => setValue(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && attempt()}
            error={shake}
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: inputBg,
                color: inputText,
                '& fieldset': { borderColor: shake ? 'error.main' : inputBorder },
                '&:hover fieldset': { borderColor: shake ? 'error.main' : inputBorderHover },
                '&.Mui-focused fieldset': { borderColor: '#ACABFF' },
              },
              '& input': { color: inputText },
              '& input::placeholder': { color: placeholderColor, opacity: 1 },
            }}
          />
        </Box>

        <Button
          variant="contained"
          fullWidth
          size="large"
          onClick={attempt}
          sx={prefersDark ? {
            bgcolor: '#ACABFF',
            color: '#1f1d25',
            borderRadius: '10px',
            '&:hover': { bgcolor: 'rgba(172,171,255,0.85)' },
          } : {
            borderRadius: '10px',
          }}
        >
          Continue
        </Button>
      </Paper>
    </Box>
  );
}
