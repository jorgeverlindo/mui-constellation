import Box from '@mui/material/Box';
import { useTranslation } from '../contexts/LanguageContext';

interface LanguageToggleButtonProps {
  active?: boolean;
}

export function LanguageToggleButton({ active = true }: LanguageToggleButtonProps) {
  const { language, setLanguage } = useTranslation();

  const toggleLanguage = () => {
    if (!active) return;
    setLanguage(language === 'en' ? 'fr' : 'en');
  };

  const label = language === 'en' ? 'FR' : 'EN';

  return (
    <Box
      component="button"
      onClick={toggleLanguage}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        px: '3px',
        py: '2px',
        borderRadius: '4px',
        height: 22,
        width: 28,
        flexShrink: 0,
        cursor: active ? 'pointer' : 'default',
        opacity: active ? 1 : 0.5,
        border: '1px solid rgba(17,16,20,0.56)',
        bgcolor: 'transparent',
        transition: 'all 0.15s',
        '&:hover': active ? {
          border: '1px solid rgba(17,16,20,0.8)',
          '& .lang-label': { color: 'rgba(17,16,20,0.8)' },
        } : {},
      }}
    >
      <Box
        className="lang-label"
        sx={{
          fontSize: '12px',
          fontWeight: 400,
          color: 'rgba(17,16,20,0.56)',
          letterSpacing: '0.17px',
          lineHeight: 1,
          transition: 'color 0.15s',
        }}
      >
        {label}
      </Box>
    </Box>
  );
}
