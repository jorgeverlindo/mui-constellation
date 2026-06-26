import React from 'react';
import { Box, Tooltip, Typography } from '@mui/material';
import constellationLogo from '../../assets/constellation-logo.png';

// ─── Exact tokens from Figma node 6150:86305 ─────────────────────────────────
const NAV_BG          = '#1e1a42';   // Nav Container fill
const ITEM_ACTIVE_BG  = '#2f2673';   // BG Selected / BG Hover fill
const ICON_COLOR      = '#acabff';   // All nav icon stroke/fill
const LABEL_ACTIVE    = '#f9fafa';   // Active label color
const LABEL_INACTIVE  = '#ffffff';   // Inactive label color

// ─── Nav Icons — exact SVG paths from Figma export ───────────────────────────
const IconProjects = ({ color }: { color: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7.54297 9.49775L8.66797 10.2478L10.5396 7.75224M13.808 9H16.308M13.75 15H16.25M7.54297 15.4989L8.66797 16.2489L10.5396 13.7534M4.75 20.25H19.25C19.8023 20.25 20.25 19.8023 20.25 19.25V4.75C20.25 4.19772 19.8023 3.75 19.25 3.75H4.75C4.19772 3.75 3.75 4.19772 3.75 4.75V19.25C3.75 19.8023 4.19772 20.25 4.75 20.25Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const IconFeeds = ({ color }: { color: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd" d="M4.125 10C4.125 9.51675 4.51675 9.125 5 9.125C10.4538 9.125 14.875 13.5462 14.875 19C14.875 19.4832 14.4832 19.875 14 19.875C13.5168 19.875 13.125 19.4832 13.125 19C13.125 14.5127 9.48731 10.875 5 10.875C4.51675 10.875 4.125 10.4832 4.125 10Z" fill={color}/>
    <path fillRule="evenodd" clipRule="evenodd" d="M4.12548 4.47918C4.1413 3.99619 4.54566 3.61747 5.02865 3.63329C13.3762 3.90669 20.093 10.6234 20.3664 18.971C20.3822 19.454 20.0035 19.8584 19.5205 19.8742C19.0375 19.89 18.6331 19.5113 18.6173 19.0283C18.3741 11.6022 12.3974 5.62557 4.97137 5.38235C4.48838 5.36653 4.10966 4.96217 4.12548 4.47918Z" fill={color}/>
    <path d="M8.5 17.5C8.5 18.6046 7.60457 19.5 6.5 19.5C5.39543 19.5 4.5 18.6046 4.5 17.5C4.5 16.3954 5.39543 15.5 6.5 15.5C7.60457 15.5 8.5 16.3954 8.5 17.5Z" fill={color}/>
  </svg>
);

const IconDesign = ({ color }: { color: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21.25 12C21.25 19.1094 13.6572 12.7979 12 16.1176C10.9722 18.1765 14.9058 20.75 12 20.75C6.89137 20.75 2.75 16.8325 2.75 12C2.75 7.16751 6.89137 3.25 12 3.25C17.1086 3.25 21.25 7.16751 21.25 12Z" stroke={color} strokeWidth="1.5"/>
    <path d="M11.5 7.75C11.5 8.44036 10.9404 9 10.25 9C9.55964 9 9 8.44036 9 7.75C9 7.05964 9.55964 6.5 10.25 6.5C10.9404 6.5 11.5 7.05964 11.5 7.75Z" fill={color}/>
    <path d="M8.5 12C8.5 12.6904 7.94036 13.25 7.25 13.25C6.55964 13.25 6 12.6904 6 12C6 11.3096 6.55964 10.75 7.25 10.75C7.94036 10.75 8.5 11.3096 8.5 12Z" fill={color}/>
    <path d="M16.5 9.25C16.5 9.94036 15.9404 10.5 15.25 10.5C14.5596 10.5 14 9.94036 14 9.25C14 8.55964 14.5596 8 15.25 8C15.9404 8 16.5 8.55964 16.5 9.25Z" fill={color}/>
  </svg>
);

const IconPortal = ({ color }: { color: string }) => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3.33301 5.11114V16.2222M6.88856 4.22225V17.1111M17.9997 5.42899V15.9044C17.9997 16.3245 17.7056 16.6872 17.2946 16.7741L11.5168 17.9955C10.9642 18.1123 10.4441 17.6907 10.4441 17.1258V4.20758C10.4441 3.64268 10.9642 3.22108 11.5168 3.33791L17.2946 4.55932C17.7056 4.6462 17.9997 5.00892 17.9997 5.42899Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const IconCampaigns = ({ color }: { color: string }) => (
  <svg width="25" height="24" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15.3203 14.3813C16.7441 14.3813 17.8984 13.2248 17.8984 11.7982C17.8984 10.3716 16.7441 9.21506 15.3203 9.21506M10.447 18.0407C10.0931 19.044 9.13812 19.7628 8.0156 19.7628C6.59175 19.7628 5.43749 18.6062 5.43749 17.1797V15.8881M5.43938 7.70825V15.8881M15.3203 5.86162V17.7347C15.3203 18.3143 14.7601 18.7284 14.2074 18.5574L2.60585 14.9684C2.24567 14.857 2 14.5235 2 14.1457V9.45059C2 9.07291 2.24567 8.7393 2.60585 8.62788L14.2074 5.03891C14.7601 4.8679 15.3203 5.28197 15.3203 5.86162Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M22.3457 7.78223L20.1709 9.6071" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M21.1611 11.874H24.0001" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M22.3457 15.9707L20.1709 14.1458" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const IconInventory = ({ color }: { color: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20.25 6.75V19.25C20.25 19.8023 19.8023 20.25 19.25 20.25H4.75C4.19772 20.25 3.75 19.8023 3.75 19.25V6.75M20.25 6.75L14.75 2.75M20.25 6.75H3.75M3.75 6.75L9.25 2.75M9.75 11.25H14.25" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const IconInsights = ({ color }: { color: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 16.75V19.25M9.87192 12.75V19.25M14.7438 8.75V19.25M19.6157 4.75V19.25" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const IconAI = ({ color }: { color: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd" d="M13 7C13.4142 7 13.75 7.33579 13.75 7.75C13.75 10.1758 14.2859 11.7513 15.2673 12.7327C16.2487 13.7141 17.8242 14.25 20.25 14.25C20.6642 14.25 21 14.5858 21 15C21 15.4142 20.6642 15.75 20.25 15.75C17.8242 15.75 16.2487 16.2859 15.2673 17.2673C14.2859 18.2487 13.75 19.8242 13.75 22.25C13.75 22.6642 13.4142 23 13 23C12.5858 23 12.25 22.6642 12.25 22.25C12.25 19.8242 11.7141 18.2487 10.7327 17.2673C9.75127 16.2859 8.17581 15.75 5.75 15.75C5.33579 15.75 5 15.4142 5 15C5 14.5858 5.33579 14.25 5.75 14.25C8.17581 14.25 9.75127 13.7141 10.7327 12.7327C11.7141 11.7513 12.25 10.1758 12.25 7.75C12.25 7.33579 12.5858 7 13 7ZM13 12.0086C12.699 12.6893 12.3008 13.2859 11.7934 13.7934C11.2859 14.3008 10.6893 14.699 10.0086 15C10.6893 15.301 11.2859 15.6992 11.7934 16.2066C12.3008 16.7141 12.699 17.3107 13 17.9914C13.301 17.3107 13.6992 16.7141 14.2066 16.2066C14.7141 15.6992 15.3107 15.301 15.9914 15C15.3107 14.699 14.7141 14.3008 14.2066 13.7934C13.6992 13.2859 13.301 12.6893 13 12.0086Z" fill={color}/>
    <path d="M6 5.5C6 5.22386 5.77614 5 5.5 5C5.22386 5 5 5.22386 5 5.5C5 6.48063 4.78279 7.0726 4.4277 7.4277C4.0726 7.78279 3.48063 8 2.5 8C2.22386 8 2 8.22386 2 8.5C2 8.77614 2.22386 9 2.5 9C3.48063 9 4.0726 9.21721 4.4277 9.5723C4.78279 9.9274 5 10.5194 5 11.5C5 11.7761 5.22386 12 5.5 12C5.77614 12 6 11.7761 6 11.5C6 10.5194 6.21721 9.9274 6.5723 9.5723C6.9274 9.21721 7.51937 9 8.5 9C8.77614 9 9 8.77614 9 8.5C9 8.22386 8.77614 8 8.5 8C7.51937 8 6.9274 7.78279 6.5723 7.4277C6.21721 7.0726 6 6.48063 6 5.5Z" fill={color}/>
  </svg>
);

const IconChats = ({ color }: { color: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.2498 14.25H20.252C20.8042 14.25 21.252 13.8023 21.252 13.25V4.75C21.252 4.19772 20.8042 3.75 20.252 3.75H8.00195C7.44967 3.75 7.00195 4.19772 7.00195 4.75V7.75M16.252 7.75H3.75195C3.19967 7.75 2.75195 8.19772 2.75195 8.75V17.25C2.75195 17.8023 3.19967 18.25 3.75195 18.25H6.00195V20.75L10.502 18.25H16.252C16.8042 18.25 17.252 17.8023 17.252 17.25V8.75C17.252 8.19772 16.8042 7.75 16.252 7.75Z" stroke={color} strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// ─── Nav item definition ──────────────────────────────────────────────────────
interface NavItem {
  label: string;
  icon: React.FC<{ color: string }>;
  key: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Projects',  icon: IconProjects,  key: 'projects'  },
  { label: 'Feeds',     icon: IconFeeds,     key: 'feeds'     },
  { label: 'Design',    icon: IconDesign,    key: 'design'    },
  { label: 'Portal',    icon: IconPortal,    key: 'portal'    },
  { label: 'Campaigns', icon: IconCampaigns, key: 'campaigns' },
  { label: 'Inventory', icon: IconInventory, key: 'inventory' },
  { label: 'Insights',  icon: IconInsights,  key: 'insights'  },
  { label: 'AI Tools',  icon: IconAI,        key: 'ai'        },
  { label: 'Chats',     icon: IconChats,     key: 'chats'     },
];

// ─── Chevron expand icon ──────────────────────────────────────────────────────
const IconChevronRight = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 12L10 8L6 4" stroke="#acabff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// ─── Sidebar component ────────────────────────────────────────────────────────
export interface SidebarProps {
  activeItem?: string;
  onNavigate?: (key: string) => void;
}

export function Sidebar({ activeItem = 'portal', onNavigate }: SidebarProps) {
  return (
    <Box
      component="nav"
      sx={{
        // Figma: Nav Container — #1e1a42, 72px wide, pt:4, pb:24, gap:4
        width: 72,
        flexShrink: 0,
        bgcolor: NAV_BG,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        pt: '4px',
        pb: '24px',
        gap: '4px',
      }}
    >
      {/* ── Logo area — 72×60px, paddingLeft 11px ── */}
      <Box sx={{ width: 72, height: 60, display: 'flex', alignItems: 'center', pl: '11px', flexShrink: 0 }}>
        <Box
          component="img"
          src={constellationLogo}
          alt="Constellation"
          sx={{ width: 40, height: 40, borderRadius: '4px', display: 'block' }}
        />
      </Box>

      {/* ── Menu — pt:16px, px:3px, gap:12px ── */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          pt: '16px',
          px: '8px',
          gap: '12px',
          flex: 1,
        }}
      >
        {NAV_ITEMS.map((item) => {
          const isActive = activeItem === item.key;
          const Icon = item.icon;
          return (
            <Tooltip
              key={item.key}
              title={item.label}
              placement="right"
              arrow
              slotProps={{
                tooltip: {
                  sx: {
                    bgcolor: '#2f2673',
                    fontSize: 12,
                    fontFamily: 'Roboto, sans-serif',
                    '& .MuiTooltip-arrow': { color: '#2f2673' },
                  },
                },
              }}
            >
              <Box
                onClick={() => onNavigate?.(item.key)}
                sx={{
                  // Figma: item 56×56px, padding top:7 bottom:3 left:16 right:16
                  width: 56,
                  height: 56,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  pt: '7px',
                  pb: '3px',
                  px: '16px',
                  gap: '8px',
                  cursor: 'pointer',
                  borderRadius: '12px',
                  position: 'relative',
                  transition: 'background-color 0.15s',
                  '&:hover': {
                    bgcolor: isActive ? 'transparent' : 'rgba(255,255,255,0.06)',
                  },
                }}
              >
                {/* Active pill background — 56×32px, radius 100px, #2f2673 */}
                {isActive && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: '7px',
                      left: 0,
                      right: 0,
                      height: 32,
                      bgcolor: ITEM_ACTIVE_BG,
                      borderRadius: '100px',
                      zIndex: 0,
                    }}
                  />
                )}

                {/* Icon — 24×24px */}
                <Box sx={{ position: 'relative', zIndex: 1, lineHeight: 0 }}>
                  <Icon color={ICON_COLOR} />
                </Box>

                {/* Label — 11px, weight 400/500 */}
                <Typography
                  sx={{
                    position: 'relative',
                    zIndex: 1,
                    fontFamily: 'Roboto, sans-serif',
                    fontSize: 11,
                    fontWeight: isActive ? 500 : 400,
                    color: isActive ? LABEL_ACTIVE : LABEL_INACTIVE,
                    lineHeight: 1.27,
                    letterSpacing: '0.1px',
                    whiteSpace: 'nowrap',
                    userSelect: 'none',
                  }}
                >
                  {item.label}
                </Typography>
              </Box>
            </Tooltip>
          );
        })}
      </Box>

      {/* ── Expand action — bottom ── */}
      <Box
        sx={{
          width: 72,
          height: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          opacity: 0.5,
          cursor: 'pointer',
          '&:hover': { opacity: 1 },
          transition: 'opacity 0.15s',
        }}
      >
        <IconChevronRight />
      </Box>
    </Box>
  );
}
