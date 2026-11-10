import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * ProtectedRoute:
 * - Prevents unauthenticated users from accessing protected views.
 * - Prevents navigating back into private views after logout.
 * - Enforces Role-Based Access Control (RBAC) via `allowedRoles`.
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, isInitializing, user } = useAuth();
  const location = useLocation();

  useEffect(() => {
    // Prevent navigating back to unauthenticated pages
    window.history.pushState(null, '', window.location.href);
    const handlePopState = () => {
      window.history.pushState(null, '', window.location.href);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isAuthenticated]);

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-[#070a13] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Not logged in -> Redirect to /login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Role-Based Access Control (RBAC): Check authorized roles
  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = user?.role ? user.role.replace('ROLE_', '') : null;
    const isAuthorized = allowedRoles.some((role) => role.replace('ROLE_', '') === userRole);
    if (!isAuthorized) {
      console.warn(`[Security] Access denied: User role '${userRole}' lacks required roles: ${allowedRoles.join(', ')}`);
      return <Navigate to="/dashboard" replace state={{ accessDenied: true }} />;
    }
  }

  return children;
};

export default ProtectedRoute;
