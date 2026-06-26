import { useState } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import CircularProgress from '@mui/material/CircularProgress';
import DownloadIcon from '@mui/icons-material/Download';
import ShareIcon from '@mui/icons-material/Share';
import { useTranslation } from '../contexts/LanguageContext';

interface GenerateReportMenuProps {
  onClose: () => void;
  onSelect: (item: string) => void;
  onShare: (reportName: string) => void;
  onDownload: (reportName: string) => void;
  downloadingReport: string | null;
}

const REPORT_ITEMS = [
  'Fund Utilization Report',
  'Fund Allocation Report',
  'Fund Usage Report',
  'Claim Submission Report',
  'Pre-approval Summary Report',
  'Payment Processing Report',
];

export function GenerateReportMenu({ onClose, onSelect, onShare, onDownload, downloadingReport }: GenerateReportMenuProps) {
  const { t } = useTranslation();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  return (
    <Paper
      elevation={6}
      sx={{
        position: 'absolute',
        top: '100%',
        left: 0,
        mt: '4px',
        width: 260,
        borderRadius: 3,
        border: '1px solid rgba(0,0,0,0.10)',
        py: '6px',
        zIndex: 50,
        overflow: 'hidden',
      }}
    >
      {REPORT_ITEMS.map(item => (
        <Box
          key={item}
          onMouseEnter={() => setHoveredItem(item)}
          onMouseLeave={() => setHoveredItem(null)}
          sx={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            px: '16px',
            py: '10px',
            cursor: 'pointer',
            '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' },
            transition: 'background 0.15s',
          }}
          onClick={() => { onSelect(item); onClose(); }}
        >
          <Typography sx={{ flex: 1, fontSize: '13px', color: 'text.primary', letterSpacing: '0.15px', lineHeight: 1.5, pr: '8px' }}>
            {t(item)}
          </Typography>

          {/* Action icons — visible on hover */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              flexShrink: 0,
              opacity: hoveredItem === item ? 1 : 0,
              pointerEvents: hoveredItem === item ? 'auto' : 'none',
              transition: 'opacity 0.2s',
            }}
            onClick={e => e.stopPropagation()}
          >
            <Tooltip title="Download PDF" placement="top">
              <span>
                <IconButton
                  size="small"
                  onClick={() => { onDownload(item); }}
                  disabled={downloadingReport !== null}
                  sx={{ width: 28, height: 28, color: 'text.secondary', '&:hover': { bgcolor: 'rgba(0,0,0,0.08)', color: 'text.primary' }, '&.Mui-disabled': { opacity: 0.5 } }}
                >
                  {downloadingReport === item
                    ? <CircularProgress size={14} />
                    : <DownloadIcon sx={{ fontSize: 14 }} />}
                </IconButton>
              </span>
            </Tooltip>

            <Tooltip title="Share" placement="top">
              <IconButton
                size="small"
                onClick={() => onShare(item)}
                sx={{ width: 28, height: 28, color: 'text.secondary', '&:hover': { bgcolor: 'rgba(0,0,0,0.08)', color: 'primary.main' } }}
              >
                <ShareIcon sx={{ fontSize: 14 }} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      ))}
    </Paper>
  );
}
