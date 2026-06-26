import { useState, useRef, useEffect } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { GenerateReportMenu } from './GenerateReportMenu';
import { ShareReportModal } from './ShareReportModal';
import { ActivityMonitor } from './ActivityMonitor';
import { useTranslation } from '../contexts/LanguageContext';

// Stub for useReportDownload — replace with real import when available
function useReportDownload() {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadingReport, setDownloadingReport] = useState<string | null>(null);
  const [monitor, setMonitor] = useState<null | { stage: 'preparing' | 'complete' | 'error' | 'cancelled'; reportName: string; displayName: string; blobUrl: string | null }>(null);

  const triggerDownload = (report: string) => {
    setDownloadingReport(report);
    setIsDownloading(true);
    setMonitor({ stage: 'preparing', reportName: report, displayName: `${report}.pdf`, blobUrl: null });
    setTimeout(() => {
      setMonitor(m => m ? { ...m, stage: 'complete' } : m);
      setIsDownloading(false);
      setDownloadingReport(null);
    }, 2000);
  };

  const closeMonitor = () => setMonitor(null);

  return { triggerDownload, isDownloading, downloadingReport, monitor, closeMonitor };
}

export function GenerateReportSplitButton() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [shareReport, setShareReport] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { triggerDownload, isDownloading, downloadingReport, monitor, closeMonitor } = useReportDownload();

  const prevDownloading = useRef(false);
  useEffect(() => {
    if (prevDownloading.current && !isDownloading) setIsOpen(false);
    prevDownloading.current = isDownloading;
  }, [isDownloading]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (shareReport !== null || isDownloading) return;
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [shareReport, isDownloading]);

  return (
    <>
      <Box ref={containerRef} sx={{ position: 'relative', display: 'inline-block' }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'stretch',
            borderRadius: '100px',
            border: '1px solid rgba(99,86,225,0.5)',
            overflow: 'hidden',
            bgcolor: 'background.paper',
            height: 40,
            '&:hover': { bgcolor: 'surface.inputBackground' },
            transition: 'background 0.15s',
          }}
        >
          {/* Primary action */}
          <Button
            onClick={() => setIsOpen(v => !v)}
            disableRipple
            sx={{
              px: '16px',
              fontSize: '13px',
              fontWeight: 500,
              color: 'primary.main',
              letterSpacing: '0.46px',
              borderRadius: 0,
              textTransform: 'none',
              '&:hover': { bgcolor: 'rgba(71,59,171,0.04)' },
            }}
          >
            {t('Generate Report')}
          </Button>

          {/* Divider */}
          <Box sx={{ width: '1px', bgcolor: 'rgba(99,86,225,0.5)', my: '1px' }} />

          {/* Chevron */}
          <Button
            onClick={() => setIsOpen(v => !v)}
            disableRipple
            aria-expanded={isOpen}
            aria-haspopup="true"
            sx={{
              px: '8px',
              minWidth: 'unset',
              color: 'primary.main',
              borderRadius: 0,
              '&:hover': { bgcolor: 'rgba(71,59,171,0.04)' },
            }}
          >
            <svg style={{ width: 20, height: 20 }} viewBox="0 0 20 20" fill="currentColor">
              <path d="M5.5 8l4.5 4.5 4.5-4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
          </Button>
        </Box>

        {isOpen && (
          <GenerateReportMenu
            onClose={() => setIsOpen(false)}
            onSelect={() => {}}
            onShare={(report) => { setShareReport(report); setIsOpen(false); }}
            onDownload={(report) => { triggerDownload(report); setIsOpen(false); }}
            downloadingReport={downloadingReport}
          />
        )}
      </Box>

      <ShareReportModal
        isOpen={shareReport !== null}
        reportName={shareReport ?? ''}
        onClose={() => setShareReport(null)}
      />

      {monitor && (
        <ActivityMonitor {...monitor} onClose={closeMonitor} />
      )}
    </>
  );
}
