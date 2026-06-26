import { useState, useEffect, useMemo } from 'react';
import { Routes, Route, Navigate, useParams, Link } from 'react-router-dom';
import { createTheme, ThemeProvider, CssBaseline, Box, Typography } from '@mui/material';
import { AssetGrid } from './features/asset-grid/AssetGrid';
import { Sidebar } from './components/ui/Sidebar';
import { Topbar } from './components/ui/Topbar';
import { FolderTree } from './components/ui/FolderTree';
import { FilterPanel, FilterPanelBadge, FilterPanelClearAll } from './features/filter-panel/FilterPanel';
import { LeftPaneShell } from './components/ui/LeftPaneShell';
import { useAssetViewStore } from './store/useAssetViewStore';
import { useFolderStore, Folder } from './store/useFolderStore';
import { UploadActivityMonitor } from './components/ui/UploadActivityMonitor';
import { DownloadActivityMonitor } from './components/ui/DownloadActivityMonitor';
import { ArchivedFoldersSection } from './components/ui/ArchivedFoldersSection';
import { Asset } from './types/asset';

// ─── AV3 theme ───────────────────────────────────────────────────────────────
const theme = createTheme({
  palette: {
    primary: { main: '#3730a3' },
    background: {
      default: '#f5f5f7',
      paper:   '#ffffff',
    },
  },
  typography: {
    // Figma: Roboto across all type styles
    fontFamily: "'Roboto', sans-serif",
    allVariants: { fontFamily: "'Roboto', sans-serif" },
  },
  shape: { borderRadius: 8 },
  components: {
    MuiButton:     { styleOverrides: { root: { textTransform: 'none', fontFamily: "'Roboto', sans-serif" } } },
    MuiChip:       { styleOverrides: { root: { fontFamily: "'Roboto', sans-serif" } } },
    MuiTypography: { styleOverrides: { root: { fontFamily: "'Roboto', sans-serif" } } },
    MuiInputBase:  { styleOverrides: { root: { fontFamily: "'Roboto', sans-serif" } } },
    MuiMenuItem:   { styleOverrides: { root: { fontFamily: "'Roboto', sans-serif" } } },
  },
});

// ─── Demo assets ─────────────────────────────────────────────────────────────
// Uses source.unsplash.com keyword search — each sig value locks to a stable image.
// Images are proxied through /api/img → images.unsplash.com so they're served
// as same-origin and not blocked by the browser's ORB security mechanism.
// Confirmed-working Unsplash photo IDs (verified 200 via proxy)
const PHOTO_IDS = [
  '1503376780353-7e6692767b70', //  1 BMW 7 Series     – dark BMW M4
  '1555215695-3004980ad54e',    //  2 BMW M5            – BMW i8 showroom
  '1514867644123-6385d58d3cd4', //  3 BMW M3            – sports car
  '1494976388531-d1058494cdd8', //  4 Porsche GT3 RS    – Porsche 911
  '1544636331-e26879cd4d9b',    //  5 Porsche Carrera S – black night
  '1563720223185-11003d516935', //  6 Porsche Rear      – car detail
  '1509440159596-0249088772ff', //  7 Porsche Panamera  – luxury car
  '1568605117036-5fe5e7bab0b7', //  8 Range Rover Sport – SUV
  '1533473359331-0135ef1b58bf', //  9 Land Rover        – adventurous
  '1570733577524-3a047079e80d', // 10 Range Rover Night – moody
  '1492144534655-ae79c964c9d7', // 11 Ferrari 458       – red Ferrari
  '1583121274602-3e2820c69888', // 12 Ferrari Purosangue– orange supercar
  '1610647752706-3bb12232b3ab', // 13 Ferrari Key Visual– dramatic
  '1552519507-da3b142c6e3d',    // 14 Lamborghini       – yellow sports car
  '1606664515524-ed2f786a0bd6', // 15 Lamborghini SVJ   – Porsche Taycan EV
  '1583121274602-3e2820c69888', // 16 Lamborghini Pre-Fall (orange repeat)
  '1541899481282-d53bffe3c35d', // 17 Jeep Rubicon      – off-road
  '1568605117036-5fe5e7bab0b7', // 18 Jeep 4xe          – SUV repeat
  '1533473359331-0135ef1b58bf', // 19 Jeep Golden Hour  – adventure repeat
  '1606664515524-ed2f786a0bd6', // 20 Tesla Model 3     – EV repeat
  '1552519507-da3b142c6e3d',    // 21 Ford Mustang      – yellow repeat
  '1503376780353-7e6692767b70', // 22 Classic Muscle    – dark repeat
];
const U = (_keywords: string, sig: number) =>
  `https://images.unsplash.com/photo-${PHOTO_IDS[sig - 1]}?w=800&h=540&fit=crop&q=80`;

