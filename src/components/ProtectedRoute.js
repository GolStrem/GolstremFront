import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  const token = localStorage.getItem('token');

  // Auth Redux ou fallback localStorage
  return isAuthenticated || token ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;
