import React, { createContext, useContext, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import TaskManager from './components/TaskManager';
import Notebook from './components/Notebook';
import GoalTracker from './components/GoalTracker';
import ProgressDashboard from './components/ProgressDashboard';
import Reports from './components/Reports';
import RoutineTracker from './components/RoutineTracker';
import Auth from './components/Auth';
import { authAPI } from './services/api';
import './index.css';

// Global context for data management and authentication
export const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

function App() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [offlineMode, setOfflineMode] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = authAPI.getStoredUser();
    const token = authAPI.getToken();

    if (storedUser && token) {
      setUser(storedUser);
    } else {
      // Check if we should use offline mode
      const useOffline = localStorage.getItem('useOfflineMode');
      if (useOffline === 'true') {
        setOfflineMode(true);
        setUser({ email: 'offline@local', name: 'Offline User', _id: 'offline' });
      }
    }
    setLoading(false);
  }, []);

  const triggerRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleAuthSuccess = (userData) => {
    setUser(userData);
    setOfflineMode(false);
  };

  const handleLogout = () => {
    authAPI.logout();
    setUser(null);
    setOfflineMode(false);
    localStorage.removeItem('useOfflineMode');
  };

  const handleOfflineMode = () => {
    localStorage.setItem('useOfflineMode', 'true');
    setOfflineMode(true);
    setUser({ email: 'offline@local', name: 'Offline User', _id: 'offline' });
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-primary)',
      }}>
        <div className="text-xl gradient-text">Loading...</div>
      </div>
    );
  }

  return (
    <AppContext.Provider value={{ refreshTrigger, triggerRefresh, user, handleLogout, offlineMode }}>
      <Router>
        {!user ? (
          <Auth onAuthSuccess={handleAuthSuccess} onOfflineMode={handleOfflineMode} />
        ) : (
          <div className="app-container">
            <Sidebar />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<ProgressDashboard />} />
                <Route path="/tasks" element={<TaskManager />} />
                <Route path="/routines" element={<RoutineTracker />} />
                <Route path="/notes" element={<Notebook />} />
                <Route path="/goals" element={<GoalTracker />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>
        )}
      </Router>
    </AppContext.Provider>
  );
}

function Sidebar() {
  const { user, handleLogout, offlineMode } = useApp();

  const navItems = [
    { path: '/', icon: '📊', label: 'Dashboard' },
    { path: '/tasks', icon: '✓', label: 'Tasks' },
    { path: '/routines', icon: '🔄', label: 'Routines' },
    { path: '/notes', icon: '📝', label: 'Notes' },
    { path: '/goals', icon: '🎯', label: 'Goals' },
    { path: '/reports', icon: '📈', label: 'Reports' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1 className="sidebar-title">
          <span className="gradient-text">My Assistant</span>
        </h1>
        <p className="sidebar-subtitle">Personal Productivity Hub</p>
        {user && (
          <div style={{
            marginTop: 'var(--spacing-md)',
            padding: 'var(--spacing-sm)',
            background: 'var(--bg-elevated)',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.85rem',
          }}>
            <div className="text-muted">Logged in as:</div>
            <div className="font-medium" style={{ color: 'var(--primary-400)' }}>
              {user.email}
            </div>
          </div>
        )}
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `nav-item ${isActive ? 'nav-item-active' : ''}`
            }
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button
          className="btn btn-ghost"
          style={{ width: '100%', marginBottom: 'var(--spacing-sm)' }}
          onClick={handleLogout}
        >
          🚪 Logout
        </button>
        <p className="text-sm text-muted" style={{ textAlign: 'center' }}>
          {offlineMode ? '💾 Offline Mode (localStorage)' : '☁️ Cloud Sync Active'}
        </p>
      </div>
    </aside>
  );
}

export default App;
