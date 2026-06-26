// TODO: port full implementation from vw-funds-2
// Stub: renders VIN detail view with AI generation controls.
// Preserves prop interface for InventoryContent.tsx.
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import type { VinInventoryRecord } from '../../../data/inventory/vehicleInventory';

interface VinDetailContentProps {
  record: VinInventoryRecord;
  onBack: () => void;
  variant?: 'auto' | 'sport';
}

export function VinDetailContent({ record, onBack, variant = 'auto' }: VinDetailContentProps) {
  const heroSrc = record.vehicleGroup?.angles?.['34l'] ?? record.thumbnail;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 1.5, borderBottom: '1px solid rgba(0,0,0,0.08)', flexShrink: 0 }}>
        <IconButton size="small" onClick={onBack} sx={{ color: 'text.secondary' }}>
          <ArrowBackIcon sx={{ fontSize: 20 }} />
        </IconButton>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: 15, fontWeight: 600, color: 'text.primary', lineHeight: 1.3 }}>
            {record.year} {record.make} {record.model}
          </Typography>
          <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>{record.trim} · {record.vin}</Typography>
        </Box>
        <Typography sx={{ fontSize: 16, fontWeight: 700, color: 'text.primary' }}>${record.price.toLocaleString()}</Typography>
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        {/* Hero image */}
        <Box sx={{ borderRadius: 2, overflow: 'hidden', mb: 2, bgcolor: 'surface.canvas', aspectRatio: '16/9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Box
            component="img"
            src={heroSrc}
            alt={`${record.year} ${record.make} ${record.model}`}
            sx={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', display: 'block' }}
            onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
          />
        </Box>

        {/* AI Generation toggle */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, border: '1px solid rgba(0,0,0,0.1)', borderRadius: 2, mb: 2 }}>
          <Box>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: 'text.primary' }}>AI Generation</Typography>
            <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>
              {record.aiGeneration === 'enabled' ? 'AI backgrounds enabled for this VIN' : 'AI backgrounds disabled'}
            </Typography>
          </Box>
          <Switch checked={record.aiGeneration === 'enabled'} size="small" />
        </Box>

        {/* Vehicle details */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mb: 2 }}>
          {[
            ['Condition', record.condition],
            ['Exterior Color', record.exteriorColor],
            ['Vehicle Status', record.vehicleStatus],
            ['Days on Lot', `${record.dol} days`],
            ['Syndication', record.syndication === 'syndicated' ? 'Syndicated' : 'Not Syndicated'],
            ['Priority Score', String(record.priorityScore)],
          ].map(([label, value]) => (
            <Box key={label} sx={{ p: 1.5, bgcolor: '#f8f8fb', borderRadius: 1.5 }}>
              <Typography sx={{ fontSize: 10, color: 'text.secondary', letterSpacing: '0.4px', mb: 0.25 }}>{label}</Typography>
              <Typography sx={{ fontSize: 13, fontWeight: 500, color: 'text.primary' }}>{value}</Typography>
            </Box>
          ))}
        </Box>

        {record.aiConfigApplied && (
          <Box sx={{ p: 2, bgcolor: 'rgba(71,59,171,0.06)', borderRadius: 2, border: '1px solid rgba(71,59,171,0.15)' }}>
            <Typography sx={{ fontSize: 12, fontWeight: 600, color: 'primary.main', mb: 0.5 }}>AI Config Applied</Typography>
            <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>
              Config ID: {record.aiConfigId ?? '—'}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}
