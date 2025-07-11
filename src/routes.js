import React, { lazy } from 'react';
import Layout from './components/general/Layout';
import ProtectedRoute from './components/general/ProtectedRoute';

// Non-lazy components
import Accueil from './pages/accueil';
import Error from './pages/NotFound';
import LoginNew from './pages/LoginNew';
import LnResetPasswordModal from './components/login/LnResetPasswordModal'; 

// Lazy-loaded components
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Workspace = lazy(() => import('./pages/Workspace'));
const Config = lazy(() => import('./pages/Config'));

const routes = [
  {
    path: '/',
    element: <Accueil/>,
  },
  {
    path: '/login',
    element: <LoginNew />,
  },
  {
    path: '/reset-password',
    element: <LnResetPasswordModal />,
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
    path: '/config',
    element: (
      <ProtectedRoute>
        <Layout>
          <Config />
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
  {
    path: '*',
    element: <Error />,
  },
];

export default routes;
