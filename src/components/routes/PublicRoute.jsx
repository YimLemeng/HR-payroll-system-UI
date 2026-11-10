import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * PublicRoute:
 * Prevents authenticated users from seeing /login.
 * If user logs in, they cannot click browser 'Back' to return to Login.
 */
const PublicRoute = ({ children }) => {
  const { isAuthenticated, isInitializing } = useAuth();

  useEffect(() => {
    // If logged in, block browser back button to prevent returning to Login
    if (isAuthenticated) {
      window.history.pushState(null, '', window.location.href);
      const handlePopState = () => {
        window.history.pushState(null, '', window.location.href);
      };
      window.addEventListener('popstate', handlePopState);
      return () => window.removeEventListener('popstate', handlePopState);
    }
  }, [isAuthenticated]);

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-[#070a13] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    // Redirect to /dashboard and REPLACE history state
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default PublicRoute;
