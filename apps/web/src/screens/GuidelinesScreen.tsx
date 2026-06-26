import Box from '@mui/material/Box';
import { GuidelinesContent } from '../app/components/GuidelinesContent';

export function GuidelinesScreen() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <GuidelinesContent />
    </Box>
  );
}
