import { RouterProvider } from 'react-router';
import { ConstellationProvider } from '@jorgeverlindo/constellation-ux';
import { router } from './routes';
import { LanguageProvider } from './contexts/LanguageContext';
import { ClientProvider } from './contexts/ClientContext';
import { FilterProvider } from './contexts/FilterContext';
import { WorkflowProvider } from './contexts/WorkflowContext';
import { ComplianceProvider } from './contexts/ComplianceContext';
import { InventoryProvider } from './contexts/InventoryContext';
import { SnackbarHost } from './components/Snackbar';

export default function App() {
  return (
    <ConstellationProvider>
      <LanguageProvider>
        <ClientProvider>
          <FilterProvider>
            <WorkflowProvider>
              <ComplianceProvider>
                <InventoryProvider>
                  <RouterProvider router={router} />
                  <SnackbarHost />
                </InventoryProvider>
              </ComplianceProvider>
            </WorkflowProvider>
          </FilterProvider>
        </ClientProvider>
      </LanguageProvider>
    </ConstellationProvider>
  );
}
