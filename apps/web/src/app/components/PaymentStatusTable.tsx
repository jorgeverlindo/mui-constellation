import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import OutlinedInput from '@mui/material/OutlinedInput';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import SearchIcon from '@mui/icons-material/Search';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useTranslation } from '../contexts/LanguageContext';
import { usePaymentTransactions } from '../../data/access/usePaymentTransactions';
import { useOverviewData } from '../../data/access/useOverviewData';
import { StatusChip } from './StatusChip';

const fmt = (n: number) =>
  '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function PaymentStatusTable() {
  const { t } = useTranslation();
  const { rows: paymentData } = usePaymentTransactions();
  const { kpis } = useOverviewData();
  const [search, setSearch] = useState('');

  const filtered = paymentData.filter(row =>
    !search || row.id?.toLowerCase().includes(search.toLowerCase()) || row.status?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <Box sx={{ bgcolor: 'background.paper', borderRadius: 3, p: 2, border: '1px solid rgba(0,0,0,0.12)' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Typography sx={{ fontSize: '16px', fontWeight: 500, color: 'text.primary', letterSpacing: '0.15px' }}>
            {t('Payment Status')}
          </Typography>
          <OutlinedInput
            size="small"
            placeholder={t('Find below')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            startAdornment={
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
              </InputAdornment>
            }
            sx={{
              width: 200,
              borderRadius: '20px',
              bgcolor: 'surface.inputBackground',
              fontSize: '14px',
              '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0,0,0,0.12)' },
              '& input': { py: '6px', px: 0 },
            }}
          />
        </Box>
        <Typography sx={{ fontSize: '11px', color: 'text.secondary', letterSpacing: '0.4px' }}>
          {t('Total')} <Box component="span" sx={{ color: 'text.primary' }}>{fmt(kpis.currentBalance)}</Box>
        </Typography>
      </Box>

      <Box sx={{ border: '1px solid rgba(0,0,0,0.12)', borderRadius: 2, overflow: 'hidden' }}>
        <Table size="small" sx={{ tableLayout: 'fixed', width: '100%' }}>
          <colgroup>
            <col style={{ width: '22%' }} />
            <col style={{ width: '26%' }} />
            <col style={{ width: '26%' }} />
            <col style={{ width: '26%' }} />
          </colgroup>
          <TableHead>
            <TableRow sx={{ bgcolor: 'surface.inputBackground', borderBottom: '1px solid rgba(0,0,0,0.12)' }}>
              <TableCell sx={{ py: 1.5, px: 2 }}>
                <Typography sx={{ fontSize: '12px', fontWeight: 500, color: 'text.secondary', letterSpacing: '0.15px' }}>
                  {t('Claim ID')}
                </Typography>
              </TableCell>
              <TableCell sx={{ py: 1.5, px: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                  <Typography sx={{ fontSize: '12px', fontWeight: 500, color: 'text.secondary', letterSpacing: '0.15px' }}>
                    {t('Amount')}
                  </Typography>
                  <KeyboardArrowDownIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                </Box>
              </TableCell>
              <TableCell sx={{ py: 1.5, px: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                  <Typography sx={{ fontSize: '12px', fontWeight: 500, color: 'text.secondary', letterSpacing: '0.15px' }}>
                    {t('Date paid')}
                  </Typography>
                  <KeyboardArrowDownIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                </Box>
              </TableCell>
              <TableCell sx={{ py: 1.5, px: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                  <Typography sx={{ fontSize: '12px', fontWeight: 500, color: 'text.secondary', letterSpacing: '0.15px' }}>
                    {t('Status')}
                  </Typography>
                  <KeyboardArrowDownIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                </Box>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((row, index) => (
              <TableRow
                key={row.id || index}
                sx={{
                  borderBottom: '1px solid rgba(0,0,0,0.12)',
                  '&:last-child td': { borderBottom: 0 },
                  '&:hover': { bgcolor: 'rgba(249,250,250,0.5)' },
                  transition: 'background-color 0.15s',
                }}
              >
                <TableCell sx={{ py: 1.5, px: 2 }}>
                  <Typography sx={{ fontSize: '12px', fontWeight: 500, color: 'primary.main', letterSpacing: '0.17px' }}>
                    {row.id || '—'}
                  </Typography>
                </TableCell>
                <TableCell sx={{ py: 1.5, px: 2 }}>
                  <Typography sx={{ fontSize: '12px', color: 'text.primary', letterSpacing: '0.17px' }}>
                    {row.amount}
                  </Typography>
                </TableCell>
                <TableCell sx={{ py: 1.5, px: 2 }}>
                  <Typography sx={{ fontSize: '12px', color: 'text.primary', letterSpacing: '0.17px' }}>
                    {row.datePaid}
                  </Typography>
                </TableCell>
                <TableCell sx={{ py: 1.5, px: 2 }}>
                  <StatusChip status={row.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    </Box>
  );
}