const DEMO_ASSETS: Asset[] = [
  // ── BMW ──────────────────────────────────────────────────────────────────
  { id:'a01', name:'BMW 7 Series — Luxury Sedan Campaign',
    url: U('bmw sedan luxury', 1),
    mimeType:'image/jpeg', dimensions:'1080 × 1080',
    aiStatus: 'approved',
    year:'2024', make:'BMW', model:'7 Series', trim:'M Sport', lifestyle:'Luxury',
    tags:['2024','BMW','7 Series','M Sport','Lifestyle'] },
  { id:'a02', name:'BMW M5 Competition — City Drive',
    url: U('bmw m5 performance car', 2),
    mimeType:'image/jpeg', dimensions:'1280 × 720',
    aiStatus: 'approved',
    year:'2023', make:'BMW', model:'M5', trim:'Competition', lifestyle:'Performance',
    tags:['2023','BMW','M5','Competition','Sport'] },
  { id:'a03', name:'BMW M3 — Urban Lifestyle',
    url: U('bmw sports car city', 3),
    mimeType:'image/jpeg', dimensions:'1080 × 1080',
    aiStatus: 'suggested', needsReview: true,
    aiSuggestion: {
      year:'2024', yearConfidence:0.87,
      make:'BMW', makeConfidence:0.96,
      model:'M3', modelConfidence:0.91,
      trim:'Competition xDrive', trimConfidence:0.68,
      lifestyle:'Performance',
      tags:['Track Day','Sport','Urban','High-Output','Aerodynamic'],
      confidence: 0.91,
    } },

  // ── Porsche ───────────────────────────────────────────────────────────────
  { id:'a04', name:'Porsche 911 GT3 RS — Track Edition',
    url: U('porsche 911 race track', 4),
    mimeType:'image/jpeg', dimensions:'1080 × 1080',
    aiStatus: 'approved',
    year:'2024', make:'Porsche', model:'911', trim:'GT3 RS', lifestyle:'Performance',
    tags:['2024','Porsche','911','GT3 RS','Track','Performance'] },
  { id:'a05', name:'Porsche 911 Carrera S — Dark Edition',
    url: U('porsche 911 carrera dark', 5),
    mimeType:'image/jpeg', dimensions:'1080 × 1350',
    aiStatus: 'approved',
    year:'2023', make:'Porsche', model:'911', trim:'Carrera S', lifestyle:'Performance',
    tags:['2023','Porsche','911','Carrera S','Midnight'] },
  { id:'a06', name:'Porsche Carrera — Rear Detail',
    url: U('porsche sports car rear', 6),
    mimeType:'image/jpeg', dimensions:'1080 × 1080',
    aiStatus: 'suggested', needsReview: true,
    aiSuggestion: {
      year:'2023', yearConfidence:0.82,
      make:'Porsche', makeConfidence:0.97,
      model:'911', modelConfidence:0.93,
      trim:'Carrera', trimConfidence:0.71,
      lifestyle:'Performance',
      tags:['Sport','Aerodynamic','Precision','Low-Profile','Track Day'],
      confidence: 0.93,
    } },
  { id:'a07', name:'Porsche Panamera — Night Shift',
    url: U('porsche panamera luxury night', 7),
    mimeType:'image/jpeg', dimensions:'1080 × 1080',
    aiStatus: 'approved',
    year:'2024', make:'Porsche', model:'Panamera', trim:'Turbo S', lifestyle:'Luxury',
    tags:['2024','Porsche','Panamera','Turbo S','Luxury','Night'] },

  // ── Land Rover / Range Rover ──────────────────────────────────────────────
  { id:'a08', name:'Range Rover Sport — Campaign Hero',
    url: U('range rover suv luxury', 8),
    mimeType:'image/jpeg', dimensions:'1280 × 720',
    aiStatus: 'approved',
    year:'2025', make:'Land Rover', model:'Range Rover', trim:'Sport', lifestyle:'Luxury',
    tags:['2025','Land Rover','Range Rover','Sport','Luxury'] },
  { id:'a09', name:'Land Rover Range Rover — Lifestyle',
    url: U('land rover off road adventure', 9),
    mimeType:'image/jpeg', dimensions:'1080 × 1080',
    aiStatus: 'approved',
    year:'2024', make:'Land Rover', model:'Range Rover', lifestyle:'Adventure',
    tags:['2024','Land Rover','Range Rover','Adventure'] },
  { id:'a10', name:'Range Rover — Midnight Black Edit',
    url: U('land rover black suv night', 10),
    mimeType:'image/jpeg', dimensions:'1080 × 1080',
    aiStatus: 'suggested', needsReview: true,
    aiSuggestion: {
      year:'2024', yearConfidence:0.84,
      make:'Land Rover', makeConfidence:0.94,
      model:'Range Rover', modelConfidence:0.90,
      trim:'Autobiography', trimConfidence:0.58,
      lifestyle:'Luxury',
      tags:['Premium','Executive','Night','Prestige','Comfort'],
      confidence: 0.88,
    } },

  // ── Ferrari ───────────────────────────────────────────────────────────────
  { id:'a11', name:'Ferrari 458 Italia — Passion Red',
    url: U('ferrari red sports car', 11),
    mimeType:'image/jpeg', dimensions:'1080 × 1080',
    aiStatus: 'approved',
    year:'2022', make:'Ferrari', model:'458 Italia', lifestyle:'Performance',
    tags:['2022','Ferrari','458 Italia','Red','Italian','Performance'] },
  { id:'a12', name:'Ferrari Purosangue — The Prancing Horse',
    url: U('ferrari luxury supercar', 12),
    mimeType:'image/jpeg', dimensions:'1280 × 720',
    aiStatus: 'approved',
    year:'2024', make:'Ferrari', model:'Purosangue', trim:'V12', lifestyle:'Luxury',
    tags:['2024','Ferrari','Purosangue','V12','Luxury SUV'] },
  { id:'a13', name:'Ferrari — Key Visual Campaign',
    url: U('ferrari prancing horse campaign', 13),
    mimeType:'image/jpeg', dimensions:'1080 × 1350',
    aiStatus: 'suggested', needsReview: true,
    aiSuggestion: {
      year:'2023', yearConfidence:0.80,
      make:'Ferrari', makeConfidence:0.95,
      model:'Roma', modelConfidence:0.88,
      trim:'Spider', trimConfidence:0.64,
      lifestyle:'Performance',
      tags:['Italian','Supercar','Grand Tourer','High-Output','Passion'],
      confidence: 0.91,
    } },

  // ── Lamborghini ───────────────────────────────────────────────────────────
  { id:'a14', name:'Lamborghini Aventador — Sunburst Yellow',
    url: U('lamborghini yellow supercar', 14),
    mimeType:'image/jpeg', dimensions:'1080 × 1080',
    aiStatus: 'approved',
    year:'2022', make:'Lamborghini', model:'Aventador', lifestyle:'Performance',
    tags:['2022','Lamborghini','Aventador','Yellow','Supercar'] },
  { id:'a15', name:'Lamborghini Aventador SVJ — Studio',
    url: U('lamborghini aventador orange', 15),
    mimeType:'image/jpeg', dimensions:'1080 × 1080',
    aiStatus: 'approved',
    year:'2023', make:'Lamborghini', model:'Aventador', trim:'SVJ', lifestyle:'Performance',
    tags:['2023','Lamborghini','Aventador','SVJ','Orange','Supercar'] },
  { id:'a16', name:'Lamborghini — Pre-Fall Campaign',
    url: U('lamborghini supercar lifestyle', 16),
    mimeType:'image/jpeg', dimensions:'1080 × 1080',
    aiStatus: 'suggested', needsReview: true,
    aiSuggestion: {
      year:'2022', yearConfidence:0.76,
      make:'Lamborghini', makeConfidence:0.93,
      model:'Huracán', modelConfidence:0.85,
      trim:'EVO', trimConfidence:0.58,
      lifestyle:'Performance',
      tags:['Supercar','Aerodynamic','Sport','Italian','High-Output'],
      confidence: 0.87,
    } },

  // ── Jeep ──────────────────────────────────────────────────────────────────
  { id:'a17', name:'Jeep Wrangler Rubicon — Desert Storm',
    url: U('jeep wrangler offroad dirt', 17),
    mimeType:'image/jpeg', dimensions:'1080 × 1080',
    aiStatus: 'approved',
    year:'2023', make:'Jeep', model:'Wrangler', trim:'Rubicon', lifestyle:'Off-Road',
    tags:['2023','Jeep','Wrangler','Rubicon','Off-Road','Dirt Road'] },
  { id:'a18', name:'Jeep Wrangler 4xe — Moab Trail Edit',
    url: U('jeep wrangler rocks trail moab', 18),
    mimeType:'image/jpeg', dimensions:'1080 × 1080',
    aiStatus: 'approved',
    year:'2024', make:'Jeep', model:'Wrangler', trim:'4xe Sahara', lifestyle:'Off-Road',
    tags:['2024','Jeep','Wrangler','4xe','Moab','Trail'] },
  { id:'a19', name:'Jeep — Golden Hour Adventure',
    url: U('jeep wrangler sunset golden', 19),
    mimeType:'image/jpeg', dimensions:'1080 × 1080',
    aiStatus: 'suggested', needsReview: true,
    aiSuggestion: {
      year:'2023', yearConfidence:0.78,
      make:'Jeep', makeConfidence:0.92,
      model:'Wrangler', modelConfidence:0.88,
      trim:'Sahara', trimConfidence:0.55,
      lifestyle:'Off-Road',
      tags:['4x4','Adventure','Trail Ready','Sunset','Rugged'],
      confidence: 0.86,
    } },

  // ── Tesla ─────────────────────────────────────────────────────────────────
  { id:'a20', name:'Tesla Model 3 — Clean Commute',
    url: U('tesla electric car urban', 20),
    mimeType:'image/jpeg', dimensions:'1280 × 720',
    aiStatus: 'approved',
    year:'2024', make:'Tesla', model:'Model 3', trim:'Performance', lifestyle:'Urban Commuter',
    tags:['2024','Tesla','Model 3','Electric','Urban Commuter'] },

  // ── Muscle cars ───────────────────────────────────────────────────────────
  { id:'a21', name:'Ford Mustang GT — Sunset Cruise',
    url: U('ford mustang muscle car sunset', 21),
    mimeType:'image/jpeg', dimensions:'1080 × 1080',
    aiStatus: 'approved',
    year:'2022', make:'Ford', model:'Mustang', trim:'GT500', lifestyle:'Performance',
    tags:['2022','Ford','Mustang','GT500','American Muscle','Sunset'] },
  { id:'a22', name:'Classic American Muscle — Blue Thunder',
    url: U('classic american muscle car blue', 22),
    mimeType:'image/jpeg', dimensions:'1080 × 1080',
    aiStatus: 'suggested', needsReview: true,
    aiSuggestion: {
      year:'2019', yearConfidence:0.72,
      make:'Ford', makeConfidence:0.89,
      model:'Mustang', modelConfidence:0.91,
      trim:'Shelby GT350', trimConfidence:0.63,
      lifestyle:'Performance',
      tags:['American Muscle','Classic','V8','Sport','Iconic'],
      confidence: 0.83,
    } },
];

