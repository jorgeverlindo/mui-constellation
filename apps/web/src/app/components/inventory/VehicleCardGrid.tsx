// TODO: port full implementation from vw-funds-2
// Stub: renders vertical card grid view. Prop interface mirrors source.
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Switch from '@mui/material/Switch';
import type { VinInventoryRecord, SyndicationStatus, AIGenerationStatus } from '../../../data/inventory/vehicleInventory';

interface VehicleCardGridProps {
  records: VinInventoryRecord[];
  selected: Set<string>;
  onToggleRow: (id: string, checked: boolean) => void;
  onVinClick: (id: string) => void;
  onSyndicationToggle: (id: string) => void;
  onAiGenerationToggle: (id: string) => void;
  onViewSourceImages?: (id: string) => void;
  onAttachComment?: (id: string) => void;
}

export function VehicleCardGrid({
  records,
  selected,
  onToggleRow,
  onVinClick,
  onSyndicationToggle,
  onAiGenerationToggle,
}: VehicleCardGridProps) {
  return (
    <Box sx={{ p: 2, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 2, overflowY: 'auto' }}>
      {records.map(record => (
        <Box
          key={record.id}
          onClick={() => onVinClick(record.id)}
          sx={{
            border: '1px solid',
            borderColor: selected.has(record.id) ? 'rgba(71,59,171,0.4)' : 'rgba(0,0,0,0.1)',
            borderRadius: 2,
            overflow: 'hidden',
            cursor: 'pointer',
            bgcolor: 'white',
            '&:hover': { borderColor: 'rgba(71,59,171,0.3)', boxShadow: '0 2px 8px rgba(71,59,171,0.1)' },
          }}
        >
          <Box sx={{ position: 'relative' }}>
            <Box
              component="img"
              src={record.thumbnail}
              alt={`${record.year} ${record.make} ${record.model}`}
              sx={{ width: '100%', height: 120, objectFit: 'cover', display: 'block', bgcolor: 'surface.canvas' }}
              onError={e => { (e.currentTarget as HTMLImageElement).src = ''; }}
            />
          </Box>
          <Box sx={{ p: 1.5 }}>
            <Typography sx={{ fontSize: 12, fontWeight: 600, color: 'text.primary', mb: 0.25 }}>
              {record.year} {record.make} {record.model}
            </Typography>
            <Typography sx={{ fontSize: 11, color: 'text.secondary', mb: 0.5 }}>{record.trim}</Typography>
            <Typography sx={{ fontSize: 13, fontWeight: 700, color: 'text.primary', mb: 1 }}>
              ${record.price.toLocaleString()}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} onClick={e => e.stopPropagation()}>
              <Typography sx={{ fontSize: 10, color: 'text.secondary', letterSpacing: '0.4px' }}>AI GEN</Typography>
              <Switch
                size="small"
                checked={record.aiGeneration === 'enabled'}
                onChange={() => onAiGenerationToggle(record.id)}
              />
            </Box>
          </Box>
        </Box>
      ))}
      {records.length === 0 && (
        <Box sx={{ gridColumn: '1 / -1', py: 8, textAlign: 'center' }}>
          <Typography sx={{ color: 'text.secondary', fontSize: 14 }}>No vehicles match the current filters.</Typography>
        </Box>
      )}
    </Box>
  );
}
