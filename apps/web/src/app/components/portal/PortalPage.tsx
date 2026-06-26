import React, { useState, useEffect, useMemo } from 'react';
import Box from '@mui/material/Box';
import { usePaneResize, PaneResizer } from '../PaneResizer';
import { InventoryDataGrid } from './features/inventory-datagrid/InventoryDataGrid';
import { FolderTree } from './ui/FolderTree';
import { FilterPanel, FilterPanelBadge, FilterPanelClearAll } from './features/filter-panel/FilterPanel';
import { LeftPaneShell } from './ui/LeftPaneShell';
import { useAssetViewStore } from './store/useAssetViewStore';
import { useFolderStore, Folder } from './store/useFolderStore';
import { UploadActivityMonitor } from './ui/UploadActivityMonitor';
import { DownloadActivityMonitor } from './ui/DownloadActivityMonitor';
import { ArchivedFoldersSection } from './ui/ArchivedFoldersSection';
import { usePortalNav } from './PortalNavContext';
import { Asset } from './types/asset';
import { BreadcrumbBar } from '../BreadcrumbBar';

// ─── Demo assets (22 vehicle lifestyle images) ────────────────────────────────
const PHOTO_IDS = [
  '1503376780353-7e6692767b70',
  '1555215695-3004980ad54e',
  '1514867644123-6385d58d3cd4',
  '1494976388531-d1058494cdd8',
  '1544636331-e26879cd4d9b',
  '1563720223185-11003d516935',
  '1509440159596-0249088772ff',
  '1568605117036-5fe5e7bab0b7',
  '1533473359331-0135ef1b58bf',
  '1570733577524-3a047079e80d',
  '1492144534655-ae79c964c9d7',
  '1583121274602-3e2820c69888',
  '1610647752706-3bb12232b3ab',
  '1552519507-da3b142c6e3d',
  '1606664515524-ed2f786a0bd6',
  '1583121274602-3e2820c69888',
  '1541899481282-d53bffe3c35d',
  '1568605117036-5fe5e7bab0b7',
  '1533473359331-0135ef1b58bf',
  '1606664515524-ed2f786a0bd6',
  '1552519507-da3b142c6e3d',
  '1503376780353-7e6692767b70',
];
const U = (_kw: string, sig: number) =>
  `https://images.unsplash.com/photo-${PHOTO_IDS[sig - 1]}?w=800&h=540&fit=crop&q=80`;

