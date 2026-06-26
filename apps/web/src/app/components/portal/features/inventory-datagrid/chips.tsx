// ─── Inventory status chips ───────────────────────────────────────────────────
// MUI migration of VehicleInventoryGrid chip sub-components.
// All Tailwind className → MUI sx. SVG paths are identical to source.

import Box from '@mui/material/Box';
import type { AIGenerationStatus, SyndicationStatus, PriceToMarket } from '../../../../../data/inventory/vehicleInventory';

const CAPTION: React.CSSProperties = {
  fontFamily: "'Roboto', sans-serif",
  fontWeight: 400,
  fontSize: 11,
  lineHeight: 1.66,
  letterSpacing: '0.4px',
};

// ─── AIGenerationChip ─────────────────────────────────────────────────────────
export function AIGenerationChip({ status }: { status: AIGenerationStatus }) {
  if (status === 'enabled') {
    return (
      <Box component="span" sx={{
        display: 'inline-flex', alignItems: 'center', gap: '4px',
        borderRadius: '8px', pl: '6px', pr: '8px', py: '3px',
        bgcolor: 'rgb(232,245,233)', whiteSpace: 'nowrap', userSelect: 'none',
      }}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
          <path d="M8.75065 5.54183L6.12565 8.75016L4.95898 7.5835M12.5423 7.00016C12.5423 10.0607 10.0612 12.5418 7.00065 12.5418C3.94007 12.5418 1.45898 10.0607 1.45898 7.00016C1.45898 3.93958 3.94007 1.4585 7.00065 1.4585C10.0612 1.4585 12.5423 3.93958 12.5423 7.00016Z"
            stroke="#4CAF50" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <Box component="span" sx={{ ...CAPTION, color: '#1b5e20' }}>Enabled</Box>
      </Box>
    );
  }
  return (
    <Box component="span" sx={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      borderRadius: '8px', pl: '6px', pr: '8px', py: '3px',
      bgcolor: 'rgba(17,16,20,0.08)', whiteSpace: 'nowrap', userSelect: 'none',
    }}>
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
        <path d="M2.625 2.625H5.25V11.375H2.625V2.625ZM8.75 2.625H11.375V11.375H8.75V2.625Z"
          stroke="#686576" strokeWidth="1.2" strokeLinejoin="round" />
      </svg>
      <Box component="span" sx={{ ...CAPTION, color: '#686576' }}>Disabled</Box>
    </Box>
  );
}

// ─── SyndicationChip ──────────────────────────────────────────────────────────
export function SyndicationChip({ status }: { status: SyndicationStatus }) {
  const fill = status === 'syndicated' ? '#6356E1' : '#686576';
  const icon = (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
      <path fillRule="evenodd" clipRule="evenodd"
        d="M3.49401 2.8757C3.66486 3.04655 3.66486 3.32356 3.49401 3.49442C2.59625 4.39218 2.04175 5.63116 2.04175 7.00049C2.04175 8.36982 2.59625 9.6088 3.49401 10.5066C3.66486 10.6774 3.66486 10.9544 3.49401 11.1253C3.32316 11.2961 3.04615 11.2961 2.87529 11.1253C1.82015 10.0701 1.16675 8.6112 1.16675 7.00049C1.16675 5.38978 1.82015 3.93085 2.87529 2.8757C3.04615 2.70485 3.32316 2.70485 3.49401 2.8757ZM10.5062 2.8757C10.677 2.70485 10.954 2.70484 11.1249 2.8757C12.18 3.93085 12.8334 5.38978 12.8334 7.00049C12.8334 8.6112 12.18 10.0701 11.1249 11.1253C10.954 11.2961 10.677 11.2961 10.5062 11.1253C10.3353 10.9544 10.3353 10.6774 10.5062 10.5066C11.4039 9.6088 11.9584 8.36982 11.9584 7.00049C11.9584 5.63116 11.4039 4.39218 10.5062 3.49442C10.3353 3.32356 10.3353 3.04655 10.5062 2.8757ZM5.18976 4.57145C5.36061 4.7423 5.36061 5.01931 5.18976 5.19016C4.72598 5.65395 4.4399 6.29339 4.4399 7.00049C4.4399 7.70759 4.72598 8.34703 5.18976 8.81081C5.36061 8.98167 5.36061 9.25868 5.18976 9.42953C5.0189 9.60039 4.74189 9.60039 4.57104 9.42953C3.94987 8.80836 3.5649 7.94897 3.5649 7.00049C3.5649 6.05201 3.94987 5.19261 4.57104 4.57145C4.74189 4.40059 5.0189 4.40059 5.18976 4.57145ZM8.81041 4.57145C8.98126 4.40059 9.25827 4.40059 9.42912 4.57145C10.0503 5.19261 10.4353 6.05201 10.4353 7.00049C10.4353 7.94897 10.0503 8.80836 9.42912 9.42953C9.25827 9.60039 8.98126 9.60039 8.81041 9.42953C8.63955 9.25868 8.63955 8.98167 8.81041 8.81081C9.27419 8.34703 9.56027 7.70759 9.56027 7.00049C9.56027 6.29339 9.27419 5.65395 8.81041 5.19016C8.63955 5.01931 8.63955 4.7423 8.81041 4.57145ZM6.12508 7.00006C6.12508 6.51681 6.51683 6.12506 7.00008 6.12506C7.48333 6.12506 7.87508 6.51681 7.87508 7.00006C7.87508 7.48331 7.48333 7.87506 7.00008 7.87506C6.51683 7.87506 6.12508 7.48331 6.12508 7.00006Z"
        fill={fill}
      />
    </svg>
  );
  if (status === 'syndicated') {
    return (
      <Box component="span" sx={{
        display: 'inline-flex', alignItems: 'center', gap: '4px',
        borderRadius: '8px', pl: '6px', pr: '8px', py: '3px',
        bgcolor: 'rgba(99,86,225,0.12)', whiteSpace: 'nowrap', userSelect: 'none',
      }}>
        {icon}
        <Box component="span" sx={{ ...CAPTION, color: '#6356e1' }}>Syndicated</Box>
      </Box>
    );
  }
  return (
    <Box component="span" sx={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      borderRadius: '8px', pl: '6px', pr: '8px', py: '3px',
      bgcolor: 'rgba(17,16,20,0.08)', whiteSpace: 'nowrap', userSelect: 'none',
    }}>
      {icon}
      <Box component="span" sx={{ ...CAPTION, color: '#686576' }}>Not syndicated</Box>
    </Box>
  );
}

