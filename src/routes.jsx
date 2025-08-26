import React, { lazy } from 'react';
import Layout from './components/general/Layout';
import { ProtectedRoute } from '@service';

// Non-lazy components
import Accueil from './pages/accueil';
import Error from './pages/NotFound';
import LoginNew from './pages/LoginNew';
import LnResetPasswordModal from './components/login/LnResetPasswordModal'; 
import MenuFiche from './pages/fiche/MenuFiche';
import LockScreen from './pages/LockScreen';
import MenuUnivers from './pages/univers/MenuUnivers';

// Lazy-loaded components
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Workspace = lazy(() => import('./pages/Workspace'));
const Config = lazy(() => import('./pages/Config'));
const Fiche = lazy(() => import ('./pages/fiche/CreateFiche'))

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
    path: '/lockscreen',
    element: (
      <ProtectedRoute>
        <Layout>
          <LockScreen />
        </Layout>
      </ProtectedRoute>
    ),
  },
    {
    path: '/fiches',
    element: (
      <ProtectedRoute>
        <Layout>
          <MenuFiche />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/fiches/:type/:id',
    element: (
      <ProtectedRoute>
        <Layout>
          <MenuFiche />
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
    path: '/ficheDetail/:id',
    element: (
      
        <Layout>
          <Fiche />
        </Layout>
      
    ),
  },
      {
    path: '/univers',
    element: (
      <ProtectedRoute>
        <Layout>
          <MenuUnivers />
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
