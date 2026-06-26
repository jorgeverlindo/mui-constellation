import { useState } from 'react';
import Box from '@mui/material/Box';
import { WebMonitoringContent } from '../app/components/WebMonitoringContent';
import { WebMonitoringPanel } from '../app/components/WebMonitoringPanel';
import { WebMonitoringModal } from '../app/components/WebMonitoringModal';
import { WebMonitoringConfigModal } from '../app/components/WebMonitoringConfigModal';
import { WCM_DATA } from '../app/components/WebMonitoringContent';
import type { WCMItem } from '../data/types/compliance';
import { DateRange } from '../app/components/DateRangePicker';

export function PortalScreen() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [panelMode, setPanelMode] = useState<'view' | 'create'>('view');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [userAddedInfractions, setUserAddedInfractions] = useState<WCMItem[]>([]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(2025, 0, 1),
    to: new Date(2025, 11, 31),
  });

  const selectedItem = selectedId
    ? [...userAddedInfractions, ...WCM_DATA].find(item => item.id === selectedId)
    : undefined;

  const isPanelOpen = !!selectedId || panelMode === 'create';

  const handleAddInfraction = () => {
    setSelectedId(null);
    setPanelMode('create');
  };

  const handleSaveInfraction = (infraction: WCMItem) => {
    setUserAddedInfractions(prev => [infraction, ...prev]);
    setSelectedId(infraction.id);
    setPanelMode('view');
  };

  const handleSelectItem = (id: string) => {
    setSelectedId(id);
    setPanelMode('view');
  };

  const handleClosePanel = () => {
    setSelectedId(null);
    setPanelMode('view');
  };

  return (
    <Box sx={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      {/* Main table */}
      <Box sx={{ flex: 1, minWidth: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <WebMonitoringContent
          selectedId={selectedId}
          onSelectItem={handleSelectItem}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          userAddedInfractions={userAddedInfractions}
          onAddInfraction={handleAddInfraction}
          onOpenWebMonitoringConfig={() => setIsConfigOpen(true)}
          userType="oem"
        />
      </Box>

      {/* Right panel */}
      {isPanelOpen && (
        <Box sx={{ width: 480, flexShrink: 0, borderLeft: '1px solid rgba(0,0,0,0.08)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <WebMonitoringPanel
            item={selectedItem}
            onClose={handleClosePanel}
            onOpenModal={() => selectedItem && setIsModalOpen(true)}
            mode={panelMode}
            onSave={handleSaveInfraction}
            userType="oem"
          />
        </Box>
      )}

      {/* Full-size modal */}
      {selectedItem && (
        <WebMonitoringModal
          item={selectedItem}
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}

      {/* Config modal */}
      <WebMonitoringConfigModal
        open={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
      />
    </Box>
  );
}