const DEMO_ASSETS: Asset[] = [
  { id:'a01', name:'BMW 7 Series — Luxury Sedan Campaign',      url:U('bmw sedan luxury',1),           mimeType:'image/jpeg', dimensions:'1080 × 1080', aiStatus:'approved',  year:'2024', make:'BMW',         model:'7 Series',     trim:'M Sport',       lifestyle:'Luxury',        tags:['2024','BMW','7 Series','M Sport','Lifestyle'] },
  { id:'a02', name:'BMW M5 Competition — City Drive',            url:U('bmw m5 performance car',2),     mimeType:'image/jpeg', dimensions:'1280 × 720',  aiStatus:'approved',  year:'2023', make:'BMW',         model:'M5',           trim:'Competition',   lifestyle:'Performance',   tags:['2023','BMW','M5','Competition','Sport'] },
  { id:'a03', name:'BMW M3 — Urban Lifestyle',                   url:U('bmw sports car city',3),        mimeType:'image/jpeg', dimensions:'1080 × 1080', aiStatus:'suggested', needsReview:true, aiSuggestion:{ year:'2024', yearConfidence:0.87, make:'BMW', makeConfidence:0.96, model:'M3', modelConfidence:0.91, trim:'Competition xDrive', trimConfidence:0.68, lifestyle:'Performance', tags:['Track Day','Sport','Urban','High-Output','Aerodynamic'], confidence:0.91 } },
  { id:'a04', name:'Porsche 911 GT3 RS — Track Edition',         url:U('porsche 911 race track',4),     mimeType:'image/jpeg', dimensions:'1080 × 1080', aiStatus:'approved',  year:'2024', make:'Porsche',     model:'911',          trim:'GT3 RS',        lifestyle:'Performance',   tags:['2024','Porsche','911','GT3 RS','Track','Performance'] },
  { id:'a05', name:'Porsche 911 Carrera S — Dark Edition',       url:U('porsche 911 carrera dark',5),   mimeType:'image/jpeg', dimensions:'1080 × 1350', aiStatus:'approved',  year:'2023', make:'Porsche',     model:'911',          trim:'Carrera S',     lifestyle:'Performance',   tags:['2023','Porsche','911','Carrera S','Midnight'] },
  { id:'a06', name:'Porsche Carrera — Rear Detail',              url:U('porsche sports car rear',6),    mimeType:'image/jpeg', dimensions:'1080 × 1080', aiStatus:'suggested', needsReview:true, aiSuggestion:{ year:'2023', yearConfidence:0.82, make:'Porsche', makeConfidence:0.97, model:'911', modelConfidence:0.93, trim:'Carrera', trimConfidence:0.71, lifestyle:'Performance', tags:['Sport','Aerodynamic','Precision','Low-Profile','Track Day'], confidence:0.93 } },
  { id:'a07', name:'Porsche Panamera — Night Shift',             url:U('porsche panamera luxury night',7), mimeType:'image/jpeg', dimensions:'1080 × 1080', aiStatus:'approved', year:'2024', make:'Porsche', model:'Panamera', trim:'Turbo S', lifestyle:'Luxury', tags:['2024','Porsche','Panamera','Turbo S','Luxury','Night'] },
  { id:'a08', name:'Range Rover Sport — Campaign Hero',          url:U('range rover suv luxury',8),     mimeType:'image/jpeg', dimensions:'1280 × 720',  aiStatus:'approved',  year:'2025', make:'Land Rover',  model:'Range Rover',  trim:'Sport',         lifestyle:'Luxury',        tags:['2025','Land Rover','Range Rover','Sport','Luxury'] },
  { id:'a09', name:'Land Rover Range Rover — Lifestyle',         url:U('land rover off road adventure',9), mimeType:'image/jpeg', dimensions:'1080 × 1080', aiStatus:'approved', year:'2024', make:'Land Rover', model:'Range Rover', lifestyle:'Adventure', tags:['2024','Land Rover','Range Rover','Adventure'] },
  { id:'a10', name:'Range Rover — Midnight Black Edit',          url:U('land rover black suv night',10), mimeType:'image/jpeg', dimensions:'1080 × 1080', aiStatus:'suggested', needsReview:true, aiSuggestion:{ year:'2024', yearConfidence:0.84, make:'Land Rover', makeConfidence:0.94, model:'Range Rover', modelConfidence:0.90, trim:'Autobiography', trimConfidence:0.58, lifestyle:'Luxury', tags:['Premium','Executive','Night','Prestige','Comfort'], confidence:0.88 } },
  { id:'a11', name:'Ferrari 458 Italia — Passion Red',           url:U('ferrari red sports car',11),    mimeType:'image/jpeg', dimensions:'1080 × 1080', aiStatus:'approved',  year:'2022', make:'Ferrari',     model:'458 Italia',              lifestyle:'Performance',   tags:['2022','Ferrari','458 Italia','Red','Italian','Performance'] },
  { id:'a12', name:'Ferrari Purosangue — The Prancing Horse',   url:U('ferrari luxury supercar',12),   mimeType:'image/jpeg', dimensions:'1280 × 720',  aiStatus:'approved',  year:'2024', make:'Ferrari',     model:'Purosangue',   trim:'V12',           lifestyle:'Luxury',        tags:['2024','Ferrari','Purosangue','V12','Luxury SUV'] },
  { id:'a13', name:'Ferrari — Key Visual Campaign',              url:U('ferrari prancing horse campaign',13), mimeType:'image/jpeg', dimensions:'1080 × 1350', aiStatus:'suggested', needsReview:true, aiSuggestion:{ year:'2023', yearConfidence:0.80, make:'Ferrari', makeConfidence:0.95, model:'Roma', modelConfidence:0.88, trim:'Spider', trimConfidence:0.64, lifestyle:'Performance', tags:['Italian','Supercar','Grand Tourer','High-Output','Passion'], confidence:0.91 } },
  { id:'a14', name:'Lamborghini Aventador — Sunburst Yellow',   url:U('lamborghini yellow supercar',14), mimeType:'image/jpeg', dimensions:'1080 × 1080', aiStatus:'approved', year:'2022', make:'Lamborghini', model:'Aventador', lifestyle:'Performance', tags:['2022','Lamborghini','Aventador','Yellow','Supercar'] },
  { id:'a15', name:'Lamborghini Aventador SVJ — Studio',        url:U('lamborghini aventador orange',15), mimeType:'image/jpeg', dimensions:'1080 × 1080', aiStatus:'approved', year:'2023', make:'Lamborghini', model:'Aventador', trim:'SVJ', lifestyle:'Performance', tags:['2023','Lamborghini','Aventador','SVJ','Orange','Supercar'] },
  { id:'a16', name:'Lamborghini — Pre-Fall Campaign',           url:U('lamborghini supercar lifestyle',16), mimeType:'image/jpeg', dimensions:'1080 × 1080', aiStatus:'suggested', needsReview:true, aiSuggestion:{ year:'2022', yearConfidence:0.76, make:'Lamborghini', makeConfidence:0.93, model:'Huracán', modelConfidence:0.85, trim:'EVO', trimConfidence:0.58, lifestyle:'Performance', tags:['Supercar','Aerodynamic','Sport','Italian','High-Output'], confidence:0.87 } },
  { id:'a17', name:'Jeep Wrangler Rubicon — Desert Storm',      url:U('jeep wrangler offroad dirt',17), mimeType:'image/jpeg', dimensions:'1080 × 1080', aiStatus:'approved',  year:'2023', make:'Jeep',        model:'Wrangler',     trim:'Rubicon',       lifestyle:'Off-Road',      tags:['2023','Jeep','Wrangler','Rubicon','Off-Road','Dirt Road'] },
  { id:'a18', name:'Jeep Wrangler 4xe — Moab Trail Edit',       url:U('jeep wrangler rocks trail moab',18), mimeType:'image/jpeg', dimensions:'1080 × 1080', aiStatus:'approved', year:'2024', make:'Jeep', model:'Wrangler', trim:'4xe Sahara', lifestyle:'Off-Road', tags:['2024','Jeep','Wrangler','4xe','Moab','Trail'] },
  { id:'a19', name:'Jeep — Golden Hour Adventure',               url:U('jeep wrangler sunset golden',19), mimeType:'image/jpeg', dimensions:'1080 × 1080', aiStatus:'suggested', needsReview:true, aiSuggestion:{ year:'2023', yearConfidence:0.78, make:'Jeep', makeConfidence:0.92, model:'Wrangler', modelConfidence:0.88, trim:'Sahara', trimConfidence:0.55, lifestyle:'Off-Road', tags:['4x4','Adventure','Trail Ready','Sunset','Rugged'], confidence:0.86 } },
  { id:'a20', name:'Tesla Model 3 — Clean Commute',              url:U('tesla electric car urban',20),  mimeType:'image/jpeg', dimensions:'1280 × 720',  aiStatus:'approved',  year:'2024', make:'Tesla',       model:'Model 3',      trim:'Performance',   lifestyle:'Urban Commuter', tags:['2024','Tesla','Model 3','Electric','Urban Commuter'] },
  { id:'a21', name:'Ford Mustang GT — Sunset Cruise',            url:U('ford mustang muscle car sunset',21), mimeType:'image/jpeg', dimensions:'1080 × 1080', aiStatus:'approved', year:'2022', make:'Ford', model:'Mustang', trim:'GT500', lifestyle:'Performance', tags:['2022','Ford','Mustang','GT500','American Muscle','Sunset'] },
  { id:'a22', name:'Classic American Muscle — Blue Thunder',     url:U('classic american muscle car blue',22), mimeType:'image/jpeg', dimensions:'1080 × 1080', aiStatus:'suggested', needsReview:true, aiSuggestion:{ year:'2019', yearConfidence:0.72, make:'Ford', makeConfidence:0.89, model:'Mustang', modelConfidence:0.91, trim:'Shelby GT350', trimConfidence:0.63, lifestyle:'Performance', tags:['American Muscle','Classic','V8','Sport','Iconic'], confidence:0.83 } },
];

