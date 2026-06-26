import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';

interface Tab {
  id: string;
  label: string;
}

interface TabNavigationProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export function TabNavigation({ tabs, activeTab, onTabChange }: TabNavigationProps) {
  const currentIndex = tabs.findIndex(t => t.id === activeTab);

  const handleChange = (_: React.SyntheticEvent, newIndex: number) => {
    onTabChange(tabs[newIndex].id);
  };

  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
      <Tabs
        value={currentIndex === -1 ? 0 : currentIndex}
        onChange={handleChange}
        sx={{
          minHeight: 41,
          '& .MuiTab-root': {
            fontSize: '0.875rem',
            fontWeight: 500,
            letterSpacing: '0.4px',
            lineHeight: 1.5,
            textTransform: 'capitalize',
            minHeight: 41,
            py: 1,
            px: 2,
            color: 'text.secondary',
          },
          '& .MuiTab-root.Mui-selected': {
            color: 'primary.main',
          },
          '& .MuiTabs-indicator': {
            backgroundColor: 'primary.main',
          },
        }}
      >
        {tabs.map(tab => (
          <Tab key={tab.id} label={tab.label} disableRipple />
        ))}
      </Tabs>
    </Box>
  );
}
