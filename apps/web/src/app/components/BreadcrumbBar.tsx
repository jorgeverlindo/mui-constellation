import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useTranslation } from '../contexts/LanguageContext';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
}

interface BreadcrumbBarProps {
  items: BreadcrumbItem[];
  activeLabel: string;
}

const SEP_SX = { fontSize: 14, color: 'text.disabled', flexShrink: 0 };

export function BreadcrumbBar({ items, activeLabel }: BreadcrumbBarProps) {
  const { t, language } = useTranslation();
  const translate = (s: string) => (language === 'fr' ? t(s) : s);

  const linkSx = {
    fontSize: '11px',
    color: 'text.secondary',
    fontWeight: 400,
    letterSpacing: '0.4px',
    cursor: 'pointer',
    textDecoration: 'none',
    background: 'none',
    border: 'none',
    padding: 0,
    fontFamily: 'inherit',
    '&:hover': { color: 'text.primary' },
    transition: 'color 0.15s',
  };

  return (
    <Box component="nav" aria-label="Breadcrumb">
      <Box component="ol" sx={{ display: 'flex', alignItems: 'center', gap: '2px', flexWrap: 'wrap', m: 0, p: 0, listStyle: 'none' }}>
        {items.map((item, i) => (
          <Box component="li" key={i} sx={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
            {i > 0 && <ChevronRightIcon sx={SEP_SX} />}
            {item.href ? (
              <Box component="a" href={item.href} onClick={item.onClick} sx={linkSx}>
                {translate(item.label)}
              </Box>
            ) : item.onClick ? (
              <Box component="button" onClick={item.onClick} sx={linkSx}>
                {translate(item.label)}
              </Box>
            ) : (
              <Typography sx={{ fontSize: '11px', color: 'text.secondary', fontWeight: 400, letterSpacing: '0.4px' }}>
                {translate(item.label)}
              </Typography>
            )}
          </Box>
        ))}
        <Box component="li" sx={{ display: 'flex', alignItems: 'center', gap: '2px' }} aria-current="page">
          <ChevronRightIcon sx={SEP_SX} />
          <Typography sx={{ fontSize: '11px', color: 'text.primary', fontWeight: 500, letterSpacing: '0.4px' }}>
            {translate(activeLabel)}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
