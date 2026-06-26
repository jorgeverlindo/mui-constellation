import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useTranslation } from '../app/contexts/LanguageContext';

/**
 * Placeholder body shared by every tab screen (Fase 3 will replace these
 * with the real ported screens).
 */
export function PlaceholderScreen({ title }: { title: string }) {
  const { t } = useTranslation();
  return (
    <Box
      sx={{
        flex: 1,
        minHeight: 0,
        overflowY: 'auto',
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        gap: 0.5,
      }}
    >
      <Typography sx={{ fontSize: 18, fontWeight: 500, color: 'text.primary' }}>
        {t(title)}
      </Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        Em construção — Fase 3
      </Typography>
    </Box>
  );
}
