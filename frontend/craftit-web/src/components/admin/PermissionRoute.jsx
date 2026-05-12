import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { hasPermission } from '../../lib/permissions';
import { Loader } from '../ui/Loader';

export default function PermissionRoute({ children, requiredPermission }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA] dark:bg-slate-900">
        <Loader size={32} />
      </div>
    );
  }

  if (!user || !user.is_staff) {
    return <Navigate to="/dashboard" replace />;
  }

  if (requiredPermission && !hasPermission(user, requiredPermission)) {
    return <Navigate to="/admin/unauthorized" replace />;
  }

  return children;
}
