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
import Create from './pages/create/Create.jsx';
import Config from './pages/header/Config.jsx'
import Notifications from './pages/header/Notifications.jsx'
import Friends from './pages/header/Friends.jsx'

// Lazy-loaded components
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Workspace = lazy(() => import('./pages/Workspace'));
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
    path: '/friends',
    element: (
      <ProtectedRoute>
        <Layout>
          <Friends />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/notifications',
    element: (
      <ProtectedRoute>
        <Layout>
          <Notifications />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: '*',
    element: <Error />,
  },
      {
    path: '/create',
    element: (
        <Layout>
          <Create />
        </Layout>
    ),
  },
];

export default routes;
