
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import LoadingScreen from '@/components/layout/LoadingScreen';

interface AuthGuardProps {
  requireAuth?: boolean;
  redirectTo?: string;
  children?: React.ReactNode;
}

/**
 * AuthGuard component that handles authentication-based routing:
 * - If requireAuth=true: Redirects unauthenticated users to login
 * - If requireAuth=false: Redirects authenticated users to dashboard
 * - Handles loading states automatically
 */
const AuthGuard: React.FC<AuthGuardProps> = ({
  requireAuth = true,
  redirectTo,
  children
}) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Show loading screen while determining authentication state
  if (loading) {
    return <LoadingScreen />;
  }

  // Handle authentication check
  if (requireAuth && !isAuthenticated) {
    // User is not authenticated but authentication is required
    // Remember where they were trying to go for potential redirect after login
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (!requireAuth && isAuthenticated) {
    // User is already authenticated but the route doesn't require auth (like login page)
    // Redirect them to the specified redirect or dashboard
    return <Navigate to={redirectTo || "/dashboard"} replace />;
  }

  // If using as wrapper component with children
  if (children) {
    return <>{children}</>;
  }

  // If using as layout component with Outlet
  return <Outlet />;
};

export default AuthGuard;