// ─── Breadcrumb separator ─────────────────────────────────────────────────────
const BreadcrumbSep = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0, opacity: 0.4 }}>
    <path d="M4.5 2.5L7.5 6L4.5 9.5" stroke="#686576" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// ─── Dynamic breadcrumb (reactive to store moves) ─────────────────────────────
function Breadcrumb({ folderId }: { folderId: string }) {
  const { folders } = useFolderStore();

  // Build path from live store data — updates immediately after a move
  const crumbs = useMemo<Folder[]>(() => {
    const map = new Map(folders.map(f => [f.id, f]));
    const path: Folder[] = [];
    let cur = map.get(folderId);
    while (cur) {
      path.unshift(cur);
      cur = cur.parentId ? map.get(cur.parentId) : undefined;
    }
    return path;
  }, [folderId, folders]);

  const isUnknown = crumbs.length === 0;
  const SPECIAL_LABELS: Record<string, string> = { archive: 'Archive' };
  const specialLabel = SPECIAL_LABELS[folderId];

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: '2px', minWidth: 0 }}>

      {/* Portal root */}
      <Typography
        component={Link}
        to="/portal/const-internal"
        variant="caption"
        sx={{
          fontSize: 12, fontFamily: 'Roboto, sans-serif', color: '#686576',
          textDecoration: 'none', whiteSpace: 'nowrap',
          '&:hover': { color: '#473bab', textDecoration: 'underline' },
        }}
      >
        Portal
      </Typography>

      {specialLabel ? (
        <>
          <BreadcrumbSep />
          <Typography variant="caption" sx={{ fontSize: 12, color: '#1f1d25', fontWeight: 600 }}>
            {specialLabel}
          </Typography>
        </>
      ) : isUnknown ? (
        <>
          <BreadcrumbSep />
          <Typography variant="caption" sx={{ fontSize: 12, color: '#686576' }}>
            Unknown folder
          </Typography>
        </>
      ) : (
        crumbs.map((crumb, i) => {
          const isLast = i === crumbs.length - 1;
          return (
            <Box key={crumb.id} sx={{ display: 'flex', alignItems: 'center', gap: '2px', minWidth: 0 }}>
              <BreadcrumbSep />
              {isLast ? (
                // Current folder — bold, not a link
                <Typography
                  variant="caption"
                  title={crumb.name}
                  sx={{
                    fontSize: 12, fontFamily: 'Roboto, sans-serif',
                    color: '#1f1d25', fontWeight: 600,
                    maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}
                >
                  {crumb.name}
                </Typography>
              ) : (
                // Ancestor — clickable link
                <Typography
                  component={Link}
                  to={`/portal/${crumb.id}`}
                  title={crumb.name}
                  variant="caption"
                  sx={{
                    fontSize: 12, fontFamily: 'Roboto, sans-serif', color: '#686576',
                    textDecoration: 'none', maxWidth: 160,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    '&:hover': { color: '#473bab', textDecoration: 'underline' },
                  }}
                >
                  {crumb.name}
                </Typography>
              )}
            </Box>
          );
        })
      )}
    </Box>
  );
}

