import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, admin, loading } = useContext(AuthContext);

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (adminOnly) {
    if (!admin) return <Navigate to="/admin/login" replace />;
    return children;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
