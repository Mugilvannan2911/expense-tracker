import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, PieChart, LogOut, Wallet } from 'lucide-react';

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <Wallet size={32} color="var(--primary)" />
        ExpenseOS
      </div>
      
      <nav style={{ flex: 1 }}>
        <NavLink 
          to="/dashboard" 
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          <LayoutDashboard size={20} />
          Dashboard
        </NavLink>
        <NavLink 
          to="/report" 
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          <PieChart size={20} />
          Reports
        </NavLink>
      </nav>

      <div style={{ marginTop: 'auto' }}>
        <button 
          onClick={handleLogout} 
          className="nav-link" 
          style={{ width: '100%', border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--danger)' }}
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
