// TODO: port full implementation from vw-funds-2
// Stub: renders compact table-small view. Prop interface mirrors source.
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Checkbox from '@mui/material/Checkbox';
import Switch from '@mui/material/Switch';
import type { VinInventoryRecord, SyndicationStatus, AIGenerationStatus } from '../../../data/inventory/vehicleInventory';

interface VehicleTableCondensedProps {
  records: VinInventoryRecord[];
  selected: Set<string>;
  onToggleRow: (id: string, checked: boolean) => void;
  onToggleAll: (checked: boolean) => void;
  onVinClick: (id: string) => void;
  onSyndicationToggle: (id: string) => void;
  onAiGenerationToggle: (id: string) => void;
  onViewSourceImages?: (id: string) => void;
  onAttachComment?: (id: string) => void;
}

export function VehicleTableCondensed({
  records,
  selected,
  onToggleRow,
  onToggleAll,
  onVinClick,
  onSyndicationToggle,
  onAiGenerationToggle,
}: VehicleTableCondensedProps) {
  const allIds = records.map(r => r.id);
  const allSelected = allIds.length > 0 && allIds.every(id => selected.has(id));

  return (
    <Box sx={{ overflowX: 'auto', flex: 1 }}>
      <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
        <Box component="thead" sx={{ position: 'sticky', top: 0, bgcolor: '#f8f8fb', zIndex: 1, borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
          <Box component="tr">
            <Box component="th" sx={{ width: 36, px: 0.5, textAlign: 'center' }}>
              <Checkbox
                size="small"
                checked={allSelected}
                indeterminate={selected.size > 0 && !allSelected}
                onChange={e => onToggleAll(e.target.checked)}
              />
            </Box>
            {['Vehicle', 'VIN', 'Price', 'AI', 'Status'].map(h => (
              <Box key={h} component="th" sx={{ py: 0.75, px: 1, textAlign: 'left', fontWeight: 600, fontSize: 10, letterSpacing: '0.4px', color: 'text.secondary' }}>
                {h}
              </Box>
            ))}
          </Box>
        </Box>
        <Box component="tbody">
          {records.map(record => (
            <Box
              key={record.id}
              component="tr"
              onClick={() => onVinClick(record.id)}
              sx={{
                cursor: 'pointer',
                borderBottom: '1px solid rgba(0,0,0,0.06)',
                bgcolor: selected.has(record.id) ? 'rgba(71,59,171,0.04)' : 'white',
                '&:hover': { bgcolor: 'rgba(71,59,171,0.03)' },
              }}
            >
              <Box component="td" sx={{ px: 0.5, textAlign: 'center' }} onClick={e => e.stopPropagation()}>
                <Checkbox size="small" checked={selected.has(record.id)} onChange={e => onToggleRow(record.id, e.target.checked)} />
              </Box>
              <Box component="td" sx={{ px: 1, py: 0.75, fontWeight: 500, color: 'text.primary' }}>
                {record.year} {record.make} {record.model}
              </Box>
              <Box component="td" sx={{ px: 1, py: 0.75, fontFamily: 'monospace', fontSize: 10, color: 'text.secondary' }}>
                {record.vin}
              </Box>
              <Box component="td" sx={{ px: 1, py: 0.75, fontWeight: 600, color: 'text.primary' }}>
                ${record.price.toLocaleString()}
              </Box>
              <Box component="td" sx={{ px: 0.5, py: 0.5 }} onClick={e => e.stopPropagation()}>
                <Switch
                  size="small"
                  checked={record.aiGeneration === 'enabled'}
                  onChange={() => onAiGenerationToggle(record.id)}
                />
              </Box>
              <Box component="td" sx={{ px: 1, py: 0.75 }}>
                <Box sx={{
                  display: 'inline-flex', px: 0.75, py: 0.125, borderRadius: 0.75, fontSize: 10, fontWeight: 600,
                  bgcolor: record.vehicleStatus === 'On the lot' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                  color: record.vehicleStatus === 'On the lot' ? '#059669' : '#d97706',
                }}>
                  {record.vehicleStatus}
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
      {records.length === 0 && (
        <Box sx={{ py: 8, textAlign: 'center' }}>
          <Typography sx={{ color: 'text.secondary', fontSize: 14 }}>No vehicles match the current filters.</Typography>
        </Box>
      )}
    </Box>
  );
}
