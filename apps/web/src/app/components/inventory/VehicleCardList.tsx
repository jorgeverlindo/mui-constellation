// TODO: port full implementation from vw-funds-2
// Stub: renders horizontal card list view. Prop interface mirrors source.
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Switch from '@mui/material/Switch';
import type { VinInventoryRecord, SyndicationStatus, AIGenerationStatus } from '../../../data/inventory/vehicleInventory';

interface VehicleCardListProps {
  records: VinInventoryRecord[];
  selected: Set<string>;
  onToggleRow: (id: string, checked: boolean) => void;
  onVinClick: (id: string) => void;
  onSyndicationToggle: (id: string) => void;
  onAiGenerationToggle: (id: string) => void;
  onViewSourceImages?: (id: string) => void;
  onAttachComment?: (id: string) => void;
}

export function VehicleCardList({
  records,
  selected,
  onToggleRow,
  onVinClick,
  onSyndicationToggle,
  onAiGenerationToggle,
}: VehicleCardListProps) {
  return (
    <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1.5, overflowY: 'auto' }}>
      {records.map(record => (
        <Box
          key={record.id}
          onClick={() => onVinClick(record.id)}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            border: '1px solid',
            borderColor: selected.has(record.id) ? 'rgba(71,59,171,0.4)' : 'rgba(0,0,0,0.1)',
            borderRadius: 2,
            overflow: 'hidden',
            cursor: 'pointer',
            bgcolor: 'white',
            pr: 2,
            '&:hover': { borderColor: 'rgba(71,59,171,0.3)', boxShadow: '0 2px 8px rgba(71,59,171,0.1)' },
          }}
        >
          <Box
            component="img"
            src={record.thumbnail}
            alt={`${record.year} ${record.make} ${record.model}`}
            sx={{ width: 100, height: 68, objectFit: 'cover', flexShrink: 0, bgcolor: 'surface.canvas' }}
            onError={e => { (e.currentTarget as HTMLImageElement).src = ''; }}
          />
          <Box sx={{ flex: 1, minWidth: 0, py: 1 }}>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: 'text.primary' }}>
              {record.year} {record.make} {record.model}
            </Typography>
            <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>{record.trim} · {record.vin}</Typography>
          </Box>
          <Typography sx={{ fontSize: 14, fontWeight: 700, color: 'text.primary', flexShrink: 0 }}>
            ${record.price.toLocaleString()}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }} onClick={e => e.stopPropagation()}>
            <Typography sx={{ fontSize: 10, color: 'text.secondary', letterSpacing: '0.4px' }}>AI</Typography>
            <Switch
              size="small"
              checked={record.aiGeneration === 'enabled'}
              onChange={() => onAiGenerationToggle(record.id)}
            />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }} onClick={e => e.stopPropagation()}>
            <Typography sx={{ fontSize: 10, color: 'text.secondary', letterSpacing: '0.4px' }}>SYND</Typography>
            <Switch
              size="small"
              checked={record.syndication === 'syndicated'}
              onChange={() => onSyndicationToggle(record.id)}
            />
          </Box>
        </Box>
      ))}
      {records.length === 0 && (
        <Box sx={{ py: 8, textAlign: 'center' }}>
          <Typography sx={{ color: 'text.secondary', fontSize: 14 }}>No vehicles match the current filters.</Typography>
        </Box>
      )}
    </Box>
  );
}
