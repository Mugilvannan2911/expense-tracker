import React from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context';
import ProtectedRoute from './ProtectedRoute';
import LoginPage from '../../pages/auth/LoginPage';
import DashboardPage from '../../pages/dashboard/DashboardPage';

/**
 * Public route wrapper for login/register pages.
 * If user is already authenticated, redirects them straight to /dashboard.
 */
const PublicAuthRoute: React.FC<{ defaultSignUp?: boolean }> = ({ defaultSignUp = false }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // If already authenticated, forward to the dashboard (or the intended redirect path)
  if (!isLoading && isAuthenticated) {
    const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';
    return <Navigate to={from} replace />;
  }

  return (
    <LoginPage
      isSignUp={defaultSignUp}
      onToggleMode={(isSignUp) => {
        navigate(isSignUp ? '/register' : '/login', { replace: true });
      }}
    />
  );
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route path="/login" element={<PublicAuthRoute defaultSignUp={false} />} />
      <Route path="/register" element={<PublicAuthRoute defaultSignUp={true} />} />

      {/* Protected Dashboard Route */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      {/* Default redirect to /dashboard (which redirects to /login if unauthorized) */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;
