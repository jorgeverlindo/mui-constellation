import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import SearchIcon from '@mui/icons-material/Search';
import { useTranslation } from '../contexts/LanguageContext';
import { usePaymentTransactions } from '../../data/access/usePaymentTransactions';
import { useOverviewData } from '../../data/access/useOverviewData';
import { StatusChip } from './StatusChip';

const fmt = (n: number) => '$' + n.toLocaleString('en-US', { maximumFractionDigits: 0 });

export function PaymentStatusTableCard({ variant = 'dealer' }: { variant?: 'dealer' | 'oem' }) {
  const { t } = useTranslation();
  const { rows: data } = usePaymentTransactions();
  const { kpis } = useOverviewData();

  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        borderRadius: 3,
        overflow: 'clip',
        border: '1px solid rgba(0,0,0,0.12)',
        display: 'flex',
        flexDirection: 'column',
        height: 400,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          alignItems: 'flex-start',
          pt: 1.5,
          pb: 0,
          px: 1.5,
          flexShrink: 0,
        }}
      >
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', width: '100%' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', height: 34, pr: 1 }}>
            <Typography
              sx={{
                fontWeight: 500,
                lineHeight: '24px',
                color: 'text.primary',
                fontSize: '1rem',
                letterSpacing: '0.15px',
              }}
            >
              {variant === 'oem' ? t('Payouts') : t('Payment Status')}
            </Typography>
          </Box>
          <Box
            sx={{
              bgcolor: 'surface.inputBackground',
              display: 'flex',
              flexDirection: 'column',
              height: 34,
              alignItems: 'flex-start',
              justifyContent: 'center',
              px: 1,
              py: 0,
              position: 'relative',
              borderRadius: '20px',
              flexShrink: 0,
              width: 200,
              border: '1px solid rgba(0,0,0,0.12)',
            }}
          >
            <Box sx={{ display: 'flex', flex: 1, gap: 1, alignItems: 'center', overflow: 'clip', px: 0, py: 1, width: '100%' }}>
              <SearchIcon sx={{ width: 24, height: 24, color: 'rgba(0,0,0,0.56)' }} />
              <Typography sx={{ flex: 1, color: 'text.disabled', fontSize: '14px', letterSpacing: '0.15px', lineHeight: 1.5 }}>
                {t('Search anything')}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Total */}
        <Box sx={{ display: 'flex', gap: '3px', alignItems: 'flex-start', flexShrink: 0 }}>
          <Typography sx={{ color: 'text.primary', fontSize: '11px', letterSpacing: '0.4px', lineHeight: 1.66 }}>
            {t('Total Balance')}
          </Typography>
          <Typography sx={{ color: 'text.secondary', fontSize: '11px', letterSpacing: '0.4px', lineHeight: 1.66 }}>
            {fmt(kpis.currentBalance)}
          </Typography>
        </Box>
      </Box>

      {/* Table */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          pb: 1,
          pt: 0.5,
          px: 1.5,
          flexShrink: 0,
          width: '100%',
          flex: 1,
          overflow: 'hidden',
          minHeight: 0,
        }}
      >
        <Box sx={{ width: '100%', overflowY: 'auto', minHeight: 0, flex: 1 }}>
          <Table size="small" sx={{ tableLayout: 'fixed', width: '100%' }}>
            <colgroup>
              <col style={{ width: '25%' }} />
              <col style={{ width: '25%' }} />
              <col style={{ width: '25%' }} />
              <col style={{ width: '25%' }} />
            </colgroup>
            <TableHead>
              <TableRow
                sx={{
                  position: 'sticky',
                  top: 0,
                  bgcolor: 'background.paper',
                  zIndex: 10,
                  '& th': { borderBottom: '1px solid rgba(0,0,0,0.12)' },
                }}
              >
                <TableCell sx={{ py: 1, px: 1.5 }}>
                  <Typography sx={{ fontWeight: 500, color: 'text.secondary', fontSize: '12px', letterSpacing: '0.15px' }}>
                    Claim ID
                  </Typography>
                </TableCell>
                <TableCell sx={{ py: 1, px: 1.5 }}>
                  <Typography sx={{ fontWeight: 500, color: 'text.secondary', fontSize: '12px', letterSpacing: '0.15px' }}>
                    {t('Amount')}
                  </Typography>
                </TableCell>
                <TableCell sx={{ py: 1, px: 1.5 }}>
                  <Typography sx={{ fontWeight: 500, color: 'text.secondary', fontSize: '12px', letterSpacing: '0.15px' }}>
                    {t('Date paid')}
                  </Typography>
                </TableCell>
                <TableCell sx={{ py: 1, px: 1.5 }}>
                  <Typography sx={{ fontWeight: 500, color: 'text.secondary', fontSize: '12px', letterSpacing: '0.15px' }}>
                    {t('Status')}
                  </Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((row, index) => (
                <TableRow
                  key={row.id || index}
                  sx={{
                    '& td': { borderBottom: '1px solid rgba(0,0,0,0.12)' },
                    '&:last-child td': { borderBottom: 0 },
                  }}
                >
                  <TableCell sx={{ py: 1, px: 1.5 }}>
                    <Typography
                      noWrap
                      sx={{ fontWeight: 500, color: 'primary.main', fontSize: '12px', letterSpacing: '0.17px', display: 'block' }}
                    >
                      {row.id || '—'}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ py: 1, px: 1.5 }}>
                    <Typography noWrap sx={{ color: 'text.primary', fontSize: '12px', letterSpacing: '0.17px', display: 'block' }}>
                      {row.amount}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ py: 1, px: 1.5 }}>
                    <Typography noWrap sx={{ color: 'text.primary', fontSize: '12px', letterSpacing: '0.17px', display: 'block' }}>
                      {row.datePaid}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ py: 1, px: 1.5 }}>
                    <StatusChip status={row.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </Box>
    </Box>
  );
}