// ─── Portal page (reads folderId from URL) ────────────────────────────────────
function PortalPage() {
  const { folderId = 'const-internal' } = useParams<{ folderId: string }>();
  const [showFolderTree, setShowFolderTree] = useState(true);
  const { isFilterPanelOpen, closeFilterPanel } = useAssetViewStore();
  const { folders } = useFolderStore();

  // Derive folder name from live store so renames reflect immediately
  const folderName = useMemo(
    () => folders.find(f => f.id === folderId)?.name ?? 'Portal',
    [folderId, folders]
  );

  const handleToggleFolderTree = () => {
    if (!showFolderTree && isFilterPanelOpen) closeFilterPanel();
    setShowFolderTree(o => !o);
  };

  useEffect(() => {
    if (isFilterPanelOpen) setShowFolderTree(false);
    else setShowFolderTree(true);
  }, [isFilterPanelOpen]);

  const leftPaneVisible = showFolderTree || isFilterPanelOpen;

  return (
    <Box sx={{
      display: 'flex',
      height: '100vh',
      bgcolor: '#f0f2f4',
      pr: '8px',
      gap: '8px',
      overflow: 'hidden',
    }}>
      <Sidebar activeItem="portal" />

      <Box sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        pt: '8px',
        pb: '8px',
        gap: '8px',
        overflow: 'hidden',
        minWidth: 0,
      }}>
        <Topbar />

        <Box sx={{ flex: 1, overflow: 'hidden', display: 'flex', gap: '16px', minHeight: 0 }}>

          {leftPaneVisible && (
            <Box sx={{ width: 320, flexShrink: 0, height: '100%' }}>
              {isFilterPanelOpen ? (
                <LeftPaneShell
                  title="Filters"
                  onClose={closeFilterPanel}
                  badge={<FilterPanelBadge />}
                  actions={<FilterPanelClearAll />}
                >
                  <FilterPanel />
                </LeftPaneShell>
              ) : (
                <LeftPaneShell
                  title="Folders"
                  onClose={() => setShowFolderTree(false)}
                >
                  <FolderTree
                    onClose={() => setShowFolderTree(false)}
                    noShell
                    activeFolderId={folderId}
                  />
                </LeftPaneShell>
              )}
            </Box>
          )}

          <Box sx={{
            flex: 1,
            bgcolor: '#ffffff',
            borderRadius: '16px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            minWidth: 0,
          }}>
            <Box sx={{ px: 3, pt: 1.5, pb: 0, flexShrink: 0 }}>
              <Breadcrumb folderId={folderId} />
            </Box>

            <Box sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
              {/* Archived folders section — only visible on /portal/archive */}
              {folderId === 'archive' && <ArchivedFoldersSection />}

              <Box sx={{ flex: 1, overflow: 'hidden', px: 2, pb: 2, minWidth: 0 }}>
                <AssetGrid
                  title={folderId === 'archive' ? 'Archive' : folderName}
                  initialAssets={DEMO_ASSETS}
                  onToggleFolderTree={handleToggleFolderTree}
                  folderTreeOpen={showFolderTree && !isFilterPanelOpen}
                  showArchived={folderId === 'archive'}
                />
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* ── Activity monitors — float over the page ─────────────────────── */}
      <UploadActivityMonitor />
      <DownloadActivityMonitor />
    </Box>
  );
}

// ─── App shell ────────────────────────────────────────────────────────────────
export function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Routes>
        <Route path="/" element={<Navigate to="/portal/const-internal" replace />} />
        <Route path="/portal/:folderId" element={<PortalPage />} />
        <Route path="/portal" element={<Navigate to="/portal/const-internal" replace />} />
      </Routes>
    </ThemeProvider>
  );
}