// ─── PriceToMarketChip ────────────────────────────────────────────────────────
type PTMConfig = { label: string; border: string; icon: React.ReactNode };
const PTM_CONFIG: Record<PriceToMarket, PTMConfig> = {
  'well-above': {
    label: 'Well above market', border: '#02292c',
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#686576" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M17 11l-5-5-5 5M17 18l-5-5-5 5"/></svg>,
  },
  'above': {
    label: 'Above Market', border: '#0a7870',
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#686576" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M18 15l-6-6-6 6"/></svg>,
  },
  'close': {
    label: 'Close to Market', border: '#616161',
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}><path d="M5 9h14M5 15h14" stroke="#686576" strokeWidth="2" strokeLinecap="round"/></svg>,
  },
  'below': {
    label: 'Below Market', border: '#d43b2f',
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#686576" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M6 9l6 6 6-6"/></svg>,
  },
  'well-below': {
    label: 'Well below market', border: '#640808',
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#686576" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M17 6l-5 5-5-5M17 13l-5 5-5-5"/></svg>,
  },
};

export function PriceToMarketChip({ value }: { value: PriceToMarket }) {
  const { label, border, icon } = PTM_CONFIG[value];
  return (
    <Box component="span" sx={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      borderRadius: '8px', pl: '6px', pr: '8px', py: '3px',
      border: '1px solid', borderColor: border,
      whiteSpace: 'nowrap', userSelect: 'none',
    }}>
      {icon}
      <Box component="span" sx={{ ...CAPTION, color: '#686576' }}>{label}</Box>
    </Box>
  );
}

// ─── PriorityScoreChip ────────────────────────────────────────────────────────
const PRIORITY_COLORS: Record<number, string> = {
  1: '#640808', 2: '#b52520', 3: '#e55e50', 4: '#616161',
  5: '#109890', 6: '#065c56', 7: '#02292c',
};

export function PriorityScoreChip({ score }: { score: number }) {
  return (
    <Box component="span" sx={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      p: '2px', borderRadius: '8px', userSelect: 'none',
      bgcolor: PRIORITY_COLORS[score] ?? '#616161',
    }}>
      <Box component="span" sx={{
        px: '6px',
        fontFamily: "'Roboto', sans-serif", fontWeight: 400,
        fontSize: 13, lineHeight: '18px', letterSpacing: '0.16px',
        color: 'white', whiteSpace: 'nowrap',
      }}>
        {score}
      </Box>
    </Box>
  );
}

