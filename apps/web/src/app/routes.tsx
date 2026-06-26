import { createBrowserRouter, Navigate } from 'react-router';
import AppContent from './AppContent';

// Same route table as the original vw-funds-2 app.
export const router = createBrowserRouter([
  { path: '/',                                         element: <Navigate to="/OEM/Overview" replace /> },
  { path: '/OEM/:tab',                                 Component: AppContent },
  { path: '/OEM/:tab/:vinSlug',                        Component: AppContent },
  { path: '/:brand/OEM/:tab',                          Component: AppContent },
  { path: '/:brand/OEM/:tab/:vinSlug',                 Component: AppContent },
  { path: '/:brand/dealership/:tab',                   Component: AppContent },
  { path: '/:brand/dealership/:tab/:vinSlug',          Component: AppContent },
  { path: '/:brand/dealership-singular/:tab',          Component: AppContent },
  { path: '/:brand/dealership-singular/:tab/:vinSlug', Component: AppContent },
  { path: '/:brand/dealership-emich/:tab',             Component: AppContent },
  { path: '/:brand/dealership-emich/:tab/:vinSlug',    Component: AppContent },
  { path: '*',                                         element: <Navigate to="/OEM/Overview" replace /> },
]);
