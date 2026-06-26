// TODO: port full implementation from vw-funds-2
// Stub: renders a basic table-large view. Prop interface mirrors source.
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Checkbox from '@mui/material/Checkbox';
import Switch from '@mui/material/Switch';
import type { VinInventoryRecord, SyndicationStatus, AIGenerationStatus } from '../../../data/inventory/vehicleInventory';

interface VehicleInventoryGridProps {
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

export function VehicleInventoryGrid({
  records,
  selected,
  onToggleRow,
  onToggleAll,
  onVinClick,
  onSyndicationToggle,
  onAiGenerationToggle,
}: VehicleInventoryGridProps) {
  const allIds = records.map(r => r.id);
  const allSelected = allIds.length > 0 && allIds.every((id: string) => selected.has(id));

  return (
    <Box sx={{ overflowX: 'auto', flex: 1 }}>
      <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, color: 'text.primary' }}>
        <Box component="thead" sx={{ position: 'sticky', top: 0, bgcolor: '#f8f8fb', zIndex: 1, borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
          <Box component="tr">
            <Box component="th" sx={{ width: 40, px: 1, textAlign: 'center' }}>
              <Checkbox
                size="small"
                checked={allSelected}
                indeterminate={selected.size > 0 && !allSelected}
                onChange={e => onToggleAll(e.target.checked)}
              />
            </Box>
            {['', 'VIN', 'Year / Make / Model', 'Trim', 'Price', 'AI Gen', 'Syndication', 'DOL', 'Status'].map(h => (
              <Box key={h} component="th" sx={{ py: 1, px: 1.5, textAlign: 'left', fontWeight: 600, fontSize: 11, letterSpacing: '0.4px', color: 'text.secondary', whiteSpace: 'nowrap' }}>
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
              <Box component="td" sx={{ px: 1, textAlign: 'center' }} onClick={e => e.stopPropagation()}>
                <Checkbox size="small" checked={selected.has(record.id)} onChange={e => onToggleRow(record.id, e.target.checked)} />
              </Box>
              <Box component="td" sx={{ px: 1, py: 1 }}>
                <Box
                  component="img"
                  src={record.thumbnail}
                  alt=""
                  sx={{ width: 64, height: 40, objectFit: 'cover', borderRadius: 1, display: 'block' }}
                  onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                />
              </Box>
              <Box component="td" sx={{ px: 1.5, py: 1, fontFamily: 'monospace', fontSize: 11 }}>{record.vin}</Box>
              <Box component="td" sx={{ px: 1.5, py: 1, fontWeight: 500 }}>{record.year} {record.make} {record.model}</Box>
              <Box component="td" sx={{ px: 1.5, py: 1, color: 'text.secondary' }}>{record.trim}</Box>
              <Box component="td" sx={{ px: 1.5, py: 1, fontWeight: 600 }}>${record.price.toLocaleString()}</Box>
              <Box component="td" sx={{ px: 1, py: 1 }} onClick={e => e.stopPropagation()}>
                <Switch
                  size="small"
                  checked={record.aiGeneration === 'enabled'}
                  onChange={() => onAiGenerationToggle(record.id)}
                />
              </Box>
              <Box component="td" sx={{ px: 1, py: 1 }} onClick={e => e.stopPropagation()}>
                <Switch
                  size="small"
                  checked={record.syndication === 'syndicated'}
                  onChange={() => onSyndicationToggle(record.id)}
                />
              </Box>
              <Box component="td" sx={{ px: 1.5, py: 1, color: 'text.secondary' }}>{record.dol}d</Box>
              <Box component="td" sx={{ px: 1.5, py: 1 }}>
                <Box sx={{
                  display: 'inline-flex', px: 1, py: 0.25, borderRadius: 1, fontSize: 11, fontWeight: 600,
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
