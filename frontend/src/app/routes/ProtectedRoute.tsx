import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-[#070b14] flex flex-col items-center justify-center text-slate-100">
        <div className="relative flex items-center justify-center">
          {/* Animated pulsing outer ring */}
          <div className="w-16 h-16 rounded-full border-4 border-emerald-500/20 border-t-emerald-400 animate-spin" />
          <div className="absolute w-8 h-8 rounded-full bg-emerald-500/20 blur-md animate-pulse" />
        </div>
        <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-emerald-400/80 animate-pulse">
          Authenticating...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect unauthorized user to /login, preserving target location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
