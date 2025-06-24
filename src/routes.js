import React, { lazy } from 'react';
import Layout from './components/general/Layout';
import ProtectedRoute from './components/general/ProtectedRoute';

// Non-lazy components
import Accueil from './pages/accueil';
import Error from './pages/NotFound';
import LoginNew from './pages/LoginNew';

// Lazy-loaded components
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Workspace = lazy(() => import('./pages/Workspace'));

const routes = [
  {
    path: '/',
    element: <LoginNew />, // Accessible sans authentification
  },
    {
    path: '/login',
    element: <LoginNew />, // Accessible sans authentification
  },
  {
    path: '*',
    element: <Error />,
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <Layout>
          <Dashboard />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
  path: '/workspace/:id',
  element: (
    <ProtectedRoute>
      <Layout>
        <React.Suspense fallback={<div>Chargement du workspace...</div>}>
          <Workspace />
        </React.Suspense>
      </Layout>
    </ProtectedRoute>
  ),
},

];

export default routes;