const HANDLE_W = 16;
const MIN_LEFT = 160;
const MAX_LEFT = 500;

// ─── Portal page ──────────────────────────────────────────────────────────────
export function PortalPage() {
  const { currentFolderId, navigateToFolder } = usePortalNav();
  const [showFolderTree, setShowFolderTree] = useState(true);
  const { width: leftPaneWidth, isDragging, handleResizeStart } = usePaneResize({ initialWidth: 320, min: MIN_LEFT, max: MAX_LEFT, side: 'left' });
  const { isFilterPanelOpen, closeFilterPanel } = useAssetViewStore();
  const { folders } = useFolderStore();

  const folderName = useMemo(
    () => folders.find(f => f.id === currentFolderId)?.name ?? 'Portal',
    [currentFolderId, folders]
  );

  const { items: breadcrumbItems, activeLabel: breadcrumbActive } = useMemo(() => {
    const map = new Map(folders.map(f => [f.id, f]));
    const root = { label: 'Portal', onClick: () => navigateToFolder('const-internal') };

    if (currentFolderId === 'archive') {
      return { items: [root], activeLabel: 'Archive' };
    }

    const path: Folder[] = [];
    let cur = map.get(currentFolderId);
    while (cur) {
      path.unshift(cur);
      cur = cur.parentId ? map.get(cur.parentId) : undefined;
    }

    if (path.length === 0) {
      return { items: [root], activeLabel: 'Unknown folder' };
    }

    const ancestors = path.slice(0, -1).map(f => ({ label: f.name, onClick: () => navigateToFolder(f.id) }));
    return { items: [root, ...ancestors], activeLabel: path[path.length - 1].name };
  }, [currentFolderId, folders, navigateToFolder]);

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
    <Box sx={{ flex: 1, display: 'flex', height: '100%', overflow: 'hidden', cursor: isDragging ? 'col-resize' : undefined }}>
      {/* Left pane + resize handle slide out together via ml transition */}
      <Box sx={{
        display: 'flex',
        flexShrink: 0,
        height: '100%',
        width: leftPaneWidth + HANDLE_W,
        ml: leftPaneVisible ? 0 : `${-(leftPaneWidth + HANDLE_W)}px`,
        transition: isDragging ? 'none' : 'margin-left 350ms cubic-bezier(0.4, 0, 0.2, 1)',
      }}>
        <Box sx={{ width: leftPaneWidth, flexShrink: 0, height: '100%', overflow: 'hidden' }}>
          {isFilterPanelOpen ? (
            <LeftPaneShell title="Filters" onClose={closeFilterPanel} badge={<FilterPanelBadge />} actions={<FilterPanelClearAll />}>
              <FilterPanel />
            </LeftPaneShell>
          ) : (
            <LeftPaneShell title="Folders" onClose={() => setShowFolderTree(false)}>
              <FolderTree onClose={() => setShowFolderTree(false)} noShell />
            </LeftPaneShell>
          )}
        </Box>
        <PaneResizer onMouseDown={handleResizeStart} isDragging={isDragging} />
      </Box>

      <Box sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', minWidth: 0, bgcolor: 'background.paper', borderRadius: 4, boxShadow: '0px 1px 2px rgba(0,0,0,0.08)', border: '1px solid rgba(0,0,0,0.04)' }}>
        <Box sx={{ px: 3, pt: 1.5, pb: 0, flexShrink: 0 }}>
          <BreadcrumbBar items={breadcrumbItems} activeLabel={breadcrumbActive} />
        </Box>
        <Box sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          {currentFolderId === 'archive' && <ArchivedFoldersSection />}
          <Box sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <InventoryDataGrid
                title={currentFolderId === 'archive' ? 'Archive' : folderName}
                initialAssets={DEMO_ASSETS}
                onToggleFolderTree={handleToggleFolderTree}
                folderTreeOpen={showFolderTree && !isFilterPanelOpen}
              />
          </Box>
        </Box>
      </Box>

      <UploadActivityMonitor />
      <DownloadActivityMonitor />
    </Box>
  );
}
