import React from 'react';
import { Navigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content animate-fade-in">
        {children}
      </main>
    </div>
  );
};

export default ProtectedRoute;
