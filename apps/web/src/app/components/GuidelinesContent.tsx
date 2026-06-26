import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { useTranslation } from '../contexts/LanguageContext';
import { useClient } from '../contexts/ClientContext';

// VW card images — Cloudinary assets
const imgCoop    = 'https://res.cloudinary.com/dvq75cqna/image/upload/v1780071092/vw-funds/85a0c71df6a4fdf6c8713a2ec4063036ceb6ee23.png';
const imgBrand   = 'https://res.cloudinary.com/dvq75cqna/image/upload/v1780071122/vw-funds/c24d45a1c65f1ce9c23d8dafd2787f4fa397aa92.png';
const imgJetta   = 'https://res.cloudinary.com/dvq75cqna/image/upload/v1780071123/vw-funds/c45369b25447b6fa84f02227e98c3db81b9de3da.png';
const imgTiguan  = 'https://res.cloudinary.com/dvq75cqna/image/upload/v1780071069/vw-funds/4a61db968612064253430d01cb62b28422ad7a74.png';
const imgApril   = 'https://res.cloudinary.com/dvq75cqna/image/upload/v1780071097/vw-funds/990a5c560985c278f9d761d79cebaff821f02f52.png';

const imgAudiCoop  = 'https://res.cloudinary.com/dvq75cqna/image/upload/v1780071118/vw-funds/audi_images/Guidelines_Card.png';
const imgAudiBrand = 'https://res.cloudinary.com/dvq75cqna/image/upload/v1780071114/vw-funds/audi_images/Guidelines_Card-1.png';
const imgAudiA7    = 'https://res.cloudinary.com/dvq75cqna/image/upload/v1780071115/vw-funds/audi_images/Guidelines_Card-2.png';
const imgAudiQ5    = 'https://res.cloudinary.com/dvq75cqna/image/upload/v1780071115/vw-funds/audi_images/Guidelines_Card-3.png';
const imgAudiApril = 'https://res.cloudinary.com/dvq75cqna/image/upload/v1780071117/vw-funds/audi_images/Guidelines_Card-4.png';

// ─── Per-client card configs ──────────────────────────────────────────────────

interface CardConfig {
  image: string;
  title: string;
}

interface ClientCards {
  row1: [CardConfig, CardConfig];
  row2: [CardConfig, CardConfig, CardConfig];
}

const VW_CARDS: ClientCards = {
  row1: [
    { image: imgCoop,   title: 'COOP Guidelines' },
    { image: imgBrand,  title: 'Brand Guidelines' },
  ],
  row2: [
    { image: imgJetta,  title: 'Jetta Assets' },
    { image: imgTiguan, title: 'Tiguan Assets' },
    { image: imgApril,  title: 'April Campaign' },
  ],
};

const AUDI_CARDS: ClientCards = {
  row1: [
    { image: imgAudiCoop,  title: 'COOP Guidelines' },
    { image: imgAudiBrand, title: 'Brand Guidelines' },
  ],
  row2: [
    { image: imgAudiA7,    title: 'Audi A7 Sportback Assets' },
    { image: imgAudiQ5,    title: 'Audi Q5' },
    { image: imgAudiApril, title: 'April Campaign' },
  ],
};

// ─── GuidelinesCard ──────────────────────────────────────────────────────────

interface GuidelinesCardProps {
  image: string;
  title: string;
  ctaLabel?: string;
}

function GuidelinesCard({ image, title, ctaLabel = 'Access Documents' }: GuidelinesCardProps) {
  const { t } = useTranslation();

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        overflow: 'hidden',
        borderRadius: '12px',
        cursor: 'pointer',
        aspectRatio: '16 / 9',
        '&:hover img': { transform: 'scale(1.08)' },
      }}
    >
      {/* Background image */}
      <Box
        component="img"
        src={image}
        alt={title}
        sx={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: 'scale(1.06)',
          transition: 'transform 0.3s ease',
        }}
      />

      {/* Gradient overlay */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.28) 45%, rgba(0,0,0,0) 75%)',
        }}
      />

      {/* Content */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          px: '20px',
          pb: '20px',
          gap: '12px',
        }}
      >
        <Typography
          sx={{
            color: '#fff',
            fontSize: '18px',
            fontWeight: 500,
            lineHeight: 1.3,
            letterSpacing: '0.15px',
          }}
        >
          {t(title)}
        </Typography>

        <Button
          size="small"
          onClick={(e) => e.stopPropagation()}
          sx={{
            flexShrink: 0,
            px: '16px',
            py: '6px',
            bgcolor: '#fff',
            color: 'text.primary',
            borderRadius: '100px',
            border: '1px solid rgba(255,255,255,0.8)',
            fontSize: '13px',
            fontWeight: 500,
            textTransform: 'none',
            whiteSpace: 'nowrap',
            boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
            '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' },
          }}
        >
          {t(ctaLabel)}
        </Button>
      </Box>
    </Box>
  );
}

// ─── GuidelinesContent ────────────────────────────────────────────────────────

export function GuidelinesContent() {
  const { client } = useClient();
  const cards = client.clientId === 'audi' ? AUDI_CARDS : VW_CARDS;

  return (
    <Box sx={{ height: '100%', overflowY: 'auto' }}>
      <Box sx={{ p: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Row 1 — 2 large cards */}
        <Box sx={{ display: 'flex', gap: '24px' }}>
          {cards.row1.map((card) => (
            <Box key={card.title} sx={{ flex: 1, minWidth: 0 }}>
              <GuidelinesCard image={card.image} title={card.title} />
            </Box>
          ))}
        </Box>

        {/* Row 2 — 3 smaller cards */}
        <Box sx={{ display: 'flex', gap: '24px' }}>
          {cards.row2.map((card) => (
            <Box key={card.title} sx={{ flex: 1, minWidth: 0 }}>
              <GuidelinesCard image={card.image} title={card.title} />
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
