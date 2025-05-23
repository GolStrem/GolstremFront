import React, { lazy } from 'react';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Non-lazy components
import Login from './pages/Login';
import Error from './pages/NotFound';

// Lazy-loaded components
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Portfolio = lazy(() => import('./modules/portfolio/Portfolio'));
const ExpenseTracker = lazy(() => import('./modules/expense-tracker/ExpenseTracker'));
const SocialNetwork = lazy(() => import('./modules/social-network/SocialNetwork'));
const AppointmentScheduler = lazy(() => import('./modules/appointment-scheduler/AppointmentScheduler'));
const Workspace = lazy(() => import('./pages/Workspace'));

const routes = [
  {
    path: '/',
    element: <Login />, // Accessible sans authentification
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
    path: '/portfolio',
    element: (
      <ProtectedRoute>
        <Layout>
          <Portfolio />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/expense-tracker',
    element: (
      <ProtectedRoute>
        <Layout>
          <ExpenseTracker />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/social-network',
    element: (
      <ProtectedRoute>
        <Layout>
          <SocialNetwork />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/appointment-scheduler',
    element: (
      <ProtectedRoute>
        <Layout>
          <AppointmentScheduler />
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
