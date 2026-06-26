// Stub — full Gantt implementation will be ported by a follow-up agent
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { DateRange } from '../DateRangePicker';

export const GANTT_COLORS = [
  '#C5C3E8', '#8ED5BC', '#F5B4AB', '#E8D4A0',
  '#A9C4E8', '#E8B8CE', '#B8D4A8', '#F0C9A0', '#B0D8E0',
] as const;

export const APPROVED_BUDGET = 1_450_000;

const imgTiguan  = 'https://res.cloudinary.com/dvq75cqna/image/upload/v1780071096/vw-funds/974b27e56590a74d3b517b836efbfb505eb10a20.png';
const imgAtlas   = 'https://res.cloudinary.com/dvq75cqna/image/upload/v1780071075/vw-funds/5b760d55d2388a38009c20fbc7474decb0d7b3fe.jpg';
const imgMeta    = 'https://res.cloudinary.com/dvq75cqna/image/upload/v1780071136/vw-funds/e67775d65913cad5ff67c8c775bb9fcaee7b8d74.png';
const imgDynamic = 'https://res.cloudinary.com/dvq75cqna/image/upload/v1780071132/vw-funds/dcd4a062f63eda60d1f2ae0b47f935693f998f44.jpg';
const imgAsset1  = 'https://res.cloudinary.com/dvq75cqna/image/upload/v1780071079/vw-funds/5dc24ae6f6828e22eaa3e6548f18373b4b398b01.jpg';

export interface Campaign {
  id: string;
  name: string;
  campaignGroup: string;
  quarter: string;
  mediaType: string[];
  startDate: string;
  endDate: string;
  budget: number;
  thumbnail: string;
  color: string;
  startDayIndex: number;
  durationDays: number;
  assetCount: number;
  assets: string[];
  status: 'Approved' | 'Pending' | 'Revision Requested';
}

export const INITIAL_CAMPAIGNS: Campaign[] = [
  { id: 'c1', name: 'Tiguan Spring Launch', campaignGroup: 'SUV Launch Campaigns', quarter: 'Q1', mediaType: ['Digital', 'Social'], startDate: 'Mar 20, 2026', endDate: 'Apr 5, 2026', budget: 180000, thumbnail: imgTiguan,  color: GANTT_COLORS[0], startDayIndex: 5,  durationDays: 16, assetCount: 2, assets: [imgTiguan, imgAtlas],   status: 'Approved' },
  { id: 'c2', name: 'Atlas Summer Campaign', campaignGroup: 'SUV Launch Campaigns', quarter: 'Q2', mediaType: ['OOH', 'Digital'],   startDate: 'Jun 1, 2026',  endDate: 'Jun 28, 2026', budget: 220000, thumbnail: imgAtlas,   color: GANTT_COLORS[1], startDayIndex: 32, durationDays: 27, assetCount: 3, assets: [imgAtlas],          status: 'Pending' },
  { id: 'c3', name: 'Meta Awareness Push',   campaignGroup: 'Digital Campaigns',    quarter: 'Q1', mediaType: ['Social'],          startDate: 'Feb 10, 2026', endDate: 'Feb 28, 2026', budget: 95000,  thumbnail: imgMeta,   color: GANTT_COLORS[2], startDayIndex: 0,  durationDays: 18, assetCount: 1, assets: [imgMeta],           status: 'Approved' },
  { id: 'c4', name: 'Dynamic Retargeting',   campaignGroup: 'Digital Campaigns',    quarter: 'Q2', mediaType: ['Digital'],         startDate: 'Apr 15, 2026', endDate: 'May 15, 2026', budget: 150000, thumbnail: imgDynamic, color: GANTT_COLORS[3], startDayIndex: 20, durationDays: 30, assetCount: 2, assets: [imgDynamic, imgAsset1], status: 'Revision Requested' },
];

interface PlannerContentProps {
  selectedCampaignId: string | null;
  onSelectCampaign: (id: string | null) => void;
  onNewCampaign: () => void;
  dateRange: DateRange | undefined;
  onDateRangeChange: (range: DateRange | undefined) => void;
  campaigns: Campaign[];
  onCampaignsChange: (campaigns: Campaign[]) => void;
}

export function PlannerContent({
  selectedCampaignId,
  onSelectCampaign,
  onNewCampaign,
  campaigns,
}: PlannerContentProps) {
  return (
    <Box sx={{ height: '100%', overflow: 'auto', p: 3 }}>
      <Typography sx={{ fontSize: '0.875rem', color: 'text.secondary', mb: 2 }}>
        Planner — {campaigns.length} campaign{campaigns.length !== 1 ? 's' : ''}
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {campaigns.map((c) => (
          <Box
            key={c.id}
            onClick={() => onSelectCampaign(selectedCampaignId === c.id ? null : c.id)}
            sx={{
              display: 'flex', alignItems: 'center', gap: 2, p: 2,
              borderRadius: 2, border: '1px solid',
              borderColor: selectedCampaignId === c.id ? 'brand.accent' : 'divider',
              bgcolor: 'background.paper', cursor: 'pointer',
              '&:hover': { bgcolor: 'surface.filled' },
            }}
          >
            <Box sx={{ width: 4, height: 48, borderRadius: 1, bgcolor: c.color, flexShrink: 0 }} />
            <Box component="img" src={c.thumbnail} alt={c.name} sx={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 1.5, flexShrink: 0 }} />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontWeight: 500, fontSize: '0.875rem' }}>{c.name}</Typography>
              <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>{c.startDate} — {c.endDate} · {c.campaignGroup}</Typography>
            </Box>
            <Box sx={{ px: 1.5, py: 0.5, borderRadius: 999, fontSize: '0.75rem', fontWeight: 500,
              bgcolor: c.status === 'Approved' ? 'rgba(46,125,50,0.1)' : c.status === 'Revision Requested' ? 'rgba(198,40,40,0.1)' : 'rgba(230,150,0,0.1)',
              color: c.status === 'Approved' ? '#2E7D32' : c.status === 'Revision Requested' ? '#C62828' : '#E65100',
            }}>
              {c.status}
            </Box>
          </Box>
        ))}
        <Box
          onClick={onNewCampaign}
          sx={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', height: 56,
            border: '1.5px dashed', borderColor: 'divider', borderRadius: 2, cursor: 'pointer',
            color: 'text.secondary', fontSize: '0.875rem',
            '&:hover': { bgcolor: 'surface.filled', borderColor: 'brand.accent', color: 'brand.accent' },
          }}
        >
          + New Campaign
        </Box>
      </Box>
    </Box>
  );
}
