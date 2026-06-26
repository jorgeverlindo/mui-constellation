import React, { createContext, useContext, useState } from 'react';

interface PortalNavContextValue {
  currentFolderId: string;
  navigateToFolder: (id: string) => void;
}

const PortalNavContext = createContext<PortalNavContextValue>({
  currentFolderId: 'const-internal',
  navigateToFolder: () => undefined,
});

export function PortalNavProvider({ children }: { children: React.ReactNode }) {
  const [currentFolderId, setCurrentFolderId] = useState('const-internal');

  return (
    <PortalNavContext.Provider value={{ currentFolderId, navigateToFolder: setCurrentFolderId }}>
      {children}
    </PortalNavContext.Provider>
  );
}

export function usePortalNav() {
  return useContext(PortalNavContext);
}
