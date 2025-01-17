import React, { lazy } from 'react';
import Layout from './components/Layout';

// Non-lazy components
import Login from './pages/Login';
import Error from './pages/NotFound';

// Lazy-loaded components
const Dashboard = lazy(() => import('./pages/Dashboard'));
const TaskManager = lazy(() => import('./modules/task-manager/TaskManager'));
const Portfolio = lazy(() => import('./modules/portfolio/Portfolio'));
const ExpenseTracker = lazy(() => import('./modules/expense-tracker/ExpenseTracker'));
const SocialNetwork = lazy(() => import('./modules/social-network/SocialNetwork'));
const AppointmentScheduler = lazy(() => import('./modules/appointment-scheduler/AppointmentScheduler'));



const routes = [
  {
    path: '/',
    element: <Login />, // Sans Header
  },
  {
    path: '*',
    element: <Error />, 
  },
  {
    path: '/dashboard',
    element: (
      <Layout>
        <Dashboard />
      </Layout>
    ), 
  },
  {
    path: '/task-manager',
    element: (
      <Layout>
        <TaskManager />
      </Layout>
    ), 
  },
  {
    path: '/portfolio',
    element: (
      <Layout>
        <Portfolio />
      </Layout>
    ), 
  },
  {
    path: '/expense-tracker',
    element: (
      <Layout>
        <ExpenseTracker />
      </Layout>
    ), 
  },
  {
    path: '/social-network',
    element: (
      <Layout>
        <SocialNetwork />
      </Layout>
    ), 
  },
  {
    path: '/appointment-scheduler',
    element: (
      <Layout>
        <AppointmentScheduler />
      </Layout>
    ), 
  },
];

export default routes;