// ─── AIConfigBadge (on thumbnail in table row) ────────────────────────────────
export function AIConfigBadge() {
  return (
    <Box sx={{
      position: 'absolute', bottom: -4, right: -8, zIndex: 1,
      width: 24, height: 24,
      bgcolor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
      overflow: 'clip', p: '4px', borderRadius: '100px',
      boxShadow: '0px 0.8px 4px rgba(0,0,0,0.12), 0px 1.6px 1.6px rgba(0,0,0,0.14), 0px 2.4px 0.8px -2px rgba(0,0,0,0.20)',
    }}>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M7.83008 3.11023C7.80147 2.85767 7.58794 2.66676 7.33376 2.6665C7.07959 2.66624 6.86567 2.85672 6.83655 3.10921C6.64717 4.75111 6.15627 5.90564 5.36433 6.69758C4.57239 7.48952 3.41786 7.98042 1.77596 8.1698C1.52346 8.19892 1.33299 8.41284 1.33325 8.66702C1.33351 8.92119 1.52442 9.13472 1.77698 9.16333C3.39174 9.34623 4.57081 9.83693 5.38155 10.633C6.18924 11.4261 6.69039 12.5804 6.83521 14.2107C6.85815 14.4689 7.0746 14.6668 7.33381 14.6665C7.59303 14.6662 7.80903 14.4679 7.83139 14.2096C7.9702 12.6061 8.47087 11.4275 9.28257 10.6158C10.0943 9.80412 11.2728 9.30345 12.8764 9.16464C13.1346 9.14229 13.333 8.92628 13.3333 8.66707C13.3335 8.40785 13.1357 8.1914 12.8775 8.16846C11.2471 8.02364 10.0928 7.5225 9.29976 6.7148C8.50367 5.90406 8.01298 4.72499 7.83008 3.11023Z" fill="#473BAB"/>
        <path d="M13.1931 0.839064C13.182 0.740847 13.099 0.666605 13.0001 0.666504C12.9013 0.666403 12.8181 0.740475 12.8068 0.838669C12.7331 1.47718 12.5422 1.92617 12.2342 2.23415C11.9263 2.54212 11.4773 2.73303 10.8388 2.80667C10.7406 2.818 10.6665 2.90119 10.6666 3.00004C10.6667 3.09888 10.7409 3.18192 10.8391 3.19305C11.4671 3.26418 11.9256 3.455 12.2409 3.76459C12.555 4.07301 12.7499 4.5219 12.8062 5.15593C12.8152 5.25634 12.8993 5.33328 13.0001 5.33317C13.1009 5.33306 13.1849 5.25592 13.1936 5.1555C13.2476 4.5319 13.4423 4.07357 13.758 3.75791C14.0736 3.44225 14.532 3.24754 15.1556 3.19356C15.256 3.18486 15.3331 3.10086 15.3333 3.00006C15.3334 2.89925 15.2564 2.81507 15.156 2.80616C14.522 2.74983 14.0731 2.55495 13.7647 2.24084C13.4551 1.92555 13.2643 1.46703 13.1931 0.839064Z" fill="#473BAB"/>
      </svg>
    </Box>
  );
}

// ─── SparkleIcon (AI badge on cards) ─────────────────────────────────────────
export function SparkleIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <path d="M7.83008 3.11023C7.80147 2.85767 7.58794 2.66676 7.33376 2.6665C7.07959 2.66624 6.86567 2.85672 6.83655 3.10921C6.64717 4.75111 6.15627 5.90564 5.36433 6.69758C4.57239 7.48952 3.41786 7.98042 1.77596 8.1698C1.52346 8.19892 1.33299 8.41284 1.33325 8.66702C1.33351 8.92119 1.52442 9.13472 1.77698 9.16333C3.39174 9.34623 4.57081 9.83693 5.38155 10.633C6.18924 11.4261 6.69039 12.5804 6.83521 14.2107C6.85815 14.4689 7.0746 14.6668 7.33381 14.6665C7.59303 14.6662 7.80903 14.4679 7.83139 14.2096C7.9702 12.6061 8.47087 11.4275 9.28257 10.6158C10.0943 9.80412 11.2728 9.30345 12.8764 9.16464C13.1346 9.14229 13.333 8.92628 13.3333 8.66707C13.3335 8.40785 13.1357 8.1914 12.8775 8.16846C11.2471 8.02364 10.0928 7.5225 9.29976 6.7148C8.50367 5.90406 8.01298 4.72499 7.83008 3.11023Z" fill="#473BAB"/>
      <path d="M13.1931 0.839064C13.182 0.740847 13.099 0.666605 13.0001 0.666504C12.9013 0.666403 12.8181 0.740475 12.8068 0.838669C12.7331 1.47718 12.5422 1.92617 12.2342 2.23415C11.9263 2.54212 11.4773 2.73303 10.8388 2.80667C10.7406 2.818 10.6665 2.90119 10.6666 3.00004C10.6667 3.09888 10.7409 3.18192 10.8391 3.19305C11.4671 3.26418 11.9256 3.455 12.2409 3.76459C12.555 4.07301 12.7499 4.5219 12.8062 5.15593C12.8152 5.25634 12.8993 5.33328 13.0001 5.33317C13.1009 5.33306 13.1849 5.25592 13.1936 5.1555C13.2476 4.5319 13.4423 4.07357 13.758 3.75791C14.0736 3.44225 14.532 3.24754 15.1556 3.19356C15.256 3.18486 15.3331 3.10086 15.3333 3.00006C15.3334 2.89925 15.2564 2.81507 15.156 2.80616C14.522 2.74983 14.0731 2.55495 13.7647 2.24084C13.4551 1.92555 13.2643 1.46703 13.1931 0.839064Z" fill="#473BAB"/>
    </svg>
  );
}
